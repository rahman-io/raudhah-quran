import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, HelpCircle, Volume2, CheckCircle2, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { useQuranGame } from '../../context/QuranGameContext';
import { QuranWord } from '../../types/quran';
import { sounds } from '../../utils/soundEffects';

export const WordPuzzleGame: React.FC = () => {
  const {
    selectedAyah,
    activeSurah,
    setSelectedAyah,
    markAyahMemorized,
    addXP,
    inspectWord,
    playMurottal,
    isPlayingAudio,
    currentPlayingAyahId,
    fontSize,
    mode
  } = useQuranGame();

  // Selected words by the user in order
  const [selectedWords, setSelectedWords] = useState<QuranWord[]>([]);
  // Remaining pool of words (shuffled)
  const [availableWords, setAvailableWords] = useState<QuranWord[]>([]);
  // Game result state
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isWrongOrder, setIsWrongOrder] = useState<boolean>(false);
  const [hintIndex, setHintIndex] = useState<number | null>(null);

  // Initialize/reset puzzle whenever selected ayah changes
  useEffect(() => {
    resetPuzzle();
  }, [selectedAyah.id]);

  const targetWords = useMemo(() => selectedAyah.words, [selectedAyah]);

  const resetPuzzle = () => {
    const shuffled = [...selectedAyah.words];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // If by chance random sort matches original, shuffle again
    if (
      shuffled.length > 1 &&
      shuffled.every((word, index) => word.id === selectedAyah.words[index].id)
    ) {
      shuffled.reverse();
    }
    setAvailableWords(shuffled);
    setSelectedWords([]);
    setIsCompleted(false);
    setIsWrongOrder(false);
    setHintIndex(null);
  };

  const handleSelectWord = (word: QuranWord) => {
    if (isCompleted) return;
    sounds.playWordClick();
    setIsWrongOrder(false);
    setHintIndex(null);

    const nextSelected = [...selectedWords, word];
    setSelectedWords(nextSelected);
    setAvailableWords((prev) => prev.filter((w) => w.id !== word.id));

    // Check if sentence is completed
    if (nextSelected.length === targetWords.length) {
      const isCorrect = nextSelected.every((w, idx) => w.arabic === targetWords[idx].arabic);
      if (isCorrect) {
        setIsCompleted(true);
        sounds.playCorrectDing();
        addXP(40, 'Menyelesaikan Susun Ayat');
        markAyahMemorized(selectedAyah.id);
      } else {
        setIsWrongOrder(true);
        sounds.playGentleRetry();
      }
    }
  };

  const handleRemoveWord = (word: QuranWord) => {
    if (isCompleted) return;
    sounds.playWordClick();
    setIsWrongOrder(false);
    setHintIndex(null);
    setSelectedWords((prev) => prev.filter((w) => w.id !== word.id));
    setAvailableWords((prev) => [...prev, word]);
  };

  const handleProvideHint = () => {
    const wrongIndex = selectedWords.findIndex((word, index) => word.arabic !== targetWords[index].arabic);
    setHintIndex(wrongIndex >= 0 ? wrongIndex : selectedWords.length);
    sounds.playWordClick();
  };

  const handleNextAyah = () => {
    const currentIndex = activeSurah.ayahs.findIndex((a) => a.id === selectedAyah.id);
    if (currentIndex < activeSurah.ayahs.length - 1) {
      setSelectedAyah(activeSurah.ayahs[currentIndex + 1]);
    } else {
      setSelectedAyah(activeSurah.ayahs[0]);
      if (currentIndex === 0) resetPuzzle();
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Game Instruction & Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div>
          <span className="text-[11px] font-semibold text-[#84A98C] uppercase tracking-wider block">
            Game 1 · Susun Ayat (Word Puzzle)
          </span>
          <p className="text-xs text-[#52796F] dark:text-[#94A3B8] mt-0.5">
            Susun kepingan kata Arab berikut secara berurutan sesuai bunyi ayat yang benar.
          </p>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => playMurottal(selectedAyah)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              isPlayingAudio && currentPlayingAyahId === selectedAyah.id
                ? 'bg-[#E9C46A] text-[#1D3557]'
                : 'bg-[#52796F]/10 text-[#52796F] dark:bg-[#52796F]/30 dark:text-[#84A98C] hover:bg-[#52796F]/20'
            }`}
            title="Dengarkan Murottal Ayat"
          >
            <Volume2 className="w-4 h-4" />
            <span>{isPlayingAudio && currentPlayingAyahId === selectedAyah.id ? 'Memutar...' : 'Dengar'}</span>
          </button>

          <button
            onClick={handleProvideHint}
            disabled={isCompleted}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors disabled:opacity-50"
            title="Beri Petunjuk Kata Selanjutnya"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Petunjuk</span>
          </button>

          <button
            onClick={resetPuzzle}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Acak Ulang"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Assembled Sentence Box (Drop Zone) */}
      <div className="relative min-h-[140px] bg-gradient-to-b from-[#FDFBF7] to-[#F4EFEA] dark:from-[#0F1E21] dark:to-[#16272B] rounded-3xl p-6 border-2 border-dashed border-[#C5A059]/40 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between text-xs text-[#84A98C] mb-3">
          <span>Susunan Kata (Klik kata untuk membatalkan):</span>
          <span>{selectedWords.length} / {targetWords.length} kata</span>
        </div>

        {/* Selected Words Area (Right to Left for Arabic) */}
        <div
          dir="rtl"
          className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 py-4 min-h-[60px]"
        >
          {selectedWords.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 italic select-none">
              Pilih kepingan kata di bawah untuk mulai menyusun...
            </p>
          ) : (
            selectedWords.map((word, idx) => (
              <motion.button
                key={`selected_${word.id}_${idx}`}
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={() => handleRemoveWord(word)}
                className={`group relative cursor-pointer px-4 py-2 bg-white dark:bg-[#1E293B] rounded-2xl shadow-sm border hover:border-red-400 dark:hover:border-red-400 transition-all text-[#1D3557] dark:text-[#E9C46A] ${hintIndex === idx && word.arabic !== targetWords[idx].arabic ? 'border-amber-500 ring-2 ring-amber-400' : 'border-[#84A98C]/40'}`}
              >
                <span
                  className="font-arabic font-medium block"
                  style={{ fontSize: `${Math.max(fontSize * 0.9, 26)}px` }}
                >
                  {word.arabic}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block group-hover:text-red-500 transition-colors">
                  {word.transliteration}
                </span>
              </motion.button>
            ))
          )}
        </div>

        {/* Sentence Meaning Preview */}
        <div className="mt-4 pt-3 border-t border-[#84A98C]/20 text-center">
          <p className="text-xs text-[#52796F] dark:text-[#94A3B8]">
            "{selectedAyah.translationId}"
          </p>
        </div>

        {/* Incorrect order alert */}
        {isWrongOrder && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-red-50 text-red-700 dark:bg-red-950/80 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs px-4 py-1.5 rounded-full shadow-md font-medium"
          >
            Susunan belum pas, coba periksa dan acak ulang ya!
          </motion.div>
        )}
      </div>

      {/* Available Word Chips Pool */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#52796F] dark:text-[#94A3B8]">
          <span>Kepingan Kata Acak:</span>
          <span>Tip: Klik tanda buku di kata untuk melihat artinya!</span>
        </div>

        <div
          dir="rtl"
          className="flex flex-wrap items-center justify-center gap-3 p-4 bg-white/60 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 min-h-[90px]"
        >
          {availableWords.map((word, idx) => (
            <div key={`avail_${word.id}_${idx}`} className="relative group">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelectWord(word)}
                className={`px-4 py-2.5 rounded-2xl bg-[#F4EFEA] dark:bg-[#16272B] hover:bg-[#EAE3D9] dark:hover:bg-[#1E3A34] text-[#2F3E46] dark:text-[#F1F5F9] border hover:border-[#84A98C] shadow-xs cursor-pointer transition-colors ${hintIndex === selectedWords.length && word.arabic === targetWords[hintIndex]?.arabic ? 'border-amber-500 ring-2 ring-amber-400' : 'border-[#C5A059]/40'}`}
              >
                <span
                  className="font-arabic font-medium block"
                  style={{ fontSize: `${Math.max(fontSize * 0.9, 26)}px` }}
                >
                  {word.arabic}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-sans">
                  {word.transliteration}
                </span>
              </motion.button>

              {/* Mini Tadabbur Info Trigger button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  inspectWord(word);
                }}
                className="absolute -top-1.5 -left-1.5 p-1 bg-white dark:bg-slate-700 text-[#52796F] hover:text-[#1D3557] rounded-full shadow-xs border border-slate-200 dark:border-slate-600 opacity-60 hover:opacity-100 transition-opacity"
                title="Lihat arti kata ini"
              >
                <BookOpen className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Completion Celebration Card */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-5 bg-gradient-to-r from-[#D8EADB] to-[#F0F7F2] dark:from-[#133230] dark:to-[#1E3A34] border border-[#84A98C] rounded-3xl shadow-md text-center space-y-3"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#52796F] text-white shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-base font-bold text-[#2F3E46] dark:text-white flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#E9C46A]" />
                <span>Masya Allah, Susunan Ayat Tepat!</span>
              </h4>
              <p className="text-xs text-[#52796F] dark:text-[#A8D5BA] mt-1">
                Kamu mendapatkan <span className="font-bold text-[#E76F51]">+40 XP</span> dan menumbuhkan tanaman di Taman Surga!
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => playMurottal(selectedAyah)}
                className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 text-[#2F3E46] dark:text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-slate-50 transition-colors"
              >
                <Volume2 className="w-4 h-4 text-[#52796F]" />
                <span>Dengar Pelafalan Murottal</span>
              </button>

              <button
                onClick={handleNextAyah}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#52796F] hover:bg-[#354F52] text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                <span>{selectedAyah.id === activeSurah.ayahs[activeSurah.ayahs.length - 1].id ? 'Ulangi dari Ayat 1' : 'Lanjut Ayat Berikutnya'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
