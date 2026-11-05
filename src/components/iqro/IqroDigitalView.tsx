import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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

const iqro1BookPages = iqro1PagesFromBook(IQRO_LEVELS[0].pages);
const iqro2BookPages = iqro2PagesFromBook(IQRO_LEVELS[1].pages);

interface IqroDigitalViewProps {
  onGoToQuiz?: () => void;
}

export const IqroDigitalView: React.FC<IqroDigitalViewProps> = () => {
  const { addXP, celebrateSuccess } = useQuranGame();
  
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

  const handlePlayItemAudio = (item: IqroItem, rowId: string) => {
    sounds.playWordClick();
    const uniqueKey = `${rowId}_${item.id}`;
    setPlayingItemId(uniqueKey);

    playIqroItem(item, audioSpeed, () => {
      setPlayingItemId((current) => current === uniqueKey ? null : current);
    }, useAiVoice, selectedLevel);
  };

  const handleLevelChange = (level: number) => {
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
      setIsQuizMode(true);
      setCurrentQuestionIndex(0);
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

  const handleAnswerQuiz = (optionIdx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(optionIdx);

    const questions = currentPage.quizQuestions || [];
    const q = questions[currentQuestionIndex];

    if (q && optionIdx === q.correctIndex) {
      sounds.playCorrectDing();
      setQuizScore((prev) => prev + 1);
      addXP(25);
    } else {
      sounds.playGentleRetry();
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        setQuizCompleted(true);
        sounds.playAyahComplete();
        celebrateSuccess();
        addXP(100);
        if (!completedLevels.includes(selectedLevel)) {
          setCompletedLevels((prev) => [...prev, selectedLevel]);
        }
      }
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1D3557] via-[#2A9D8F] to-[#52796F] p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -right-10 -bottom-10 opacity-10 font-arabic text-[180px] pointer-events-none select-none">
          اقرأ
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#E9C46A] text-[#1D3557] text-xs font-black uppercase tracking-wider shadow-xs flex items-center gap-1.5">
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
              <ShieldCheck className="w-4 h-4 text-[#E9C46A]" />
              <span>100% Suara Manusia Asli</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
              <Zap className="w-4 h-4 text-[#E9C46A]" />
              <span>Tanpa Mengeja (Langsung A - BA)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Level Selector Bar (Jilid 1 s.d. 6) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-[#1D3557] dark:text-white px-1">
          <span className="flex items-center gap-1.5">
            <BookMarked className="w-4 h-4 text-[#52796F]" />
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
                    ? 'bg-[#1D3557] text-white border-[#1D3557] ring-2 ring-[#E9C46A]/50 shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-[#52796F]'
                }`}
              >
                {isCompleted && (
                  <span className="absolute top-2 right-2 text-[#2A9D8F]">
                    <CheckCircle2 className="w-4 h-4 fill-[#2A9D8F] text-white" />
                  </span>
                )}

                <div>
                  <span className={`text-[10px] font-black uppercase tracking-wider block ${
                    isSelected ? 'text-[#E9C46A]' : 'text-[#52796F] dark:text-[#A8D5BA]'
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
                    <span className={`font-bold ${isSelected ? 'text-[#E9C46A]' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {jProgress.percent}%
                    </span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${isSelected ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                    <div
                      className="h-full bg-[#2A9D8F] transition-all duration-300"
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
      <div className="p-4 rounded-2xl bg-[#EAF2ED] dark:bg-[#152B28] border border-[#84A98C]/30 text-xs space-y-2 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-2xs"
              style={{ backgroundColor: currentJilid.colorTheme }}
            >
              J{currentJilid.level}
            </span>
            <div>
              <h3 className="font-bold text-sm text-[#1D3557] dark:text-white">
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
                  ? 'bg-[#1D3557] text-[#E9C46A] border-[#E9C46A]/60 shadow-xs ring-2 ring-[#E9C46A]/30'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-[#1D3557] dark:text-slate-200 hover:bg-slate-50'
              }`}
              title="Rekaman yang cocok selalu dipakai; pilih AI untuk bacaan yang belum memiliki rekaman"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E9C46A]" />
              <span>{useAiVoice ? '🎙️ AI untuk bacaan lain' : '🔊 Bacaan kartu'}</span>
            </button>}

            {/* Speed Controller */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <Sliders className="w-3.5 h-3.5 text-[#E9C46A] ml-1" />
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
                      ? 'bg-[#52796F] text-white'
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
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-[#1D3557] dark:text-[#E9C46A] flex items-center gap-1.5 cursor-pointer hover:bg-slate-50"
              title="Sembunyikan/Tampilkan Bantuan Latin"
            >
              {showLatin ? <Eye className="w-3.5 h-3.5 text-[#2A9D8F]" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
              <span>{showLatin ? 'Latin On' : 'Latin Off'}</span>
            </button>
          </div>
        </div>

        {/* Primary Rule from KH As'ad Humam */}
        <div className="p-3 bg-white dark:bg-slate-900/80 rounded-xl border border-[#84A98C]/40 text-[#2F3E46] dark:text-slate-200 flex items-start gap-2.5">
          <Lightbulb className="w-4 h-4 text-[#E9C46A] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-[11px] text-[#E76F51]">
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
                    <span className="text-[10px] font-bold text-[#52796F] uppercase tracking-wider block">
                      Halaman {currentPage.pageNumber} dari {currentJilid.pages.length}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold">
                      {pageCompletedCards}/{pageTotalCards} Kartu Centang
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#1D3557] dark:text-white mt-0.5">
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

                  <span className="text-xs font-bold text-[#1D3557] dark:text-[#E9C46A] px-2">
                    {activePageIndex + 1} / {currentJilid.pages.length}
                  </span>

                  <button
                    type="button"
                    onClick={handleNextPage}
                    className="px-3.5 py-2 rounded-xl bg-[#52796F] hover:bg-[#354F52] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                    title="Halaman Selanjutnya"
                  >
                    <span>{activePageIndex === currentJilid.pages.length - 1 ? 'Mulai Kuis' : 'Lanjut'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Teacher's Note Box */}
              {currentPage.teacherNote && (
                <div className="p-3.5 rounded-2xl bg-[#F4EFEA] dark:bg-slate-700/50 border border-[#C5A059]/30 text-xs flex items-center gap-2.5">
                  <GraduationCap className="w-5 h-5 text-[#8C6D23] dark:text-[#E9C46A] shrink-0" />
                  <p className="text-slate-700 dark:text-slate-200 leading-snug">
                    <strong>Catatan Pengajar:</strong> {currentPage.teacherNote}
                  </p>
                </div>
              )}

              {/* Interactive Row Flashcards Grid */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 px-1 gap-2">
                  <span className="font-semibold text-[#52796F] dark:text-[#A8D5BA]">
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
                    className="text-[11px] font-bold text-[#2A9D8F] dark:text-[#E9C46A] hover:underline cursor-pointer flex items-center gap-1 bg-[#EAF2ED] dark:bg-slate-700/80 px-2.5 py-1 rounded-xl"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2A9D8F]" />
                    <span>{isPageAllChecked ? 'Batal Centang Halaman Ini' : 'Centang Semua Halaman Ini'}</span>
                  </button>
                </div>

                <div className="space-y-3.5">
                  {currentPage.rows.map((row) => (
                    <div
                      key={row.id}
                      className="p-4 rounded-2xl bg-[#FDFBF7] dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs hover:border-[#84A98C]/60 transition-colors"
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
                                  ? 'bg-[#E9C46A] border-[#C5A059] ring-2 ring-[#E9C46A]/60 shadow-md'
                                  : isCompleted
                                  ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600/70 hover:border-emerald-500 shadow-2xs'
                                  : 'bg-white dark:bg-slate-800 hover:bg-[#EAF2ED] border-slate-200 dark:border-slate-700 hover:border-[#52796F]'
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
                                  ? 'text-[#1D3557]'
                                  : isCompleted
                                  ? 'text-emerald-800 dark:text-emerald-300'
                                  : 'text-[#1D3557] dark:text-[#E9C46A]'
                              }`}>
                                {item.arabic}
                              </span>

                              {showLatin && (
                                <span className={`text-xs font-extrabold mt-1 uppercase tracking-wider ${
                                  isPlaying
                                    ? 'text-[#1D3557]'
                                    : isCompleted
                                    ? 'text-emerald-700 dark:text-emerald-400'
                                    : 'text-[#52796F] dark:text-[#A8D5BA]'
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
                                isPlaying ? 'opacity-100 text-[#1D3557]' : 'opacity-40 group-hover:opacity-100 text-[#52796F]'
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
                      setIsQuizMode(true);
                      setCurrentQuestionIndex(0);
                      setQuizScore(0);
                      setQuizCompleted(false);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#2A9D8F] hover:bg-[#21867a] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                  >
                    <Award className="w-4 h-4" />
                    <span>Uji Kemampuan Iqro {currentJilid.level}</span>
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
              const questions = currentPage.quizQuestions || [
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
                    <span className="font-bold text-[#52796F] flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-[#E9C46A]" />
                      <span>Uji Evaluasi Iqro {currentJilid.level}</span>
                    </span>
                    <span>Soal {currentQuestionIndex + 1} dari {questions.length}</span>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#FDFBF7] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3 shadow-inner">
                    <p className="font-arabic text-5xl font-bold text-[#1D3557] dark:text-[#E9C46A] my-2">
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
                </div>
              );
            })()
          ) : (
            /* Quiz Completed View */
            <div className="text-center py-8 space-y-5 max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-[#E9C46A]/20 text-[#E9C46A] flex items-center justify-center mx-auto shadow-inner">
                <Trophy className="w-10 h-10 text-[#8C6D23] dark:text-[#E9C46A]" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  Evaluasi Selesai!
                </span>
                <h3 className="text-xl font-extrabold text-[#1D3557] dark:text-white mt-2">
                  Selamat! Anda Lulus Iqro {currentJilid.level}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Skor Anda: <strong>{quizScore} / {(currentPage.quizQuestions || []).length}</strong>. Lencana kelulusan telah ditambahkan ke profil Anda!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuizMode(false)}
                  className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
                >
                  Ulangi Pelajaran Halaman
                </button>

                {selectedLevel < 6 && (
                  <button
                    type="button"
                    onClick={() => handleLevelChange(selectedLevel + 1)}
                    className="w-full py-3 rounded-xl bg-[#52796F] hover:bg-[#354F52] text-white text-xs font-bold cursor-pointer shadow-xs"
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
