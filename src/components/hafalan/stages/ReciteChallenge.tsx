import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Check, Play, RotateCcw, X } from 'lucide-react';
import { useQuranGame } from '../../../context/QuranGameContext';
import { sounds } from '../../../utils/soundEffects';
import type { QuranWord } from '../../../types/quran';
import type { HafalanContext } from '../hafalanPlan';
import { RoundDone, StageHeader, arabicSize } from '../StageParts';
import { alignRecitation, expectedSkeletons, type WordStatus } from '../../../services/recitation/recitationAlign';
import { buildQuestions, chunkWords, readWeakChunks, recordChunkResult, type ChallengeQuestion } from '../reciteChallengePlan';
import { MicButton, useRecitation } from './reciteShared';

/**
 * Game 9 "Tantangan Bacaan", mode utama:
 *  Pembuka  : ayat (atau bagian ayat) ditampilkan utuh untuk diingat dulu.
 *  Babak 1  : hafal per potongan. Setiap potongan wajib dibaca 3x, teks memudar
 *             (terlihat → samar → tersembunyi). Setelah 3x boleh ulang atau lanjut.
 *  Babak 2  : sambung ayat. Soal acak (lanjutkan / sebelumnya / isi yang hilang),
 *             ditutup dengan membaca utuh tanpa teks. Soal yang salah diulang di akhir.
 * Aturan pemotongan & pembuatan soal ada di reciteChallengePlan.ts.
 */

type QItem = ChallengeQuestion & { fails: number; beforeLabel?: string; afterLabel?: string };

type Phase =
  | { kind: 'intro' }
  | { kind: 'drill'; chunk: number; results: boolean[] }
  | { kind: 'drillChoice'; chunk: number; results: boolean[] }
  | { kind: 'quiz'; queue: QItem[]; index: number; firstTry: number }
  | { kind: 'roundDone'; firstTry: number; total: number };

const REPS = 3;
/** Soal Babak 2 dianggap benar bila ≥ 75% kata terbaca. */
const QUIZ_PASS = 0.75;
/** Soal yang sudah salah sebanyak ini tidak diulang lagi di putaran ini. */
const MAX_FAILS = 3;
const FLASH_MS = 1100;

const REP_HINT = ['Ulangan 1: baca sambil melihat.', 'Ulangan 2: teks disamarkan.', 'Ulangan 3: teks disembunyikan, baca dari ingatan.'];

const QUESTION_TEXT: Record<ChallengeQuestion['kind'], string> = {
  lanjut: 'Lanjutkan bacaan setelah potongan ini.',
  sebelum: 'Bacakan potongan sebelum ini.',
  tengah: 'Isi potongan yang hilang.',
  utuh: 'Bacakan utuh tanpa melihat teks.'
};

