import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft, BookOpenText, CheckCircle2, ChevronRight, History, Info, Plus, RotateCcw, Sun, Trash2, Vibrate, Volume2, VolumeX, X
} from 'lucide-react';
import { useBackHandler } from '../../utils/backNavigation';
import { assetUrl } from '../../utils/assetUrl';
import { AFTER_PRAYER_SEQUENCE, DZIKIR } from '../../data/dzikir';
import {
  addCustomDzikir, currentDzikir, dayKey, findDzikir, readLog, removeCustomDzikir, resetCount, restore, selectDzikir,
  setTasbihOption, startSequence, tap, todayCount, useTasbih, type TasbihState
} from '../../services/tasbih';

/* ---------- Ikon tasbih (untuk pintasan Beranda) ---------- */

export const TasbihIcon: React.FC<{ className?: string; strokeWidth?: number }> = ({ className, strokeWidth = 1.6 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
      const angle = (-90 + 40 + i * 37) * (Math.PI / 180);
      return <circle key={i} cx={12 + 7 * Math.cos(angle)} cy={10 + 7 * Math.sin(angle)} r={1.7} />;
    })}
    <path d="M12 3v3.2" />
    <path d="M10.6 1.8h2.8" />
    <path d="M12 17.2v2.3l-1.6 2.6M12 19.5l1.6 2.6" />
  </svg>
);

/* ---------- Layar angka 7 segmen ---------- */

const SEGMENTS: Record<string, string> = {
  a: '13,5 47,5 52,10 47,15 13,15 8,10',
  b: '50,13 55,18 55,43 50,48 45,43 45,18',
  c: '50,52 55,57 55,82 50,87 45,82 45,57',
  d: '13,85 47,85 52,90 47,95 13,95 8,90',
  e: '10,52 15,57 15,82 10,87 5,82 5,57',
  f: '10,13 15,18 15,43 10,48 5,43 5,18',
  g: '13,45 47,45 52,50 47,55 13,55 8,50'
};
const DIGIT_SEGMENTS: Record<string, string> = {
  '0': 'abcdef', '1': 'bc', '2': 'abdeg', '3': 'abcdg', '4': 'bcfg', '5': 'acdfg', '6': 'acdefg', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg'
};
const DIGITS = 4;

const SevenSegment: React.FC<{ value: number }> = ({ value }) => {
  const text = String(Math.max(0, value) % 10 ** DIGITS).padStart(DIGITS, ' ');
  return (
    <svg viewBox="0 0 282 100" className="w-full h-full" aria-hidden="true">
      <defs>
        <filter id="tasbih-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {[...text].map((ch, i) => {
        const on = DIGIT_SEGMENTS[ch] ?? '';
        return (
          <g key={i} transform={`translate(${i * 74} 0) skewX(-7) translate(7 0)`}>
            {Object.entries(SEGMENTS).map(([name, points]) => (
              <polygon key={name} points={points} fill={on.includes(name) ? '#FFE3A1' : 'rgba(35,22,6,0.15)'} filter={on.includes(name) ? 'url(#tasbih-glow)' : undefined} />
            ))}
          </g>
        );
      })}
    </svg>
  );
};

/* ---------- Suara, getar, layar tetap menyala ---------- */

let audio: AudioContext | null = null;
function playClick(kind: 'tap' | 'reached' | 'finished') {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    audio ??= new Ctx();
    if (audio.state === 'suspended') void audio.resume();
    const t = audio.currentTime;
    const tone = (freq: number, start: number, length: number, volume: number, type: OscillatorType, endFreq?: number) => {
      const osc = audio!.createOscillator();
      const gain = audio!.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t + start);
      if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + start + length);
      gain.gain.setValueAtTime(0.0001, t + start);
      gain.gain.exponentialRampToValueAtTime(volume, t + start + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + start + length);
      osc.connect(gain).connect(audio!.destination);
      osc.start(t + start);
      osc.stop(t + start + length + 0.02);
    };
    if (kind === 'tap') {
      tone(2400, 0, 0.035, 0.09, 'square', 1100);
    } else {
      tone(880, 0, 0.35, 0.16, 'sine');
      tone(1320, 0.12, 0.45, 0.13, 'sine');
      if (kind === 'finished') tone(1760, 0.26, 0.6, 0.11, 'sine');
    }
  } catch {
    /* suara tidak tersedia */
  }
}

