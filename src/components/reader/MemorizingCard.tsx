import React, { useMemo, useState } from 'react';
import { ChevronDown, GraduationCap, Sprout } from 'lucide-react';
import { getHafalanActivityBySurah, STAGES } from '../hafalan/hafalanPlan';

/** Minimal ayat yang sudah dilatih/dihafal agar surah masuk daftar "Sedang Dihafal". */
const MIN_AYAHS = 3;
const VISIBLE = 3;
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

/**
 * Kartu "Sedang Dihafal": surah yang minimal 3 ayatnya sudah dilatih atau dihafal,
 * tetapi belum hafal seluruhnya. Tombol "Lanjut" membuka mode Hafalkan di ayat berikutnya.
 */
export const MemorizingCard: React.FC<{
  surahs: SurahMeta[];
  memorizedAyahIds: string[];
  onContinue: (surah: number, ayah: number) => void;
}> = ({ surahs, memorizedAyahIds, onContinue }) => {
  const [expanded, setExpanded] = useState(false);

  const items = useMemo<MemorizingSurah[]>(() => {
    const activity = getHafalanActivityBySurah();
    const memorizedBySurah = new Map<number, Set<number>>();
    memorizedAyahIds.forEach((id) => {
      const [surah, ayah] = id.split(':').map(Number);
      if (!Number.isInteger(surah) || !Number.isInteger(ayah)) return;
      if (!memorizedBySurah.has(surah)) memorizedBySurah.set(surah, new Set());
      memorizedBySurah.get(surah)!.add(ayah);
    });

    return surahs
      .map((meta): MemorizingSurah | null => {
        const memorized = new Set([...(memorizedBySurah.get(meta.number) ?? [])].filter((a) => a <= meta.numberOfAyahs));
        const practising = new Map(
          [...(activity.get(meta.number)?.ayahs ?? new Map<number, number>())].filter(([ayah]) => !memorized.has(ayah) && ayah <= meta.numberOfAyahs)
        );
        const touched = memorized.size + practising.size;
        if (touched < MIN_AYAHS || memorized.size >= meta.numberOfAyahs) return null;
        // Lanjutkan ayat yang sedang dilatih; bila tidak ada, ayat pertama yang belum hafal.
        const nextAyah = practising.size
          ? Math.min(...practising.keys())
          : Array.from({ length: meta.numberOfAyahs }, (_, i) => i + 1).find((a) => !memorized.has(a)) ?? 1;
        return { ...meta, memorized, practising, nextAyah, lastAt: activity.get(meta.number)?.lastAt ?? 0 };
      })
      .filter((item): item is MemorizingSurah => item !== null)
      .sort((a, b) => b.lastAt - a.lastAt || a.number - b.number);
  }, [surahs, memorizedAyahIds]);

  if (items.length === 0) return null;
  const shown = expanded ? items : items.slice(0, VISIBLE);

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
            <span className="ml-1 px-1.5 py-0.5 rounded-md bg-[#D3A253]/20 text-[#8A6420] dark:text-[#E9CF99] text-[10px] font-bold">{items.length}</span>
          </h2>
          <p className="mt-1 text-[11px] text-[#477F8D] dark:text-[#94A3B8]">Teruskan sedikit demi sedikit, istiqamah lebih utama.</p>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400 shrink-0">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-[3px] bg-[#246579]" />Hafal</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-[3px] bg-[#D3A253]" />Dilatih</span>
        </div>
      </div>

      <ul className="relative space-y-2.5">
        {shown.map((item) => {
          const remaining = item.numberOfAyahs - item.memorized.size;
          const gamesHere = item.practising.get(item.nextAyah);
          return (
            <li
              key={item.number}
              className="rounded-2xl bg-white/80 dark:bg-slate-900/40 border border-white dark:border-slate-700 shadow-[0_2px_10px_rgba(23,59,78,0.05)] p-3 sm:p-3.5"
            >
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
        })}
      </ul>

      {items.length > VISIBLE && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="relative w-full flex items-center justify-center gap-1 text-[11px] font-semibold text-[#246579] dark:text-[#A7CDD3] hover:underline"
        >
          {expanded ? 'Tampilkan lebih sedikit' : `Lihat semua (${items.length})`}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      )}
    </section>
  );
};
