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
}

const layers: Layer[] = [];
let ignorePops = 0;
let initialized = false;
let exitArmed = false;
let exitTimer: ReturnType<typeof setTimeout> | undefined;
let exitPrompt: ((visible: boolean) => void) | null = null;

const EXIT_WINDOW_MS = 2000;
const GUARD_STATE = { raudhahGuard: true };

function onPopState() {
  if (ignorePops > 0) {
    ignorePops -= 1;
    return;
  }
  const top = layers.pop();
  if (top) {
    top.onBack();
    return;
  }
  // Menu depan: back pertama hanya memberi peringatan, back kedua keluar.
  if (exitArmed) return;
  exitArmed = true;
  exitPrompt?.(true);
  clearTimeout(exitTimer);
  exitTimer = setTimeout(() => {
    exitArmed = false;
    exitPrompt?.(false);
    window.history.pushState(GUARD_STATE, '');
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
  window.history.pushState(GUARD_STATE, '');
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
 * alih-alih keluar dari aplikasi.
 */
export function useBackHandler(active: boolean, onBack: () => void) {
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
      window.history.pushState(GUARD_STATE, '');
    }
    const layer: Layer = { onBack: () => callback.current() };
    layers.push(layer);
    window.history.pushState({ raudhahLayer: true }, '');
    return () => {
      const index = layers.indexOf(layer);
      if (index === -1) return; // sudah ditutup lewat tombol back
      // Ditutup lewat tombol di layar: buang juga catatan riwayatnya.
      layers.splice(index, 1);
      removeEntries();
    };
  }, [active]);
}
