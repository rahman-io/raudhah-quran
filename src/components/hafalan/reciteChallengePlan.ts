import type { QuranWord } from '../../types/quran';
import { isMuqattaah } from '../../services/recitation/recitationAlign';

/**
 * Aturan "Tantangan Bacaan" (game 9): pemotongan ayat dan pembuatan soal sambung ayat.
 * Murni aturan (tanpa model AI), berlaku untuk semua ayat di 114 surah.
 *
 * Babak 1: setiap potongan dibaca 3x (teks memudar: terlihat → samar → tersembunyi).
 * Babak 2: setiap potongan menjadi jawaban satu soal, urutan acak, jenis soal sesuai posisinya:
 *   - lanjut   : potongan sebelumnya tampil, bacakan lanjutannya;
 *   - sebelum  : potongan sesudahnya tampil, bacakan potongan sebelumnya;
 *   - tengah   : potongan sebelum & sesudahnya tampil, isi yang hilang;
 *   - utuh     : soal penutup, bacakan bagian/ayat utuh tanpa teks (hanya arti).
 * Ayat yang hanya satu potongan diuji dengan ayat (atau bagian) sebelum/sesudahnya.
 * Soal yang salah diulang di akhir antrean; potongan yang sering salah didahulukan.
 */

export type QuestionKind = 'lanjut' | 'sebelum' | 'tengah' | 'utuh';

export interface ChallengeQuestion {
  kind: QuestionKind;
  /** Kata yang harus dibaca. */
  target: QuranWord[];
  /** Kunci potongan jawaban (untuk catatan potongan yang sering salah). */
  key: string;
  /** Petunjuk sebelum / sesudah jawaban (sesuai urutan bacaan). */
  before: QuranWord[];
  after: QuranWord[];
  /** Petunjuk diambil dari ayat lain (untuk keterangan di layar). */
  cueFromOtherAyah?: boolean;
}

/** Tanda waqaf tempat berhenti. Mu'anaqah (ۛ) tidak dipakai: berhentinya di salah satu dari dua tempat. */
const STOP = /[ۖۗۘۚ]/;
/** Kata tanpa harakat dengan ejaan alif/ya disamakan (alif tetap ada, beda dengan kerangka suara). */
function bareWord(arabic: string): string {
  return arabic
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640\s]/g, '')
    .replace(/[\u0623\u0625\u0622\u0671]/g, '\u0627')
    .replace(/\u0649/g, '\u064A')
    .replace(/\u0629/g, '\u0647');
}

/** Kata sambung/partikel pendek yang menyatu dengan kata sesudahnya: jangan jadi akhir potongan. */
const LEADING_WORDS = new Set(
  ['لا', 'ما', 'من', 'في', 'على', 'إن', 'أن', 'قد', 'لم', 'لن', 'يا', 'ثم', 'حتى', 'بل', 'عن', 'إلى', 'إذ', 'إذا', 'لو', 'هل', 'كي', 'إلا', 'أو', 'كل', 'أم', 'لما', 'ولا', 'وما', 'ومن', 'فلا', 'فما', 'إنا', 'إنه', 'ألا', 'لقد', 'وإن', 'وإذا', 'فإن', 'ولم', 'بما', 'لما', 'عما', 'مما', 'ممن', 'فمن', 'أفلا', 'كما', 'الذي', 'الذين', 'التي', 'لكن', 'إنما', 'كأن']
    .map((w) => bareWord(w))
);

const CHUNK_TARGET = 3;
const CHUNK_MAX = 4;

const isLeadingWord = (word: QuranWord) => LEADING_WORDS.has(bareWord(word.arabic));
/** Biaya ukuran potongan: 3 kata paling pas, 2 masih baik, 4 boleh, 1 hanya bila terpaksa. */
const SIZE_COST = [0, 6, 0.5, 0, 1.2];
/** Tanda waqaf apa pun (termasuk mu'anaqah ۛ) di akhir potongan: tempat jeda yang wajar. */
const ANY_PAUSE = /[\u06D6-\u06DB]/;
/** ۙ = jangan berhenti di sini. */
const NO_STOP = '\u06D9';

/**
 * Bagi satu frasa (tanpa tanda berhenti di tengahnya) menjadi potongan 2–4 kata dengan biaya
 * terkecil: ukuran seimbang, tidak berakhir pada partikel (لا، من، في …) atau tanda ۙ,
 * dan sebisa mungkin berakhir di tanda jeda.
 */
function splitPhrase(words: QuranWord[]): QuranWord[][] {
  const n = words.length;
  if (n <= CHUNK_TARGET) return [words];
  const endCost = (i: number) => {
    if (i === n) return 0;
    const word = words[i - 1];
    let cost = 0;
    if (isLeadingWord(word)) cost += 5;
    if (word.arabic.includes(NO_STOP)) cost += 3;
    else if (ANY_PAUSE.test(word.arabic)) cost -= 0.3;
    return cost;
  };
  const best = new Array<number>(n + 1).fill(Infinity);
  const from = new Array<number>(n + 1).fill(0);
  best[0] = 0;
  for (let i = 1; i <= n; i += 1) {
    for (let size = 1; size <= CHUNK_MAX && size <= i; size += 1) {
      const cost = best[i - size] + SIZE_COST[size] + endCost(i);
      if (cost < best[i]) {
        best[i] = cost;
        from[i] = i - size;
      }
    }
  }
  const chunks: QuranWord[][] = [];
  for (let i = n; i > 0; i = from[i]) chunks.unshift(words.slice(from[i], i));
  return chunks;
}

