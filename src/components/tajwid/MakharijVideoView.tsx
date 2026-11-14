import React, { useState, useRef } from 'react';
import {
  Play,
  CheckCircle2,
  BookOpen,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Search,
  Layers,
  GraduationCap
} from 'lucide-react';
import { MAKHAREJ_LESSONS, type MakharijLesson } from '../../data/makharijVideosData';
import { sounds } from '../../utils/soundEffects';

const WATCHED_STORAGE_KEY = 'raudhah_makharij_watched_v1';

export const MakharijVideoView: React.FC = () => {
  const [activeLessonId, setActiveLessonId] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const playerRef = useRef<HTMLDivElement>(null);

  // Watched lessons in local storage
  const [watchedLessons, setWatchedLessons] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(WATCHED_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveWatched = (ids: number[]) => {
    setWatchedLessons(ids);
    try {
      localStorage.setItem(WATCHED_STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // ignore
    }
  };

  const toggleWatched = (id: number) => {
    sounds.playWordClick();
    if (watchedLessons.includes(id)) {
      saveWatched(watchedLessons.filter((item) => item !== id));
    } else {
      sounds.playAyahComplete();
      saveWatched([...watchedLessons, id]);
    }
  };

  const currentLesson = MAKHAREJ_LESSONS.find((l) => l.id === activeLessonId) || MAKHAREJ_LESSONS[0];

  const handleSelectLesson = (lesson: MakharijLesson) => {
    sounds.playWordClick();
    setActiveLessonId(lesson.id);
    if (playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePrevLesson = () => {
    if (currentLesson.id > 1) {
      const prev = MAKHAREJ_LESSONS.find((l) => l.id === currentLesson.id - 1);
      if (prev) handleSelectLesson(prev);
    }
  };

  const handleNextLesson = () => {
    if (currentLesson.id < MAKHAREJ_LESSONS.length) {
      const next = MAKHAREJ_LESSONS.find((l) => l.id === currentLesson.id + 1);
      if (next) handleSelectLesson(next);
    }
  };

  // Categories list
  const categories = [
    'Semua',
    'Pengantar',
    'Tenggorokan (Al-Halq)',
    'Lidah (Al-Lisan)',
    'Bibir (Asy-Syafatain)',
    'Rongga (Al-Jauf & Khaisyum)',
    'Sifat Huruf (Sifaat)',
    'Evaluasi'
  ];

  // Filter lessons
  const filteredLessons = MAKHAREJ_LESSONS.filter((l) => {
    const matchesCategory = selectedCategory === 'Semua' || l.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      l.title.toLowerCase().includes(query) ||
      l.description.toLowerCase().includes(query) ||
      (l.arabicTitle && l.arabicTitle.toLowerCase().includes(query)) ||
      l.letters.some((lt) => lt.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  const progressPercent = Math.round((watchedLessons.length / MAKHAREJ_LESSONS.length) * 100);

  // Fallback video ID for embed
  const currentVideoId = currentLesson.videoId || '-YrfRpwFMe8';

  // Standard embed URL
  const embedUrl = `https://www.youtube.com/embed/${currentVideoId}?rel=0&enablejsapi=1`;

  return (
    <div className="space-y-6">
      {/* Top Banner Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-[#173B4E] p-6 sm:p-8 text-white shadow-sm border border-[#246579]/40">
        <div className="absolute -right-8 -bottom-8 opacity-10 font-arabic text-[150px] pointer-events-none select-none">
          مخارج
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#D3A253] text-[#173B4E] text-xs font-black uppercase tracking-wider shadow-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Modul Teori Tajwid & Sifat Huruf</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold border border-white/30 backdrop-blur-xs">
              Arabic 101 Official Series (23 Video)
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Makharij & Sifaat Al-Huruf
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
            Katalog 23 video panduan visual anatomi titik artikulasi dan sifat huruf hijaiyah. Pelajari konsep makhraj, aliran nafas (*Hams/Jahr*), aliran suara (*Syiddah/Rakhawah*), serta tebal tipis (*Isti&apos;la/Ithbaq*).
          </p>

          {/* Progress Tracker */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 max-w-md bg-black/20 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/10">
              <div
                className="bg-gradient-to-r from-[#D3A253] to-[#2D8192] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-200">
              <span className="font-bold text-[#D3A253]">{watchedLessons.length} / {MAKHAREJ_LESSONS.length} Video Tuntas</span>
              <span>({progressPercent}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Video Player Container */}
      <div ref={playerRef} className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        {/* Active Lesson Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-[#246579]/15 dark:bg-[#246579]/40 text-[#246579] dark:text-[#A7CDD3] text-xs font-bold">
                Pelajaran {currentLesson.id} dari {MAKHAREJ_LESSONS.length}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                · {currentLesson.category} · {currentLesson.duration}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#173B4E] dark:text-white flex items-center gap-2">
              <span>{currentLesson.title}</span>
            </h3>
            {currentLesson.arabicTitle && (
              <p className="font-arabic text-sm text-[#246579] dark:text-[#D3A253]" dir="rtl">
                {currentLesson.arabicTitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => toggleWatched(currentLesson.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                watchedLessons.includes(currentLesson.id)
                  ? 'bg-[#2D8192] text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{watchedLessons.includes(currentLesson.id) ? 'Selesai' : 'Tandai Selesai'}</span>
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-md border border-slate-200 dark:border-slate-800">
          <iframe
            key={`makharij-lesson-${currentLesson.id}`}
            src={embedUrl}
            title={currentLesson.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>

        {/* Video Explanation and Letters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="space-y-1.5 max-w-2xl">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {currentLesson.description}
            </p>
            {currentLesson.letters.length > 0 && currentLesson.letters[0] !== 'ـ' && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Huruf terkait:</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentLesson.letters.map((letter, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center justify-center min-w-7 h-7 px-2 font-arabic text-base font-bold rounded-lg bg-[#F1EDE6] dark:bg-slate-700 text-[#173B4E] dark:text-[#D3A253] border border-slate-200 dark:border-slate-600"
                    >
                      {letter}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Prev / Next Navigation buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              disabled={currentLesson.id <= 1}
              onClick={handlePrevLesson}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>
            <button
              type="button"
              disabled={currentLesson.id >= MAKHAREJ_LESSONS.length}
              onClick={handleNextLesson}
              className="px-3 py-2 rounded-xl bg-[#246579] hover:bg-[#1f5768] text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-all shadow-xs"
            >
              <span>Berikutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Catalog Search & Category Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#173B4E] dark:text-white">
            <Layers className="w-4 h-4 text-[#246579]" />
            <span>Katalog 23 Pelajaran Makhraj & Sifat Huruf</span>
          </div>

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari huruf (misal: ع, dhad, qalqalah)..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#246579]"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                sounds.playWordClick();
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                selectedCategory === cat
                  ? 'bg-[#246579] text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-[#246579]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Lessons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredLessons.map((lesson) => {
          const isActive = lesson.id === currentLesson.id;
          const isWatched = watchedLessons.includes(lesson.id);
          const lessonVid = lesson.videoId || '-YrfRpwFMe8';
          const lessonThumb = `https://img.youtube.com/vi/${lessonVid}/mqdefault.jpg`;

          return (
            <div
              key={lesson.id}
              onClick={() => handleSelectLesson(lesson)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative flex gap-3 ${
                isActive
                  ? 'bg-[#173B4E] text-white border-[#173B4E] shadow-md ring-2 ring-[#D3A253]/50'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-[#246579] hover:shadow-xs'
              }`}
            >
              {/* Thumbnail preview */}
              <div className="relative w-24 sm:w-28 h-18 sm:h-20 rounded-xl overflow-hidden bg-slate-900 shrink-0 self-center">
                <img
                  src={lessonThumb}
                  alt={lesson.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
                    <Play className="w-3 h-3 fill-current translate-x-0.5" />
                  </div>
                </div>
                <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/75 text-[9px] font-mono text-white">
                  {lesson.duration}
                </span>
              </div>

              {/* Lesson details */}
              <div className="flex-1 flex flex-col justify-between min-w-0 space-y-1">
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-[#D3A253] text-[#173B4E]'
                          : 'bg-[#246579]/10 text-[#246579] dark:text-[#A7CDD3]'
                      }`}
                    >
                      Pelajaran {lesson.id}
                    </span>

                    {isWatched && (
                      <span className="flex items-center gap-0.5 text-[10px] text-[#2D8192] dark:text-[#52c1d8] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Selesai</span>
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-xs sm:text-sm line-clamp-1 mt-0.5">
                    {lesson.title}
                  </h4>

                  <p
                    className={`text-[11px] line-clamp-1 leading-snug ${
                      isActive ? 'text-slate-200' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {lesson.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/60 mt-auto">
                  <div className="flex items-center gap-1">
                    {lesson.letters.slice(0, 4).map((char, cIdx) => (
                      <span
                        key={cIdx}
                        className={`inline-flex items-center justify-center min-w-5 h-5 px-1 font-arabic text-xs font-bold rounded ${
                          isActive
                            ? 'bg-white/15 text-[#D3A253]'
                            : 'bg-slate-100 dark:bg-slate-700 text-[#173B4E] dark:text-[#D3A253]'
                        }`}
                      >
                        {char}
                      </span>
                    ))}
                    {lesson.letters.length > 4 && (
                      <span className="text-[10px] text-slate-400">+{lesson.letters.length - 4}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-0.5 text-[11px] font-semibold">
                    {isActive ? (
                      <span className="text-[#D3A253] flex items-center gap-1 font-bold">
                        <Play className="w-3 h-3 fill-current" />
                        <span>Dipilih</span>
                      </span>
                    ) : (
                      <span className="text-[#246579] dark:text-[#A7CDD3] flex items-center">
                        <span>Lihat</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredLessons.length === 0 && (
        <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 space-y-2">
          <BookOpen className="w-8 h-8 mx-auto text-slate-400" />
          <p className="font-semibold text-sm">Tidak ada video yang cocok dengan pencarian Anda.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Semua');
            }}
            className="text-xs text-[#246579] dark:text-[#A7CDD3] font-bold underline"
          >
            Reset filter dan pencarian
          </button>
        </div>
      )}
    </div>
  );
};
