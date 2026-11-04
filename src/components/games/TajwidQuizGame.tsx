import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CheckCircle2, HelpCircle, ArrowRight, BookOpen, Award, Volume2 } from 'lucide-react';
import { useQuranGame } from '../../context/QuranGameContext';
import { sounds } from '../../utils/soundEffects';
import { TajwidGuideModal } from '../tajwid/TajwidGuideModal';
import { playPronunciation } from '../../utils/tajwidAudio';

interface TajwidQuestion {
  id: string;
  surahNumber: number;
  highlightPhrase: string;
  question: string;
  options: { label: string; text: string; isCorrect: boolean }[];
  explanation: string;
  category: 'Al-Qamariyah/Syamsiyah' | 'Qalqalah' | 'Ghunnah' | 'Mad' | 'Nun Mati/Tanwin';
}

const TAJWID_QUESTIONS_BANK: TajwidQuestion[] = [
  {
    id: 'tq_114_1',
    surahNumber: 114,
    highlightPhrase: 'النَّاسِ',
    question: 'Pada lafaz "النَّاسِ", apa hukum bacaan Alif Lam (ال) tersebut?',
    options: [
      { label: 'A', text: 'Alif Lam Syamsiyah (Idgham Syamsiyah)', isCorrect: true },
      { label: 'B', text: 'Alif Lam Qamariyah (Izhar Qamariyah)', isCorrect: false },
      { label: 'C', text: 'Qalqalah Sughra', isCorrect: false }
    ],
    explanation: 'Alif Lam bertemu huruf Nun (ن) yang bertasydid, sehingga bunyi "L" melebur langsung masuk ke huruf Nun.',
    category: 'Al-Qamariyah/Syamsiyah'
  },
  {
    id: 'tq_114_4',
    surahNumber: 114,
    highlightPhrase: 'مِن شَرِّ',
    question: 'Hukum bacaan Nun Sukun bertemu huruf Syin (ش) pada "مِن شَرِّ" adalah...',
    options: [
      { label: 'A', text: 'Ikhfa Haqiqi (Samar-samar)', isCorrect: true },
      { label: 'B', text: 'Izhar Halqi (Jelas)', isCorrect: false },
      { label: 'C', text: 'Idgham Bilaghunnah', isCorrect: false }
    ],
    explanation: 'Nun mati bertemu huruf Syin (salah satu dari 15 huruf Ikhfa), dibaca samar disertai dengung 2 harakat.',
    category: 'Nun Mati/Tanwin'
  },
  {
    id: 'tq_113_1',
    surahNumber: 113,
    highlightPhrase: 'الْفَلَقِ',
    question: 'Ketika berhenti (waqaf) pada kata "الْفَلَقِ", huruf Qaf (ق) dibaca dengan hukum...',
    options: [
      { label: 'A', text: 'Qalqalah Kubra (Pantulan Kuat)', isCorrect: true },
      { label: 'B', text: 'Qalqalah Sughra (Pantulan Ringan)', isCorrect: false },
      { label: 'C', text: 'Mad Thabi\'i', isCorrect: false }
    ],
    explanation: 'Huruf Qaf (ق) berada di akhir kalimat dan dimatikan karena waqaf, sehingga menghasilkan pantulan kuat (Qalqalah Kubra).',
    category: 'Qalqalah'
  },
  {
    id: 'tq_112_1',
    surahNumber: 112,
    highlightPhrase: 'أَحَدٌ',
    question: 'Saat berhenti (waqaf) pada kata "أَحَدٌ", huruf Dal dibaca dengan...',
    options: [
      { label: 'A', text: 'Qalqalah Kubra', isCorrect: true },
      { label: 'B', text: 'Iqlab', isCorrect: false },
      { label: 'C', text: 'Idgham Bighunnah', isCorrect: false }
    ],
    explanation: 'Huruf Dal (د) termasuk huruf Qalqalah (ب - ج - د - ط - ق), jika diwaqafkan maka harus dipantulkan dengan jelas.',
    category: 'Qalqalah'
  },
  {
    id: 'tq_108_1',
    surahNumber: 108,
    highlightPhrase: 'إِنَّا',
    question: 'Huruf Nun yang bertasydid (نَّ) pada kata "إِنَّا" wajib dibaca dengan hukum...',
    options: [
      { label: 'A', text: 'Ghunnah Musyaddadah', isCorrect: true },
      { label: 'B', text: 'Izhar Mutlaq', isCorrect: false },
      { label: 'C', text: 'Ikhfa Syafawi', isCorrect: false }
    ],
    explanation: 'Setiap huruf Nun (نّ) atau Mim (مّ) yang memiliki tasydid wajib dibaca berdengung sepanjang 2 harakat.',
    category: 'Ghunnah'
  },
  {
    id: 'tq_1_2',
    surahNumber: 1,
    highlightPhrase: 'الْحَمْدُ',
    question: 'Alif Lam pada lafaz "الْحَمْدُ" dibaca terang dan jelas, dinamakan...',
    options: [
      { label: 'A', text: 'Alif Lam Qamariyah', isCorrect: true },
      { label: 'B', text: 'Alif Lam Syamsiyah', isCorrect: false },
      { label: 'C', text: 'Tafkhim', isCorrect: false }
    ],
    explanation: 'Huruf Alif Lam bertemu huruf Ha (ح) yang merupakan huruf Qamariyah, sehingga bunyi "L" wajib dibaca jelas (Izhar).',
    category: 'Al-Qamariyah/Syamsiyah'
  }
];

