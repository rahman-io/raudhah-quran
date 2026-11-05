import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Puzzle, HelpCircle, EyeOff, CheckCircle2, Music2, Layers, Award, PenLine } from 'lucide-react';
import { useQuranGame } from '../../context/QuranGameContext';
import { GameType } from '../../types/quran';
import { SURAHS_DATA } from '../../data/quranData';
import { WordPuzzleGame } from './WordPuzzleGame';
import { BlankFillGame } from './BlankFillGame';
import { VanishingAyahGame } from './VanishingAyahGame';
import { AudioSambungGame } from './AudioSambungGame';
import { MemoryMatchGame } from './MemoryMatchGame';
import { TajwidQuizGame } from './TajwidQuizGame';
import { WriteAyahGame } from './WriteAyahGame';
import { HudHudMascot } from '../mascot/HudHudMascot';
import { LenteraSakinah } from '../mascot/LenteraSakinah';
import { sounds } from '../../utils/soundEffects';

export const GameHub: React.FC = () => {
  const {
    activeSurah,
    setActiveSurahNumber,
    selectedAyah,
    setSelectedAyah,
    memorizedAyahIds,
    mode
  } = useQuranGame();

  const [activeGame, setActiveGame] = useState<GameType>('word-puzzle');
  const surahProgress = activeSurah.ayahs.filter((ayah) => memorizedAyahIds.includes(ayah.id)).length;

  const handleSelectGame = (game: GameType) => {
    sounds.playWordClick();
    setActiveGame(game);
  };

  const handleSelectSurah = (surahNumber: number) => {
    sounds.playWordClick();
    setActiveSurahNumber(surahNumber);
  };

  const handleSelectAyah = (ayahIndex: number) => {
    sounds.playWordClick();
    setSelectedAyah(activeSurah.ayahs[ayahIndex]);
  };

  return (
    <div className="w-full space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-[#246579] px-5 py-6 text-white shadow-sm sm:px-8 sm:py-8" aria-label="Ringkasan hafalan">
        <span className="pointer-events-none absolute -bottom-16 -right-4 select-none font-arabic text-[190px] leading-none text-white/[0.06] sm:text-[240px]" aria-hidden="true">قرآن</span>
        <div className="relative max-w-xl">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E9CF99]">Perjalanan Hafalan</span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Surah {activeSurah.nameLatin}</h1>
          <p className="mt-1 text-xs text-white/80 sm:text-sm">{activeSurah.translationLatin} · {activeSurah.numberOfAyahs} ayat</p>
          <div className="mt-6 flex items-center justify-between gap-3 text-xs font-medium text-white/85">
            <span>Ayat yang sudah dihafal</span>
            <span>{surahProgress} / {activeSurah.ayahs.length}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20" role="progressbar" aria-label="Kemajuan hafalan surah" aria-valuenow={surahProgress} aria-valuemin={0} aria-valuemax={activeSurah.ayahs.length}>
            <div className="h-full rounded-full bg-[#D3A253] transition-all" style={{ width: `${(surahProgress / activeSurah.ayahs.length) * 100}%` }} />
          </div>
        </div>
      </section>

      {/* Dynamic Age Mode Companion Banner */}
      <div className="py-1">
        {mode === 'ceria' ? (
          <HudHudMascot customMessage={`Ayo kita hafal Surah ${activeSurah.nameLatin} Ayat ${selectedAyah.ayahNumber} bersama-sama!`} />
        ) : (
          <LenteraSakinah
            verseInsight={`Surat ${activeSurah.nameLatin} Ayat ${selectedAyah.ayahNumber}: "${selectedAyah.translationId}"`}
          />
        )}
      </div>

      {/* Surah Picker Carousel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#246579] dark:text-[#94A3B8]">
          <span className="font-semibold">Pilih Surat Juz 30:</span>
          <span className="text-[11px]">
            {activeSurah.nameLatin} · {activeSurah.numberOfAyahs} Ayat
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {SURAHS_DATA.map((surah) => {
            const isSelected = surah.number === activeSurah.number;
            const memorizedCount = surah.ayahs.filter((a) => memorizedAyahIds.includes(a.id)).length;
            const isAllMemorized = memorizedCount === surah.ayahs.length;

            return (
              <button
                key={surah.number}
                onClick={() => handleSelectSurah(surah.number)}
                className={`px-3.5 py-2.5 rounded-2xl border text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer flex items-center gap-2 shadow-xs ${
                  isSelected
                    ? 'bg-[#246579] text-white border-[#174C60]'
                    : 'bg-white dark:bg-slate-800 text-[#293640] dark:text-slate-200 border-[#E8E1D6] dark:border-slate-700 hover:border-[#477F8D]'
                }`}
              >
                <span className={`flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-[#F1EDE6] text-[#9A7035]'}`}>{surah.number}</span>
                <span>{surah.nameLatin}</span>
                {isAllMemorized && <CheckCircle2 className="w-3.5 h-3.5 text-[#D3A253]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ayah Steps Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-[#246579] dark:text-[#94A3B8] shrink-0 mr-1">
          Ayat:
        </span>
        {activeSurah.ayahs.map((ayah, idx) => {
          const isSelected = ayah.id === selectedAyah.id;
          const isMemorized = memorizedAyahIds.includes(ayah.id);

          return (
            <button
              key={ayah.id}
              onClick={() => handleSelectAyah(idx)}
              className={`w-9 h-9 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center justify-center relative ${
                isSelected
                  ? 'bg-[#D3A253] text-[#173B4E] ring-2 ring-[#D3A253]/40 shadow-xs'
                  : isMemorized
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{ayah.ayahNumber}</span>
              {isMemorized && !isSelected && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Game Mode Selector Tabs (Scrollable on small screens) */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#F1EDE6] dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto scrollbar-thin">
        <button
          onClick={() => handleSelectGame('word-puzzle')}
          className={`py-2 px-3 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeGame === 'word-puzzle'
              ? 'bg-white dark:bg-slate-700 text-[#173B4E] dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          <Puzzle className="w-3.5 h-3.5 text-[#246579]" />
          <span>1. Susun Ayat</span>
        </button>

        <button
          onClick={() => handleSelectGame('blank-fill')}
          className={`py-2 px-3 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeGame === 'blank-fill'
              ? 'bg-white dark:bg-slate-700 text-[#173B4E] dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#BE9452]" />
          <span>2. Tebak Lanjutan</span>
        </button>

        <button
          onClick={() => handleSelectGame('vanishing-ayah')}
          className={`py-2 px-3 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeGame === 'vanishing-ayah'
              ? 'bg-white dark:bg-slate-700 text-[#173B4E] dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          <EyeOff className="w-3.5 h-3.5 text-[#B87845]" />
          <span>3. Ayat Menghilang</span>
        </button>

        <button
          onClick={() => handleSelectGame('audio-sambung')}
          className={`py-2 px-3 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeGame === 'audio-sambung'
              ? 'bg-white dark:bg-slate-700 text-[#173B4E] dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          <Music2 className="w-3.5 h-3.5 text-[#2D8192]" />
          <span>4. Sambung Audio</span>
        </button>

        <button
          onClick={() => handleSelectGame('memory-match')}
          className={`py-2 px-3 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeGame === 'memory-match'
              ? 'bg-white dark:bg-slate-700 text-[#173B4E] dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-[#E3B973]" />
          <span>5. Kartu Pasangan</span>
        </button>

        <button
          onClick={() => handleSelectGame('tajwid-quiz')}
          className={`py-2 px-3 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeGame === 'tajwid-quiz'
              ? 'bg-white dark:bg-slate-700 text-[#173B4E] dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-[#BE9452]" />
          <span>6. Kuis Tajwid</span>
        </button>

        <button
          onClick={() => handleSelectGame('write-ayah')}
          className={`py-2 px-3 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeGame === 'write-ayah'
              ? 'bg-white dark:bg-slate-700 text-[#173B4E] dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          <PenLine className="w-3.5 h-3.5 text-[#246579]" />
          <span>7. Tulis Ayat</span>
        </button>
      </div>

      {/* Active Game Area */}
      <div className="pt-2">
        {activeGame === 'word-puzzle' && <WordPuzzleGame />}
        {activeGame === 'blank-fill' && <BlankFillGame />}
        {activeGame === 'vanishing-ayah' && <VanishingAyahGame />}
        {activeGame === 'audio-sambung' && <AudioSambungGame />}
        {activeGame === 'memory-match' && <MemoryMatchGame />}
        {activeGame === 'tajwid-quiz' && <TajwidQuizGame />}
        {activeGame === 'write-ayah' && <WriteAyahGame />}
      </div>
    </div>
  );
};

