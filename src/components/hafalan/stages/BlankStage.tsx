import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Lightbulb } from 'lucide-react';
import { useQuranGame } from '../../../context/QuranGameContext';
import type { QuranWord } from '../../../types/quran';
import { sounds } from '../../../utils/soundEffects';
import { cleanWord, otherWords, shuffle, type HafalanContext } from '../hafalanPlan';
import { RoundDone, StageHeader, arabicSize } from '../StageParts';

interface BlankRound { segment: number; blank: number }

/** Ayat satu bagian: hingga 3 kata berbeda dikosongkan. Ayat panjang: satu kata di tiap bagian. */
function planRounds(segments: QuranWord[][]): BlankRound[] {
  if (segments.length === 1) {
    const indices = shuffle(segments[0].map((_, i) => i)).slice(0, Math.min(3, segments[0].length));
    return indices.sort((a, b) => a - b).map((blank) => ({ segment: 0, blank }));
  }
  return segments.map((segment, s) => ({
    segment: s,
    // Hindari kata pertama agar ada konteks sebelum bagian yang kosong.
    blank: segment.length > 1 ? 1 + Math.floor(Math.random() * (segment.length - 1)) : 0
  }));
}

export const BlankStage: React.FC<{ ctx: HafalanContext; onPass: () => void }> = ({ ctx, onPass }) => {
  const { fontSize } = useQuranGame();
  const rounds = useMemo(() => planRounds(ctx.segments), [ctx.segments]);
  const [round, setRound] = useState(0);
  const [options, setOptions] = useState<QuranWord[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const { segment, blank } = rounds[round];
  const words = ctx.segments[segment];
  const answer = words[blank];
  const previousTail = segment > 0 ? ctx.segments[segment - 1].slice(-3) : [];
  const isLast = round === rounds.length - 1;

  useEffect(() => {
    const pool = otherWords(ctx, ctx.ayah.words.map((w) => w.arabic))
      .filter((w) => cleanWord(w.arabic) !== cleanWord(answer.arabic));
    // Tambah pengecoh dari kata lain di ayat ini bila surah terlalu pendek.
    const fallback = ctx.ayah.words.filter((w) => cleanWord(w.arabic) !== cleanWord(answer.arabic));
    const distractors: QuranWord[] = [];
    for (const word of [...shuffle(pool), ...shuffle(fallback)]) {
      if (!distractors.some((d) => cleanWord(d.arabic) === cleanWord(word.arabic))) distractors.push(word);
      if (distractors.length === 2) break;
    }
    setOptions(shuffle([answer, ...distractors]));
    setPicked(null);
    setSolved(false);
    setShowHint(false);
  }, [round]);

  const choose = (word: QuranWord) => {
    if (solved) return;
    setPicked(word.id);
    if (cleanWord(word.arabic) === cleanWord(answer.arabic)) {
      setSolved(true);
      sounds.playCorrectDing();
    } else {
      sounds.playGentleRetry();
    }
  };

  return (
    <div className="space-y-5">
      <StageHeader
        title="Tebak Lanjutan"
        description="Pilih kata yang tepat untuk mengisi bagian ayat yang kosong."
        round={round}
        rounds={rounds.length}
        roundLabel="Soal"
        listenAyah={ctx.ayah}
      />

      <div className="bg-gradient-to-b from-[#F8F6F1] to-[#F1EDE6] dark:from-[#102731] dark:to-[#152E38] rounded-3xl p-5 sm:p-7 border border-[#BE9452]/40 text-center space-y-3">
        <div dir="rtl" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 py-3">
          {previousTail.length > 0 && (
            <span className="font-arabic text-slate-400 dark:text-slate-500" style={{ fontSize: arabicSize(fontSize, 0.75, 22) }}>
              … {previousTail.map((w) => w.arabic).join(' ')}
            </span>
          )}
          {words.map((word, i) => (
            i === blank ? (
              <span
                key={`b_${round}_${i}`}
                className={`inline-flex items-center justify-center min-w-[88px] px-3 py-1 rounded-xl border-2 border-dashed font-arabic ${
                  solved ? 'border-emerald-400 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200' : 'border-[#D3A253] text-[#BE9452]'
                }`}
                style={{ fontSize: arabicSize(fontSize, 0.9, 24) }}
              >
                {solved ? word.arabic : '؟'}
              </span>
            ) : (
              <span key={`w_${round}_${i}`} className="font-arabic text-[#173B4E] dark:text-[#D3A253]" style={{ fontSize: arabicSize(fontSize, 0.9, 24) }}>
                {word.arabic}
              </span>
            )
          ))}
        </div>
        <button type="button" onClick={() => setShowHint(!showHint)} className="inline-flex items-center gap-1 text-xs text-amber-700 dark:text-amber-300 hover:underline">
          <Lightbulb className="w-3.5 h-3.5" /> {showHint ? `Arti kata yang hilang: "${answer.translation}"` : 'Tampilkan arti kata yang hilang'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.map((word) => {
          const correct = cleanWord(word.arabic) === cleanWord(answer.arabic);
          const chosen = picked === word.id;
          return (
            <button
              key={`o_${round}_${word.id}`}
              type="button"
              onClick={() => choose(word)}
              className={`p-4 rounded-2xl border text-center transition-colors ${
                solved && correct
                  ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                  : chosen
                  ? 'border-red-300 bg-red-50 dark:bg-red-950/40'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#477F8D]'
              }`}
            >
              <span dir="rtl" className="font-arabic block text-[#173B4E] dark:text-[#D3A253]" style={{ fontSize: arabicSize(fontSize, 0.85, 24) }}>{word.arabic}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">{word.transliteration}</span>
              {solved && correct && <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mt-1" />}
            </button>
          );
        })}
      </div>
      {picked && !solved && <p className="text-center text-xs text-red-700 dark:text-red-300">Belum tepat, coba dengarkan lagi ayatnya.</p>}

      {solved && (
        <RoundDone
          title={isLast ? 'Semua bagian yang kosong sudah terisi!' : 'Tepat!'}
          actionLabel={isLast ? 'Selesai' : 'Soal berikutnya'}
          onContinue={() => (isLast ? onPass() : setRound(round + 1))}
        />
      )}
    </div>
  );
};
