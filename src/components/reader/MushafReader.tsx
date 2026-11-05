import React from 'react';
import { motion } from 'motion/react';
import { Volume2, VolumeX, CheckCircle, Bookmark, Sparkles, BookOpen, Heart } from 'lucide-react';
import { useQuranGame } from '../../context/QuranGameContext';
import { Ayah } from '../../types/quran';

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

  const handleTogglePlay = (ayah: Ayah) => {
    if (isPlayingAudio && currentPlayingAyahId === ayah.id) {
      pauseMurottal();
    } else {
      playMurottal(ayah);
    }
  };

  return (
    <div className="w-full space-y-6">
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
    </div>
  );
};
