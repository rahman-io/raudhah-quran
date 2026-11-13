import React, { useEffect, useMemo, useRef, useState } from 'react';
import { EyeOff, Highlighter, Palette, RotateCcw, Undo2 } from 'lucide-react';
import { useQuranGame } from '../../../context/QuranGameContext';
import { arabicSkeleton } from '../../../services/arabicSkeleton';
import { alignRecitationTail, expectedSkeletons, type WordStatus } from '../../../services/recitation/recitationAlign';
import { MicButton, useRecitation } from '../../hafalan/stages/reciteShared';

/**
 * Mode Hafalan di Mode Mushaf (seperti "Hidden Verses" di Tarteel).
 * Teks halaman disembunyikan tanpa menggeser tata letak (garis & nomor ayat tetap di tempatnya).
 * Pengguna membaca, kata muncul di posisi aslinya saat terbaca. Halaman yang selesai dibaca
 * langsung berganti ke halaman berikutnya.
 *
 * Pencocokan per "jendela" ±30 kata dari posisi baca (sama seperti Tantangan Surah); kata yang
 * sudah jauh terlewati dikunci nilainya.
 */

export interface PageWord {
  surah: number;
  ayah: number;
  /** Urutan kata di ayat (0-based, sesuai teks Kemenag). */
  index: number;
  text: string;
}

/** Tampilan satu kata di Mode Hafalan. */
export type HifzWordState = 'hidden' | 'current' | 'ok' | 'missed' | 'shown';

export const hifzKey = (surah: number, ayah: number, index: number) => `${surah}:${ayah}:${index}`;

const WINDOW_WORDS = 30;
const COMMIT_LAG = 2;
const PAGE_TURN_DELAY_MS = 700;
const PREFS_KEY = 'raudhah_mushaf_hifz_v1';

interface HifzPrefs {
  showMistakes: boolean;
  tajwid: boolean;
}
const readPrefs = (): HifzPrefs => {
  try {
    const value = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') as Partial<HifzPrefs>;
    return { showMistakes: value.showMistakes ?? true, tajwid: value.tajwid ?? true };
  } catch {
    return { showMistakes: true, tajwid: true };
  }
};

