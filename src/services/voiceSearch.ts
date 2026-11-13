import { assetUrl } from '../utils/assetUrl';
import { arabicSkeleton } from './arabicSkeleton';

/**
 * Pencarian ayat dari potongan bacaan (hasil pengenal suara).
 *
 * 1. Teks suara diubah ke kerangka huruf (lihat arabicSkeleton.ts).
 * 2. Calon ayat dipilih cepat lewat potongan 3 huruf (trigram) yang sama.
 * 3. Setiap calon dinilai dengan jarak edit "potongan di dalam teks" (Sellers):
 *    salah dengar 1–2 huruf masih cocok. Huruf yang bunyinya mirip (س/ص, ت/ط, …)
 *    dihitung setengah kesalahan. Potongan yang menyambung ke ayat berikutnya juga dikenali.
 */

export interface VoiceMatch {
  surah: number;
  ayah: number;
  /** Ayat terakhir yang ikut terbaca (sama dengan `ayah` bila hanya satu ayat). */
  toAyah: number;
  /** 0–1: seberapa mirip bacaan dengan ayat. */
  score: number;
  /** Posisi bagian yang cocok pada kerangka ayat `ayah` (akhir eksklusif, dibatasi panjang ayat). */
  start: number;
  end: number;
}

interface VoiceIndex {
  surah: Uint16Array;
  ayah: Uint16Array;
  text: string[];
  grams: Map<string, number[]>;
}

/** Bacaan terpendek yang dicari (± 3 kata). */
export const MIN_QUERY_LETTERS = 7;
const MAX_QUERY_LETTERS = 180;
const MAX_CANDIDATES = 80;
const MIN_SCORE = 0.6;

let indexPromise: Promise<VoiceIndex> | null = null;

export function loadVoiceIndex(): Promise<VoiceIndex> {
  indexPromise ??= fetch(assetUrl('/quran-search/ar.json'))
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json() as Promise<{ rows: [number, number, string][] }>;
    })
    .then(({ rows }) => {
      const index: VoiceIndex = {
        surah: new Uint16Array(rows.length),
        ayah: new Uint16Array(rows.length),
        text: new Array(rows.length),
        grams: new Map()
      };
      rows.forEach(([surah, ayah, text], i) => {
        index.surah[i] = surah;
        index.ayah[i] = ayah;
        index.text[i] = text;
        const seen = new Set<string>();
        for (let k = 0; k + 3 <= text.length; k += 1) {
          const gram = text.slice(k, k + 3);
          if (seen.has(gram)) continue;
          seen.add(gram);
          const list = index.grams.get(gram);
          if (list) list.push(i);
          else index.grams.set(gram, [i]);
        }
      });
      return index;
    })
    .catch((error) => {
      indexPromise = null;
      throw error;
    });
  return indexPromise;
}

/** Pasangan huruf yang sering tertukar oleh pengenal suara. */
const SIMILAR = new Set<string>();
['سص', 'سث', 'تط', 'دض', 'ذز', 'ذظ', 'زظ', 'ضظ', 'حه', 'قك', 'غخ'].forEach(([a, b]) => {
  SIMILAR.add(a + b);
  SIMILAR.add(b + a);
});
const substitutionCost = (a: string, b: string) => (a === b ? 0 : SIMILAR.has(a + b) ? 0.5 : 1);

/** Jarak edit terkecil antara `query` dan potongan mana pun dari `text`, beserta letak potongannya. */
function bestSubstring(query: string, text: string): { distance: number; start: number; end: number } {
  const n = text.length;
  let prev = new Float32Array(n + 1);
  let prevStart = new Int32Array(n + 1);
  let cur = new Float32Array(n + 1);
  let curStart = new Int32Array(n + 1);
  for (let j = 0; j <= n; j += 1) prevStart[j] = j;
  for (let i = 1; i <= query.length; i += 1) {
    cur[0] = i;
    curStart[0] = 0;
    const q = query[i - 1];
    for (let j = 1; j <= n; j += 1) {
      let best = prev[j - 1] + substitutionCost(q, text[j - 1]);
      let start = prevStart[j - 1];
      if (prev[j] + 1 < best) {
        best = prev[j] + 1;
        start = prevStart[j];
      }
      if (cur[j - 1] + 1 < best) {
        best = cur[j - 1] + 1;
        start = curStart[j - 1];
      }
      cur[j] = best;
      curStart[j] = start;
    }
    [prev, cur] = [cur, prev];
    [prevStart, curStart] = [curStart, prevStart];
  }
  let end = 0;
  for (let j = 1; j <= n; j += 1) if (prev[j] < prev[end]) end = j;
  return { distance: prev[end], start: prevStart[end], end };
}

