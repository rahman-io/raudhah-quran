/**
 * Mencegah zoom in/out agar aplikasi terasa seperti aplikasi asli, termasuk di iPhone.
 *
 * - Android/Chrome: meta viewport `maximum-scale=1, user-scalable=no` (di index.html).
 * - iPhone/iPad (Safari mengabaikan `user-scalable=no` sejak iOS 10):
 *   cegah gerakan cubit (event `gesture*` dan sentuhan dua jari) serta ketuk-dua-kali
 *   (CSS `touch-action: manipulation` di index.css).
 * - Desktop: cegah Ctrl/Cmd + roda tetikus dan Ctrl/Cmd + "+", "-", "0".
 *
 * Ukuran huruf tetap bisa diperbesar lewat Pengaturan (teks Arab, latin, dan terjemahan).
 */
export function preventZoom() {
  if (typeof window === 'undefined') return;

  const stop = (event: Event) => event.preventDefault();
  // Safari iOS: gerakan cubit.
  document.addEventListener('gesturestart', stop, { passive: false });
  document.addEventListener('gesturechange', stop, { passive: false });
  document.addEventListener('gestureend', stop, { passive: false });

  // Sentuhan dua jari atau lebih (cubit) di semua browser sentuh.
  document.addEventListener(
    'touchmove',
    (event) => {
      if (event.touches.length > 1) event.preventDefault();
    },
    { passive: false }
  );

  // Desktop: Ctrl/Cmd + roda tetikus (atau cubit di touchpad).
  window.addEventListener(
    'wheel',
    (event) => {
      if (event.ctrlKey || event.metaKey) event.preventDefault();
    },
    { passive: false }
  );

  // Desktop: Ctrl/Cmd + "+", "-", "=", "0".
  window.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && ['+', '-', '=', '0', '_'].includes(event.key)) event.preventDefault();
  });
}
