import React from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';
import type { IqroItem } from '../../data/iqroData';
import { assetUrl } from '../../utils/assetUrl';

export const IQRO1_BOOK_PAGE_COUNT = 31;

// The printed page is the lesson. These letters only provide optional audio
// support; they do not replace or rearrange any exercises in the source book.
const INTRODUCED_LETTERS: { arabic: string; latin: string }[][] = [
  [{ arabic: 'أ', latin: 'A' }, { arabic: 'ب', latin: 'BA' }],
  [{ arabic: 'ت', latin: 'TA' }],
  [{ arabic: 'ث', latin: 'TSA' }],
  [{ arabic: 'ج', latin: 'JA' }],
  [{ arabic: 'ح', latin: 'HA' }],
  [{ arabic: 'خ', latin: 'KHO' }],
  [{ arabic: 'د', latin: 'DA' }],
  [{ arabic: 'ذ', latin: 'DZA' }],
  [{ arabic: 'ر', latin: 'RO' }],
  [{ arabic: 'ز', latin: 'ZA' }],
  [{ arabic: 'س', latin: 'SA' }],
  [{ arabic: 'ش', latin: 'SYA' }],
  [{ arabic: 'ص', latin: 'SHO' }],
  [{ arabic: 'ض', latin: 'DHO' }],
  [{ arabic: 'ط', latin: 'THO' }],
  [{ arabic: 'ظ', latin: 'ZHO' }],
  [{ arabic: 'ع', latin: 'A' }],
  [{ arabic: 'غ', latin: 'GHO' }],
  [{ arabic: 'ف', latin: 'FA' }],
  [{ arabic: 'ق', latin: 'QO' }],
  [{ arabic: 'ك', latin: 'KA' }],
  [{ arabic: 'ل', latin: 'LA' }],
  [{ arabic: 'م', latin: 'MA' }],
  [{ arabic: 'ن', latin: 'NA' }],
  [{ arabic: 'و', latin: 'WA' }],
  [{ arabic: 'ه', latin: 'HA' }],
  [{ arabic: 'ي', latin: 'YA' }],
];

interface Iqro1BookPageProps {
  pageNumber: number;
  completed: boolean;
  showLatin: boolean;
  playingItemId: string | null;
  onPlay: (item: IqroItem) => void;
  onToggleCompleted: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

export const Iqro1BookPage: React.FC<Iqro1BookPageProps> = ({
  pageNumber, completed, showLatin, playingItemId, onPlay,
  onToggleCompleted, onPrevious, onNext,
}) => {
  const letters = INTRODUCED_LETTERS.slice(0, Math.min(pageNumber, INTRODUCED_LETTERS.length)).flat();
  const pageImageUrl = assetUrl(`/iqro/book-1/page-${String(pageNumber).padStart(2, '0')}.webp`);

  return (
    <section className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700 p-4 sm:p-7 shadow-xs space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#52796F] dark:text-[#A8D5BA]">
            Iqro 1 · Halaman {pageNumber} dari {IQRO1_BOOK_PAGE_COUNT}
          </span>
          <h3 className="text-lg font-bold text-[#1D3557] dark:text-white">Latihan sesuai buku</h3>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onPrevious} disabled={pageNumber === 1} aria-label="Halaman sebelumnya" className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 text-slate-600 dark:text-slate-300 cursor-pointer">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-[#1D3557] dark:text-[#E9C46A]">{pageNumber} / {IQRO1_BOOK_PAGE_COUNT}</span>
          <button type="button" onClick={onNext} className="px-3 py-2 rounded-xl bg-[#52796F] hover:bg-[#354F52] text-white text-xs font-bold flex items-center gap-1 cursor-pointer">
            {pageNumber === IQRO1_BOOK_PAGE_COUNT ? 'Selesai' : 'Lanjut'} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white" role="group" aria-label={`Lembar latihan Iqro 1 halaman ${pageNumber}`}>
        <img
          src={pageImageUrl}
          alt={`Seluruh isi latihan Iqro 1 halaman ${pageNumber}, sesuai urutan dalam buku`}
          className="block w-full min-w-[340px] max-w-[850px] h-auto mx-auto"
          loading={pageNumber === 1 ? 'eager' : 'lazy'}
        />
      </div>
      <a href={pageImageUrl} target="_blank" rel="noopener noreferrer" className="block text-center text-xs font-semibold text-[#52796F] dark:text-[#A8D5BA] underline">
        Buka halaman ukuran penuh
      </a>

      <div className="flex justify-end">
        <button type="button" onClick={onToggleCompleted} aria-pressed={completed} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold cursor-pointer ${completed ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' : 'bg-[#EAF2ED] dark:bg-slate-700 text-[#52796F] dark:text-[#A8D5BA]'}`}>
          <CheckCircle2 className="w-4 h-4" /> {completed ? 'Halaman selesai · batalkan' : 'Tandai halaman selesai'}
        </button>
      </div>

      <details className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-[#1D3557] dark:text-slate-200">
        <summary className="cursor-pointer text-xs font-bold">Dengarkan contoh suara huruf yang sudah dipelajari</summary>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Ketuk huruf untuk mendengar lafalnya. Baca seluruh latihan pada halaman buku dari kanan ke kiri.</p>
        <div className="mt-3 flex flex-wrap gap-2" dir="rtl">
          {letters.map((letter) => {
            const item: IqroItem = { id: letter.arabic, arabic: `${letter.arabic}َ`, latin: letter.latin };
            const active = playingItemId === `book_${item.id}`;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onPlay(item)}
                aria-label={`Dengarkan ${letter.latin}`}
                className={`min-w-16 rounded-xl border p-2 flex flex-col items-center gap-1 cursor-pointer ${active ? 'bg-[#E9C46A] border-[#C5A059]' : 'bg-[#FDFBF7] dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}
              >
                <span className="font-arabic text-3xl">{item.arabic}</span>
                {showLatin && <span className="text-[10px] font-bold" dir="ltr">{letter.latin}</span>}
                <Volume2 className="w-3 h-3 text-[#52796F]" />
              </button>
            );
          })}
        </div>
      </details>
    </section>
  );
};
