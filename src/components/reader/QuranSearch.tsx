import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, ChevronRight, Hash, Loader2, Search, X } from 'lucide-react';
import { assetUrl } from '../../utils/assetUrl';

/**
 * Pencarian di menu Baca: surah (nama/arti/nomor), ayat ("2:255", "Al-Baqarah 255"),
 * dan arti ayat (kata dalam terjemahan). Indeks terjemahan dimuat saat pertama dipakai.
 */

interface SurahMeta {
  number: number;
  nameLatin: string;
  nameArabic: string;
  translationLatin: string;
  numberOfAyahs: number;
}

type IndexRow = [number, number, string];
interface SearchRow {
  surah: number;
  ayah: number;
  text: string;
  plain: string;
}

const PAGE = 20;
/** Kata pendek (≤ 4 huruf) harus cocok di awal kata: "anak" tidak cocok dengan "laksanakan". */
const SHORT_TERM = 4;
const termMatches = (padded: string, term: string) =>
  term.length <= SHORT_TERM ? padded.includes(` ${term}`) : padded.includes(term);

/** Huruf kecil tanpa tanda diakritik (ā → a), selain huruf/angka jadi spasi. */
const plain = (text: string) =>
  text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\u0600-\u06ff]+/g, ' ').trim();
const compact = (text: string) => plain(text).replace(/\s+/g, '');
// Kerangka konsonan agar ejaan berbeda tetap cocok, mis. "baqoroh" → Al-Baqarah.
const skeleton = (text: string) => compact(text).replace(/[aiueo'h]/g, '').replace(/(.)\1+/g, '$1');

let indexPromise: Promise<SearchRow[]> | null = null;
function loadIndex(): Promise<SearchRow[]> {
  indexPromise ??= fetch(assetUrl('/quran-search/id.json'))
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json() as Promise<{ rows: IndexRow[] }>;
    })
    .then((data) => data.rows.map(([surah, ayah, text]) => ({ surah, ayah, text, plain: ` ${plain(text)} ` })))
    .catch((error) => {
      indexPromise = null;
      throw error;
    });
  return indexPromise;
}

function matchSurahs(surahs: SurahMeta[], query: string): SurahMeta[] {
  const q = compact(query);
  if (!q) return [];
  const sk = q.length >= 3 ? skeleton(query) : '';
  return surahs.filter((s) =>
    String(s.number) === q ||
    compact(s.nameLatin).includes(q) ||
    compact(s.translationLatin).includes(q) ||
    s.nameArabic.includes(query.trim()) ||
    (sk.length >= 2 && skeleton(s.nameLatin).includes(sk))
  );
}

/** "2:255", "2 255", "Al-Baqarah 255", "baqarah:255" → surah & ayat. */
function parseReference(surahs: SurahMeta[], query: string): { surah: SurahMeta; ayah: number } | null {
  const text = query.trim();
  const numeric = text.match(/^(\d{1,3})\s*[:.\s]\s*(\d{1,3})$/);
  const named = text.match(/^(.*?[a-zA-Z\u0600-\u06ff].*?)\s*[:.\s]\s*(\d{1,3})$/);
  let surah: SurahMeta | undefined;
  let ayah = 0;
  if (numeric) {
    surah = surahs.find((s) => s.number === Number(numeric[1]));
    ayah = Number(numeric[2]);
  } else if (named) {
    const found = matchSurahs(surahs, named[1]);
    // Utamakan nama yang paling mirip (awalannya sama).
    const q = compact(named[1]);
    surah = found.find((s) => compact(s.nameLatin).replace(/^(al|an|ar|as|at|ad|az|ash|ath)/, '').startsWith(q.replace(/^(al|an|ar|as|at|ad|az|ash|ath)/, ''))) ?? found[0];
    ayah = Number(named[2]);
  }
  if (!surah || ayah < 1 || ayah > surah.numberOfAyahs) return null;
  return { surah, ayah };
}

/** Huruf kecil tanpa diakritik, panjangnya sama dengan teks asli (untuk mencari posisi). */
const foldSameLength = (text: string) =>
  [...text].map((ch) => ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()[0] ?? ch).join('');

/** Posisi kata yang dicari di dalam teks (kata pendek hanya di awal kata). */
function findMarks(text: string, terms: string[]): [number, number][] {
  const lower = foldSameLength(text);
  const marks: [number, number][] = [];
  terms.forEach((term) => {
    let i = term ? lower.indexOf(term) : -1;
    while (i >= 0) {
      const atWordStart = i === 0 || !/[a-z0-9]/.test(lower[i - 1]);
      if (term.length > SHORT_TERM || atWordStart) marks.push([i, i + term.length]);
      i = lower.indexOf(term, i + term.length);
    }
  });
  return marks.sort((a, b) => a[0] - b[0]);
}