export const ReciteChallenge: React.FC<{ ctx: HafalanContext; onPass: () => void }> = ({ ctx, onPass }) => {
  const { fontSize, pauseMurottal } = useQuranGame();
  const rec = useRecitation();
  const rounds = ctx.segments;
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>({ kind: 'intro' });
  const [flash, setFlash] = useState<{ correct: boolean; status: WordStatus[] } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const words = rounds[round];
  const isLastRound = round === rounds.length - 1;
  const atSurahStart = round === 0 && (ctx.ayah.ayahNumber === 1 || (ctx.surah.number === 42 && ctx.ayah.ayahNumber === 2));
  const chunks = useMemo(() => chunkWords(words, atSurahStart), [words, atSurahStart]);
  const unit = rounds.length > 1 ? 'bagian' : 'ayat';

  const question = phase.kind === 'quiz' ? phase.queue[phase.index] : null;
  const target: QuranWord[] = phase.kind === 'drill' || phase.kind === 'drillChoice' ? chunks[phase.chunk] : question?.target ?? [];
  const variants = useMemo(
    () => expectedSkeletons(target.map((w) => w.arabic), atSurahStart && target[0]?.id === ctx.ayah.words[0]?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [target.map((w) => w.id).join(',')]
  );
  const active = (phase.kind === 'drill' || phase.kind === 'quiz') && !flash;
  const live = useMemo(
    () => (active ? alignRecitation(variants, rec.transcript) : { status: target.map((): WordStatus => 'pending'), next: 0 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [active, variants, rec.transcript]
  );
  const status = flash?.status ?? live.status;

  const goRound = (next: number) => {
    rec.stop();
    rec.reset();
    setFlash(null);
    setRound(next);
    setPhase({ kind: 'intro' });
  };

  const startQuiz = () => {
    const prevWords = round > 0 ? rounds[round - 1] : ctx.surah.ayahs[ctx.ayahIndex - 1]?.words ?? null;
    const nextWords = !isLastRound ? rounds[round + 1] : ctx.surah.ayahs[ctx.ayahIndex + 1]?.words ?? null;
    const queue: QItem[] = buildQuestions(chunks, prevWords, nextWords, readWeakChunks()).map((q) => ({
      ...q,
      fails: 0,
      beforeLabel: q.cueFromOtherAyah ? `akhir ${round > 0 ? 'bagian' : 'ayat'} sebelumnya` : undefined,
      afterLabel: q.cueFromOtherAyah ? `awal ${!isLastRound ? 'bagian' : 'ayat'} berikutnya` : undefined
    }));
    rec.reset();
    setPhase({ kind: 'quiz', queue, index: 0, firstTry: 0 });
  };

  /** Nilai bacaan saat ini (otomatis bila semua kata terbaca, atau lewat tombol). */
  const assess = (auto: boolean) => {
    if (!active) return;
    const final = live.status.map((s): WordStatus => (s === 'ok' ? 'ok' : 'missed'));
    const ratio = final.filter((s) => s === 'ok').length / Math.max(1, final.length);
    const correct = auto || (phase.kind === 'drill' ? ratio === 1 : ratio >= QUIZ_PASS);
    setFlash({ correct, status: final });
    rec.reset();

    if (phase.kind === 'drill') {
      const results = [...phase.results, correct];
      timer.current = setTimeout(() => {
        setFlash(null);
        rec.reset();
        if (results.length >= REPS) {
          rec.stop();
          sounds.playAyahComplete();
          setPhase({ kind: 'drillChoice', chunk: phase.chunk, results });
        } else {
          setPhase({ kind: 'drill', chunk: phase.chunk, results });
        }
      }, FLASH_MS);
      return;
    }

    if (phase.kind === 'quiz' && question) {
      if (question.kind !== 'utuh') recordChunkResult(question.key, correct);
      if (!correct) {
        // Salah: tunjukkan jawabannya; pengguna memilih coba lagi atau lanjut (soal diulang nanti).
        rec.stop();
        sounds.playGentleRetry();
        return;
      }
      const firstTry = phase.firstTry + (question.fails === 0 ? 1 : 0);
      timer.current = setTimeout(() => {
        setFlash(null);
        rec.reset();
        if (phase.index + 1 < phase.queue.length) {
          setPhase({ ...phase, index: phase.index + 1, firstTry });
        } else {
          rec.stop();
          sounds.playAyahComplete();
          const total = new Set(phase.queue.map((q) => q.key)).size;
          setPhase({ kind: 'roundDone', firstTry, total });
        }
      }, FLASH_MS);
    }
  };

  // Semua kata terbaca: nilai otomatis.
  useEffect(() => {
    if (active && rec.transcript && target.length && live.next >= target.length) assess(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live.next, active]);

  const retryQuestion = () => {
    if (phase.kind !== 'quiz') return;
    const queue = phase.queue.map((q, i) => (i === phase.index ? { ...q, fails: q.fails + 1 } : q));
    setPhase({ ...phase, queue });
    setFlash(null);
    rec.reset();
    listenNow();
  };

  const skipQuestion = () => {
    if (phase.kind !== 'quiz' || !question) return;
    const failed = { ...question, fails: question.fails + 1 };
    const queue = [...phase.queue];
    // Diulang di akhir antrean, tetapi tetap sebelum soal penutup (baca utuh).
    if (failed.fails < MAX_FAILS) {
      const closing = queue.findIndex((q, i) => i > phase.index && q.kind === 'utuh');
      if (question.kind !== 'utuh' && closing !== -1) queue.splice(closing, 0, failed);
      else queue.push(failed);
    }
    setFlash(null);
    rec.reset();
    if (phase.index + 1 < queue.length) {
      setPhase({ ...phase, queue, index: phase.index + 1 });
      listenNow();
    } else {
      const total = new Set(queue.map((q) => q.key)).size;
      setPhase({ kind: 'roundDone', firstTry: phase.firstTry, total });
    }
  };

  /** Dipanggil dari ketukan tombol: langsung mendengarkan untuk langkah berikutnya. */
  const listenNow = () => {
    pauseMurottal();
    rec.start();
  };

  const toggleMic = () => {
    if (rec.listening) rec.stop();
    else {
      pauseMurottal();
      rec.start();
    }
  };

  /* ---------------------------------------------------------------- */
  /* Tampilan                                                          */
  /* ---------------------------------------------------------------- */

  const wordSize = arabicSize(fontSize, 1, 26);
  const plainWord = (word: QuranWord, key: string, className = 'text-[#173B4E] dark:text-[#D3A253]') => (
    <span key={key} className={`font-arabic rounded-xl px-1.5 ${className}`} style={{ fontSize: wordSize }}>
      {word.arabic}
    </span>
  );

  const targetWord = (word: QuranWord, i: number, visibility: 'show' | 'samar' | 'hide') => {
    const state = status[i] ?? 'pending';
    const current = rec.listening && !flash && i === live.next;
    if (state === 'ok') return plainWord(word, word.id, 'text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/40 transition-all duration-300');
    if (state === 'missed') return plainWord(word, word.id, 'text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/40 transition-all duration-300');
    const ring = current ? ' ring-2 ring-[#D3A253]' : '';
    if (visibility === 'show') return plainWord(word, word.id, `text-[#173B4E] dark:text-[#D3A253] transition-all duration-300${ring}`);
    if (visibility === 'samar') return plainWord(word, word.id, `text-[#173B4E] dark:text-[#D3A253] blur-[5px] opacity-50 select-none transition-all duration-300${ring}`);
    return (
      <span
        key={word.id}
        className={`inline-flex items-center justify-center min-w-[3.2rem] h-[1.9em] rounded-xl border-2 border-dashed border-[#D3A253]/70 bg-white/60 dark:bg-slate-800/50 text-[#BE9452] font-bold transition-all duration-300${ring}`}
        style={{ fontSize: `calc(${wordSize} * 0.7)` }}
        aria-label="kata tersembunyi"
      >
        •••
      </span>
    );
  };

  const micPanel = (hint: string, gradeLabel: string) => (
    <div className="bg-white/70 dark:bg-slate-800/60 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col items-center gap-3">
      <MicButton listening={rec.listening} onClick={toggleMic} />
      <p className={`text-center text-xs leading-relaxed ${rec.error ? 'text-amber-700 dark:text-amber-300' : 'text-[#477F8D] dark:text-[#94A3B8]'}`} aria-live="polite">
        {rec.error ?? (rec.listening ? 'Mendengarkan…' : hint)}
      </p>
      {rec.transcript && !flash && (
        <>
          <p dir="rtl" lang="ar" className="font-arabic text-sm leading-normal text-slate-500 dark:text-slate-400">{rec.transcript}</p>
          <button type="button" onClick={() => assess(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-semibold text-[#246579] dark:text-[#A7CDD3] hover:bg-slate-50 dark:hover:bg-slate-700/50">
            {gradeLabel}
          </button>
        </>
      )}
    </div>
  );

  const flashBadge = flash && (
    <motion.p
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
        flash.correct ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
      }`}
    >
      {flash.correct ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      {flash.correct ? 'Benar' : 'Belum tepat'}
    </motion.p>
  );

  const card = 'bg-gradient-to-b from-[#F8F6F1] to-[#F1EDE6] dark:from-[#102731] dark:to-[#152E38] rounded-3xl p-5 sm:p-7 border border-[#BE9452]/40 text-center';
  const translation = rounds.length > 1 ? words.map((w) => w.translation).join(' ') : ctx.ayah.translationId;

  let description = 'Ingat dulu ayatnya, lalu mulai tantangan.';
  if (phase.kind === 'drill' || phase.kind === 'drillChoice') description = 'Babak 1 · Hafal per potongan: setiap potongan wajib diulang 3x.';
  if (phase.kind === 'quiz') description = 'Babak 2 · Sambung ayat: soal diacak, bacakan bagian yang diminta.';
  if (phase.kind === 'roundDone') description = 'Tantangan selesai.';

  return (
    <div className="space-y-5">
      <StageHeader title="Tantangan Bacaan" description={description} round={round} rounds={rounds.length} listenAyah={ctx.ayah} />

      {phase.kind === 'intro' && (
        <>
          <div className={card}>
            <div dir="rtl" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 py-3">
              {words.map((w) => plainWord(w, w.id))}
            </div>
            <p className="pt-3 border-t border-[#477F8D]/20 text-sm text-[#293640] dark:text-[#CBD5E1]">"{translation}"</p>
          </div>
          <div className="bg-white/70 dark:bg-slate-800/60 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 text-center space-y-3">
            <p className="text-sm font-semibold text-[#173B4E] dark:text-white">Sudah coba diingat?</p>
            <p className="text-xs text-[#477F8D] dark:text-[#94A3B8]">
              Babak 1: {chunks.length} potongan × 3 ulangan. Babak 2: sambung {unit} dengan soal acak.
            </p>
            <button
              type="button"
              onClick={() => {
                setPhase({ kind: 'drill', chunk: 0, results: [] });
                listenNow();
              }}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#246579] hover:bg-[#174C60] text-white text-sm font-semibold"
            >
              <Play className="w-4 h-4" /> Mulai Tantangan
            </button>
            <p className="text-[11px] leading-relaxed text-slate-400 dark:text-slate-500 max-w-md mx-auto">
              Penilaian memakai pengenal suara browser: bisa mengenali kata yang terlewat atau salah huruf, tetapi belum bisa menilai harakat, panjang-pendek, dan makhraj.
            </p>
          </div>
        </>
      )}

      {(phase.kind === 'drill' || phase.kind === 'drillChoice') && (
        <>
          <div className={card}>
            <div className="flex items-center justify-between gap-3 text-xs text-[#477F8D]">
              <span className="font-semibold">Potongan {phase.chunk + 1}/{chunks.length}</span>
              <span className="flex items-center gap-1.5" aria-label="Hasil ulangan">
                {Array.from({ length: REPS }, (_, k) => {
                  const done = phase.results[k];
                  return (
                    <span
                      key={k}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        done === undefined ? 'bg-slate-200 dark:bg-slate-700 text-slate-500' : done ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-white'
                      }`}
                    >
                      {done === undefined ? k + 1 : done ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    </span>
                  );
                })}
              </span>
            </div>
            <div dir="rtl" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 py-6">
              {target.map((w, i) =>
                targetWord(w, i, phase.kind === 'drillChoice' || flash ? 'show' : phase.results.length === 0 ? 'show' : phase.results.length === 1 ? 'samar' : 'hide')
              )}
            </div>
            <div className="min-h-[1.75rem]">
              {flashBadge || (phase.kind === 'drill' && <p className="text-xs text-[#246579] dark:text-[#94A3B8]">{REP_HINT[phase.results.length]}</p>)}
            </div>
          </div>

          {phase.kind === 'drill' && (
            <>
              <p className="text-center text-xs font-semibold text-[#9A7035] dark:text-[#D3A253]">Di bagian ini kamu wajib mengulang 3x, benar atau salah.</p>
              {micPanel('Ketuk mikrofon, lalu baca potongan ini.', 'Nilai bacaanku')}
            </>
          )}

          {phase.kind === 'drillChoice' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white/70 dark:bg-slate-800/60 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 text-center space-y-3">
              <p className="text-sm font-semibold text-[#173B4E] dark:text-white">
                Potongan ini sudah diulang 3x ({phase.results.filter(Boolean).length} benar).
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    rec.reset();
                    setPhase({ kind: 'drill', chunk: phase.chunk, results: [] });
                    listenNow();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-semibold text-[#246579] dark:text-[#A7CDD3] hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  <RotateCcw className="w-4 h-4" /> Ulangi 3x lagi
                </button>
                <button
                  type="button"
                  onClick={() => {
                    rec.reset();
                    if (phase.chunk + 1 < chunks.length) setPhase({ kind: 'drill', chunk: phase.chunk + 1, results: [] });
                    else startQuiz();
                    listenNow();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#246579] hover:bg-[#174C60] text-white text-xs font-semibold"
                >
                  {phase.chunk + 1 < chunks.length ? 'Lanjut ke potongan berikutnya' : 'Lanjut ke Babak 2'} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </>
      )}

      {phase.kind === 'quiz' && question && (
        <>
          <div className={card}>
            <div className="flex items-center justify-between gap-3 text-xs text-[#477F8D]">
              <span className="font-semibold">Soal {phase.index + 1}/{phase.queue.length}</span>
              {question.fails > 0 && <span className="text-amber-700 dark:text-amber-300">Diulang</span>}
            </div>
            <p className="mt-2 text-sm font-semibold text-[#173B4E] dark:text-white">
              {question.kind === 'utuh' ? `Bacakan ${unit} ini utuh tanpa melihat teks.` : QUESTION_TEXT[question.kind]}
            </p>
            <div dir="rtl" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 py-6">
              {question.before.length > 0 && (
                <span className="inline-flex flex-wrap items-center gap-x-2">
                  {question.before.map((w) => plainWord(w, `b_${w.id}`, 'text-[#477F8D] dark:text-[#94A3B8]'))}
                  {question.beforeLabel && <span dir="ltr" className="text-[10px] text-slate-400 font-sans">({question.beforeLabel})</span>}
                </span>
              )}
              {question.target.map((w, i) => targetWord(w, i, flash && !flash.correct ? 'show' : 'hide'))}
              {question.after.length > 0 && (
                <span className="inline-flex flex-wrap items-center gap-x-2">
                  {question.after.map((w) => plainWord(w, `a_${w.id}`, 'text-[#477F8D] dark:text-[#94A3B8]'))}
                  {question.afterLabel && <span dir="ltr" className="text-[10px] text-slate-400 font-sans">({question.afterLabel})</span>}
                </span>
              )}
            </div>
            {question.kind === 'utuh' && <p className="pb-2 text-xs text-[#293640] dark:text-[#CBD5E1]">Artinya: "{translation}"</p>}
            <div className="min-h-[1.75rem]">{flashBadge}</div>
          </div>

          {flash && !flash.correct ? (
            <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-3xl border border-amber-200 dark:border-amber-900 text-center space-y-3">
              <p className="text-xs text-amber-900 dark:text-amber-100">Jawabannya sudah ditampilkan. Kata berwarna oranye belum terbaca.</p>
              <div className="flex flex-wrap justify-center gap-2">
                <button type="button" onClick={retryQuestion} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-300 text-xs font-semibold text-amber-900 dark:text-amber-100 hover:bg-amber-100/60 dark:hover:bg-amber-900/40">
                  <RotateCcw className="w-4 h-4" /> Coba lagi
                </button>
                <button type="button" onClick={skipQuestion} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#246579] hover:bg-[#174C60] text-white text-xs font-semibold">
                  {question.fails + 1 < MAX_FAILS ? 'Lanjut (soal ini diulang nanti)' : 'Lanjut'} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            micPanel('Ketuk mikrofon, lalu bacakan jawabannya.', 'Nilai jawabanku')
          )}
        </>
      )}

      {phase.kind === 'roundDone' && (
        <RoundDone
          title={`${isLastRound ? 'Masya Allah, tantangan selesai!' : `Bagian ${round + 1} selesai!`} ${phase.firstTry}/${phase.total} soal benar di percobaan pertama.`}
          note={phase.firstTry < phase.total ? 'Potongan yang salah dicatat dan akan didahulukan saat kamu bermain lagi.' : undefined}
          actionLabel={isLastRound ? 'Selesai' : 'Lanjut ke bagian berikutnya'}
          onContinue={() => (isLastRound ? onPass() : goRound(round + 1))}
        />
      )}
    </div>
  );
};
