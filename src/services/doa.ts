import { useEffect, useState } from 'react';
import { assetUrl } from '../utils/assetUrl';
import { arabicSkeleton } from './arabicSkeleton';

/**
 * Doa & Dzikir: data bawaan (public/doa/doa.json), favorit, doa pribadi, dan ukuran huruf.
 *
 * Sumber data:
 * - Hisnul Muslim (Sa'id al-Qahthani), terjemah Indonesia dan takhrij, dari kompilasi
 *   "Hisnul Muslim" (adiman-dev, dicek silang dengan sunnah.com/hisn); nomor hadits dicek ulang.
 * - Dzikir pagi-petang, setelah shalat, dan doa harian lengkap dengan latin dari dataset
 *   "Dua & Dhikr" (fitrahive, lisensi MIT).
 * - Doa dari Al-Qur'an: teks, latin, dan terjemah Kemenag RI (sama dengan data Al-Qur'an aplikasi).
 */

export interface DoaCategory {
  id: string;
  title: string;
}

export interface DoaItem {
  id: string;
  /** Kategori. */
  c: string;
  /** Judul. */
  t: string;
  ar: string;
  /** Latin (tidak semua doa punya). */
  lt?: string;
  /** Terjemah. */
  tr: string;
  /** Sumber singkat, mis. "HR. Bukhari no. 6306". */
  src: string;
  /** Takhrij lengkap (Hisnul Muslim). */
  tk?: string;
  /** Catatan bacaan, mis. "Dibaca 3x". */
  n?: string;
  /** Jumlah bacaan. */
  rep?: number;
  /** Faedah. */
  f?: string;
  /** Catatan derajat hadits. */
  g?: string;
  /** Doa dari Al-Qur'an. */
  q?: number;
  /** Nomor doa di Hisnul Muslim. */
  hisn?: number;
}

export interface DoaData {
  categories: DoaCategory[];
  sets: Record<'pagi' | 'petang' | 'shalat', string[]>;
  items: DoaItem[];
}

export const SET_INFO: Record<keyof DoaData['sets'], { title: string; subtitle: string; icon: string }> = {
  pagi: { title: 'Dzikir Pagi', subtitle: 'Setelah Subuh hingga terbit matahari', icon: 'pagi-petang' },
  petang: { title: 'Dzikir Petang', subtitle: 'Setelah Ashar hingga Maghrib', icon: 'pagi-petang' },
  shalat: { title: 'Dzikir Setelah Shalat', subtitle: 'Dibaca setelah salam shalat fardhu', icon: 'shalat' }
};

export const categoryIcon = (id: string) => assetUrl(`/assets/doa/icons/${id}.webp`);

let cache: Promise<DoaData> | null = null;
export function loadDoa(): Promise<DoaData> {
  cache ??= fetch(assetUrl('/doa/doa.json'))
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json() as Promise<DoaData>;
    })
    .catch((error) => {
      cache = null;
      throw error;
    });
  return cache;
}

export function useDoaData(): { data: DoaData | null; error: boolean; retry: () => void } {
  const [data, setData] = useState<DoaData | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    setError(false);
    loadDoa()
      .then((d) => alive && setData(d))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, [attempt]);
  return { data, error, retry: () => setAttempt((n) => n + 1) };
}

/* ---------- Pencarian ---------- */

const normLatin = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[‘’'`ʻ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const searchIndex = new WeakMap<DoaItem, { text: string; skeleton: string }>();
function indexOf(item: DoaItem) {
  let entry = searchIndex.get(item);
  if (!entry) {
    entry = { text: normLatin(`${item.t} ${item.lt ?? ''} ${item.tr} ${item.src}`), skeleton: arabicSkeleton(item.ar) };
    searchIndex.set(item, entry);
  }
  return entry;
}

export function searchDoa(items: DoaItem[], query: string): DoaItem[] {
  const q = query.trim();
  if (!q) return items;
  if (/[؀-ۿ]/.test(q)) {
    const skel = arabicSkeleton(q);
    return skel ? items.filter((it) => indexOf(it).skeleton.includes(skel)) : [];
  }
  const words = normLatin(q).split(' ').filter(Boolean);
  return items.filter((it) => {
    const text = indexOf(it).text;
    return words.every((w) => text.includes(w));
  });
}

/* ---------- Penyimpanan lokal (favorit, doa pribadi, ukuran huruf) ---------- */

function storeHook<T>(key: string, fallback: T, validate: (v: unknown) => v is T) {
  const listeners = new Set<() => void>();
  let value: T = fallback;
  try {
    const raw = JSON.parse(localStorage.getItem(key) || 'null') as unknown;
    if (validate(raw)) value = raw;
  } catch {
    /* penyimpanan tidak tersedia */
  }
  const set = (next: T) => {
    value = next;
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* abaikan */
    }
    listeners.forEach((fn) => fn());
  };
  const get = () => value;
  const use = (): T => {
    const [v, setV] = useState(value);
    useEffect(() => {
      const update = () => setV(value);
      listeners.add(update);
      return () => {
        listeners.delete(update);
      };
    }, []);
    return v;
  };
  return { get, set, use };
}

const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string');

const favorites = storeHook<string[]>('raudhah_doa_favorites_v1', [], isStringArray);
export const useFavorites = favorites.use;
export function toggleFavorite(id: string) {
  const list = favorites.get();
  favorites.set(list.includes(id) ? list.filter((x) => x !== id) : [id, ...list]);
}

export interface PersonalDoa {
  id: string;
  title: string;
  arabic?: string;
  latin?: string;
  meaning: string;
  updatedAt: number;
}
const isPersonalList = (v: unknown): v is PersonalDoa[] =>
  Array.isArray(v) && v.every((x) => x && typeof x === 'object' && typeof (x as PersonalDoa).id === 'string' && typeof (x as PersonalDoa).title === 'string');
const personal = storeHook<PersonalDoa[]>('raudhah_doa_personal_v1', [], isPersonalList);
export const usePersonalDoa = personal.use;
export function savePersonalDoa(doa: Omit<PersonalDoa, 'id' | 'updatedAt'> & { id?: string }) {
  const list = personal.get();
  const entry: PersonalDoa = { ...doa, id: doa.id ?? `p${Date.now()}`, updatedAt: Date.now() };
  personal.set(doa.id ? list.map((d) => (d.id === doa.id ? entry : d)) : [entry, ...list]);
}
export function deletePersonalDoa(id: string) {
  personal.set(personal.get().filter((d) => d.id !== id));
}

export const ARABIC_SIZES = [1.5, 1.8, 2.1, 2.5, 2.9];
const isSize = (v: unknown): v is number => typeof v === 'number' && v >= 0 && v < ARABIC_SIZES.length;
const arabicSize = storeHook<number>('raudhah_doa_font_v1', 2, isSize);
export const useArabicSize = arabicSize.use;
export const setArabicSize = (n: number) => arabicSize.set(Math.max(0, Math.min(ARABIC_SIZES.length - 1, n)));

/** Teks doa untuk disalin atau dibagikan. */
export function doaShareText(item: { t: string; ar?: string; lt?: string; tr: string; src?: string }) {
  return [item.t, item.ar, item.lt, `Artinya: ${item.tr}`, item.src ? `(${item.src})` : '', '— Raudhah Qur\'an']
    .filter(Boolean)
    .join('\n\n');
}
