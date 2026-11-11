import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { HelpCircle, RotateCcw } from 'lucide-react';
import { useQuranGame } from '../../../context/QuranGameContext';
import { sounds } from '../../../utils/soundEffects';
import { cleanWord, shuffle, type HafalanContext } from '../hafalanPlan';
import { RoundDone, StageHeader, arabicSize } from '../StageParts';

interface Piece { key: string; text: string; sub?: string; order: number }

export const PuzzleStage: React.FC<{ ctx: HafalanContext; onPass: () => void }> = ({ ctx, onPass }) => {
  const { fontSize } = useQuranGame();
  const multi = ctx.segments.length > 1;
  // Putaran: susun kata tiap bagian, lalu (ayat panjang) susun urutan bagian-bagiannya.
  const rounds: Piece[][] = useMemo(() => {
    const wordRounds = ctx.segments.map((segment, r) =>
      segment.map((word, i) => ({ key: `${r}_${i}`, text: word.arabic, sub: word.transliteration, order: i })));
    if (!multi) return wordRounds;
    const segmentRound = ctx.segments.map((segment, i) => ({
      key: `s_${i}`, text: segment.map((w) => w.arabic).join(' '), order: i
    }));
    return [...wordRounds, segmentRound];
  }, [ctx.segments, multi]);

  const [round, setRound] = useState(0);
  const [placed, setPlaced] = useState<Piece[]>([]);
  const [pool, setPool] = useState<Piece[]>([]);
  const [wrong, setWrong] = useState(false);
  const [hint, setHint] = useState(false);

  const target = rounds[round];
  const isOrderRound = multi && round === rounds.length - 1;
  const isLastRound = round === rounds.length - 1;
  const same = (a: Piece, b: Piece) => cleanWord(a.text) === cleanWord(b.text);
  const solved = placed.length === target.length && placed.every((p, i) => same(p, target[i]));

  const reset = () => {
    let mixed = shuffle(target);
    if (mixed.length > 1 && mixed.every((p, i) => same(p, target[i]))) mixed = [...mixed].reverse();
    setPool(mixed);
    setPlaced([]);
    setWrong(false);
    setHint(false);
  };

  useEffect(reset, [round]);

  const place = (piece: Piece) => {
    if (solved) return;
    sounds.playWordClick();
    const next = [...placed, piece];
    setPlaced(next);
    setPool(pool.filter((p) => p.key !== piece.key));
    setHint(false);
    if (next.length === target.length) {
      if (next.every((p, i) => same(p, target[i]))) sounds.playCorrectDing();
      else {
        setWrong(true);
        sounds.playGentleRetry();
      }
    }
  };

  const unplace = (piece: Piece) => {
    if (solved) return;
    sounds.playWordClick();
    setPlaced(placed.filter((p) => p.key !== piece.key));
    setPool([...pool, piece]);
    setWrong(false);
  };

  const firstWrong = placed.findIndex((p, i) => !same(p, target[i]));
  const hintIndex = firstWrong >= 0 ? firstWrong : placed.length;

  return (
    <div className="space-y-5">
      <StageHeader
        title="Tahap 4 · Susun Ayat"
        description={isOrderRound ? 'Susun potongan-potongan ayat sesuai urutan yang benar.' : 'Klik kepingan kata secara berurutan dari kanan ke kiri.'}
        round={round}
        rounds={rounds.length}
        roundLabel={isOrderRound ? 'Urutan bagian ·' : 'Bagian'}
        listenAyah={ctx.ayah}
      />

      <div className="relative min-h-[130px] bg-gradient-to-b from-[#F8F6F1] to-[#F1EDE6] dark:from-[#102731] dark:to-[#152E38] rounded-3xl p-5 border-2 border-dashed border-[#BE9452]/40">
        <div className="flex items-center justify-between text-xs text-[#477F8D] mb-2">
          <span>Susunanmu (klik untuk mengembalikan):</span>
          <span>{placed.length} / {target.length}</span>
        </div>
        <div dir="rtl" className={`flex flex-wrap items-center justify-center gap-2.5 py-3 min-h-[60px] ${isOrderRound ? 'flex-col' : ''}`}>
          {placed.length === 0 && <p dir="ltr" className="text-sm text-slate-400 italic">Pilih kepingan di bawah…</p>}
          {placed.map((piece, i) => (
            <motion.button
              key={`p_${piece.key}`}
              layout
              type="button"
              onClick={() => unplace(piece)}
              className={`px-3 py-1.5 bg-white dark:bg-[#1E293B] rounded-2xl shadow-sm border transition-colors text-[#173B4E] dark:text-[#D3A253] ${
                hint && i === hintIndex && firstWrong >= 0 ? 'border-amber-500 ring-2 ring-amber-400' : 'border-[#477F8D]/40 hover:border-red-400'
              }`}
            >
              <span className="font-arabic block" style={{ fontSize: arabicSize(fontSize, isOrderRound ? 0.7 : 0.85, 22) }}>{piece.text}</span>
              {piece.sub && <span className="text-[10px] text-slate-400 block">{piece.sub}</span>}
            </motion.button>
          ))}
        </div>
        {wrong && !solved && (
          <p className="text-center text-xs text-red-700 dark:text-red-300 mt-2">Susunan belum tepat. Klik kepingan yang salah untuk mengembalikannya.</p>
        )}
      </div>

      {!solved && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#246579] dark:text-[#94A3B8]">
            <span>Kepingan acak:</span>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => { setHint(true); sounds.playWordClick(); }} className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 hover:underline">
                <HelpCircle className="w-3.5 h-3.5" /> Petunjuk
              </button>
              <button type="button" onClick={reset} className="inline-flex items-center gap-1 hover:underline">
                <RotateCcw className="w-3.5 h-3.5" /> Acak ulang
              </button>
            </div>
          </div>
          <div dir="rtl" className={`flex flex-wrap items-center justify-center gap-2.5 p-4 bg-white/60 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 min-h-[80px] ${isOrderRound ? 'flex-col' : ''}`}>
            {pool.map((piece) => {
              const isHint = hint && firstWrong < 0 && same(piece, target[placed.length]);
              return (
                <motion.button
                  key={`q_${piece.key}`}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => place(piece)}
                  className={`px-3 py-2 rounded-2xl bg-[#F1EDE6] dark:bg-[#152E38] hover:bg-[#E8E1D6] dark:hover:bg-[#193E4B] text-[#293640] dark:text-[#F1F5F9] border transition-colors ${
                    isHint ? 'border-amber-500 ring-2 ring-amber-400' : 'border-[#BE9452]/40 hover:border-[#477F8D]'
                  }`}
                >
                  <span className="font-arabic block" style={{ fontSize: arabicSize(fontSize, isOrderRound ? 0.7 : 0.85, 22) }}>{piece.text}</span>
                  {piece.sub && <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{piece.sub}</span>}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {solved && (
        <RoundDone
          title={isLastRound ? 'Susunan ayat sudah tepat!' : `Bagian ${round + 1} tersusun benar`}
          actionLabel={isLastRound ? 'Selesaikan Tahap 4' : round + 1 === rounds.length - 1 && multi ? 'Susun urutan bagian' : 'Lanjut ke bagian berikutnya'}
          onContinue={() => (isLastRound ? onPass() : setRound(round + 1))}
        />
      )}
    </div>
  );
};
