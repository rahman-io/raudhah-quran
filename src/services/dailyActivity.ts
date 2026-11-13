import { useEffect, useState } from 'react';

/**
 * Aktivitas Hari Ini: checklist harian yang terisi otomatis dari pemakaian aplikasi.
 * Disimpan per tanggal di perangkat (localStorage); berganti otomatis tiap hari.
 */

export type ActivityId = 'baca' | 'setor' | 'game' | 'tajwid' | 'murottal' | 'dzikir';

export const ACTIVITIES: { id: ActivityId; title: string; hint: string }[] = [
  { id: 'baca', title: 'Baca 1 halaman Al-Qur\'an', hint: 'Mode Mushaf 1 halaman, atau 10 ayat di Tadabbur' },
  { id: 'setor', title: 'Setor hafalan 1 halaman', hint: 'Setor Hafalan di Mode Mushaf, atau Tantangan Surah' },
  { id: 'game', title: 'Main 1 game hafalan', hint: 'Salah satu dari 9 game di Mode Hafalkan' },
  { id: 'tajwid', title: 'Belajar 1 materi tajwid', hint: 'Buka satu materi di menu Tajwid' },
  { id: 'murottal', title: 'Dengarkan murottal', hint: 'Putar murottal minimal 1 ayat' },
  { id: 'dzikir', title: 'Baca dzikir pagi atau petang', hint: 'Dzikir terpandu di menu Doa' }
];

interface DayRecord {
  date: string;
  done: Partial<Record<ActivityId, number>>;
  /** Ayat berbeda yang terbaca di Tadabbur hari ini (untuk "baca 1 halaman"). */
  ayahs?: string[];
  /** Bonus XP "semua selesai" sudah diberikan hari ini. */
  bonus?: boolean;
}

const KEY = 'raudhah_daily_activity_v1';
/** Ayat yang dihitung setara 1 halaman mushaf (rata-rata ±10 ayat per halaman). */
const AYAHS_PER_PAGE = 10;
const listeners = new Set<() => void>();

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function read(): DayRecord {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || 'null') as DayRecord | null;
    if (value && value.date === todayKey() && value.done) return value;
  } catch {
    // abaikan
  }
  return { date: todayKey(), done: {} };
}

function write(record: DayRecord) {
  try {
    localStorage.setItem(KEY, JSON.stringify(record));
  } catch {
    // penyimpanan tidak tersedia
  }
  listeners.forEach((fn) => fn());
}

/** Tandai satu aktivitas hari ini selesai. */
export function markActivity(id: ActivityId) {
  const record = read();
  if (record.done[id]) return;
  record.done[id] = Date.now();
  write(record);
}

/** Catat satu ayat yang terbaca di Tadabbur; 10 ayat berbeda = "baca 1 halaman". */
export function noteAyahRead(surah: number, ayah: number) {
  const record = read();
  if (record.done.baca) return;
  const key = `${surah}:${ayah}`;
  const ayahs = new Set(record.ayahs ?? []);
  if (ayahs.has(key)) return;
  ayahs.add(key);
  record.ayahs = [...ayahs].slice(-AYAHS_PER_PAGE);
  if (ayahs.size >= AYAHS_PER_PAGE) record.done.baca = Date.now();
  write(record);
}

/** Bonus semua aktivitas selesai: true sekali saja per hari (yang pertama memanggil). */
export function claimDailyBonus(): boolean {
  const record = read();
  if (record.bonus || ACTIVITIES.some((a) => !record.done[a.id])) return false;
  record.bonus = true;
  write(record);
  return true;
}

export function getTodayActivities(): Record<ActivityId, boolean> {
  const { done } = read();
  return Object.fromEntries(ACTIVITIES.map((a) => [a.id, !!done[a.id]])) as Record<ActivityId, boolean>;
}

/** Status checklist hari ini (ikut berubah saat aktivitas tercatat, juga saat berganti hari). */
export function useTodayActivities(): Record<ActivityId, boolean> {
  const [value, setValue] = useState(getTodayActivities);
  useEffect(() => {
    const update = () => setValue(getTodayActivities());
    listeners.add(update);
    const timer = setInterval(update, 60000);
    window.addEventListener('focus', update);
    return () => {
      listeners.delete(update);
      clearInterval(timer);
      window.removeEventListener('focus', update);
    };
  }, []);
  return value;
}
