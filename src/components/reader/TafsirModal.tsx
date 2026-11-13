import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Check, ChevronLeft, ChevronRight, Copy, Loader2, ScrollText, X } from 'lucide-react';
import { loadKemenagTafsir, type AyahTafsir } from '../../services/quranReaderData';
import { useBackHandler } from '../../utils/backNavigation';

interface Props {
  surahNumber: number;
  surahName: string;
  totalAyahs: number;
  ayahNumber: number;
  /** Teks Arab ayat yang sedang dibuka, dan apakah memakai teks Kemenag (font LPMQ). */
  arabic: string;
  msi: boolean;
  textSize: number;
  arabicSize: number;
  onChangeAyah: (ayahNumber: number) => void;
  onClose: () => void;
}

const Paragraphs: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split(/\n+/).filter((p) => p.trim()).map((p, i) => (
      <p key={i} className="mt-2 first:mt-0">{p}</p>
    ))}
  </>
);

/** Jendela Tafsir Kemenag per ayat: Tafsir Ringkas (Wajiz) dan Tafsir Tahlili. */
export const TafsirModal: React.FC<Props> = ({
  surahNumber, surahName, totalAyahs, ayahNumber, arabic, msi, textSize, arabicSize, onChangeAyah, onClose
}) => {
  const [tafsir, setTafsir] = useState<Map<number, AyahTafsir> | null | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useBackHandler(true, onClose, 10);

  useEffect(() => {
    let cancelled = false;
    setTafsir(undefined);
    loadKemenagTafsir(surahNumber).then((data) => {
      if (!cancelled) setTafsir(data);
    });
    return () => {
      cancelled = true;
    };
  }, [surahNumber]);

  // Pindah ayat: mulai baca dari atas.
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
    setCopied(false);
  }, [ayahNumber]);

  // Kunci gulir halaman di belakang jendela; Esc untuk menutup.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const current = tafsir?.get(ayahNumber);
  const title = `Tafsir ${surahName} Ayat ${ayahNumber}`;

  const copy = async () => {
    if (!current) return;
    const text = [
      title,
      '',
      'Tafsir Ringkas Kemenag',
      current.ringkas,
      '',
      'Tafsir Tahlili',
      current.tahlili,
      '',
      'Sumber: Tafsir Kemenag (quran.kemenag.go.id)'
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <motion.div
        className="absolute inset-0 bg-[#0B1F27]/55 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative w-full sm:max-w-2xl max-h-[88vh] sm:max-h-[85vh] flex flex-col bg-white dark:bg-[#152E38] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Kepala */}
        <div className="flex items-center gap-3 px-5 sm:px-6 pt-4 pb-3 border-b border-slate-100 dark:border-slate-700">
          <span className="w-9 h-9 shrink-0 rounded-xl bg-[#246579]/10 text-[#246579] dark:text-[#A7CDD3] flex items-center justify-center">
            <ScrollText className="w-5 h-5" />
          </span>
          <h2 className="flex-1 min-w-0 text-base sm:text-lg font-bold text-[#173B4E] dark:text-white truncate">{title}</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Tutup tafsir">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Isi */}
        <div ref={bodyRef} className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-6 py-5 space-y-5">
          <p dir="rtl" className={`text-right leading-[2.1] text-[#173B4E] dark:text-[#F1F5F9] ${msi ? 'font-mushaf-id' : 'font-arabic'}`} style={{ fontSize: Math.max(22, Math.round(arabicSize * 0.8)) }}>
            {arabic}
          </p>

          {tafsir === undefined ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-[#246579] dark:text-[#A7CDD3]">
              <Loader2 className="w-5 h-5 animate-spin" /> Memuat tafsir…
            </div>
          ) : !current ? (
            <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              Tafsir untuk ayat ini belum tersedia. Periksa koneksi internet, lalu coba lagi.
            </div>
          ) : (
            <div className="space-y-5 text-[#293640] dark:text-[#CBD5E1] leading-relaxed" style={{ fontSize: textSize }}>
              <section>
                <h3 className="mb-2 text-[0.95em] font-bold text-[#173B4E] dark:text-white">Tafsir Ringkas Kemenag</h3>
                <Paragraphs text={current.ringkas || '—'} />
              </section>
              {current.tahlili && (
                <section className="pt-4 border-t border-slate-100 dark:border-slate-700">
                  <h3 className="mb-2 text-[0.95em] font-bold text-[#173B4E] dark:text-white">Tafsir Tahlili</h3>
                  <Paragraphs text={current.tahlili} />
                </section>
              )}
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Sumber: Tafsir Kemenag (quran.kemenag.go.id)</p>
            </div>
          )}
        </div>

        {/* Kaki */}
        <div className="flex items-center gap-2 px-4 sm:px-6 py-3 border-t border-slate-100 dark:border-slate-700 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => onChangeAyah(ayahNumber - 1)}
            disabled={ayahNumber <= 1}
            className="h-10 px-2.5 flex items-center gap-0.5 rounded-xl text-xs font-semibold text-[#246579] dark:text-[#A7CDD3] hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30"
            aria-label="Tafsir ayat sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" /><span className="hidden sm:inline">Ayat {ayahNumber - 1 || ''}</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeAyah(ayahNumber + 1)}
            disabled={ayahNumber >= totalAyahs}
            className="h-10 px-2.5 flex items-center gap-0.5 rounded-xl text-xs font-semibold text-[#246579] dark:text-[#A7CDD3] hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30"
            aria-label="Tafsir ayat berikutnya"
          >
            <span className="hidden sm:inline">Ayat {ayahNumber < totalAyahs ? ayahNumber + 1 : ''}</span><ChevronRight className="w-4 h-4" />
          </button>
          <span className="flex-1" />
          <button type="button" onClick={onClose} className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-semibold text-[#293640] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
            Tutup
          </button>
          <button
            type="button"
            onClick={copy}
            disabled={!current}
            className="h-10 px-4 flex items-center gap-1.5 rounded-xl bg-[#246579] hover:bg-[#174C60] text-white text-xs font-semibold disabled:opacity-40"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Tersalin' : 'Salin Tafsir'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
