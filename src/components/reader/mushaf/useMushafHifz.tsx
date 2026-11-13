import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronsLeft, Highlighter, Palette, Play, RotateCcw, X } from 'lucide-react';
import { useQuranGame } from '../../../context/QuranGameContext';
import { useBackHandler } from '../../../utils/backNavigation';
import { arabicSkeleton } from '../../../services/arabicSkeleton';
import { alignRecitationTail, expectedSkeletons, type WordStatus } from '../../../services/recitation/recitationAlign';
import { MicButton, useRecitation } from '../../hafalan/stages/reciteShared';

/**
 * Setor Hafalan di Mode Mushaf (seperti "Hidden Verses" di Tarteel).
 * Teks halaman disembunyikan tanpa menggeser tata letak (garis & nomor ayat tetap di tempatnya).
 * Pengguna menekan rekam saat siap dan membaca; kata muncul di posisi aslinya saat terbaca.
 * Halaman yang selesai dibaca langsung berganti ke halaman berikutnya.
 *
 * - "Kata berikutnya" / "Ayat berikutnya": munculkan kata/sisa ayat sebagai bantuan (dicatat "dibantu").
 * - Saat rekaman dihentikan, bacaan langsung dinilai: per ayat yang sudah dibaca, termasuk ayat
 *   yang baru dibaca sebagian.
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

/** Tampilan satu kata di Setor Hafalan. */
export type HifzWordState = 'hidden' | 'current' | 'ok' | 'missed' | 'hint' | 'shown';
type Graded = 'ok' | 'missed' | 'hint';

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

interface LogEntry {
  surah: number;
  ayah: number;
  status: Graded;
}

export interface HifzReportRow {
  surah: number;
  ayah: number;
  ok: number;
  missed: number;
  hint: number;
  read: number;
  /** Jumlah kata ayat ini (untuk tahu bila baru dibaca sebagian). */
  total: number;
}

