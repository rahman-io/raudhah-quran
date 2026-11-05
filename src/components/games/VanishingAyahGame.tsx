import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Eye, EyeOff, CheckCircle2, RotateCcw, ArrowRight, Sparkles, Award } from 'lucide-react';
import { useQuranGame } from '../../context/QuranGameContext';
import { sounds } from '../../utils/soundEffects';

type Stage = 100 | 50 | 0;

export const VanishingAyahGame: React.FC = () => {
  const {
    selectedAyah,
    activeSurah,
    setSelectedAyah,
    addXP,
    markAyahMemorized,
    playMurottal,
    isPlayingAudio,
    currentPlayingAyahId,
    fontSize,
    mode
  } = useQuranGame();

  const [stage, setStage] = useState<Stage>(100);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [assessmentGiven, setAssessmentGiven] = useState<string | null>(null);
  const [rewardedAyahIds, setRewardedAyahIds] = useState<string[]>([]);

  useEffect(() => {
    setStage(100);
    setIsRevealed(false);
    setAssessmentGiven(null);
  }, [selectedAyah.id]);

  const resetStage = (newStage: Stage) => {
    sounds.playWordClick();
    setStage(newStage);
    setIsRevealed(false);
    setAssessmentGiven(null);
  };

  const handleToggleReveal = () => {
    sounds.playWordClick();
    setIsRevealed(!isRevealed);
  };

  const handleRateMastery = (rating: 'belum' | 'cukup' | 'mutqin') => {
    if (assessmentGiven || (rating === 'mutqin' && stage !== 0)) return;
    setAssessmentGiven(rating);
    if (rating === 'mutqin') {
      sounds.playAyahComplete();
      if (!rewardedAyahIds.includes(selectedAyah.id)) {
        addXP(50, 'Hafalan Mutqin');
        setRewardedAyahIds((ids) => [...ids, selectedAyah.id]);
      }
      markAyahMemorized(selectedAyah.id);
    } else if (rating === 'cukup') {
      sounds.playCorrectDing();
      if (!rewardedAyahIds.includes(selectedAyah.id)) {
        addXP(25, 'Hafalan Cukup');
        setRewardedAyahIds((ids) => [...ids, selectedAyah.id]);
      }
    } else {
      sounds.playGentleRetry();
    }
  };

  const handleNextAyah = () => {
    const currentIndex = activeSurah.ayahs.findIndex((a) => a.id === selectedAyah.id);
    setSelectedAyah(activeSurah.ayahs[currentIndex < activeSurah.ayahs.length - 1 ? currentIndex + 1 : 0]);
    setStage(100);
    setIsRevealed(false);
    setAssessmentGiven(null);
  };

  return (
    <div className="w-full space-y-6">
      {/* Game Instruction Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div>
          <span className="text-[11px] font-semibold text-[#477F8D] uppercase tracking-wider block">
            Game 3 · Ayat Menghilang (The Vanishing Ayah)
          </span>
          <p className="text-xs text-[#246579] dark:text-[#94A3B8] mt-0.5">
            Tingkatkan ketajaman hafalan secara bertahap: dari 100% tampak hingga 0% menghilang.
          </p>
        </div>

        {/* Audio control */}
        <button
          onClick={() => playMurottal(selectedAyah)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            isPlayingAudio && currentPlayingAyahId === selectedAyah.id
              ? 'bg-[#D3A253] text-[#173B4E]'
              : 'bg-[#246579]/10 text-[#246579] dark:bg-[#246579]/30 dark:text-[#477F8D] hover:bg-[#246579]/20'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>{isPlayingAudio && currentPlayingAyahId === selectedAyah.id ? 'Memutar...' : 'Verifikasi Audio'}</span>
        </button>
      </div>

      {/* Vanishing Stage Segmented Selector */}
      <div className="flex items-center justify-center p-1.5 bg-[#F1EDE6] dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md mx-auto">
        <button
          onClick={() => resetStage(100)}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            stage === 100
              ? 'bg-white dark:bg-slate-700 text-[#173B4E] dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          100% Tampak
        </button>

        <button
          onClick={() => resetStage(50)}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            stage === 50
              ? 'bg-[#D3A253] text-[#173B4E] font-bold shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          50% Samarkan
        </button>

        <button
          onClick={() => resetStage(0)}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            stage === 0
              ? 'bg-[#246579] text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          0% Mandiri
        </button>
      </div>

      {/* Ayah Stage Display Area */}
      <div className="relative min-h-[170px] bg-gradient-to-b from-[#F8F6F1] to-[#F1EDE6] dark:from-[#102731] dark:to-[#152E38] rounded-3xl p-6 sm:p-8 border border-[#BE9452]/40 text-center flex flex-col justify-between shadow-xs">
        {/* Stage description tag */}
        <div className="flex items-center justify-between text-xs text-[#477F8D] mb-2">
          <span>
            {stage === 100 && 'Tahap 1: Baca berulang-ulang untuk memperkuat ingatan'}
            {stage === 50 && 'Tahap 2: Kata genap disamarkan, latih sambungan ingatanmu'}
            {stage === 0 && 'Tahap 3: Ujian mandiri tanpa melihat teks'}
          </span>
          <button
            onClick={handleToggleReveal}
            className="flex items-center gap-1 text-[#246579] dark:text-[#A7CDD3] hover:underline cursor-pointer"
          >
            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isRevealed ? 'Sembunyikan Kembali' : 'Buka Kunci'}</span>
          </button>
        </div>

        {/* The Vanishing Text Display */}
        <div
          dir="rtl"
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-6"
        >
          {selectedAyah.words.map((word, idx) => {
            const isHiddenIn50 = stage === 50 && idx % 2 === 1;
            const isHiddenIn0 = stage === 0;
            const shouldHide = !isRevealed && (isHiddenIn0 || isHiddenIn50);

            return (
              <motion.span
                key={`vanish_${word.id}_${idx}`}
                layout
                className={`font-arabic transition-all duration-300 rounded-xl px-2 py-0.5 ${
                  shouldHide
                    ? 'blur-md opacity-20 bg-slate-300/40 dark:bg-slate-700/50 select-none'
                    : 'text-[#173B4E] dark:text-[#D3A253]'
                }`}
                style={{ fontSize: `${fontSize}px` }}
              >
                {shouldHide ? '•••' : word.arabic}
              </motion.span>
            );
          })}
        </div>

        {/* Translation Guidance */}
        <div className="pt-3 border-t border-[#477F8D]/20 text-xs text-[#246579] dark:text-[#94A3B8] max-w-xl mx-auto">
          "{selectedAyah.translationId}"
        </div>
      </div>

      {/* Self-Assessment & Reward Section */}
      <div className="bg-white/70 dark:bg-slate-800/60 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 text-center space-y-3">
        <p className="text-xs font-semibold text-[#293640] dark:text-[#CBD5E1]">
          Bagaimana kelancaran hafalanmu pada ayat ini?
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={() => handleRateMastery('belum')}
            className={`px-4 py-2 text-xs font-medium rounded-xl border transition-colors ${
              assessmentGiven === 'belum'
                ? 'bg-amber-100 border-amber-400 text-amber-800'
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-slate-50'
            }`}
          >
            Masih Perlu Diulang
          </button>

          <button
            onClick={() => handleRateMastery('cukup')}
            className={`px-4 py-2 text-xs font-medium rounded-xl border transition-colors ${
              assessmentGiven === 'cukup'
                ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-slate-50'
            }`}
          >
            Cukup Lancar (+25 XP)
          </button>

          <button
            onClick={() => handleRateMastery('mutqin')}
            disabled={stage !== 0 || assessmentGiven !== null}
            title={stage !== 0 ? 'Selesaikan tahap 0% Mandiri sebelum menilai hafalan mutqin' : undefined}
            className={`px-5 py-2 text-xs font-bold rounded-xl border shadow-xs transition-all ${
              assessmentGiven === 'mutqin'
                ? 'bg-[#246579] text-white border-[#174C60]'
                : 'bg-[#D3A253] hover:bg-[#E3B973] text-[#173B4E] border-[#BE9452] disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            Mutqin! Hafal Tanpa Teks (+50 XP)
          </button>
        </div>

        {assessmentGiven && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2 flex items-center justify-center gap-2"
          >
            <button
              onClick={handleNextAyah}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#246579] hover:bg-[#174C60] text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <span>{selectedAyah.id === activeSurah.ayahs[activeSurah.ayahs.length - 1].id ? 'Ulangi dari Ayat 1' : 'Lanjut ke Ayat Selanjutnya'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
