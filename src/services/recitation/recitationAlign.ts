import { arabicSkeleton } from '../arabicSkeleton';

/**
 * Mencocokkan teks bacaan (hasil pengenal suara) dengan kata-kata ayat yang sedang dibaca.
 *
 * Teks bacaan dan ayat diubah ke kerangka huruf (lihat arabicSkeleton.ts), lalu disejajarkan
 * huruf demi huruf (jarak edit). Teks di depan bacaan boleh diabaikan (ta'awudz, basmalah,
 * atau mengulang dari awal), dan ayat boleh belum selesai dibaca.
 *
 * Satu kata dianggap terbaca bila hampir semua hurufnya cocok: kata ≤ 4 huruf harus cocok
 * semua; kata yang lebih panjang boleh meleset 1 huruf per 5 huruf. Dengan begitu
 * "alam tiriki" untuk "alam tara kaifa" tidak lolos (huruf ف tidak ada), tetapi salah harakat
 * saja tidak terdeteksi karena pengenal suara menulis tanpa harakat.
 */

export type WordStatus = 'pending' | 'ok' | 'missed';

export interface RecitationProgress {
  status: WordStatus[];
  /** Kata berikutnya yang harus dibaca (sama dengan jumlah kata bila sudah selesai). */
  next: number;
}

/** Huruf muqatta'ah dibaca dengan nama hurufnya (الٓمٓ → alif lam mim). */
const LETTER_NAMES: Record<string, string> = {
  'ا': 'الف', 'ل': 'لام', 'م': 'ميم', 'ر': 'را', 'ص': 'صاد', 'ك': 'كاف', 'ه': 'ها', 'ي': 'يا',
  'ع': 'عين', 'ط': 'طا', 'س': 'سين', 'ح': 'حا', 'ق': 'قاف', 'ن': 'نون'
};

/** Kata tanpa harakat pendek di awal surah = huruf muqatta'ah. */
export const isMuqattaah = (arabic: string) => !/[\u064B-\u0650]/.test(arabic) && /^[\u0621-\u064A\u0651\u0653\u0670\s]+$/.test(arabic.replace(/[\u06D6-\u06ED]/g, ''));

/**
 * Kerangka huruf tiap kata yang diharapkan, dalam satu atau dua versi. Kata pertama ayat
 * pembuka surah yang berupa huruf muqatta'ah boleh dibaca dengan nama hurufnya (الف لام ميم)
 * atau tertulis seperti teksnya (الم), karena pengenal suara bisa menuliskan keduanya.
 */
export function expectedSkeletons(words: string[], atSurahStart: boolean): string[][] {
  const plain = words.map((word) => arabicSkeleton(word));
  const first = words[0] ?? '';
  if (!atSurahStart || !isMuqattaah(first)) return [plain];
  const letters = [...first].filter((ch) => LETTER_NAMES[ch]);
  if (!letters.length) return [plain];
  return [plain, [arabicSkeleton(letters.map((ch) => LETTER_NAMES[ch]).join('')), ...plain.slice(1)]];
}

const SIMILAR = new Set<string>();
['سص', 'سث', 'تط', 'دض', 'ذز', 'ذظ', 'زظ', 'ضظ', 'حه', 'قك', 'غخ'].forEach(([a, b]) => {
  SIMILAR.add(a + b);
  SIMILAR.add(b + a);
});

const needed = (length: number) => (length <= 4 ? length : length - Math.floor(length / 5));

const OP_MATCH = 1;
const OP_SUB = 2;
const OP_INSERT = 3; // huruf tambahan di bacaan
const OP_SKIP = 4; // huruf ayat terlewat

/**
 * Penyejajaran dengan skor: cocok +1 (bunyi mirip +0,5), salah/tambah/lewat −1.
 * Ayat dimulai dari kata pertama; awal dan akhir teks bacaan boleh diabaikan
 * (ta'awudz, basmalah, mengulang dari awal, atau sudah lanjut ke ayat berikutnya).
 */