/**
 * Potongan hafalan untuk satu bagian ayat. `atSurahStart`: huruf muqatta'ah di kata pertama
 * dijadikan potongan sendiri.
 */
export function chunkWords(words: QuranWord[], atSurahStart: boolean): QuranWord[][] {
  if (!words.length) return [];
  if (atSurahStart && words.length > 1 && isMuqattaah(words[0].arabic)) {
    return [[words[0]], ...chunkWords(words.slice(1), false)];
  }
  if (words.length <= CHUNK_TARGET) return [words];

  // 1. Frasa per tanda waqaf.
  const phrases: QuranWord[][] = [];
  let current: QuranWord[] = [];
  words.forEach((word, i) => {
    current.push(word);
    if (STOP.test(word.arabic) && i < words.length - 1) {
      phrases.push(current);
      current = [];
    }
  });
  if (current.length) phrases.push(current);

  // 2. Frasa satu kata digabung ke tetangganya (yang lebih pendek).
  for (let i = 0; i < phrases.length && phrases.length > 1; i += 1) {
    if (phrases[i].length > 1) continue;
    const prev = phrases[i - 1];
    const next = phrases[i + 1];
    if (prev && (!next || prev.length <= next.length)) prev.push(...phrases[i]);
    else next.unshift(...phrases[i]);
    phrases.splice(i, 1);
    i -= 1;
  }

  // 3. Frasa panjang dibagi rata.
  return phrases.flatMap(splitPhrase);
}

const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};
const pick = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

export const chunkKey = (chunk: QuranWord[]) => chunk[0]?.id ?? '';

/**
 * Soal Babak 2 untuk satu bagian. `prevWords` / `nextWords`: kata ayat (atau bagian) sebelum
 * dan sesudahnya, dipakai bila bagian ini hanya satu potongan. `weak`: berapa kali tiap
 * potongan pernah salah (didahulukan).
 */
export function buildQuestions(
  chunks: QuranWord[][],
  prevWords: QuranWord[] | null,
  nextWords: QuranWord[] | null,
  weak: Record<string, number> = {}
): ChallengeQuestion[] {
  const all = chunks.flat();
  const questions: ChallengeQuestion[] = [];
  const last = chunks.length - 1;

  if (chunks.length === 1) {
    const kinds: { kind: QuestionKind; before: QuranWord[]; after: QuranWord[] }[] = [];
    if (prevWords?.length) kinds.push({ kind: 'lanjut', before: prevWords.slice(-3), after: [] });
    if (nextWords?.length) kinds.push({ kind: 'sebelum', before: [], after: nextWords.slice(0, 3) });
    if (kinds.length) questions.push({ ...pick(kinds), target: all, key: chunkKey(all), cueFromOtherAyah: true });
  } else {
    chunks.forEach((chunk, t) => {
      const kinds: QuestionKind[] = [];
      if (t > 0) kinds.push('lanjut');
      if (t < last) kinds.push('sebelum');
      if (t > 0 && t < last) kinds.push('tengah');
      const kind = pick(kinds);
      questions.push({
        kind,
        target: chunk,
        key: chunkKey(chunk),
        before: kind === 'lanjut' || kind === 'tengah' ? chunks[t - 1] : [],
        after: kind === 'sebelum' || kind === 'tengah' ? chunks[t + 1] : []
      });
    });
  }

  // Acak, lalu potongan yang paling sering salah didahulukan.
  const ordered = shuffle(questions).sort((a, b) => (weak[b.key] ?? 0) - (weak[a.key] ?? 0));
  ordered.push({ kind: 'utuh', target: all, key: `${chunkKey(all)}#utuh`, before: [], after: [] });
  return ordered;
}

/* ------------------------------------------------------------------ */
/* Catatan potongan yang sering salah                                   */
/* ------------------------------------------------------------------ */

const WEAK_KEY = 'raudhah_recite_weak_v1';

export function readWeakChunks(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(WEAK_KEY) || '{}') as Record<string, number>;
  } catch {
    return {};
  }
}

/** Catat hasil satu potongan: salah menambah hitungan, benar menguranginya. */
export function recordChunkResult(key: string, correct: boolean) {
  try {
    const weak = readWeakChunks();
    const next = Math.max(0, (weak[key] ?? 0) + (correct ? -1 : 1));
    if (next) weak[key] = next;
    else delete weak[key];
    localStorage.setItem(WEAK_KEY, JSON.stringify(weak));
  } catch {
    // penyimpanan tidak tersedia: urutan soal tetap acak
  }
}