export function useMushafHifz({ active, words, onPageDone }: { active: boolean; words: PageWord[]; onPageDone: () => void }) {
  const { addXP } = useQuranGame();
  const rec = useRecitation();
  const [prefs, setPrefsState] = useState<HifzPrefs>(readPrefs);
  const setPrefs = (patch: Partial<HifzPrefs>) =>
    setPrefsState((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      } catch {
        // abaikan
      }
      return next;
    });

  const [start, setStart] = useState(0);
  const [pointer, setPointer] = useState(0);
  const [final, setFinal] = useState<WordStatus[]>([]);
  const [pageDone, setPageDone] = useState(false);
  const onPageDoneRef = useRef(onPageDone);
  onPageDoneRef.current = onPageDone;

  // Halaman (atau pasangan halaman) berganti: mulai dari atas. Bacaan tetap didengarkan.
  const pageKey = words.length ? `${hifzKey(words[0].surah, words[0].ayah, words[0].index)}|${words.length}` : '';
  useEffect(() => {
    setStart(0);
    setPointer(0);
    setFinal([]);
    setPageDone(false);
  }, [pageKey]);

  // Masuk Mode Hafalan: langsung mendengarkan. Keluar: berhenti dan lupakan bacaan.
  useEffect(() => {
    if (active) {
      rec.start();
      return;
    }
    rec.stop();
    rec.reset();
    setStart(0);
    setPointer(0);
    setFinal([]);
    setPageDone(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const indexOf = useMemo(() => new Map(words.map((w, i) => [hifzKey(w.surah, w.ayah, w.index), i])), [words]);
  const windowWords = useMemo(() => words.slice(pointer, pointer + WINDOW_WORDS), [words, pointer]);
  const variants = useMemo(
    () => expectedSkeletons(windowWords.map((w) => w.text), windowWords[0]?.ayah === 1 && windowWords[0]?.index === 0),
    [windowWords]
  );
  const tailLetters = useMemo(
    () => Math.ceil(windowWords.reduce((sum, w) => sum + arabicSkeleton(w.text).length, 0) * 1.5) + 30,
    [windowWords]
  );
  const running = active && !pageDone && words.length > 0;
  const live = useMemo(
    () => (running ? alignRecitationTail(variants, rec.transcript, tailLetters) : { status: [] as WordStatus[], next: 0 }),
    [running, variants, rec.transcript, tailLetters]
  );
  const frontier = pointer + live.next;

  const statusAt = (i: number): WordStatus => (i < pointer ? final[i] ?? 'missed' : live.status[i - pointer] ?? 'pending');

  // Kunci nilai kata yang sudah terlewati; halaman selesai → halaman berikutnya.
  useEffect(() => {
    if (!running) return;
    if (frontier >= words.length) {
      const result = words.map((_, i) => (statusAt(i) === 'ok' ? 'ok' : i < start ? 'ok' : 'missed')) as WordStatus[];
      setFinal(result);
      setPointer(words.length);
      setPageDone(true);
      const evaluated = result.slice(start);
      const ratio = evaluated.filter((s) => s === 'ok').length / Math.max(1, evaluated.length);
      if (ratio >= 0.9) addXP(5, 'Hafalan mushaf');
      return;
    }
    const commit = live.next - COMMIT_LAG;
    if (commit > 0) {
      setFinal((prev) => {
        const next = [...prev];
        for (let k = 0; k < commit; k += 1) next[pointer + k] = live.status[k] === 'ok' ? 'ok' : 'missed';
        return next;
      });
      setPointer(pointer + commit);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, running]);

  useEffect(() => {
    if (!pageDone || !active) return;
    const timer = setTimeout(() => onPageDoneRef.current(), PAGE_TURN_DELAY_MS);
    return () => clearTimeout(timer);
  }, [pageDone, active]);

  const stateOf = (surah: number, ayah: number, index: number): HifzWordState => {
    const i = indexOf.get(hifzKey(surah, ayah, index));
    if (i === undefined) return 'hidden';
    if (i < start) return 'shown';
    const status = statusAt(i);
    if (status === 'ok') return 'ok';
    if (status === 'missed') return 'missed';
    return i === frontier && rec.listening ? 'current' : 'hidden';
  };

  /** Mulai membaca dari ayat yang diketuk (kata sebelumnya ditampilkan sebagai patokan). */
  const startAt = (surah: number, ayah: number) => {
    const i = words.findIndex((w) => w.surah === surah && w.ayah === ayah);
    if (i < 0) return;
    setStart(i);
    setPointer(i);
    setFinal([]);
    setPageDone(false);
    rec.reset();
    if (!rec.listening) rec.start();
  };

  /** Sembunyikan lagi kata terakhir yang muncul, untuk diulang. */
  const undo = () => {
    const target = Math.max(start, frontier - 1);
    const next: WordStatus[] = [];
    for (let i = 0; i < target; i += 1) next[i] = statusAt(i) === 'ok' ? 'ok' : 'missed';
    setFinal(next);
    setPointer(target);
    setPageDone(false);
    rec.reset();
  };

  const restartPage = () => {
    setPointer(start);
    setFinal([]);
    setPageDone(false);
    rec.reset();
  };

  let ok = 0;
  let missed = 0;
  for (let i = start; i < Math.min(words.length, frontier); i += 1) {
    if (statusAt(i) === 'ok') ok += 1;
    else missed += 1;
  }

  return {
    prefs,
    setPrefs,
    stateOf,
    startAt,
    undo,
    restartPage,
    frontierKey: words[frontier] ? hifzKey(words[frontier].surah, words[frontier].ayah, words[frontier].index) : null,
    ok,
    missed,
    started: frontier > start,
    rec
  };
}

export type MushafHifz = ReturnType<typeof useMushafHifz>;

/** Bilah bawah Mode Hafalan: kesalahan & ketepatan halaman, mundur, ulang, tanda kesalahan, warna tajwid, mikrofon. */
export const MushafHifzBar: React.FC<{ hifz: MushafHifz; immersive: boolean; onExit: () => void }> = ({ hifz, immersive, onExit }) => {
  const { rec, prefs, setPrefs } = hifz;
  const percent = hifz.ok + hifz.missed ? Math.round((hifz.ok / (hifz.ok + hifz.missed)) * 100) : 100;
  const icon = (label: string, Icon: React.ElementType, onClick: () => void, on?: boolean) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={on}
      title={label}
      className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-colors ${
        on === undefined
          ? 'bg-[#F1EDE6] dark:bg-slate-700 text-[#246579] dark:text-[#A7CDD3] hover:bg-[#E8E1D6]'
          : on
            ? 'bg-[#246579] text-white'
            : 'bg-[#F1EDE6] dark:bg-slate-700 text-slate-400 dark:text-slate-500'
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
  return (
    <div
      className={`fixed inset-x-3 sm:inset-x-6 z-40 mx-auto max-w-xl ${
        immersive ? 'bottom-[max(0.75rem,env(safe-area-inset-bottom))]' : 'bottom-[calc(5.25rem+env(safe-area-inset-bottom))] lg:bottom-6'
      }`}
      role="region"
      aria-label="Mode Hafalan"
    >
      {(() => {
        const hint = rec.error ?? (!rec.listening ? 'Dijeda. Ketuk mikrofon untuk lanjut.' : hifz.started ? '' : 'Baca dari awal halaman, atau ketuk ayat untuk mulai dari situ.');
        return (
          <p className="mb-1.5 text-center" aria-live="polite">
            {hint && (
              <span
                className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-white/95 dark:bg-slate-800/95 shadow-sm ${
                  rec.error ? 'text-amber-700 dark:text-amber-300' : 'text-[#246579] dark:text-[#A7CDD3]'
                }`}
              >
                {hint}
              </span>
            )}
          </p>
        );
      })()}
      <div className="flex items-center gap-2 p-2 pl-3 rounded-[28px] bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-[0_8px_24px_rgba(23,59,78,0.16)]">
        <div className="flex flex-col items-start leading-tight shrink-0 min-w-[3.5rem]">
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">✗ {hifz.missed}</span>
          <span className="text-[11px] font-semibold text-[#477F8D]">{percent}%</span>
        </div>
        <div className="flex-1 flex items-center justify-center gap-1.5 overflow-x-auto">
          {icon('Mundur 1 kata', Undo2, hifz.undo)}
          {icon('Ulang halaman', RotateCcw, hifz.restartPage)}
          {icon('Tandai kesalahan', Highlighter, () => setPrefs({ showMistakes: !prefs.showMistakes }), prefs.showMistakes)}
          {icon('Warna tajwid', Palette, () => setPrefs({ tajwid: !prefs.tajwid }), prefs.tajwid)}
          {icon('Keluar Mode Hafalan', EyeOff, onExit)}
        </div>
        <MicButton
          listening={rec.listening}
          onClick={() => {
            if (rec.listening) rec.stop();
            else rec.start();
          }}
        />
      </div>
    </div>
  );
};
