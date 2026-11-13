import { useEffect, useRef, useState } from 'react';

/**
 * Tampil saat pengguna berinteraksi (sentuh, gulir, kursor, keyboard) dan
 * menghilang sendiri setelah beberapa detik tanpa interaksi.
 *
 * - `enabled`: false = selalu tampil.
 * - `hold`: true = jangan disembunyikan (mis. menu sedang terbuka).
 * - `canHide`: dicek sebelum menyembunyikan (mis. hanya saat elemen sedang menempel).
 */
export function useIdleVisibility(
  enabled: boolean,
  { delay = 3500, hold = false, canHide }: { delay?: number; hold?: boolean; canHide?: () => boolean } = {}
) {
  const [visible, setVisible] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const holdRef = useRef(hold);
  holdRef.current = hold;
  const canHideRef = useRef(canHide);
  canHideRef.current = canHide;

  useEffect(() => {
    clearTimeout(timer.current);
    if (!enabled) {
      setVisible(true);
      return;
    }
    const schedule = () => {
      clearTimeout(timer.current);
      setVisible(true);
      timer.current = setTimeout(() => {
        if (holdRef.current) return;
        if (canHideRef.current && !canHideRef.current()) return;
        setVisible(false);
      }, delay);
    };
    const onMouseMove = (event: PointerEvent) => event.pointerType === 'mouse' && schedule();
    // Guliran apa pun (termasuk otomatis) yang membawa elemen kembali ke tempat asalnya: tampilkan.
    const onScroll = () => {
      if (canHideRef.current && !canHideRef.current()) setVisible(true);
    };
    schedule();
    window.addEventListener('touchstart', schedule, { passive: true });
    window.addEventListener('touchmove', schedule, { passive: true });
    window.addEventListener('wheel', schedule, { passive: true });
    window.addEventListener('keydown', schedule);
    window.addEventListener('pointermove', onMouseMove);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearTimeout(timer.current);
      window.removeEventListener('touchstart', schedule);
      window.removeEventListener('touchmove', schedule);
      window.removeEventListener('wheel', schedule);
      window.removeEventListener('keydown', schedule);
      window.removeEventListener('pointermove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, [enabled, delay]);

  // Saat ditahan (mis. menu dibuka), pastikan tampil.
  useEffect(() => {
    if (hold) setVisible(true);
  }, [hold]);

  return visible;
}
