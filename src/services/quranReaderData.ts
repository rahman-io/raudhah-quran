import { SURAHS_DATA } from '../data/quranData';
import { Ayah, QuranWord, Surah } from '../types/quran';
import { assetUrl } from '../utils/assetUrl';

/**
 * Data 114 surah untuk menu "Baca & Tadabbur", hasil impor dari Quran.com API
 * (scripts/import-quran.mjs) yang disimpan di public/quran/.
 */

export type ReaderSurahMeta = Omit<Surah, 'ayahs' | 'themeColor'>;

export interface ReaderSource {
  api: string;
  translation: { id: number; name: string; author: string };
}

export type ReaderAyah = Omit<Ayah, 'tadabbur'> & { tadabbur?: Ayah['tadabbur'] };

export interface ReaderSurah extends ReaderSurahMeta {
  ayahs: ReaderAyah[];
}

interface SurahFile extends ReaderSurahMeta {
  audioBase: string;
  ayahs: { n: number; g: number; ar: string; tl: string; id: string; w: [string, string, string][] }[];
}

export interface ReaderIndex {
  source: ReaderSource | null;
  surahs: ReaderSurahMeta[];
}

/** Daftar surah bawaan aplikasi, dipakai bila data impor belum tersedia. */
const bundledIndex = (): ReaderIndex => ({
  source: null,
  surahs: [...SURAHS_DATA]
    .sort((a, b) => a.number - b.number)
    .map(({ ayahs, themeColor, ...meta }) => meta)
});

let indexPromise: Promise<ReaderIndex> | null = null;
const surahCache = new Map<number, Promise<ReaderSurah>>();

export function loadReaderIndex(): Promise<ReaderIndex> {
  indexPromise ??= fetch(assetUrl('/quran/index.json'))
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json() as Promise<ReaderIndex>;
    })
    .then((index) => {
      if (!Array.isArray(index.surahs) || index.surahs.length !== 114) throw new Error('Daftar surah tidak lengkap');
      return index;
    })
    .catch((error) => {
      console.warn('Data 114 surah belum tersedia, memakai surah bawaan:', error);
      return bundledIndex();
    });
  return indexPromise;
}

/** Catatan tadabbur & detail kata yang ditulis untuk surah bawaan tetap ditampilkan. */
function enrichFromBundled(surah: ReaderSurah): ReaderSurah {
  const bundled = SURAHS_DATA.find((s) => s.number === surah.number);
  if (!bundled) return surah;
  const bundledAyahs = new Map(bundled.ayahs.map((ayah) => [ayah.id, ayah]));
  return {
    ...surah,
    ayahs: surah.ayahs.map((ayah) => {
      const local = bundledAyahs.get(ayah.id);
      if (!local) return ayah;
      // Detail kata (akar kata, jenis kata) hanya digabung bila pembagian katanya sama.
      const sameWords = local.words.length === ayah.words.length;
      return {
        ...ayah,
        tadabbur: local.tadabbur,
        words: ayah.words.map((word, i): QuranWord => {
          const extra = sameWords ? local.words[i] : undefined;
          return extra
            ? { ...word, rootWord: extra.rootWord, grammarType: extra.grammarType, explanation: extra.explanation }
            : word;
        })
      };
    })
  };
}

function fromFile(file: SurahFile): ReaderSurah {
  const { audioBase, ayahs, ...meta } = file;
  return {
    ...meta,
    ayahs: ayahs.map((ayah) => {
      const id = `${file.number}:${ayah.n}`;
      return {
        id,
        surahNumber: file.number,
        ayahNumber: ayah.n,
        globalAyahNumber: ayah.g,
        arabicText: ayah.ar,
        transliteration: ayah.tl,
        translationId: ayah.id,
        audioUrl: `${audioBase}/${ayah.g}.mp3`,
        words: ayah.w.map(([arabic, transliteration, translation], i) => ({
          id: `${id}:${i + 1}`,
          arabic,
          transliteration,
          translation
        }))
      };
    })
  };
}

export function loadReaderSurah(number: number): Promise<ReaderSurah> {
  let cached = surahCache.get(number);
  if (!cached) {
    cached = fetch(assetUrl(`/quran/surah/${number}.json`))
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<SurahFile>;
      })
      .then((file) => enrichFromBundled(fromFile(file)))
      .catch((error) => {
        const bundled = SURAHS_DATA.find((s) => s.number === number);
        if (bundled) return bundled as ReaderSurah;
        surahCache.delete(number);
        throw error;
      });
    surahCache.set(number, cached);
  }
  return cached;
}