function renderMarks(text: string, marks: [number, number][], offset = 0): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  marks.forEach(([a0, b0], k) => {
    const a = a0 - offset;
    const b = b0 - offset;
    if (a < cursor || a < 0 || b > text.length) return;
    parts.push(text.slice(cursor, a));
    parts.push(<mark key={k} className="bg-[#D3A253]/40 text-inherit rounded-sm">{text.slice(a, b)}</mark>);
    cursor = b;
  });
  parts.push(text.slice(cursor));
  return parts;
}

/** Teks utuh dengan kata yang dicari disorot (dipakai di kartu ayat setelah dibuka dari pencarian). */
export const HighlightedText: React.FC<{ text: string; terms: string[] }> = ({ text, terms }) => (
  <>{renderMarks(text, findMarks(text, terms))}</>
);

/** Kata kunci pencarian (sudah dinormalkan) yang dipakai untuk menyorot. */
export const searchTerms = (query: string) => plain(query).split(' ').filter((t) => t.length >= 2);

/** Potongan terjemah di sekitar kata yang cocok, dengan kata yang dicari disorot. */
function Snippet({ text, terms }: { text: string; terms: string[] }) {
  const marks = findMarks(text, terms);
  const first = marks.length ? marks[0][0] : 0;
  const lower = foldSameLength(text);
  const start = first > 90 ? lower.lastIndexOf(' ', first - 60) + 1 : 0;
  const end = Math.min(text.length, start + 220);
  const inside = marks.filter(([a, b]) => a >= start && b <= end);
  return <>{start > 0 && '… '}{renderMarks(text.slice(start, end), inside, start)}{end < text.length && ' …'}</>;
}

