import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft, Award, BookOpen, CheckCircle2, EyeOff, HelpCircle, KeyRound, Layers, Mic, Music, PenLine, Play, Puzzle, RotateCcw, Sparkles, X
} from 'lucide-react';
import { useQuranGame } from '../../context/QuranGameContext';
import type { ReaderSurah } from '../../services/quranReaderData';
import { getCompletedStages, markStageCompleted, splitIntoSegments, STAGES, type HafalanContext, type StageId } from './hafalanPlan';
import { MemoryStage } from './stages/MemoryStage';
import { TajwidStage } from './stages/TajwidStage';
import { VanishStage } from './stages/VanishStage';
import { PuzzleStage } from './stages/PuzzleStage';
import { BlankStage } from './stages/BlankStage';
import { AudioStage } from './stages/AudioStage';
import { WriteStage } from './stages/WriteStage';
import { TaisirStage } from './stages/TaisirStage';
import { ReciteStage } from './stages/ReciteStage';
import { isBrowserRecitationSupported } from '../../services/recitation/browserListener';
import { useBackHandler } from '../../utils/backNavigation';
import { markActivity } from '../../services/dailyActivity';

const STAGE_XP = 20;

const STAGE_ICONS: Record<StageId, React.ElementType> = {
  memory: Layers, tajwid: Award, vanish: EyeOff, puzzle: Puzzle, blank: HelpCircle, audio: Music, write: PenLine, taisir: KeyRound, recite: Mic
};

/**
 * Game yang wajib diselesaikan agar ayat tercatat Sudah Dihafal. Tantangan Bacaan butuh
 * pengenal suara; di browser yang tidak mendukung, game itu tidak dihitung.
 */
const REQUIRED_STAGES = isBrowserRecitationSupported() ? STAGES : STAGES.filter((s) => s.id !== 'recite');

type View = { kind: 'menu' } | { kind: 'play'; id: StageId; run: number } | { kind: 'done'; id: StageId };

/**
 * Mode Hafalkan: 9 game penguat hafalan untuk satu ayat. Pengguna bebas memilih
 * game mana saja dan dalam urutan apa saja. Bila semua game wajib pernah diselesaikan,
 * ayat otomatis tercatat "Sudah Dihafal".
 */
