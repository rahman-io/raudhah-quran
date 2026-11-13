import { assetUrl } from '../utils/assetUrl';
import type { TajwidCode } from '../data/tajwidMarks';

/**
 * Tanda tajwid per kata untuk teks Mushaf Standar Indonesia (public/quran-tajwid/{surah}.json).
 * Posisi `start`/`end` adalah indeks karakter di dalam kata MSI (urutan kata = splitKemenagWords).
 * Sumber hukum: data anotasi tajwid riwayat Hafs "quran-tajweed" (CC BY 4.0), dipetakan ke teks Kemenag.
 */

export interface TajwidMark {
  /** Urutan kata dalam ayat (mulai 0). */
  word: number;
  code: TajwidCode;
  start: number;
  end: number;
  /** Huruf sesudahnya yang menyebabkan hukum (untuk nun/mim sukun & tanwin). */
  trigger: string;
}

type Row = [number, TajwidCode, number, number, string];

const cache = new Map<number, Promise<Map<number, TajwidMark[]> | null>>();

export function loadTajwidSurah(surah: number): Promise<Map<number, TajwidMark[]> | null> {
  let cached = cache.get(surah);
  if (!cached) {
    cached = fetch(assetUrl(`/quran-tajwid/${surah}.json`))
      .then((response) => (response.ok ? (response.json() as Promise<{ ayahs: Record<string, Row[]> }>) : null))
      .then((data) => {
        if (!data?.ayahs) return null;
        const map = new Map<number, TajwidMark[]>();
        Object.entries(data.ayahs).forEach(([ayah, rows]) =>
          map.set(
            Number(ayah),
            rows.map(([word, code, start, end, trigger]) => ({ word, code, start, end, trigger }))
          )
        );
        return map;
      })
      .catch(() => {
        cache.delete(surah);
        return null;
      });
    cache.set(surah, cached);
  }
  return cached;
}
