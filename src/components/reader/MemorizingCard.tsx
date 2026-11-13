import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { BadgeCheck, BookOpen, ChevronRight, GraduationCap, Search, Sprout, X } from 'lucide-react';
import { getHafalanActivityBySurah, STAGES } from '../hafalan/hafalanPlan';
import { useBackHandler } from '../../utils/backNavigation';

/** Minimal ayat yang sudah dilatih/dihafal agar surah masuk daftar "Sedang Dihafal". */
const MIN_AYAHS = 3;
/** Kotak cari di jendela "Lihat Semua" muncul bila daftarnya lebih dari ini. */
const SEARCH_FROM = 5;
/** Surah sampai sepanjang ini ditampilkan sebagai peta titik per ayat. */
const DOT_MAP_MAX = 60;

interface SurahMeta {
  number: number;
  nameLatin: string;
  nameArabic: string;
  numberOfAyahs: number;
}

interface MemorizingSurah extends SurahMeta {
  memorized: Set<number>;
  practising: Map<number, number>; // ayat yang sedang dilatih (belum hafal) → jumlah game
  nextAyah: number;
  lastAt: number;
}

/** Cincin progres: hijau tua = hafal, emas = sedang dilatih. */
const ProgressRing: React.FC<{ memorized: number; practising: number; total: number }> = ({ memorized, practising, total }) => {
  const r = 22;
  const c = 2 * Math.PI * r;
  const done = memorized / total;
  const doing = practising / total;
  const percent = Math.round(done * 100);
  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg viewBox="0 0 52 52" className="w-full h-full -rotate-90" aria-hidden="true">
        <circle cx="26" cy="26" r={r} fill="none" strokeWidth="5" className="stroke-[#EFE7DA] dark:stroke-slate-700" />
        {done + doing > 0 && (
          <circle
            cx="26" cy="26" r={r} fill="none" strokeWidth="5" strokeLinecap="round"
            stroke="#D3A253" strokeDasharray={`${c * (done + doing)} ${c}`}
          />
        )}
        {done > 0 && (
          <circle
            cx="26" cy="26" r={r} fill="none" strokeWidth="5" strokeLinecap="round"
            stroke="#246579" strokeDasharray={`${c * done} ${c}`}
            className="dark:stroke-[#5FA8B8]"
          />
        )}
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-[#173B4E] dark:text-white">
        {percent}%
      </span>
    </div>
  );
};

/** Peta ayat: satu titik per ayat (surah pendek) atau batang dua warna (surah panjang). */
const AyahMap: React.FC<{ item: MemorizingSurah }> = ({ item }) => {
  if (item.numberOfAyahs <= DOT_MAP_MAX) {
    return (
      <div className="flex flex-wrap gap-[3px]" aria-hidden="true">
        {Array.from({ length: item.numberOfAyahs }, (_, i) => {
          const ayah = i + 1;
          const color = item.memorized.has(ayah)
            ? 'bg-[#246579] dark:bg-[#5FA8B8]'
            : item.practising.has(ayah)
              ? 'bg-[#D3A253]'
              : 'bg-[#E8E1D6] dark:bg-slate-700';
          return <span key={ayah} className={`w-2 h-2 rounded-[3px] ${color} ${ayah === item.nextAyah ? 'ring-2 ring-[#D3A253]/50' : ''}`} />;
        })}
      </div>
    );
  }
  const done = (item.memorized.size / item.numberOfAyahs) * 100;
  const doing = (item.practising.size / item.numberOfAyahs) * 100;
  return (
    <div className="h-2 rounded-full bg-[#E8E1D6] dark:bg-slate-700 overflow-hidden flex" aria-hidden="true">
      <span className="h-full bg-[#246579] dark:bg-[#5FA8B8]" style={{ width: `${done}%` }} />
      <span className="h-full bg-[#D3A253]" style={{ width: `${doing}%` }} />
    </div>
  );
};

