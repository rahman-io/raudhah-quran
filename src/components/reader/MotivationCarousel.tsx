import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Pause, Quote } from 'lucide-react';
import { QURAN_MOTIVATIONS } from '../../data/quranMotivations';

const SWIPE_THRESHOLD = 50;
const MIN_SLIDE_MS = 8000;
const MAX_SLIDE_MS = 20000;
const MS_PER_WORD = 330;

/** Lama tampil tiap slide menyesuaikan panjang teks, agar sempat dibaca sampai habis. */
const slideDuration = (i: number) => {
  const { title, message } = QURAN_MOTIVATIONS[i];
  const words = `${title} ${message}`.trim().split(/\s+/).length;
  return Math.min(MAX_SLIDE_MS, Math.max(MIN_SLIDE_MS, words * MS_PER_WORD));
};

/**
 * Slider motivasi membaca & menghafal Al-Qur'an.
 * Bergeser otomatis hanya bila tidak sedang disentuh/diarahkan kursor:
 * selama jari menempel atau kursor berada di atasnya, slider diam.
 */
export const MotivationCarousel: React.FC = () => {
  const total = QURAN_MOTIVATIONS.length;
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [touching, setTouching] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const drag = useRef<{ startX: number; startY: number; active: boolean } | null>(null);

  const go = (next: number) => setIndex(((next % total) + total) % total);
  const paused = hovered || touching || keyboardFocus || reducedMotion || !pageVisible;
  const duration = slideDuration(index);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(Boolean(media?.matches));
    update();
    media?.addEventListener?.('change', update);
    const onVisibility = () => setPageVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      media?.removeEventListener?.('change', update);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // Jari dilepas di mana pun (termasuk di luar slider) = sentuhan selesai.
  useEffect(() => {
    if (!touching) return;
    const release = () => setTouching(false);
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    return () => {
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
    };
  }, [touching]);

  // Geser otomatis: penghitung waktu dimulai ulang penuh setiap slide berganti
  // atau setiap kali jeda selesai, jadi pembaca selalu mendapat waktu baca utuh.
  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => go(index + 1), duration);
    return () => clearTimeout(timer);
  }, [index, paused, duration]);

  const onPointerEnter = (event: React.PointerEvent) => {
    if (event.pointerType === 'mouse') setHovered(true);
  };
  const onPointerLeave = (event: React.PointerEvent) => {
    if (event.pointerType === 'mouse') setHovered(false);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') setTouching(true);
    if ((event.target as HTMLElement).closest('a,button')) return;
    drag.current = { startX: event.clientX, startY: event.clientY, active: false };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = event.clientX - d.startX;
    const dy = event.clientY - d.startY;
    if (!d.active && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
      d.active = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (d.active) setDragX(dx);
  };

  const endDrag = () => {
    const d = drag.current;
    drag.current = null;
    if (d?.active) {
      if (dragX <= -SWIPE_THRESHOLD) go(index + 1);
      else if (dragX >= SWIPE_THRESHOLD) go(index - 1);
    }
    setDragX(0);
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Motivasi membaca dan menghafal Al-Qur'an"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#246579] to-[#174C60] text-white shadow-sm"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onFocus={(event) => setKeyboardFocus((event.target as HTMLElement).matches?.(':focus-visible') ?? false)}
      onBlur={() => setKeyboardFocus(false)}
    >
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D3A253_1px,transparent_1px)] [background-size:16px_16px]" aria-hidden="true" />

      <div
        className="relative select-none"
        style={{ touchAction: 'pan-y' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div
          className="flex"
          style={{
            transform: `translateX(calc(${-index * 100}% + ${dragX}px))`,
            transition: dragX !== 0 || reducedMotion ? 'none' : 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1)'
          }}
        >
          {QURAN_MOTIVATIONS.map((item, i) => (
            <article
              key={item.title}
              className="w-full shrink-0 px-6 sm:px-10 pt-6 pb-16 sm:pt-8"
              aria-roledescription="slide"
              aria-label={`${i + 1} dari ${total}`}
              aria-hidden={i !== index}
            >
              <Quote className="w-7 h-7 text-[#D3A253]" aria-hidden="true" />
              <h3 className="mt-3 text-lg sm:text-xl font-bold leading-snug">{item.title}</h3>
              <p className="mt-2 text-sm sm:text-[15px] leading-relaxed text-white/90">{item.message}</p>
              {item.reference && (
                item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={i === index ? 0 : -1}
                    className="mt-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[11px] font-medium text-[#E9CF99]"
                  >
                    {item.reference}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="mt-3 inline-flex px-2.5 py-1 rounded-full bg-white/10 text-[11px] font-medium text-[#E9CF99]">
                    {item.reference}
                  </span>
                )
              )}
            </article>
          ))}
        </div>
      </div>

      {/* Navigasi: sumber kajian, titik slide, panah */}
      <div className="absolute inset-x-0 bottom-0 px-6 sm:px-10 pb-5 flex items-center justify-between gap-3">
        <span className="flex items-center gap-1 min-w-0 text-[10px] text-[#E9CF99]" aria-live="polite">
          {paused && !reducedMotion && (
            <>
              <Pause className="w-3 h-3 shrink-0" aria-hidden="true" />
              <span>Dijeda</span>
            </>
          )}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={() => go(index - 1)} className="hidden sm:flex w-7 h-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Motivasi sebelumnya">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1">
            {QURAN_MOTIVATIONS.map((item, i) => (
              <button
                key={`dot_${item.title}`}
                type="button"
                onClick={() => go(i)}
                aria-label={`Tampilkan motivasi ${i + 1}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${i === index ? 'w-4 bg-[#D3A253]' : 'w-1.5 bg-white/40 hover:bg-white/70'}`}
              />
            ))}
          </div>
          <button type="button" onClick={() => go(index + 1)} className="hidden sm:flex w-7 h-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Motivasi berikutnya">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Garis waktu: berjalan saat slider bergeser otomatis, berhenti saat dijeda */}
      {!reducedMotion && (
        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10" aria-hidden="true">
          <div
            key={`${index}_${paused ? 'p' : 'r'}`}
            className="h-full bg-[#D3A253]/80 origin-left"
            style={{
              animation: paused ? 'none' : `motivation-progress ${duration}ms linear forwards`,
              transform: paused ? 'scaleX(0)' : undefined
            }}
          />
          <style>{'@keyframes motivation-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }'}</style>
        </div>
      )}
    </section>
  );
};
