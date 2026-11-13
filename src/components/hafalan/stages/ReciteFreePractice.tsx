import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Mic, RotateCcw, SkipForward, Square } from 'lucide-react';
import { useQuranGame } from '../../../context/QuranGameContext';
import { sounds } from '../../../utils/soundEffects';
import type { HafalanContext } from '../hafalanPlan';
import { RoundDone, StageHeader, arabicSize } from '../StageParts';
import { createBrowserListener, type RecitationListener } from '../../../services/recitation/browserListener';
import { alignRecitation, expectedSkeletons, type WordStatus } from '../../../services/recitation/recitationAlign';
import { RECITE_ERROR_TEXT as ERROR_TEXT } from './reciteShared';

/**
 * Game 9 "Tantangan Bacaan", mode Latihan bebas: bacakan ayat, kata menyala hijau saat terbaca
 * (lihat teks, teks samar, atau hafalan). Versi gratis memakai pengenal suara browser: bisa
 * mengenali kata yang terlewat atau salah huruf, tetapi belum bisa menilai harakat,
 * panjang-pendek, dan makhraj.
 */

type Level = 'lihat' | 'samar' | 'hafalan';

const LEVELS: { id: Level; label: string; hint: string }[] = [
  { id: 'lihat', label: 'Lihat teks', hint: 'Baca sambil melihat ayat.' },
  { id: 'samar', label: 'Teks samar', hint: 'Ayat disamarkan, kata jelas setelah kamu baca.' },
  { id: 'hafalan', label: 'Hafalan', hint: 'Ayat disembunyikan, kata muncul satu per satu saat kamu baca.' }
];

/** Minimal kata yang terbaca agar lulus. */
const PASS_RATIO = 0.7;

const verdict = (ratio: number) =>
  ratio >= 0.95 ? 'Mumtaz! Bacaanmu lengkap.' : ratio >= 0.85 ? 'Jayyid jiddan! Hampir semua kata terbaca.' : ratio >= PASS_RATIO ? 'Jayyid! Sebagian besar kata terbaca.' : 'Belum lulus. Masih banyak kata yang terlewat.';

