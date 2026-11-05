import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface HudHudMascotProps {
  customMessage?: string;
  mood?: 'idle' | 'happy' | 'celebrate' | 'thinking';
}

const MOTIVATIONAL_MESSAGES = [
  'Bismillah! Setiap huruf bernilai sepuluh kebaikan.',
  'Masya Allah, hafalanmu semakin mengalir deras!',
  'Ingat pesan Rasulullah: Sebaik-baik kalian adalah yang belajar Al-Qur\'an.',
  'Taman Surgamu semakin rindang dengan ayat ini!',
  'Pelan-pelan tapi istiqomah, Allah menyukai amal yang kontinu.'
];

export const HudHudMascot: React.FC<HudHudMascotProps> = ({
  customMessage,
  mood = 'idle'
}) => {
  const [messageIndex, setMessageIndex] = useState(0);

  const handleMascotClick = () => {
    sounds.playWordClick();
    setMessageIndex((prev) => (prev + 1) % MOTIVATIONAL_MESSAGES.length);
  };

  const currentMessage = customMessage || MOTIVATIONAL_MESSAGES[messageIndex];

  return (
    <div className="flex items-center gap-3">
      {/* 2D Animated Bird "Hud-hud" */}
      <motion.button
        type="button"
        onClick={handleMascotClick}
        title="Klik burung Hud-hud untuk nasihat kebaikan!"
        className="relative group focus:outline-none cursor-pointer shrink-0"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Glow halo */}
        <div className="absolute -inset-2 bg-[#D3A253]/20 rounded-full blur-md opacity-70 group-hover:opacity-100 transition-opacity" />

        <svg
          className="w-16 h-16 md:w-20 md:h-20 drop-shadow-sm select-none"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Animated Hoopoe Crest (Jambul Mahkota) */}
          <motion.g
            animate={{
              rotate: mood === 'celebrate' ? [0, -10, 5, 0] : [0, -4, 0],
              originX: '45px',
              originY: '40px'
            }}
            transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
          >
            {/* Crest feathers */}
            <path d="M42 35 C38 18 32 14 30 15 C29 16 33 24 38 36 Z" fill="#D3A253" />
            <path d="M48 32 C46 12 41 8 38 9 C37 10 41 20 44 33 Z" fill="#E3B973" />
            <path d="M54 34 C58 14 62 10 65 11 C66 12 60 22 51 36 Z" fill="#D3A253" />
            {/* Crest black tips */}
            <circle cx="31" cy="16" r="3" fill="#1C596D" />
            <circle cx="39" cy="10" r="3" fill="#1C596D" />
            <circle cx="64" cy="12" r="3" fill="#1C596D" />
          </motion.g>

          {/* Bird Body */}
          <motion.ellipse
            cx="62"
            cy="70"
            rx="26"
            ry="22"
            fill="#D3A253"
            stroke="#BE9452"
            strokeWidth="2"
            animate={{ y: [0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          />

          {/* Soft Cream Breast Feather */}
          <ellipse cx="68" cy="74" rx="14" ry="15" fill="#F8F6F1" opacity="0.9" />

          {/* Tail Feathers with Stripes */}
          <path d="M38 74 L14 84 L18 90 L42 78 Z" fill="#1C596D" />
          <path d="M22 81 L25 87 L29 85 L26 79 Z" fill="#F8F6F1" />

          {/* Head */}
          <motion.g
            animate={{ y: [0, -1.5, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <circle cx="56" cy="45" r="16" fill="#E3B973" />
            {/* Cheek blush */}
            <circle cx="64" cy="49" r="4.5" fill="#B87845" opacity="0.45" />

            {/* Eye */}
            <circle cx="60" cy="42" r="3.5" fill="#1C596D" />
            <circle cx="61.5" cy="40.5" r="1.2" fill="#FFFFFF" />

            {/* Slender curved Beak (Paruh burung Hud-hud khas yang panjang melengkung) */}
            <path
              d="M68 44 C82 46 94 53 100 58 C92 56 80 50 68 48 Z"
              fill="#1C596D"
            />
          </motion.g>

          {/* Wing (Animated Flutter) */}
          <motion.path
            d="M52 64 C64 64 74 74 68 84 C56 86 46 76 52 64 Z"
            fill="#2D8192"
            stroke="#1C596D"
            strokeWidth="1.5"
            animate={{
              rotate: mood === 'celebrate' ? [0, -18, 0] : [0, -5, 0],
              originX: '52px',
              originY: '64px'
            }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          />
          {/* Wing white bars */}
          <path d="M56 70 L66 74" stroke="#F8F6F1" strokeWidth="2" strokeLinecap="round" />
          <path d="M54 75 L62 79" stroke="#F8F6F1" strokeWidth="2" strokeLinecap="round" />

          {/* Little Feet on Rehal */}
          <path d="M56 90 L54 98 M68 90 L67 98" stroke="#8D6E63" strokeWidth="2.5" strokeLinecap="round" />
        </svg>

        {/* Mascot badge */}
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#246579] text-[#F8F6F1] text-[10px] font-semibold px-1.5 py-0.5 rounded-full shadow-xs whitespace-nowrap">
          Hud-hud
        </span>
      </motion.button>

      {/* Cheerful Speech Bubble */}
      <motion.div
        key={currentMessage}
        initial={{ opacity: 0, scale: 0.95, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white/95 dark:bg-[#1E293B]/90 border border-[#477F8D]/30 rounded-2xl p-3 shadow-xs max-w-xs md:max-w-sm text-xs text-[#293640] dark:text-[#E2E8F0]"
      >
        {/* Tail point pointing to bird */}
        <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-6 border-t-transparent border-r-8 border-r-white/95 dark:border-r-[#1E293B]/90 border-b-6 border-b-transparent" />
        <div className="flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#D3A253] shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">{currentMessage}</p>
        </div>
      </motion.div>
    </div>
  );
};
