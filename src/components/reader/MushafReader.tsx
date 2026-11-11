import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Volume2, VolumeX, CheckCircle, Bookmark, Sparkles, BookOpen, Heart, ChevronLeft, ChevronRight, ChevronDown, Search, Loader2 } from 'lucide-react';
import { useQuranGame } from '../../context/QuranGameContext';
import { Ayah } from '../../types/quran';
import { loadReaderIndex, loadReaderSurah, ReaderAyah, ReaderIndex, ReaderSurah } from '../../services/quranReaderData';

const normalizeSearch = (text: string) => text.toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]/g, '');
// Kerangka konsonan agar ejaan berbeda tetap cocok, mis. "baqoroh" → Al-Baqarah.
const consonantSkeleton = (text: string) => normalizeSearch(text).replace(/[aiueo'h]/g, '').replace(/(.)\1+/g, '$1');

export const MushafReader: React.FC = () => {
  const {
    activeSurah,
    fontSize,
    inspectWord,
    playMurottal,
    pauseMurottal,
    isPlayingAudio,
    currentPlayingAyahId,
    memorizedAyahIds,
    markAyahMemorized,
    mode
  } = useQuranGame();

  const [surahIndex, setSurahIndex] = useState<ReaderIndex | null>(null);
  const [surahNumber, setSurahNumber] = useState<number>(activeSurah.number);
  const [loadedSurah, setLoadedSurah] = useState<ReaderSurah | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadReaderIndex().then(setSurahIndex);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadError(false);
    loadReaderSurah(surahNumber)
      .then((surah) => {
        if (!cancelled) setLoadedSurah(surah);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [surahNumber, reloadKey]);

  const surahList = surahIndex?.surahs ?? [];
  const surahPosition = surahList.findIndex((s) => s.number === surahNumber);
  const previousSurah = surahPosition > 0 ? surahList[surahPosition - 1] : null;
  const nextSurah = surahPosition >= 0 && surahPosition < surahList.length - 1 ? surahList[surahPosition + 1] : null;
  const isLoading = !loadError && loadedSurah?.number !== surahNumber;
  const currentMeta = surahList.find((s) => s.number === surahNumber) ?? loadedSurah;

  const filteredSurahs = useMemo(() => {
    const query = normalizeSearch(searchQuery);
    if (!query) return surahList;
    const skeleton = query.length >= 3 ? consonantSkeleton(query) : '';
    return surahList.filter((s) =>
      String(s.number) === query ||
      normalizeSearch(s.nameLatin).includes(query) ||
      normalizeSearch(s.translationLatin).includes(query) ||
      normalizeSearch(s.nameArabic).includes(query) ||
      (skeleton.length >= 2 && consonantSkeleton(s.nameLatin).includes(skeleton))
    );
  }, [surahList, searchQuery]);

  const openSurah = (number: number) => {
    if (isPlayingAudio) pauseMurottal();
    setSurahNumber(number);
    setIsPickerOpen(false);
    setSearchQuery('');
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleTogglePlay = (ayah: ReaderAyah) => {
    if (isPlayingAudio && currentPlayingAyahId === ayah.id) {
      pauseMurottal();
    } else {
      playMurottal(ayah as Ayah);
    }
  };

  return (
    <div ref={topRef} className="w-full space-y-6 scroll-mt-24">
      {/* Surah Navigator (114 Surah) */}
      <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center gap-2 p-2">
          <button
            onClick={() => previousSurah && openSurah(previousSurah.number)}
            disabled={!previousSurah}
            className="p-2.5 rounded-2xl text-[#246579] dark:text-[#A7CDD3] hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title={previousSurah ? `Surah sebelumnya: ${previousSurah.nameLatin}` : 'Tidak ada surah sebelumnya'}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsPickerOpen((open) => !open)}
            className="flex-1 min-w-0 flex items-center justify-center gap-2 px-3 py-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
            aria-expanded={isPickerOpen}
          >
            <span className="w-7 h-7 shrink-0 rounded-full bg-[#246579]/10 dark:bg-[#246579]/30 text-[#246579] dark:text-[#A7CDD3] flex items-center justify-center font-bold text-[11px]">
              {surahNumber}
            </span>
            <span className="truncate text-sm font-bold text-[#173B4E] dark:text-white">
              {currentMeta ? currentMeta.nameLatin : 'Memuat…'}
            </span>
            <span className="hidden sm:inline text-xs text-[#477F8D] dark:text-[#94A3B8] truncate">
              {surahList.length > 0 && `· Pilih dari ${surahList.length} surah`}
            </span>
            <ChevronDown className={`w-4 h-4 shrink-0 text-[#477F8D] transition-transform ${isPickerOpen ? 'rotate-180' : ''}`} />
          </button>

          <button
            onClick={() => nextSurah && openSurah(nextSurah.number)}
            disabled={!nextSurah}
            className="p-2.5 rounded-2xl text-[#246579] dark:text-[#A7CDD3] hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title={nextSurah ? `Surah berikutnya: ${nextSurah.nameLatin}` : 'Tidak ada surah berikutnya'}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {isPickerOpen && (
          <div className="border-t border-slate-100 dark:border-slate-700/60 p-3 sm:p-4 space-y-3">
            <label className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#F8F6F1] dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
              <Search className="w-4 h-4 text-[#477F8D] shrink-0" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Cari nama surah, arti, atau nomor…"
                className="w-full bg-transparent text-sm text-[#293640] dark:text-white placeholder:text-slate-400 outline-none"
              />
            </label>

            <div className="max-h-80 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pr-1">
              {filteredSurahs.map((s) => (
                <button
                  key={`reader_pick_${s.number}`}
                  onClick={() => openSurah(s.number)}
                  className={`flex items-center gap-3 p-2.5 rounded-2xl border text-left transition-colors ${
                    s.number === surahNumber
                      ? 'border-[#D3A253] bg-[#D3A253]/10'
                      : 'border-slate-200 dark:border-slate-700 hover:border-[#477F8D]/50 hover:bg-slate-50 dark:hover:bg-slate-700/40'
                  }`}
                >
                  <span className="w-8 h-8 shrink-0 rounded-full bg-[#246579]/10 dark:bg-[#246579]/30 text-[#246579] dark:text-[#A7CDD3] flex items-center justify-center font-bold text-[11px]">
                    {s.number}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-[#173B4E] dark:text-white truncate">{s.nameLatin}</span>
                    <span className="block text-[11px] text-[#477F8D] dark:text-[#94A3B8] truncate">
                      {s.translationLatin} · {s.numberOfAyahs} Ayat
                    </span>
                  </span>
                  <span className="font-arabic text-lg text-[#BE9452] shrink-0">{s.nameArabic}</span>
                </button>
              ))}
              {filteredSurahs.length === 0 && (
                <p className="col-span-full text-center text-xs text-slate-500 py-6">Surah tidak ditemukan.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {loadError && (
        <div className="bg-white dark:bg-slate-800/80 rounded-3xl p-6 text-center border border-slate-200 dark:border-slate-700 space-y-3">
          <p className="text-sm text-[#293640] dark:text-[#CBD5E1]">Surah ini belum bisa dimuat. Periksa koneksi internet Anda.</p>
          <button
            onClick={() => setReloadKey((key) => key + 1)}
            className="px-4 py-2 bg-[#246579] hover:bg-[#174C60] text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-[#246579] dark:text-[#A7CDD3]">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Memuat surah…</span>
        </div>
      )}

      {loadedSurah && !isLoading && !loadError && (() => {
        const activeSurah = loadedSurah;
        return (
      <>
      {/* Surah Header Banner */}
      <div className="relative overflow-hidden bg-[#246579] text-white rounded-3xl p-6 sm:p-8 text-center shadow-sm">
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D3A253_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 space-y-2">
          <p className="font-arabic text-3xl sm:text-4xl text-[#D3A253] tracking-wide mb-1">
            سُورَةُ {activeSurah.nameArabic}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Surah {activeSurah.nameLatin}
          </h2>
          <p className="text-xs text-[#A7CDD3] font-medium">
            {activeSurah.translationLatin} · {activeSurah.numberOfAyahs} Ayat · {activeSurah.revelationType}
          </p>
        </div>

        {/* Bismillah Banner if not At-Taubah */}
        {activeSurah.bismillahPre && (
          <div className="mt-6 pt-4 border-t border-white/20">
            <p className="font-arabic text-2xl sm:text-3xl text-[#F8F6F1]">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </div>
        )}
      </div>

      {/* Reader Guidance Tip */}
      <div className="flex items-center justify-between text-xs text-[#246579] dark:text-[#94A3B8] px-2">
        <span className="flex items-center gap-1.5 font-medium">
          <BookOpen className="w-4 h-4 text-[#D3A253]" />
          <span>Klik pada sembarang kata Arab untuk membuka arti per kata & akar kata.</span>
        </span>
        <span className="text-[11px] opacity-75">
          Font: {fontSize}px
        </span>
      </div>
      {surahIndex?.source && (
        <p className="px-2 -mt-3 text-[10px] text-slate-500 dark:text-slate-400">
          Teks & arti per kata: {surahIndex.source.api} · Terjemah: {surahIndex.source.translation.name}
        </p>
      )}

      {/* Ayahs List */}
      <div className="space-y-4">
        {activeSurah.ayahs.map((ayah) => {
          const isPlayingThis = isPlayingAudio && currentPlayingAyahId === ayah.id;
          const isMemorized = memorizedAyahIds.includes(ayah.id);

          return (
            <div
              key={ayah.id}
              className={`relative bg-white dark:bg-slate-800/80 rounded-3xl p-5 sm:p-7 border transition-all ${
                isPlayingThis
                  ? 'border-[#D3A253] ring-2 ring-[#D3A253]/20 shadow-md'
                  : 'border-slate-200 dark:border-slate-700 hover:border-[#477F8D]/50 shadow-xs'
              }`}
            >
              {/* Ayah Top Meta & Audio Bar */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-700/60">
                {/* Ayah Number Badge */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#246579]/10 dark:bg-[#246579]/30 text-[#246579] dark:text-[#477F8D] flex items-center justify-center font-bold text-xs">
                    {ayah.ayahNumber}
                  </div>
                  <span className="text-xs font-semibold text-[#246579] dark:text-[#94A3B8]">
                    Ayat {ayah.ayahNumber}
                  </span>
                </div>

                {/* Audio and Memorized buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePlay(ayah)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                      isPlayingThis
                        ? 'bg-[#D3A253] text-[#173B4E]'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                    }`}
                    title={isPlayingThis ? 'Jeda Audio' : 'Putar Murottal'}
                  >
                    {isPlayingThis ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isPlayingThis ? 'Jeda' : 'Putar'}</span>
                  </button>

                  <button
                    onClick={() => markAyahMemorized(ayah.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                      isMemorized
                        ? 'bg-[#477F8D] text-white'
                        : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                    title="Tandai Sudah Dihafal"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{isMemorized ? 'Sudah Dihafal' : 'Tandai Hafal'}</span>
                  </button>
                </div>
              </div>

              {/* Arabic Verse with Word Clickability */}
              <div
                dir="rtl"
                className="py-3 text-right leading-loose select-text"
              >
                {ayah.words.map((word, wordIdx) => (
                  <button
                    key={`reader_${ayah.id}_${word.id}_${wordIdx}`}
                    onClick={() => inspectWord(word)}
                    className="inline-block px-1.5 py-0.5 rounded-lg hover:bg-[#D3A253]/20 dark:hover:bg-[#D3A253]/20 cursor-pointer transition-colors text-[#173B4E] dark:text-[#F1F5F9] font-arabic"
                    style={{ fontSize: `${fontSize}px` }}
                    title={`Klik untuk arti: "${word.translation}"`}
                  >
                    {word.arabic}
                  </button>
                ))}
                {/* Traditional Ayah End Emblem */}
                <span className="inline-block px-2 text-[#BE9452] font-bold text-lg select-none">
                  ۝{ayah.ayahNumber}
                </span>
              </div>

              {/* Transliteration */}
              <p className="text-xs text-[#246579] dark:text-[#A7CDD3] font-medium italic mt-2">
                {ayah.transliteration}
              </p>

              {/* Translation */}
              <p className="text-xs text-[#293640] dark:text-[#CBD5E1] leading-relaxed mt-1.5 font-normal">
                "{ayah.translationId}"
              </p>

              {/* Tadabbur Wisdom Card */}
              {ayah.tadabbur && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 bg-[#F8F6F1] dark:bg-[#152E38]/70 p-3 rounded-2xl border border-[#477F8D]/20">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#246579] dark:text-[#477F8D] mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#D3A253]" />
                    <span>Tadabbur: {ayah.tadabbur.title}</span>
                  </div>
                  <p className="text-[11px] text-[#174C60] dark:text-[#CBD5E1] leading-relaxed">
                    {ayah.tadabbur.hikmah}
                  </p>
                  <p className="text-[11px] font-semibold text-[#B87845] mt-1.5 flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    <span>Amal Hari Ini: {ayah.tadabbur.amal}</span>
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      </>
        );
      })()}
    </div>
  );
};