const canVibrate = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
function buzz(pattern: number | number[]) {
  try {
    if (canVibrate) navigator.vibrate(pattern);
  } catch {
    /* abaikan */
  }
}

function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return;
    let lock: { release: () => Promise<void> } | null = null;
    let cancelled = false;
    const request = async () => {
      try {
        const sentinel = await (navigator as unknown as { wakeLock: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } }).wakeLock.request('screen');
        if (cancelled) void sentinel.release();
        else lock = sentinel;
      } catch {
        /* ditolak browser */
      }
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') void request();
    };
    void request();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      void lock?.release().catch(() => undefined);
    };
  }, [active]);
}

/* ---------- Lembar bawah (pilih dzikir, riwayat) ---------- */

const Sheet: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => {
  useBackHandler(true, onClose, 12);
  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <motion.div className="absolute inset-0 bg-[#0B1F27]/45" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative w-full sm:max-w-md max-h-[85vh] flex flex-col bg-[#FBF8F2] dark:bg-[#152E38] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-700">
          <h2 className="flex-1 text-base font-bold text-[#173B4E] dark:text-white">{title}</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-xl text-slate-500 hover:bg-white dark:hover:bg-slate-700" aria-label="Tutup">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">{children}</div>
      </motion.div>
    </div>
  );
};

const TARGET_CHOICES = [33, 100, 1000];

const DzikirPicker: React.FC<{ state: TasbihState; onClose: () => void }> = ({ state, onClose }) => {
  const [name, setName] = useState('');
  const [target, setTarget] = useState(33);
  const singles = [...DZIKIR.filter((d) => !AFTER_PRAYER_SEQUENCE.includes(d.id) || d.target > 1), ...state.custom];
  const activeId = state.mode === 'single' ? state.dzikirId : null;
  const pick = (id: string) => {
    selectDzikir(id);
    onClose();
  };
  return (
    <Sheet title="Pilih dzikir" onClose={onClose}>
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => {
            startSequence();
            onClose();
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-2xl border ${
            state.mode === 'sequence' ? 'border-[#246579] bg-[#246579]/5' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
          }`}
        >
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-bold text-[#173B4E] dark:text-white">Dzikir setelah sholat</span>
            <span className="block text-[11px] text-[#477F8D] dark:text-[#94A3B8]">Tasbih 33 · Tahmid 33 · Takbir 33 · Tahlil 1, berpindah otomatis</span>
          </span>
          <ChevronRight className="w-4 h-4 text-[#BE9452]" />
        </button>

        <p className="pt-3 text-[11px] font-semibold uppercase tracking-wider text-[#477F8D]">Dzikir pilihan</p>
        {singles.map((d) => (
          <div
            key={d.id}
            className={`flex items-center gap-2 rounded-2xl border ${
              activeId === d.id ? 'border-[#246579] bg-[#246579]/5' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
            }`}
          >
            <button type="button" onClick={() => pick(d.id)} className="flex-1 min-w-0 flex items-center gap-3 px-4 py-3 text-left">
              <span className="flex-1 min-w-0">
                {d.arabic && (
                  <span className="block font-mushaf-id text-xl text-[#173B4E] dark:text-white text-right" dir="rtl" style={{ lineHeight: 1.9 }}>
                    {d.arabic}
                  </span>
                )}
                <span className="block text-sm font-semibold text-[#173B4E] dark:text-white">{d.latin}</span>
                {d.meaning && <span className="block text-[11px] text-[#477F8D] dark:text-[#94A3B8]">{d.meaning}</span>}
              </span>
              <span className="shrink-0 px-2 py-0.5 rounded-lg bg-[#F5D58A]/30 text-[11px] font-bold text-[#8A6420] dark:text-[#F5D58A] tabular-nums">{d.target}×</span>
            </button>
            {d.id.startsWith('custom-') && (
              <button type="button" onClick={() => removeCustomDzikir(d.id)} className="p-3 text-slate-400 hover:text-red-500" aria-label={`Hapus ${d.latin}`}>
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}

        <form
          className="mt-3 p-4 rounded-2xl border border-dashed border-[#BE9452]/60 bg-white/70 dark:bg-slate-800/60 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            addCustomDzikir(name, target);
            onClose();
          }}
        >
          <p className="text-sm font-bold text-[#173B4E] dark:text-white">Tambah dzikir sendiri</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            placeholder="Nama atau bacaan dzikir"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-[#173B4E] dark:text-white placeholder:text-slate-400"
          />
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[#477F8D]">Target</span>
            {TARGET_CHOICES.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setTarget(n)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold tabular-nums ${target === n ? 'bg-[#246579] text-white' : 'bg-[#F1EDE6] dark:bg-slate-700 text-[#246579] dark:text-[#A7CDD3]'}`}
              >
                {n}
              </button>
            ))}
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={9999}
              value={target}
              onChange={(e) => setTarget(Math.max(1, Math.min(9999, Number(e.target.value) || 1)))}
              className="w-20 px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-center tabular-nums text-[#173B4E] dark:text-white"
              aria-label="Target hitungan"
            />
          </div>
          <button type="submit" disabled={!name.trim()} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#246579] disabled:opacity-40 text-white text-sm font-bold">
            <Plus className="w-4 h-4" /> Tambah & mulai
          </button>
        </form>
      </div>
    </Sheet>
  );
};

