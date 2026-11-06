import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  Volume2,
  CheckCircle2,
  Award,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Sparkles,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  GraduationCap,
  Eye,
  EyeOff,
  Flame,
  Star,
  BookMarked,
  ShieldCheck,
  Zap,
  Trophy
} from 'lucide-react';
import { IQRO_LEVELS, IqroJilid, IqroPage, IqroItem } from '../../data/iqroData';
import { useQuranGame } from '../../context/QuranGameContext';
import { sounds } from '../../utils/soundEffects';
import { playIqroItem, stopIqroAudio } from '../../utils/iqroAudioEngine';
import { iqro1PagesFromBook } from '../../data/iqro1PdfContent';
import { iqro2PagesFromBook } from '../../data/iqro2PdfContent';
import { createIqro1Quiz } from '../../data/iqro1Quiz';

const iqro1BookPages = iqro1PagesFromBook(IQRO_LEVELS[0].pages);
const iqro2BookPages = iqro2PagesFromBook(IQRO_LEVELS[1].pages);
const iqro1QuizQuestions = createIqro1Quiz(iqro1BookPages);

interface IqroDigitalViewProps {
  onGoToQuiz?: () => void;
}

export const IqroDigitalView: React.FC<IqroDigitalViewProps> = () => {
  const { addXP, celebrateSuccess, soundEnabled } = useQuranGame();
  
  // State
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [audioSpeed, setAudioSpeed] = useState<number>(1.0);
  const [showLatin, setShowLatin] = useState<boolean>(true);
  const [useAiVoice, setUseAiVoice] = useState<boolean>(false);
  const [playingItemId, setPlayingItemId] = useState<string | null>(null);

  // Quiz State
  const [isQuizMode, setIsQuizMode] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [playingQuizAudio, setPlayingQuizAudio] = useState(false);

  // Completed levels & cards tracking in local storage
  const [completedLevels, setCompletedLevels] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('raudhah_iqro_completed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [completedCards, setCompletedCards] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('raudhah_iqro_completed_cards');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const selectedJilid = IQRO_LEVELS.find((l) => l.level === selectedLevel) || IQRO_LEVELS[0];
  const currentJilid: IqroJilid = selectedLevel === 1
    ? { ...selectedJilid, pages: iqro1BookPages }
    : selectedLevel === 2 ? { ...selectedJilid, pages: iqro2BookPages } : selectedJilid;
  const currentPage: IqroPage = currentJilid.pages[activePageIndex] || currentJilid.pages[0];
  const quizQuestions = selectedLevel === 1 ? iqro1QuizQuestions : currentPage.quizQuestions || [];
  const quizPassed = selectedLevel !== 1 || quizScore >= Math.ceil(iqro1QuizQuestions.length * 0.8);

  // Save progress
  useEffect(() => {
    try {
      localStorage.setItem('raudhah_iqro_completed', JSON.stringify(completedLevels));
    } catch {
      // Ignore
    }
  }, [completedLevels]);

  useEffect(() => {
    try {
      localStorage.setItem('raudhah_iqro_completed_cards', JSON.stringify(completedCards));
    } catch {
      // Ignore
    }
  }, [completedCards]);

  const toggleCardCompleted = (cardKey: string) => {
    sounds.playWordClick();
    setCompletedCards((prev) => ({
      ...prev,
      [cardKey]: !prev[cardKey]
    }));
  };

  const getJilidProgress = (jilidLevel: number) => {
    const jilid = jilidLevel === 1
      ? { ...IQRO_LEVELS[0], pages: iqro1BookPages }
      : jilidLevel === 2 ? { ...IQRO_LEVELS[1], pages: iqro2BookPages }
      : IQRO_LEVELS.find((l) => l.level === jilidLevel);
    if (!jilid) return { completed: 0, total: 0, percent: 0 };
    let total = 0;
    let completed = 0;
    for (const p of jilid.pages) {
      for (const r of p.rows) {
        for (const item of r.items) {
          total++;
          const key = `L${jilidLevel}_P${p.pageNumber}_R${r.id}_I${item.id}`;
          if (completedCards[key]) completed++;
        }
      }
    }
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percent };
  };

  // Clean up audio on unmount or page change
  useEffect(() => {
    return () => {
      stopIqroAudio();
    };
  }, [selectedLevel, activePageIndex]);

  useEffect(() => () => stopIqroAudio(), [isQuizMode]);

  const handlePlayItemAudio = (item: IqroItem, rowId: string) => {
    sounds.playWordClick();
    const uniqueKey = `${rowId}_${item.id}`;
    setPlayingItemId(uniqueKey);

    playIqroItem(item, audioSpeed, () => {
      setPlayingItemId((current) => current === uniqueKey ? null : current);
    }, useAiVoice, selectedLevel);
  };

  const handleLevelChange = (level: number) => {
    stopIqroAudio();
    setPlayingQuizAudio(false);
    sounds.playWordClick();
    setSelectedLevel(level);
    setActivePageIndex(0);
    setIsQuizMode(false);
    setQuizCompleted(false);
  };

  const handleNextPage = () => {
    if (activePageIndex < currentJilid.pages.length - 1) {
      sounds.playWordClick();
      setActivePageIndex((prev) => prev + 1);
    } else {
      // Prompt quiz at end of chapter
      stopIqroAudio();
      setPlayingQuizAudio(false);
      setIsQuizMode(true);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setQuizScore(0);
      setQuizCompleted(false);
    }
  };

  const handlePrevPage = () => {
    if (activePageIndex > 0) {
      sounds.playWordClick();
      setActivePageIndex((prev) => prev - 1);
      setIsQuizMode(false);
    }
  };

  const playQuizCorrectAudio = () => {
    const question = quizQuestions[currentQuestionIndex];
    if (!question || selectedLevel !== 1 || !soundEnabled) return;
    setPlayingQuizAudio(true);
    playIqroItem(
      { id: question.id, arabic: question.questionArabic, latin: question.options[question.correctIndex] },
      audioSpeed,
      () => setPlayingQuizAudio(false),
      false,
      1
    );
  };

  const completeQuiz = (finalScore: number) => {
    setQuizCompleted(true);
    if (selectedLevel !== 1 || finalScore >= Math.ceil(iqro1QuizQuestions.length * 0.8)) {
      sounds.playAyahComplete();
      celebrateSuccess();
      addXP(100);
      if (!completedLevels.includes(selectedLevel)) {
        setCompletedLevels((prev) => [...prev, selectedLevel]);
      }
    }
  };

  const advanceQuiz = (finalScore: number) => {
    setSelectedAnswer(null);
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      completeQuiz(finalScore);
    }
  };

  const handleNextQuizQuestion = () => {
    if (selectedAnswer === null || selectedLevel !== 1) return;
    stopIqroAudio();
    setPlayingQuizAudio(false);
    advanceQuiz(quizScore);
  };

  const handleAnswerQuiz = (optionIdx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(optionIdx);

    const question = quizQuestions[currentQuestionIndex];
    const isCorrect = question && optionIdx === question.correctIndex;

    if (isCorrect) {
      sounds.playCorrectDing();
      setQuizScore((prev) => prev + 1);
      addXP(selectedLevel === 1 ? 2 : 25);
      if (selectedLevel === 1) {
        playQuizCorrectAudio();
        try {
          confetti({ particleCount: 16, spread: 38, startVelocity: 18, scalar: 0.7, origin: { x: 0.5, y: 0.58 }, colors: ['#D3A253', '#246579', '#E1EEE8'], disableForReducedMotion: true });
        } catch {
          // A blocked canvas should not interrupt the question.
        }
      }
    } else {
      sounds.playGentleRetry();
    }

    // Iqro 1 waits for the learner. Other levels keep their existing timing.
    if (selectedLevel !== 1) {
      setTimeout(() => advanceQuiz(quizScore + (isCorrect ? 1 : 0)), 1200);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-[#246579] p-6 sm:p-8 text-white shadow-sm">
        <div className="absolute -right-10 -bottom-10 opacity-10 font-arabic text-[180px] pointer-events-none select-none">
          اقرأ
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#D3A253] text-[#173B4E] text-xs font-black uppercase tracking-wider shadow-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Metode Iqro Interaktif Digital</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold border border-white/30 backdrop-blur-xs">
              Mualaf, Anak & Pemula Mandiri
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Iqro Digital (Metode K.H. As'ad Humam)
          </h2>
          <p className="text-xs sm:text-sm text-slate-100 max-w-2xl leading-relaxed">
            Panduan belajar membaca Al-Qur'an dari nol (Jilid 1 s.d. 6) dengan metode <strong>CBSA (Cara Belajar Santri Aktif)</strong>, audio manusia asli per huruf/lafaz, dan tes kelulusan interaktif.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
              <ShieldCheck className="w-4 h-4 text-[#D3A253]" />
              <span>100% Suara Manusia Asli</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
              <Zap className="w-4 h-4 text-[#D3A253]" />
              <span>Tanpa Mengeja (Langsung A - BA)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Level Selector Bar (Jilid 1 s.d. 6) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-[#173B4E] dark:text-white px-1">
          <span className="flex items-center gap-1.5">
            <BookMarked className="w-4 h-4 text-[#246579]" />
            <span>Pilih Tingkat Jilid Iqro:</span>
          </span>
          <span className="text-[11px] text-slate-500 font-normal">
            {completedLevels.length} dari 6 Jilid Tuntas
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {IQRO_LEVELS.map((jilid) => {
            const isSelected = selectedLevel === jilid.level;
            const isCompleted = completedLevels.includes(jilid.level);
            const jProgress = getJilidProgress(jilid.level);

            return (
              <button
                key={jilid.level}
                type="button"
                onClick={() => handleLevelChange(jilid.level)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  isSelected
                    ? 'bg-[#173B4E] text-white border-[#173B4E] ring-2 ring-[#D3A253]/50 shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-[#246579]'
                }`}
              >
                {isCompleted && (
                  <span className="absolute top-2 right-2 text-[#2D8192]">
                    <CheckCircle2 className="w-4 h-4 fill-[#2D8192] text-white" />
                  </span>
                )}

                <div>
                  <span className={`text-[10px] font-black uppercase tracking-wider block ${
                    isSelected ? 'text-[#D3A253]' : 'text-[#246579] dark:text-[#A7CDD3]'
                  }`}>
                    Jilid {jilid.level}
                  </span>
                  <h4 className="font-extrabold text-sm mt-0.5 line-clamp-1">
                    Iqro {jilid.level}
                  </h4>
                </div>

                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[9px]">
                    <span className={isSelected ? 'text-slate-200' : 'text-slate-400'}>
                      Progres
                    </span>
                    <span className={`font-bold ${isSelected ? 'text-[#D3A253]' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {jProgress.percent}%
                    </span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${isSelected ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                    <div
                      className="h-full bg-[#2D8192] transition-all duration-300"
                      style={{ width: `${jProgress.percent}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Jilid Description & Teacher Rule Banner */}
      <div className="p-4 rounded-2xl bg-[#EAF2F3] dark:bg-[#152B28] border border-[#477F8D]/30 text-xs space-y-2 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-2xs"
              style={{ backgroundColor: '#246579' }}
            >
              J{currentJilid.level}
            </span>
            <div>
              <h3 className="font-bold text-sm text-[#173B4E] dark:text-white">
                {currentJilid.title}
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                {currentJilid.subtitle}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Voice Mode Toggle (Human WebAudio Stitch vs AI Syekh Qari) */}
            {selectedLevel !== 2 && import.meta.env.VITE_STATIC_PAGES !== 'true' && <button
              type="button"
              onClick={() => setUseAiVoice(!useAiVoice)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                useAiVoice
                  ? 'bg-[#173B4E] text-[#D3A253] border-[#D3A253]/60 shadow-xs ring-2 ring-[#D3A253]/30'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-[#173B4E] dark:text-slate-200 hover:bg-slate-50'
              }`}
              title="Rekaman yang cocok selalu dipakai; pilih AI untuk bacaan yang belum memiliki rekaman"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D3A253]" />
              <span>{useAiVoice ? '🎙️ AI untuk bacaan lain' : '🔊 Bacaan kartu'}</span>
            </button>}

            {/* Speed Controller */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <Sliders className="w-3.5 h-3.5 text-[#D3A253] ml-1" />
              {[
                { val: 0.5, label: '0.5x' },
                { val: 0.75, label: '0.75x' },
                { val: 1.0, label: '1.0x' }
              ].map((s) => (
                <button
                  key={s.val}
                  type="button"
                  onClick={() => setAudioSpeed(s.val)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    audioSpeed === s.val
                      ? 'bg-[#246579] text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Latin Hint Toggle */}
            <button
              type="button"
              onClick={() => setShowLatin(!showLatin)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-[#173B4E] dark:text-[#D3A253] flex items-center gap-1.5 cursor-pointer hover:bg-slate-50"
              title="Sembunyikan/Tampilkan Bantuan Latin"
            >
              {showLatin ? <Eye className="w-3.5 h-3.5 text-[#2D8192]" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
              <span>{showLatin ? 'Latin On' : 'Latin Off'}</span>
            </button>
          </div>
        </div>

        {/* Primary Rule from KH As'ad Humam */}
        <div className="p-3 bg-white dark:bg-slate-900/80 rounded-xl border border-[#477F8D]/40 text-[#293640] dark:text-slate-200 flex items-start gap-2.5">
          <Lightbulb className="w-4 h-4 text-[#D3A253] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-[11px] text-[#B87845]">
              Aturan Utama KH. As'ad Humam:
            </span>
            <p className="text-[11px] leading-relaxed">
              {currentJilid.keyRule}
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Reading Page Card */}
      {!isQuizMode ? (
        (() => {
          const pageTotalCards = currentPage.rows.reduce((sum, row) => sum + row.items.length, 0);
          const pageCompletedCards = currentPage.rows.reduce((sum, row) => {
            return sum + row.items.reduce((itemSum, item) => {
              const key = `L${selectedLevel}_P${currentPage.pageNumber}_R${row.id}_I${item.id}`;
              return itemSum + (completedCards[key] ? 1 : 0);
            }, 0);
          }, 0);
          const isPageAllChecked = pageTotalCards > 0 && pageCompletedCards === pageTotalCards;

          return (
            <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700 p-5 sm:p-7 shadow-xs space-y-6">
              {/* Header Sub-Pelajaran */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#246579] uppercase tracking-wider block">
                      Halaman {currentPage.pageNumber} dari {currentJilid.pages.length}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold">
                      {pageCompletedCards}/{pageTotalCards} Kartu Centang
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#173B4E] dark:text-white mt-0.5">
                    {currentPage.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {currentPage.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    disabled={activePageIndex === 0}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 cursor-pointer transition-colors"
                    title="Halaman Sebelumnya"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <span className="text-xs font-bold text-[#173B4E] dark:text-[#D3A253] px-2">
                    {activePageIndex + 1} / {currentJilid.pages.length}
                  </span>

                  <button
                    type="button"
                    onClick={handleNextPage}
                    className="px-3.5 py-2 rounded-xl bg-[#246579] hover:bg-[#174C60] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                    title="Halaman Selanjutnya"
                  >
                    <span>{activePageIndex === currentJilid.pages.length - 1 ? 'Mulai Kuis' : 'Lanjut'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Teacher's Note Box */}
              {currentPage.teacherNote && (
                <div className="p-3.5 rounded-2xl bg-[#F1EDE6] dark:bg-slate-700/50 border border-[#BE9452]/30 text-xs flex items-center gap-2.5">
                  <GraduationCap className="w-5 h-5 text-[#866421] dark:text-[#D3A253] shrink-0" />
                  <p className="text-slate-700 dark:text-slate-200 leading-snug">
                    <strong>Catatan Pengajar:</strong> {currentPage.teacherNote}
                  </p>
                </div>
              )}

              {/* Interactive Row Flashcards Grid */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 px-1 gap-2">
                  <span className="font-semibold text-[#246579] dark:text-[#A7CDD3]">
                    Ayo Praktikkan! Klik kotak huruf untuk membunyikan suara & centang jika sudah lancar:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playWordClick();
                      setCompletedCards((prev) => {
                        const next = { ...prev };
                        for (const r of currentPage.rows) {
                          for (const i of r.items) {
                            const key = `L${selectedLevel}_P${currentPage.pageNumber}_R${r.id}_I${i.id}`;
                            if (isPageAllChecked) {
                              delete next[key];
                            } else {
                              next[key] = true;
                            }
                          }
                        }
                        return next;
                      });
                    }}
                    className="text-[11px] font-bold text-[#2D8192] dark:text-[#D3A253] hover:underline cursor-pointer flex items-center gap-1 bg-[#EAF2F3] dark:bg-slate-700/80 px-2.5 py-1 rounded-xl"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2D8192]" />
                    <span>{isPageAllChecked ? 'Batal Centang Halaman Ini' : 'Centang Semua Halaman Ini'}</span>
                  </button>
                </div>

                <div className="space-y-3.5">
                  {currentPage.rows.map((row) => (
                    <div
                      key={row.id}
                      className="p-4 rounded-2xl bg-[#F8F6F1] dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs hover:border-[#477F8D]/60 transition-colors"
                    >
                      <div
                        dir="rtl"
                        className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
                      >
                        {row.items.map((item) => {
                          const itemAudioKey = `${row.id}_${item.id}`;
                          const cardProgressKey = `L${selectedLevel}_P${currentPage.pageNumber}_R${row.id}_I${item.id}`;
                          const isPlaying = playingItemId === itemAudioKey;
                          const isCompleted = !!completedCards[cardProgressKey];

                          return (
                            <motion.button
                              key={item.id}
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              onClick={() => handlePlayItemAudio(item, row.id)}
                              className={`group relative p-3 sm:p-4 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer min-w-[95px] sm:min-w-[115px] ${
                                isPlaying
                                  ? 'bg-[#D3A253] border-[#BE9452] ring-2 ring-[#D3A253]/60 shadow-md'
                                  : isCompleted
                                  ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600/70 hover:border-emerald-500 shadow-2xs'
                                  : 'bg-white dark:bg-slate-800 hover:bg-[#EAF2F3] border-slate-200 dark:border-slate-700 hover:border-[#246579]'
                              }`}
                            >
                              {/* Checkmark Button on Top-Left */}
                              <span
                                role="button"
                                tabIndex={0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCardCompleted(cardProgressKey);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.stopPropagation();
                                    toggleCardCompleted(cardProgressKey);
                                  }
                                }}
                                className={`absolute top-2 left-2 p-1 rounded-lg transition-all z-10 cursor-pointer ${
                                  isCompleted
                                    ? 'bg-emerald-500 text-white shadow-2xs scale-100'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-300 hover:text-slate-500 dark:hover:text-slate-200 opacity-60 hover:opacity-100'
                                }`}
                                title={isCompleted ? 'Sudah Di-centang (Klik untuk batal)' : 'Tandai Selesai (Centang)'}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </span>

                              <span className={`font-arabic text-3xl sm:text-4xl font-bold my-1 ${
                                isPlaying
                                  ? 'text-[#173B4E]'
                                  : isCompleted
                                  ? 'text-emerald-800 dark:text-emerald-300'
                                  : 'text-[#173B4E] dark:text-[#D3A253]'
                              }`}>
                                {item.arabic}
                              </span>

                              {showLatin && (
                                <span className={`text-xs font-extrabold mt-1 uppercase tracking-wider ${
                                  isPlaying
                                    ? 'text-[#173B4E]'
                                    : isCompleted
                                    ? 'text-emerald-700 dark:text-emerald-400'
                                    : 'text-[#246579] dark:text-[#A7CDD3]'
                                }`}>
                                  {item.latin}
                                </span>
                              )}

                              {item.hint && (
                                <span className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">
                                  {item.hint}
                                </span>
                              )}

                              <Volume2 className={`w-3.5 h-3.5 absolute top-2 right-2 transition-opacity ${
                                isPlaying ? 'opacity-100 text-[#173B4E]' : 'opacity-40 group-hover:opacity-100 text-[#246579]'
                              }`} />
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Navigation Action */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  💡 Pastikan suara dibaca dengan fasih sebelum berlanjut.
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      stopIqroAudio();
                      setPlayingQuizAudio(false);
                      setIsQuizMode(true);
                      setCurrentQuestionIndex(0);
                      setSelectedAnswer(null);
                      setQuizScore(0);
                      setQuizCompleted(false);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#2D8192] hover:bg-[#236E80] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                  >
                    <Award className="w-4 h-4" />
                    <span>Uji Kemampuan Iqro {currentJilid.level}{selectedLevel === 1 ? ' · 45 Soal' : ''}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })()
      ) : (
        /* Quiz Mode Container */
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-md space-y-6">
          {!quizCompleted ? (
            (() => {
              const questions = selectedLevel === 1 ? quizQuestions : currentPage.quizQuestions || [
                {
                  id: 'default_q',
                  questionArabic: 'اَ  بَ',
                  questionText: 'Bagaimana membunyikan lafaz di atas dengan pendek?',
                  options: ['A - BA', 'BA - A', 'AA - BAA'],
                  correctIndex: 0
                }
              ];
              const q = questions[currentQuestionIndex] || questions[0];

              return (
                <div className="space-y-6 max-w-xl mx-auto text-center">
                  <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 dark:border-slate-700 pb-3">
                    <span className="font-bold text-[#246579] flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-[#D3A253]" />
                      <span>Uji Evaluasi Iqro {currentJilid.level}</span>
                    </span>
                    <span>Soal {currentQuestionIndex + 1} dari {questions.length}</span>
                  </div>

                  {selectedLevel === 1 && (
                    <div className="space-y-2 text-left">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-[#246579] dark:text-[#A7CDD3]">
                        <span>{currentQuestionIndex < 15 ? 'Tahap Mudah · Kenali Huruf' : currentQuestionIndex < 30 ? 'Tahap Menengah · Huruf dan Urutan' : 'Tahap Sulit · Rangkaian Bacaan'}</span>
                        <span>{quizScore} benar · {Math.round((currentQuestionIndex + 1) / questions.length * 100)}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#E1EEE8] dark:bg-slate-700" role="progressbar" aria-label="Progres uji Iqro 1" aria-valuenow={currentQuestionIndex + 1} aria-valuemin={0} aria-valuemax={questions.length}>
                        <div className="h-full rounded-full bg-[#D3A253] transition-[width] duration-300" style={{ width: `${(currentQuestionIndex + 1) / questions.length * 100}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="p-6 rounded-2xl bg-[#F8F6F1] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3 shadow-inner">
                    <p className="font-arabic text-5xl font-bold text-[#173B4E] dark:text-[#D3A253] my-2">
                      {q.questionArabic}
                    </p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {q.questionText}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {q.options.map((opt, idx) => {
                      const isSelected = selectedAnswer === idx;
                      const isCorrect = idx === q.correctIndex;

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAnswerQuiz(idx)}
                          disabled={selectedAnswer !== null}
                          className={`w-full py-3.5 px-5 rounded-2xl text-xs font-bold transition-all border flex items-center justify-between cursor-pointer ${
                            selectedAnswer === null
                              ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200'
                              : isSelected
                              ? isCorrect
                                ? 'bg-emerald-500 text-white border-emerald-600'
                                : 'bg-rose-500 text-white border-rose-600'
                              : isCorrect
                              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200'
                          }`}
                        >
                          <span>{opt}</span>
                          <span className="w-6 h-6 rounded-full border flex items-center justify-center text-[10px]">
                            {String.fromCharCode(65 + idx)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {selectedLevel === 1 && selectedAnswer !== null && (
                    <div className="space-y-4">
                      <p role="status" className={`rounded-xl px-4 py-3 text-sm font-semibold ${selectedAnswer === q.correctIndex ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'}`}>
                        {selectedAnswer === q.correctIndex ? 'Benar! Dengarkan bacaannya, lalu lanjut saat siap.' : `Belum tepat. Jawaban yang benar: ${q.options[q.correctIndex]}. Pelajari dan dengarkan sebelum lanjut.`}
                      </p>
                      <div className="flex flex-col justify-center gap-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={playQuizCorrectAudio}
                          disabled={!soundEnabled}
                          className="flex items-center justify-center gap-2 rounded-xl border border-[#246579] px-4 py-3 text-xs font-bold text-[#246579] transition-colors hover:bg-[#E1EEE8] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#A7CDD3] dark:text-[#A7CDD3] dark:hover:bg-slate-700 cursor-pointer"
                        >
                          <Volume2 className="h-4 w-4" />
                          {playingQuizAudio ? 'Sedang dibaca...' : 'Dengarkan bacaan benar'}
                        </button>
                        <button
                          type="button"
                          onClick={handleNextQuizQuestion}
                          className="flex items-center justify-center gap-2 rounded-xl bg-[#246579] px-5 py-3 text-xs font-bold text-white transition-colors hover:bg-[#174C60] cursor-pointer"
                        >
                          {currentQuestionIndex === questions.length - 1 ? 'Lihat Hasil Ujian' : 'Lanjut ke Soal Berikutnya'}
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            /* Quiz Completed View */
            <div className="text-center py-8 space-y-5 max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-[#D3A253]/20 text-[#D3A253] flex items-center justify-center mx-auto shadow-inner">
                {quizPassed ? <Trophy className="w-10 h-10 text-[#866421] dark:text-[#D3A253]" /> : <RotateCcw className="w-10 h-10 text-[#866421] dark:text-[#D3A253]" />}
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  Evaluasi Selesai!
                </span>
                <h3 className="text-xl font-extrabold text-[#173B4E] dark:text-white mt-2">
                  {quizPassed ? `Selamat! Anda Lulus Iqro ${currentJilid.level}` : 'Belum Lulus Iqro 1 — Ayo Coba Lagi'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Skor Anda: <strong>{quizScore} / {quizQuestions.length}</strong>. {quizPassed ? selectedLevel === 1 ? 'Kelulusan Iqro 1 tersimpan.' : 'Lencana kelulusan telah ditambahkan ke profil Anda!' : `Perlu minimal ${Math.ceil(iqro1QuizQuestions.length * 0.8)} jawaban benar untuk lulus. Ulangi soal dan latih lagi huruf yang belum lancar.`}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (quizPassed) {
                      setIsQuizMode(false);
                    } else {
                      setCurrentQuestionIndex(0);
                      setSelectedAnswer(null);
                      setQuizScore(0);
                      setQuizCompleted(false);
                    }
                  }}
                  className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
                >
                  {quizPassed ? 'Ulangi Pelajaran Halaman' : 'Ulangi Ujian Iqro 1'}
                </button>

                {quizPassed && selectedLevel < 6 && (
                  <button
                    type="button"
                    onClick={() => handleLevelChange(selectedLevel + 1)}
                    className="w-full py-3 rounded-xl bg-[#246579] hover:bg-[#174C60] text-white text-xs font-bold cursor-pointer shadow-xs"
                  >
                    Lanjut ke Iqro {selectedLevel + 1} →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
