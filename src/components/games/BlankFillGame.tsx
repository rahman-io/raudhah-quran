import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, HelpCircle, CheckCircle2, XCircle, ArrowRight, Sparkles, Lightbulb } from 'lucide-react';
import { useQuranGame } from '../../context/QuranGameContext';
import { QuranWord } from '../../types/quran';
import { SURAHS_DATA } from '../../data/quranData';
import { sounds } from '../../utils/soundEffects';

export const BlankFillGame: React.FC = () => {
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

  // Index of the blank word in current ayah
  const [blankIndex, setBlankIndex] = useState<number>(0);
  const [options, setOptions] = useState<QuranWord[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Setup question when selectedAyah changes
  useEffect(() => {
    setupRound();
  }, [selectedAyah.id]);

  const targetWord = useMemo(() => {
    if (!selectedAyah.words.length) return null;
    return selectedAyah.words[blankIndex] || selectedAyah.words[0];
  }, [selectedAyah, blankIndex]);

  const setupRound = () => {
    const words = selectedAyah.words;
    // The answer must come from the same position that is hidden in the ayah.
    const nextBlankIndex = words.length <= 1 ? 0 :
      Math.min(Math.floor(words.length / 2) + (Math.random() > 0.5 ? 1 : 0), words.length - 1);
    setBlankIndex(nextBlankIndex);

    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowHint(false);

    // Prepare distractors
    const correct = words[nextBlankIndex];
    if (!correct) {
      setOptions([]);
      return;
    }

    // Gather potential distractors from other ayahs in this surah or other surahs
    const otherWords: QuranWord[] = [];
    SURAHS_DATA.forEach((s) => {
      s.ayahs.forEach((a) => {
        a.words.forEach((w) => {
          if (w.arabic !== correct.arabic && !otherWords.some((ow) => ow.arabic === w.arabic)) {
            otherWords.push(w);
          }
        });
      });
    });

    const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5).slice(0, 2);
    const roundOptions = [correct, ...shuffledOthers].sort(() => Math.random() - 0.5);
    setOptions(roundOptions);
  };

  const handleSelectOption = (word: QuranWord) => {
    if (isCorrect) return; // Already solved

    setSelectedAnswer(word.id);
    if (!targetWord) return;

    if (word.arabic === targetWord.arabic) {
      setIsCorrect(true);
      sounds.playCorrectDing();
      addXP(35, 'Tebak Lanjutan Ayat Benar');
      markAyahMemorized(selectedAyah.id);
    } else {
      setIsCorrect(false);
      sounds.playGentleRetry();
    }
  };

  const handleNextAyah = () => {
    const currentIndex = activeSurah.ayahs.findIndex((a) => a.id === selectedAyah.id);
    if (currentIndex < activeSurah.ayahs.length - 1) {
      setSelectedAyah(activeSurah.ayahs[currentIndex + 1]);
    } else {
      setSelectedAyah(activeSurah.ayahs[0]);
      if (currentIndex === 0) setupRound();
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Game Instruction Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div>
          <span className="text-[11px] font-semibold text-[#84A98C] uppercase tracking-wider block">
            Game 2 · Tebak Lanjutan (Blank Fill)
          </span>
          <p className="text-xs text-[#52796F] dark:text-[#94A3B8] mt-0.5">
            Dengarkan atau baca ayatnya, lalu tebak kata Arab yang hilang pada tanda titik-titik.
          </p>
        </div>

        {/* Audio control & Hint */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => playMurottal(selectedAyah)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              isPlayingAudio && currentPlayingAyahId === selectedAyah.id
                ? 'bg-[#E9C46A] text-[#1D3557]'
                : 'bg-[#52796F]/10 text-[#52796F] dark:bg-[#52796F]/30 dark:text-[#84A98C] hover:bg-[#52796F]/20'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{isPlayingAudio && currentPlayingAyahId === selectedAyah.id ? 'Memutar...' : 'Putar Audio'}</span>
          </button>

          <button
            onClick={() => setShowHint(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition-colors"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Petunjuk Arti</span>
          </button>
        </div>
      </div>

      {/* Main Ayah Display with Blank Box */}
      <div className="relative bg-gradient-to-b from-[#FDFBF7] to-[#F4EFEA] dark:from-[#0F1E21] dark:to-[#16272B] rounded-3xl p-6 sm:p-8 border border-[#C5A059]/40 shadow-xs text-center space-y-4">
        {/* Arabic Ayah with Blank */}
        <div
          dir="rtl"
          className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 py-4 min-h-[90px]"
        >
          {selectedAyah.words.map((word, idx) => {
            if (idx === blankIndex) {
              return isCorrect ? (
                <motion.span
                  key={`blank_correct_${idx}`}
                  initial={{ scale: 0.8, backgroundColor: '#E9C46A' }}
                  animate={{ scale: 1, backgroundColor: '#84A98C' }}
                  className="font-arabic font-bold text-white px-4 py-1.5 rounded-2xl shadow-sm inline-block"
                  style={{ fontSize: `${Math.max(fontSize * 1.1, 30)}px` }}
                >
                  {targetWord?.arabic}
                </motion.span>
              ) : (
                <motion.span
                  key={`blank_slot_${idx}`}
                  animate={{
                    borderColor: isCorrect === false ? '#EF4444' : '#C5A059',
                    boxShadow: isCorrect === false ? '0 0 12px rgba(239, 68, 68, 0.4)' : '0 0 8px rgba(197, 160, 89, 0.3)'
                  }}
                  className="inline-block px-5 py-2 rounded-2xl border-2 border-dashed border-[#C5A059] bg-[#EAE3D9]/60 dark:bg-slate-800/80 text-[#84A98C] font-semibold text-lg"
                >
                  [ ... ؟ ... ]
                </motion.span>
              );
            }

            return (
              <span
                key={`word_${word.id}_${idx}`}
                className="font-arabic text-[#1D3557] dark:text-[#E2E8F0] select-text"
                style={{ fontSize: `${fontSize}px` }}
              >
                {word.arabic}
              </span>
            );
          })}
        </div>

        {/* Translation with Blank highlighted */}
        <div className="pt-3 border-t border-[#84A98C]/20 text-xs text-[#52796F] dark:text-[#94A3B8] leading-relaxed max-w-xl mx-auto">
          "{selectedAyah.translationId}"
        </div>

        {/* Hint Box */}
        {showHint && targetWord && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 inline-block text-left"
          >
            <span className="font-bold">Petunjuk:</span> Kata yang hilang bermakna <span className="font-bold">"{targetWord.translation}"</span>.
          </motion.div>
        )}
      </div>

      {/* 3 Choice Buttons */}
      <div className="space-y-2">
        <p className="text-xs text-[#52796F] dark:text-[#94A3B8] text-center font-medium">
          Pilihlah kata yang tepat untuk mengisi kekosongan di atas:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {options.map((opt, idx) => {
            const isSelected = selectedAnswer === opt.id;
            const isThisCorrect = isCorrect && targetWord?.arabic === opt.arabic;
            const isThisWrong = isCorrect === false && isSelected;

            return (
              <motion.button
                key={`blank_opt_${opt.id}_${idx}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectOption(opt)}
                disabled={isCorrect === true}
                className={`p-4 rounded-2xl border text-center transition-all cursor-pointer shadow-xs ${
                  isThisCorrect
                    ? 'bg-[#84A98C] text-white border-[#52796F] shadow-md'
                    : isThisWrong
                    ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-300'
                    : 'bg-white dark:bg-slate-800 hover:bg-[#FDFBF7] dark:hover:bg-slate-700/80 text-[#2F3E46] dark:text-white border-slate-200 dark:border-slate-700'
                }`}
              >
                <span
                  className="font-arabic font-medium block my-1"
                  style={{ fontSize: `${Math.max(fontSize * 0.9, 26)}px` }}
                >
                  {opt.arabic}
                </span>
                <span className="text-[11px] opacity-75 font-sans block">
                  {opt.transliteration}
                </span>
                <span className="text-[10px] text-[#52796F] dark:text-[#A8D5BA] font-medium block mt-1">
                  "{opt.translation}"
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Completion or Retry Status */}
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
                Tebakanmu Tepat Sekali! (+35 XP)
              </h4>
              <p className="text-xs text-[#52796F] dark:text-[#CBD5E1] mt-0.5">
                {selectedAyah.tadabbur.hikmah}
              </p>
            </div>
            <button
              onClick={handleNextAyah}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#52796F] hover:bg-[#354F52] text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <span>{selectedAyah.id === activeSurah.ayahs[activeSurah.ayahs.length - 1].id ? 'Ulangi dari Ayat 1' : 'Lanjut ke Ayat Selanjutnya'}</span>
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
            Belum tepat, ayo coba dengarkan audio ayat atau baca petunjuk arti terlebih dahulu!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
