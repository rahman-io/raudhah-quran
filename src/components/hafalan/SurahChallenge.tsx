import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, ArrowRight, CheckCircle2, Dumbbell, Play, RotateCcw, SlidersHorizontal, Swords, X } from 'lucide-react';
import { useQuranGame } from '../../context/QuranGameContext';
import type { ReaderSurah } from '../../services/quranReaderData';
import type { QuranWord } from '../../types/quran';
import { useBackHandler } from '../../utils/backNavigation';
import { sounds } from '../../utils/soundEffects';
import { isBrowserRecitationSupported } from '../../services/recitation/browserListener';
import { alignRecitationTail, expectedSkeletons, type WordStatus } from '../../services/recitation/recitationAlign';
import { arabicSkeleton } from '../../services/arabicSkeleton';
import { AyahEndMarker } from '../reader/AyahEndMarker';
import { MicButton, useRecitation } from './stages/reciteShared';

/**
 * Tantangan Surah: Tantangan Bacaan di tingkat surah (seperti Tarteel).
 * Pelajar memilih rentang ayat (mis. Al-Baqarah 2–6), semua ayat di rentang itu
 * disembunyikan, lalu ia membaca sambung sampai selesai. Kata muncul saat terbaca,
 * lalu dinilai per ayat. Ayat yang masih tersendat bisa langsung dilatih di Mode Hafalkan.
 *
 * Bacaan panjang dicocokkan per "jendela" (±30 kata ke depan dari posisi baca); kata yang
 * sudah jauh terlewati dikunci nilainya, sehingga beberapa ayat sekaligus tetap ringan.
 */

type Level = 'hafalan' | 'samar' | 'lihat';
const LEVELS: { id: Level; label: string }[] = [
  { id: 'hafalan', label: 'Tersembunyi' },
  { id: 'samar', label: 'Samar' },
  { id: 'lihat', label: 'Lihat teks' }
];

interface RangeWord {
  word: QuranWord;
  /** Indeks ayat di surah (0-based). */
  ayahIndex: number;
  lastOfAyah: boolean;
}

const WINDOW_WORDS = 30;
/** Kata dikunci nilainya setelah bacaan sudah sejauh ini di depannya. */
const COMMIT_LAG = 2;
/** Ayat dianggap lancar bila ≥ 90% katanya terbaca. */
const FLUENT = 0.9;
const RANGE_KEY = 'raudhah_surah_challenge_v1';

const readLastRange = (surah: number): [number, number] | null => {
  try {
    const value = (JSON.parse(localStorage.getItem(RANGE_KEY) || '{}') as Record<string, [number, number]>)[surah];
    return Array.isArray(value) && value.length === 2 ? value : null;
  } catch {
    return null;
  }
};
const saveLastRange = (surah: number, range: [number, number]) => {
  try {
    const all = JSON.parse(localStorage.getItem(RANGE_KEY) || '{}') as Record<string, [number, number]>;
    all[surah] = range;
    localStorage.setItem(RANGE_KEY, JSON.stringify(all));
  } catch {
    // abaikan
  }
};

type Phase = { kind: 'setup' } | { kind: 'reading' } | { kind: 'result'; status: WordStatus[] };