export const TajwidQuizGame: React.FC = () => {
  const { activeSurah, addXP, fontSize, mode } = useQuranGame();

  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Filter questions matching current surah, or fallback to full bank
  const relevantQuestions = TAJWID_QUESTIONS_BANK.filter(
    (q) => q.surahNumber === activeSurah.number
  );
  const activeQuestions = relevantQuestions.length > 0 ? relevantQuestions : TAJWID_QUESTIONS_BANK;

  const currentQ = activeQuestions[questionIndex % activeQuestions.length];

  useEffect(() => {
    resetQuestion();
  }, [activeSurah.number]);

  const [quizAudioSpeed, setQuizAudioSpeed] = useState<number>(0.75);
  const [isPlayingPhrase, setIsPlayingPhrase] = useState<boolean>(false);

  const resetQuestion = () => {
    setSelectedOptionIndex(null);
    setIsAnswered(false);
    setIsCorrect(null);
    setIsPlayingPhrase(false);
  };

  const handlePlayQuizPhrase = (phrase: string) => {
    sounds.playWordClick();
    setIsPlayingPhrase(true);
    playPronunciation(phrase, quizAudioSpeed, () => setIsPlayingPhrase(false));
  };

  const handleSelectOption = (idx: number, isOptCorrect: boolean) => {
    if (isAnswered) return;

    setSelectedOptionIndex(idx);
    setIsAnswered(true);
    setIsCorrect(isOptCorrect);

    if (isOptCorrect) {
      sounds.playCorrectDing();
      addXP(35, 'Kuis Tajwid Benar');
    } else {
      sounds.playGentleRetry();
    }
  };

  const handleNextQuestion = () => {
    setQuestionIndex((prev) => (prev + 1) % activeQuestions.length);
    resetQuestion();
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Instruction */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div>
          <span className="text-[11px] font-semibold text-[#84A98C] uppercase tracking-wider block">
            Game 6 · Kuis Tajwid & Harakat
          </span>
          <p className="text-xs text-[#52796F] dark:text-[#94A3B8] mt-0.5">
            Uji pemahaman hukum bacaan tajwid agar lantunan Al-Qur'anmu semakin fasih dan benar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              sounds.playWordClick();
              setIsGuideOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors cursor-pointer"
            title="Buka ringkasan materi hukum tajwid ini"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Pelajari Materi Tajwid Ini</span>
          </button>

          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#52796F]/10 dark:bg-[#52796F]/30 text-[#52796F] dark:text-[#84A98C]">
            Kategori: {currentQ.category}
          </span>
        </div>
      </div>

      {/* Question Card with Highlighted Arabic Phrase */}
      <div className="bg-gradient-to-b from-[#FDFBF7] to-[#F4EFEA] dark:from-[#0F1E21] dark:to-[#16272B] rounded-3xl p-6 sm:p-8 border border-[#C5A059]/40 text-center space-y-4 shadow-xs">
        {/* Highlighted Arabic Word */}
        <div className="inline-block p-4 px-8 rounded-2xl bg-white dark:bg-slate-800 border-2 border-[#E9C46A] shadow-sm">
          <p
            className="font-arabic font-bold text-[#1D3557] dark:text-[#E9C46A]"
            style={{ fontSize: `${Math.max(fontSize * 1.2, 34)}px` }}
          >
            {currentQ.highlightPhrase}
          </p>
        </div>

        {/* Audio Talaqqi Pronunciation & Speed Control */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => handlePlayQuizPhrase(currentQ.highlightPhrase)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
              isPlayingPhrase
                ? 'bg-[#E9C46A] text-[#1D3557] border-[#C5A059] shadow-xs'
                : 'bg-white dark:bg-slate-800 text-[#52796F] dark:text-[#A8D5BA] border-slate-200 dark:border-slate-700 hover:bg-[#F4EFEA]'
            }`}
            title="Dengarkan pelafalan murni lafaz ini"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#E9C46A]" />
            <span>{isPlayingPhrase ? 'Memutar Suara...' : 'Dengarkan Lafaz'}</span>
          </button>

          <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-1 text-[11px]">
            <span className="text-[10px] text-slate-400 px-1 font-medium">Tempo:</span>
            {[0.5, 0.75, 1.0].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setQuizAudioSpeed(s)}
                className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                  quizAudioSpeed === s
                    ? 'bg-[#52796F] text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#52796F]'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Question sentence */}
        <h3 className="text-sm sm:text-base font-bold text-[#2F3E46] dark:text-white max-w-lg mx-auto leading-relaxed">
          {currentQ.question}
        </h3>
      </div>

      {/* 3 Options */}
      <div className="space-y-3">
        {currentQ.options.map((opt, idx) => {
          const isSelected = selectedOptionIndex === idx;
          const showSuccess = isAnswered && opt.isCorrect;
          const showFailure = isAnswered && isSelected && !opt.isCorrect;

          return (
            <motion.button
              key={`opt_${idx}`}
              whileHover={{ scale: isAnswered ? 1 : 1.01 }}
              whileTap={{ scale: isAnswered ? 1 : 0.99 }}
              onClick={() => handleSelectOption(idx, opt.isCorrect)}
              disabled={isAnswered}
              className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                showSuccess
                  ? 'bg-[#84A98C] text-white border-[#52796F] shadow-sm ring-2 ring-[#84A98C]/30'
                  : showFailure
                  ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-300'
                  : 'bg-white dark:bg-slate-800 text-[#2F3E46] dark:text-white border-slate-200 dark:border-slate-700 hover:border-[#84A98C]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    showSuccess
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {opt.label}
                </span>
                <span className="text-xs sm:text-sm font-semibold">{opt.text}</span>
              </div>

              {showSuccess && <CheckCircle2 className="w-5 h-5 text-white shrink-0" />}
            </motion.button>
          );
        })}
      </div>

      {/* Feedback & Explanation Card */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            key={`quiz_feedback_${currentQ.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-3xl border space-y-3 text-center sm:text-left ${
              isCorrect
                ? 'bg-gradient-to-r from-[#D8EADB] to-[#F0F7F2] dark:from-[#133230] dark:to-[#1E3A34] border-[#84A98C]'
                : 'bg-amber-50 dark:bg-amber-950/50 border-amber-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  isCorrect
                    ? 'bg-[#52796F] text-white'
                    : 'bg-amber-600 text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs text-[#2F3E46] dark:text-white">
                  {isCorrect ? 'Jawaban Benar! (+35 XP)' : 'Pelajari Hikmah Tajwid Ini:'}
                </p>
                <p className="text-xs text-[#354F52] dark:text-[#CBD5E1] mt-1 leading-relaxed">
                  {currentQ.explanation}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-center sm:justify-end">
              <button
                onClick={handleNextQuestion}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#52796F] hover:bg-[#354F52] text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <span>Soal Tajwid Berikutnya</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guide Modal */}
      <TajwidGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        initialCategory={
          currentQ.category === 'Al-Qamariyah/Syamsiyah'
            ? 'alif-lam'
            : currentQ.category === 'Nun Mati/Tanwin'
            ? 'nun-mati'
            : currentQ.category === 'Qalqalah'
            ? 'qalqalah'
            : currentQ.category === 'Ghunnah'
            ? 'ghunnah'
            : undefined
        }
      />
    </div>
  );
};
