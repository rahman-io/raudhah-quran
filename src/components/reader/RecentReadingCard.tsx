import React, { useEffect, useState } from 'react';
import { BookMarked, Clock, Play } from 'lucide-react';
import { clearRecentReadings, getRecentReadings, subscribeRecentReadings, timeAgo, type RecentReading } from './recentReading';

/** Kartu "Terakhir Dibaca" di atas Daftar Surah: lanjutkan dari ayat terakhir. */
export const RecentReadingCard: React.FC<{ onOpen: (surah: number, ayah: number) => void }> = ({ onOpen }) => {
  const [items, setItems] = useState<RecentReading[]>(getRecentReadings);
  const [now, setNow] = useState(Date.now());

  useEffect(() => subscribeRecentReadings(() => setItems(getRecentReadings())), []);
  // Perbarui keterangan waktu ("5 menit lalu") setiap menit.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (items.length === 0) return null;
  const [last, ...others] = items;
  const progress = Math.round((last.ayah / Math.max(1, last.totalAyahs)) * 100);

  return (
    <section aria-label="Terakhir dibaca" className="bg-white dark:bg-slate-800/80 rounded-3xl border border-[#D3A253]/40 shadow-xs p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-sm font-bold text-[#173B4E] dark:text-white">
          <BookMarked className="w-4 h-4 text-[#D3A253]" />
          Terakhir Dibaca
        </h2>
        <button
          type="button"
          onClick={clearRecentReadings}
          className="text-[11px] font-medium text-slate-400 hover:text-[#246579] dark:hover:text-[#A7CDD3]"
        >
          Hapus riwayat
        </button>
      </div>

      <button
        type="button"
        onClick={() => onOpen(last.number, last.ayah)}
        className="w-full text-left rounded-2xl bg-gradient-to-br from-[#246579] to-[#174C60] text-white p-3.5 sm:p-4 flex items-center gap-3 sm:gap-4 hover:brightness-110 transition"
      >
        <span className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-2xl bg-white/15 flex items-center justify-center text-sm font-bold">
          {last.number}
        </span>
        <span className="flex-1 min-w-0 space-y-1">
          <span className="block text-base font-bold truncate">{last.nameLatin}</span>
          <span className="flex items-center gap-1.5 text-[11px] text-white/75 whitespace-nowrap min-w-0">
            <span>Ayat {last.ayah}/{last.totalAyahs}</span>
            <span aria-hidden="true">·</span>
            <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{timeAgo(last.at, now)}</span>
          </span>
          <span className="block h-1.5 rounded-full bg-white/20 overflow-hidden" aria-hidden="true">
            <span className="block h-full rounded-full bg-[#D3A253]" style={{ width: `${progress}%` }} />
          </span>
        </span>
        <span className="shrink-0 inline-flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-xl bg-[#D3A253] text-[#173B4E] text-[11px] sm:text-xs font-bold">
          <Play className="w-3.5 h-3.5" />
          Lanjutkan
        </span>
      </button>

      {others.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-[#477F8D] dark:text-[#94A3B8]">Baru dibuka</p>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none]">
            {others.map((item) => (
              <button
                key={item.number}
                type="button"
                onClick={() => onOpen(item.number, item.ayah)}
                className="shrink-0 flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-600 bg-[#F8F6F1] dark:bg-slate-900/40 hover:border-[#477F8D]/60 transition-colors"
                title={`${item.nameLatin}, ayat ${item.ayah} · ${timeAgo(item.at, now)}`}
              >
                <span className="w-6 h-6 rounded-full bg-[#246579]/10 dark:bg-[#246579]/30 text-[#246579] dark:text-[#A7CDD3] flex items-center justify-center text-[10px] font-bold">
                  {item.number}
                </span>
                <span className="text-xs font-semibold text-[#173B4E] dark:text-white">{item.nameLatin}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">ayat {item.ayah}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