const HistorySheet: React.FC<{ state: TasbihState; onClose: () => void }> = ({ state, onClose }) => {
  const log = readLog();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d;
  });
  const totals = days.map((d) => Object.values(log[dayKey(d)] ?? {}).reduce((a, b) => a + b, 0));
  const max = Math.max(1, ...totals);
  return (
    <Sheet title="Riwayat dzikir" onClose={onClose}>
      <ul className="space-y-3">
        {days.map((d, i) => {
          const entries = Object.entries(log[dayKey(d)] ?? {}).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
          return (
            <li key={i} className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-[#173B4E] dark:text-white">
                  {i === 0 ? 'Hari ini' : i === 1 ? 'Kemarin' : d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                </span>
                <span className="text-sm font-bold tabular-nums text-[#246579] dark:text-[#A7CDD3]">{totals[i].toLocaleString('id-ID')}</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-[#F1EDE6] dark:bg-slate-700 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#C9A24A] to-[#F5D58A]" style={{ width: `${(totals[i] / max) * 100}%` }} />
              </div>
              {entries.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {entries.map(([id, n]) => (
                    <span key={id} className="px-2 py-0.5 rounded-lg bg-[#F8F6F1] dark:bg-slate-700/60 text-[11px] text-[#477F8D] dark:text-[#CBD5E1]">
                      {findDzikir(id, state).latin} · <b className="tabular-nums">{n}</b>
                    </span>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Sheet>
  );
};

/* ---------- Layar utama ---------- */

const ProgressRing: React.FC<{ value: number; max: number }> = ({ value, max }) => {
  const r = 20;
  const c = 2 * Math.PI * r;
  const ratio = Math.min(1, value / Math.max(1, max));
  return (
    <svg viewBox="0 0 48 48" className="w-11 h-11 -rotate-90" aria-hidden="true">
      <circle cx="24" cy="24" r={r} fill="none" strokeWidth="5" className="stroke-[#EFE7D8] dark:stroke-slate-700" />
      <circle cx="24" cy="24" r={r} fill="none" strokeWidth="5" stroke="#C9A24A" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - ratio)} style={{ transition: 'stroke-dashoffset 0.25s ease' }} />
    </svg>
  );
};

/** Nama singkat tiap bacaan dzikir setelah sholat. */
const SEQUENCE_LABELS = ['Tasbih', 'Tahmid', 'Takbir', 'Tahlil'];

const PATTERN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Cg fill='none' stroke='%23BE9452' stroke-opacity='0.13' stroke-width='1'%3E%3Cpath d='M28 4l7 17 17 7-17 7-7 17-7-17-17-7 17-7z'/%3E%3Crect x='17' y='17' width='22' height='22' transform='rotate(45 28 28)'/%3E%3C/g%3E%3C/svg%3E\")";

export const TasbihView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const state = useTasbih();
  const [pressed, setPressed] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [virtueOpen, setVirtueOpen] = useState(false);
  const [undo, setUndo] = useState<TasbihState | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const undoTimer = useRef<number | undefined>(undefined);
  const flashTimer = useRef<number | undefined>(undefined);
  const finishRef = useRef<HTMLDivElement>(null);

  useBackHandler(true, onClose, 10);
  useWakeLock(state.keepAwake);

  const dzikir = currentDzikir(state);
  const target = Math.max(1, dzikir.target);
  const sheetOpen = pickerOpen || historyOpen;

  const count = useCallback(() => {
    const before = currentDzikir(state);
    const result = tap();
    if (state.mode === 'sequence' && state.done) return;
    if (result.finished) {
      if (state.vibrate) buzz([90, 70, 90, 70, 220]);
      if (state.sound) playClick('finished');
    } else if (result.reached) {
      if (state.vibrate) buzz([60, 60, 60]);
      if (state.sound) playClick('reached');
      if (state.mode === 'sequence') {
        window.clearTimeout(flashTimer.current);
        setFlash(`${before.latin} ${before.target}× selesai`);
        flashTimer.current = window.setTimeout(() => setFlash(null), 1600);
      }
    } else {
      if (state.vibrate) buzz(12);
      if (state.sound) playClick('tap');
    }
  }, [state]);

  const doReset = () => {
    const before = resetCount();
    setUndo(before);
    window.clearTimeout(undoTimer.current);
    undoTimer.current = window.setTimeout(() => setUndo(null), 5000);
  };

  // Kartu "selesai" bisa berada di bawah layar: gulir agar terlihat.
  const finished = state.mode === 'sequence' && state.done;
  useEffect(() => {
    if (finished) window.setTimeout(() => finishRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 150);
  }, [finished]);

  useEffect(() => () => {
    window.clearTimeout(undoTimer.current);
    window.clearTimeout(flashTimer.current);
  }, []);

  // Spasi / Enter juga menghitung (keyboard, remote, clicker Bluetooth).
  useEffect(() => {
    if (sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && ['INPUT', 'TEXTAREA', 'BUTTON', 'A', 'SELECT'].includes(el.tagName)) return;
      if (e.repeat) return;
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowUp' || e.key === 'AudioVolumeUp') {
        e.preventDefault();
        count();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [count, sheetOpen]);

  const longArabic = dzikir.arabic.length > 40;
  const today = todayCount(dzikir.id);

  const toggle = (on: boolean, label: string, Icon: React.ElementType, OffIcon: React.ElementType, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      aria-label={label}
      title={label}
      className={`w-10 h-10 rounded-full flex items-center justify-center ${
        on ? 'bg-[#246579] text-[#F5D58A]' : 'bg-white/80 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
      }`}
    >
      {on ? <Icon className="w-[18px] h-[18px]" /> : <OffIcon className="w-[18px] h-[18px]" />}
    </button>
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[65] flex flex-col bg-[#F7F4EF] dark:bg-[#0D202A] text-[#293640] dark:text-[#E2E8F0] select-none"
      style={{ backgroundImage: PATTERN }}
      role="dialog"
      aria-modal="true"
      aria-label="Tasbih digital"
    >
      {/* Kepala */}
      <header className="shrink-0 flex items-center gap-2 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 max-w-xl w-full mx-auto">
        <button type="button" onClick={onClose} className="p-2 rounded-xl text-[#246579] dark:text-[#A7CDD3] hover:bg-white/70 dark:hover:bg-slate-800" aria-label="Kembali">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="flex-1 text-lg font-bold text-[#173B4E] dark:text-white">Tasbih</h1>
        {canVibrate && toggle(state.vibrate, state.vibrate ? 'Getar aktif' : 'Getar mati', Vibrate, Vibrate, () => setTasbihOption({ vibrate: !state.vibrate }))}
        {toggle(state.sound, state.sound ? 'Suara klik aktif' : 'Suara klik mati', Volume2, VolumeX, () => setTasbihOption({ sound: !state.sound }))}
        {'wakeLock' in navigator && toggle(state.keepAwake, state.keepAwake ? 'Layar tetap menyala' : 'Layar boleh mati', Sun, Sun, () => setTasbihOption({ keepAwake: !state.keepAwake }))}
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="max-w-xl mx-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] flex flex-col items-center gap-4">
          {/* Kartu dzikir */}
          <section className="w-full bg-white/95 dark:bg-slate-800/95 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-[0_10px_30px_rgba(23,59,78,0.08)] p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#BE9452]">
                {state.mode === 'sequence' ? `Dzikir setelah sholat · ${Math.min(state.step + 1, AFTER_PRAYER_SEQUENCE.length)}/${AFTER_PRAYER_SEQUENCE.length}` : 'Dzikir pilihan'}
              </span>
              {dzikir.virtue && (
                <button
                  type="button"
                  onClick={() => setVirtueOpen((v) => !v)}
                  aria-expanded={virtueOpen}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#246579] dark:text-[#A7CDD3]"
                >
                  <Info className="w-3.5 h-3.5" /> Keutamaan
                </button>
              )}
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={dzikir.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                {dzikir.arabic && (
                  <p dir="rtl" className={`font-mushaf-id text-center text-[#173B4E] dark:text-white mt-1 ${longArabic ? 'text-[1.35rem]' : 'text-[2.1rem]'}`} style={{ lineHeight: longArabic ? 2 : 1.8 }}>
                    {dzikir.arabic}
                  </p>
                )}
                <p className={`text-center font-semibold text-[#246579] dark:text-[#A7CDD3] ${dzikir.arabic ? 'text-sm' : 'text-xl mt-2'}`}>{dzikir.latin}</p>
                {dzikir.meaning && <p className="text-center text-xs text-[#477F8D] dark:text-[#94A3B8] mt-0.5">{dzikir.meaning}</p>}
              </motion.div>
            </AnimatePresence>
            <AnimatePresence>
              {virtueOpen && dzikir.virtue && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <p className="mt-3 text-xs leading-relaxed text-[#293640] dark:text-slate-200 bg-[#FBF6EA] dark:bg-slate-900/60 rounded-2xl p-3 border border-[#F5D58A]/50">
                    {dzikir.virtue.text}{' '}
                    <a href={dzikir.virtue.url} target="_blank" rel="noreferrer" className="font-semibold text-[#246579] dark:text-[#A7CDD3] underline">
                      ({dzikir.virtue.source})
                    </a>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {state.mode === 'sequence' && (
              <div className="mt-3 grid grid-cols-4 gap-1.5" aria-hidden="true">
                {AFTER_PRAYER_SEQUENCE.map((id, i) => {
                  const d = findDzikir(id, state);
                  const label = SEQUENCE_LABELS[i] ?? d.latin;
                  const doneStep = state.done || i < state.step;
                  const active = !state.done && i === state.step;
                  return (
                    <div key={id} className="text-center">
                      <div className={`h-1.5 rounded-full ${doneStep ? 'bg-[#C9A24A]' : active ? 'bg-[#246579]' : 'bg-[#EFE7D8] dark:bg-slate-700'}`} />
                      <span className={`block mt-1 text-[10px] leading-tight ${active ? 'font-bold text-[#246579] dark:text-[#A7CDD3]' : 'text-slate-400'}`}>
                        {label} {d.target}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-3 flex items-center gap-3">
              <ProgressRing value={state.count} max={target} />
              <div className="flex-1 min-w-0">
                <p className="text-xl font-bold tabular-nums text-[#173B4E] dark:text-white leading-none">
                  {state.count}
                  <span className="text-sm font-semibold text-slate-400"> / {target}</span>
                </p>
                <p className="mt-1 text-[11px] text-[#477F8D] dark:text-[#94A3B8] tabular-nums">
                  {state.mode === 'single' && <span className="block">Putaran {state.round}</span>}
                  <span className="block">Hari ini {today.toLocaleString('id-ID')}</span>
                </p>
              </div>
              <button type="button" onClick={() => setHistoryOpen(true)} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#F1F6F7] dark:bg-slate-700 text-xs font-semibold text-[#246579] dark:text-[#A7CDD3]">
                <History className="w-4 h-4" /> Riwayat
              </button>
              <button type="button" onClick={() => setPickerOpen(true)} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#F1F6F7] dark:bg-slate-700 text-xs font-semibold text-[#246579] dark:text-[#A7CDD3]">
                <BookOpenText className="w-4 h-4" /> Ganti
              </button>
            </div>
          </section>

          {/* Alat tasbih */}
          <div className="relative" style={{ width: 'min(76vw, 310px, calc((100dvh - 330px) * 0.79))', minWidth: 210 }}>
            <div
              className="relative w-full touch-manipulation cursor-pointer drop-shadow-[0_22px_30px_rgba(23,59,78,0.30)]"
              style={{ aspectRatio: '640 / 810', WebkitTapHighlightColor: 'transparent' }}
              onPointerDown={(e) => {
                if (e.button !== 0 || sheetOpen) return;
                setPressed(true);
                count();
              }}
              onPointerUp={() => setPressed(false)}
              onPointerLeave={() => setPressed(false)}
              onPointerCancel={() => setPressed(false)}
              onContextMenu={(e) => e.preventDefault()}
              role="button"
              tabIndex={0}
              aria-label={`Hitung ${dzikir.latin}. Sekarang ${state.count} dari ${target}`}
            >
              <img src={assetUrl('/assets/tasbih/body.webp')} alt="" draggable={false} className="absolute inset-0 w-full h-full pointer-events-none" />
              {/* Layar angka */}
              <div className="absolute pointer-events-none flex items-center justify-center" style={{ left: '19.6%', top: '20.5%', width: '60.8%', height: '19%', padding: '3.2% 5.5%' }}>
                <motion.div className="w-full h-full" animate={{ opacity: pressed ? 0.88 : 1 }} transition={{ duration: 0.05 }}>
                  <SevenSegment value={state.count} />
                </motion.div>
              </div>
              {/* Tombol utama */}
              <img
                src={assetUrl(pressed ? '/assets/tasbih/button-pressed.webp' : '/assets/tasbih/button.webp')}
                alt=""
                draggable={false}
                className="absolute pointer-events-none"
                style={{ left: '49.9%', top: '69.5%', width: pressed ? '32.2%' : '34.2%', transform: 'translate(-50%, -50%)' }}
              />
              {/* Tombol ulang */}
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  doReset();
                }}
                className="absolute rounded-full active:scale-90 transition-transform"
                style={{ left: '77.1%', top: '55.4%', width: '15%', aspectRatio: '1', transform: 'translate(-50%, -50%)' }}
                aria-label="Ulang hitungan dari nol"
              >
                <img src={assetUrl('/assets/tasbih/reset.webp')} alt="" draggable={false} className="absolute left-1/2 top-1/2 w-[77%] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                <RotateCcw className="absolute left-1/2 top-1/2 w-[36%] h-[36%] -translate-x-1/2 -translate-y-1/2 text-[#6B4A16]/70" strokeWidth={2.6} />
              </button>
            </div>

            <AnimatePresence>
              {flash && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute left-1/2 -translate-x-1/2 -top-3 whitespace-nowrap px-3 py-1.5 rounded-full bg-[#246579] text-white text-xs font-semibold shadow-lg pointer-events-none"
                >
                  <CheckCircle2 className="inline w-3.5 h-3.5 mr-1 -mt-0.5 text-[#F5D58A]" />
                  {flash}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {finished ? (
            <motion.div ref={finishRef} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full rounded-3xl bg-[#246579] text-white p-4 text-center shadow-lg">
              <p className="font-bold">Alhamdulillah, dzikir setelah sholat selesai</p>
              <p className="text-xs text-white/80 mt-0.5">33 tasbih, 33 tahmid, 33 takbir, dan tahlil: genap 100.</p>
              <div className="mt-3 flex gap-2 justify-center">
                <button type="button" onClick={startSequence} className="px-4 py-2 rounded-xl bg-[#F5D58A] text-[#173B4E] text-sm font-bold">
                  Ulangi
                </button>
                <button type="button" onClick={() => setPickerOpen(true)} className="px-4 py-2 rounded-xl bg-white/15 text-sm font-semibold">
                  Dzikir lain
                </button>
              </div>
            </motion.div>
          ) : (
            <p className="text-[11px] text-center text-[#477F8D] dark:text-[#94A3B8]">Ketuk alat tasbih untuk menghitung · tombol kecil untuk mengulang dari nol</p>
          )}
        </div>
      </main>

      <AnimatePresence>
        {undo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed left-1/2 -translate-x-1/2 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-[66] flex items-center gap-3 pl-4 pr-2 py-2 rounded-2xl bg-[#173B4E] text-white shadow-xl"
          >
            <span className="text-sm">Hitungan diulang dari nol</span>
            <button
              type="button"
              onClick={() => {
                restore(undo);
                setUndo(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#F5D58A] text-[#173B4E] text-xs font-bold"
            >
              Batalkan
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {pickerOpen && <DzikirPicker state={state} onClose={() => setPickerOpen(false)} />}
      {historyOpen && <HistorySheet state={state} onClose={() => setHistoryOpen(false)} />}
    </div>,
    document.body
  );
};
