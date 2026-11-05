import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Sprout, Info, Trophy, Heart } from 'lucide-react';
import { useQuranGame } from '../../context/QuranGameContext';
import { GardenPlant } from '../../types/quran';
import { sounds } from '../../utils/soundEffects';

export const TamanSurga: React.FC = () => {
  const { gardenPlants, memorizedAyahIds, mode } = useQuranGame();
  const [selectedPlant, setSelectedPlant] = useState<GardenPlant | null>(null);

  const handlePlantClick = (plant: GardenPlant) => {
    sounds.playWordClick();
    setSelectedPlant(plant);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-[#477F8D]/30 bg-gradient-to-b from-[#EDF5F5] via-[#F8F6F1] to-[#E2EEF0] dark:from-[#1E293B] dark:via-[#152E38] dark:to-[#102731] p-4 sm:p-6 shadow-sm">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 z-10 relative">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#246579]/10 dark:bg-[#246579]/30 text-[#246579] dark:text-[#477F8D]">
              <Sprout className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-[#293640] dark:text-[#F1F5F9]">
              Taman Surga (Raudhah)
            </h3>
          </div>
          <p className="text-xs text-[#246579] dark:text-[#94A3B8] mt-0.5">
            Setiap ayat yang kau pelajari dan hafal menumbuhkan pohon & bunga abadi di tamanmu.
          </p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-3 bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-[#477F8D]/20 text-xs">
          <div className="flex items-center gap-1.5 text-[#246579] dark:text-[#477F8D] font-semibold">
            <Trophy className="w-3.5 h-3.5 text-[#D3A253]" />
            <span>{gardenPlants.length} Tanaman Mekar</span>
          </div>
          <span className="text-[#477F8D]">•</span>
          <div className="text-[#293640] dark:text-[#CBD5E1]">
            <span className="font-bold text-[#B87845]">{memorizedAyahIds.length}</span> Ayat Dihafal
          </div>
        </div>
      </div>

      {/* 2D Canvas Scene of The Garden */}
      <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-[#477F8D]/20 bg-gradient-to-b from-[#D6EAEB] via-[#E5F1F0] to-[#B8D9DA] dark:from-[#173542] dark:via-[#1B3F4C] dark:to-[#102C37] select-none shadow-inner">
        {/* Sky Background Elements */}
        {/* Soft Glowing Sun or Crescent */}
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="absolute top-4 right-8 w-14 h-14 rounded-full bg-[#D3A253]/40 blur-lg pointer-events-none"
        />
        <div className="absolute top-6 right-10 w-9 h-9 rounded-full bg-gradient-to-tr from-[#D3A253] to-[#F7E4AF] shadow-sm flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-[#BE9452] opacity-80" />
        </div>

        {/* Soft Drift Clouds */}
        <motion.div
          animate={{ x: [-20, 30, -20] }}
          transition={{ repeat: Infinity, duration: 24, ease: 'easeInOut' }}
          className="absolute top-8 left-12 opacity-60 pointer-events-none"
        >
          <div className="w-20 h-6 bg-white/70 rounded-full blur-[1px]" />
        </motion.div>

        {/* Rolling Hills (Layer 1 - Distant) */}
        <svg
          className="absolute bottom-0 w-full h-44 text-[#A7CDD3]/50 dark:text-[#1B444F]/60 pointer-events-none"
          viewBox="0 0 500 150"
          preserveAspectRatio="none"
        >
          <path d="M0,80 C150,40 300,110 500,50 L500,150 L0,150 Z" fill="currentColor" />
        </svg>

        {/* Rolling Hills (Layer 2 - Midground) */}
        <svg
          className="absolute bottom-0 w-full h-36 text-[#477F8D]/60 dark:text-[#245563]/80 pointer-events-none"
          viewBox="0 0 500 150"
          preserveAspectRatio="none"
        >
          <path d="M0,100 C120,40 280,120 500,70 L500,150 L0,150 Z" fill="currentColor" />
        </svg>

        {/* River of Light (Sungai Kautsar) flowing gently */}
        <svg
          className="absolute bottom-0 w-full h-24 pointer-events-none"
          viewBox="0 0 500 100"
          preserveAspectRatio="none"
        >
          <path
            d="M210,100 C230,65 240,40 255,20 C270,40 280,65 300,100 Z"
            fill="url(#riverGradient)"
            opacity="0.85"
          />
          <defs>
            <linearGradient id="riverGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#A6D3DD" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#427E98" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>

        {/* Rolling Hills (Layer 3 - Foreground Meadow) */}
        <svg
          className="absolute bottom-0 w-full h-28 text-[#246579]/90 dark:text-[#123744] pointer-events-none"
          viewBox="0 0 500 150"
          preserveAspectRatio="none"
        >
          <path d="M0,110 C180,70 340,110 500,85 L500,150 L0,150 Z" fill="currentColor" />
        </svg>

        {/* Planted Items Rendering */}
        {gardenPlants.map((plant, index) => {
          return (
            <motion.div
              key={`${plant.id}_${index}`}
              initial={{ scale: 0, opacity: 0, y: 15 }}
              animate={{ scale: plant.scale, opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5, type: 'spring' }}
              style={{
                left: `${plant.x}%`,
                bottom: `${100 - plant.y}%`,
                transform: 'translate(-50%, 50%)'
              }}
              className="absolute cursor-pointer z-10 group"
              onClick={() => handlePlantClick(plant)}
            >
              {/* Plant Vector by Type */}
              <div className="relative transform group-hover:scale-110 transition-transform duration-200">
                {/* Glow ring on hover */}
                <div className="absolute -inset-1 rounded-full bg-[#D3A253]/40 blur-xs opacity-0 group-hover:opacity-100 transition-opacity" />

                {plant.type === 'olive_tree' && (
                  <svg className="w-16 h-20 drop-shadow-md" viewBox="0 0 80 100" fill="none">
                    {/* Trunk */}
                    <path d="M38 95 C38 75 35 60 40 45 C45 60 42 75 44 95 Z" fill="#6B4F3A" />
                    {/* Foliage */}
                    <circle cx="40" cy="38" r="24" fill="#608066" />
                    <circle cx="28" cy="42" r="16" fill="#75997C" />
                    <circle cx="52" cy="42" r="16" fill="#4D6B53" />
                    {/* Olives */}
                    <circle cx="34" cy="36" r="3" fill="#2B4249" />
                    <circle cx="46" cy="44" r="3" fill="#2B4249" />
                    <circle cx="42" cy="28" r="3" fill="#2B4249" />
                  </svg>
                )}

                {plant.type === 'date_palm' && (
                  <svg className="w-18 h-22 drop-shadow-md" viewBox="0 0 90 110" fill="none">
                    {/* Palm Trunk */}
                    <path d="M42 105 C40 70 43 50 46 35 C48 50 46 70 47 105 Z" fill="#8D6E63" stroke="#5D4037" strokeWidth="1" />
                    {/* Palm Fronds */}
                    <path d="M46 35 C30 20 10 30 5 45 C20 40 35 36 46 35 Z" fill="#2D6A4F" />
                    <path d="M46 35 C62 20 82 30 87 45 C72 40 57 36 46 35 Z" fill="#40916C" />
                    <path d="M46 35 C42 12 48 5 46 0 C44 12 44 25 46 35 Z" fill="#52B788" />
                    <path d="M46 35 C25 35 15 50 12 65 C26 55 38 45 46 35 Z" fill="#1B4332" />
                    <path d="M46 35 C67 35 77 50 80 65 C66 55 54 45 46 35 Z" fill="#2D6A4F" />
                    {/* Date Clusters */}
                    <circle cx="43" cy="40" r="3.5" fill="#D4A373" />
                    <circle cx="49" cy="40" r="3.5" fill="#C58A55" />
                  </svg>
                )}

                {(plant.type === 'jasmine_flower' || plant.type === 'lotus_flower') && (
                  <svg className="w-10 h-10 drop-shadow-sm" viewBox="0 0 50 50" fill="none">
                    {/* Stem */}
                    <path d="M25 48 C25 38 24 30 25 24" stroke="#40916C" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M25 36 C20 34 16 34 14 36 C18 38 22 38 25 36 Z" fill="#52B788" />
                    {/* Petals */}
                    <circle cx="25" cy="18" r="6" fill="#F8F6F1" stroke="#D3A253" strokeWidth="1.5" />
                    <circle cx="18" cy="22" r="5" fill="#F8F6F1" stroke="#D3A253" strokeWidth="1.5" />
                    <circle cx="32" cy="22" r="5" fill="#F8F6F1" stroke="#D3A253" strokeWidth="1.5" />
                    <circle cx="21" cy="28" r="5" fill="#F8F6F1" stroke="#D3A253" strokeWidth="1.5" />
                    <circle cx="29" cy="28" r="5" fill="#F8F6F1" stroke="#D3A253" strokeWidth="1.5" />
                    <circle cx="25" cy="23" r="3.5" fill="#D3A253" />
                  </svg>
                )}

                {plant.type === 'pomegranate' && (
                  <svg className="w-14 h-18 drop-shadow-md" viewBox="0 0 70 90" fill="none">
                    <path d="M33 85 C33 65 31 52 35 40 C38 52 36 65 37 85 Z" fill="#795548" />
                    <circle cx="35" cy="35" r="20" fill="#588157" />
                    {/* Ruby Fruit */}
                    <circle cx="28" cy="38" r="5" fill="#C1121F" />
                    <circle cx="40" cy="32" r="4.5" fill="#780000" />
                  </svg>
                )}

                {plant.type === 'sidr_tree' && (
                  <svg className="w-16 h-22 drop-shadow-md" viewBox="0 0 80 100" fill="none">
                    <path d="M38 95 L40 50 L42 95 Z" fill="#5D4037" />
                    <ellipse cx="40" cy="35" rx="22" ry="26" fill="#3A5A40" />
                    <ellipse cx="40" cy="30" rx="16" ry="18" fill="#588157" />
                    <circle cx="35" cy="35" r="2.5" fill="#E3B973" />
                    <circle cx="45" cy="28" r="2.5" fill="#E3B973" />
                  </svg>
                )}

                {/* Floating label */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/75 text-white text-[10px] font-medium px-2 py-0.5 rounded-full pointer-events-none">
                  {plant.name}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Ambient sparkling fireflies / light orbs */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -18, 0],
              x: [0, (i % 2 === 0 ? 12 : -12), 0],
              opacity: [0.2, 0.9, 0.2]
            }}
            transition={{
              repeat: Infinity,
              duration: 3 + i * 0.7,
              delay: i * 0.5,
              ease: 'easeInOut'
            }}
            style={{
              left: `${15 + i * 14}%`,
              top: `${40 + (i % 3) * 15}%`
            }}
            className="absolute w-2 h-2 rounded-full bg-[#D3A253] blur-[1px] pointer-events-none"
          />
        ))}
      </div>

      {/* Selected Plant Detail Modal / Bar */}
      <AnimatePresence>
        {selectedPlant && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-3 p-3 bg-white/95 dark:bg-[#1E293B]/95 rounded-2xl border border-[#477F8D]/30 flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#246579]/10 dark:bg-[#246579]/30 flex items-center justify-center text-[#246579] dark:text-[#477F8D] font-bold">
                <Heart className="w-4 h-4 text-[#B87845]" />
              </div>
              <div>
                <p className="font-bold text-[#293640] dark:text-[#F1F5F9]">{selectedPlant.name}</p>
                <p className="text-[#246579] dark:text-[#94A3B8] text-[11px]">
                  Tumbuh dari hafalan Surat {selectedPlant.surahName} ayat {selectedPlant.ayahNumber}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedPlant(null)}
              className="text-[#246579] hover:text-[#293640] dark:hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              Tutup
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