export const HafalanSession: React.FC<{
  surah: ReaderSurah;
  ayahIndex: number;
  onClose: () => void;
  onNextAyah?: () => void;
}> = ({ surah, ayahIndex, onClose, onNextAyah }) => {
  const { markAyahMemorized, memorizedAyahIds, addXP, pauseMurottal, fontSize } = useQuranGame();
  const ayah = surah.ayahs[ayahIndex];
  const ctx: HafalanContext = useMemo(
    () => ({ surah, ayah, ayahIndex, segments: splitIntoSegments(ayah.words) }),
    [surah, ayah, ayahIndex]
  );
  const [completed, setCompleted] = useState<StageId[]>(() => getCompletedStages(ayah.id));
  const [view, setView] = useState<View>({ kind: 'menu' });
  const [justFinishedAll, setJustFinishedAll] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const runCounter = useRef(0);
  const isMemorized = memorizedAyahIds.includes(ayah.id);

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
  }, [view]);

  const open = (id: StageId) => {
    pauseMurottal();
    runCounter.current += 1;
    setView({ kind: 'play', id, run: runCounter.current });
  };

  const backToMenu = () => {
    pauseMurottal();
    setView({ kind: 'menu' });
  };

  const passStage = (id: StageId) => {
    pauseMurottal();
    markActivity('game');
    const firstTime = !completed.includes(id);
    const next = markStageCompleted(ayah.id, id);
    setCompleted(next);
    if (firstTime) addXP(STAGE_XP, `Hafalkan: ${STAGES.find((s) => s.id === id)?.title}`);
    if (firstTime && REQUIRED_STAGES.every((s) => next.includes(s.id))) {
      if (!isMemorized) markAyahMemorized(ayah.id);
      setJustFinishedAll(true);
    }
    setView({ kind: 'done', id });
  };

  // Tombol back HP: dari game kembali ke pilihan game.
  useBackHandler(view.kind !== 'menu', backToMenu);

  const doneCount = REQUIRED_STAGES.filter((s) => completed.includes(s.id)).length;
  const suggestion = REQUIRED_STAGES.find((s) => !completed.includes(s.id));
  const currentStage = view.kind !== 'menu' ? STAGES.find((s) => s.id === view.id)! : null;

  return (
    <div className="fixed inset-0 z-[60] bg-[#F7F4EF] dark:bg-[#0D202A] text-[#293640] dark:text-[#E2E8F0] flex flex-col" role="dialog" aria-modal="true" aria-label="Mode Hafalkan">
      {/* Top bar */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white/85 dark:bg-slate-900/70 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          {view.kind === 'menu' ? (
            <div className="w-9 h-9 shrink-0 rounded-xl bg-[#246579] text-white flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          ) : (
            <button type="button" onClick={backToMenu} className="w-9 h-9 shrink-0 rounded-xl bg-[#246579]/10 dark:bg-[#246579]/30 text-[#246579] dark:text-[#A7CDD3] hover:bg-[#246579]/20 flex items-center justify-center" title="Kembali ke pilihan game">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#477F8D]">
              {currentStage ? currentStage.title : 'Mode Hafalkan'}
            </p>
            <p className="text-sm font-bold truncate">
              QS. {surah.nameLatin} : {ayah.ayahNumber}
              {ctx.segments.length > 1 && (
                <span className="font-normal text-xs text-[#477F8D] dark:text-[#94A3B8]"> · {ctx.segments.length} bagian</span>
              )}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5" aria-label={`${doneCount} dari ${REQUIRED_STAGES.length} game selesai`}>
            {REQUIRED_STAGES.map((s) => (
              <span key={s.id} className={`w-2 h-2 rounded-full ${completed.includes(s.id) ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
            ))}
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#F1EDE6] dark:bg-slate-800 text-[#9A7035] dark:text-[#D3A253] whitespace-nowrap">
            {doneCount}/{REQUIRED_STAGES.length}
          </span>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-[#246579] dark:text-[#A7CDD3]" title="Tutup (progres tersimpan)">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6">
          {view.kind === 'menu' && (
            <>
              {/* Ayat yang sedang dihafal */}
              <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 space-y-3">
                <p dir="rtl" className="font-arabic text-right leading-[2.1] text-[#173B4E] dark:text-[#D3A253]" style={{ fontSize: `${Math.max(Math.round(fontSize * 0.9), 24)}px` }}>
                  {ayah.arabicText}
                </p>
                <p className="text-sm text-[#293640] dark:text-[#CBD5E1]">"{ayah.translationId}"</p>
              </div>

              {justFinishedAll && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-3xl bg-[#246579] text-white flex flex-col sm:flex-row sm:items-center gap-4">
                  <Sparkles className="w-8 h-8 text-[#D3A253] shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold">Masya Allah, semua {REQUIRED_STAGES.length} game selesai!</p>
                    <p className="text-xs text-white/85 mt-0.5">Ayat ini tercatat Sudah Dihafal. Ulangi besok agar hafalan semakin kuat.</p>
                  </div>
                  {onNextAyah && (
                    <button type="button" onClick={onNextAyah} className="px-4 py-2 rounded-xl bg-[#D3A253] hover:bg-[#E3B973] text-[#173B4E] text-xs font-semibold whitespace-nowrap">
                      Ayat berikutnya →
                    </button>
                  )}
                </motion.div>
              )}

              <div>
                <h2 className="text-base font-bold text-[#173B4E] dark:text-white">Pilih cara menghafal</h2>
                <p className="text-xs text-[#477F8D] dark:text-[#94A3B8] mt-0.5">
                  Mainkan game mana saja, dalam urutan apa saja.
                  {ctx.segments.length > 1 && ' Ayat panjang ini otomatis dilatih per bagian.'}
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                {STAGES.map((stage) => {
                  const Icon = STAGE_ICONS[stage.id];
                  const done = completed.includes(stage.id);
                  return (
                    <motion.button
                      key={stage.id}
                      type="button"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => open(stage.id)}
                      className={`group relative text-left p-3 sm:p-4 rounded-2xl border transition-colors flex flex-col sm:flex-row items-start gap-2 sm:gap-3 ${
                        done
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-[#477F8D]'
                      }`}
                    >
                      <span className={`w-9 h-9 sm:w-11 sm:h-11 shrink-0 rounded-xl flex items-center justify-center ${
                        done ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300' : 'bg-[#246579]/10 dark:bg-[#246579]/30 text-[#246579] dark:text-[#A7CDD3]'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-bold text-[#173B4E] dark:text-white">{stage.title}</span>
                        <span className="hidden sm:block text-xs text-[#477F8D] dark:text-[#94A3B8] mt-0.5">{stage.goal}</span>
                        <span className={`inline-flex items-center gap-1 mt-1 sm:mt-2 text-[11px] font-semibold ${done ? 'text-emerald-700 dark:text-emerald-300' : 'text-[#246579] dark:text-[#A7CDD3]'}`}>
                          {done ? <><CheckCircle2 className="w-3.5 h-3.5" /> Selesai<span className="hidden sm:inline"> · main lagi</span></> : <><Play className="w-3.5 h-3.5" /> Mainkan</>}
                        </span>
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </>
          )}

          {view.kind === 'play' && (
            <div key={`${view.id}_${view.run}`}>
              {view.id === 'memory' && <MemoryStage ctx={ctx} onPass={() => passStage('memory')} />}
              {view.id === 'tajwid' && <TajwidStage ctx={ctx} onPass={() => passStage('tajwid')} />}
              {view.id === 'vanish' && <VanishStage ctx={ctx} onPass={() => passStage('vanish')} />}
              {view.id === 'puzzle' && <PuzzleStage ctx={ctx} onPass={() => passStage('puzzle')} />}
              {view.id === 'blank' && <BlankStage ctx={ctx} onPass={() => passStage('blank')} />}
              {view.id === 'audio' && <AudioStage ctx={ctx} onPass={() => passStage('audio')} />}
              {view.id === 'write' && <WriteStage ctx={ctx} onPass={() => passStage('write')} />}
              {view.id === 'taisir' && <TaisirStage ctx={ctx} onPass={() => passStage('taisir')} />}
              {view.id === 'recite' && <ReciteStage ctx={ctx} onPass={() => passStage('recite')} />}
            </div>
          )}

          {view.kind === 'done' && currentStage && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-7 rounded-3xl bg-white dark:bg-slate-800/80 border border-[#477F8D]/40 text-center space-y-4"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold">{currentStage.title} selesai!</h3>
                <p className="text-xs text-[#246579] dark:text-[#A7CDD3] mt-1">
                  {doneCount}/{REQUIRED_STAGES.length} game selesai untuk ayat ini.
                  {justFinishedAll && ' Ayat ini kini tercatat Sudah Dihafal.'}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <button type="button" onClick={() => open(currentStage.id)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-semibold text-[#246579] dark:text-[#A7CDD3] hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <RotateCcw className="w-4 h-4" /> Main lagi
                </button>
                <button type="button" onClick={backToMenu} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-semibold text-[#246579] dark:text-[#A7CDD3] hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  Pilih game lain
                </button>
                {suggestion && (
                  <button type="button" onClick={() => open(suggestion.id)} className="px-4 py-2 rounded-xl bg-[#246579] hover:bg-[#174C60] text-white text-xs font-semibold">
                    Coba {suggestion.title} →
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
