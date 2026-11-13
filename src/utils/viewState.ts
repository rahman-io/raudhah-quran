/**
 * Posisi tampilan terakhir (menu, surah yang terbuka, mode Hafalkan, posisi gulir daftar)
 * agar aplikasi kembali ke tempat yang sama setelah halaman di-refresh.
 * Disimpan di sessionStorage: bertahan saat refresh, tidak terbawa ke tab/jendela baru.
 */

export interface ViewState {
  tab?: string;
  reader?: {
    surah: number;
    /** true bila surah sedang terbuka (bukan Daftar Surah). */
    open: boolean;
    /** Indeks ayat yang sedang dibuka di mode Hafalkan. */
    hafalanAyah: number | null;
    /** Surah paling atas yang terlihat di Daftar Surah (posisi gulir). */
    listTopSurah?: number;
  };
}

const KEY = 'raudhah_view_v1';

// Posisi gulir dipulihkan sendiri oleh aplikasi (setelah data dimuat), bukan oleh browser.
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

export function loadView(): ViewState {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(KEY) ?? '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveView(patch: { tab?: string; reader?: Partial<NonNullable<ViewState['reader']>> }) {
  try {
    const current = loadView();
    const next: ViewState = {
      ...current,
      ...patch,
      reader: patch.reader
        ? ({ surah: 1, open: false, hafalanAyah: null, ...current.reader, ...patch.reader })
        : current.reader
    };
    sessionStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // penyimpanan tidak tersedia: refresh kembali ke menu awal seperti biasa
  }
}
