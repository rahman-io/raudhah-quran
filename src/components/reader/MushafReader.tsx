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
      <div className="relative overflow-hidden bg-gradient-to-r from-[#52796F] via-[#354F52] to-[#2F3E46] text-white rounded-3xl p-6 sm:p-8 text-center shadow-md">
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#E9C46A_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 space-y-2">
          <p className="font-arabic text-3xl sm:text-4xl text-[#E9C46A] tracking-wide mb-1">
            سُورَةُ {activeSurah.nameArabic}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Surah {activeSurah.nameLatin}
          </h2>
          <p className="text-xs text-[#A8D5BA] font-medium">
            {activeSurah.translationLatin} · {activeSurah.numberOfAyahs} Ayat · {activeSurah.revelationType}
          </p>
        </div>

        {/* Bismillah Banner if not At-Taubah */}
        {activeSurah.bismillahPre && (
          <div className="mt-6 pt-4 border-t border-white/20">
            <p className="font-arabic text-2xl sm:text-3xl text-[#FDFBF7]">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </div>
        )}
      </div>

      {/* Reader Guidance Tip */}
      <div className="flex items-center justify-between text-xs text-[#52796F] dark:text-[#94A3B8] px-2">
        <span className="flex items-center gap-1.5 font-medium">
          <BookOpen className="w-4 h-4 text-[#E9C46A]" />
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
                  ? 'border-[#E9C46A] ring-2 ring-[#E9C46A]/20 shadow-md'
                  : 'border-slate-200 dark:border-slate-700 hover:border-[#84A98C]/50 shadow-xs'
              }`}
            >
              {/* Ayah Top Meta & Audio Bar */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-700/60">
                {/* Ayah Number Badge */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#52796F]/10 dark:bg-[#52796F]/30 text-[#52796F] dark:text-[#84A98C] flex items-center justify-center font-bold text-xs">
                    {ayah.ayahNumber}
                  </div>
                  <span className="text-xs font-semibold text-[#52796F] dark:text-[#94A3B8]">
                    Ayat {ayah.ayahNumber}
                  </span>
                </div>

                {/* Audio and Memorized buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePlay(ayah)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                      isPlayingThis
                        ? 'bg-[#E9C46A] text-[#1D3557]'
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
                        ? 'bg-[#84A98C] text-white'
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
                    className="inline-block px-1.5 py-0.5 rounded-lg hover:bg-[#E9C46A]/20 dark:hover:bg-[#E9C46A]/20 cursor-pointer transition-colors text-[#1D3557] dark:text-[#F1F5F9] font-arabic"
                    style={{ fontSize: `${fontSize}px` }}
                    title={`Klik untuk arti: "${word.translation}"`}
                  >
                    {word.arabic}
                  </button>
                ))}
                {/* Traditional Ayah End Emblem */}
                <span className="inline-block px-2 text-[#C5A059] font-bold text-lg select-none">
                  ۝{ayah.ayahNumber}
                </span>
              </div>

              {/* Transliteration */}
              <p className="text-xs text-[#52796F] dark:text-[#A8D5BA] font-medium italic mt-2">
                {ayah.transliteration}
              </p>

              {/* Translation */}
              <p className="text-xs text-[#2F3E46] dark:text-[#CBD5E1] leading-relaxed mt-1.5 font-normal">
                "{ayah.translationId}"
              </p>

              {/* Tadabbur Wisdom Card */}
              {ayah.tadabbur && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 bg-[#FDFBF7] dark:bg-[#16272B]/70 p-3 rounded-2xl border border-[#84A98C]/20">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#52796F] dark:text-[#84A98C] mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#E9C46A]" />
                    <span>Tadabbur: {ayah.tadabbur.title}</span>
                  </div>
                  <p className="text-[11px] text-[#354F52] dark:text-[#CBD5E1] leading-relaxed">
                    {ayah.tadabbur.hikmah}
                  </p>
                  <p className="text-[11px] font-semibold text-[#E76F51] mt-1.5 flex items-center gap-1">
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
