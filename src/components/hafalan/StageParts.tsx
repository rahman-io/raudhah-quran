import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Volume2 } from 'lucide-react';
import { useQuranGame } from '../../context/QuranGameContext';
import type { Ayah } from '../../types/quran';
import type { ReaderAyah } from '../../services/quranReaderData';

/** Kepala tahap: judul, petunjuk, nomor putaran, dan tombol dengar ayat. */
export const StageHeader: React.FC<{
  title: string;
  description: string;
  round?: number;
  rounds?: number;
  roundLabel?: string;
  listenAyah?: ReaderAyah;
}> = ({ title, description, round, rounds, roundLabel = 'Bagian', listenAyah }) => {
  const { playMurottal, pauseMurottal, isPlayingAudio, currentPlayingAyahId } = useQuranGame();
  const playing = !!listenAyah && isPlayingAudio && currentPlayingAyahId === listenAyah.id;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
      <div>
        <span className="text-[11px] font-semibold text-[#477F8D] uppercase tracking-wider block">{title}</span>
        <p className="text-xs text-[#246579] dark:text-[#94A3B8] mt-0.5">{description}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {rounds !== undefined && rounds > 1 && round !== undefined && (
          <span className="text-[11px] font-semibold px-2.5 py-1.5 rounded-xl bg-[#246579]/10 dark:bg-[#246579]/30 text-[#246579] dark:text-[#A7CDD3]">
            {roundLabel} {round + 1} / {rounds}
          </span>
        )}
        {listenAyah && (
          <button
            type="button"
            onClick={() => (playing ? pauseMurottal() : playMurottal(listenAyah as Ayah))}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              playing
                ? 'bg-[#D3A253] text-[#173B4E]'
                : 'bg-[#246579]/10 text-[#246579] dark:bg-[#246579]/30 dark:text-[#A7CDD3] hover:bg-[#246579]/20'
            }`}
            title="Dengarkan murottal ayat"
          >
            <Volume2 className="w-4 h-4" />
            <span>{playing ? 'Memutar…' : 'Dengar'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

/** Kartu "putaran selesai" dengan tombol lanjut. */
export const RoundDone: React.FC<{ title: string; note?: string; actionLabel: string; onContinue: () => void }> = ({
  title, note, actionLabel, onContinue
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96, y: 8 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    className="p-5 bg-gradient-to-r from-[#E2EEF0] to-[#F4F8F8] dark:from-[#123744] dark:to-[#193E4B] border border-[#477F8D] rounded-3xl shadow-sm text-center space-y-3"
  >
    <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#246579] text-white">
      <CheckCircle2 className="w-6 h-6" />
    </div>
    <div>
      <h4 className="text-sm font-bold text-[#293640] dark:text-white">{title}</h4>
      {note && <p className="text-xs text-[#246579] dark:text-[#A7CDD3] mt-1">{note}</p>}
    </div>
    <button
      type="button"
      onClick={onContinue}
      className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#246579] hover:bg-[#174C60] text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
    >
      <span>{actionLabel}</span>
      <ArrowRight className="w-4 h-4" />
    </button>
  </motion.div>
);

export const arabicSize = (fontSize: number, scale = 1, min = 24) => `${Math.max(Math.round(fontSize * scale), min)}px`;
