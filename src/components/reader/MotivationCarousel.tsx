import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Quote } from 'lucide-react';
import { MOTIVATION_SOURCE, QURAN_MOTIVATIONS } from '../../data/quranMotivations';

const AUTOPLAY_MS = 7000;
const SWIPE_THRESHOLD = 50;

/** Slider motivasi membaca & menghafal Al-Qur'an yang bergeser otomatis. */
export const MotivationCarousel: React.FC = () => {
  const total = QURAN_MOTIVATIONS.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const drag = useRef<{ startX: number; startY: number; active: boolean } | null>(null);

  const go = (next: number) => setIndex(((next % total) + total) % total);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!media) return;
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  // Geser otomatis; berhenti saat disentuh/diarahkan kursor atau tab tidak terlihat.
  useEffect(() => {
    if (paused || reducedMotion || drag.current?.active) return;
    const timer = setTimeout(() => {
      if (document.visibilityState === 'visible') go(index + 1);
    }, AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [index, paused, reducedMotion, dragX]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
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
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
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
              className="w-full shrink-0 px-6 sm:px-10 pt-6 pb-14 sm:pt-8"
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

      {/* Navigasi: sumber, titik slide, panah */}
      <div className="absolute inset-x-0 bottom-0 px-6 sm:px-10 pb-4 flex items-center justify-between gap-3">
        <span className="text-[10px] text-white/60 truncate">{MOTIVATION_SOURCE}</span>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={() => go(index - 1)} className="hidden sm:flex w-7 h-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Motivasi sebelumnya">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5">
            {QURAN_MOTIVATIONS.map((item, i) => (
              <button
                key={`dot_${item.title}`}
                type="button"
                onClick={() => go(i)}
                aria-label={`Tampilkan motivasi ${i + 1}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-[#D3A253]' : 'w-1.5 bg-white/40 hover:bg-white/70'}`}
              />
            ))}
          </div>
          <button type="button" onClick={() => go(index + 1)} className="hidden sm:flex w-7 h-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Motivasi berikutnya">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
