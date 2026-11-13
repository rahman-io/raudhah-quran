import React, { useState } from 'react';
import { Swords, Mic } from 'lucide-react';
import type { HafalanContext } from '../hafalanPlan';
import { StageHeader } from '../StageParts';
import { isBrowserRecitationSupported } from '../../../services/recitation/browserListener';
import { ReciteChallenge } from './ReciteChallenge';
import { ReciteFreePractice } from './ReciteFreePractice';

/**
 * Game 9 "Tantangan Bacaan". Mode utama: Tantangan (hafal per potongan 3x, lalu sambung ayat
 * dengan soal acak), yang menyelesaikan game ini. Mode Latihan bebas: baca sambil melihat,
 * teks samar, atau hafalan, tanpa menyelesaikan game.
 */
export const ReciteStage: React.FC<{ ctx: HafalanContext; onPass: () => void }> = ({ ctx, onPass }) => {
  const [supported] = useState(isBrowserRecitationSupported);
  const [mode, setMode] = useState<'tantangan' | 'bebas'>('tantangan');

  if (!supported) {
    return (
      <div className="space-y-5">
        <StageHeader title="Tantangan Bacaan" description="Bacakan ayat dengan suaramu, kata menyala saat terbaca." listenAyah={ctx.ayah} />
        <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-sm text-amber-900 dark:text-amber-100 space-y-1.5">
          <p className="font-semibold">Browser ini belum bisa mendengarkan bacaan.</p>
          <p className="text-xs leading-relaxed">
            Buka aplikasi di Chrome (Android atau komputer) atau Safari (iPhone) untuk memainkan game ini.
            Selama itu, game ini tidak dihitung untuk status Sudah Dihafal.
          </p>
        </div>
      </div>
    );
  }

  const tab = (id: typeof mode, label: string, Icon: React.ElementType) => (
    <button
      type="button"
      role="tab"
      aria-selected={mode === id}
      onClick={() => setMode(id)}
      className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
        mode === id ? 'bg-white dark:bg-slate-700 text-[#173B4E] dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-[#173B4E]'
      }`}
    >
      <Icon className="w-3.5 h-3.5 text-[#246579] dark:text-[#A7CDD3]" />
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 p-1.5 bg-[#F1EDE6] dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700" role="tablist" aria-label="Mode Tantangan Bacaan">
        {tab('tantangan', 'Tantangan', Swords)}
        {tab('bebas', 'Latihan bebas', Mic)}
      </div>
      {mode === 'tantangan' ? (
        <ReciteChallenge ctx={ctx} onPass={onPass} />
      ) : (
        <ReciteFreePractice ctx={ctx} onStartChallenge={() => setMode('tantangan')} />
      )}
    </div>
  );
};
