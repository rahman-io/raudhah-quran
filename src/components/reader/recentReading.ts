/**
 * Riwayat surah yang terakhir dibuka di menu Baca & Tadabbur, beserta ayat terakhir
 * yang terlihat. Disimpan di perangkat (localStorage), dicatat otomatis.
 */

export interface RecentReading {
  number: number;
  nameLatin: string;
  /** Ayat terakhir yang sedang dibaca/terlihat. */
  ayah: number;
  totalAyahs: number;
  /** Waktu terakhir dibuka (ms sejak epoch). */
  at: number;
}

const KEY = 'raudhah_reader_recent_v1';
const MAX_ITEMS = 6;
const listeners = new Set<() => void>();

export function getRecentReadings(): RecentReading[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(parsed)
      ? parsed.filter((r) => r && typeof r.number === 'number' && typeof r.ayah === 'number')
      : [];
  } catch {
    return [];
  }
}

function save(list: RecentReading[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_ITEMS)));
  } catch {
    // penyimpanan tidak tersedia: riwayat hanya hilang, aplikasi tetap jalan
  }
  listeners.forEach((fn) => fn());
}

/** Catat surah & ayat yang sedang dibaca; surah ini naik ke urutan teratas. */
export function recordReading(entry: Omit<RecentReading, 'at'>) {
  const list = getRecentReadings();
  const current = list[0];
  // Ayat berubah di surah yang sama: cukup perbarui tanpa mengubah urutan lain.
  if (current && current.number === entry.number && current.ayah === entry.ayah) return;
  save([{ ...entry, at: Date.now() }, ...list.filter((r) => r.number !== entry.number)]);
}

export function clearRecentReadings() {
  save([]);
}

export function subscribeRecentReadings(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** "baru saja", "5 menit lalu", "kemarin", … */
export function timeAgo(at: number, now = Date.now()): string {
  const minutes = Math.floor((now - at) / 60000);
  if (minutes < 1) return 'baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'kemarin';
  if (days < 7) return `${days} hari lalu`;
  return new Date(at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