export const QuranSearch: React.FC<{
  surahs: SurahMeta[];
  /** Kata kunci disimpan di luar agar tetap ada saat kembali dari surah. */
  query: string;
  onQueryChange: (query: string) => void;
  /** `terms`: kata yang dicari, untuk disorot di terjemahan ayat yang dibuka. */
  onOpen: (surah: number, ayah?: number, terms?: string[]) => void;
  children: React.ReactNode;
}> = ({ surahs, query, onQueryChange: setQuery, onOpen, children }) => {
  const [debounced, setDebounced] = useState(query);
  const [rows, setRows] = useState<SearchRow[] | null>(null);
  const [loadingIndex, setLoadingIndex] = useState(false);
  const [indexError, setIndexError] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 220);
    return () => clearTimeout(timer);
  }, [query]);
  const firstDebounce = useRef(true);
  useEffect(() => {
    // Kembali dari surah: jangan ulang dari awal jumlah hasil yang ditampilkan.
    if (firstDebounce.current) {
      firstDebounce.current = false;
      return;
    }
    setLimit(PAGE);
  }, [debounced]);

  const prepareIndex = () => {
    if (rows || loadingIndex) return;
    setLoadingIndex(true);
    setIndexError(false);
    loadIndex()
      .then(setRows)
      .catch(() => setIndexError(true))
      .finally(() => setLoadingIndex(false));
  };

  const active = query.trim().length > 0;
  const surahResults = useMemo(() => matchSurahs(surahs, debounced).slice(0, 8), [surahs, debounced]);
  const reference = useMemo(() => parseReference(surahs, debounced), [surahs, debounced]);
  const terms = useMemo(() => searchTerms(debounced), [debounced]);
  // Kembali dari surah dengan kata kunci yang masih ada: muat lagi indeksnya.
  useEffect(() => {
    if (query.trim()) prepareIndex();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const ayahResults = useMemo(() => {
    if (!rows || plain(debounced).length < 3 || terms.length === 0) return [];
    const phrase = ` ${plain(debounced)}`;
    const found = rows.filter((row) => terms.every((t) => termMatches(row.plain, t)));
    // Frasa utuh lebih dulu, lalu urutan mushaf.
    return found.sort((a, b) => Number(b.plain.includes(phrase)) - Number(a.plain.includes(phrase)));
  }, [rows, debounced, terms]);

  const clear = () => {
    setQuery('');
    setDebounced('');
    inputRef.current?.focus();
  };

  const nothing = debounced && !reference && surahResults.length === 0 && ayahResults.length === 0 && rows && !loadingIndex;

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2.5 px-4 h-12 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs focus-within:border-[#246579] focus-within:ring-2 focus-within:ring-[#246579]/15 transition">
        <Search className="w-4 h-4 text-[#477F8D] shrink-0" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onFocus={prepareIndex}
          onChange={(event) => {
            setQuery(event.target.value);
            prepareIndex();
          }}
          placeholder="Cari surah, ayat (2:255), atau arti…"
          className="w-full bg-transparent text-sm text-[#293640] dark:text-white placeholder:text-slate-400 outline-none [&::-webkit-search-cancel-button]:hidden"
          aria-label="Cari surah, ayat, atau arti ayat"
        />
        {loadingIndex && <Loader2 className="w-4 h-4 text-[#477F8D] animate-spin shrink-0" />}
        {active && (
          <button type="button" onClick={clear} className="p-1 rounded-full text-slate-400 hover:text-[#246579] hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Hapus pencarian">
            <X className="w-4 h-4" />
          </button>
        )}
      </label>

      {!active ? (
        children
      ) : (
        <div className="space-y-4" aria-live="polite">
          {reference && (
            <button
              type="button"
              data-search-key="reference"
              onClick={() => onOpen(reference.surah.number, reference.ayah)}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-[#246579] to-[#174C60] text-white text-left shadow-xs hover:brightness-110 transition"
            >
              <span className="w-10 h-10 shrink-0 rounded-xl bg-white/15 flex items-center justify-center"><Hash className="w-5 h-5" /></span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-bold truncate">QS. {reference.surah.nameLatin} : {reference.ayah}</span>
                <span className="block text-[11px] text-white/75">Buka langsung ayat ini</span>
              </span>
              <ChevronRight className="w-5 h-5 shrink-0" />
            </button>
          )}

          {surahResults.length > 0 && (
            <section className="space-y-2">
              <h3 className="px-1 text-[11px] font-bold uppercase tracking-wider text-[#477F8D]">Surah</h3>
              <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700/60 overflow-hidden">
                {surahResults.map((s) => (
                  <button
                    key={s.number}
                    type="button"
                    data-search-key={`surah-${s.number}`}
                    onClick={() => onOpen(s.number)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F8F6F1] dark:hover:bg-slate-700/40"
                  >
                    <span className="w-8 h-8 shrink-0 rounded-full bg-[#246579]/10 dark:bg-[#246579]/30 text-[#246579] dark:text-[#A7CDD3] flex items-center justify-center text-[11px] font-bold">{s.number}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold text-[#173B4E] dark:text-white truncate">{s.nameLatin}</span>
                      <span className="block text-[11px] text-[#477F8D] dark:text-[#94A3B8] truncate">{s.translationLatin} · {s.numberOfAyahs} ayat</span>
                    </span>
                    <span className="font-arabic text-lg text-[#BE9452] shrink-0">{s.nameArabic}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {ayahResults.length > 0 && (
            <section className="space-y-2">
              <h3 className="px-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#477F8D]">
                <span>Arti ayat</span>
                <span className="normal-case tracking-normal font-semibold">{ayahResults.length} ayat</span>
              </h3>
              <div className="space-y-2">
                {ayahResults.slice(0, limit).map((row) => {
                  const meta = surahs.find((s) => s.number === row.surah);
                  return (
                    <button
                      key={`${row.surah}:${row.ayah}`}
                      type="button"
                      data-search-key={`ayah-${row.surah}-${row.ayah}`}
                      onClick={() => onOpen(row.surah, row.ayah, terms)}
                      className="w-full text-left p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-[#477F8D]/50 transition-colors"
                    >
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#246579] dark:text-[#A7CDD3]">
                        <BookOpen className="w-3.5 h-3.5 text-[#D3A253]" />
                        QS. {meta?.nameLatin ?? row.surah} : {row.ayah}
                      </span>
                      <span className="mt-1 block text-[13px] leading-relaxed text-[#293640] dark:text-[#CBD5E1]">
                        <Snippet text={row.text} terms={terms} />
                      </span>
                    </button>
                  );
                })}
              </div>
              {ayahResults.length > limit && (
                <button
                  type="button"
                  onClick={() => setLimit((n) => n + PAGE)}
                  className="w-full py-2.5 rounded-2xl text-xs font-semibold text-[#246579] dark:text-[#A7CDD3] bg-[#246579]/5 hover:bg-[#246579]/10"
                >
                  Tampilkan {Math.min(PAGE, ayahResults.length - limit)} lagi
                </button>
              )}
            </section>
          )}

          {indexError && (
            <p className="text-center text-xs text-amber-700 dark:text-amber-300">
              Pencarian arti belum bisa dimuat. Periksa koneksi lalu coba lagi.
            </p>
          )}
          {debounced && plain(debounced).length < 3 && surahResults.length === 0 && !reference && (
            <p className="text-center text-xs text-slate-500 py-4">Ketik minimal 3 huruf untuk mencari arti ayat.</p>
          )}
          {nothing && plain(debounced).length >= 3 && (
            <p className="text-center text-xs text-slate-500 py-6">Tidak ada surah, ayat, atau arti yang cocok dengan "{debounced}".</p>
          )}
        </div>
      )}
    </div>
  );
};
