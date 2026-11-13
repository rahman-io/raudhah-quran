#!/usr/bin/env python3
"""
Bangun data tajwid per kata (public/quran-tajwid/{surah}.json) untuk teks Mushaf Standar Indonesia.

Langkah (sekali saja, hasilnya sudah ada di repo):
  1. git clone https://github.com/cpfair/quran-tajweed  (data & pohon keputusan tajwid riwayat Hafs, CC BY 4.0)
  2. Buat teks masukan dari public/quran/surah/*.json: per baris "surah|ayat|teks" memakai field `ar`,
     tanpa tatweel (U+0640) dan tanda waqaf ditempel ke kata sebelumnya (hapus spasi sebelum U+06D6–U+06DC).
  3. Jalankan tajweed_classifier.py dari repo itu atas teks tersebut → annot.json
  4. python3 scripts/build-tajwid-data.py annot.json input.txt
Skrip ini memetakan setiap anotasi ke kata & huruf teks Kemenag, menambah Izhar Halqi, Izhar Syafawi,
dan Al-Qamariyah (tidak diberi warna di data sumber), serta tidak menandai lam lafaz Allah sebagai Al-Syamsiyah.
"""

import json, re, sys, unicodedata, difflib, collections, os

REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

CODES = {
    'ghunnah': 'gh', 'idghaam_ghunnah': 'ig', 'idghaam_no_ghunnah': 'in', 'idghaam_mutajanisayn': 'ij',
    'idghaam_mutaqaribayn': 'iq', 'idghaam_shafawi': 'is', 'ikhfa': 'ik', 'ikhfa_shafawi': 'ks', 'iqlab': 'il',
    'madd_2': 'm2', 'madd_246': 'ma', 'madd_6': 'm6', 'madd_munfasil': 'mf', 'madd_muttasil': 'mt',
    'qalqalah': 'qa', 'hamzat_wasl': 'hw', 'silent': 'sl', 'lam_shamsiyyah': 'ls',
    # turunan (dihitung di sini)
    'lam_qamariyyah': 'lq', 'izhar_halqi': 'ih', 'izhar_shafawi': 'iz',
}
# Aturan yang ditampilkan sebagai hukum tajwid (hamzah wasl & huruf tak dibaca hanya catatan baca).
NUN_RULES = {'ig', 'in', 'ik', 'il', 'ih'}

ARABIC_LETTER = re.compile('[ء-يٱ-ۓۮۯۺ-ۼ]')
HARAKAT = set('ًٌٍَُِّْ')
TANWIN = set('ًٌٍ')
HALQI = set('ءأإؤئهعحغخ')


def letter_units(text):
    """Bagi teks menjadi unit huruf: huruf dasar + tanda-tanda (Mn) sesudahnya. Kembalikan [(mulai, akhir, dasar)]."""
    units = []
    i = 0
    while i < len(text):
        c = text[i]
        if c == ' ' or not (unicodedata.category(c).startswith('L') or c == 'ٰ'):
            if units and c != ' ':
                s, _, b = units[-1]
                units[-1] = (s, i + 1, b)
            i += 1
            continue
        j = i + 1
        while j < len(text) and unicodedata.category(text[j]) == 'Mn' and text[j] != 'ٰ':
            j += 1
        units.append((i, j, c))
        i = j
    return units


NORMAL = {'ٱ': 'ا', 'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ى': 'ي', 'ی': 'ي', 'ۦ': 'ي', 'ۥ': 'و', 'ٰ': 'ا', 'ئ': 'ء', 'ؤ': 'ء', 'ة': 'ه'}


def skeleton(units, text):
    return ''.join(NORMAL.get(b, b) for _, _, b in units)


def msi_words(text):
    """Sama persis dengan splitKemenagWords di TypeScript, plus posisi mulai setiap kata di teks ayat."""
    tokens = [(m.start(), m.group()) for m in re.finditer(r'\S+', text)]
    words = []  # [mulai, teks]
    prefix = None
    for start, tok in tokens:
        if ARABIC_LETTER.search(tok):
            if prefix is not None:
                words.append([prefix[0], prefix[1] + ' ' + tok])
                prefix = None
            else:
                words.append([start, tok])
        elif words:
            words[-1][1] += ' ' + tok
        else:
            prefix = (start, tok) if prefix is None else (prefix[0], prefix[1] + ' ' + tok)
    if prefix is not None:
        words.append([prefix[0], prefix[1]])
    return words


