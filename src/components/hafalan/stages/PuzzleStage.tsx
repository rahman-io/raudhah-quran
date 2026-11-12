import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { GripVertical, HelpCircle, RotateCcw } from 'lucide-react';
import { useQuranGame } from '../../../context/QuranGameContext';
import { sounds } from '../../../utils/soundEffects';
import { cleanWord, shuffle, type HafalanContext } from '../hafalanPlan';
import { RoundDone, StageHeader, arabicSize } from '../StageParts';

interface Piece { key: string; text: string; sub?: string; order: number }

type Source = 'placed' | 'pool';

interface DragState {
  piece: Piece;
  from: Source;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Tujuan lepas: posisi di jawaban (tanpa kepingan yang sedang diseret), atau kembali ke kumpulan acak. */
type DropTarget = { zone: 'answer'; index: number } | { zone: 'pool' } | null;

const DRAG_THRESHOLD = 6;

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
  const [hint, setHint] = useState(false);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [drop, setDrop] = useState<DropTarget>(null);

  const answerRef = useRef<HTMLDivElement>(null);
  const poolRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<string, HTMLElement>());
  const pending = useRef<{ piece: Piece; from: Source; startX: number; startY: number; el: HTMLElement } | null>(null);
  const suppressClick = useRef(false);
  const dropRef = useRef<DropTarget>(null);
  const slots = useRef<{ x: number; y: number; before: boolean; index: number }[]>([]);

  const target = rounds[round];
  const isOrderRound = multi && round === rounds.length - 1;
  const isLastRound = round === rounds.length - 1;
  const same = (a: Piece, b: Piece) => cleanWord(a.text) === cleanWord(b.text);
  const full = placed.length === target.length;
  const solved = full && placed.every((p, i) => same(p, target[i]));
  const wrong = full && !solved;

  const reset = () => {
    let mixed = shuffle(target);
    if (mixed.length > 1 && mixed.every((p, i) => same(p, target[i]))) mixed = [...mixed].reverse();
    setPool(mixed);
    setPlaced([]);
    setHint(false);
  };

  useEffect(reset, [round]);

  // Bunyi saat susunan lengkap (benar / belum tepat), dan saat susunan yang salah dibetulkan.
  const wasFull = useRef(false);
  useEffect(() => {
    if (full && (!wasFull.current || solved)) {
      if (solved) sounds.playCorrectDing();
      else sounds.playGentleRetry();
    }
    wasFull.current = full;
  }, [placed]);

  /** Pindahkan kepingan ke jawaban (posisi tertentu) atau kembali ke kumpulan acak. */
  const move = (piece: Piece, to: DropTarget) => {
    if (!to || solved) return;
    const withoutPiece = placed.filter((p) => p.key !== piece.key);
    if (to.zone === 'answer') {
      const index = Math.max(0, Math.min(to.index, withoutPiece.length));
      setPlaced([...withoutPiece.slice(0, index), piece, ...withoutPiece.slice(index)]);
      setPool(pool.filter((p) => p.key !== piece.key));
    } else {
      setPlaced(withoutPiece);
      if (!pool.some((p) => p.key === piece.key)) setPool([...pool, piece]);
    }
    setHint(false);
    sounds.playWordClick();
  };

  const place = (piece: Piece) => move(piece, { zone: 'answer', index: placed.length });
  const unplace = (piece: Piece) => move(piece, { zone: 'pool' });

  /* -------------------- Seret & lepas -------------------- */

  const inside = (el: HTMLElement | null, x: number, y: number) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  };

  /**
   * Posisi kepingan di jawaban direkam sekali saat seret dimulai, supaya penanda sisip
   * tidak "melompat-lompat" ketika tata letak bergeser.
   */
  const snapshotSlots = (draggedKey: string) => {
    slots.current = placed
      .filter((p) => p.key !== draggedKey)
      .flatMap((p, index) => {
        const el = itemRefs.current.get(p.key);
        if (!el) return [];
        const r = el.getBoundingClientRect();
        return [{ x: r.left + r.width / 2, y: r.top + r.height / 2, before: true, index }];
      });
  };

  const answerIndexAt = (x: number, y: number): number => {
    const items = slots.current;
    if (!items.length) return 0;
    let nearest = items[0];
    let best = Infinity;
    items.forEach((slot) => {
      const distance = Math.hypot(x - slot.x, (y - slot.y) * 1.6);
      if (distance < best) {
        best = distance;
        nearest = slot;
      }
    });
    // Mode kolom: di atas = sebelum. Mode baris (kanan ke kiri): di kanan = sebelum.
    const before = isOrderRound ? y < nearest.y : x > nearest.x;
    return before ? nearest.index : nearest.index + 1;
  };

  const updateDrop = (x: number, y: number) => {
    let next: DropTarget = null;
    if (inside(answerRef.current, x, y)) next = { zone: 'answer', index: answerIndexAt(x, y) };
    else if (inside(poolRef.current, x, y)) next = { zone: 'pool' };
    const prev = dropRef.current;
    const changed = prev?.zone !== next?.zone
      || (prev?.zone === 'answer' && next?.zone === 'answer' && prev.index !== next.index);
    dropRef.current = next;
    if (changed) setDrop(next);
  };

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const p = pending.current;
      if (!p) return;
      if (!drag) {
        if (Math.hypot(event.clientX - p.startX, event.clientY - p.startY) < DRAG_THRESHOLD) return;
        const r = p.el.getBoundingClientRect();
        snapshotSlots(p.piece.key);
        setDrag({
          piece: p.piece, from: p.from, x: event.clientX, y: event.clientY,
          width: r.width, height: r.height
        });
      } else {
        setDrag({ ...drag, x: event.clientX, y: event.clientY });
      }
      updateDrop(event.clientX, event.clientY);
      event.preventDefault();
    };
    const onUp = () => {
      const p = pending.current;
      pending.current = null;
      if (drag && p) {
        suppressClick.current = true;
        setTimeout(() => { suppressClick.current = false; }, 0);
        move(p.piece, dropRef.current);
      }
      dropRef.current = null;
      setDrag(null);
      setDrop(null);
    };
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  });

  const startPointer = (event: React.PointerEvent<HTMLElement>, piece: Piece, from: Source) => {
    if (solved || event.button > 0) return;
    pending.current = { piece, from, startX: event.clientX, startY: event.clientY, el: event.currentTarget };
  };

  const handleClick = (piece: Piece, from: Source) => {
    if (suppressClick.current) return;
    if (from === 'pool') place(piece);
    else unplace(piece);
  };

  /* -------------------- Tampilan -------------------- */

  const firstWrong = placed.findIndex((p, i) => !same(p, target[i]));
  const hintIndex = firstWrong >= 0 ? firstWrong : placed.length;
  const pieceSize = arabicSize(fontSize, isOrderRound ? 0.7 : 0.85, 22);
  const markerIndex = drag && drop?.zone === 'answer' ? drop.index : -1;

  const pieceBody = (piece: Piece, muted = false) => (
    <>
      <span className="font-arabic block" style={{ fontSize: pieceSize }}>{piece.text}</span>
      {piece.sub && <span className={`text-[10px] block ${muted ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400'}`}>{piece.sub}</span>}
    </>
  );

  const marker = (
    <span
      key="marker"
      className={`${isOrderRound ? 'h-1.5 w-40' : 'w-1.5 self-stretch min-h-[48px]'} rounded-full bg-[#D3A253]`}
      aria-hidden="true"
    />
  );

  return (
    <div className="space-y-5">
      <StageHeader
        title="Susun Ayat"
        description={isOrderRound
          ? 'Susun potongan ayat sesuai urutan. Seret untuk memindahkan posisi.'
          : 'Klik atau seret kepingan ke jawaban. Kepingan di jawaban bisa diseret untuk ditukar posisinya.'}
        round={round}
        rounds={rounds.length}
        roundLabel={isOrderRound ? 'Urutan bagian ·' : 'Bagian'}
        listenAyah={ctx.ayah}
      />

      <div
        ref={answerRef}
        className={`relative min-h-[130px] bg-gradient-to-b from-[#F8F6F1] to-[#F1EDE6] dark:from-[#102731] dark:to-[#152E38] rounded-3xl p-5 border-2 border-dashed transition-colors ${
          drag && drop?.zone === 'answer' ? 'border-[#D3A253]' : 'border-[#BE9452]/40'
        }`}
      >
        <div className="flex items-center justify-between gap-3 text-xs text-[#477F8D] mb-2">
          <span>Susunanmu: seret untuk memindah posisi, klik untuk mengembalikan.</span>
          <span className="shrink-0">{placed.length} / {target.length}</span>
        </div>
        <div dir="rtl" className={`flex flex-wrap items-center justify-center gap-2.5 py-3 min-h-[60px] ${isOrderRound ? 'flex-col' : ''}`}>
          {placed.length === 0 && !drag && <p dir="ltr" className="text-sm text-slate-400 italic">Klik atau seret kepingan dari bawah…</p>}
          {placed.map((piece, realIndex) => {
            const isHinted = hint && realIndex === hintIndex && firstWrong >= 0;
            const isDragged = drag?.piece.key === piece.key;
            // Indeks tanpa kepingan yang sedang diseret (dipakai untuk posisi penanda sisip).
            const slotIndex = drag ? placed.slice(0, realIndex).filter((p) => p.key !== drag.piece.key).length : realIndex;
            return (
              <React.Fragment key={`p_${piece.key}`}>
                {!isDragged && markerIndex === slotIndex && marker}
                <motion.button
                  ref={(el: HTMLButtonElement | null) => {
                    if (el) itemRefs.current.set(piece.key, el);
                    else itemRefs.current.delete(piece.key);
                  }}
                  layout
                  transition={{ type: 'spring', stiffness: 520, damping: 40 }}
                  type="button"
                  onPointerDown={(e) => startPointer(e, piece, 'placed')}
                  onClick={() => handleClick(piece, 'placed')}
                  style={{ touchAction: solved ? 'auto' : 'none' }}
                  className={`relative px-3 py-1.5 bg-white dark:bg-[#1E293B] rounded-2xl shadow-sm border transition-colors text-[#173B4E] dark:text-[#D3A253] select-none ${
                    solved ? '' : 'cursor-grab active:cursor-grabbing'
                  } ${isDragged ? 'opacity-30' : ''} ${isHinted ? 'border-amber-500 ring-2 ring-amber-400' : 'border-[#477F8D]/40 hover:border-[#477F8D]'}`}
                  aria-label={`Kata ke-${realIndex + 1}: ${piece.sub ?? piece.text}`}
                >
                  {!solved && <GripVertical className="absolute top-1 left-1 w-3 h-3 text-slate-300 dark:text-slate-500" aria-hidden="true" />}
                  {pieceBody(piece)}
                </motion.button>
              </React.Fragment>
            );
          })}
          {markerIndex >= 0 && markerIndex >= placed.filter((p) => p.key !== drag?.piece.key).length && marker}
        </div>
        {wrong && (
          <p className="text-center text-xs text-red-700 dark:text-red-300 mt-2">
            Susunan belum tepat. Seret kepingan yang salah ke posisi yang benar.
          </p>
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
          <div
            ref={poolRef}
            dir="rtl"
            className={`flex flex-wrap items-center justify-center gap-2.5 p-4 rounded-2xl border min-h-[80px] transition-colors ${isOrderRound ? 'flex-col' : ''} ${
              drag && drag.from === 'placed' && drop?.zone === 'pool'
                ? 'bg-[#D3A253]/10 border-[#D3A253]'
                : 'bg-white/60 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
            }`}
          >
            {pool.length === 0 && (
              <p dir="ltr" className="text-xs text-slate-400 italic">
                {drag?.from === 'placed' ? 'Lepas di sini untuk mengembalikan kepingan' : 'Semua kepingan sudah dipasang'}
              </p>
            )}
            {pool.map((piece) => {
              const isHint = hint && firstWrong < 0 && same(piece, target[placed.length]);
              const dragging = drag?.piece.key === piece.key;
              return (
                <motion.button
                  key={`q_${piece.key}`}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onPointerDown={(e) => startPointer(e, piece, 'pool')}
                  onClick={() => handleClick(piece, 'pool')}
                  style={{ touchAction: 'none' }}
                  className={`px-3 py-2 rounded-2xl bg-[#F1EDE6] dark:bg-[#152E38] hover:bg-[#E8E1D6] dark:hover:bg-[#193E4B] text-[#293640] dark:text-[#F1F5F9] border transition-colors select-none cursor-grab active:cursor-grabbing ${
                    dragging ? 'opacity-30' : ''
                  } ${isHint ? 'border-amber-500 ring-2 ring-amber-400' : 'border-[#BE9452]/40 hover:border-[#477F8D]'}`}
                >
                  {pieceBody(piece, true)}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Kepingan yang sedang diseret melayang di atas jari/kursor agar penanda sisip tetap terlihat */}
      {drag && (
        <div
          className="fixed z-[70] pointer-events-none px-3 py-1.5 rounded-2xl bg-white dark:bg-[#1E293B] border-2 border-[#D3A253] shadow-xl text-[#173B4E] dark:text-[#D3A253] text-center rotate-2"
          style={{ left: drag.x - drag.width / 2, top: drag.y - drag.height - 14, minWidth: drag.width }}
          dir="rtl"
        >
          {pieceBody(drag.piece)}
        </div>
      )}

      {solved && (
        <RoundDone
          title={isLastRound ? 'Susunan ayat sudah tepat!' : `Bagian ${round + 1} tersusun benar`}
          actionLabel={isLastRound ? 'Selesai' : round + 1 === rounds.length - 1 && multi ? 'Susun urutan bagian' : 'Lanjut ke bagian berikutnya'}
          onContinue={() => (isLastRound ? onPass() : setRound(round + 1))}
        />
      )}
    </div>
  );
};
