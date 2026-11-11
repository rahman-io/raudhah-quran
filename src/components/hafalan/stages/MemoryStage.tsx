import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { RotateCcw } from 'lucide-react';
import { useQuranGame } from '../../../context/QuranGameContext';
import type { QuranWord } from '../../../types/quran';
import { sounds } from '../../../utils/soundEffects';
import { cleanWord, otherWords, shuffle, type HafalanContext } from '../hafalanPlan';
import { RoundDone, StageHeader, arabicSize } from '../StageParts';

interface Card { id: string; pair: number; kind: 'arabic' | 'meaning'; text: string; sub?: string }

const sameMeaning = (a: QuranWord, b: QuranWord) =>
  cleanWord(a.arabic) === cleanWord(b.arabic) || a.translation.trim().toLowerCase() === b.translation.trim().toLowerCase();

/** Pilih hingga 4 kata unik dari bagian ini; bila kurang dari 2, tambah dari ayat lain di surah. */
function pickWords(ctx: HafalanContext, segment: QuranWord[]): QuranWord[] {
  const picked: QuranWord[] = [];
  for (const word of segment) {
    if (!picked.some((p) => sameMeaning(p, word))) picked.push(word);
    if (picked.length === 4) break;
  }
  if (picked.length < 3) {
    for (const word of shuffle(otherWords(ctx, picked.map((p) => p.arabic)))) {
      if (!picked.some((p) => sameMeaning(p, word))) picked.push(word);
      if (picked.length >= 3) break;
    }
  }
  return picked;
}

export const MemoryStage: React.FC<{ ctx: HafalanContext; onPass: () => void }> = ({ ctx, onPass }) => {
  const { fontSize } = useQuranGame();
  const [round, setRound] = useState(0);
  const [cards, setCards] = useState<Card[]>([]);
  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const words = useMemo(() => pickWords(ctx, ctx.segments[round]), [ctx, round]);

  const deal = () => {
    const deck: Card[] = [];
    words.forEach((word, pair) => {
      deck.push({ id: `a${pair}`, pair, kind: 'arabic', text: word.arabic, sub: word.transliteration });
      deck.push({ id: `m${pair}`, pair, kind: 'meaning', text: word.translation });
    });
    if (timer.current) clearTimeout(timer.current);
    setCards(shuffle(deck));
    setOpen([]);
    setMatched([]);
    setBusy(false);
  };

  useEffect(() => {
    deal();
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [words]);

  const done = words.length > 0 && matched.length === words.length;

  const flip = (card: Card) => {
    if (busy || open.includes(card.id) || matched.includes(card.pair)) return;
    sounds.playWordClick();
    const next = [...open, card.id];
    setOpen(next);
    if (next.length < 2) return;
    const [first, second] = next.map((id) => cards.find((c) => c.id === id)!);
    if (first.pair === second.pair && first.kind !== second.kind) {
      const nowMatched = [...matched, first.pair];
      setMatched(nowMatched);
      setOpen([]);
      if (nowMatched.length === words.length) sounds.playAyahComplete();
      else sounds.playCorrectDing();
    } else {
      setBusy(true);
      timer.current = setTimeout(() => {
        setOpen([]);
        setBusy(false);
      }, 900);
    }
  };

  const isLastRound = round === ctx.segments.length - 1;

  return (
    <div className="space-y-5">
      <StageHeader
        title="Tahap 1 · Kartu Pasangan"
        description="Buka dua kartu sekaligus dan pasangkan kata Arab dengan artinya."
        round={round}
        rounds={ctx.segments.length}
        listenAyah={ctx.ayah}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((card) => {
          const faceUp = open.includes(card.id) || matched.includes(card.pair);
          const isMatched = matched.includes(card.pair);
          return (
            <motion.button
              key={`${round}_${card.id}`}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => flip(card)}
              className={`min-h-[104px] rounded-2xl border p-3 flex flex-col items-center justify-center text-center transition-colors ${
                isMatched
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                  : faceUp
                  ? 'bg-white dark:bg-slate-800 border-[#D3A253]'
                  : 'bg-[#246579] hover:bg-[#174C60] border-[#174C60] text-white'
              }`}
            >
              {faceUp ? (
                card.kind === 'arabic' ? (
                  <>
                    <span dir="rtl" className="font-arabic text-[#173B4E] dark:text-[#D3A253]" style={{ fontSize: arabicSize(fontSize, 0.8, 24) }}>{card.text}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{card.sub}</span>
                  </>
                ) : (
                  <span className="text-xs font-semibold text-[#293640] dark:text-slate-100">{card.text}</span>
                )
              ) : (
                <span className="font-arabic text-2xl text-[#D3A253]/80">؟</span>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="flex justify-center">
        <button type="button" onClick={deal} className="inline-flex items-center gap-1.5 text-xs text-[#246579] dark:text-[#A7CDD3] hover:underline">
          <RotateCcw className="w-3.5 h-3.5" /> Acak ulang kartu
        </button>
      </div>

      {done && (
        <RoundDone
          title={isLastRound ? 'Semua arti kata sudah kamu pasangkan!' : `Bagian ${round + 1} selesai`}
          actionLabel={isLastRound ? 'Selesaikan Tahap 1' : 'Lanjut ke bagian berikutnya'}
          onContinue={() => (isLastRound ? onPass() : setRound(round + 1))}
        />
      )}
    </div>
  );
};