/** Satu surah yang sedang dihafal: cincin progres, peta ayat, dan tombol lanjut. */
const ProgressItem: React.FC<{ item: MemorizingSurah; onContinue: (surah: number, ayah: number) => void }> = ({ item, onContinue }) => {
  const remaining = item.numberOfAyahs - item.memorized.size;
  const gamesHere = item.practising.get(item.nextAyah);
  return (
    <li className="rounded-2xl bg-white/80 dark:bg-slate-900/40 border border-white dark:border-slate-700 shadow-[0_2px_10px_rgba(23,59,78,0.05)] p-3 sm:p-3.5">
      <div className="flex items-center gap-3">
        <ProgressRing memorized={item.memorized.size} practising={item.practising.size} total={item.numberOfAyahs} />
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-bold text-[#173B4E] dark:text-white truncate">
              <span className="text-[#477F8D] font-semibold mr-1">{item.number}.</span>{item.nameLatin}
            </span>
            <span className="font-arabic text-base text-[#246579] dark:text-[#A7CDD3] shrink-0" dir="rtl">{item.nameArabic}</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300">
            <b className="text-[#246579] dark:text-[#5FA8B8]">{item.memorized.size}</b> hafal
            <span className="mx-1 text-slate-300">·</span>
            <b className="text-[#B07D2A] dark:text-[#E9CF99]">{item.practising.size}</b> dilatih
            <span className="mx-1 text-slate-300">·</span>
            {item.numberOfAyahs} ayat
          </p>
          <AyahMap item={item} />
        </div>
      </div>
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <p className="text-[11px] text-[#8A6420] dark:text-[#E9CF99] truncate">
          {remaining <= 5
            ? `Sedikit lagi! ${remaining} ayat menuju hafal ${item.nameLatin}`
            : gamesHere
              ? `Ayat ${item.nextAyah}: ${gamesHere}/${STAGES.length} game selesai`
              : `Berikutnya: ayat ${item.nextAyah}`}
        </p>
        <button
          type="button"
          onClick={() => onContinue(item.number, item.nextAyah)}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#246579] hover:bg-[#174C60] text-white text-[11px] font-semibold shadow-xs"
        >
          <GraduationCap className="w-3.5 h-3.5" />
          Lanjut ayat {item.nextAyah}
        </button>
      </div>
    </li>
  );
};

/** Satu surah yang sudah hafal 100%, dengan tombol untuk murajaah (membuka surahnya). */
const DoneItem: React.FC<{ item: MemorizingSurah; onOpen: (surah: number) => void }> = ({ item, onOpen }) => (
  <li className="flex items-center gap-3 rounded-2xl bg-white/80 dark:bg-slate-900/40 border border-[#246579]/15 dark:border-slate-700 p-3">
    <span className="w-11 h-11 shrink-0 rounded-2xl bg-[#246579] text-white flex flex-col items-center justify-center leading-none">
      <BadgeCheck className="w-4 h-4" />
      <span className="mt-0.5 text-[10px] font-bold">{item.number}</span>
    </span>
    <div className="flex-1 min-w-0">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-bold text-[#173B4E] dark:text-white truncate">{item.nameLatin}</span>
        <span className="font-arabic text-base text-[#246579] dark:text-[#A7CDD3] shrink-0" dir="rtl">{item.nameArabic}</span>
      </div>
      <p className="text-[11px] text-slate-600 dark:text-slate-300">{item.numberOfAyahs} ayat · hafal 100%</p>
    </div>
    <button
      type="button"
      onClick={() => onOpen(item.number)}
      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#246579]/30 text-[#246579] dark:text-[#A7CDD3] hover:bg-[#246579]/5 text-[11px] font-semibold"
    >
      <BookOpen className="w-3.5 h-3.5" />
      Murajaah
    </button>
  </li>
);

const plainName = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '');

type Tab = 'active' | 'done';

/** Jendela "Lihat Semua": semua surah yang sedang dihafal dan yang sudah hafal. */
const HafalanSheet: React.FC<{
  active: MemorizingSurah[];
  done: MemorizingSurah[];
  initialTab: Tab;
  onContinue: (surah: number, ayah: number) => void;
  onOpen: (surah: number) => void;
  onClose: () => void;
}> = ({ active, done, initialTab, onContinue, onOpen, onClose }) => {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [query, setQuery] = useState('');

  useBackHandler(true, onClose, 10);

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

  const list = tab === 'active' ? active : done;
  const q = plainName(query);
  const shown = q ? list.filter((item) => String(item.number) === q || plainName(item.nameLatin).includes(q)) : list;

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'active', label: 'Sedang Dihafal', count: active.length },
    { id: 'done', label: 'Sudah Hafal', count: done.length }
  ];

  // Dirender di <body> agar tidak terpotong oleh kartu (overflow-hidden).
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-6" role="dialog" aria-modal="true" aria-label="Hafalan saya">
      <motion.div className="absolute inset-0 bg-[#0B1F27]/55 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative w-full sm:max-w-xl h-[85vh] sm:h-auto sm:max-h-[85vh] flex flex-col bg-[#FBF8F2] dark:bg-[#152E38] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="px-5 pt-4 pb-3 space-y-3 border-b border-[#D3A253]/25 dark:border-slate-700 bg-gradient-to-br from-[#FFF8EC] to-[#F3F8F8] dark:from-[#2A2416] dark:to-[#152E38]">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 shrink-0 rounded-xl bg-[#246579] text-white flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </span>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-[#173B4E] dark:text-white">Hafalan Saya</h2>
              <p className="text-[11px] text-[#477F8D] dark:text-[#94A3B8]">{active.length} sedang dihafal · {done.length} sudah hafal</p>
            </div>
            <button type="button" onClick={onClose} className="p-2 rounded-xl text-slate-500 hover:bg-white/70 dark:hover:bg-slate-700" aria-label="Tutup">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-[#246579]/[0.07] dark:bg-slate-900/40" role="tablist">
            {tabs.map(({ id, label, count }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => {
                  setTab(id);
                  setQuery('');
                }}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  tab === id ? 'bg-white dark:bg-[#246579] text-[#173B4E] dark:text-white shadow-xs' : 'text-[#477F8D] dark:text-[#94A3B8]'
                }`}
              >
                {label}
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${tab === id ? 'bg-[#D3A253]/20 text-[#8A6420] dark:text-[#E9CF99]' : 'bg-white/60 dark:bg-slate-800'}`}>{count}</span>
              </button>
            ))}
          </div>

          {list.length > SEARCH_FROM && (
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900/50 border border-[#246579]/15 dark:border-slate-700">
              <Search className="w-4 h-4 text-[#477F8D] shrink-0" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari nama atau nomor surah"
                aria-label="Cari surah di hafalan"
                className="flex-1 min-w-0 bg-transparent text-base sm:text-sm text-[#173B4E] dark:text-white placeholder:text-slate-400 outline-none"
              />
            </label>
          )}
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-5 py-4">
          {shown.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
              {q
                ? 'Tidak ada surah yang cocok.'
                : tab === 'done'
                  ? 'Belum ada surah yang hafal 100%. Terus semangat, sedikit demi sedikit!'
                  : 'Belum ada surah yang sedang dihafal.'}
            </p>
          ) : (
            <ul className="space-y-2.5">
              {shown.map((item) =>
                tab === 'active' ? (
                  <ProgressItem key={item.number} item={item} onContinue={onContinue} />
                ) : (
                  <DoneItem key={item.number} item={item} onOpen={onOpen} />
                )
              )}
            </ul>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

/**
 * Kartu "Sedang Dihafal": surah yang minimal 3 ayatnya sudah dilatih atau dihafal,
 * tetapi belum hafal seluruhnya. Kartu hanya menampilkan surah yang terakhir dilatih;
 * semua surah (termasuk yang sudah hafal 100%) ada di jendela "Lihat Semua".
 */
export const MemorizingCard: React.FC<{
  surahs: SurahMeta[];
  memorizedAyahIds: string[];
  onContinue: (surah: number, ayah: number) => void;
  /** Buka surah untuk murajaah (surah yang sudah hafal). */
  onOpen: (surah: number) => void;
}> = ({ surahs, memorizedAyahIds, onContinue, onOpen }) => {
  const [sheetTab, setSheetTab] = useState<Tab | null>(null);

  const { active, done } = useMemo(() => {
    const activity = getHafalanActivityBySurah();
    const memorizedBySurah = new Map<number, Set<number>>();
    memorizedAyahIds.forEach((id) => {
      const [surah, ayah] = id.split(':').map(Number);
      if (!Number.isInteger(surah) || !Number.isInteger(ayah)) return;
      if (!memorizedBySurah.has(surah)) memorizedBySurah.set(surah, new Set());
      memorizedBySurah.get(surah)!.add(ayah);
    });

    const active: MemorizingSurah[] = [];
    const done: MemorizingSurah[] = [];
    surahs.forEach((meta) => {
      const memorized = new Set([...(memorizedBySurah.get(meta.number) ?? [])].filter((a) => a <= meta.numberOfAyahs));
      const lastAt = activity.get(meta.number)?.lastAt ?? 0;
      if (memorized.size >= meta.numberOfAyahs) {
        done.push({ ...meta, memorized, practising: new Map(), nextAyah: 1, lastAt });
        return;
      }
      const practising = new Map(
        [...(activity.get(meta.number)?.ayahs ?? new Map<number, number>())].filter(([ayah]) => !memorized.has(ayah) && ayah <= meta.numberOfAyahs)
      );
      if (memorized.size + practising.size < MIN_AYAHS) return;
      // Lanjutkan ayat yang sedang dilatih; bila tidak ada, ayat pertama yang belum hafal.
      const nextAyah = practising.size
        ? Math.min(...practising.keys())
        : Array.from({ length: meta.numberOfAyahs }, (_, i) => i + 1).find((a) => !memorized.has(a)) ?? 1;
      active.push({ ...meta, memorized, practising, nextAyah, lastAt });
    });
    const byRecent = (a: MemorizingSurah, b: MemorizingSurah) => b.lastAt - a.lastAt || a.number - b.number;
    return { active: active.sort(byRecent), done: done.sort(byRecent) };
  }, [surahs, memorizedAyahIds]);

  if (active.length === 0 && done.length === 0) return null;
  const [current, ...others] = active;

  const closeSheet = () => setSheetTab(null);
  const continueFromSheet = (surah: number, ayah: number) => {
    closeSheet();
    onContinue(surah, ayah);
  };
  const openFromSheet = (surah: number) => {
    closeSheet();
    onOpen(surah);
  };

  return (
    <section
      aria-label="Sedang dihafal"
      className="relative overflow-hidden rounded-3xl border border-[#D3A253]/45 bg-gradient-to-br from-[#FFF8EC] via-white to-[#F3F8F8] dark:from-[#2A2416] dark:via-slate-800/80 dark:to-[#152E38] shadow-xs p-4 sm:p-5 space-y-3"
    >
      {/* Ornamen lembut di pojok */}
      <div className="pointer-events-none absolute -top-10 -right-10 w-36 h-36 rounded-full bg-[#D3A253]/10 blur-2xl" aria-hidden="true" />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-[#173B4E] dark:text-white">
            <span className="w-7 h-7 rounded-xl bg-[#246579] text-white flex items-center justify-center">
              <Sprout className="w-4 h-4" />
            </span>
            Sedang Dihafal
            <span className="ml-1 px-1.5 py-0.5 rounded-md bg-[#D3A253]/20 text-[#8A6420] dark:text-[#E9CF99] text-[10px] font-bold">{active.length}</span>
          </h2>
          <p className="mt-1 text-[11px] text-[#477F8D] dark:text-[#94A3B8]">Teruskan sedikit demi sedikit, istiqamah lebih utama.</p>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400 shrink-0">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-[3px] bg-[#246579]" />Hafal</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-[3px] bg-[#D3A253]" />Dilatih</span>
        </div>
      </div>

      {current ? (
        <ul className="relative">
          <ProgressItem item={current} onContinue={onContinue} />
        </ul>
      ) : (
        <p className="relative rounded-2xl bg-white/80 dark:bg-slate-900/40 border border-white dark:border-slate-700 p-3 text-xs text-[#173B4E] dark:text-slate-200">
          Masya Allah, semua surah yang kamu latih sudah hafal. Pilih surah baru dari daftar di bawah untuk mulai menghafal lagi.
        </p>
      )}

      {(others.length > 0 || done.length > 0) && (
        <div className="relative flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {others.length > 0 && (
              <>
                <span className="flex -space-x-1.5 shrink-0" aria-hidden="true">
                  {others.slice(0, 3).map((item) => (
                    <span
                      key={item.number}
                      className="w-6 h-6 rounded-full bg-[#246579]/10 dark:bg-[#246579]/40 ring-2 ring-white dark:ring-slate-800 text-[9px] font-bold text-[#246579] dark:text-[#A7CDD3] flex items-center justify-center"
                    >
                      {item.number}
                    </span>
                  ))}
                </span>
                <span className="text-[11px] font-semibold text-[#173B4E] dark:text-slate-200 truncate">+{others.length} surah lainnya</span>
              </>
            )}
            {done.length > 0 && (
              <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#246579]/10 dark:bg-[#246579]/30 text-[10px] font-semibold text-[#246579] dark:text-[#A7CDD3]">
                <BadgeCheck className="w-3 h-3" />
                {done.length} hafal
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSheetTab(current ? 'active' : 'done')}
            className="shrink-0 inline-flex items-center gap-0.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-[#246579] dark:text-[#A7CDD3] hover:bg-[#246579]/5"
          >
            Lihat Semua
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {sheetTab && (
        <HafalanSheet
          active={active}
          done={done}
          initialTab={sheetTab}
          onContinue={continueFromSheet}
          onOpen={openFromSheet}
          onClose={closeSheet}
        />
      )}
    </section>
  );
};
