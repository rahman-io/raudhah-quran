import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crosshair, Pause, Play, Repeat, SkipBack, SkipForward, X } from 'lucide-react';
import type { PlayMode, PlayerPrefs, PlayerState, RepeatCount } from './useSurahPlayer';

const MODES: { id: PlayMode; label: string; short: string }[] = [
  { id: 'arab', label: 'Ayat saja', short: 'Ayat' },
  { id: 'arab_arti', label: 'Ayat + arti', short: 'Ayat+Arti' },
  { id: 'arti', label: 'Arti saja', short: 'Arti' }
];
const REPEATS: RepeatCount[] = [1, 3, 5];
/** Pemutar disembunyikan bila layar tidak disentuh selama ini (hanya saat sedang memutar). */
const AUTO_HIDE_MS = 3500;

interface PrefsProps {
  prefs: PlayerPrefs;
  setPrefs: (next: Partial<PlayerPrefs>) => void;
  canSpeak: boolean;
  compact?: boolean;
}

/** Pilihan mode bacaan dan jumlah ulang per ayat. */
export const PlayerOptions: React.FC<PrefsProps> = ({ prefs, setPrefs, canSpeak, compact }) => (
  <div className={`flex flex-wrap items-center gap-2 ${compact ? 'justify-between' : ''}`}>
    <div role="radiogroup" aria-label="Mode bacaan" className="flex p-0.5 rounded-full bg-slate-100 dark:bg-slate-700/70">
      {MODES.map((mode) => {
        const disabled = mode.id !== 'arab' && !canSpeak;
        const selected = prefs.mode === mode.id;
        return (
          <button
            key={mode.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => setPrefs({ mode: mode.id })}
            title={disabled ? 'Perangkat ini belum mendukung suara pembaca teks' : mode.label}
            className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] font-semibold transition-colors disabled:opacity-40 ${
              selected ? 'bg-white dark:bg-slate-900 text-[#173B4E] dark:text-white shadow-xs' : 'text-[#477F8D] dark:text-slate-300'
            }`}
          >
            {compact ? mode.short : mode.label}
          </button>
        );
      })}
    </div>
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Ulang tiap ayat">
      <Repeat className="w-3.5 h-3.5 text-[#477F8D]" aria-hidden="true" />
      {REPEATS.map((count) => (
        <button
          key={count}
          type="button"
          role="radio"
          aria-checked={prefs.repeat === count}
          onClick={() => setPrefs({ repeat: count })}
          title={`Ulang tiap ayat ${count}×`}
          className={`w-8 py-1 rounded-full text-[11px] font-bold transition-colors ${
            prefs.repeat === count
              ? 'bg-[#246579] text-white'
              : 'bg-slate-100 dark:bg-slate-700/70 text-[#477F8D] dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          {count}×
        </button>
      ))}
    </div>
  </div>
);

interface DockProps extends PrefsProps {
  state: PlayerState;
  total: number;
  surahName: string;
  following: boolean;
  onFollow: () => void;
  onToggle: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onStop: () => void;
}

/** Pemutar kecil yang menempel di bawah layar selama surah dibacakan. */
export const PlayerDock: React.FC<DockProps> = ({
  state, total, surahName, following, onFollow, onToggle, onPrevious, onNext, onStop, prefs, setPrefs, canSpeak
}) => {
  const visible = state.status !== 'idle';
  const playing = state.status === 'playing';

  // Sembunyi otomatis agar tidak menutupi bacaan; muncul lagi saat layar disentuh,
  // digulir, atau kursor digerakkan. Tetap tampil saat dijeda/selesai atau sedang dipakai.
  const [shown, setShown] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const holding = useRef(false);

  useEffect(() => {
    if (!visible) return;
    const schedule = () => {
      clearTimeout(hideTimer.current);
      setShown(true);
      if (!playing) return;
      hideTimer.current = setTimeout(() => {
        if (!holding.current) setShown(false);
      }, AUTO_HIDE_MS);
    };
    const onMouseMove = (event: PointerEvent) => event.pointerType === 'mouse' && schedule();
    schedule();
    window.addEventListener('touchstart', schedule, { passive: true });
    window.addEventListener('touchmove', schedule, { passive: true });
    window.addEventListener('wheel', schedule, { passive: true });
    window.addEventListener('keydown', schedule);
    window.addEventListener('pointermove', onMouseMove);
    return () => {
      clearTimeout(hideTimer.current);
      window.removeEventListener('touchstart', schedule);
      window.removeEventListener('touchmove', schedule);
      window.removeEventListener('wheel', schedule);
      window.removeEventListener('keydown', schedule);
      window.removeEventListener('pointermove', onMouseMove);
    };
  }, [visible, playing]);

  const ayahNumber = state.index + 1;
  // Ulangan berlaku untuk bacaan ayat; pada mode "Arti saja" berlaku untuk artinya.
  const repeating = prefs.repeat > 1 && !state.single && (state.part === 'arab' ? prefs.mode !== 'arti' : prefs.mode === 'arti');
  const repeatInfo = repeating
    ? ` · ulang ${Math.min(state.rep + 1, prefs.repeat)}/${prefs.repeat}`
    : '';
  const status = state.status === 'done'
    ? 'Selesai, surah sudah dibacakan sampai akhir'
    : `${state.part === 'arab' ? 'Membaca ayat' : 'Membacakan arti'}${repeatInfo}`;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="surah_player_dock"
          data-surah-player
          initial={{ opacity: 0, y: 24 }}
          animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`fixed inset-x-3 sm:inset-x-6 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] lg:bottom-6 z-40 mx-auto max-w-xl ${shown ? '' : 'pointer-events-none'}`}
          role="region"
          aria-label="Pemutar surah"
          aria-hidden={!shown}
          onPointerEnter={(event) => {
            if (event.pointerType === 'mouse') holding.current = true;
          }}
          onPointerLeave={(event) => {
            if (event.pointerType === 'mouse') holding.current = false;
          }}
          onFocus={(event) => {
            // Hanya fokus keyboard yang menahan pemutar tetap tampil.
            holding.current = (event.target as HTMLElement).matches?.(':focus-visible') ?? false;
          }}
          onBlur={() => {
            holding.current = false;
          }}
        >
          <div className="rounded-3xl border border-[#D3A253]/50 bg-white/95 dark:bg-[#152E38]/95 backdrop-blur-md shadow-[0_12px_40px_rgba(23,59,78,0.22)] p-3 space-y-2.5">
            <div className="flex items-center gap-2">
              <button type="button" onClick={onPrevious} disabled={state.index === 0} className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full text-[#246579] dark:text-[#A7CDD3] hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30" aria-label="Ayat sebelumnya">
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onToggle}
                className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full bg-[#246579] hover:bg-[#174C60] text-white shadow-sm"
                aria-label={playing ? 'Jeda' : 'Putar'}
              >
                {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <button type="button" onClick={onNext} disabled={state.index + 1 >= total} className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full text-[#246579] dark:text-[#A7CDD3] hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30" aria-label="Ayat berikutnya">
                <SkipForward className="w-4 h-4" />
              </button>

              <div className="flex-1 min-w-0 px-1" aria-live="polite">
                <p className="text-xs font-bold text-[#173B4E] dark:text-white truncate">
                  {surahName} · Ayat {ayahNumber}/{total}
                </p>
                <p className="text-[11px] text-[#477F8D] dark:text-[#94A3B8] truncate">
                  {state.status === 'paused' ? 'Dijeda' : status}
                </p>
              </div>

              {!following && state.status !== 'done' && (
                <button
                  type="button"
                  onClick={onFollow}
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#D3A253]/20 text-[#8A6420] dark:text-[#E9CF99] text-[11px] font-semibold hover:bg-[#D3A253]/30"
                  title="Kembali ke ayat yang sedang dibaca"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ke ayat dibaca</span>
                </button>
              )}
              <button type="button" onClick={onStop} className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Hentikan pemutar">
                <X className="w-4 h-4" />
              </button>
            </div>
            {!state.single && <PlayerOptions prefs={prefs} setPrefs={setPrefs} canSpeak={canSpeak} compact />}
            {/* Garis kemajuan surah */}
            <div className="h-1 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden" aria-hidden="true">
              <div
                className="h-full bg-[#D3A253] transition-[width] duration-500"
                style={{ width: `${state.status === 'done' ? 100 : (state.index / Math.max(1, total)) * 100}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