export const SurahChallenge: React.FC<{
  surah: ReaderSurah;
  /** Ayat awal yang disarankan (mis. ayat terakhir yang dibaca), 1-based. */
  suggestedStart?: number;
  onClose: () => void;
  /** Buka Mode Hafalkan untuk satu ayat (indeks 0-based). */
  onTrainAyah: (ayahIndex: number) => void;
}> = ({ surah, suggestedStart, onClose, onTrainAyah }) => {
  const { fontSize, addXP, pauseMurottal } = useQuranGame();
  const total = surah.ayahs.length;
  const [supported] = useState(isBrowserRecitationSupported);
  const [range, setRange] = useState<[number, number]>(() => {
    const last = readLastRange(surah.number);
    if (last && last[0] >= 1 && last[1] <= total && last[0] <= last[1]) return last;
    const from = Math.min(Math.max(1, suggestedStart ?? 1), total);
    return [from, Math.min(total, from + 4)];
  });
  const [level, setLevel] = useState<Level>('hafalan');
  const [phase, setPhase] = useState<Phase>({ kind: 'setup' });
  const rec = useRecitation();

  const [final, setFinal] = useState<WordStatus[]>([]);
  const [pointer, setPointer] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useBackHandler(true, onClose, 2);
  useBackHandler(phase.kind !== 'setup', () => {
    rec.stop();
    setPhase({ kind: 'setup' });
  }, 2);

  const words: RangeWord[] = useMemo(() => {
    const list: RangeWord[] = [];
    for (let a = range[0] - 1; a <= range[1] - 1; a += 1) {
      const ayahWords = surah.ayahs[a]?.words ?? [];
      ayahWords.forEach((word, i) => list.push({ word, ayahIndex: a, lastOfAyah: i === ayahWords.length - 1 }));
    }
    return list;
  }, [surah, range]);

  // Jendela pencocokan: kata yang belum dikunci, ±30 kata ke depan.
  const windowWords = useMemo(() => words.slice(pointer, pointer + WINDOW_WORDS), [words, pointer]);
  const firstWordOfSurah = surah.ayahs[0]?.words[0]?.id;
  const variants = useMemo(
    () => expectedSkeletons(windowWords.map((w) => w.word.arabic), windowWords[0]?.word.id === firstWordOfSurah),
    [windowWords, firstWordOfSurah]
  );
  const tailLetters = useMemo(
    () => Math.ceil(windowWords.reduce((sum, w) => sum + arabicSkeleton(w.word.arabic).length, 0) * 1.5) + 30,
    [windowWords]
  );
  const reading = phase.kind === 'reading';
  const live = useMemo(
    () => (reading ? alignRecitationTail(variants, rec.transcript, tailLetters) : { status: [] as WordStatus[], next: 0 }),
    [reading, variants, rec.transcript, tailLetters]
  );
  const frontier = pointer + live.next;

  const status: WordStatus[] =
    phase.kind === 'result'
      ? phase.status
      : words.map((_, i) => (i < pointer ? final[i] ?? 'missed' : live.status[i - pointer] ?? 'pending'));

  const finish = (statuses: WordStatus[]) => {
    rec.stop();
    const result = statuses.map((s): WordStatus => (s === 'ok' ? 'ok' : 'missed'));
    const ratio = result.filter((s) => s === 'ok').length / Math.max(1, result.length);
    if (ratio >= 0.7) {
      sounds.playAyahComplete();
      addXP(10, 'Tantangan surah');
    } else {
      sounds.playGentleRetry();
    }
    setPhase({ kind: 'result', status: result });
  };

  // Kunci nilai kata yang sudah jauh terlewati; selesai otomatis saat kata terakhir terbaca.
  useEffect(() => {
    if (!reading) return;
    if (frontier >= words.length && words.length) {
      finish(status);
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
  }, [live, reading]);

  // Ikuti posisi baca.
  useEffect(() => {
    if (!reading) return;
    const el = scrollRef.current?.querySelector(`[data-word-index="${Math.min(frontier, words.length - 1)}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [frontier, reading, words.length]);

  const start = () => {
    saveLastRange(surah.number, range);
    setFinal([]);
    setPointer(0);
    rec.reset();
    setPhase({ kind: 'reading' });
    pauseMurottal();
    rec.start();
    scrollRef.current?.scrollTo({ top: 0 });
  };

  const setFrom = (from: number) => setRange(([, to]) => [from, Math.max(from, to)]);
  const setTo = (to: number) => setRange(([from]) => [Math.min(from, to), to]);
  const quickRange = (size: number) => setRange(([from]) => [from, Math.min(total, from + size - 1)]);

  /* ---------------------------------------------------------------- */
  /* Hasil per ayat                                                    */
  /* ---------------------------------------------------------------- */

  const perAyah = useMemo(() => {
    if (phase.kind !== 'result') return [];
    const map = new Map<number, { ok: number; total: number }>();
    words.forEach((w, i) => {
      const item = map.get(w.ayahIndex) ?? { ok: 0, total: 0 };
      item.total += 1;
      if (phase.status[i] === 'ok') item.ok += 1;
      map.set(w.ayahIndex, item);
    });
    return [...map.entries()].map(([ayahIndex, v]) => ({ ayahIndex, ...v, fluent: v.ok / v.total >= FLUENT }));
  }, [phase, words]);
  const okWords = phase.kind === 'result' ? phase.status.filter((s) => s === 'ok').length : 0;
  const ratio = okWords / Math.max(1, words.length);
  const size = range[1] - range[0] + 1;
  const nextRange: [number, number] | null = range[1] < total ? [range[1] + 1, Math.min(total, range[1] + size)] : null;

  /* ---------------------------------------------------------------- */
  /* Tampilan kata                                                     */
  /* ---------------------------------------------------------------- */

  const wordFont = Math.max(Math.round(fontSize * 0.9), 24);
  const renderWord = (w: RangeWord, i: number) => {
    const state = status[i] ?? 'pending';
    const current = reading && rec.listening && i === frontier;
    const ring = current ? ' ring-2 ring-[#D3A253]' : '';
    if (state === 'ok')
      return (
        <span key={w.word.id} data-word-index={i} className="font-arabic rounded-lg px-1 text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-900/40 transition-colors duration-300">
          {w.word.arabic}
        </span>
      );
    if (state === 'missed')
      return (
        <span key={w.word.id} data-word-index={i} className="font-arabic rounded-lg px-1 text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/40">
          {w.word.arabic}
        </span>
      );
    if (level === 'lihat' || phase.kind === 'setup')
      return (
        <span key={w.word.id} data-word-index={i} className={`font-arabic rounded-lg px-1 text-[#173B4E] dark:text-[#D3A253]${ring}`}>
          {w.word.arabic}
        </span>
      );
    if (level === 'samar')
      return (
        <span key={w.word.id} data-word-index={i} className={`font-arabic rounded-lg px-1 text-[#173B4E] dark:text-[#D3A253] blur-[5px] opacity-50 select-none${ring}`}>
          {w.word.arabic}
        </span>
      );
    // Tersembunyi: garis sepanjang kata, tanpa huruf.
    const letters = Math.max(2, Math.min(7, arabicSkeleton(w.word.arabic).length));
    return (
      <span
        key={w.word.id}
        data-word-index={i}
        className={`inline-block align-middle rounded-full bg-slate-300/70 dark:bg-slate-600/60 my-[0.55em] mx-0.5${ring}`}
        style={{ width: `${letters * 0.42}em`, height: '0.45em' }}
        aria-label="kata tersembunyi"
      />
    );
  };

  const ayahBlocks = () => {
    const blocks: React.ReactNode[] = [];
    let current: React.ReactNode[] = [];
    words.forEach((w, i) => {
      current.push(renderWord(w, i));
      if (w.lastOfAyah) {
        current.push(
          <span key={`end_${w.ayahIndex}`} className="inline-flex align-middle mx-1">
            <AyahEndMarker number={w.ayahIndex + 1} fontSize={wordFont * 0.8} />
          </span>
        );
        blocks.push(...current);
        current = [];
      }
    });
    blocks.push(...current);
    return blocks;
  };

  const select = (value: number, onChange: (v: number) => void, label: string, min = 1) => (
    <label className="flex-1 min-w-0">
      <span className="block text-[11px] font-semibold text-[#477F8D] mb-1">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full h-11 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-[#173B4E] dark:text-white"
      >
        {Array.from({ length: total - min + 1 }, (_, k) => k + min).map((n) => (
          <option key={n} value={n}>
            Ayat {n}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="fixed inset-0 z-[60] bg-[#F7F4EF] dark:bg-[#0D202A] text-[#293640] dark:text-[#E2E8F0] flex flex-col" role="dialog" aria-modal="true" aria-label="Tantangan Surah">
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white/85 dark:bg-slate-900/70 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 shrink-0 rounded-xl bg-[#246579] text-white flex items-center justify-center">
            <Swords className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#477F8D]">Tantangan Surah</p>
            <p className="text-sm font-bold truncate">
              QS. {surah.nameLatin} : {range[0]}
              {range[1] !== range[0] && `–${range[1]}`}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-[#246579] dark:text-[#A7CDD3]" aria-label="Tutup">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-5 pb-40 space-y-5">
          {!supported ? (
            <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-sm text-amber-900 dark:text-amber-100 space-y-1.5">
              <p className="font-semibold">Browser ini belum bisa mendengarkan bacaan.</p>
              <p className="text-xs leading-relaxed">Buka aplikasi di Chrome (Android atau komputer) atau Safari (iPhone) untuk memainkan Tantangan Surah.</p>
            </div>
          ) : (
            <>
              {phase.kind === 'setup' && (
                <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
                  <div>
                    <h2 className="text-base font-bold text-[#173B4E] dark:text-white">Pilih ayat yang siap kamu baca</h2>
                    <p className="text-xs text-[#477F8D] dark:text-[#94A3B8] mt-0.5">
                      Ayat-ayat ini disembunyikan. Baca sambung sampai selesai, kata muncul saat terbaca, lalu dinilai per ayat.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    {select(range[0], setFrom, 'Dari')}
                    {select(range[1], setTo, 'Sampai', range[0])}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[3, 5, 10].filter((n) => n < total).map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => quickRange(n)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                          size === n && range[0] + n - 1 <= total ? 'bg-[#246579] text-white border-[#246579]' : 'border-slate-200 dark:border-slate-700 text-[#246579] dark:text-[#A7CDD3] hover:border-[#477F8D]'
                        }`}
                      >
                        {n} ayat
                      </button>
                    ))}
                    {total <= 40 && (
                      <button
                        type="button"
                        onClick={() => setRange([1, total])}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                          range[0] === 1 && range[1] === total ? 'bg-[#246579] text-white border-[#246579]' : 'border-slate-200 dark:border-slate-700 text-[#246579] dark:text-[#A7CDD3] hover:border-[#477F8D]'
                        }`}
                      >
                        Seluruh surah
                      </button>
                    )}
                  </div>
                  <div>
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#477F8D] mb-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5" /> Tampilan ayat saat membaca
                    </span>
                    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Tampilan ayat">
                      {LEVELS.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          role="radio"
                          aria-checked={level === item.id}
                          onClick={() => setLevel(item.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                            level === item.id ? 'bg-[#246579] text-white' : 'bg-[#F1EDE6] dark:bg-slate-700 text-[#246579] dark:text-[#A7CDD3]'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button type="button" onClick={start} className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#246579] hover:bg-[#174C60] text-white text-sm font-semibold">
                    <Play className="w-4 h-4" /> Mulai membaca
                  </button>
                  <p className="text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
                    Masih sulit? Latih dulu per ayat di Mode Hafalkan, lalu kembali ke sini. Penilaian memakai pengenal suara browser: bisa mengenali kata yang terlewat atau salah huruf, tetapi belum bisa menilai harakat, panjang-pendek, dan makhraj.
                  </p>
                </div>
              )}

              {phase.kind === 'result' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-[#173B4E] dark:text-white">{Math.round(ratio * 100)}%</p>
                    <p className="text-sm font-semibold text-[#246579] dark:text-[#A7CDD3] mt-1">
                      {ratio >= 0.95 ? 'Mumtaz! Bacaanmu lancar.' : ratio >= 0.85 ? 'Jayyid jiddan! Hampir semua terbaca.' : ratio >= 0.7 ? 'Jayyid! Sebagian besar terbaca.' : 'Belum lancar. Latih dulu ayat yang ditandai.'}
                    </p>
                    <p className="text-xs text-[#477F8D] mt-0.5">{okWords}/{words.length} kata terbaca</p>
                  </div>
                  <ul className="divide-y divide-slate-100 dark:divide-slate-700/60 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {perAyah.map((item) => (
                      <li key={item.ayahIndex} className="flex items-center gap-3 px-3.5 py-2.5 bg-white/70 dark:bg-slate-900/30">
                        {item.fluent ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />}
                        <span className="flex-1 min-w-0 text-sm">
                          <span className="font-semibold">Ayat {item.ayahIndex + 1}</span>
                          <span className="text-xs text-[#477F8D]"> · {item.ok}/{item.total} kata{item.fluent ? ' · lancar' : ' · masih tersendat'}</span>
                        </span>
                        {!item.fluent && (
                          <button
                            type="button"
                            onClick={() => onTrainAyah(item.ayahIndex)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#246579]/10 dark:bg-[#246579]/30 text-[#246579] dark:text-[#A7CDD3] text-xs font-semibold hover:bg-[#246579]/20"
                          >
                            <Dumbbell className="w-3.5 h-3.5" /> Latih
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button type="button" onClick={start} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-semibold text-[#246579] dark:text-[#A7CDD3] hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <RotateCcw className="w-4 h-4" /> Ulangi
                    </button>
                    <button type="button" onClick={() => setPhase({ kind: 'setup' })} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-semibold text-[#246579] dark:text-[#A7CDD3] hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      Ubah ayat
                    </button>
                    {nextRange && (
                      <button
                        type="button"
                        onClick={() => {
                          setRange(nextRange);
                          setPhase({ kind: 'setup' });
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#246579] hover:bg-[#174C60] text-white text-xs font-semibold"
                      >
                        Ayat {nextRange[0]}{nextRange[1] !== nextRange[0] && `–${nextRange[1]}`} <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Ayat-ayat dalam rentang */}
              <div className="bg-gradient-to-b from-[#F8F6F1] to-[#F1EDE6] dark:from-[#102731] dark:to-[#152E38] rounded-3xl p-5 sm:p-7 border border-[#BE9452]/40">
                <p dir="rtl" className="text-right leading-[2.3]" style={{ fontSize: wordFont }}>
                  {ayahBlocks().map((node, k) => (
                    <React.Fragment key={k}>{node} </React.Fragment>
                  ))}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {supported && reading && (
        <div className="absolute inset-x-0 bottom-0 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 bg-gradient-to-t from-[#F7F4EF] via-[#F7F4EF]/95 to-transparent dark:from-[#0D202A] dark:via-[#0D202A]/95">
          <div className="max-w-3xl mx-auto px-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                rec.reset();
                setFinal([]);
                setPointer(0);
                scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 text-xs font-semibold text-[#246579] dark:text-[#A7CDD3]"
            >
              <RotateCcw className="w-4 h-4" /> Ulangi
            </button>
            <div className="flex flex-col items-center gap-1">
              <MicButton listening={rec.listening} onClick={() => (rec.listening ? rec.stop() : (pauseMurottal(), rec.start()))} />
              <span className={`text-[11px] max-w-[11rem] text-center ${rec.error ? 'text-amber-700 dark:text-amber-300' : 'text-[#477F8D]'}`} aria-live="polite">
                {rec.error ?? (rec.listening ? `${status.filter((s) => s === 'ok').length}/${words.length} kata` : 'Dijeda')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => finish(status)}
              className="px-3.5 py-2 rounded-xl bg-[#246579] hover:bg-[#174C60] text-white text-xs font-semibold"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
