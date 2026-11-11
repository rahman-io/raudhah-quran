import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, Check, Lock, RotateCcw, Sparkles, X } from 'lucide-react';
import { useQuranGame } from '../../context/QuranGameContext';
import type { ReaderSurah } from '../../services/quranReaderData';
import { getSavedStage, saveStage, splitIntoSegments, STAGES, type HafalanContext } from './hafalanPlan';
import { MemoryStage } from './stages/MemoryStage';
import { TajwidStage } from './stages/TajwidStage';
import { VanishStage } from './stages/VanishStage';
import { PuzzleStage } from './stages/PuzzleStage';
import { BlankStage } from './stages/BlankStage';
import { AudioStage } from './stages/AudioStage';
import { WriteStage } from './stages/WriteStage';

const STAGE_XP = 20;

/**
 * Mode Hafalkan: satu ayat dilatih melalui 7 game secara berurutan dan wajib.
 * Ayat baru ditandai "Sudah Dihafal" setelah ketujuh tahap selesai.
 */
export const HafalanSession: React.FC<{
  surah: ReaderSurah;
  ayahIndex: number;
  onClose: () => void;
  onNextAyah?: () => void;
}> = ({ surah, ayahIndex, onClose, onNextAyah }) => {
  const { markAyahMemorized, addXP, pauseMurottal } = useQuranGame();
  const ayah = surah.ayahs[ayahIndex];
  const ctx: HafalanContext = useMemo(
    () => ({ surah, ayah, ayahIndex, segments: splitIntoSegments(ayah.words) }),
    [surah, ayah, ayahIndex]
  );
  const [stage, setStage] = useState(() => getSavedStage(ayah.id));
  const [finished, setFinished] = useState(false);
  const [stageDone, setStageDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
      pauseMurottal();
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [stage, stageDone, finished]);

  const passStage = () => {
    pauseMurottal();
    addXP(STAGE_XP, `Hafalkan: ${STAGES[stage].title}`);
    if (stage === STAGES.length - 1) {
      saveStage(ayah.id, null);
      markAyahMemorized(ayah.id);
      setFinished(true);
    } else {
      saveStage(ayah.id, stage + 1);
      setStageDone(true);
    }
  };

  const goNextStage = () => {
    setStageDone(false);
    setStage(stage + 1);
  };

  const restart = () => {
    pauseMurottal();
    saveStage(ayah.id, 0);
    setStage(0);
    setStageDone(false);
    setFinished(false);
  };

  const stageProps = { ctx, onPass: passStage };
  const current = STAGES[stage];

  return (
    <div className="fixed inset-0 z-[60] bg-[#F7F4EF] dark:bg-[#0D202A] text-[#293640] dark:text-[#E2E8F0] flex flex-col" role="dialog" aria-modal="true" aria-label="Mode Hafalkan">
      {/* Top bar */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 shrink-0 rounded-xl bg-[#246579] text-white flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#477F8D]">Mode Hafalkan</p>
            <p className="text-sm font-bold truncate">
              QS. {surah.nameLatin} : {ayah.ayahNumber}
              {ctx.segments.length > 1 && (
                <span className="font-normal text-xs text-[#477F8D] dark:text-[#94A3B8]"> · ayat panjang, dilatih {ctx.segments.length} bagian</span>
              )}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-[#246579] dark:text-[#A7CDD3]" title="Tutup (progres tersimpan)">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper 7 tahap */}
        <div className="max-w-4xl mx-auto px-4 pb-3">
          <ol className="flex items-center gap-1.5 overflow-x-auto">
            {STAGES.map((s, i) => {
              const done = finished || i < stage || (i === stage && stageDone);
              const active = !finished && i === stage;
              return (
                <li key={s.id} className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold ${
                      done
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : active
                        ? 'bg-[#246579] text-white'
                        : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                    }`}
                    title={s.goal}
                  >
                    {done ? <Check className="w-3.5 h-3.5" /> : !active ? <Lock className="w-3 h-3" /> : <span>{i + 1}</span>}
                    <span className={active ? '' : 'hidden sm:inline'}>{s.title}</span>
                  </span>
                  {i < STAGES.length - 1 && <span className="w-3 h-px bg-slate-300 dark:bg-slate-600" />}
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
          {finished ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 p-8 rounded-3xl bg-[#246579] text-white text-center space-y-4 shadow-sm"
            >
              <Sparkles className="w-10 h-10 mx-auto text-[#D3A253]" />
              <h2 className="text-xl font-bold">Masya Allah, ketujuh tahap selesai!</h2>
              <p className="text-sm text-white/85">
                QS. {surah.nameLatin} ayat {ayah.ayahNumber} kini tercatat <span className="font-semibold text-[#E9CF99]">Sudah Dihafal</span>.
                Ulangi (muraja'ah) besok agar hafalan semakin kuat.
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-sm font-semibold">
                  Kembali ke bacaan
                </button>
                {onNextAyah && (
                  <button type="button" onClick={onNextAyah} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#D3A253] hover:bg-[#E3B973] text-[#173B4E] text-sm font-semibold">
                    Hafalkan ayat berikutnya <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ) : stageDone ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-7 rounded-3xl bg-white dark:bg-slate-800/80 border border-[#477F8D]/40 text-center space-y-3"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold">Tahap {stage + 1} · {current.title} selesai</h3>
              <p className="text-xs text-[#246579] dark:text-[#A7CDD3]">+{STAGE_XP} XP · Progres tersimpan, kamu bisa melanjutkan kapan saja.</p>
              <button type="button" onClick={goNextStage} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#246579] hover:bg-[#174C60] text-white rounded-xl text-sm font-semibold">
                Lanjut ke Tahap {stage + 2}: {STAGES[stage + 1].title} <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <div key={`${ayah.id}_${stage}`}>
              {stage > 0 && (
                <div className="mb-4 flex items-center justify-between gap-3 text-xs text-[#477F8D] dark:text-[#94A3B8]">
                  <span>Melanjutkan hafalan: tahap {stage + 1} dari {STAGES.length}</span>
                  <button type="button" onClick={restart} className="inline-flex items-center gap-1 hover:underline">
                    <RotateCcw className="w-3.5 h-3.5" /> Mulai dari tahap 1
                  </button>
                </div>
              )}
              {current.id === 'memory' && <MemoryStage {...stageProps} />}
              {current.id === 'tajwid' && <TajwidStage {...stageProps} />}
              {current.id === 'vanish' && <VanishStage {...stageProps} />}
              {current.id === 'puzzle' && <PuzzleStage {...stageProps} />}
              {current.id === 'blank' && <BlankStage {...stageProps} />}
              {current.id === 'audio' && <AudioStage {...stageProps} />}
              {current.id === 'write' && <WriteStage {...stageProps} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
