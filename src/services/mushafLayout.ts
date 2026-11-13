import { assetUrl } from '../utils/assetUrl';

/**
 * Susunan halaman "Mode Mushaf": 604 halaman, 15 baris, dari public/quran-mushaf/layout.json
 * (scripts/import-mushaf-layout.mjs). Setiap baris berisi rangkaian token (kata atau tanda akhir
 * ayat) yang berurutan dari Al-Fatihah sampai An-Nas; baris kosong adalah judul surah / basmalah.
 */

export const TOTAL_PAGES = 604;

/** Halaman awal setiap juz (mushaf 604 halaman). */
const JUZ_START_PAGES = [
  1, 22, 42, 62, 82, 102, 121, 142, 162, 182, 201, 222, 242, 262, 282, 302, 322, 342, 362, 382, 402, 422, 442, 462, 482,
  502, 522, 542, 562, 582
];

export const juzOfPage = (page: number) => {
  let juz = 1;
  JUZ_START_PAGES.forEach((start, i) => {
    if (page >= start) juz = i + 1;
  });
  return juz;
};

export const firstPageOfJuz = (juz: number) => JUZ_START_PAGES[Math.min(30, Math.max(1, juz)) - 1];

/** Satu token: kata ke-`word` (mulai 1) dari ayat, atau tanda akhir ayat bila `end`. */
export interface MushafToken {
  surah: number;
  ayah: number;
  /** Urutan kata dalam ayat menurut data letak baris (mulai 1); 0 untuk tanda akhir ayat. */
  word: number;
  end: boolean;
}

export type MushafLine =
  | { kind: 'header'; surah: number }
  | { kind: 'basmalah'; surah: number }
  | { kind: 'text'; tokens: MushafToken[] };

export interface MushafLayout {
  pages: MushafLine[][];
  /** Jumlah kata per ayat menurut data letak baris, [surah - 1][ayat - 1]. */
  words: number[][];
  /** Halaman tempat ayat dimulai, kunci "surah:ayat". */
  ayahPage: Map<string, number>;
  /** Halaman tempat surah dimulai (termasuk baris judulnya). */
  surahPage: number[];
}

interface LayoutFile {
  pages: string[];
  words: number[][];
}

function build(file: LayoutFile): MushafLayout {
  const { words } = file;
  // Aliran token seluruh mushaf, dibaca berurutan sambil mengisi baris.
  let surah = 1;
  let ayah = 1;
  let word = 1;
  const next = (): MushafToken => {
    const count = words[surah - 1][ayah - 1];
    if (word <= count) return { surah, ayah, word: word++, end: false };
    const token = { surah, ayah, word: 0, end: true };
    word = 1;
    ayah += 1;
    if (ayah > words[surah - 1].length) {
      surah += 1;
      ayah = 1;
    }
    return token;
  };

  const ayahPage = new Map<string, number>();
  const surahPage: number[] = [];
  // Baris kosong dikumpulkan dulu; jenisnya (judul/basmalah) baru diketahui saat surah berikutnya dimulai.
  let pendingGaps: { page: number; index: number }[] = [];
  const pages: MushafLine[][] = file.pages.map(() => []);

  file.pages.forEach((row, p) => {
    row.split(',').forEach((cell) => {
      const line: MushafLine[] = pages[p];
      if (cell === '') {
        pendingGaps.push({ page: p, index: line.length });
        line.push({ kind: 'header', surah: 0 }); // diisi di bawah
        return;
      }
      const count = Number(cell);
      const tokens: MushafToken[] = [];
      for (let i = 0; i < count; i += 1) {
        const token = next();
        if (!token.end && token.word === 1) {
          ayahPage.set(`${token.surah}:${token.ayah}`, p + 1);
          if (token.ayah === 1) {
            // Baris kosong sebelumnya: judul surah (+ basmalah, kecuali Al-Fatihah & At-Taubah).
            pendingGaps.forEach((gap, g) => {
              const kind = g === 0 ? 'header' : 'basmalah';
              pages[gap.page][gap.index] = { kind, surah: token.surah };
            });
            surahPage[token.surah] = (pendingGaps[0]?.page ?? p) + 1;
            pendingGaps = [];
          }
        }
        tokens.push(token);
      }
      line.push({ kind: 'text', tokens });
    });
  });
  return { pages, words, ayahPage, surahPage };
}

let layoutPromise: Promise<MushafLayout> | null = null;

export function loadMushafLayout(): Promise<MushafLayout> {
  layoutPromise ??= fetch(assetUrl('/quran-mushaf/layout.json'))
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json() as Promise<LayoutFile>;
    })
    .then((file) => {
      if (file.pages?.length !== TOTAL_PAGES) throw new Error('Data halaman mushaf tidak lengkap');
      return build(file);
    })
    .catch((error) => {
      layoutPromise = null;
      throw error;
    });
  return layoutPromise;
}

/** Surah-surah yang ayatnya tampil di halaman ini (urut). */
export function surahsOnPage(layout: MushafLayout, page: number): number[] {
  const set = new Set<number>();
  layout.pages[page - 1]?.forEach((line) => {
    if (line.kind === 'text') line.tokens.forEach((t) => set.add(t.surah));
    else set.add(line.surah);
  });
  return [...set].sort((a, b) => a - b);
}

/** Ayat pertama yang dimulai di halaman ini. */
export function firstAyahOnPage(layout: MushafLayout, page: number): { surah: number; ayah: number } | null {
  for (const line of layout.pages[page - 1] ?? []) {
    if (line.kind !== 'text') continue;
    const token = line.tokens.find((t) => !t.end && t.word === 1);
    if (token) return { surah: token.surah, ayah: token.ayah };
  }
  return null;
}