/** Kerangka bacaan cukup panjang untuk dicari? */
export const voiceQueryLength = (transcript: string) => arabicSkeleton(transcript).length;

// Bacaan sering diawali ta'awudz dan/atau basmalah, yang bukan bagian dari ayatnya.
const TAAWUDZ = arabicSkeleton('اعوذ بالله من الشيطان الرجيم');
const BASMALAH = arabicSkeleton('بسم الله الرحمن الرحيم');

/** Kerangka bacaan yang dicari: utuh, dan tanpa ta'awudz/basmalah di awalnya. */
function queriesFrom(transcript: string): string[] {
  let query = arabicSkeleton(transcript);
  const queries = [query];
  for (const prefix of [TAAWUDZ, BASMALAH]) {
    if (!query.startsWith(prefix)) continue;
    query = query.slice(prefix.length);
    queries.push(query);
  }
  return queries.map((q) => q.slice(0, MAX_QUERY_LETTERS)).filter((q) => q.length >= MIN_QUERY_LETTERS);
}

/** Cari ayat dari satu atau beberapa kemungkinan teks bacaan (alternatif pengenal suara). */
export function searchByRecitation(index: VoiceIndex, transcripts: string[], limit = 20): VoiceMatch[] {
  const best = new Map<number, VoiceMatch>();
  const total = index.text.length;
  transcripts.flatMap(queriesFrom).forEach((query) => {

    // Calon: ayat (atau ayat + ayat berikutnya) yang memuat banyak trigram bacaan.
    const grams = new Set<string>();
    for (let k = 0; k + 3 <= query.length; k += 1) grams.add(query.slice(k, k + 3));
    const hits = new Uint16Array(total);
    grams.forEach((gram) => index.grams.get(gram)?.forEach((i) => (hits[i] += 1)));
    const minHits = Math.max(2, Math.ceil(grams.size * 0.3));
    // Jendela tiap ayat: ayat itu + ayat sesudahnya (surah yang sama) secukupnya untuk
    // bacaan yang menyambung ke ayat berikutnya, paling banyak 3 ayat tambahan.
    const windowEnd = (i: number) => {
      let j = i;
      let extra = 0;
      while (j + 1 < total && j - i < 3 && extra < query.length && index.surah[j + 1] === index.surah[i]) {
        j += 1;
        extra += index.text[j].length;
      }
      return j;
    };
    const candidates: [number, number][] = [];
    for (let i = 0; i < total; i += 1) {
      // Ayat sangat pendek (mis. الۤمّۤ) tidak punya trigram: tetap dicek bila ayat sesudahnya cocok.
      if (!hits[i] && !(i + 1 < total && hits[i + 1])) continue;
      let combined = 0;
      for (let j = i, last = windowEnd(i); j <= last; j += 1) combined += hits[j];
      combined = Math.min(grams.size, combined);
      if (combined >= minHits) candidates.push([i, combined]);
    }
    candidates.sort((a, b) => b[1] - a[1]);

    candidates.slice(0, MAX_CANDIDATES).forEach(([i]) => {
      const own = index.text[i];
      const last = windowEnd(i);
      let text = own;
      const ends: number[] = [own.length];
      for (let j = i + 1; j <= last; j += 1) {
        text += index.text[j];
        ends.push(text.length);
      }
      const found = bestSubstring(query, text);
      // Bacaan dimulai di ayat berikutnya: biar dinilai sebagai ayat itu sendiri.
      if (found.start >= own.length) return;
      const score = Math.max(0, 1 - found.distance / query.length);
      if (score < MIN_SCORE) return;
      const lastIndex = i + Math.max(0, ends.findIndex((e) => found.end <= e));
      const match: VoiceMatch = {
        surah: index.surah[i],
        ayah: index.ayah[i],
        toAyah: index.ayah[lastIndex],
        score,
        start: found.start,
        end: Math.min(found.end, own.length)
      };
      const previous = best.get(i);
      if (!previous || match.score > previous.score) best.set(i, match);
    });
  });

  return [...best.entries()]
    .sort(([ia, a], [ib, b]) => b.score - a.score || Number(a.toAyah !== a.ayah) - Number(b.toAyah !== b.ayah) || ia - ib)
    .slice(0, limit)
    .map(([, match]) => match);
}
