import React, { useState, useRef } from 'react';
import {
  Play,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Search,
  Youtube,
  Layers,
  MonitorPlay,
  AlertCircle,
  GraduationCap
} from 'lucide-react';
import { AYMAN_LESSONS, AYMAN_PLAYLIST_ID, AYMAN_PLAYLIST_URL, type AymanLesson } from '../../data/aymanMakharijData';
import { sounds } from '../../utils/soundEffects';

const WATCHED_STORAGE_KEY = 'raudhah_ayman_makhraj_watched_v1';

export const AymanVideoView: React.FC = () => {
  const [activeLessonId, setActiveLessonId] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [playerMode, setPlayerMode] = useState<'embed' | 'preview'>('embed');
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

  const currentLesson = AYMAN_LESSONS.find((l) => l.id === activeLessonId) || AYMAN_LESSONS[0];

  const handleSelectLesson = (lesson: AymanLesson) => {
    sounds.playWordClick();
    setActiveLessonId(lesson.id);
    if (playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePrevLesson = () => {
    if (currentLesson.id > 1) {
      const prev = AYMAN_LESSONS.find((l) => l.id === currentLesson.id - 1);
      if (prev) handleSelectLesson(prev);
    }
  };

  const handleNextLesson = () => {
    if (currentLesson.id < AYMAN_LESSONS.length) {
      const next = AYMAN_LESSONS.find((l) => l.id === currentLesson.id + 1);
      if (next) handleSelectLesson(next);
    }
  };

  // Categories list
  const categories = [
    'Semua',
    'Tenggorokan (Al-Halq)',
    'Lidah (Al-Lisan)',
    'Bibir (Asy-Syafatain)',
    'Rongga (Al-Jauf)'
  ];

  // Filter lessons
  const filteredLessons = AYMAN_LESSONS.filter((l) => {
    const matchesCategory = selectedCategory === 'Semua' || l.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      l.title.toLowerCase().includes(query) ||
      l.letter.toLowerCase().includes(query) ||
      l.letterName.toLowerCase().includes(query) ||
      l.arabicName.toLowerCase().includes(query) ||
      l.makhrajPoint.toLowerCase().includes(query) ||
      l.description.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const progressPercent = Math.round((watchedLessons.length / AYMAN_LESSONS.length) * 100);

  // Video ID fallback
  const currentVideoId = currentLesson.videoId || 'aQ93eMKss0Q';

  // Standard embed URL
  const embedUrl = `https://www.youtube.com/embed/${currentVideoId}?rel=0&enablejsapi=1`;

  // Direct YouTube link to exact playlist index
  const youtubeDirectLink = `https://www.youtube.com/watch?v=${currentVideoId}&list=${AYMAN_PLAYLIST_ID}&index=${currentLesson.index}`;

  const thumbnailUrl = `https://img.youtube.com/vi/${currentVideoId}/hqdefault.jpg`;

  return (
    <div className="space-y-6">
      {/* Top Banner Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-[#173B4E] p-6 sm:p-8 text-white shadow-sm border border-[#246579]/40">
        <div className="absolute -right-8 -bottom-8 opacity-10 font-arabic text-[150px] pointer-events-none select-none">
          أيمن
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#D3A253] text-[#173B4E] text-xs font-black uppercase tracking-wider shadow-xs flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Rujukan Tajwid Internasional</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold border border-white/30 backdrop-blur-xs flex items-center gap-1">
              <Youtube className="w-3.5 h-3.5 text-red-400" />
              <span>Dr. Ayman Rushdi Suweid (27 Video)</span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Makhārij Al-Hurūf Bersanad
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
            Panduan video visual praktis (1–2 menit per huruf) yang menjelaskan secara presisi letak makhraj dan artikulasi 28 huruf hijaiyah, diasuh langsung oleh guru besar tajwid dan qira&apos;at dunia, <strong>Syaikh Dr. Ayman Rushdi Suwaid</strong> (penulis kitab <em>At-Tajwīd Al-Muṣawwar</em>).
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
              <span className="font-bold text-[#D3A253]">{watchedLessons.length} / {AYMAN_LESSONS.length} Huruf Tuntas</span>
              <span>({progressPercent}%)</span>
              <a
                href={AYMAN_PLAYLIST_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-slate-300 hover:text-white underline underline-offset-2 ml-auto sm:ml-0"
              >
                <span>Buka Playlist Utuh</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Video Player Container */}
      <div ref={playerRef} className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        {/* Active Letter Spotlight Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700/60 pb-4">
          <div className="flex items-start sm:items-center gap-3">
            {/* Big Arabic Letter Box */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#173B4E] to-[#246579] text-[#D3A253] flex items-center justify-center font-arabic text-3xl sm:text-4xl font-bold shadow-sm shrink-0 border border-[#D3A253]/30">
              {currentLesson.letter}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-[#246579]/15 dark:bg-[#246579]/40 text-[#246579] dark:text-[#A7CDD3] text-xs font-bold">
                  Huruf {currentLesson.id} dari {AYMAN_LESSONS.length}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  · {currentLesson.category} · {currentLesson.duration}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#173B4E] dark:text-white flex items-center gap-2">
                <span>Huruf {currentLesson.letterName} ({currentLesson.arabicName})</span>
              </h3>
              <p className="text-xs font-semibold text-[#246579] dark:text-[#D3A253]">
                📍 {currentLesson.makhrajPoint}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {/* Player Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/80 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setPlayerMode('embed')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  playerMode === 'embed'
                    ? 'bg-white dark:bg-slate-800 text-[#246579] dark:text-[#A7CDD3] shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
                title="Putar video di dalam aplikasi"
              >
                <MonitorPlay className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sematkan</span>
              </button>
              <button
                type="button"
                onClick={() => setPlayerMode('preview')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  playerMode === 'preview'
                    ? 'bg-white dark:bg-slate-800 text-[#246579] dark:text-[#A7CDD3] shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
                title="Tampilkan kartu dan tombol putar YouTube"
              >
                <Youtube className="w-3.5 h-3.5 text-red-500" />
                <span className="hidden sm:inline">Kartu</span>
              </button>
            </div>

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
              <span>{watchedLessons.includes(currentLesson.id) ? 'Selesai' : 'Tandai'}</span>
            </button>
          </div>
        </div>

        {/* Video Player Display: Embed vs Interactive Preview Card */}
        {playerMode === 'embed' ? (
          <div className="space-y-3">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-md border border-slate-200 dark:border-slate-800">
              <iframe
                key={`ayman-lesson-${currentLesson.id}`}
                src={embedUrl}
                title={currentLesson.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>

            {/* Notice if YouTube restricts playback */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Jika video di atas menampilkan <strong>&quot;Video tidak tersedia&quot;</strong>, YouTube membatasi pemutaran embed. Klik tombol di kanan untuk memutar langsung.
                </span>
              </div>
              <a
                href={youtubeDirectLink}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
              >
                <Youtube className="w-4 h-4 fill-current" />
                <span>Buka di YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : (
          /* Interactive Preview Card */
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 shadow-md border border-slate-200 dark:border-slate-800 flex flex-col justify-between p-6 group">
            {/* Background Thumbnail Image with Backdrop */}
            <img
              src={thumbnailUrl}
              alt={currentLesson.title}
              className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60 pointer-events-none" />

            {/* Top badges */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/20 flex items-center gap-1.5">
                <Youtube className="w-4 h-4 text-red-500" />
                <span>Huruf {currentLesson.letterName} ({currentLesson.letter})</span>
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-slate-200 text-xs font-semibold border border-white/10">
                {currentLesson.duration}
              </span>
            </div>

            {/* Center Big Play Action */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto space-y-3">
              <a
                href={youtubeDirectLink}
                target="_blank"
                rel="noreferrer"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer ring-4 ring-white/30"
                title="Buka dan tonton di YouTube"
              >
                <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current translate-x-0.5" />
              </a>
              <p className="text-white text-xs sm:text-sm font-bold drop-shadow-md">
                Putar video makhraj {currentLesson.letterName} di YouTube
              </p>
            </div>

            {/* Bottom info */}
            <div className="relative z-10 flex items-end justify-between gap-3 text-white">
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm sm:text-base line-clamp-1 drop-shadow-md">
                  {currentLesson.title}
                </h4>
                <p className="text-xs text-slate-300 line-clamp-1">
                  {currentLesson.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPlayerMode('embed')}
                className="shrink-0 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold backdrop-blur-md border border-white/20 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <MonitorPlay className="w-3.5 h-3.5" />
                <span>Coba Sematkan</span>
              </button>
            </div>
          </div>
        )}

        {/* Video Explanation and Letters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="space-y-1 max-w-2xl">
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {currentLesson.description}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Penjelasan resmi bersanad oleh <strong>Syaikh Dr. Ayman Rushdi Suwaid</strong> (Darul Qur&apos;an Sydney).
            </p>
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
              disabled={currentLesson.id >= AYMAN_LESSONS.length}
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
            <span>Katalog 27 Video Makhraj Huruf (Dr. Ayman Suwayd)</span>
          </div>

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari huruf (misal: Ain, Kho, ض, Nun)..."
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

      {/* Grid of 27 Letter Lessons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredLessons.map((lesson) => {
          const isActive = lesson.id === currentLesson.id;
          const isWatched = watchedLessons.includes(lesson.id);
          const lessonVid = lesson.videoId || 'aQ93eMKss0Q';
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
              {/* Thumbnail / Letter Avatar */}
              <div className="relative w-24 sm:w-28 h-20 sm:h-22 rounded-xl overflow-hidden bg-slate-900 shrink-0 self-center">
                <img
                  src={lessonThumb}
                  alt={lesson.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
                    <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                  </div>
                </div>
                <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/75 text-[9px] font-mono text-white">
                  {lesson.duration}
                </span>
                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-[#173B4E]/90 text-[10px] font-arabic font-bold text-[#D3A253]">
                  {lesson.letter}
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
                      Huruf {lesson.id}: {lesson.letterName}
                    </span>

                    {isWatched && (
                      <span className="flex items-center gap-0.5 text-[10px] text-[#2D8192] dark:text-[#52c1d8] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Selesai</span>
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-xs sm:text-sm line-clamp-1 mt-0.5">
                    Makhraj {lesson.letterName} ({lesson.arabicName})
                  </h4>

                  <p
                    className={`text-[11px] line-clamp-1 leading-snug ${
                      isActive ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {lesson.makhrajPoint}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/60 mt-auto">
                  <span
                    className={`text-[10px] ${
                      isActive ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {lesson.category}
                  </span>

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
          <p className="font-semibold text-sm">Tidak ada video huruf yang cocok dengan pencarian Anda.</p>
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
