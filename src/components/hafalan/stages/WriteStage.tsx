import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, Eraser, PenLine, Undo2 } from 'lucide-react';
import { useQuranGame } from '../../../context/QuranGameContext';
import { sounds } from '../../../utils/soundEffects';
import {
  assessWriting, drawWritingPattern, WRITING_HEIGHT, WRITING_WIDTH, type WritingAssessment, type WritingStroke
} from '../../games/writingAssessment';
import { cleanWord, writingWords, type HafalanContext } from '../hafalanPlan';
import { RoundDone, StageHeader, arabicSize } from '../StageParts';

type Step = 'trace' | 'write';
type Point = { x: number; y: number };

export const WriteStage: React.FC<{ ctx: HafalanContext; onPass: () => void }> = ({ ctx, onPass }) => {
  const { fontSize } = useQuranGame();
  const targets = useMemo(() => writingWords(ctx.segments), [ctx.segments]);
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState<Step>('trace');
  const [strokes, setStrokes] = useState<WritingStroke[]>([]);
  const [result, setResult] = useState<WritingAssessment | null>(null);
  const [wordDone, setWordDone] = useState(false);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const pointer = useRef<number | null>(null);
  const strokeId = useRef(0);
  const activeStroke = useRef<number | null>(null);

  const word = targets[index];
  const text = cleanWord(word.arabic);
  const letters = text.replace(/[ً-ٰٟۖ-ۭ]/g, '');
  const patternSize = Math.min(92, Math.floor(560 / Math.max(5, letters.length * 0.85)));
  const isLast = index === targets.length - 1;

  useEffect(() => {
    let active = true;
    const paint = () => {
      const context = canvas.current?.getContext('2d');
      if (!active || !context) return;
      context.clearRect(0, 0, WRITING_WIDTH, WRITING_HEIGHT);
      if (step === 'trace' || (wordDone && step === 'write')) {
        context.fillStyle = '#246579';
        context.globalAlpha = step === 'trace' ? 0.35 : 0.2;
        drawWritingPattern(context, text, patternSize);
        context.globalAlpha = 1;
      }
    };
    paint();
    document.fonts?.load(`${patternSize}px Amiri`).then(paint).catch(paint);
    return () => { active = false; };
  }, [text, patternSize, step, wordDone]);

  useEffect(() => {
    const end = () => { pointer.current = null; activeStroke.current = null; };
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    return () => {
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
    };
  }, []);

  const toPoint = (event: React.PointerEvent<SVGSVGElement>): Point => {
    const box = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(WRITING_WIDTH, (event.clientX - box.left) * WRITING_WIDTH / box.width)),
      y: Math.max(0, Math.min(WRITING_HEIGHT, (event.clientY - box.top) * WRITING_HEIGHT / box.height))
    };
  };

  const down = (event: React.PointerEvent<SVGSVGElement>) => {
    if (wordDone || result?.isCorrect || pointer.current !== null) return;
    if (event.pointerType !== 'touch') event.currentTarget.setPointerCapture(event.pointerId);
    pointer.current = event.pointerId;
    const id = ++strokeId.current;
    activeStroke.current = id;
    const point = toPoint(event);
    const width = event.pointerType === 'touch' ? 9 : 6;
    setResult(null);
    setStrokes((prev) => [...prev, { id, points: [point], width }]);
  };

  const move = (event: React.PointerEvent<SVGSVGElement>) => {
    if (pointer.current !== event.pointerId || activeStroke.current === null) return;
    const point = toPoint(event);
    const id = activeStroke.current;
    setStrokes((prev) => prev.map((s) => (s.id === id ? { ...s, points: [...s.points, point] } : s)));
  };

  const up = (event: React.PointerEvent<SVGSVGElement>) => {
    if (pointer.current !== event.pointerId) return;
    pointer.current = null;
    activeStroke.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const check = () => {
    if (!strokes.length) return;
    const assessment = assessWriting(text, patternSize, strokes, step === 'write');
    setResult(assessment);
    if (assessment.isCorrect) {
      sounds.playCorrectDing();
      if (step === 'write') setWordDone(true);
    } else {
      sounds.playGentleRetry();
    }
  };

  const nextStep = () => {
    setStrokes([]);
    setResult(null);
    if (step === 'trace') {
      setStep('write');
      return;
    }
    if (isLast) return onPass();
    setIndex(index + 1);
    setStep('trace');
    setWordDone(false);
  };

  return (
    <div className="space-y-5">
      <StageHeader
        title="Tulis Ayat"
        description={targets.length < ctx.ayah.words.length
          ? 'Tulis kata kunci pembuka tiap bagian ayat: telusuri pola dulu, lalu tulis dari ingatan.'
          : 'Telusuri pola huruf dan harakat, lalu tulis kembali dari ingatan.'}
        round={index}
        rounds={targets.length}
        roundLabel="Kata"
        listenAyah={ctx.ayah}
      />

      <div className="rounded-2xl border border-[#BE9452]/40 bg-[#F8F6F1] dark:bg-[#152E38] p-4 text-center">
        <p className="text-xs text-[#246579] dark:text-[#A7CDD3]">
          {step === 'trace' ? 'Kata yang ditulis:' : 'Tulis dari ingatan kata ini:'} <span className="font-semibold">{word.transliteration}</span> · "{word.translation}"
        </p>
        {step === 'trace' && (
          <p dir="rtl" className="font-arabic mt-2 text-[#173B4E] dark:text-[#D3A253]" style={{ fontSize: arabicSize(fontSize, 1, 30) }}>{text}</p>
        )}
      </div>

      <div className="rounded-3xl border border-[#BE9452]/40 bg-white dark:bg-slate-800/80 p-4 sm:p-6">
        <div className="mb-3 text-xs font-semibold text-[#246579] dark:text-[#A7CDD3]">
          {step === 'trace' ? '1. Telusuri pola samar' : '2. Tulis sendiri tanpa pola'}
        </div>
        <div className="relative mx-auto w-full max-w-[640px] overflow-hidden rounded-2xl border-2 border-dashed border-[#BE9452]/60 bg-[#F8F6F1] dark:bg-[#152E38]">
          <canvas ref={canvas} width={WRITING_WIDTH} height={WRITING_HEIGHT} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
          <svg
            viewBox={`0 0 ${WRITING_WIDTH} ${WRITING_HEIGHT}`}
            className="block w-full select-none"
            style={{ aspectRatio: `${WRITING_WIDTH} / ${WRITING_HEIGHT}`, touchAction: wordDone || result?.isCorrect ? 'pan-y' : 'none', cursor: 'crosshair' }}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            aria-label={`Area tulis kata ${text}`}
          >
            <rect width={WRITING_WIDTH} height={WRITING_HEIGHT} fill="transparent" />
            {strokes.map((stroke) => stroke.points.length === 1
              ? <circle key={stroke.id} cx={stroke.points[0].x} cy={stroke.points[0].y} r={stroke.width / 2} fill="#173B4E" />
              : <path key={stroke.id} d={stroke.points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')} fill="none" stroke="#173B4E" strokeWidth={stroke.width} strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
        </div>

        {result && (
          <div role="status" className={`mx-auto mt-3 max-w-[640px] rounded-xl border p-3 text-sm ${result.isCorrect ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200' : 'border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200'}`}>
            <div className="flex items-center gap-2 font-semibold">
              {result.isCorrect ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              {result.isCorrect ? 'Bentuk tulisan sesuai' : 'Belum sesuai, coba perbaiki'} · Kemiripan {result.score}%
            </div>
            <p className="mt-1 text-xs">Penilaian bentuk ini perkiraan otomatis.</p>
          </div>
        )}

        {!(wordDone || (step === 'trace' && result?.isCorrect)) && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => { setStrokes((s) => s.slice(0, -1)); setResult(null); }} disabled={!strokes.length} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-[#246579] disabled:opacity-40 dark:border-slate-600 dark:text-[#A7CDD3]"><Undo2 className="h-4 w-4" /> Urungkan</button>
            <button type="button" onClick={() => { setStrokes([]); setResult(null); }} disabled={!strokes.length} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-[#246579] disabled:opacity-40 dark:border-slate-600 dark:text-[#A7CDD3]"><Eraser className="h-4 w-4" /> Hapus</button>
            <button type="button" onClick={check} disabled={!strokes.length} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-[#246579] px-4 text-xs font-semibold text-white disabled:opacity-40 hover:bg-[#174C60]">
              Periksa {step === 'trace' ? 'Pola' : 'Tulisan'} <PenLine className="h-4 w-4" />
            </button>
          </div>
        )}
        {step === 'trace' && result?.isCorrect && (
          <div className="mt-4 flex justify-center">
            <button type="button" onClick={nextStep} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-[#246579] px-4 text-xs font-semibold text-white hover:bg-[#174C60]">
              Lanjut: tulis dari ingatan <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {wordDone && (
        <RoundDone
          title={isLast ? 'Semua kata kunci sudah kamu tulis!' : 'Tulisanmu sesuai'}
          actionLabel={isLast ? 'Selesai' : 'Kata berikutnya'}
          onContinue={nextStep}
        />
      )}
    </div>
  );
};
