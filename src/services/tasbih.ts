import { useEffect, useState } from 'react';
import { AFTER_PRAYER_SEQUENCE, DZIKIR, type Dzikir } from '../data/dzikir';

/**
 * Tasbih digital: hitungan, pilihan dzikir, dan riwayat harian.
 * Semua disimpan di perangkat (localStorage), jadi hitungan tidak hilang saat aplikasi ditutup.
 */

export interface TasbihState {
  /** 'sequence' = dzikir setelah sholat (33-33-33-1), 'single' = satu dzikir berulang. */
  mode: 'sequence' | 'single';
  dzikirId: string;
  /** Urutan ke berapa dalam dzikir setelah sholat. */
  step: number;
  count: number;
  round: number;
  /** Dzikir setelah sholat sudah lengkap. */
  done: boolean;
  vibrate: boolean;
  sound: boolean;
  keepAwake: boolean;
  custom: Dzikir[];
}

const KEY = 'raudhah_tasbih_v1';
const LOG_KEY = 'raudhah_tasbih_log_v1';
const LOG_DAYS = 30;

const DEFAULT: TasbihState = {
  mode: 'sequence',
  dzikirId: AFTER_PRAYER_SEQUENCE[0],
  step: 0,
  count: 0,
  round: 0,
  done: false,
  vibrate: true,
  sound: true,
  keepAwake: true,
  custom: []
};

const listeners = new Set<() => void>();

function read(): TasbihState {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || 'null') as Partial<TasbihState> | null;
    if (value && typeof value === 'object') return { ...DEFAULT, ...value, custom: Array.isArray(value.custom) ? value.custom : [] };
  } catch {
    /* penyimpanan tidak tersedia */
  }
  return DEFAULT;
}

let state: TasbihState = read();

function save(next: TasbihState) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* abaikan */
  }
  listeners.forEach((fn) => fn());
}

export function useTasbih(): TasbihState {
  const [value, setValue] = useState(state);
  useEffect(() => {
    const update = () => setValue(state);
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);
  return value;
}

export const allDzikir = (s: TasbihState = state) => [...DZIKIR, ...s.custom];

export function findDzikir(id: string, s: TasbihState = state): Dzikir {
  return allDzikir(s).find((d) => d.id === id) ?? DZIKIR[0];
}

/** Dzikir yang sedang dihitung. */
export function currentDzikir(s: TasbihState): Dzikir {
  return findDzikir(s.mode === 'sequence' ? AFTER_PRAYER_SEQUENCE[Math.min(s.step, AFTER_PRAYER_SEQUENCE.length - 1)] : s.dzikirId, s);
}

/* ---------- Riwayat harian ---------- */

export type TasbihLog = Record<string, Record<string, number>>;

export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function readLog(): TasbihLog {
  try {
    const value = JSON.parse(localStorage.getItem(LOG_KEY) || '{}') as TasbihLog;
    return value && typeof value === 'object' ? value : {};
  } catch {
    return {};
  }
}

function addToLog(dzikirId: string, amount: number) {
  const log = readLog();
  const today = dayKey();
  const day = { ...(log[today] ?? {}) };
  day[dzikirId] = Math.max(0, (day[dzikirId] ?? 0) + amount);
  log[today] = day;
  const keep = Object.keys(log).sort().slice(-LOG_DAYS);
  const trimmed: TasbihLog = {};
  keep.forEach((k) => {
    trimmed[k] = log[k];
  });
  try {
    localStorage.setItem(LOG_KEY, JSON.stringify(trimmed));
  } catch {
    /* abaikan */
  }
}

export const todayCount = (dzikirId: string) => readLog()[dayKey()]?.[dzikirId] ?? 0;

/* ---------- Aksi ---------- */

export interface TapResult {
  /** Satu putaran / satu bacaan dalam urutan tercapai. */
  reached: boolean;
  /** Seluruh dzikir setelah sholat selesai. */
  finished: boolean;
}

export function tap(): TapResult {
  const s = state;
  if (s.mode === 'sequence' && s.done) return { reached: false, finished: false };
  const dzikir = currentDzikir(s);
  const target = Math.max(1, dzikir.target);
  addToLog(dzikir.id, 1);
  if (s.mode === 'sequence') {
    const count = s.count + 1;
    if (count < target) {
      save({ ...s, count });
      return { reached: false, finished: false };
    }
    const last = s.step >= AFTER_PRAYER_SEQUENCE.length - 1;
    if (last) {
      save({ ...s, count, done: true, round: s.round + 1 });
      return { reached: true, finished: true };
    }
    save({ ...s, count: 0, step: s.step + 1 });
    return { reached: true, finished: false };
  }
  const count = s.count >= target ? 1 : s.count + 1;
  const reached = count === target;
  save({ ...s, count, round: reached ? s.round + 1 : s.round });
  return { reached, finished: false };
}

/** Kembalikan hitungan ke nol. Mengembalikan keadaan sebelumnya untuk "Batalkan". */
export function resetCount(): TasbihState {
  const before = state;
  save({ ...state, count: 0, round: 0, step: 0, done: false });
  return before;
}

export function restore(snapshot: TasbihState) {
  save({ ...snapshot, vibrate: state.vibrate, sound: state.sound, keepAwake: state.keepAwake, custom: state.custom });
}

export function startSequence() {
  save({ ...state, mode: 'sequence', step: 0, count: 0, round: 0, done: false });
}

export function selectDzikir(id: string) {
  save({ ...state, mode: 'single', dzikirId: id, count: 0, round: 0, done: false });
}

export function setTasbihOption(patch: Partial<Pick<TasbihState, 'vibrate' | 'sound' | 'keepAwake'>>) {
  save({ ...state, ...patch });
}

export function addCustomDzikir(name: string, target: number): string {
  const id = `custom-${Date.now()}`;
  const dzikir: Dzikir = { id, arabic: '', latin: name.trim(), meaning: '', target: Math.max(1, Math.min(9999, Math.round(target))) };
  save({ ...state, custom: [...state.custom, dzikir], mode: 'single', dzikirId: id, count: 0, round: 0, done: false });
  return id;
}

export function removeCustomDzikir(id: string) {
  const custom = state.custom.filter((d) => d.id !== id);
  const switchAway = state.mode === 'single' && state.dzikirId === id;
  save({ ...state, custom, ...(switchAway ? { mode: 'sequence' as const, step: 0, count: 0, round: 0, done: false } : {}) });
}
