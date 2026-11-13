import { useEffect, useRef } from 'react';

/**
 * Tombol "back" HP / browser untuk aplikasi satu halaman.
 *
 * Setiap tampilan yang "lebih dalam" (surah terbuka, mode Hafalkan, game, jendela)
 * mendaftarkan diri lewat `useBackHandler`. Satu tekan back menutup satu tingkat
 * teratas. Di menu depan, tekan pertama menampilkan "Tekan sekali lagi untuk keluar",
 * dan tekan kedua (dalam 2 detik) benar-benar keluar dari aplikasi.
 */

interface Layer {
  onBack: () => void;
  /** Tingkat tampilan: yang lebih tinggi ditutup lebih dulu. */
  level: number;
  seq: number;
}

const layers: Layer[] = [];
let layerSeq = 0;

/** Ambil tampilan teratas (tingkat tertinggi, lalu yang paling baru dibuka). */
function popTopLayer(): Layer | undefined {
  if (!layers.length) return undefined;
  let top = 0;
  layers.forEach((layer, i) => {
    const best = layers[top];
    if (layer.level > best.level || (layer.level === best.level && layer.seq > best.seq)) top = i;
  });
  return layers.splice(top, 1)[0];
}
let ignorePops = 0;
let initialized = false;
let exitArmed = false;
let exitTimer: ReturnType<typeof setTimeout> | undefined;
let exitPrompt: ((visible: boolean) => void) | null = null;

const EXIT_WINDOW_MS = 2000;

/**
 * Setiap catatan riwayat milik aplikasi menyimpan kedalamannya. Setelah halaman
 * di-refresh, catatan lama masih ada di riwayat browser; dengan kedalaman ini
 * tombol back kedua di menu depan bisa melompati semuanya dan benar-benar keluar.
 */
const currentDepth = (): number => {
  const depth = (window.history.state as { raudhahDepth?: unknown } | null)?.raudhahDepth;
  return typeof depth === 'number' ? depth : 0;
};
const pushEntry = (kind: 'guard' | 'layer') =>
  window.history.pushState({ raudhah: kind, raudhahDepth: currentDepth() + 1 }, '');

function onPopState() {
  if (ignorePops > 0) {
    ignorePops -= 1;
    return;
  }
  const top = popTopLayer();
  if (top) {
    top.onBack();
    return;
  }
  // Menu depan: back pertama hanya memberi peringatan, back kedua keluar.
  if (exitArmed) {
    // Masih ada catatan lama (dari sebelum refresh): lompati semuanya sekaligus.
    const stale = currentDepth();
    if (stale > 0) window.history.go(-stale);
    return;
  }
  exitArmed = true;
  exitPrompt?.(true);
  clearTimeout(exitTimer);
  exitTimer = setTimeout(() => {
    exitArmed = false;
    exitPrompt?.(false);
    pushEntry('guard');
  }, EXIT_WINDOW_MS);
}

// Beberapa tampilan bisa tertutup bersamaan (mis. menutup mode Hafalkan saat game terbuka);
// catatan riwayatnya dibuang sekaligus dengan satu kali history.go(-n).
let pendingRemovals = 0;
function removeEntries() {
  pendingRemovals += 1;
  if (pendingRemovals > 1) return;
  queueMicrotask(() => {
    const count = pendingRemovals;
    pendingRemovals = 0;
    ignorePops += 1;
    window.history.go(-count);
  });
}

function init() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  pushEntry('guard');
  window.addEventListener('popstate', onPopState);
}

/** Pasang di akar aplikasi: menampilkan/menyembunyikan pesan "tekan sekali lagi". */
export function useExitPrompt(setVisible: (visible: boolean) => void) {
  useEffect(() => {
    init();
    exitPrompt = setVisible;
    return () => {
      if (exitPrompt === setVisible) exitPrompt = null;
    };
  }, [setVisible]);
}

/**
 * Selama `active` bernilai true, tombol back menjalankan `onBack` (menutup tampilan ini)
 * alih-alih keluar dari aplikasi. `level` menentukan urutan tutup saat beberapa tampilan
 * terbuka bersamaan (mis. setelah refresh): menu 0, surah 1, mode Hafalkan 2, jendela 10.
 */
export function useBackHandler(active: boolean, onBack: () => void, level = 5) {
  const callback = useRef(onBack);
  callback.current = onBack;

  useEffect(() => {
    if (!active) return;
    init();
    // Pengguna sedang menelusuri aplikasi lagi: batalkan hitungan "keluar".
    if (exitArmed) {
      exitArmed = false;
      clearTimeout(exitTimer);
      exitPrompt?.(false);
      pushEntry('guard');
    }
    const layer: Layer = { onBack: () => callback.current(), level, seq: ++layerSeq };
    layers.push(layer);
    pushEntry('layer');
    return () => {
      const index = layers.indexOf(layer);
      if (index === -1) return; // sudah ditutup lewat tombol back
      // Ditutup lewat tombol di layar: buang juga catatan riwayatnya.
      layers.splice(index, 1);
      removeEntries();
    };
  }, [active]);
}
