import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Eraser, PenLine, RotateCcw, Undo2, Volume2 } from 'lucide-react';
import { useQuranGame } from '../../context/QuranGameContext';

type Point = { x: number; y: number };
type Stroke = { id: number; points: Point[]; width: number };
type Step = 'trace' | 'write' | 'review' | 'complete';

const WIDTH = 640;
const HEIGHT = 320;

export const WriteAyahGame: React.FC = () => {
  const { activeSurah, selectedAyah, setSelectedAyah, playMurottal, fontSize } = useQuranGame();
  const [wordIndex, setWordIndex] = useState(0);
  const [step, setStep] = useState<Step>('trace');
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [showPattern, setShowPattern] = useState(false);
  const strokeNumber = useRef(0);
  const activePointer = useRef<number | null>(null);
  const activeStroke = useRef<number | null>(null);

  useEffect(() => {
    setWordIndex(0);
    setStep('trace');
    setStrokes([]);
    setShowPattern(false);
    activePointer.current = null;
    activeStroke.current = null;
  }, [selectedAyah.id]);

  const word = selectedAyah.words[wordIndex];
  const letters = word?.arabic.replace(/[\u064B-\u065F\u0670]/g, '') ?? '';
  const patternSize = Math.min(92, Math.floor(560 / Math.max(5, letters.length * 0.85)));
  const patternVisible = step === 'trace' || (step === 'review' && showPattern);

  const pointFromEvent = (event: React.PointerEvent<SVGSVGElement>): Point => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(WIDTH, (event.clientX - bounds.left) * WIDTH / bounds.width)),
      y: Math.max(0, Math.min(HEIGHT, (event.clientY - bounds.top) * HEIGHT / bounds.height))
    };
  };

  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    if (step === 'review' || step === 'complete' || activePointer.current !== null) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    activePointer.current = event.pointerId;
    const id = ++strokeNumber.current;
    activeStroke.current = id;
    const point = pointFromEvent(event);
    const width = event.pointerType === 'touch' ? 9 : 6;
    setStrokes((previous) => [...previous, {
      id,
      points: [point],
      width
    }]);
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (activePointer.current !== event.pointerId || activeStroke.current === null) return;
    const point = pointFromEvent(event);
    const id = activeStroke.current;
    setStrokes((previous) => previous.map((stroke) => stroke.id === id
      ? { ...stroke, points: [...stroke.points, point] }
      : stroke));
  };

  const handlePointerEnd = (event: React.PointerEvent<SVGSVGElement>) => {
    if (activePointer.current !== event.pointerId) return;
    handlePointerMove(event);
    activePointer.current = null;
    activeStroke.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const nextStep = () => {
    setShowPattern(false);
    if (step === 'trace') {
      setStrokes([]);
      setStep('write');
    } else if (step === 'write') {
      setStep('review');
    } else if (wordIndex + 1 < selectedAyah.words.length) {
      setStrokes([]);
      setWordIndex(wordIndex + 1);
      setStep('trace');
    } else {
      setStrokes([]);
      setStep('complete');
    }
  };

  const repeatWord = () => {
    setStrokes([]);
    setShowPattern(false);
    setStep('trace');
  };

  const nextAyah = () => {
    const index = activeSurah.ayahs.findIndex((ayah) => ayah.id === selectedAyah.id);
    const next = activeSurah.ayahs[(index + 1) % activeSurah.ayahs.length];
    setSelectedAyah(next);
    if (next.id === selectedAyah.id) repeatWord();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60 p-4">
        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#84A98C]">Game 7 · Tulis Ayat</span>
          <p className="mt-1 text-xs text-[#52796F] dark:text-[#CBD5E1]">
            Telusuri bentuk huruf dan harakat dari kanan ke kiri, lalu tulis kembali tanpa pola.
          </p>
        </div>
        <button type="button" onClick={() => playMurottal(selectedAyah)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#52796F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#354F52]">
          <Volume2 className="h-4 w-4" /> Dengarkan Ayat
        </button>
      </div>

      <div className="rounded-2xl border border-[#C5A059]/40 bg-[#FDFBF7] p-4 text-center dark:bg-[#16272B]">
        <p className="text-xs font-semibold text-[#52796F] dark:text-[#A8D5BA]">QS. {activeSurah.nameLatin} · Ayat {selectedAyah.ayahNumber}</p>
        <div dir="rtl" className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 leading-loose">
          {selectedAyah.words.map((part, index) => (
            <span key={part.id} className={`font-arabic ${step !== 'complete' && index === wordIndex ? 'text-[#2A9D8F] underline decoration-[#E9C46A] underline-offset-8' : 'text-[#1D3557] dark:text-[#E9C46A]'}`} style={{ fontSize: `${Math.min(fontSize, 40)}px` }}>
              {part.arabic}
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs text-[#52796F] dark:text-[#CBD5E1]">{selectedAyah.translationId}</p>
      </div>

      {step === 'complete' ? (
        <div className="rounded-3xl border border-[#84A98C] bg-[#D8EADB] p-7 text-center dark:bg-[#133230]">
          <CheckCircle2 className="mx-auto h-9 w-9 text-[#52796F] dark:text-[#84A98C]" />
          <h3 className="mt-3 font-semibold text-[#1D3557] dark:text-white">Semua kata telah kamu latih</h3>
          <p className="mt-2 text-xs text-[#52796F] dark:text-[#CBD5E1]">Cocokkan tulisanmu sendiri dengan ayat di atas. Latihan ini belum menilai ketepatan tulisan secara otomatis.</p>
          <button type="button" onClick={nextAyah} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#52796F] px-5 py-2 text-xs font-semibold text-white hover:bg-[#354F52]">
            {selectedAyah.id === activeSurah.ayahs[activeSurah.ayahs.length - 1].id ? 'Ulangi dari Ayat 1' : 'Lanjut ke Ayat Berikutnya'} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="rounded-3xl border border-[#C5A059]/40 bg-white p-4 sm:p-6 dark:bg-slate-800/80">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#52796F] dark:text-[#A8D5BA]">
            <span className="font-semibold">Kata {wordIndex + 1} dari {selectedAyah.words.length} · {step === 'trace' ? '1. Telusuri pola' : step === 'write' ? '2. Tulis sendiri' : '3. Bandingkan hasil'}</span>
            <span>{word?.transliteration}</span>
          </div>

          <div className="mx-auto w-full max-w-[640px] overflow-hidden rounded-2xl border-2 border-dashed border-[#C5A059]/60 bg-[#FDFBF7] dark:bg-[#16272B]">
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              className="block w-full select-none"
              style={{ aspectRatio: `${WIDTH} / ${HEIGHT}`, touchAction: 'none', cursor: step === 'review' ? 'default' : 'crosshair' }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
              onLostPointerCapture={() => { activePointer.current = null; activeStroke.current = null; }}
              aria-label={`Area tulis kata ${word?.arabic ?? ''}`}
            >
              <rect width={WIDTH} height={HEIGHT} fill="transparent" />
              {patternVisible && <text x={WIDTH / 2} y={HEIGHT / 2} textAnchor="middle" dominantBaseline="middle" direction="rtl" fill="#52796F" fillOpacity="0.35" fontFamily="Amiri, Scheherazade New, serif" fontSize={patternSize} pointerEvents="none">{word?.arabic}</text>}
              {strokes.map((stroke) => stroke.points.length === 1
                ? <circle key={stroke.id} cx={stroke.points[0].x} cy={stroke.points[0].y} r={stroke.width / 2} fill="#1D3557" pointerEvents="none" />
                : <path key={stroke.id} d={stroke.points.map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ')} fill="none" stroke="#1D3557" strokeWidth={stroke.width} strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" />
              )}
            </svg>
          </div>

          <p className="mt-3 text-center text-xs text-[#52796F] dark:text-[#CBD5E1]">
            {step === 'trace' ? 'Ikuti huruf dan harakat berwarna samar dengan jari, stylus, atau mouse.' : step === 'write' ? 'Tulis kata yang sama dari ingatanmu di bidang kosong.' : 'Tampilkan pola untuk membandingkan tulisanmu, lalu tentukan apakah perlu mengulang.'}
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {step !== 'review' && (
              <>
                <button type="button" onClick={() => setStrokes((previous) => previous.slice(0, -1))} disabled={!strokes.length} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-[#52796F] disabled:opacity-40 dark:border-slate-600 dark:text-[#A8D5BA]"><Undo2 className="h-4 w-4" /> Urungkan</button>
                <button type="button" onClick={() => setStrokes([])} disabled={!strokes.length} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-[#52796F] disabled:opacity-40 dark:border-slate-600 dark:text-[#A8D5BA]"><Eraser className="h-4 w-4" /> Hapus</button>
                <button type="button" onClick={nextStep} disabled={!strokes.length} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-[#52796F] px-4 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-[#354F52]">
                  {step === 'trace' ? 'Lanjut: Tulis sendiri' : 'Bandingkan tulisan'} <ArrowRight className="h-4 w-4" />
                </button>
              </>
            )}
            {step === 'review' && (
              <>
                <button type="button" onClick={() => setShowPattern((value) => !value)} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-[#84A98C] px-4 text-xs font-semibold text-[#52796F] dark:text-[#A8D5BA]">
                  <PenLine className="h-4 w-4" /> {showPattern ? 'Sembunyikan Pola' : 'Tampilkan Pola'}
                </button>
                <button type="button" onClick={repeatWord} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-[#C5A059] px-4 text-xs font-semibold text-[#52796F] dark:text-[#A8D5BA]"><RotateCcw className="h-4 w-4" /> Ulangi Kata</button>
                <button type="button" onClick={nextStep} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-[#52796F] px-4 text-xs font-semibold text-white hover:bg-[#354F52]">
                  {wordIndex + 1 === selectedAyah.words.length ? 'Selesai' : 'Lanjut ke Kata Berikutnya'} <ArrowRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
