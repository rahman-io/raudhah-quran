import React from 'react';

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** 12 → "١٢": angka Arab seperti pada mushaf. */
export const toArabicDigits = (value: number) => String(value).replace(/\d/g, (d) => ARABIC_DIGITS[Number(d)]);

/**
 * Tanda akhir ayat: nomor ayat (angka Arab) di dalam bingkai bundar berornamen,
 * seperti pada mushaf. Ukurannya mengikuti ukuran teks Arab.
 */
export const AyahEndMarker: React.FC<{ number: number; fontSize: number }> = ({ number, fontSize }) => {
  const size = Math.round(fontSize * 1.15);
  const digits = toArabicDigits(number);
  // Nomor 3 digit diperkecil sedikit agar tetap muat di dalam bingkai.
  const digitSize = Math.round(size * (digits.length >= 3 ? 0.3 : digits.length === 2 ? 0.42 : 0.5));

  return (
    <span
      className="relative inline-flex items-center justify-center align-middle mx-1.5 select-none text-[#B08A4A] dark:text-[#D3A253]"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Akhir ayat ${number}`}
    >
      <svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full" fill="none" aria-hidden="true">
        {/* Lingkaran ganda, terputus di atas & bawah untuk permata */}
        <path d="M16.6 4.4 A16 16 0 0 0 16.6 35.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M23.4 4.4 A16 16 0 0 1 23.4 35.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M17.4 7.6 A13 13 0 0 0 17.4 32.4" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />
        <path d="M22.6 7.6 A13 13 0 0 1 22.6 32.4" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />
        {/* Permata segi enam di atas & bawah */}
        <path d="M20 1.2 L23 3 L23 6.2 L20 8 L17 6.2 L17 3 Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M20 32 L23 33.8 L23 37 L20 38.8 L17 37 L17 33.8 Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        {/* Titik hias di kiri & kanan */}
        <circle cx="4" cy="20" r="1.3" fill="currentColor" />
        <circle cx="36" cy="20" r="1.3" fill="currentColor" />
      </svg>
      <span
        className="relative font-arabic font-bold leading-none text-[#173B4E] dark:text-[#F1F5F9]"
        style={{ fontSize: digitSize }}
        dir="rtl"
      >
        {digits}
      </span>
    </span>
  );
};
