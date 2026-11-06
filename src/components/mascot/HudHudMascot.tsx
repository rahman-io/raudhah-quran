import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
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

// The first eight frames are poses.png; the following eight are transitions.png.
const ANIMATION_FRAMES = {
  idle: [0, 0, 0, 8, 0, 0, 9, 1, 9, 0, 0, 0, 6, 8, 0, 0, 0, 0],
  happy: [0, 10, 2, 11, 12, 3, 13, 4, 14, 5, 14, 15, 12, 11, 2, 10, 0],
  celebrate: [0, 10, 2, 11, 12, 3, 13, 4, 14, 5, 7, 5, 14, 15, 12, 11, 2, 10, 0],
  thinking: [0, 8, 6, 6, 8, 9, 1, 9, 8, 0]
} as const;

const SPRITES = [
  `${import.meta.env.BASE_URL}assets/hudhud/poses.png`,
  `${import.meta.env.BASE_URL}assets/hudhud/transitions.png`
];

export const HudHudMascot: React.FC<HudHudMascotProps> = ({
  customMessage,
  mood = 'idle'
}) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [frame, setFrame] = useState(0);
  const [isGreeting, setIsGreeting] = useState(false);
  const reduceMotion = useReducedMotion();
  const currentMood = mood === 'idle' && isGreeting ? 'happy' : mood;

  useEffect(() => {
    const preload = new Image();
    preload.src = SPRITES[1];
  }, []);

  useEffect(() => {
    if (!isGreeting) return;
    const timeout = window.setTimeout(() => setIsGreeting(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [isGreeting]);

  useEffect(() => {
    const sequence = ANIMATION_FRAMES[currentMood];
    setFrame(sequence[0]);
    if (reduceMotion) return;

    let position = 0;
    let timer: number | undefined;
    const start = () => {
      if (timer !== undefined || document.hidden) return;
      timer = window.setInterval(() => {
        position = (position + 1) % sequence.length;
        setFrame(sequence[position]);
      }, currentMood === 'idle' ? 210 : 125);
    };
    const onVisibilityChange = () => {
      if (document.hidden) {
        window.clearInterval(timer);
        timer = undefined;
      } else {
        start();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    start();
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [currentMood, reduceMotion]);

  const handleMascotClick = () => {
    sounds.playWordClick();
    setMessageIndex((prev) => (prev + 1) % MOTIVATIONAL_MESSAGES.length);
    setIsGreeting(true);
  };

  const currentMessage = customMessage || MOTIVATIONAL_MESSAGES[messageIndex];

  return (
    <div className="flex items-center gap-3">
      <motion.button
        type="button"
        onClick={handleMascotClick}
        title="Klik burung Hud-hud untuk nasihat kebaikan!"
        className="relative group shrink-0 cursor-pointer focus:outline-none"
        whileHover={reduceMotion ? undefined : { scale: 1.05 }}
        whileTap={reduceMotion ? undefined : { scale: 0.96 }}
      >
        <span
          aria-hidden="true"
          className="block h-24 w-24 select-none bg-no-repeat sm:h-28 sm:w-28"
          style={{
            backgroundImage: `url("${SPRITES[frame < 8 ? 0 : 1]}")`,
            backgroundSize: '400% 200%',
            backgroundPosition: `${(frame % 4) * 100 / 3}% ${Math.floor((frame % 8) / 4) * 100}%`
          }}
        />

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