/** Latihan bebas tidak menyelesaikan game; `onStartChallenge` membuka mode Tantangan. */
export const ReciteFreePractice: React.FC<{ ctx: HafalanContext; onStartChallenge: () => void }> = ({ ctx, onStartChallenge }) => {
  const { fontSize, pauseMurottal } = useQuranGame();
  const rounds = ctx.segments;
  const [round, setRound] = useState(0);
  const [level, setLevel] = useState<Level>('lihat');
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  // Kata sebelum `base` sudah dinilai (dilewati dengan tombol); sisanya dicocokkan dengan bacaan.
  const [base, setBase] = useState(0);
  const [frozen, setFrozen] = useState<WordStatus[]>([]);
  const [result, setResult] = useState<WordStatus[] | null>(null);
  const listenerRef = useRef<RecitationListener | null>(null);

  const words = rounds[round];
  const isLastRound = round === rounds.length - 1;
  const atSurahStart = round === 0 && (ctx.ayah.ayahNumber === 1 || (ctx.surah.number === 42 && ctx.ayah.ayahNumber === 2));
  const variants = useMemo(
    () => expectedSkeletons(words.slice(base).map((w) => w.arabic), atSurahStart && base === 0),
    [words, base, atSurahStart]
  );
  const live = useMemo(() => alignRecitation(variants, transcript), [variants, transcript]);
  const status: WordStatus[] = result ?? [...frozen, ...live.status];
  const next = base + live.next;
  const okCount = status.filter((s) => s === 'ok').length;

  const listener = () => {
    listenerRef.current ??= createBrowserListener({
      onText: setTranscript,
      onListening: setListening,
      onError: (code) => setError(ERROR_TEXT[code] ?? 'Pengenal suara sedang bermasalah. Coba lagi sebentar lagi.')
    });
    return listenerRef.current;
  };

  useEffect(() => () => listenerRef.current?.stop(), []);

  const resetAttempt = () => {
    listenerRef.current?.stop();
    listenerRef.current?.reset();
    setTranscript('');
    setBase(0);
    setFrozen([]);
    setResult(null);
    setError(null);
  };

  useEffect(resetAttempt, [round]);

  const finish = (statuses: WordStatus[]) => {
    listenerRef.current?.stop();
    const final = statuses.map((s) => (s === 'ok' ? 'ok' : 'missed')) as WordStatus[];
    setResult(final);
    const ratio = final.filter((s) => s === 'ok').length / final.length;
    if (ratio >= PASS_RATIO) sounds.playAyahComplete();
    else sounds.playGentleRetry();
  };

  // Kata terakhir terbaca: selesai otomatis.
  useEffect(() => {
    if (!result && transcript && next >= words.length) finish(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [next, words.length, result, transcript]);

  const toggleMic = () => {
    if (listening) {
      listener().stop();
      return;
    }
    pauseMurottal();
    setError(null);
    listener().start();
  };

  const skipWord = () => {
    if (next >= words.length) return;
    const statuses = [...frozen, ...live.status.slice(0, live.next)];
    statuses.push('missed');
    setFrozen(statuses);
    setBase(statuses.length);
    setTranscript('');
    listener().reset();
    if (statuses.length >= words.length) finish(statuses);
  };

  const wordClass = (state: WordStatus, current: boolean) => {
    if (state === 'ok') return 'text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/40';
    if (state === 'missed') return 'text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/40';
    const ring = current && listening ? ' ring-2 ring-[#D3A253] ' : ' ';
    if (level === 'lihat') return `text-[#173B4E] dark:text-[#D3A253]${ring}`;
    if (level === 'samar') return `text-[#173B4E] dark:text-[#D3A253] blur-[5px] opacity-50 select-none${ring}`;
    return `blur-md opacity-25 bg-slate-300/40 dark:bg-slate-700/50 select-none${ring}`;
  };

  const passed = result ? okCount / words.length >= PASS_RATIO : false;
  const started = transcript.length > 0 || base > 0;

  return (
    <div className="space-y-5">
      <StageHeader
        title="Latihan bebas"
        description="Bacakan ayat dengan suaramu. Kata menyala hijau saat terbaca, oranye bila terlewat."
        round={round}
        rounds={rounds.length}
        listenAyah={ctx.ayah}
      />

      <div className="flex flex-wrap items-center justify-center gap-1.5" role="radiogroup" aria-label="Tingkat kesulitan">
        {LEVELS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={level === item.id}
            onClick={() => {
              setLevel(item.id);
              resetAttempt();
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              level === item.id
                ? 'bg-[#246579] text-white'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#246579] dark:text-[#A7CDD3] hover:border-[#477F8D]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="bg-gradient-to-b from-[#F8F6F1] to-[#F1EDE6] dark:from-[#102731] dark:to-[#152E38] rounded-3xl p-5 sm:p-7 border border-[#BE9452]/40 text-center">
        <p className="text-xs text-[#477F8D] text-left">{LEVELS.find((l) => l.id === level)?.hint}</p>
        <div dir="rtl" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 py-5">
          {words.map((word, i) => {
            const state = status[i] ?? 'pending';
            const hidden = level === 'hafalan' && state === 'pending';
            return (
              <span
                key={`${round}_${word.id}`}
                className={`font-arabic rounded-xl px-1.5 transition-all duration-300 ${wordClass(state, i === next && !result)}`}
                style={{ fontSize: arabicSize(fontSize, 1, 26) }}
              >
                {hidden ? '•••' : word.arabic}
              </span>
            );
          })}
        </div>
        {transcript && !result && (
          <p dir="rtl" lang="ar" className="pt-3 border-t border-[#477F8D]/20 text-sm text-slate-500 dark:text-slate-400 font-arabic leading-normal">
            {transcript}
          </p>
        )}
      </div>

      {!result && (
        <div className="bg-white/70 dark:bg-slate-800/60 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={toggleMic}
            className={`relative w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-colors ${
              listening ? 'bg-[#C0563F]' : 'bg-[#246579] hover:bg-[#1D5466]'
            }`}
            aria-label={listening ? 'Jeda mendengarkan' : 'Mulai membaca'}
          >
            {listening && <span className="absolute inset-0 rounded-full bg-[#C0563F]/40 animate-ping" />}
            {listening ? <Square className="relative w-6 h-6 fill-current" /> : <Mic className="relative w-7 h-7" />}
          </button>
          <p className={`text-center text-xs leading-relaxed ${error ? 'text-amber-700 dark:text-amber-300' : 'text-[#477F8D] dark:text-[#94A3B8]'}`} aria-live="polite">
            {error ??
              (listening
                ? `Mendengarkan… ${okCount}/${words.length} kata terbaca`
                : started
                  ? 'Dijeda. Ketuk mikrofon untuk melanjutkan.'
                  : 'Ketuk mikrofon, lalu baca ayat dari awal.')}
          </p>
          {started && (
            <div className="flex flex-wrap justify-center gap-2">
              <button type="button" onClick={skipWord} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-semibold text-[#246579] dark:text-[#A7CDD3] hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <SkipForward className="w-4 h-4" /> Lewati kata
              </button>
              <button type="button" onClick={resetAttempt} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-semibold text-[#246579] dark:text-[#A7CDD3] hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <RotateCcw className="w-4 h-4" /> Ulangi
              </button>
              <button type="button" onClick={() => finish(status)} className="px-3.5 py-2 rounded-xl bg-[#246579] hover:bg-[#174C60] text-white text-xs font-semibold">
                Selesai membaca
              </button>
            </div>
          )}
          {!started && (
            <p className="text-center text-[11px] leading-relaxed text-slate-400 dark:text-slate-500 max-w-md">
              Penilaian memakai pengenal suara browser: bisa mengenali kata yang terlewat atau salah huruf, tetapi belum bisa menilai harakat, panjang-pendek, dan makhraj.
            </p>
          )}
        </div>
      )}

      {result && !passed && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-center space-y-3">
          <p className="text-2xl font-bold text-amber-800 dark:text-amber-200">{okCount}/{words.length}</p>
          <p className="text-xs text-amber-900 dark:text-amber-100">
            {verdict(okCount / words.length)} Kata berwarna oranye perlu diulang. Dengarkan murottalnya dulu, lalu coba lagi.
          </p>
          <button type="button" onClick={resetAttempt} className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#246579] hover:bg-[#174C60] text-white text-xs font-semibold">
            <RotateCcw className="w-4 h-4" /> Coba lagi
          </button>
        </motion.div>
      )}

      {result && passed && (
        <RoundDone
          title={`${verdict(okCount / words.length)} (${okCount}/${words.length} kata)`}
          note={okCount < words.length ? 'Kata berwarna oranye masih perlu diulang.' : undefined}
          actionLabel={isLastRound ? 'Latihan lagi' : 'Lanjut ke bagian berikutnya'}
          onContinue={() => {
            if (!isLastRound) setRound(round + 1);
            else if (round === 0) resetAttempt();
            else setRound(0);
          }}
        />
      )}

      {result && passed && isLastRound && (
        <p className="text-center text-xs text-[#477F8D] dark:text-[#94A3B8]">
          Latihan bebas tidak dihitung sebagai game selesai.{' '}
          <button type="button" onClick={onStartChallenge} className="font-semibold text-[#246579] dark:text-[#A7CDD3] underline">
            Mulai Tantangan
          </button>
        </p>
      )}
    </div>
  );
};
