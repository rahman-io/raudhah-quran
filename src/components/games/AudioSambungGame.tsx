import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, CheckCircle2, ArrowRight, Sparkles, Music2 } from 'lucide-react';
import { useQuranGame } from '../../context/QuranGameContext';
import { Ayah } from '../../types/quran';
import { SURAHS_DATA } from '../../data/quranData';
import { sounds } from '../../utils/soundEffects';

export const AudioSambungGame: React.FC = () => {
  const {
    selectedAyah,
    activeSurah,
    setSelectedAyah,
    addXP,
    markAyahMemorized,
    playMurottal,
    pauseMurottal,
    isPlayingAudio,
    currentPlayingAyahId,
    fontSize,
    mode
  } = useQuranGame();

  const [options, setOptions] = useState<Ayah[]>([]);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Setup round
  useEffect(() => {
    setupRound();
  }, [selectedAyah.id]);

  const currentAyahIdx = activeSurah.ayahs.findIndex((a) => a.id === selectedAyah.id);
  const isLastAyah = currentAyahIdx === activeSurah.ayahs.length - 1;
  // At the end of a surah, use the previous ayah as the prompt; the first
  // ayah is never the "continuation" of the last ayah.
  const promptAyah = isLastAyah && currentAyahIdx > 0
    ? activeSurah.ayahs[currentAyahIdx - 1] : selectedAyah;
  const targetNextAyah = isLastAyah ? selectedAyah : activeSurah.ayahs[currentAyahIdx + 1];
  const isLastRound = targetNextAyah.id === activeSurah.ayahs[activeSurah.ayahs.length - 1].id;

  const setupRound = () => {
    setSelectedAnswerId(null);
    setIsCorrect(null);

    // Pick 2 distractors
    const pool: Ayah[] = [];
    SURAHS_DATA.forEach((s) => {
      s.ayahs.forEach((a) => {
        if (a.id !== targetNextAyah.id && a.id !== promptAyah.id) {
          pool.push(a);
        }
      });
    });

    const distractors = [...pool].sort(() => Math.random() - 0.5).slice(0, 2);
    const roundOptions = [targetNextAyah, ...distractors].sort(() => Math.random() - 0.5);
    setOptions(roundOptions);

    // Autoplay the prompt ayah audio softly
    playMurottal(promptAyah);
  };

  const handleSelectOption = (opt: Ayah) => {
    if (isCorrect) return;

    setSelectedAnswerId(opt.id);

    if (opt.id === targetNextAyah.id) {
      setIsCorrect(true);
      sounds.playCorrectDing();
      addXP(40, 'Sambung Ayat dari Audio Benar');
      markAyahMemorized(targetNextAyah.id);
    } else {
      setIsCorrect(false);
      sounds.playGentleRetry();
    }
  };

  const handleNextRound = () => {
    setSelectedAyah(isLastRound ? activeSurah.ayahs[0] : targetNextAyah);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Instruction */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div>
          <span className="text-[11px] font-semibold text-[#477F8D] uppercase tracking-wider block">
            Game 4 · Sambung Ayat dari Audio
          </span>
          <p className="text-xs text-[#246579] dark:text-[#94A3B8] mt-0.5">
            Dengarkan lantunan ayat pembuka di bawah ini, lalu pilih sambungan ayat berikutnya dengan tepat!
          </p>
        </div>

        <button
          onClick={() => playMurottal(promptAyah)}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-colors shadow-xs ${
            isPlayingAudio && currentPlayingAyahId === promptAyah.id
              ? 'bg-[#D3A253] text-[#173B4E]'
              : 'bg-[#246579] text-white hover:bg-[#174C60]'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>{isPlayingAudio && currentPlayingAyahId === promptAyah.id ? 'Sedang Memutar...' : 'Putar Ulang Audio'}</span>
        </button>
      </div>

      {/* Audio Wave Soundbox Prompt */}
      <div className="bg-gradient-to-b from-[#F8F6F1] to-[#F1EDE6] dark:from-[#102731] dark:to-[#152E38] rounded-3xl p-6 border border-[#BE9452]/40 text-center space-y-4 shadow-xs">
        <div className="flex items-center justify-center gap-2 text-xs text-[#477F8D] font-semibold">
          <Music2 className="w-4 h-4 text-[#D3A253]" />
          <span>Ayat Pembuka: QS. {activeSurah.nameLatin} Ayat {promptAyah.ayahNumber}</span>
        </div>

        {/* Big Arabic Text of Prompt Ayah */}
        <p
          className="font-arabic text-[#173B4E] dark:text-[#D3A253] leading-relaxed my-2"
          style={{ fontSize: `${fontSize}px` }}
        >
          {promptAyah.arabicText}
        </p>

        <p className="text-xs text-[#246579] dark:text-[#CBD5E1] max-w-lg mx-auto">
          "{promptAyah.translationId}"
        </p>

        {/* Audio Pulse Ring Animation */}
        <div className="flex items-center justify-center gap-1 py-1">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scaleY: isPlayingAudio && currentPlayingAyahId === promptAyah.id ? [0.4, 1.8, 0.4] : 0.4
              }}
              transition={{ repeat: Infinity, duration: 0.6 + i * 0.15, ease: 'easeInOut' }}
              className="w-1.5 h-6 bg-[#246579] dark:bg-[#477F8D] rounded-full"
            />
          ))}
        </div>
      </div>

      {/* Answer Choices */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-[#246579] dark:text-[#94A3B8] text-center">
          Pilih sambungan ayat yang benar:
        </p>

        <div className="grid grid-cols-1 gap-3">
          {options.map((opt, index) => {
            const isSelected = selectedAnswerId === opt.id;
            const isThisCorrect = isCorrect && targetNextAyah.id === opt.id;
            const isThisWrong = isCorrect === false && isSelected;

            return (
              <motion.div
                key={`sambung_opt_${opt.id}_${index}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectOption(opt);
                  }
                }}
                whileHover={{ scale: isCorrect === true ? 1 : 1.01 }}
                whileTap={{ scale: isCorrect === true ? 1 : 0.99 }}
                onClick={() => handleSelectOption(opt)}
                className={`p-4 sm:p-5 rounded-2xl border text-right transition-all cursor-pointer shadow-xs flex items-center justify-between gap-4 select-none ${
                  isThisCorrect
                    ? 'bg-[#477F8D] text-white border-[#246579] ring-2 ring-[#477F8D]/30 shadow-md'
                    : isThisWrong
                    ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-300'
                    : 'bg-white dark:bg-slate-800 hover:bg-[#F8F6F1] dark:hover:bg-slate-700/80 text-[#293640] dark:text-white border-slate-200 dark:border-slate-700'
                }`}
              >
                {/* Audio preview button on choice */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playMurottal(opt);
                  }}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 shrink-0 cursor-pointer"
                  title="Dengarkan ayat pilihan ini"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                {/* Arabic Text & Translation */}
                <div className="flex-1 min-w-0">
                  <p
                    className="font-arabic font-medium mb-1"
                    style={{ fontSize: `${Math.max(fontSize * 0.9, 24)}px` }}
                  >
                    {opt.arabicText}
                  </p>
                  <p className="text-[11px] opacity-75 font-sans font-normal truncate">
                    "{opt.translationId}"
                  </p>
                </div>

                {/* Choice Letter badge */}
                <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                  {String.fromCharCode(65 + index)}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Completion Status */}
      <AnimatePresence>
        {isCorrect === true && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-gradient-to-r from-[#E2EEF0] to-[#F4F8F8] dark:from-[#123744] dark:to-[#193E4B] border border-[#477F8D] rounded-3xl text-center space-y-3"
          >
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#246579] text-white">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#293640] dark:text-white">
                Sambungan Ayat Benar! (+40 XP)
              </h4>
              <p className="text-xs text-[#246579] dark:text-[#CBD5E1] mt-0.5">
                Alhamdulillah, pendengaran dan memori hafalanmu tersambung dengan baik.
              </p>
            </div>
            <button
              onClick={handleNextRound}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#246579] hover:bg-[#174C60] text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <span>{isLastRound ? 'Ulangi dari Ayat 1' : 'Lanjut ke Ayat Selanjutnya'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {isCorrect === false && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-50 dark:bg-red-950/60 rounded-2xl border border-red-200 dark:border-red-800 text-center text-xs text-red-700 dark:text-red-300 font-medium"
          >
            Belum pas! Coba tekan tombol audio di sebelah kiri pilihan untuk mendengarkan lafaznya.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
