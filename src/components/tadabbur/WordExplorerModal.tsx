import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Volume2, Sparkles, Tag } from 'lucide-react';
import { useQuranGame } from '../../context/QuranGameContext';
import { sounds } from '../../utils/soundEffects';
import { TajwidWordSection } from '../tajwid/TajwidWord';

/** Id kata "surah:ayat:urutan" (urutan mulai 1) → posisi untuk data tajwid. */
const parseWordId = (id: string) => {
  const [surah, ayah, index] = id.split(':').map(Number);
  return Number.isInteger(surah) && Number.isInteger(ayah) && Number.isInteger(index) && index >= 1 ? { surah, ayah, word: index - 1 } : null;
};

export const WordExplorerModal: React.FC = () => {
  const { selectedWordForTadabbur, setSelectedWordForTadabbur, fontSize, mode } = useQuranGame();

  const handlePronounce = () => {
    if (!selectedWordForTadabbur) return;
    sounds.playWordClick();
    // Use Web Speech API if Arabic voice is supported, or soothing chime
    if ('speechSynthesis' in window) {
      try {
        const utter = new SpeechSynthesisUtterance(selectedWordForTadabbur.arabic);
        utter.lang = 'ar-SA';
        utter.rate = 0.8;
        window.speechSynthesis.speak(utter);
      } catch {
        // Fallback
      }
    }
  };

  const word = selectedWordForTadabbur;

  return (
    <AnimatePresence>
      {word && (
        <div key="word_explorer_overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <motion.div
            key={`word_explorer_dialog_${word.id}`}
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto overscroll-contain bg-[#F8F6F1] dark:bg-[#1E293B] border border-[#477F8D]/40 rounded-3xl p-6 shadow-xl text-[#293640] dark:text-[#E2E8F0]"
          >
          {/* Close button */}
          <button
            onClick={() => setSelectedWordForTadabbur(null)}
            className="absolute top-4 right-4 p-2 text-[#246579] hover:text-[#293640] dark:text-[#94A3B8] dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-[#246579]/10 dark:bg-[#246579]/30 text-[#246579] dark:text-[#477F8D]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#293640] dark:text-white">
                Tadabbur & Paham Kata (مُفْرَدَات)
              </h4>
              <p className="text-[11px] text-[#246579] dark:text-[#94A3B8]">
                Menyelami makna perkata dalam ayat Al-Qur'an
              </p>
            </div>
          </div>

          {/* Arabic Word Display Card */}
          <div className="relative overflow-hidden bg-gradient-to-b from-[#F1EDE6] to-[#E8E1D6] dark:from-[#102731] dark:to-[#152E38] rounded-2xl p-6 text-center border border-[#BE9452]/30 mb-4 shadow-inner">
            <div className="absolute top-2 left-3">
              <button
                onClick={handlePronounce}
                className="flex items-center gap-1 text-[11px] font-medium text-[#246579] dark:text-[#477F8D] bg-white/70 dark:bg-black/30 hover:bg-white px-2.5 py-1 rounded-full transition-colors"
                title="Dengarkan pelafalan"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Lafaz</span>
              </button>
            </div>

            <p
              className="font-arabic text-[#173B4E] dark:text-[#D3A253] my-2 select-text"
              style={{ fontSize: `${Math.max(fontSize * 1.3, 38)}px`, lineHeight: 1.8 }}
            >
              {word.arabic}
            </p>

            <p className="text-sm font-semibold text-[#246579] dark:text-[#A7CDD3] tracking-wide">
              {word.transliteration}
            </p>
          </div>

          {/* Meaning & Details List */}
          <div className="space-y-3 text-xs">
            <div className="bg-white/80 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[#477F8D] block text-[10px] font-semibold uppercase tracking-wider mb-0.5">
                Arti Kata dalam Bahasa Indonesia
              </span>
              <p className="text-sm font-bold text-[#293640] dark:text-white">
                "{word.translation}"
              </p>
            </div>

            {word.grammarType && (
              <div className="flex items-center justify-between bg-white/80 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-1.5 text-[#246579] dark:text-[#94A3B8]">
                  <Tag className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Jenis Kata (Nahwu)</span>
                </div>
                <span className="font-semibold text-[#173B4E] dark:text-[#D3A253]">
                  {word.grammarType}
                </span>
              </div>
            )}

            {word.rootWord && (
              <div className="flex items-center justify-between bg-white/80 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-1.5 text-[#246579] dark:text-[#94A3B8]">
                  <Sparkles className="w-3.5 h-3.5 text-[#D3A253]" />
                  <span className="text-[11px]">Akar Kata (جَذْر الكَلِمَة)</span>
                </div>
                <span className="font-arabic text-sm font-bold text-[#293640] dark:text-white dir-rtl">
                  {word.rootWord}
                </span>
              </div>
            )}

            {word.explanation && (
              <div className="p-3 bg-[#EAF2F3] dark:bg-[#193E4B]/50 rounded-xl border border-[#477F8D]/30 text-[#174C60] dark:text-[#CBD5E1] leading-relaxed">
                <p className="text-[11px] font-medium">{word.explanation}</p>
              </div>
            )}
          </div>

          {/* Tajwid kata ini: huruf berwarna, penjelasan, materi, latihan */}
          {(() => {
            const ref = parseWordId(word.id);
            return ref ? <TajwidWordSection key={word.id} surah={ref.surah} ayah={ref.ayah} word={ref.word} /> : null;
          })()}

          {/* Action button */}
          <div className="mt-5">
            <button
              onClick={() => setSelectedWordForTadabbur(null)}
              className="w-full py-2.5 px-4 bg-[#246579] hover:bg-[#174C60] text-white font-semibold rounded-xl transition-colors text-xs text-center"
            >
              Alhamdulillah, Saya Paham
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
};
