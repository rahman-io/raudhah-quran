import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RotateCcw, CheckCircle2, ArrowRight, Layers } from 'lucide-react';
import { useQuranGame } from '../../context/QuranGameContext';
import { QuranWord } from '../../types/quran';
import { sounds } from '../../utils/soundEffects';

interface MemoryCard {
  id: string; // unique card id
  pairKey: string; // word.id
  type: 'arabic' | 'translation';
  content: string;
  transliteration?: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryMatchGame: React.FC = () => {
  const {
    selectedAyah,
    activeSurah,
    addXP,
    fontSize,
    mode
  } = useQuranGame();

  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCardIds, setFlippedCardIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [matchedPairsCount, setMatchedPairsCount] = useState<number>(0);
  const [movesCount, setMovesCount] = useState<number>(0);
  const hasRewardedRef = useRef<boolean>(false);

  // Initialize board whenever selectedAyah changes
  useEffect(() => {
    initGame();
  }, [selectedAyah.id]);

  // Award XP and play celebration when all pairs are matched
  useEffect(() => {
    if (matchedPairsCount === 4 && !hasRewardedRef.current) {
      hasRewardedRef.current = true;
      sounds.playAyahComplete();
      addXP(45, 'Menyelesaikan Kartu Pasangan Tadabbur');
    }
  }, [matchedPairsCount, addXP]);

  const initGame = () => {
    hasRewardedRef.current = false;
    // Select up to 4 words from current ayah (or pad from activeSurah if short)
    let wordsPool: QuranWord[] = [...selectedAyah.words];
    if (wordsPool.length < 4) {
      activeSurah.ayahs.forEach((a) => {
        a.words.forEach((w) => {
          if (!wordsPool.some((p) => p.arabic === w.arabic) && wordsPool.length < 4) {
            wordsPool.push(w);
          }
        });
      });
    }

    const selectedWords = wordsPool.slice(0, 4);

    const generatedCards: MemoryCard[] = [];
    selectedWords.forEach((w, idx) => {
      // Arabic Card
      generatedCards.push({
        id: `card_ar_${w.id}_${idx}`,
        pairKey: w.id,
        type: 'arabic',
        content: w.arabic,
        transliteration: w.transliteration,
        isFlipped: false,
        isMatched: false
      });
      // Translation Card
      generatedCards.push({
        id: `card_tr_${w.id}_${idx}`,
        pairKey: w.id,
        type: 'translation',
        content: w.translation,
        isFlipped: false,
        isMatched: false
      });
    });

    // Shuffle cards
    const shuffled = generatedCards.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedCardIds([]);
    setIsProcessing(false);
    setMatchedPairsCount(0);
    setMovesCount(0);
  };

  const handleCardClick = (card: MemoryCard) => {
    if (isProcessing) return;
    if (card.isFlipped || card.isMatched) return;
    if (flippedCardIds.length >= 2) return;

    sounds.playWordClick();

    const newFlipped = [...flippedCardIds, card.id];
    setFlippedCardIds(newFlipped);

    // Flip card visually
    setCards((prev) =>
      prev.map((c) => (c.id === card.id ? { ...c, isFlipped: true } : c))
    );

    // If 2 cards are flipped, check for match
    if (newFlipped.length === 2) {
      setMovesCount((m) => m + 1);
      setIsProcessing(true);

      const firstCard = cards.find((c) => c.id === newFlipped[0]);
      const secondCard = card;

      if (firstCard && firstCard.pairKey === secondCard.pairKey && firstCard.type !== secondCard.type) {
        // MATCH!
        setTimeout(() => {
          sounds.playCorrectDing();
          setCards((prev) =>
            prev.map((c) =>
              c.pairKey === firstCard.pairKey
                ? { ...c, isMatched: true, isFlipped: true }
                : c
            )
          );
          setMatchedPairsCount((count) => count + 1);
          setFlippedCardIds([]);
          setIsProcessing(false);
        }, 400);
      } else {
        // NO MATCH -> flip back smoothly
        setTimeout(() => {
          sounds.playGentleRetry();
          setCards((prev) =>
            prev.map((c) =>
              newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCardIds([]);
          setIsProcessing(false);
        }, 900);
      }
    }
  };

  const isAllMatched = matchedPairsCount === 4;

  return (
    <div className="w-full space-y-6">
      {/* Game Instruction Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div>
          <span className="text-[11px] font-semibold text-[#84A98C] uppercase tracking-wider block">
            Game 5 · Kartu Pasangan Tadabbur (Memory Match)
          </span>
          <p className="text-xs text-[#52796F] dark:text-[#94A3B8] mt-0.5">
            Buka dua kartu dan pasangkan antara lafaz kata Arab dengan arti Indonesianya yang sesuai.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-[#52796F] dark:text-[#94A3B8] font-semibold">
            Pasangan: <span className="text-[#E9C46A] font-bold">{matchedPairsCount}</span> / 4 · Langkah: <span className="tabular-nums">{movesCount}</span>
          </div>

          <button
            onClick={initGame}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Kocok Ulang Kartu"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2D Memory Grid (4x2 cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 bg-gradient-to-b from-[#FDFBF7] to-[#F4EFEA] dark:from-[#0F1E21] dark:to-[#16272B] rounded-3xl border border-[#C5A059]/40 shadow-xs">
        {cards.map((card) => {
          return (
            <motion.div
              key={card.id}
              whileHover={{ scale: card.isMatched ? 1 : 1.03 }}
              whileTap={{ scale: card.isMatched ? 1 : 0.97 }}
              onClick={() => handleCardClick(card)}
              className="relative aspect-4/3 sm:aspect-square cursor-pointer select-none"
            >
              <div
                className={`w-full h-full rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center p-3 text-center ${
                  card.isMatched
                    ? 'bg-[#84A98C] text-white border-[#52796F] shadow-sm'
                    : card.isFlipped
                    ? 'bg-white dark:bg-slate-800 border-[#C5A059] shadow-md ring-2 ring-[#C5A059]/30'
                    : 'bg-gradient-to-br from-[#52796F] to-[#2F3E46] text-[#E9C46A] border-[#84A98C]/30 shadow-xs hover:shadow-md'
                }`}
              >
                {/* When Flipped or Matched: Show Content */}
                {card.isFlipped || card.isMatched ? (
                  card.type === 'arabic' ? (
                    <div>
                      <p
                        className="font-arabic font-bold text-[#1D3557] dark:text-[#E9C46A] leading-tight"
                        style={{
                          fontSize: `${Math.max(fontSize * 0.85, 24)}px`,
                          color: card.isMatched ? '#FFFFFF' : undefined
                        }}
                      >
                        {card.content}
                      </p>
                      {card.transliteration && (
                        <p className={`text-[10px] font-sans mt-1 ${card.isMatched ? 'text-white/80' : 'text-slate-400'}`}>
                          {card.transliteration}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <span className={`text-[9px] uppercase tracking-wider block font-semibold mb-1 ${card.isMatched ? 'text-white/80' : 'text-[#84A98C]'}`}>
                        Arti Kata:
                      </span>
                      <p className={`text-xs font-bold leading-snug ${card.isMatched ? 'text-white' : 'text-[#2F3E46] dark:text-white'}`}>
                        "{card.content}"
                      </p>
                    </div>
                  )
                ) : (
                  /* Back of Card: Islamic Geometric Emblem */
                  <div className="flex flex-col items-center justify-center space-y-1 opacity-80 group-hover:opacity-100">
                    <span className="font-arabic text-2xl text-[#E9C46A]">۝</span>
                    <span className="text-[10px] font-semibold text-[#FDFBF7] tracking-wider uppercase">
                      Raudhah
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Completion Card */}
      <AnimatePresence>
        {isAllMatched && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-gradient-to-r from-[#D8EADB] to-[#F0F7F2] dark:from-[#133230] dark:to-[#1E3A34] border border-[#84A98C] rounded-3xl text-center space-y-3 shadow-md"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#52796F] text-white">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#2F3E46] dark:text-white flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#E9C46A]" />
                <span>Luar Biasa, Seluruh Pasangan Terbuka!</span>
              </h4>
              <p className="text-xs text-[#52796F] dark:text-[#A8D5BA] mt-1">
                Kamu menyelesaikan memori tadabbur dalam <span className="font-bold text-[#E76F51]">{movesCount} langkah</span> dan meraih <span className="font-bold text-[#E76F51]">+45 XP</span>!
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={initGame}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#52796F] hover:bg-[#354F52] text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <span>Mainkan Putaran Baru</span>
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
