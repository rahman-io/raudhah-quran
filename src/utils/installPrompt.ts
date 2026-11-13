import { useEffect, useState } from 'react';

/**
 * "Pasang Aplikasi" (PWA): app dibuka dari ikon di layar utama HP tampil layar penuh
 * tanpa bilah browser. Android/Chrome memberi event `beforeinstallprompt` yang ditangkap
 * di sini (sedini mungkin, sebelum React jalan) agar tombol "Pasang" bisa memakainya.
 * iPhone/iPad tidak punya event ini: pengguna dipandu lewat menu Bagikan → Tambahkan ke Layar Utama.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault(); // tampilkan ajakan kita sendiri, bukan bilah bawaan browser
    deferred = event as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    installed = true;
    deferred = null;
    notify();
  });
}

/** Sedang dibuka sebagai app terpasang (dari ikon di layar utama). */
export const isStandalone = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(display-mode: standalone)').matches ||
    window.matchMedia?.('(display-mode: fullscreen)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true);

export const isIOS = () =>
  typeof navigator !== 'undefined' &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

export type InstallMode = 'prompt' | 'ios' | 'manual' | 'installed';

function currentMode(): InstallMode {
  if (installed || isStandalone()) return 'installed';
  if (deferred) return 'prompt';
  if (isIOS()) return 'ios';
  return 'manual';
}

/** Cara memasang yang tersedia di perangkat ini; ikut berubah saat event browser datang. */
export function useInstallMode(): InstallMode {
  const [mode, setMode] = useState<InstallMode>(currentMode);
  useEffect(() => {
    const update = () => setMode(currentMode());
    listeners.add(update);
    update();
    return () => {
      listeners.delete(update);
    };
  }, []);
  return mode;
}

/** Tampilkan dialog pasang bawaan browser (Android/Chrome). true bila pengguna memasang. */
export async function promptInstall(): Promise<boolean> {
  const event = deferred;
  if (!event) return false;
  deferred = null;
  notify();
  await event.prompt();
  const { outcome } = await event.userChoice;
  return outcome === 'accepted';
}
