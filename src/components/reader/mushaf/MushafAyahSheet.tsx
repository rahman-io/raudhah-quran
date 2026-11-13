import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { AlignJustify, CheckCircle2, Circle, Play, ScrollText, Share2, X } from 'lucide-react';
import { loadReaderSurah } from '../../../services/quranReaderData';
import { useBackHandler } from '../../../utils/backNavigation';

/** Lembar aksi saat satu ayat diketuk di Mode Mushaf: arti, putar, tafsir, bagikan, tandai hafal. */
export const MushafAyahSheet: React.FC<{
  surah: number;
  ayah: number;
  surahName: string;
  memorized: boolean;
  onClose: () => void;
  onPlay: () => void;
  onTafsir: () => void;
  onShare: () => void;
  onToggleMemorized: () => void;
  onOpenTadabbur: () => void;
}> = ({ surah, ayah, surahName, memorized, onClose, onPlay, onTafsir, onShare, onToggleMemorized, onOpenTadabbur }) => {
  const [translation, setTranslation] = useState<string | null>(null);
  useBackHandler(true, onClose, 10);

  useEffect(() => {
    let cancelled = false;
    setTranslation(null);
    loadReaderSurah(surah)
      .then((data) => !cancelled && setTranslation(data.ayahs[ayah - 1]?.translationId ?? ''))
      .catch(() => !cancelled && setTranslation(''));
    return () => {
      cancelled = true;
    };
  }, [surah, ayah]);

  const action = (label: string, Icon: React.ComponentType<{ className?: string }>, onClick: () => void, active = false) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 py-3 rounded-2xl border text-[11px] font-semibold transition-colors ${
        active
          ? 'border-[#246579] bg-[#246579] text-white'
          : 'border-[#246579]/15 bg-white dark:bg-slate-900/40 text-[#246579] dark:text-[#A7CDD3] hover:bg-[#246579]/5'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-6" role="dialog" aria-modal="true" aria-label={`Ayat ${surahName} ${ayah}`}>
      <motion.div className="absolute inset-0 bg-[#0B1F27]/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative w-full sm:max-w-md max-h-[80vh] flex flex-col bg-[#FBF8F2] dark:bg-[#152E38] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-[#173B4E] dark:text-white">
              QS. {surahName} : {ayah}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl text-slate-500 hover:bg-white dark:hover:bg-slate-700" aria-label="Tutup">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <p className="text-sm leading-relaxed text-[#26343E] dark:text-slate-200">
            {translation === null ? 'Memuat arti…' : translation ? `“${translation}”` : 'Arti belum bisa dimuat.'}
          </p>
          <div className="grid grid-cols-5 gap-2">
            {action('Putar', Play, onPlay)}
            {action('Tafsir', ScrollText, onTafsir)}
            {action('Bagikan', Share2, onShare)}
            {action('Hafal', memorized ? CheckCircle2 : Circle, onToggleMemorized, memorized)}
            {action('Tadabbur', AlignJustify, onOpenTadabbur)}
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
