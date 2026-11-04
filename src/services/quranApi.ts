import { SURAHS_DATA } from '../data/quranData';
import { Surah } from '../types/quran';

/**
 * Service to fetch Quran data with immediate fallback to local offline dataset.
 * Supports offline-first PWA operation without requiring API keys.
 */
export async function getSurahsList(): Promise<Surah[]> {
  // Always return offline dataset directly for instant, resilient zero-latency experience
  return SURAHS_DATA;
}

export function getSurahByNumber(num: number): Surah | undefined {
  return SURAHS_DATA.find((s) => s.number === num) || SURAHS_DATA[0];
}

export function getAyahById(ayahId: string) {
  for (const surah of SURAHS_DATA) {
    const found = surah.ayahs.find((a) => a.id === ayahId);
    if (found) return { surah, ayah: found };
  }
  return { surah: SURAHS_DATA[0], ayah: SURAHS_DATA[0].ayahs[0] };
}
