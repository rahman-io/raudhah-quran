import React, { useMemo, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useQuranGame } from '../../../context/QuranGameContext';
import { sounds } from '../../../utils/soundEffects';
import { buildTajwidQuestions, type HafalanContext } from '../hafalanPlan';
import { RoundDone, StageHeader, arabicSize } from '../StageParts';

export const TajwidStage: React.FC<{ ctx: HafalanContext; onPass: () => void }> = ({ ctx, onPass }) => {
  const { fontSize } = useQuranGame();
  const questions = useMemo(() => buildTajwidQuestions(ctx.ayah.words, 3), [ctx.ayah]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);

  const q = questions[index];
  const isLast = index === questions.length - 1;

  const choose = (i: number) => {
    if (solved) return;
    setPicked(i);
    if (q.options[i].correct) {
      setSolved(true);
      sounds.playCorrectDing();
    } else {
      sounds.playGentleRetry();
    }
  };

  const next = () => {
    if (isLast) return onPass();
    setIndex(index + 1);
    setPicked(null);
    setSolved(false);
  };

  return (
    <div className="space-y-5">
      <StageHeader
        title="Tahap 2 · Kuis Tajwid"
        description="Kenali hukum bacaan yang ada di ayat ini sebelum menghafalkannya."
        round={index}
        rounds={questions.length}
        roundLabel="Soal"
        listenAyah={ctx.ayah}
      />

      <div className="bg-gradient-to-b from-[#F8F6F1] to-[#F1EDE6] dark:from-[#102731] dark:to-[#152E38] rounded-3xl p-5 sm:p-7 border border-[#BE9452]/40 text-center space-y-4">
        <div>
          <span className="inline-block text-[11px] font-semibold px-3 py-1 rounded-full bg-[#246579]/10 dark:bg-[#246579]/30 text-[#246579] dark:text-[#A7CDD3]">
            Kategori: {q.label}
          </span>
        </div>
        <div className="inline-block p-4 px-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-[#D3A253] shadow-sm max-w-full">
          <p dir="rtl" className="font-arabic font-bold text-[#173B4E] dark:text-[#D3A253]" style={{ fontSize: arabicSize(fontSize, 1.1, 30) }}>
            {q.phrase}
          </p>
        </div>
        <p className="text-sm font-semibold text-[#293640] dark:text-white">{q.question}</p>

        <div className="grid gap-2 max-w-lg mx-auto text-left">
          {q.options.map((option, i) => {
            const chosen = picked === i;
            const style = solved && option.correct
              ? 'border-emerald-400 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200'
              : chosen && !option.correct
              ? 'border-red-300 bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#477F8D] text-[#293640] dark:text-slate-100';
            return (
              <button
                key={`${index}_${option.text}`}
                type="button"
                onClick={() => choose(i)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-colors ${style}`}
              >
                <span className="w-6 h-6 shrink-0 rounded-lg bg-[#F1EDE6] dark:bg-slate-700 text-[#9A7035] dark:text-[#D3A253] text-[11px] font-bold flex items-center justify-center">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{option.text}</span>
                {solved && option.correct && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                {chosen && !option.correct && <XCircle className="w-4 h-4 shrink-0" />}
              </button>
            );
          })}
        </div>

        {picked !== null && !solved && (
          <p className="text-xs text-red-700 dark:text-red-300">Belum tepat. Perhatikan huruf yang bertemu, lalu coba lagi.</p>
        )}
      </div>

      {solved && (
        <RoundDone
          title="Jawaban tepat!"
          note={q.explanation}
          actionLabel={isLast ? 'Selesaikan Tahap 2' : 'Soal berikutnya'}
          onContinue={next}
        />
      )}
    </div>
  );
};