def derived_rules(t):
    """Izhar halqi, izhar syafawi, dan lam qamariyah (tidak diberi warna di data sumber)."""
    out = []
    units = letter_units(t)
    for k, (s, e, b) in enumerate(units):
        marks = set(t[s + 1:e])
        nxt = None
        for (s2, e2, b2) in units[k + 1:]:
            if b2 in 'اىٰ' and marks & TANWIN and s2 == e:  # alif/ya sesudah fathatain
                continue
            nxt = (s2, e2, b2)
            break
        if b == 'ن' and 'ْ' in marks and nxt and nxt[2] in HALQI:
            out.append(('izhar_halqi', s, e, nxt[2]))
        elif marks & TANWIN and nxt and nxt[2] in HALQI:
            out.append(('izhar_halqi', s, e, nxt[2]))
        if b == 'م' and 'ْ' in marks and nxt and nxt[2] not in 'مب':
            out.append(('izhar_shafawi', s, e, nxt[2]))
        # Lam ta'rif bersukun: ٱلْ… atau لِلْ… di awal kata
        if b == 'ل' and 'ْ' in marks and k > 0:
            prev = units[k - 1]
            word_start = t.rfind(' ', 0, s) + 1
            if prev[2] == 'ٱ' or (prev[2] == 'ل' and prev[0] == word_start and 'ِ' in t[prev[0]:prev[1]]):
                out.append(('lam_qamariyyah', s, e, nxt[2] if nxt else ''))
    return out


def trigger_after(t, units, end):
    for (s, e, b) in units:
        if s >= end and b not in 'اى':
            return b
    return ''


def main():
    annots = {(o['surah'], o['ayah']): o['annotations'] for o in json.load(open(sys.argv[1], encoding='utf8'))}
    texts = {}
    for line in open(sys.argv[2], encoding='utf8'):
        s, a, t = line.rstrip('\n').split('|')
        texts[(int(s), int(a))] = t
    os.makedirs(os.path.join(REPO, 'public', 'quran-tajwid'), exist_ok=True)
    stats = collections.Counter()
    unmapped = 0
    total = 0
    for surah in range(1, 115):
        msi = json.load(open(os.path.join(REPO, 'public', 'quran-kemenag', f'{surah}.json'), encoding='utf8'))
        out = {}
        for row in msi['ayahs']:
            ayah, mtext = row[0], row[1]
            t = texts[(surah, ayah)]
            items = []
            for a in annots[(surah, ayah)]:
                rule, s, e = a['rule'], a['start'], a['end']
                if rule == 'lam_shamsiyyah' and re.match(r'^ل[ً-ْ]*ه', t[e:e + 5]):
                    continue  # lam pada lafaz Allah tidak ditandai sebagai al-syamsiyah
                items.append((rule, s, e, ''))
            items += derived_rules(t)

            qu = letter_units(t)
            mu = letter_units(mtext)
            matcher = difflib.SequenceMatcher(None, skeleton(qu, t), skeleton(mu, mtext), autojunk=False)
            qmap = {}
            for tag, i1, i2, j1, j2 in matcher.get_opcodes():
                if tag in ('equal', 'replace') and i2 - i1 == j2 - j1:
                    for d in range(i2 - i1):
                        qmap[i1 + d] = j1 + d
            words = msi_words(mtext)
            word_starts = [w[0] for w in words]

            def msi_word_of(pos):
                idx = 0
                for i, ws in enumerate(word_starts):
                    if ws <= pos:
                        idx = i
                return idx

            rows = []
            seen = set()
            for rule, s, e, trig in items:
                total += 1
                # unit huruf yang tercakup anotasi (huruf di kata tempat anotasi dimulai)
                covered = [k for k, (us, ue, _) in enumerate(qu) if us < e and ue > s]
                if not covered:
                    unmapped += 1
                    continue
                word_end_q = t.find(' ', qu[covered[0]][0])
                if word_end_q == -1:
                    word_end_q = len(t)
                in_word = [k for k in covered if qu[k][0] < word_end_q] or covered[:1]
                mapped = [qmap[k] for k in in_word if k in qmap]
                if not mapped:
                    # Huruf kecil (mis. wau/ya shilah ۥ ۦ) di teks MSI ditulis sebagai harakat pada huruf
                    # sebelumnya: pakai huruf terdekat sebelumnya di kata yang sama.
                    k = in_word[0] - 1
                    word_start_q = t.rfind(' ', 0, qu[in_word[0]][0]) + 1
                    while k >= 0 and qu[k][0] >= word_start_q and k not in qmap:
                        k -= 1
                    if k >= 0 and qu[k][0] >= word_start_q and k in qmap:
                        mapped = [qmap[k]]
                if not mapped:
                    unmapped += 1
                    continue
                m0, m1 = min(mapped), max(mapped)
                ms, me = mu[m0][0], mu[m1][1]
                wi = msi_word_of(ms)
                wstart = word_starts[wi]
                code = CODES[rule]
                if not trig and code in NUN_RULES | {'is', 'ks', 'iz'}:
                    trig = trigger_after(t, qu, qu[in_word[-1]][1])
                key = (wi, code, ms - wstart)
                if key in seen:
                    continue
                seen.add(key)
                rows.append([wi, code, ms - wstart, me - wstart, trig])
                stats[code] += 1
            rows.sort(key=lambda r: (r[0], r[2]))
            out[str(ayah)] = rows
        with open(os.path.join(REPO, 'public', 'quran-tajwid', f'{surah}.json'), 'w', encoding='utf8') as f:
            json.dump({'surah': surah, 'ayahs': out}, f, ensure_ascii=False, separators=(',', ':'))
            f.write('\n')
    print('anotasi', total, 'tak terpetakan', unmapped)
    print(dict(stats))


if __name__ == '__main__':
    main()