function alignOnce(expected: string[], text: string): { progress: RecitationProgress; score: number } {
  const status: WordStatus[] = expected.map(() => 'pending');
  let target = '';
  const wordOf: number[] = [];
  expected.forEach((skeleton, w) => {
    target += skeleton;
    for (let k = 0; k < skeleton.length; k += 1) wordOf.push(w);
  });
  const m = text.length;
  const n = target.length;
  const empty = { progress: { status, next: 0 }, score: 0 };
  if (!m || !n) return empty;

  const width = n + 1;
  const ops = new Uint8Array((m + 1) * width);
  let prev = new Float32Array(width);
  let cur = new Float32Array(width);
  for (let j = 1; j <= n; j += 1) {
    prev[j] = -j;
    ops[j] = OP_SKIP;
  }
  let bestScore = 0;
  let bestI = 0;
  let bestJ = 0;
  for (let i = 1; i <= m; i += 1) {
    cur[0] = 0;
    const row = i * width;
    const t = text[i - 1];
    for (let j = 1; j <= n; j += 1) {
      const e = target[j - 1];
      const gain = t === e ? 1 : SIMILAR.has(t + e) ? 0.5 : -1;
      let best = prev[j - 1] + gain;
      let op = gain > 0 ? OP_MATCH : OP_SUB;
      if (prev[j] - 1 > best) {
        best = prev[j] - 1;
        op = OP_INSERT;
      }
      if (cur[j - 1] - 1 > best) {
        best = cur[j - 1] - 1;
        op = OP_SKIP;
      }
      cur[j] = best;
      ops[row + j] = op;
      // Skor tertinggi; bila sama, yang paling jauh di ayat.
      if (best > bestScore || (best === bestScore && best > 0 && j > bestJ)) {
        bestScore = best;
        bestI = i;
        bestJ = j;
      }
    }
    [prev, cur] = [cur, prev];
  }
  if (bestJ === 0) return empty;

  const matched = new Array(expected.length).fill(0);
  let i = bestI;
  let j = bestJ;
  while (j > 0 && i > 0) {
    const op = ops[i * width + j];
    if (op === OP_MATCH) {
      matched[wordOf[j - 1]] += 1;
      i -= 1;
      j -= 1;
    } else if (op === OP_SUB) {
      i -= 1;
      j -= 1;
    } else if (op === OP_INSERT) {
      i -= 1;
    } else {
      j -= 1;
    }
  }

  const last = wordOf[bestJ - 1];
  const ok = (w: number) => matched[w] >= needed(expected[w].length);
  for (let w = 0; w < last; w += 1) status[w] = ok(w) ? 'ok' : 'missed';
  // Kata terakhir yang tersentuh: terbaca bila cukup cocok, selain itu masih dibaca.
  let next = last;
  if (ok(last)) {
    status[last] = 'ok';
    next = last + 1;
  }
  // Kata tanpa huruf yang dinilai (jarang) ikut terlewati bersama kata sebelumnya.
  while (next < expected.length && expected[next].length === 0) {
    status[next] = 'ok';
    next += 1;
  }
  return { progress: { status, next }, score: bestScore };
}

export function alignRecitation(variants: string[][], transcript: string): RecitationProgress {
  const text = arabicSkeleton(transcript);
  let best: { progress: RecitationProgress; score: number } | null = null;
  for (const expected of variants) {
    const result = alignOnce(expected, text);
    if (!best || result.score > best.score) best = result;
  }
  return best?.progress ?? { status: [], next: 0 };
}

/**
 * Sama seperti `alignRecitation`, tetapi hanya memakai ekor teks bacaan (`maxLetters` huruf
 * terakhir). Dipakai untuk bacaan panjang (beberapa ayat): kata yang sudah dinilai tidak lagi
 * ikut dicocokkan, dan teks lama di depan diabaikan.
 */
export function alignRecitationTail(variants: string[][], transcript: string, maxLetters: number): RecitationProgress {
  const text = arabicSkeleton(transcript).slice(-maxLetters);
  let best: { progress: RecitationProgress; score: number } | null = null;
  for (const expected of variants) {
    const result = alignOnce(expected, text);
    if (!best || result.score > best.score) best = result;
  }
  return best?.progress ?? { status: [], next: 0 };
}
