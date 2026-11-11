import React, { useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useQuranGame } from '../../../context/QuranGameContext';
import { sounds } from '../../../utils/soundEffects';
import type { HafalanContext } from '../hafalanPlan';
import { RoundDone, StageHeader, arabicSize } from '../StageParts';

type Level = 100 | 50 | 0;

const LEVEL_TEXT: Record<Level, string> = {
  100: 'Langkah 1: baca berulang-ulang sambil mendengarkan murottal.',
  50: 'Langkah 2: sebagian kata disamarkan, lanjutkan dari ingatanmu.',
  0: 'Langkah 3: semua kata tersembunyi. Lafalkan tanpa melihat teks.'
};

export const VanishStage: React.FC<{ ctx: HafalanContext; onPass: () => void }> = ({ ctx, onPass }) => {
  const { fontSize } = useQuranGame();
  // Setiap bagian dihafal sendiri, lalu (untuk ayat panjang) satu putaran ayat utuh.
  const rounds = useMemo(
    () => (ctx.segments.length > 1 ? [...ctx.segments, ctx.segments.flat()] : ctx.segments),
    [ctx.segments]
  );
  const [round, setRound] = useState(0);
  const [level, setLevel] = useState<Level>(100);
  const [peek, setPeek] = useState(false);
  const [doneRound, setDoneRound] = useState(false);
  const [retryNote, setRetryNote] = useState(false);

  useEffect(() => {
    setLevel(100);
    setPeek(false);
    setDoneRound(false);
    setRetryNote(false);
  }, [round]);

  const words = rounds[round];
  const isWholeAyahRound = ctx.segments.length > 1 && round === rounds.length - 1;
  const isLastRound = round === rounds.length - 1;

  const advance = () => {
    sounds.playWordClick();
    setPeek(false);
    setRetryNote(false);
    setLevel(level === 100 ? 50 : 0);
  };

  const assess = (fluent: boolean) => {
    if (fluent) {
      sounds.playAyahComplete();
      setDoneRound(true);
    } else {
      sounds.playGentleRetry();
      setRetryNote(true);
      setPeek(false);
      setLevel(50);
    }
  };

  return (
    <div className="space-y-5">
      <StageHeader
        title="Tahap 3 · Ayat Menghilang"
        description={isWholeAyahRound ? 'Putaran akhir: sambungkan semua bagian menjadi satu ayat utuh.' : 'Hafalkan bertahap: teks perlahan menghilang sampai kamu bisa tanpa melihat.'}
        round={round}
        rounds={rounds.length}
        roundLabel={isWholeAyahRound ? 'Ayat utuh ·' : 'Bagian'}
        listenAyah={ctx.ayah}
      />

      <div className="bg-gradient-to-b from-[#F8F6F1] to-[#F1EDE6] dark:from-[#102731] dark:to-[#152E38] rounded-3xl p-5 sm:p-7 border border-[#BE9452]/40 text-center">
        <div className="flex items-center justify-between gap-3 text-xs text-[#477F8D] mb-2">
          <span className="text-left">{LEVEL_TEXT[level]}</span>
          {level !== 100 && !doneRound && (
            <button type="button" onClick={() => setPeek(!peek)} className="flex shrink-0 items-center gap-1 text-[#246579] dark:text-[#A7CDD3] hover:underline">
              {peek ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{peek ? 'Sembunyikan' : 'Intip'}</span>
            </button>
          )}
        </div>

        <div dir="rtl" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 py-5">
          {words.map((word, i) => {
            const hidden = !peek && !doneRound && (level === 0 || (level === 50 && i % 2 === 1));
            return (
              <span
                key={`${round}_${word.id}`}
                className={`font-arabic rounded-xl px-1.5 transition-all duration-300 ${hidden ? 'blur-md opacity-25 bg-slate-300/40 dark:bg-slate-700/50 select-none' : 'text-[#173B4E] dark:text-[#D3A253]'}`}
                style={{ fontSize: arabicSize(fontSize, 1, 26) }}
              >
                {hidden ? '•••' : word.arabic}
              </span>
            );
          })}
        </div>
        {level === 100 && (
          <p className="pt-3 border-t border-[#477F8D]/20 text-xs text-[#246579] dark:text-[#94A3B8]">
            {words.map((w) => w.transliteration).join(' ')}
          </p>
        )}
      </div>

      {retryNote && (
        <p className="text-center text-xs text-amber-700 dark:text-amber-300">Tidak apa-apa. Ulangi dulu dengan sebagian teks, lalu coba lagi tanpa melihat.</p>
      )}

      {!doneRound && (
        <div className="bg-white/70 dark:bg-slate-800/60 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 text-center space-y-3">
          {level !== 0 ? (
            <button type="button" onClick={advance} className="px-5 py-2 bg-[#246579] hover:bg-[#174C60] text-white rounded-xl text-xs font-semibold">
              {level === 100 ? 'Sudah saya baca berulang, samarkan sebagian' : 'Sudah lancar, sembunyikan semua'}
            </button>
          ) : (
            <>
              <p className="text-xs font-semibold text-[#293640] dark:text-[#CBD5E1]">Lafalkan dari ingatan, lalu intip untuk memeriksa. Bagaimana hasilnya?</p>
              <div className="flex flex-wrap justify-center gap-2">
                <button type="button" onClick={() => assess(false)} className="px-4 py-2 text-xs font-semibold rounded-xl border border-amber-300 text-amber-800 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/40">
                  Masih tersendat
                </button>
                <button type="button" onClick={() => assess(true)} className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#246579] hover:bg-[#174C60] text-white">
                  Lancar tanpa melihat (mutqin)
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {doneRound && (
        <RoundDone
          title={isLastRound ? 'Masya Allah, ayat ini sudah bisa kamu lafalkan tanpa melihat!' : `Bagian ${round + 1} sudah lancar`}
          actionLabel={isLastRound ? 'Selesaikan Tahap 3' : rounds.length - 1 === round + 1 && ctx.segments.length > 1 ? 'Sambungkan ayat utuh' : 'Lanjut ke bagian berikutnya'}
          onContinue={() => (isLastRound ? onPass() : setRound(round + 1))}
        />
      )}
    </div>
  );
};