export function useMushafHifz({
  active,
  words,
  onPageDone,
  ayahWordCount
}: {
  active: boolean;
  words: PageWord[];
  onPageDone: () => void;
  ayahWordCount: (surah: number, ayah: number) => number;
}) {
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
  const [final, setFinal] = useState<Graded[]>([]);
  const [pageDone, setPageDone] = useState(false);
  /** Hasil halaman-halaman sebelumnya dalam satu setoran. */
  const [log, setLog] = useState<LogEntry[]>([]);
  const [report, setReport] = useState<HifzReportRow[] | null>(null);
  const onPageDoneRef = useRef(onPageDone);
  onPageDoneRef.current = onPageDone;

  const resetPage = () => {
    setStart(0);
    setPointer(0);
    setFinal([]);
    setPageDone(false);
  };

  // Halaman (atau pasangan halaman) berganti: mulai dari atas. Bacaan tetap didengarkan.
  const pageKey = words.length ? `${hifzKey(words[0].surah, words[0].ayah, words[0].index)}|${words.length}` : '';
  useEffect(resetPage, [pageKey]);

  // Masuk Setor Hafalan: belum merekam (pengguna menekan rekam sendiri). Keluar: berhenti & lupakan.
  useEffect(() => {
    if (active) return;
    rec.stop();
    rec.reset();
    resetPage();
    setLog([]);
    setReport(null);
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

  const gradedAt = (i: number): Graded | 'pending' => {
    if (i < pointer) return final[i] ?? 'missed';
    const s = live.status[i - pointer];
    return s === 'ok' ? 'ok' : s === 'missed' ? 'missed' : 'pending';
  };
  /** Nilai kata-kata halaman ini dari `start` sampai sebelum `end`. */
  const pageEntries = (end: number): LogEntry[] =>
    words.slice(start, end).map((w, k) => {
      const g = gradedAt(start + k);
      return { surah: w.surah, ayah: w.ayah, status: g === 'pending' ? 'missed' : g };
    });

  // Kunci nilai kata yang sudah terlewati; halaman selesai → catat & halaman berikutnya.
  useEffect(() => {
    if (!running) return;
    if (frontier >= words.length) {
      const entries = pageEntries(words.length);
      const next: Graded[] = words.map((_, i) => {
        const g = gradedAt(i);
        return g === 'pending' ? 'missed' : g;
      });
      setFinal(next);
      setPointer(words.length);
      setPageDone(true);
      setLog((prev) => [...prev, ...entries]);
      const ratio = entries.filter((e) => e.status === 'ok').length / Math.max(1, entries.length);
      if (ratio >= 0.9) addXP(5, 'Setor hafalan');
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

  /* ----- Penilaian otomatis saat rekaman dihentikan ----- */
  const buildReport = (): HifzReportRow[] => {
    const entries = [...log, ...(pageDone ? [] : pageEntries(Math.min(frontier, words.length)))];
    const rows: HifzReportRow[] = [];
    entries.forEach((e) => {
      let row = rows[rows.length - 1];
      if (!row || row.surah !== e.surah || row.ayah !== e.ayah) {
        row = { surah: e.surah, ayah: e.ayah, ok: 0, missed: 0, hint: 0, read: 0, total: ayahWordCount(e.surah, e.ayah) };
        rows.push(row);
      }
      row[e.status] += 1;
      row.read += 1;
    });
    return rows;
  };
  const wasListening = useRef(false);
  useEffect(() => {
    if (wasListening.current && !rec.listening && active) {
      const rows = buildReport();
      if (rows.length) setReport(rows);
    }
    wasListening.current = rec.listening;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rec.listening]);
  const closeReport = () => setReport(null);
  useBackHandler(report !== null, closeReport, 12);

  const stateOf = (surah: number, ayah: number, index: number): HifzWordState => {
    const i = indexOf.get(hifzKey(surah, ayah, index));
    if (i === undefined) return 'hidden';
    if (i < start) return 'shown';
    const g = gradedAt(i);
    if (g !== 'pending') return g;
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
    setLog([]);
    rec.reset();
  };

  /** Munculkan kata (atau sisa ayat) berikutnya sebagai bantuan, lalu lanjut membaca setelahnya. */
  const reveal = (scope: 'word' | 'ayah') => {
    if (pageDone || frontier >= words.length) return;
    const from = frontier;
    let to = from + 1;
    if (scope === 'ayah') {
      const { surah, ayah } = words[from];
      while (to < words.length && words[to].surah === surah && words[to].ayah === ayah) to += 1;
    }
    const next: Graded[] = [];
    for (let i = 0; i < from; i += 1) {
      const g = gradedAt(i);
      next[i] = g === 'pending' ? 'missed' : g;
    }
    for (let i = from; i < to; i += 1) next[i] = 'hint';
    setFinal(next);
    setPointer(to);
    rec.reset();
  };

  const restartPage = () => {
    setPointer(start);
    setFinal([]);
    setPageDone(false);
    rec.reset();
  };

  // Ringkasan halaman ini (untuk bilah bawah).
  let ok = 0;
  let missed = 0;
  let hint = 0;
  for (let i = start; i < Math.min(words.length, frontier); i += 1) {
    const g = gradedAt(i);
    if (g === 'ok') ok += 1;
    else if (g === 'hint') hint += 1;
    else missed += 1;
  }

  return {
    prefs,
    setPrefs,
    stateOf,
    startAt,
    reveal,
    restartPage,
    report,
    closeReport,
    restartSession: () => {
      setLog([]);
      restartPage();
      setReport(null);
    },
    frontierKey: words[frontier] ? hifzKey(words[frontier].surah, words[frontier].ayah, words[frontier].index) : null,
    ok,
    missed,
    hint,
    started: frontier > start,
    rec
  };
}

export type MushafHifz = ReturnType<typeof useMushafHifz>;

/** Hasil setoran: muncul otomatis saat rekaman dihentikan. */
const HifzReport: React.FC<{ hifz: MushafHifz; surahName: (n: number) => string }> = ({ hifz, surahName }) => {
  const rows = hifz.report ?? [];
  const totals = rows.reduce((t, r) => ({ ok: t.ok + r.ok, missed: t.missed + r.missed, hint: t.hint + r.hint, read: t.read + r.read }), { ok: 0, missed: 0, hint: 0, read: 0 });
  const percent = Math.round((totals.ok / Math.max(1, totals.read)) * 100);
  const first = rows[0];
  const last = rows[rows.length - 1];
  const range = first && last
    ? first.surah === last.surah
      ? `QS. ${surahName(first.surah)} : ${first.ayah}${last.ayah !== first.ayah ? `–${last.ayah}` : ''}`
      : `QS. ${surahName(first.surah)} ${first.ayah} – ${surahName(last.surah)} ${last.ayah}`
    : '';
  const verdict =
    percent >= 95 ? 'Mumtaz! Hafalanmu lancar.' : percent >= 85 ? 'Jayyid jiddan! Hampir semua benar.' : percent >= 70 ? 'Jayyid! Sebagian besar benar.' : 'Belum lancar. Ulangi bagian yang ditandai.';
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-2 max-h-[55vh] overflow-y-auto overscroll-contain rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-[0_12px_32px_rgba(23,59,78,0.22)] p-4 space-y-3"
      role="dialog"
      aria-label="Hasil setoran"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#477F8D]">Hasil setoran</p>
          <p className="text-sm font-bold text-[#173B4E] dark:text-white truncate">{range}</p>
        </div>
        <span className="text-2xl font-bold text-[#173B4E] dark:text-white">{percent}%</span>
        <button type="button" onClick={hifz.closeReport} className="p-1.5 -mr-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Tutup hasil">
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs font-semibold text-[#246579] dark:text-[#A7CDD3]">
        {verdict} {totals.ok}/{totals.read} kata benar
        {totals.missed > 0 && ` · ${totals.missed} salah`}
        {totals.hint > 0 && ` · ${totals.hint} dibantu`}
      </p>
      <ul className="divide-y divide-slate-100 dark:divide-slate-700/60 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {rows.map((r) => {
          const partial = r.read < r.total;
          const fluent = r.missed === 0 && r.hint === 0;
          return (
            <li key={`${r.surah}:${r.ayah}`} className="flex items-center gap-2.5 px-3 py-2 text-xs">
              {fluent ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
              <span className="font-semibold text-[#173B4E] dark:text-white whitespace-nowrap">
                {surahName(r.surah)} {r.ayah}
              </span>
              <span className="flex-1 text-[#477F8D] dark:text-[#94A3B8]">
                {partial ? `sebagian (${r.read}/${r.total} kata)` : `${r.read} kata`}
                {r.missed > 0 && ` · ${r.missed} salah`}
                {r.hint > 0 && ` · ${r.hint} dibantu`}
                {fluent && ' · lancar'}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={hifz.restartSession}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-semibold text-[#246579] dark:text-[#A7CDD3] hover:bg-slate-50 dark:hover:bg-slate-700/50"
        >
          <RotateCcw className="w-4 h-4" /> Ulangi halaman
        </button>
        <button
          type="button"
          onClick={() => {
            hifz.closeReport();
            hifz.rec.start();
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#246579] hover:bg-[#174C60] text-white text-xs font-semibold"
        >
          <Play className="w-4 h-4" /> Lanjut membaca
        </button>
      </div>
    </motion.div>
  );
};

/** Bilah bawah Setor Hafalan: ringkasan, bantuan kata/ayat, ulang, tanda kesalahan, warna tajwid, rekam. */
export const MushafHifzBar: React.FC<{ hifz: MushafHifz; immersive: boolean; surahName: (n: number) => string }> = ({ hifz, immersive, surahName }) => {
  const { rec, prefs, setPrefs } = hifz;
  const counted = hifz.ok + hifz.missed + hifz.hint;
  const percent = counted ? Math.round((hifz.ok / counted) * 100) : 100;
  const tool = (label: string, Icon: React.ElementType, onClick: () => void, on?: boolean) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={on}
      title={label}
      className={`w-11 shrink-0 flex flex-col items-center gap-0.5 rounded-xl py-1 transition-colors ${
        on === false ? 'text-slate-400 dark:text-slate-500' : 'text-[#246579] dark:text-[#A7CDD3]'
      } hover:bg-[#F1EDE6] dark:hover:bg-slate-700`}
    >
      <span className={`w-8 h-8 rounded-full flex items-center justify-center ${on ? 'bg-[#246579] text-white' : 'bg-[#F1EDE6] dark:bg-slate-700'}`}>
        <Icon className="w-4 h-4" />
      </span>
      <span className="text-[9px] font-semibold leading-none">{label.split(' ')[0]}</span>
    </button>
  );
  const hint = rec.error ?? (hifz.report ? '' : !rec.listening ? (hifz.started ? 'Rekaman dijeda. Ketuk mikrofon untuk lanjut.' : 'Ketuk mikrofon jika sudah siap. Baca dari awal halaman, atau ketuk ayat untuk mulai dari situ.') : '');
  return (
    <div
      className={`fixed inset-x-3 sm:inset-x-6 z-40 mx-auto max-w-xl ${
        immersive ? 'bottom-[max(0.75rem,env(safe-area-inset-bottom))]' : 'bottom-[calc(5.25rem+env(safe-area-inset-bottom))] lg:bottom-6'
      }`}
      role="region"
      aria-label="Setor Hafalan"
    >
      {hifz.report && <HifzReport hifz={hifz} surahName={surahName} />}
      {hint && (
        <p className="mb-1.5 text-center" aria-live="polite">
          <span
            className={`inline-block px-3 py-1 rounded-2xl text-[11px] font-semibold bg-white/95 dark:bg-slate-800/95 shadow-sm ${
              rec.error ? 'text-amber-700 dark:text-amber-300' : 'text-[#246579] dark:text-[#A7CDD3]'
            }`}
          >
            {hint}
          </span>
        </p>
      )}
      <div className="flex items-center gap-1.5 p-2 pl-3 rounded-[28px] bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-[0_8px_24px_rgba(23,59,78,0.16)]">
        <div className="flex flex-col items-start leading-tight shrink-0 min-w-[3.25rem]" aria-label={`${hifz.missed} salah, ${hifz.hint} dibantu, ${percent}%`}>
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">✗ {hifz.missed}</span>
          {hifz.hint > 0 && <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">? {hifz.hint}</span>}
          <span className="text-[11px] font-semibold text-[#477F8D]">{percent}%</span>
        </div>
        <div className="flex-1 flex items-center justify-center gap-0.5 overflow-x-auto">
          {tool('Kata berikutnya', ChevronLeft, () => hifz.reveal('word'))}
          {tool('Ayat berikutnya', ChevronsLeft, () => hifz.reveal('ayah'))}
          {tool('Ulang halaman', RotateCcw, hifz.restartPage)}
          {tool('Salah ditandai', Highlighter, () => setPrefs({ showMistakes: !prefs.showMistakes }), prefs.showMistakes)}
          {tool('Tajwid berwarna', Palette, () => setPrefs({ tajwid: !prefs.tajwid }), prefs.tajwid)}
        </div>
        <MicButton
          listening={rec.listening}
          onClick={() => {
            if (rec.listening) rec.stop();
            else {
              hifz.closeReport();
              rec.start();
            }
          }}
        />
      </div>
    </div>
  );
};
