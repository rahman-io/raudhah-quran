import React from 'react';
import { toArabicDigits } from '../AyahEndMarker';

/**
 * Ornamen Mode Mushaf (SVG, tanpa gambar): bingkai halaman, kartu judul surah, dan label kepala
 * halaman. Warnanya mengikuti tema app (teal & emas) dan mode gelap.
 */

/** Pola geometris kecil untuk pita bingkai (bintang delapan di dalam belah ketupat). */
const BAND_PATTERN = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><rect width='24' height='24' fill='#1F5A6C'/><path d='M12 1 L23 12 L12 23 L1 12 Z' fill='none' stroke='#D3A253' stroke-width='1'/><path d='M12 5 L13.8 10.2 L19 12 L13.8 13.8 L12 19 L10.2 13.8 L5 12 L10.2 10.2 Z' fill='#D3A253' fill-opacity='0.85'/><circle cx='12' cy='12' r='1.6' fill='#F4E3BC'/><circle cx='0' cy='0' r='2' fill='#D3A253'/><circle cx='24' cy='0' r='2' fill='#D3A253'/><circle cx='0' cy='24' r='2' fill='#D3A253'/><circle cx='24' cy='24' r='2' fill='#D3A253'/></svg>`
)}")`;

/** Mawar sudut bingkai. */
const CornerRosette: React.FC<{ className: string }> = ({ className }) => (
  <svg viewBox="0 0 40 40" className={`absolute w-7 h-7 sm:w-9 sm:h-9 ${className}`} aria-hidden="true">
    <circle cx="20" cy="20" r="18" fill="#1F5A6C" stroke="#D3A253" strokeWidth="1.5" />
    {Array.from({ length: 8 }, (_, i) => (
      <ellipse key={i} cx="20" cy="9" rx="3.2" ry="7" fill="#D3A253" fillOpacity="0.9" transform={`rotate(${i * 45} 20 20)`} />
    ))}
    <circle cx="20" cy="20" r="4.5" fill="#F4E3BC" stroke="#D3A253" strokeWidth="1" />
  </svg>
);

/** Bingkai halaman: pita ornamen, garis ganda emas, dan mawar di keempat sudut. */
export const MushafFrame: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`relative rounded-[18px] p-[7px] sm:p-[9px] shadow-[0_10px_30px_rgba(23,59,78,0.18)] ${className}`} style={{ backgroundImage: BAND_PATTERN, backgroundSize: '18px 18px' }}>
    <div className="relative h-full rounded-[12px] p-[3px] bg-[#D3A253]">
      <div className="relative h-full rounded-[10px] border border-[#1F5A6C]/40 bg-[#FFFDF7] dark:bg-[#0F2830] overflow-hidden">{children}</div>
    </div>
    <CornerRosette className="-top-2 -left-2" />
    <CornerRosette className="-top-2 -right-2" />
    <CornerRosette className="-bottom-2 -left-2" />
    <CornerRosette className="-bottom-2 -right-2" />
  </div>
);

/** Label kecil di kepala halaman (nama surah, nomor halaman, juz). */
export const HeaderPill: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <span
    className={`inline-flex items-center justify-center h-6 px-3 rounded-full border border-[#D3A253] bg-[#FFFBF1] dark:bg-[#123540] text-[11px] font-bold text-[#173B4E] dark:text-[#E9CF99] whitespace-nowrap shadow-[inset_0_0_0_2px_rgba(211,162,83,0.18)] ${className}`}
  >
    {children}
  </span>
);

const REVELATION_AR: Record<string, string> = { Makkiyah: 'مَكِّيَّةٌ', Madaniyah: 'مَدَنِيَّةٌ' };

/** Kartu judul surah, seperti di mushaf: nama surah di tengah, jenis surah & jumlah ayat di sisi. */
export const SurahTitleCard: React.FC<{
  nameArabic: string;
  revelationType?: string;
  ayahCount?: number;
  fontSize: number;
}> = ({ nameArabic, revelationType, ayahCount, fontSize }) => (
  <div className="relative w-full h-full flex items-center" dir="rtl">
    <svg viewBox="0 0 600 64" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <rect x="2" y="6" width="596" height="52" rx="10" fill="#1F5A6C" />
      <rect x="6" y="10" width="588" height="44" rx="8" fill="none" stroke="#D3A253" strokeWidth="1.5" />
      {/* motif sisi */}
      {[60, 110, 490, 540].map((x) => (
        <path key={x} d={`M${x} 18 L${x + 14} 32 L${x} 46 L${x - 14} 32 Z`} fill="#D3A253" fillOpacity="0.85" />
      ))}
      <rect x="165" y="12" width="270" height="40" rx="20" fill="#FFF8E7" stroke="#D3A253" strokeWidth="2" />
      <rect x="14" y="16" width="120" height="32" rx="16" fill="#FFF8E7" stroke="#D3A253" strokeWidth="1.5" />
      <rect x="466" y="16" width="120" height="32" rx="16" fill="#FFF8E7" stroke="#D3A253" strokeWidth="1.5" />
    </svg>
    <span className="relative grid grid-cols-[1fr_2.25fr_1fr] w-full items-center text-[#173B4E] font-mushaf-id leading-none" style={{ lineHeight: 1 }}>
      <span className="text-center" style={{ fontSize: fontSize * 0.55 }}>{revelationType ? REVELATION_AR[revelationType] ?? '' : ''}</span>
      <span className="text-center" style={{ fontSize: fontSize * 0.82 }}>سُوْرَةُ {nameArabic.replace(/^سُورَةُ\s*/, '')}</span>
      <span className="text-center" style={{ fontSize: fontSize * 0.55 }}>{ayahCount ? `اٰيَاتُهَا ${toArabicDigits(ayahCount)}` : ''}</span>
    </span>
  </div>
);
