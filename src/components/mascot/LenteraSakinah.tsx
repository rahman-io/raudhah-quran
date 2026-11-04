import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface LenteraSakinahProps {
  glowIntensity?: 'calm' | 'bright';
  verseInsight?: string;
}

export const LenteraSakinah: React.FC<LenteraSakinahProps> = ({
  glowIntensity = 'calm',
  verseInsight
}) => {
  return (
    <div className="flex items-center gap-4 bg-[#F4EFEA]/80 dark:bg-[#1E293B]/70 border border-[#C5A059]/30 rounded-2xl p-3.5 px-4 shadow-xs">
      {/* 2D Animated Glowing Islamic Lantern */}
      <div className="relative shrink-0 flex items-center justify-center">
        {/* Radiating Light Aura */}
        <motion.div
          animate={{
            scale: glowIntensity === 'bright' ? [1, 1.25, 1] : [1, 1.1, 1],
            opacity: glowIntensity === 'bright' ? [0.6, 0.9, 0.6] : [0.35, 0.5, 0.35]
          }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="absolute w-16 h-16 rounded-full bg-gradient-to-r from-[#E9C46A]/40 to-[#F4A261]/20 blur-md pointer-events-none"
        />

        <svg
          className="w-12 h-14 select-none drop-shadow-xs"
          viewBox="0 0 100 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Top Hanging Ring */}
          <circle cx="50" cy="12" r="7" stroke="#C5A059" strokeWidth="2.5" />
          <path d="M50 19 L50 25" stroke="#C5A059" strokeWidth="2.5" />

          {/* Dome Top Cap */}
          <path
            d="M32 38 C32 26 44 24 50 24 C56 24 68 26 68 38 Z"
            fill="#C5A059"
            stroke="#9A7B38"
            strokeWidth="1.5"
          />

          {/* Lantern Glass Body (Octagonal Islamic cut) */}
          <path
            d="M32 38 L24 68 L34 94 L66 94 L76 68 L68 38 Z"
            fill="#FFFBEB"
            stroke="#C5A059"
            strokeWidth="2"
            fillOpacity="0.85"
          />

          {/* Geometric Inner Pattern & Glass Segments */}
          <path d="M42 38 L36 68 L44 94" stroke="#C5A059" strokeWidth="1.5" opacity="0.7" />
          <path d="M58 38 L64 68 L56 94" stroke="#C5A059" strokeWidth="1.5" opacity="0.7" />
          <path d="M24 68 L76 68" stroke="#C5A059" strokeWidth="1.5" opacity="0.7" />

          {/* Candle Flame with breathing motion */}
          <motion.path
            d="M50 56 C46 64 45 74 50 78 C55 74 54 64 50 56 Z"
            fill="#E9C46A"
            animate={{
              scaleY: [1, 1.15, 0.95, 1],
              scaleX: [1, 0.95, 1.05, 1],
              originY: '78px',
              originX: '50px'
            }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          />
          <circle cx="50" cy="73" r="2.5" fill="#E76F51" />

          {/* Base Stand */}
          <path
            d="M30 94 L26 102 L74 102 L70 94 Z"
            fill="#C5A059"
            stroke="#9A7B38"
            strokeWidth="1.5"
          />
          <path d="M38 102 L36 106 M62 102 L64 106" stroke="#C5A059" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Dignified Verse Wisdom */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8C6D23] dark:text-[#E9C46A]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Lentera Sakinah · Ketenangan Jiwa</span>
        </div>
        <p className="text-xs text-[#354F52] dark:text-[#CBD5E1] mt-0.5 leading-relaxed line-clamp-2">
          {verseInsight || '“Ketahuilah, hanya dengan mengingat Allah hati menjadi tenteram.” (QS. Ar-Ra\'d: 28)'}
        </p>
      </div>
    </div>
  );
};
