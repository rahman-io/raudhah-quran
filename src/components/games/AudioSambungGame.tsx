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
  const isLastAyah = currentAyahIdx >= activeSurah.ayahs.length - 1;
  const targetNextAyah = isLastAyah
    ? activeSurah.ayahs[0] // If last ayah, challenge targets loop back or review
    : activeSurah.ayahs[currentAyahIdx + 1];

  const setupRound = () => {
    setSelectedAnswerId(null);
    setIsCorrect(null);

    // Pick 2 distractors
    const pool: Ayah[] = [];
    SURAHS_DATA.forEach((s) => {
      s.ayahs.forEach((a) => {
        if (a.id !== targetNextAyah.id && a.id !== selectedAyah.id) {
          pool.push(a);
        }
      });
    });

    const distractors = [...pool].sort(() => Math.random() - 0.5).slice(0, 2);
    const roundOptions = [targetNextAyah, ...distractors].sort(() => Math.random() - 0.5);
    setOptions(roundOptions);

    // Autoplay the prompt ayah audio softly
    playMurottal(selectedAyah);
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
    if (!isLastAyah) {
      setSelectedAyah(activeSurah.ayahs[currentAyahIdx + 1]);
    } else {
      setupRound();
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Instruction */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div>
          <span className="text-[11px] font-semibold text-[#84A98C] uppercase tracking-wider block">
            Game 4 · Sambung Ayat dari Audio
          </span>
          <p className="text-xs text-[#52796F] dark:text-[#94A3B8] mt-0.5">
            Dengarkan lantunan ayat pembuka di bawah ini, lalu pilih sambungan ayat berikutnya dengan tepat!
          </p>
        </div>

        <button
          onClick={() => playMurottal(selectedAyah)}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-colors shadow-xs ${
            isPlayingAudio && currentPlayingAyahId === selectedAyah.id
              ? 'bg-[#E9C46A] text-[#1D3557]'
              : 'bg-[#52796F] text-white hover:bg-[#354F52]'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>{isPlayingAudio && currentPlayingAyahId === selectedAyah.id ? 'Sedang Memutar...' : 'Putar Ulang Audio'}</span>
        </button>
      </div>

      {/* Audio Wave Soundbox Prompt */}
      <div className="bg-gradient-to-b from-[#FDFBF7] to-[#F4EFEA] dark:from-[#0F1E21] dark:to-[#16272B] rounded-3xl p-6 border border-[#C5A059]/40 text-center space-y-4 shadow-xs">
        <div className="flex items-center justify-center gap-2 text-xs text-[#84A98C] font-semibold">
          <Music2 className="w-4 h-4 text-[#E9C46A]" />
          <span>Ayat Pembuka: QS. {activeSurah.nameLatin} Ayat {selectedAyah.ayahNumber}</span>
        </div>

        {/* Big Arabic Text of Prompt Ayah */}
        <p
          className="font-arabic text-[#1D3557] dark:text-[#E9C46A] leading-relaxed my-2"
          style={{ fontSize: `${fontSize}px` }}
        >
          {selectedAyah.arabicText}
        </p>

        <p className="text-xs text-[#52796F] dark:text-[#CBD5E1] max-w-lg mx-auto">
          "{selectedAyah.translationId}"
        </p>

        {/* Audio Pulse Ring Animation */}
        <div className="flex items-center justify-center gap-1 py-1">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scaleY: isPlayingAudio && currentPlayingAyahId === selectedAyah.id ? [0.4, 1.8, 0.4] : 0.4
              }}
              transition={{ repeat: Infinity, duration: 0.6 + i * 0.15, ease: 'easeInOut' }}
              className="w-1.5 h-6 bg-[#52796F] dark:bg-[#84A98C] rounded-full"
            />
          ))}
        </div>
      </div>

      {/* Answer Choices */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-[#52796F] dark:text-[#94A3B8] text-center">
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
                    ? 'bg-[#84A98C] text-white border-[#52796F] ring-2 ring-[#84A98C]/30 shadow-md'
                    : isThisWrong
                    ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-300'
                    : 'bg-white dark:bg-slate-800 hover:bg-[#FDFBF7] dark:hover:bg-slate-700/80 text-[#2F3E46] dark:text-white border-slate-200 dark:border-slate-700'
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
            className="p-5 bg-gradient-to-r from-[#D8EADB] to-[#F0F7F2] dark:from-[#133230] dark:to-[#1E3A34] border border-[#84A98C] rounded-3xl text-center space-y-3"
          >
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#52796F] text-white">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#2F3E46] dark:text-white">
                Sambungan Ayat Benar! (+40 XP)
              </h4>
              <p className="text-xs text-[#52796F] dark:text-[#CBD5E1] mt-0.5">
                Alhamdulillah, pendengaran dan memori hafalanmu tersambung dengan baik.
              </p>
            </div>
            <button
              onClick={handleNextRound}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#52796F] hover:bg-[#354F52] text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <span>Lanjut ke Ayat Selanjutnya</span>
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
