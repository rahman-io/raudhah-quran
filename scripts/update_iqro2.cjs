const fs = require('fs');
const path = require('path');

const iqro2Pages = [
  {
    pageNumber: 1,
    title: "Halaman 1: Sambungan Huruf ب, ت, ث dan Huruf Lain",
    subtitle: "Pengenalan bentuk huruf sambung dua suku kata",
    teacherNote: "Perhatikan bentuk huruf بَ, تَ, ثَ saat disambung di depan dengan huruf lain. Semua dibaca pendek.",
    rows: [
      { id: "j2_p1_r1", items: [{ id: "1", arabic: "بَ تَ = بَتَ", latin: "BA - TA = BATA" }, { id: "2", arabic: "بَ دَ = بَدَ", latin: "BA - DA = BADA" }] },
      { id: "j2_p1_r2", items: [{ id: "3", arabic: "تَ رَ = تَرَ", latin: "TA - RA = TARA" }, { id: "4", arabic: "تَ وَ = تَوَ", latin: "TA - WA = TAWA" }] },
      { id: "j2_p1_r3", items: [{ id: "5", arabic: "تَ تَ", latin: "TA - TA" }, { id: "6", arabic: "تَ دَ", latin: "TA - DA" }, { id: "7", arabic: "بَ رَ", latin: "BA - RA" }, { id: "8", arabic: "بَ وَ", latin: "BA - WA" }] },
      { id: "j2_p1_r4", items: [{ id: "9", arabic: "بَ ثَ", latin: "BA - TSA" }, { id: "10", arabic: "بَ ذَ", latin: "BA - DZA" }, { id: "11", arabic: "تَ رَ", latin: "TA - RA" }, { id: "12", arabic: "تَ زَ", latin: "TA - ZA" }] },
      { id: "j2_p1_r5", items: [{ id: "13", arabic: "بَ ثَ", latin: "BA - TSA" }, { id: "14", arabic: "تَ ذَ", latin: "TA - DZA" }, { id: "15", arabic: "ثَ ثَ", latin: "TSA - TSA" }, { id: "16", arabic: "رَ ثَ", latin: "RA - TSA" }] },
      { id: "j2_p1_r6", items: [{ id: "17", arabic: "بَ اَ", latin: "BA - A" }, { id: "18", arabic: "بَاتَ", latin: "BAA - TA", isLong: true }, { id: "19", arabic: "تَ اَ", latin: "TA - A" }, { id: "20", arabic: "تَاتَ", latin: "TAA - TA", isLong: true }] },
      { id: "j2_p1_r7", items: [{ id: "21", arabic: "ثَبَ", latin: "TSA - BA" }, { id: "22", arabic: "ثَرَ", latin: "TSA - RA" }, { id: "23", arabic: "بَرَ", latin: "BA - RA" }, { id: "24", arabic: "ثَوَ", latin: "TSA - WA" }] },
      { id: "j2_p1_r8", items: [{ id: "25", arabic: "طَهَ", latin: "THA - HA" }, { id: "26", arabic: "جَكَ", latin: "JA - KA" }, { id: "27", arabic: "كَيَ", latin: "KA - YA" }, { id: "28", arabic: "جَسَ", latin: "JA - SA" }] }
    ]
  },
  {
    pageNumber: 2,
    title: "Halaman 2: Huruf Nun Sambung (نَ = نـ...)",
    subtitle: "Mengenal bentuk Nun di awal dan tengah kata",
    teacherNote: "Huruf Nun (نَ) saat di depan hanya diambil kepalanya dengan titik satu di atas.",
    rows: [
      { id: "j2_p2_r1", items: [{ id: "1", arabic: "نَ = نـ...", latin: "NA = NA..." }, { id: "2", arabic: "نَ بَ = نَبَ", latin: "NA - BA = NABA" }] },
      { id: "j2_p2_r2", items: [{ id: "3", arabic: "نَنَنَ", latin: "NA - NA - NA" }, { id: "4", arabic: "نَتَنَ", latin: "NA - TA - NA" }, { id: "5", arabic: "نَبَبَ", latin: "NA - BA - BA" }, { id: "6", arabic: "بَنَنَ", latin: "BA - NA - NA" }] },
      { id: "j2_p2_r3", items: [{ id: "7", arabic: "نَبَتَ", latin: "NA - BA - TA" }, { id: "8", arabic: "بَنَتَ", latin: "BA - NA - TA" }, { id: "9", arabic: "تَبَنَ", latin: "TA - BA - NA" }, { id: "10", arabic: "نَتَبَ", latin: "NA - TA - BA" }] },
      { id: "j2_p2_r4", items: [{ id: "11", arabic: "رَبَنَ", latin: "RA - BA - NA" }, { id: "12", arabic: "بَنَرَ", latin: "BA - NA - RA" }, { id: "13", arabic: "بَذَنَ", latin: "BA - DZA - NA" }, { id: "14", arabic: "نَبَذَ", latin: "NA - BA - DZA" }] },
      { id: "j2_p2_r5", items: [{ id: "15", arabic: "بَدَرَ", latin: "BA - DA - RA" }, { id: "16", arabic: "نَذَرَ", latin: "NA - DZA - RA" }, { id: "17", arabic: "ذَنَبَ", latin: "DZA - NA - BA" }, { id: "18", arabic: "وَنَذَ", latin: "WA - NA - DZA" }] },
      { id: "j2_p2_r6", items: [{ id: "19", arabic: "ذَرَحَ", latin: "DZA - RA - HA" }, { id: "20", arabic: "نَزَعَ", latin: "NA - ZA - 'A" }, { id: "21", arabic: "نَبَاَ", latin: "NA - BA - A" }, { id: "22", arabic: "نَبَاَ", latin: "NA - BA - A" }] },
      { id: "j2_p2_r7", items: [{ id: "23", arabic: "ثَبَتَ", latin: "TSA - BA - TA" }, { id: "24", arabic: "تَثَبَ", latin: "TA - TSA - BA" }, { id: "25", arabic: "وَنَاَ", latin: "WA - NA - A" }, { id: "26", arabic: "نَوَفَ", latin: "NA - WA - FA" }] },
      { id: "j2_p2_r8", items: [{ id: "27", arabic: "بَدَنَ", latin: "BA - DA - NA" }, { id: "28", arabic: "دَنَتَ", latin: "DA - NA - TA" }, { id: "29", arabic: "وَنَنَ", latin: "WA - NA - NA" }, { id: "30", arabic: "نَوْنَ", latin: "NAU - NA" }] }
    ]
  },
  {
    pageNumber: 3,
    title: "Halaman 3: Huruf Ya Sambung (يَ = يَـ...)",
    subtitle: "Mengenal bentuk Ya di awal kata (titik dua di bawah)",
    teacherNote: "Huruf Ya (يَ) saat di awal kata titik dua pindah ke bawah (يَـ).",
    rows: [
      { id: "j2_p3_r1", items: [{ id: "1", arabic: "يَ = يَـ...", latin: "YA = YA..." }, { id: "2", arabic: "يَ تَ = يَتَ", latin: "YA - TA = YATA" }] },
      { id: "j2_p3_r2", items: [{ id: "3", arabic: "رَبَيَ", latin: "RA - BA - YA" }, { id: "4", arabic: "يَبَرَ", latin: "YA - BA - RA" }, { id: "5", arabic: "رَنَيَ", latin: "RA - NA - YA" }, { id: "6", arabic: "يَنَرَ", latin: "YA - NA - RA" }] },
      { id: "j2_p3_r3", items: [{ id: "7", arabic: "بَيَنَ", latin: "BA - YA - NA" }, { id: "8", arabic: "نَبَيَ", latin: "NA - BA - YA" }, { id: "9", arabic: "يَدَنَ", latin: "YA - DA - NA" }, { id: "10", arabic: "دَنَيَ", latin: "DA - NA - YA" }] },
      { id: "j2_p3_r4", items: [{ id: "11", arabic: "ذَهَبَ", latin: "DZA - HA - BA" }, { id: "12", arabic: "نَزَلَ", latin: "NA - ZA - LA" }, { id: "13", arabic: "نَذَرَ", latin: "NA - DZA - RA" }, { id: "14", arabic: "يَدَيَ", latin: "YA - DA - YA" }] },
      { id: "j2_p3_r5", items: [{ id: "15", arabic: "اَزَغَ", latin: "A - ZA - GHA" }, { id: "16", arabic: "بَتَرَ", latin: "BA - TA - RA" }, { id: "17", arabic: "زَيَنَ", latin: "ZA - YA - NA" }, { id: "18", arabic: "زَنَيَ", latin: "ZA - NA - YA" }] },
      { id: "j2_p3_r6", items: [{ id: "19", arabic: "اَثَثَ", latin: "A - TSA - TSA" }, { id: "20", arabic: "ثَنَاَ", latin: "TSA - NA - A" }, { id: "21", arabic: "يَابَ", latin: "YAA - BA", isLong: true }, { id: "22", arabic: "اَيَتَ", latin: "A - YA - TA" }] },
      { id: "j2_p3_r7", items: [{ id: "23", arabic: "رَزَقَ", latin: "RA - ZA - QA" }, { id: "24", arabic: "نَظَرَ", latin: "NA - ZHA - RA" }, { id: "25", arabic: "اَتَيَ", latin: "A - TA - YA" }, { id: "26", arabic: "وَنَدَ", latin: "WA - NA - DA" }] },
      { id: "j2_p3_r8", items: [{ id: "27", arabic: "يَيَيَ", latin: "YA - YA - YA" }, { id: "28", arabic: "نَ مَ", latin: "NA - MA" }, { id: "29", arabic: "سَ ي", latin: "SA - YA" }, { id: "30", arabic: "يَنَ", latin: "YA - NA" }] }
    ]
  },
  {
    pageNumber: 4,
    title: "Halaman 4: Sambungan Jim, Ha, Kha (جَ, حَ, خَ)",
    subtitle: "Bentuk Jim/Ha/Kha saat disambung di awal",
    teacherNote: "Badan lengkung Jim/Ha/Kha dipotong, hanya diambil kepalanya.",
    rows: [
      { id: "j2_p4_r1", items: [{ id: "1", arabic: "جَ رَ = جَرَ", latin: "JA - RA = JARA" }, { id: "2", arabic: "حَجَرَ", latin: "HA - JA - RA" }] },
      { id: "j2_p4_r2", items: [{ id: "3", arabic: "بَجَ", latin: "BA - JA" }, { id: "4", arabic: "جَبَ", latin: "JA - BA" }, { id: "5", arabic: "خَدَ", latin: "KHA - DA" }, { id: "6", arabic: "نَدَ", latin: "NA - DA" }] },
      { id: "j2_p4_r3", items: [{ id: "7", arabic: "ثَجَ", latin: "TSA - JA" }, { id: "8", arabic: "هَوَ", latin: "HA - WA" }, { id: "9", arabic: "خَزَ", latin: "KHA - ZA" }, { id: "10", arabic: "يَتَ", latin: "YA - TA" }] },
      { id: "j2_p4_r4", items: [{ id: "11", arabic: "نَجَ", latin: "NA - JA" }, { id: "12", arabic: "حَيَ", latin: "HA - YA" }, { id: "13", arabic: "جَسَ", latin: "JA - SA" }, { id: "14", arabic: "يَشَ", latin: "YA - SYA" }] },
      { id: "j2_p4_r5", items: [{ id: "15", arabic: "مَثَ", latin: "MA - TSA" }, { id: "16", arabic: "رَصَ", latin: "RA - SHA" }, { id: "17", arabic: "يَضَ", latin: "YA - DHA" }, { id: "18", arabic: "خَطَ", latin: "KHA - THA" }] },
      { id: "j2_p4_r6", items: [{ id: "19", arabic: "ظَنَ", latin: "ZHA - NA" }, { id: "20", arabic: "دَعَ", latin: "DA - 'A" }, { id: "21", arabic: "غَزَ", latin: "GHA - ZA" }, { id: "22", arabic: "نَفَ", latin: "NA - FA" }] },
      { id: "j2_p4_r7", items: [{ id: "23", arabic: "يَقَ", latin: "YA - QA" }, { id: "24", arabic: "جَكَ", latin: "JA - KA" }, { id: "25", arabic: "خَلَ", latin: "KHA - LA" }, { id: "26", arabic: "يَيَ", latin: "YA - YA" }] },
      { id: "j2_p4_r8", items: [{ id: "27", arabic: "هَذَ", latin: "HA - DZA" }, { id: "28", arabic: "يَتَمَ", latin: "YA - TA - MA" }, { id: "29", arabic: "نَجَحَ", latin: "NA - JA - HA" }, { id: "30", arabic: "جَيَ", latin: "JA - YA" }] }
    ]
  },
  {
    pageNumber: 5,
    title: "Halaman 5: Sambungan Sin, Syin, Shad, Dhad (سَ, شَ, صَ, ضَ)",
    subtitle: "Membedakan gigi dan ketebalan huruf saat disambung",
    teacherNote: "Perhatikan gumpalan gigi Sin/Syin dan lingkar kepala Shad/Dhad saat disambung.",
    rows: [
      { id: "j2_p5_r1", items: [{ id: "1", arabic: "سَ دَ = سَدَ", latin: "SA - DA = SADA" }, { id: "2", arabic: "شَ رَ = شَرَ", latin: "SYA - RA = SYARA" }] },
      { id: "j2_p5_r2", items: [{ id: "3", arabic: "صَ دَ = صَدَ", latin: "SHA - DA = SHADA" }, { id: "4", arabic: "ضَ رَ = ضَرَ", latin: "DHA - RA = DHARA" }] },
      { id: "j2_p5_r3", items: [{ id: "5", arabic: "سَنَ", latin: "SA - NA" }, { id: "6", arabic: "بَسَ", latin: "BA - SA" }, { id: "7", arabic: "شَتَ", latin: "SYA - TA" }, { id: "8", arabic: "يَسَ", latin: "YA - SA" }] },
      { id: "j2_p5_r4", items: [{ id: "9", arabic: "شَرَ", latin: "SYA - RA" }, { id: "10", arabic: "صَحَ", latin: "SHA - HA" }, { id: "11", arabic: "نَمَ", latin: "NA - MA" }, { id: "12", arabic: "عَذَ", latin: "'A - DZA" }] },
      { id: "j2_p5_r5", items: [{ id: "13", arabic: "سَيَ", latin: "SA - YA" }, { id: "14", arabic: "صَلَ", latin: "SHA - LA" }, { id: "15", arabic: "غَوَ", latin: "GHA - WA" }, { id: "16", arabic: "شَقَ", latin: "SYA - QA" }] },
      { id: "j2_p5_r6", items: [{ id: "17", arabic: "نَظَ", latin: "NA - ZHA" }, { id: "18", arabic: "ضَفَ", latin: "DHA - FA" }, { id: "19", arabic: "طَهَ", latin: "THA - HA" }, { id: "20", arabic: "نَزَ", latin: "NA - ZA" }] },
      { id: "j2_p5_r7", items: [{ id: "21", arabic: "قَكَ", latin: "QA - KA" }, { id: "22", arabic: "خَشَ", latin: "KHA - SYA" }, { id: "23", arabic: "نَذَ", latin: "NA - DZA" }, { id: "24", arabic: "صَدَ", latin: "SHA - DA" }] },
      { id: "j2_p5_r8", items: [{ id: "25", arabic: "جَمَ", latin: "JA - MA" }, { id: "26", arabic: "شَاَ", latin: "SYA - A" }, { id: "27", arabic: "يَيَ", latin: "YA - YA" }, { id: "28", arabic: "يَضَ", latin: "YA - DHA" }] }
    ]
  },
  {
    pageNumber: 6,
    title: "Halaman 6: Sambungan Ain & Ghain (عَ, غَ)",
    subtitle: "Mengenal bentuk Ain/Ghain di tengah dan awal kata",
    teacherNote: "Huruf Ain dan Ghain saat di tengah kata bentuknya menjadi segitiga terbalik terisi.",
    rows: [
      { id: "j2_p6_r1", items: [{ id: "1", arabic: "عَ دَ = عَدَ", latin: "'A - DA = 'ADA" }, { id: "2", arabic: "بَ عَ = بَعَ", latin: "BA - 'A = BA'A" }] },
      { id: "j2_p6_r2", items: [{ id: "3", arabic: "بَ عَ دَ = بَعَدَ", latin: "BA - 'A - DA = BA'ADA" }] },
      { id: "j2_p6_r3", items: [{ id: "4", arabic: "رَعَتَ", latin: "RA - 'A - TA" }, { id: "5", arabic: "تَعَرَ", latin: "TA - 'A - RA" }, { id: "6", arabic: "عَتَرَ", latin: "'A - TA - RA" }, { id: "7", arabic: "رَتَعَ", latin: "RA - TA - 'A" }] },
      { id: "j2_p6_r4", items: [{ id: "8", arabic: "عَبَصَ", latin: "'A - BA - SHA" }, { id: "9", arabic: "صَعَبَ", latin: "SHA - 'A - BA" }, { id: "10", arabic: "يَغَضَ", latin: "YA - GHA - DHA" }, { id: "11", arabic: "غَيَضَ", latin: "GHA - YA - DHA" }] },
      { id: "j2_p6_r5", items: [{ id: "12", arabic: "حَذَرَ", latin: "HA - DZA - RA" }, { id: "13", arabic: "جَعَلَ", latin: "JA - 'A - LA" }, { id: "14", arabic: "شَطَكَ", latin: "SYA - THA - KA" }, { id: "15", arabic: "نَبَغَ", latin: "NA - BA - GHA" }] },
      { id: "j2_p6_r6", items: [{ id: "16", arabic: "غَيَنَ", latin: "GHA - YA - NA" }, { id: "17", arabic: "ثَغَفَ", latin: "TSA - GHA - FA" }, { id: "18", arabic: "عَتَقَ", latin: "'A - TA - QA" }, { id: "19", arabic: "مَنَعَ", latin: "MA - NA - 'A" }] },
      { id: "j2_p6_r7", items: [{ id: "20", arabic: "ثَقَلَ", latin: "TSA - QA - LA" }, { id: "21", arabic: "نَظَمَ", latin: "NA - ZHA - MA" }, { id: "22", arabic: "رَهَقَ", latin: "RA - HA - QA" }, { id: "23", arabic: "وَسَعَ", latin: "WA - SA - 'A" }] },
      { id: "j2_p6_r8", items: [{ id: "24", arabic: "عَزَلَ", latin: "'A - ZA - LA" }, { id: "25", arabic: "نَعَسَ", latin: "NA - 'A - SA" }, { id: "26", arabic: "غَوَضَ", latin: "GHA - WA - DHA" }, { id: "27", arabic: "يَغَضَ", latin: "YA - GHA - DHA" }] }
    ]
  },
  {
    pageNumber: 7,
    title: "Halaman 7: Latihan Kelancaran Membaca Tiga Suku Kata",
    subtitle: "Membaca cepat tanpa berpikir berlama-lama",
    teacherNote: "Jika bacaan sering dipanjang-panjangkan karena berpikir, membacanya diputus-putus saja!",
    rows: [
      { id: "j2_p7_r1", items: [{ id: "1", arabic: "غَاَعَ", latin: "GHA - A - 'A" }, { id: "2", arabic: "خَطَبَ", latin: "KHA - THA - BA" }, { id: "3", arabic: "هَدَمَ", latin: "HA - DA - MA" }, { id: "4", arabic: "رَخَقَ", latin: "RA - KHA - QA" }] },
      { id: "j2_p7_r2", items: [{ id: "5", arabic: "عَظَمَ", latin: "'A - ZHA - MA" }, { id: "6", arabic: "صَرَفَ", latin: "SHA - RA - FA" }, { id: "7", arabic: "عَنَقَ", latin: "'A - NA - QA" }, { id: "8", arabic: "يَسَعَ", latin: "YA - SA - 'A" }] },
      { id: "j2_p7_r3", items: [{ id: "9", arabic: "وَجَدَ", latin: "WA - JA - DA" }, { id: "10", arabic: "شَغَلَ", latin: "SYA - GHA - LA" }, { id: "11", arabic: "غَسَقَ", latin: "GHA - SA - QA" }, { id: "12", arabic: "ضَحَكَ", latin: "DHA - HA - KA" }] },
      { id: "j2_p7_r4", items: [{ id: "13", arabic: "طَلَبَ", latin: "THA - LA - BA" }, { id: "14", arabic: "اَخَذَ", latin: "A - KHA - DZA" }, { id: "15", arabic: "وَضَعَ", latin: "WA - DHA - 'A" }, { id: "16", arabic: "ظَجَرَ", latin: "ZHA - JA - RA" }] },
      { id: "j2_p7_r5", items: [{ id: "17", arabic: "عَبَسَ", latin: "'A - BA - SA" }, { id: "18", arabic: "بَتَقَ", latin: "BA - TA - QA" }, { id: "19", arabic: "فَتَحَ", latin: "FA - TA - HA" }, { id: "20", arabic: "ذَظَعَ", latin: "DZA - ZHA - 'A" }] },
      { id: "j2_p7_r6", items: [{ id: "21", arabic: "صَعَدَ", latin: "SHA - 'A - DA" }, { id: "22", arabic: "طَعَنَ", latin: "THA - 'A - NA" }, { id: "23", arabic: "ثَبَرَ", latin: "TSA - BA - RA" }, { id: "24", arabic: "غَضَبَ", latin: "GHA - DHA - BA" }] },
      { id: "j2_p7_r7", items: [{ id: "25", arabic: "غَزَرَ", latin: "GHA - ZA - RA" }, { id: "26", arabic: "حَسَنَ", latin: "HA - SA - NA" }, { id: "27", arabic: "نَشَطَ", latin: "NA - SYA - THA" }, { id: "28", arabic: "رَجَعَ", latin: "RA - JA - 'A" }] }
    ]
  },
  {
    pageNumber: 8,
    title: "Halaman 8: Sambungan Fa & Qaf (فَ, قَ)",
    subtitle: "Mengenal Fa (titik 1) dan Qaf (titik 2) di awal dan tengah kata",
    teacherNote: "Huruf Fa dan Qaf saat di tengah kata kepalanya berbentuk bulat berlubang.",
    rows: [
      { id: "j2_p8_r1", items: [{ id: "1", arabic: "نَ فَ قَ = نَفَقَ", latin: "NA - FA - QA = NAFAQA" }] },
      { id: "j2_p8_r2", items: [{ id: "2", arabic: "فَ قَ مَ = فَقَمَ", latin: "FA - QA - MA = FAQAMA" }, { id: "3", arabic: "قَفَلَ = قَ فَ لَ", latin: "QAFALA = QA - FA - LA" }] },
      { id: "j2_p8_r3", items: [{ id: "4", arabic: "فَرَغَ", latin: "FA - RA - GHA" }, { id: "5", arabic: "نَفَلَ", latin: "NA - FA - LA" }, { id: "6", arabic: "قَبَحَ", latin: "QA - BA - HA" }, { id: "7", arabic: "وَقَعَ", latin: "WA - QA - 'A" }] },
      { id: "j2_p8_r4", items: [{ id: "8", arabic: "فَصَحَ", latin: "FA - SHA - HA" }, { id: "9", arabic: "جَرَمَ", latin: "JA - RA - MA" }, { id: "10", arabic: "وَزَكَ", latin: "WA - ZA - KA" }, { id: "11", arabic: "تَذَرَ", latin: "TA - DZA - RA" }] },
      { id: "j2_p8_r5", items: [{ id: "12", arabic: "هَيَرَ", latin: "HA - YA - RA" }, { id: "13", arabic: "يَخَضَ", latin: "YA - KHA - DHA" }, { id: "14", arabic: "شَرَعَ", latin: "SYA - RA - 'A" }, { id: "15", arabic: "نَظَفَ", latin: "NA - ZHA - FA" }] },
      { id: "j2_p8_r6", items: [{ id: "16", arabic: "يَدَكَ", latin: "YA - DA - KA" }, { id: "17", arabic: "ضَغَطَ", latin: "DHA - GHA - THA" }, { id: "18", arabic: "ثَقَلَ", latin: "TSA - QA - LA" }, { id: "19", arabic: "شَفَعَ", latin: "SYA - FA - 'A" }] },
      { id: "j2_p8_r7", items: [{ id: "20", arabic: "عَظَمَ", latin: "'A - ZHA - MA" }, { id: "21", arabic: "يَسَرَ", latin: "YA - SA - RA" }, { id: "22", arabic: "طَبَقَ", latin: "THA - BA - QA" }, { id: "23", arabic: "نَفَرَ", latin: "NA - FA - RA" }] },
      { id: "j2_p8_r8", items: [{ id: "24", arabic: "عَقَمَ", latin: "'A - QA - MA" }, { id: "25", arabic: "فَرَدَ", latin: "FA - RA - DA" }, { id: "26", arabic: "فَرَّشَ", latin: "FAR - RA - SYA" }, { id: "27", arabic: "بَعَيَ", latin: "BA - 'A - YA" }] }
    ]
  },
  {
    pageNumber: 9,
    title: "Halaman 9: Latihan Membaca Putus-Putus Suku Kata",
    subtitle: "Boleh membaca putus-putus meskipun huruf digandeng",
    teacherNote: "Membacanya boleh PUTUS-PUTUS Meskipun digandeng hurufnya.",
    rows: [
      { id: "j2_p9_r1", items: [{ id: "1", arabic: "سَاَلَ", latin: "SA - A - LA" }, { id: "2", arabic: "نَصَحَ", latin: "NA - SHA - HA" }, { id: "3", arabic: "بَيَعَ", latin: "BA - YA - 'A" }, { id: "4", arabic: "يَقَنَ", latin: "YA - QA - NA" }] },
      { id: "j2_p9_r2", items: [{ id: "5", arabic: "عَطَدَ", latin: "'A - THA - DA" }, { id: "6", arabic: "بَرَزَ", latin: "BA - RA - ZA" }, { id: "7", arabic: "وَقَبَ", latin: "WA - QA - BA" }, { id: "8", arabic: "صَرَفَ", latin: "SHA - RA - FA" }] },
      { id: "j2_p9_r3", items: [{ id: "9", arabic: "خَرَجَ", latin: "KHA - RA - JA" }, { id: "10", arabic: "سَفَقَ", latin: "SA - FA - QA" }, { id: "11", arabic: "ذَهَبَ", latin: "DZA - HA - BA" }, { id: "12", arabic: "جَعَلَ", latin: "JA - 'A - LA" }] },
      { id: "j2_p9_r4", items: [{ id: "13", arabic: "غَسَقَ", latin: "GHA - SA - QA" }, { id: "14", arabic: "فَتَكَ", latin: "FA - TA - KA" }, { id: "15", arabic: "وَضَعَ", latin: "WA - DHA - 'A" }, { id: "16", arabic: "نَفَسَ", latin: "NA - FA - SA" }] },
      { id: "j2_p9_r5", items: [{ id: "17", arabic: "بَعَثَ", latin: "BA - 'A - TSA" }, { id: "18", arabic: "خَتَمَ", latin: "KHA - TA - MA" }, { id: "19", arabic: "سَفَلَ", latin: "SA - FA - LA" }, { id: "20", arabic: "حَشَرَ", latin: "HA - SYA - RA" }] },
      { id: "j2_p9_r6", items: [{ id: "21", arabic: "شَطَيَ", latin: "SYA - THA - YA" }, { id: "22", arabic: "جَزَعَ", latin: "JA - ZA - 'A" }, { id: "23", arabic: "فَقَدَ", latin: "FA - QA - DA" }, { id: "24", arabic: "نَظَمَ", latin: "NA - ZHA - MA" }] },
      { id: "j2_p9_r7", items: [{ id: "25", arabic: "غَفَكَ", latin: "GHA - FA - KA" }, { id: "26", arabic: "صَعَبَ", latin: "SHA - 'A - BA" }, { id: "27", arabic: "وَسَقَ", latin: "WA - SA - QA" }, { id: "28", arabic: "حَيْثُ", latin: "HAI - TSU" }] }
    ]
  },
  {
    pageNumber: 10,
    title: "Halaman 10: Sambungan Kaf (كَ)",
    subtitle: "Mengenal perubahan bentuk Kaf saat di awal/tengah kata",
    teacherNote: "Huruf Kaf (كَ) saat di awal/tengah berubah bentuk seperti tangga berkait.",
    rows: [
      { id: "j2_p10_r1", items: [{ id: "1", arabic: "كَاَ تَ بَ = كَتَبَ", latin: "KA - TA - BA = KATABA" }] },
      { id: "j2_p10_r2", items: [{ id: "2", arabic: "سَ كَ تَ = سَكَتَ", latin: "SA - KA - TA = SAKATA" }] },
      { id: "j2_p10_r3", items: [{ id: "3", arabic: "كَذَبَ", latin: "KA - DZA - BA" }, { id: "4", arabic: "اَكَلَ", latin: "A - KA - LA" }, { id: "5", arabic: "حَكَمَ", latin: "HA - KA - MA" }, { id: "6", arabic: "تَرَكَ", latin: "TA - RA - KA" }] },
      { id: "j2_p10_r4", items: [{ id: "7", arabic: "كَفَرَ", latin: "KA - FA - RA" }, { id: "8", arabic: "نَقَضَ", latin: "NA - QA - DHA" }, { id: "9", arabic: "نَكَحَ", latin: "NA - KA - HA" }, { id: "10", arabic: "فَتَيَ", latin: "FA - TA - YA" }] },
      { id: "j2_p10_r5", items: [{ id: "11", arabic: "كَدَرَ", latin: "KA - DA - RA" }, { id: "12", arabic: "حَفِظَ", latin: "HA - FI - ZHA" }, { id: "13", arabic: "زَكَاَ", latin: "ZA - KA - A" }, { id: "14", arabic: "خَطِيَ", latin: "KHA - THA - YA" }] },
      { id: "j2_p10_r6", items: [{ id: "15", arabic: "كَتَعَ", latin: "KA - TA - 'A" }, { id: "16", arabic: "ضَرَبَ", latin: "DHA - RA - BA" }, { id: "17", arabic: "ثَنَاَ", latin: "TSA - NA - A" }, { id: "18", arabic: "مَعَكَ", latin: "MA - 'A - KA" }] },
      { id: "j2_p10_r7", items: [{ id: "19", arabic: "كَشَفَ", latin: "KA - SYA - FA" }, { id: "20", arabic: "غَسَقَ", latin: "GHA - SA - QA" }, { id: "21", arabic: "وَيَرَ", latin: "WA - YA - RA" }, { id: "22", arabic: "فَصَلَ", latin: "FA - SHA - LA" }] },
      { id: "j2_p10_r8", items: [{ id: "23", arabic: "كَظَمَ", latin: "KA - ZHA - MA" }, { id: "24", arabic: "خَدَكَ", latin: "KHA - DA - KA" }, { id: "25", arabic: "هَكَذَ", latin: "HA - KA - DZA" }, { id: "26", arabic: "يَدَكَ", latin: "YA - DA - KA" }] }
    ]
  },
  {
    pageNumber: 11,
    title: "Halaman 11: Sambungan Lam (لَ)",
    subtitle: "Membedakan Lam di awal/tengah dengan Alif",
    teacherNote: "Perhatikan: Bila di muka/di tengah yang bisa disambung adalah Lam (لـ), bukan Alif (ا)!",
    rows: [
      { id: "j2_p11_r1", items: [{ id: "1", arabic: "لَ", latin: "LA" }, { id: "2", arabic: "لَنَا", latin: "LA - NA" }, { id: "3", arabic: "اَ", latin: "A" }] },
      { id: "j2_p11_r2", items: [{ id: "4", arabic: "لَ بَ دَ = لَبَدَ", latin: "LA - BA - DA = LABADA" }, { id: "5", arabic: "لَ اَ = لاَ", latin: "LA - A = LAA", isLong: true }] },
      { id: "j2_p11_r3", items: [{ id: "6", arabic: "جَلَلَ", latin: "JA - LA - LA" }, { id: "7", arabic: "جَلَلَ", latin: "JA - LA - LA" }, { id: "8", arabic: "لاَجَلَ", latin: "LAA - JA - LA", isLong: true }] },
      { id: "j2_p11_r4", items: [{ id: "9", arabic: "لَسَاَلَ", latin: "LA - SA - A - LA" }, { id: "10", arabic: "لَضَلَلَ", latin: "LA - DHA - LA - LA" }, { id: "11", arabic: "لَنَبَاَ", latin: "LA - NA - BA - A" }] },
      { id: "j2_p11_r5", items: [{ id: "12", arabic: "وَمَلاَ", latin: "WA - MA - LAA", isLong: true }, { id: "13", arabic: "لاَكَلَ", latin: "LAA - KA - LA", isLong: true }, { id: "14", arabic: "فَبَلَغَ", latin: "FA - BA - LA - GHA" }] },
      { id: "j2_p11_r6", items: [{ id: "15", arabic: "لَسَلَكَ", latin: "LA - SA - LA - KA" }, { id: "16", arabic: "وَخَطَاَ", latin: "WA - KHA - THA - A" }, { id: "17", arabic: "وَخَلاَ", latin: "WA - KHA - LAA", isLong: true }] },
      { id: "j2_p11_r7", items: [{ id: "18", arabic: "سَاَلَكَ", latin: "SA - A - LA - KA" }, { id: "19", arabic: "لَلاَمَ", latin: "LA - LAA - MA", isLong: true }, { id: "20", arabic: "وَحَلَلَ", latin: "WA - HA - LA - LA" }] }
    ]
  },
  {
    pageNumber: 12,
    title: "Halaman 12: Sambungan Mim (مَ)",
    subtitle: "Mengenal bentuk Mim di awal dan tengah kata",
    teacherNote: "Huruf Mim saat di depan/tengah berupa bulatan kecil di bagian atas garis sambung.",
    rows: [
      { id: "j2_p12_r1", items: [{ id: "1", arabic: "جَ مَ عَ = جَمَعَ", latin: "JA - MA - 'A = JAMA'A" }] },
      { id: "j2_p12_r2", items: [{ id: "2", arabic: "عَمَدَ", latin: "'A - MA - DA" }, { id: "3", arabic: "صَمَدَ", latin: "SHA - MA - DA" }, { id: "4", arabic: "ظَلَمَ", latin: "ZHA - LA - MA" }, { id: "5", arabic: "لاَخَذَ", latin: "LAA - KHA - DZA", isLong: true }] },
      { id: "j2_p12_r3", items: [{ id: "6", arabic: "هَمَزَ", latin: "HA - MA - ZA" }, { id: "7", arabic: "نَفَحَ", latin: "NA - FA - HA" }, { id: "8", arabic: "غَنَمَ", latin: "GHA - NA - MA" }, { id: "9", arabic: "لاَسَدَ", latin: "LAA - SA - DA", isLong: true }] },
      { id: "j2_p12_r4", items: [{ id: "10", arabic: "يَمَنَ", latin: "YA - MA - NA" }, { id: "11", arabic: "بَلَغَ", latin: "BA - LA - GHA" }, { id: "12", arabic: "ظَلَمَا", latin: "ZHA - LA - MAA", isLong: true }, { id: "13", arabic: "لاَمَرَ", latin: "LAA - MA - RA", isLong: true }] },
      { id: "j2_p12_r5", items: [{ id: "14", arabic: "كَمَدَ", latin: "KA - MA - DA" }, { id: "15", arabic: "طَمَعَ", latin: "THA - MA - 'A" }, { id: "16", arabic: "ضَوَيَ", latin: "DHA - WA - YA" }, { id: "17", arabic: "لاَقَمَ", latin: "LAA - QA - MA", isLong: true }] },
      { id: "j2_p12_r6", items: [{ id: "18", arabic: "زَمَلَ", latin: "ZA - MA - LA" }, { id: "19", arabic: "صَنَعَ", latin: "SHA - NA - 'A" }, { id: "20", arabic: "مَلَكَ", latin: "MA - LA - KA" }, { id: "21", arabic: "لاَذَنَ", latin: "LAA - DZA - NA", isLong: true }] },
      { id: "j2_p12_r7", items: [{ id: "22", arabic: "هَجَمَ", latin: "HA - JA - MA" }, { id: "23", arabic: "كَذَبَ", latin: "KA - DZA - BA" }, { id: "24", arabic: "هَشَمَ", latin: "HA - SYA - MA" }, { id: "25", arabic: "لاَلَلَ", latin: "LAA - LA - LA", isLong: true }] },
      { id: "j2_p12_r8", items: [{ id: "26", arabic: "ضَحَمَ", latin: "DHA - HA - MA" }, { id: "27", arabic: "بَثَمَ", latin: "BA - TSA - MA" }, { id: "28", arabic: "قَلَمَ", latin: "QA - LA - MA" }, { id: "29", arabic: "لاَاَكَلَ", latin: "LAA - A - KA - LA", isLong: true }] }
    ]
  },
  {
    pageNumber: 13,
    title: "Halaman 13: Sambungan Ha Besar (هَ)",
    subtitle: "Mengenal berbagai variasi bentuk Ha di awal, tengah, dan akhir",
    teacherNote: "Bentuk Ha besar (هَ) berubah saat di tengah (seperti angka 8) dan di akhir (seperti simpulan).",
    rows: [
      { id: "j2_p13_r1", items: [{ id: "1", arabic: "نَ هَ رَ = نَهَرَ", latin: "NA - HA - RA = NAHARA" }] },
      { id: "j2_p13_r2", items: [{ id: "2", arabic: "شَ هَ دَ = شَهِدَ", latin: "SYA - HI - DA = SYAHIDA" }, { id: "3", arabic: "هَ لَ كَ = هَلَكَ", latin: "HA - LA - KA = HALAKA" }] },
      { id: "j2_p13_r3", items: [{ id: "4", arabic: "رَهَقَ", latin: "RA - HA - QA" }, { id: "5", arabic: "كَهَنَ", latin: "KA - HA - NA" }, { id: "6", arabic: "سَهِيَ", latin: "SA - HA - YA" }, { id: "7", arabic: "لاَلاَفَ", latin: "LAA - LAA - FA", isLong: true }] },
      { id: "j2_p13_r4", items: [{ id: "8", arabic: "ضَهَشَ", latin: "DHA - HA - SYA" }, { id: "9", arabic: "كَهَلَ", latin: "KA - HA - LA" }, { id: "10", arabic: "هَيَمَ", latin: "HA - YA - MA" }, { id: "11", arabic: "لاَاَخَذَ", latin: "LAA - A - KHA - DZA", isLong: true }] },
      { id: "j2_p13_r5", items: [{ id: "12", arabic: "لَهَبَ", latin: "LA - HA - BA" }, { id: "13", arabic: "عَهَدَ", latin: "'A - HA - DA" }, { id: "14", arabic: "ظَهَشَ", latin: "ZHA - HA - SYA" }, { id: "15", arabic: "لاَجَزَ", latin: "LAA - JA - ZA", isLong: true }] },
      { id: "j2_p13_r6", items: [{ id: "16", arabic: "طَلَعَ", latin: "THA - LA - 'A" }, { id: "17", arabic: "قَهَرَ", latin: "QA - HA - RA" }, { id: "18", arabic: "هَمَسَ", latin: "HA - MA - SA" }, { id: "19", arabic: "لاَفَلَ", latin: "LAA - FA - LA", isLong: true }] },
      { id: "j2_p13_r7", items: [{ id: "20", arabic: "مَنَ", latin: "MA - NA" }, { id: "21", arabic: "كَلَ", latin: "KA - LA" }, { id: "22", arabic: "سَيَ", latin: "SA - YA" }, { id: "23", arabic: "كَيَ", latin: "KA - YA" }] },
      { id: "j2_p13_r8", items: [{ id: "24", arabic: "مَكَ", latin: "MA - KA" }, { id: "25", arabic: "سَهَجَ", latin: "SA - HA - JA" }, { id: "26", arabic: "سَهَجَ", latin: "SA - HA - JA" }, { id: "27", arabic: "سَجَ", latin: "SA - JA" }] }
    ]
  },
  {
    pageNumber: 14,
    title: "Halaman 14: Pengenalan Vokal Panjang (Mad Alif = ...ا)",
    subtitle: "Pelajaran pertama membaca panjang 2 harakat (Mad Thabi'i)",
    teacherNote: "Bila perlu boleh dikenalkan nama huruf ALIF. Bacalah Panjang 2 harakat: aa .... baa ....",
    rows: [
      { id: "j2_p14_r1", items: [{ id: "1", arabic: "مَا", latin: "MAA", isLong: true }, { id: "2", arabic: "هَا", latin: "HAA", isLong: true }, { id: "3", arabic: "ذَا", latin: "DZAA", isLong: true }, { id: "4", arabic: "لاَ", latin: "LAA", isLong: true }, { id: "5", arabic: "كَا", latin: "KAA", isLong: true }, { id: "6", arabic: "نَا", latin: "NAA", isLong: true }, { id: "7", arabic: "رَا", latin: "RAA", isLong: true }] },
      { id: "j2_p14_r2", items: [{ id: "8", arabic: "بَاتَ", latin: "BAA - TA", isLong: true }, { id: "9", arabic: "تَابَ", latin: "TAA - BA", isLong: true }, { id: "10", arabic: "يَانَ", latin: "YAA - NA", isLong: true }, { id: "11", arabic: "نَايَ", latin: "NAA - YA", isLong: true }] },
      { id: "j2_p14_r3", items: [{ id: "12", arabic: "تَنَا", latin: "TA - NAA", isLong: true }, { id: "13", arabic: "تَانَ", latin: "TAA - NA", isLong: true }, { id: "14", arabic: "نَتَا", latin: "NA - TAA", isLong: true }, { id: "15", arabic: "نَاتَ", latin: "NAA - TA", isLong: true }] },
      { id: "j2_p14_r4", items: [{ id: "16", arabic: "يَبَا", latin: "YA - BAA", isLong: true }, { id: "17", arabic: "يَابَ", latin: "YAA - BA", isLong: true }, { id: "18", arabic: "بَيَا", latin: "BA - YAA", isLong: true }, { id: "19", arabic: "بَايَ", latin: "BAA - YA", isLong: true }] },
      { id: "j2_p14_r5", items: [{ id: "20", arabic: "بَيَنَ", latin: "BA - YA - NA" }, { id: "21", arabic: "بَايَنَ", latin: "BAA - YA - NA", isLong: true }, { id: "22", arabic: "بَيَانَ", latin: "BA - YAA - NA", isLong: true }, { id: "23", arabic: "بَايَنَا", latin: "BAA - YA - NAA", isLong: true }] },
      { id: "j2_p14_r6", items: [{ id: "24", arabic: "عَبَدَ", latin: "'A - BA - DA" }, { id: "25", arabic: "عَابَدَ", latin: "'AA - BA - DA", isLong: true }, { id: "26", arabic: "عَبَادَ", latin: "'A - BAA - DA", isLong: true }, { id: "27", arabic: "عَابِدَا", latin: "'AA - BI - DAA", isLong: true }] },
      { id: "j2_p14_r7", items: [{ id: "28", arabic: "رَحَمَ", latin: "RA - HA - MA" }, { id: "29", arabic: "رَاحَمَ", latin: "RAA - HA - MA", isLong: true }, { id: "30", arabic: "رَحَامَ", latin: "RA - HAA - MA", isLong: true }, { id: "31", arabic: "رَاحَمَا", latin: "RAA - HA - MAA", isLong: true }] }
    ]
  },
  {
    pageNumber: 15,
    title: "Halaman 15: Membedakan Mana Panjang & Mana Pendek",
    subtitle: "Disiplin melatih posisi Alif dalam tiga suku kata",
    teacherNote: "Bacaan Harus Jelas Beda MANA PANJANG - MANA PENDEK! Bagus Dibaca dengan Irama Nyanyian.",
    rows: [
      { id: "j2_p15_r1", items: [{ id: "1", arabic: "ثَابَتَ", latin: "TSAA - BA - TA", isLong: true }, { id: "2", arabic: "ثَبَاتَ", latin: "TSA - BAA - TA", isLong: true }, { id: "3", arabic: "ثَبَاتَا", latin: "TSA - BAA - TAA", isLong: true }, { id: "4", arabic: "ثَابَتَا", latin: "TSAA - BA - TAA", isLong: true }] },
      { id: "j2_p15_r2", items: [{ id: "5", arabic: "زَابَدَ", latin: "ZAA - BA - DA", isLong: true }, { id: "6", arabic: "زَبَادَ", latin: "ZA - BAA - DA", isLong: true }, { id: "7", arabic: "زَبَادَا", latin: "ZA - BAA - DAA", isLong: true }, { id: "8", arabic: "زَابَدَا", latin: "ZAA - BA - DAA", isLong: true }] },
      { id: "j2_p15_r3", items: [{ id: "9", arabic: "تَاوَبَ", latin: "TAA - WA - BA", isLong: true }, { id: "10", arabic: "تَوَابَ", latin: "TA - WAA - BA", isLong: true }, { id: "11", arabic: "تَوَابَا", latin: "TA - WAA - BAA", isLong: true }, { id: "12", arabic: "تَاوَبَنَا", latin: "TAA - WA - BA - NAA", isLong: true }] },
      { id: "j2_p15_r4", items: [{ id: "13", arabic: "جَاهَدَ", latin: "JAA - HA - DA", isLong: true }, { id: "14", arabic: "فَاعَلَ", latin: "FAA - 'A - LA", isLong: true }, { id: "15", arabic: "ثَاقَلَ", latin: "TSAA - QA - LA", isLong: true }, { id: "16", arabic: "كَاتَبَ", latin: "KAA - TA - BA", isLong: true }] },
      { id: "j2_p15_r5", items: [{ id: "17", arabic: "نَاسَأَ", latin: "NAA - SA - A", isLong: true }, { id: "18", arabic: "طَالَبَ", latin: "THAA - LA - BA", isLong: true }, { id: "19", arabic: "غَازَوَ", latin: "GHAA - ZA - WA", isLong: true }, { id: "20", arabic: "عَالَمَ", latin: "'AA - LA - MA", isLong: true }] },
      { id: "j2_p15_r6", items: [{ id: "21", arabic: "حَاسَدَ", latin: "HAA - SA - DA", isLong: true }, { id: "22", arabic: "نَاعَمَ", latin: "NAA - 'A - MA", isLong: true }, { id: "23", arabic: "لاَهَبَ", latin: "LAA - HA - BA", isLong: true }, { id: "24", arabic: "ضَالَلَ", latin: "DHAA - LA - LA", isLong: true }] },
      { id: "j2_p15_r7", items: [{ id: "25", arabic: "نَانَنَا", latin: "NAA - NA - NAA", isLong: true }, { id: "26", arabic: "نَنَانَ", latin: "NA - NAA - NA", isLong: true }, { id: "27", arabic: "نَنَنَانَ", latin: "NA - NA - NAA - NA", isLong: true }, { id: "28", arabic: "نَنَا", latin: "NA - NAA", isLong: true }, { id: "29", arabic: "نَنَانَ", latin: "NA - NAA - NA", isLong: true }] }
    ]
  },
  {
    pageNumber: 16,
    title: "Halaman 16: Peringatan Keras Kesalahan Panjang-Pendek",
    subtitle: "Menghindari kesalahan fatal memanjangkan huruf pendek",
    teacherNote: "Keliru Baca Panjang - Pendek Adalah KESALAHAN BESAR !! Jangan sekali-kali menyeret bacaan pendek.",
    rows: [
      { id: "j2_p16_r1", items: [{ id: "1", arabic: "اَصَابَ", latin: "A - SHAFA - BA", isLong: true }, { id: "2", arabic: "اَعَادَ", latin: "A - 'AA - DA", isLong: true }, { id: "3", arabic: "خَلاَقَ", latin: "KHA - LAA - QA", isLong: true }, { id: "4", arabic: "ظَهَارَ", latin: "ZHA - HAA - RA", isLong: true }] },
      { id: "j2_p16_r2", items: [{ id: "5", arabic: "يَشَاَ", latin: "YA - SYAA - A", isLong: true }, { id: "6", arabic: "اَقَامَ", latin: "A - QAA - MA", isLong: true }, { id: "7", arabic: "ظَمَاَ", latin: "ZHA - MAA - A", isLong: true }, { id: "8", arabic: "طَمَعَ", latin: "THA - MA - 'A" }] },
      { id: "j2_p16_r3", items: [{ id: "9", arabic: "غَاسَقَ", latin: "GHAA - SA - QA", isLong: true }, { id: "10", arabic: "قَاتَلَ", latin: "QAA - TA - LA", isLong: true }, { id: "11", arabic: "وَاعَدَ", latin: "WAA - 'A - DA", isLong: true }, { id: "12", arabic: "جَامَعَ", latin: "JAA - MA - 'A", isLong: true }] },
      { id: "j2_p16_r4", items: [{ id: "13", arabic: "لاَمَنَعَ", latin: "LAA - MA - NA - 'A", isLong: true }, { id: "14", arabic: "لاَخَلَكَ", latin: "LAA - KHA - LA - KA", isLong: true }, { id: "15", arabic: "لاَاَثَرَ", latin: "LAA - A - TSA - RA", isLong: true }, { id: "16", arabic: "فَهَمَنَ", latin: "FA - HA - MA - NA" }] },
      { id: "j2_p16_r5", items: [{ id: "17", arabic: "نَبَذَ", latin: "NA - BA - DZA" }, { id: "18", arabic: "حَلَلَ", latin: "HA - LA - LA" }, { id: "19", arabic: "بَلَغَ", latin: "BA - LA - GHA" }, { id: "20", arabic: "زَاهَقَ", latin: "ZAA - HA - QA", isLong: true }] },
      { id: "j2_p16_r6", items: [{ id: "21", arabic: "اَفَلاَ", latin: "A - FA - LAA", isLong: true }, { id: "22", arabic: "غَمَدَ", latin: "GHA - MA - DA" }, { id: "23", arabic: "مَلَكَا", latin: "MA - LA - KAA", isLong: true }, { id: "24", arabic: "فَلَهَا", latin: "FA - LA - HAA", isLong: true }] },
      { id: "j2_p16_r7", items: [{ id: "25", arabic: "تَشَابَهَا", latin: "TA - SYAA - BA - HAA", isLong: true }, { id: "26", arabic: "مَاعَرَفَا", latin: "MAA - 'A - RA - FAA", isLong: true }, { id: "27", arabic: "وَصَلَوَاتَ", latin: "WA - SHA - LA - WAA - TA", isLong: true }] }
    ]
  },
  {
    pageNumber: 17,
    title: "Halaman 17: Kedisiplinan Mutlak Panjang-Pendek",
    subtitle: "Latihan intensif membedakan 1 harakat dan 2 harakat",
    teacherNote: "Disiplin PANJANG PENDEK adalah MUTLAK dan PASTI Maka ........ hati-hatilah !",
    rows: [
      { id: "j2_p17_r1", items: [{ id: "1", arabic: "ثَ شَ اَ عَ اَحَ هَ قَ خَ غَ ذَ ظَ ضَ", latin: "Review Huruf Tunggal Fathah" }] },
      { id: "j2_p17_r2", items: [{ id: "2", arabic: "عَقَدَا", latin: "'A - QA - DAA", isLong: true }, { id: "3", arabic: "كَسَبَا", latin: "KA - SA - BAA", isLong: true }, { id: "4", arabic: "خَتَمَا", latin: "KHA - TA - MAA", isLong: true }, { id: "5", arabic: "صَمَدَا", latin: "SHA - MA - DAA", isLong: true }] },
      { id: "j2_p17_r3", items: [{ id: "6", arabic: "بَعَثَا", latin: "BA - 'A - TSAA", isLong: true }, { id: "7", arabic: "غَفَلاَ", latin: "GHA - FA - LAA", isLong: true }, { id: "8", arabic: "خَلَفَا", latin: "KHA - LA - FAA", isLong: true }, { id: "9", arabic: "جَبَلاَ", latin: "JA - BA - LAA", isLong: true }] },
      { id: "j2_p17_r4", items: [{ id: "10", arabic: "خَاطَبَا", latin: "KHAA - THA - BAA", isLong: true }, { id: "11", arabic: "مَالَهَا", latin: "MAA - LA - HAA", isLong: true }, { id: "12", arabic: "بَايَنَا", latin: "BAA - YA - NAA", isLong: true }, { id: "13", arabic: "كَاسَبَا", latin: "KAA - SA - BAA", isLong: true }] },
      { id: "j2_p17_r5", items: [{ id: "14", arabic: "خَالَطَ", latin: "KHAA - LA - THA", isLong: true }, { id: "15", arabic: "عَاظَمَا", latin: "'AA - ZHA - MAA", isLong: true }, { id: "16", arabic: "نَاشَرَا", latin: "NAA - SYA - RAA", isLong: true }, { id: "17", arabic: "عَارَضَا", latin: "'AA - RA - DHAA", isLong: true }] },
      { id: "j2_p17_r6", items: [{ id: "18", arabic: "لاَعَزَّ", latin: "LAA - 'A - ZZA", isLong: true }, { id: "19", arabic: "لاَاَشَرَّ", latin: "LAA - A - SYA - RRA", isLong: true }, { id: "20", arabic: "لاَامَنَ", latin: "LAA - A - MA - NA", isLong: true }] },
      { id: "j2_p17_r7", items: [{ id: "21", arabic: "صَدَقَاتِكَ", latin: "SHA - DA - QAA - TI - KA", isLong: true }, { id: "22", arabic: "اَمَانَتَهَا", latin: "A - MAA - NA - TA - HAA", isLong: true }, { id: "23", arabic: "فَاَمَاتَهَا", latin: "FA - A - MAA - TA - HAA", isLong: true }] }
    ]
  },
  {
    pageNumber: 18,
    title: "Halaman 18: Variasi Pola Perubahan Vokal Panjang",
    subtitle: "Membandingkan kata tunggal pendek dengan kata sambung panjang",
    teacherNote: "Perhatikan perubahan irama saat suku kata di tengah atau di akhir yang dipanjangkan.",
    rows: [
      { id: "j2_p18_r1", items: [{ id: "1", arabic: "هَالَكَ", latin: "HAA - LA - KA", isLong: true }, { id: "2", arabic: "هَلَكَتَا", latin: "HA - LA - KA - TAA", isLong: true }, { id: "3", arabic: "فَهَلَكَ", latin: "FA - HA - LA - KA" }] },
      { id: "j2_p18_r2", items: [{ id: "4", arabic: "قَاتَلَ", latin: "QAA - TA - LA", isLong: true }, { id: "5", arabic: "قَتَلَتَا", latin: "QA - TA - LA - TAA", isLong: true }, { id: "6", arabic: "فَقَتَلاَ", latin: "FA - QA - TA - LAA", isLong: true }] },
      { id: "j2_p18_r3", items: [{ id: "7", arabic: "هَادَمَ", latin: "HAA - DA - MA", isLong: true }, { id: "8", arabic: "هَدَمَتَا", latin: "HA - DA - MA - TAA", isLong: true }, { id: "9", arabic: "فَهَدَمَا", latin: "FA - HA - DA - MAA", isLong: true }] },
      { id: "j2_p18_r4", items: [{ id: "10", arabic: "صَارَعَ", latin: "SHAA - RA - 'A", isLong: true }, { id: "11", arabic: "صَرَعَتَا", latin: "SHA - RA - 'A - TAA", isLong: true }, { id: "12", arabic: "فَصَرَعَا", latin: "FA - SHA - RA - 'AA", isLong: true }] },
      { id: "j2_p18_r5", items: [{ id: "13", arabic: "ضَارَبَ", latin: "DHAA - RA - BA", isLong: true }, { id: "14", arabic: "ضَرَبَتَا", latin: "DHA - RA - BA - TAA", isLong: true }, { id: "15", arabic: "فَضَرَبَا", latin: "FA - DHA - RA - BAA", isLong: true }] },
      { id: "j2_p18_r6", items: [{ id: "16", arabic: "هَاجَمَ", latin: "HAA - JA - MA", isLong: true }, { id: "17", arabic: "هَجَمَتَا", latin: "HA - JA - MA - TAA", isLong: true }, { id: "18", arabic: "فَهَجَمَا", latin: "FA - HA - JA - MAA", isLong: true }] },
      { id: "j2_p18_r7", items: [{ id: "19", arabic: "قَاوَمَ", latin: "QAA - WA - MA", isLong: true }, { id: "20", arabic: "قَوَمَتَا", latin: "QA - WA - MA - TAA", isLong: true }, { id: "21", arabic: "فَقَوَمَا", latin: "FA - QA - WA - MAA", isLong: true }] },
      { id: "j2_p18_r8", items: [{ id: "22", arabic: "رَاذَلَ", latin: "RAA - DZA - LA", isLong: true }, { id: "23", arabic: "رَذَلَتَا", latin: "RA - DZA - LA - TAA", isLong: true }, { id: "24", arabic: "فَرَذَلاَ", latin: "FA - RA - DZA - LAA", isLong: true }] }
    ]
  },
  {
    pageNumber: 19,
    title: "Halaman 19: Bentuk Penulisan Sambung Jim, Ha, Kha Di Akhir",
    subtitle: "Bentuk ekor lengkung Jim/Ha/Kha saat berada di akhir kata",
    teacherNote: "Huruf Jim/Ha/Kha jika di akhir kata ekor lengkungnya ditulis utuh kembali.",
    rows: [
      { id: "j2_p19_r1", items: [{ id: "1", arabic: "نَ جَ حَ = نَجَحَ = نَجَحَ", latin: "NA - JA - HA = NAJAHA" }] },
      { id: "j2_p19_r2", items: [{ id: "2", arabic: "عَجَلَ", latin: "'A - JA - LA" }, { id: "3", arabic: "سَخَرَ", latin: "SA - KHA - RA" }, { id: "4", arabic: "لَحَدَ", latin: "LA - HA - DA" }, { id: "5", arabic: "فَتَحَ", latin: "FA - TA - HA" }] },
      { id: "j2_p19_r3", items: [{ id: "6", arabic: "لَحَمَ", latin: "LA - HA - MA" }, { id: "7", arabic: "نَقَصَ", latin: "NA - QA - SHA" }, { id: "8", arabic: "مَطَرَ", latin: "MA - THA - RA" }, { id: "9", arabic: "حَضَرَ", latin: "HA - DHA - RA" }] },
      { id: "j2_p19_r4", items: [{ id: "10", arabic: "مَعَهَا", latin: "MA - 'A - HAA", isLong: true }, { id: "11", arabic: "فَمَتَا", latin: "FA - MA - TAA", isLong: true }, { id: "12", arabic: "وَعَفَا", latin: "WA - 'A - FAA", isLong: true }, { id: "13", arabic: "تَتَّخِذَا", latin: "TA - TTA - KHI - DZAA", isLong: true }] },
      { id: "j2_p19_r5", items: [{ id: "14", arabic: "اَجَلَ", latin: "A - JA - LA" }, { id: "15", arabic: "سَلَفَ", latin: "SA - LA - FA" }, { id: "16", arabic: "اَبَدَ", latin: "A - BA - DA" }, { id: "17", arabic: "نَجَسَ", latin: "NA - JA - SA" }] },
      { id: "j2_p19_r6", items: [{ id: "18", arabic: "مَقَامَ", latin: "MA - QAA - MA", isLong: true }, { id: "19", arabic: "زَكَاَ", latin: "ZA - KAA - A", isLong: true }, { id: "20", arabic: "مَتَاعَ", latin: "MA - TAA - 'A", isLong: true }, { id: "21", arabic: "بَنَانَ", latin: "BA - NAA - NA", isLong: true }] },
      { id: "j2_p19_r7", items: [{ id: "22", arabic: "حَمَلَ", latin: "HA - MA - LA" }, { id: "23", arabic: "فَلَحَ", latin: "FA - LA - HA" }, { id: "24", arabic: "غَلَبَ", latin: "GHA - LA - BA" }, { id: "25", arabic: "شَجَرَ", latin: "SYA - JA - RA" }] },
      { id: "j2_p19_r8", items: [{ id: "26", arabic: "لاَاَخَذَ", latin: "LAA - A - KHA - DZA", isLong: true }, { id: "27", arabic: "مَلَكَتَا", latin: "MA - LA - KA - TAA", isLong: true }, { id: "28", arabic: "لاَاَصَبَا", latin: "LAA - A - SHA - BAA", isLong: true }] }
    ]
  },
  {
    pageNumber: 20,
    title: "Halaman 20: Latihan Ketelitian Panjang-Pendek Empat Suku Kata",
    subtitle: "Perhatikan terus PANJANG - PENDEKNYA",
    teacherNote: "Jangan terkecoh dengan jumlah suku kata yang banyak. Tetap baca pendek jika tidak ada Alif.",
    rows: [
      { id: "j2_p20_r1", items: [{ id: "1", arabic: "مَفَازَهَا", latin: "MA - FAA - ZA - HAA", isLong: true }, { id: "2", arabic: "لاَاَصَبَا", latin: "LAA - A - SHA - BAA", isLong: true }, { id: "3", arabic: "وَلاَلَنَا", latin: "WA - LAA - LA - NAA", isLong: true }] },
      { id: "j2_p20_r2", items: [{ id: "4", arabic: "اَقَامَهَا", latin: "A - QAA - MA - HAA", isLong: true }, { id: "5", arabic: "تَنَازَعَا", latin: "TA - NAA - ZA - 'AA", isLong: true }, { id: "6", arabic: "طَعَامَهَا", latin: "THA - 'AA - MA - HAA", isLong: true }] },
      { id: "j2_p20_r3", items: [{ id: "7", arabic: "فَهَلَكَ", latin: "FA - HA - LA - KA" }, { id: "8", arabic: "لَبَعَثَ", latin: "LA - BA - 'A - TSA" }, { id: "9", arabic: "وَتَمَشَّ", latin: "WA - TA - MA - SSYA" }] },
      { id: "j2_p20_r4", items: [{ id: "10", arabic: "فَقَتَلاَ", latin: "FA - QA - TA - LAA", isLong: true }, { id: "11", arabic: "مَلَكَتَا", latin: "MA - LA - KA - TAA", isLong: true }, { id: "12", arabic: "نَصَحَكَا", latin: "NA - SHA - HA - KAA", isLong: true }] },
      { id: "j2_p20_r5", items: [{ id: "13", arabic: "لاَاَخَكَ", latin: "LAA - A - KHA - KA", isLong: true }, { id: "14", arabic: "ظَهَرَهَا", latin: "ZHA - HA - RA - HAA", isLong: true }, { id: "15", arabic: "فَصَوَابَا", latin: "FA - SHA - WAA - BAA", isLong: true }] },
      { id: "j2_p20_r6", items: [{ id: "16", arabic: "لَحَرَامَ", latin: "LA - HA - RAA - MA", isLong: true }, { id: "17", arabic: "لَقَمَارَ", latin: "LA - QA - MAA - RA", isLong: true }, { id: "18", arabic: "فَتَيَاتَ", latin: "FA - TA - YAA - TA", isLong: true }] },
      { id: "j2_p20_r7", items: [{ id: "19", arabic: "مَاسَكَنَ", latin: "MAA - SA - KA - NA", isLong: true }, { id: "20", arabic: "لاَاَغَضَبَ", latin: "LAA - A - GHA - DHA - BA", isLong: true }, { id: "21", arabic: "يَاسَعَدَ", latin: "YAA - SA - 'A - DA", isLong: true }] }
    ]
  },
  {
    pageNumber: 21,
    title: "Halaman 21: Rumus Kaidah Mad Fathah (َ + ا = َا)",
    subtitle: "Rumus resmi Mad Thabi'i Fathah",
    teacherNote: "Rumus: Fathah diikuti Alif (َ + ا = َا) wajib dibaca panjang 2 harakat.",
    rows: [
      { id: "j2_p21_r1", items: [{ id: "1", arabic: "...َ + ا = ...َا", latin: "FATHAH + ALIF = PANJANG 2X" }, { id: "2", arabic: "بَ + ا = بَا", latin: "BA + A = BAA", isLong: true }] },
      { id: "j2_p21_r2", items: [{ id: "3", arabic: "اَدَمَ", latin: "AA - DA - MA", isLong: true }, { id: "4", arabic: "اَمَنَ", latin: "AA - MA - NA", isLong: true }, { id: "5", arabic: "وَهَذَا", latin: "WA - HA - DZAA", isLong: true }, { id: "6", arabic: "بَنَهَا", latin: "BA - NA - HAA", isLong: true }] },
      { id: "j2_p21_r3", items: [{ id: "7", arabic: "وَذَاكَ", latin: "WA - DZAA - KA", isLong: true }, { id: "8", arabic: "نَاعَمَ", latin: "NAA - 'A - MA", isLong: true }, { id: "9", arabic: "غَسَالَ", latin: "GHA - SAA - LA", isLong: true }, { id: "10", arabic: "ايَتَ", latin: "AA - YA - TA", isLong: true }] },
      { id: "j2_p21_r4", items: [{ id: "11", arabic: "نَابَتَ", latin: "NAA - BA - TA", isLong: true }, { id: "12", arabic: "جَاوَزَ", latin: "JAA - WA - ZA", isLong: true }, { id: "13", arabic: "كَسَبَا", latin: "KA - SA - BAA", isLong: true }, { id: "14", arabic: "فَاَرَضَ", latin: "FA - AA - RA - DHA", isLong: true }] },
      { id: "j2_p21_r5", items: [{ id: "15", arabic: "جَامَعَ", latin: "JAA - MA - 'A", isLong: true }, { id: "16", arabic: "خَاطَبَ", latin: "KHAA - THA - BA", isLong: true }, { id: "17", arabic: "وَكَانَا", latin: "WA - KAA - NAA", isLong: true }, { id: "18", arabic: "تَلَهَا", latin: "TA - LA - HAA", isLong: true }] },
      { id: "j2_p21_r6", items: [{ id: "19", arabic: "يَدَانَا", latin: "YA - DAA - NAA", isLong: true }, { id: "20", arabic: "شَرَابَا", latin: "SYA - RAA - BAA", isLong: true }, { id: "21", arabic: "طَحَهَا", latin: "THA - HA - HAA", isLong: true }, { id: "22", arabic: "بَنَهَا", latin: "BA - NA - HAA", isLong: true }] },
      { id: "j2_p21_r7", items: [{ id: "23", arabic: "وَذَاتَ", latin: "WA - DZAA - TA", isLong: true }, { id: "24", arabic: "مَقَامَ", latin: "MA - QAA - MA", isLong: true }, { id: "25", arabic: "الاَفَ", latin: "ALAA - FA", isLong: true }, { id: "26", arabic: "مَاَبَ", latin: "MAA - A - BA", isLong: true }] },
      { id: "j2_p21_r8", items: [{ id: "27", arabic: "سَمَوَاتَ", latin: "SA - MA - WAA - TA", isLong: true }, { id: "28", arabic: "وَخَطَاً", latin: "WA - KHA - THA - AN" }, { id: "29", arabic: "صَلاَتَهَا", latin: "SHA - LAA - TA - HAA", isLong: true }] }
    ]
  },
  {
    pageNumber: 22,
    title: "Halaman 22: Alif Maqshurah Di Akhir Kata (ى = Dianggap Tidak Ada)",
    subtitle: "Mengenal Ya tanpa titik di akhir yang berfungsi sebagai Alif Mad",
    teacherNote: "سَبَحَا = سَبَحَى. Huruf Ya tanpa titik di akhir (ى) dibaca sebagai Alif Mad (panjang 2x), Ya-nya dianggap tidak ada.",
    rows: [
      { id: "j2_p22_r1", items: [{ id: "1", arabic: "سَبَحَا = سَبَحَى", latin: "SABAHA = SABAHAA", isLong: true }, { id: "2", arabic: "ى = Dianggap tidak ada", latin: "Kaidah Alif Maqshurah" }] },
      { id: "j2_p22_r2", items: [{ id: "3", arabic: "وَاَتَى", latin: "WA - A - TAA", isLong: true }, { id: "4", arabic: "فَاَوَى", latin: "FA - A - WAA", isLong: true }, { id: "5", arabic: "يَتَامَى", latin: "YA - TAA - MAA", isLong: true }, { id: "6", arabic: "فَنَادَى", latin: "FA - NA - DAA", isLong: true }] },
      { id: "j2_p22_r3", items: [{ id: "7", arabic: "فَهَدَى", latin: "FA - HA - DAA", isLong: true }, { id: "8", arabic: "وَعَصَى", latin: "WA - 'A - SHAA", isLong: true }, { id: "9", arabic: "لَعَلَّى", latin: "LA - 'A - LLAA", isLong: true }, { id: "10", arabic: "فَقَضَى", latin: "FA - QA - DHAA", isLong: true }] },
      { id: "j2_p22_r4", items: [{ id: "11", arabic: "مَعَاشَا", latin: "MA - 'AA - SYAA", isLong: true }, { id: "12", arabic: "خَطَايَا", latin: "KHA - THAA - YAA", isLong: true }, { id: "13", arabic: "ثُلُثَا", latin: "TSU - LU - TSAA", isLong: true }, { id: "14", arabic: "دَحَهَا", latin: "DA - HA - HAA", isLong: true }] },
      { id: "j2_p22_r5", items: [{ id: "15", arabic: "خَالِطَا", latin: "KHAA - LI - THAA", isLong: true }, { id: "16", arabic: "صَوَابَ", latin: "SHA - WAA - BA", isLong: true }, { id: "17", arabic: "ضَالَلَ", latin: "DHAA - LA - LA", isLong: true }, { id: "18", arabic: "سَرَابَ", latin: "SA - RAA - BA", isLong: true }] },
      { id: "j2_p22_r6", items: [{ id: "19", arabic: "اَخَذَ", latin: "A - KHA - DZA" }, { id: "20", arabic: "وَعَاظَ", latin: "WA - 'AA - ZHA", isLong: true }, { id: "21", arabic: "غَمَامَ", latin: "GHA - MAA - MA", isLong: true }, { id: "22", arabic: "شَهَادَ", latin: "SYA - HAA - DA", isLong: true }] },
      { id: "j2_p22_r7", items: [{ id: "23", arabic: "جَهَالاَ", latin: "JA - HAA - LAA", isLong: true }, { id: "24", arabic: "تَعَالَى", latin: "TA - 'AA - LAA", isLong: true }, { id: "25", arabic: "عَجَابَا", latin: "'A - JAA - BAA", isLong: true }, { id: "26", arabic: "نَصَارَى", latin: "NA - SHAA - RAA", isLong: true }] },
      { id: "j2_p22_r8", items: [{ id: "27", arabic: "ثَمَرَاتَ", latin: "TSA - MA - RAA - TA", isLong: true }, { id: "28", arabic: "مَاعَرَفَا", latin: "MAA - 'A - RA - FAA", isLong: true }, { id: "29", arabic: "وَبَصَلَهَا", latin: "WA - BA - SHA - LA - HAA", isLong: true }] }
    ]
  },
  {
    pageNumber: 23,
    title: "Halaman 23: Perbandingan Pasangan Vokal Pendek vs Vokal Panjang",
    subtitle: "Latihan kontras perubahan suku kata kedua dan keempat",
    teacherNote: "Bandingkan perubahan rasa bacaan saat huruf di tengah dipanjangkan (2 harakat).",
    rows: [
      { id: "j2_p23_r1", items: [{ id: "1", arabic: "رَمَى", latin: "RA - MAA", isLong: true }, { id: "2", arabic: "رَمَيَا", latin: "RA - MA - YAA", isLong: true }, { id: "3", arabic: "رَامَى", latin: "RAA - MAA", isLong: true }, { id: "4", arabic: "رَمَايَا", latin: "RA - MAA - YAA", isLong: true }] },
      { id: "j2_p23_r2", items: [{ id: "5", arabic: "بَاعَ", latin: "BAA - 'A", isLong: true }, { id: "6", arabic: "بَيَعَا", latin: "BA - YA - 'AA", isLong: true }, { id: "7", arabic: "بَايَعَ", latin: "BAA - YA - 'A", isLong: true }, { id: "8", arabic: "بَيَاعَا", latin: "BA - YAA - 'AA", isLong: true }] },
      { id: "j2_p23_r3", items: [{ id: "9", arabic: "قَامَ", latin: "QAA - MA", isLong: true }, { id: "10", arabic: "قَوَمَا", latin: "QA - WA - MAA", isLong: true }, { id: "11", arabic: "قَاوَمَ", latin: "QAA - WA - MA", isLong: true }, { id: "12", arabic: "قَوَامَا", latin: "QA - WAA - MAA", isLong: true }] },
      { id: "j2_p23_r4", items: [{ id: "13", arabic: "دَامَ", latin: "DAA - MA", isLong: true }, { id: "14", arabic: "دَوَمَا", latin: "DA - WA - MAA", isLong: true }, { id: "15", arabic: "دَاوَمَ", latin: "DAA - WA - MA", isLong: true }, { id: "16", arabic: "دَوَامَا", latin: "DA - WAA - MAA", isLong: true }] },
      { id: "j2_p23_r5", items: [{ id: "17", arabic: "عَانَ", latin: "'AAN - A", isLong: true }, { id: "18", arabic: "عَنَيَا", latin: "'A - NA - YAA", isLong: true }, { id: "19", arabic: "عَانَى", latin: "'AA - NAA", isLong: true }, { id: "20", arabic: "عَنَايَا", latin: "'A - NAA - YAA", isLong: true }] },
      { id: "j2_p23_r6", items: [{ id: "21", arabic: "زَادَ", latin: "ZAA - DA", isLong: true }, { id: "22", arabic: "زَدَيَا", latin: "ZA - DA - YAA", isLong: true }, { id: "23", arabic: "زَادَى", latin: "ZAA - DAA", isLong: true }, { id: "24", arabic: "زَدَايَا", latin: "ZA - DAA - YAA", isLong: true }] },
      { id: "j2_p23_r7", items: [{ id: "25", arabic: "حَالَ", latin: "HAA - LA", isLong: true }, { id: "26", arabic: "حَلَوَا", latin: "HA - LA - WAA", isLong: true }, { id: "27", arabic: "حَالَو", latin: "HAA - LAW", isLong: true }, { id: "28", arabic: "حَلاَوَا", latin: "HA - LAA - WAA", isLong: true }] },
      { id: "j2_p23_r8", items: [{ id: "29", arabic: "قَالَ", latin: "QAA - LA", isLong: true }, { id: "30", arabic: "قَلَوَا", latin: "QA - LA - WAA", isLong: true }, { id: "31", arabic: "قَالُو", latin: "QAA - LUU", isLong: true }, { id: "32", arabic: "قَلاَوَا", latin: "QA - LAA - WAA", isLong: true }] }
    ]
  },
  {
    pageNumber: 24,
    title: "Halaman 24: Bentuk Penulisan Alif Lam & Tasydid Sederhana (لَمَا = لَمَّا)",
    subtitle: "Mengenal bentuk Alif Mad yang menyatu dengan Lam",
    teacherNote: "Perhatikan bentuk penulisan لَمَا = لَمَّا.",
    rows: [
      { id: "j2_p24_r1", items: [{ id: "1", arabic: "لَمَا = لَمَّا", latin: "LAMA = LAMMA" }] },
      { id: "j2_p24_r2", items: [{ id: "2", arabic: "وَمَانَهَا", latin: "WA - MAA - NA - HAA", isLong: true }, { id: "3", arabic: "وَلَمَكَ", latin: "WA - LA - MA - KA" }, { id: "4", arabic: "فَجَزَهَا", latin: "FA - JA - ZA - HAA", isLong: true }] },
      { id: "j2_p24_r3", items: [{ id: "5", arabic: "ضَرَبَتَا", latin: "DHA - RA - BA - TAA", isLong: true }, { id: "6", arabic: "فَحَفِظَ", latin: "FA - HA - FI - ZHA" }, { id: "7", arabic: "جَمَعَمَا", latin: "JA - MA - 'A - MAA", isLong: true }] },
      { id: "j2_p24_r4", items: [{ id: "8", arabic: "سَقَلَهَا", latin: "SA - QA - LA - HAA", isLong: true }, { id: "9", arabic: "وَلَمَقَ", latin: "WA - LA - MA - QA" }, { id: "10", arabic: "فَاَفَلاَ", latin: "FA - A - FA - LAA", isLong: true }] },
      { id: "j2_p24_r5", items: [{ id: "11", arabic: "فَرَاشَهَا", latin: "FA - RAA - SYA - HAA", isLong: true }, { id: "12", arabic: "وَلَمَطَ", latin: "WA - LA - MA - THA" }, { id: "13", arabic: "لَطَلَعَا", latin: "LA - THA - LA - 'AA", isLong: true }] },
      { id: "j2_p24_r6", items: [{ id: "14", arabic: "تَنَازَعَا", latin: "TA - NAA - ZA - 'AA", isLong: true }, { id: "15", arabic: "فَخَفَّفَ", latin: "FA - KHA - FFA - FA" }, { id: "16", arabic: "نَدَرَكَا", latin: "NA - DA - RA - KAA", isLong: true }] },
      { id: "j2_p24_r7", items: [{ id: "17", arabic: "وَمَابَنَى", latin: "WA - MAA - BA - NAA", isLong: true }, { id: "18", arabic: "وَلَمَحَ", latin: "WA - LA - MA - HA" }, { id: "19", arabic: "ذَنَبَهَا", latin: "DZA - NA - BA - HAA", isLong: true }] },
      { id: "j2_p24_r8", items: [{ id: "20", arabic: "وَثَاقَهَا", latin: "WA - TSAA - QA - HAA", isLong: true }, { id: "21", arabic: "وَشَفَقَ", latin: "WA - SYA - FA - QA" }, { id: "22", arabic: "نَبَذَهَا", latin: "NA - BA - DZA - HAA", isLong: true }] }
    ]
  },
  {
    pageNumber: 25,
    title: "Halaman 25: Latihan Kombinasi Kata Tiga Suku Kata",
    subtitle: "Menguji ketepatan Makhraj dan Mad Alif",
    teacherNote: "Pastikan suku kata ber-Alif dibaca 2 harakat penuh, tidak kurang dan tidak lebih.",
    rows: [
      { id: "j2_p25_r1", items: [{ id: "1", arabic: "لَمَسَ", latin: "LA - MA - SA" }, { id: "2", arabic: "جَعَالَ", latin: "JA - 'AA - LA", isLong: true }, { id: "3", arabic: "نَبَاتَا", latin: "NA - BAA - TAA", isLong: true }] },
      { id: "j2_p25_r2", items: [{ id: "4", arabic: "غَفَرَ", latin: "GHA - FA - RA" }, { id: "5", arabic: "نَهَارَ", latin: "NA - HAA - RA", isLong: true }, { id: "6", arabic: "مَعَاشَا", latin: "MA - 'AA - SYAA", isLong: true }] },
      { id: "j2_p25_r3", items: [{ id: "7", arabic: "لَمَطَ", latin: "LA - MA - THA" }, { id: "8", arabic: "حَكَمَا", latin: "HA - KA - MAA", isLong: true }, { id: "9", arabic: "رَصَادَ", latin: "RA - SHAA - DA", isLong: true }] },
      { id: "j2_p25_r4", items: [{ id: "10", arabic: "لَبَثَ", latin: "LA - BA - TSA" }, { id: "11", arabic: "اَصَابَ", latin: "A - SHAA - BA", isLong: true }, { id: "12", arabic: "غَسَاقَا", latin: "GHA - SAA - QAA", isLong: true }] },
      { id: "j2_p25_r5", items: [{ id: "13", arabic: "نَظَرَ", latin: "NA - ZHA - RA" }, { id: "14", arabic: "خَطَايَ", latin: "KHA - THAA - YA", isLong: true }, { id: "15", arabic: "مَاَابَا", latin: "MAA - A - BAA", isLong: true }] },
      { id: "j2_p25_r6", items: [{ id: "16", arabic: "لَمَزَ", latin: "LA - MA - ZA" }, { id: "17", arabic: "اَتَكَ", latin: "A - TA - KA" }, { id: "18", arabic: "شَرَابَا", latin: "SYA - RAA - BAA", isLong: true }] },
      { id: "j2_p25_r7", items: [{ id: "19", arabic: "مَلَكَ", latin: "MA - LA - KA" }, { id: "20", arabic: "قَبَاضَ", latin: "QA - BAA - DHA", isLong: true }, { id: "21", arabic: "هَدَنَا", latin: "HA - DA - NAA", isLong: true }] },
      { id: "j2_p25_r8", items: [{ id: "22", arabic: "قَدَرَ", latin: "QA - DA - RA" }, { id: "23", arabic: "وَمَالَ", latin: "WA - MAA - LA", isLong: true }, { id: "24", arabic: "عَذَابَا", latin: "'A - DZAA - BAA", isLong: true }] }
    ]
  },
  {
    pageNumber: 26,
    title: "Halaman 26: Latihan Empat Suku Kata Lanjutan",
    subtitle: "Pemantapan konsistensi tempo bacaan",
    teacherNote: "Jaga ayunan tempo tetap stabil dari awal hingga akhir kata.",
    rows: [
      { id: "j2_p26_r1", items: [{ id: "1", arabic: "يَدَهَا", latin: "YA - DA - HAA", isLong: true }, { id: "2", arabic: "شَهَادَتَا", latin: "SYA - HAA - DA - TAA", isLong: true }, { id: "3", arabic: "فَتَعَالَى", latin: "FA - TA - 'AA - LAA", isLong: true }] },
      { id: "j2_p26_r2", items: [{ id: "4", arabic: "لَمَاطَا", latin: "LA - MAA - THAA", isLong: true }, { id: "5", arabic: "لَفَارَغَا", latin: "LA - FAA - RA - GHAA", isLong: true }, { id: "6", arabic: "وَمَتَاعَا", latin: "WA - MA - TAA - 'AA", isLong: true }] },
      { id: "j2_p26_r3", items: [{ id: "7", arabic: "اَثَاتَا", latin: "A - TSAA - TAA", isLong: true }, { id: "8", arabic: "لاَذَنَ", latin: "LAA - DZA - NA", isLong: true }, { id: "9", arabic: "فَمَقَامَا", latin: "FA - MA - QAA - MAA", isLong: true }] },
      { id: "j2_p26_r4", items: [{ id: "10", arabic: "لَكَانَا", latin: "LA - KAA - NAA", isLong: true }, { id: "11", arabic: "حَيَوَتَهَا", latin: "HA - YA - WA - TA - HAA", isLong: true }, { id: "12", arabic: "لاَعَازَا", latin: "LAA - 'AA - ZAA", isLong: true }] },
      { id: "j2_p26_r5", items: [{ id: "13", arabic: "لَمَاقَا", latin: "LA - MAA - QAA", isLong: true }, { id: "14", arabic: "وَاَشَرَا", latin: "WA - A - SYA - RAA", isLong: true }, { id: "15", arabic: "فَصَوَابَا", latin: "FA - SHA - WAA - BAA", isLong: true }] },
      { id: "j2_p26_r6", items: [{ id: "16", arabic: "فَنَادَى", latin: "FA - NA - DAA", isLong: true }, { id: "17", arabic: "طَهَارَهَا", latin: "THA - HAA - RA - HAA", isLong: true }, { id: "18", arabic: "وَكَظَامَا", latin: "WA - KA - ZHAA - MAA", isLong: true }] },
      { id: "j2_p26_r7", items: [{ id: "19", arabic: "وَكَانَا", latin: "WA - KAA - NAA", isLong: true }, { id: "20", arabic: "زَكَتَهَا", latin: "ZA - KA - TA - HAA", isLong: true }, { id: "21", arabic: "لَيَدَهَا", latin: "LA - YA - DA - HAA", isLong: true }] },
      { id: "j2_p26_r8", items: [{ id: "22", arabic: "لَخَافَا", latin: "LA - KHAA - FAA", isLong: true }, { id: "23", arabic: "لاَاَشَرَّ", latin: "LAA - A - SYA - RRA", isLong: true }, { id: "24", arabic: "لَضَلاَلاَ", latin: "LA - DHA - LAA - LAA", isLong: true }] }
    ]
  },
  {
    pageNumber: 27,
    title: "Halaman 27: Penguatan Rangkaian Frasa Al-Qur'an",
    subtitle: "Latihan membaca kalimat pendek bersambung",
    teacherNote: "Perhatikan perpaduan harakat pendek dan huruf bertasydid/ber-Alif.",
    rows: [
      { id: "j2_p27_r1", items: [{ id: "1", arabic: "لاَمَعَكَ", latin: "LAA - MA - 'A - KA", isLong: true }, { id: "2", arabic: "عَجَبَا", latin: "'A - JA - BAA", isLong: true }, { id: "3", arabic: "وَصَعَدَا", latin: "WA - SHA - 'A - DAA", isLong: true }] },
      { id: "j2_p27_r2", items: [{ id: "4", arabic: "لاَصَبَرَ", latin: "LAA - SHA - BA - RA", isLong: true }, { id: "5", arabic: "شَطَطَا", latin: "SYA - THA - THAA", isLong: true }, { id: "6", arabic: "لَغَسَلاَ", latin: "LA - GHA - SA - LAA", isLong: true }] },
      { id: "j2_p27_r3", items: [{ id: "7", arabic: "مَافَضَلاَ", latin: "MAA - FA - DHA - LAA", isLong: true }, { id: "8", arabic: "حَرَسَا", latin: "HA - RA - SAA", isLong: true }, { id: "9", arabic: "فَغَدَقَا", latin: "FA - GHA - DA - QAA", isLong: true }] },
      { id: "j2_p27_r4", items: [{ id: "10", arabic: "مَاحَسَنَ", latin: "MAA - HA - SA - NA", isLong: true }, { id: "11", arabic: "قَعَدَا", latin: "QA - 'A - DAA", isLong: true }, { id: "12", arabic: "وَاَمَدَا", latin: "WA - A - MA - DAA", isLong: true }] },
      { id: "j2_p27_r5", items: [{ id: "13", arabic: "لاَزَهَقَ", latin: "LAA - ZA - HA - QA", isLong: true }, { id: "14", arabic: "رَصَدَا", latin: "RA - SHA - DAA", isLong: true }, { id: "15", arabic: "فَهَرَبَا", latin: "FA - HA - RA - BAA", isLong: true }] },
      { id: "j2_p27_r6", items: [{ id: "16", arabic: "مَاعَظَمَ", latin: "MAA - 'A - ZHA - MA", isLong: true }, { id: "17", arabic: "شَهَدَا", latin: "SYA - HA - DAA", isLong: true }, { id: "18", arabic: "وَثَقَلاَ", latin: "WA - TSA - QA - LAA", isLong: true }] },
      { id: "j2_p27_r7", items: [{ id: "19", arabic: "لاَمَرَضَ", latin: "LAA - MA - RA - DHA", isLong: true }, { id: "20", arabic: "رَهَقَا", latin: "RA - HA - QAA", isLong: true }, { id: "21", arabic: "فَهَجَرَ", latin: "FA - HA - JA - RA" }] },
      { id: "j2_p27_r8", items: [{ id: "22", arabic: "مَاغَدَقَ", latin: "MAA - GHA - DA - QA", isLong: true }, { id: "23", arabic: "خَطَبَا", latin: "KHA - THA - BAA", isLong: true }, { id: "24", arabic: "فَسَجَدَ", latin: "FA - SA - JA - DA" }] }
    ]
  },
  {
    pageNumber: 28,
    title: "Halaman 28: Kelancaran Tingkat Tinggi Tiga & Empat Suku Kata",
    subtitle: "Mempersiapkan santri memasuki uji evaluasi EBTA Iqro 2",
    teacherNote: "Pastikan santri tidak membaca terseret pada suku kata pendek.",
    rows: [
      { id: "j2_p28_r1", items: [{ id: "1", arabic: "لاَاَذَبَ", latin: "LAA - A - DZA - BA", isLong: true }, { id: "2", arabic: "وَلَمَمَ", latin: "WA - LA - MA - MA" }, { id: "3", arabic: "وَسَقَهَا", latin: "WA - SA - QA - HAA", isLong: true }] },
      { id: "j2_p28_r2", items: [{ id: "4", arabic: "وَنَاظَرَ", latin: "WA - NAA - ZHA - RA", isLong: true }, { id: "5", arabic: "فَحَدَّثَ", latin: "FA - HA - DDA - TSA" }, { id: "6", arabic: "لَشَرَابَا", latin: "LA - SYA - RAA - BAA", isLong: true }] },
      { id: "j2_p28_r3", items: [{ id: "7", arabic: "بَنَانَكَ", latin: "BA - NAA - NA - KA", isLong: true }, { id: "8", arabic: "لَفَسَقَ", latin: "LA - FA - SA - QA" }, { id: "9", arabic: "وَضَلاَلاَ", latin: "WA - DHA - LAA - LAA", isLong: true }] },
      { id: "j2_p28_r4", items: [{ id: "10", arabic: "وَحَافَظَ", latin: "WA - HAA - FA - ZHA", isLong: true }, { id: "11", arabic: "فَحَضَرَ", latin: "FA - HA - DHA - RA" }, { id: "12", arabic: "فَخَسَارَا", latin: "FA - KHA - SAA - RAA", isLong: true }] },
      { id: "j2_p28_r5", items: [{ id: "13", arabic: "لَذَكَرَ", latin: "LA - DZA - KA - RA" }, { id: "14", arabic: "لَمَعَكَ", latin: "LA - MA - 'A - KA" }, { id: "15", arabic: "وَنَصَارَى", latin: "WA - NA - SHAA - RAA", isLong: true }] },
      { id: "j2_p28_r6", items: [{ id: "16", arabic: "وَآخَرَ", latin: "WA - AA - KHA - RA", isLong: true }, { id: "17", arabic: "فَغَفَرَ", latin: "FA - GHA - FA - RA" }, { id: "18", arabic: "فَلاَزَادَ", latin: "FA - LAA - ZAA - DA", isLong: true }] },
      { id: "j2_p28_r7", items: [{ id: "19", arabic: "اَمَامَكَ", latin: "A - MAA - MA - KA", isLong: true }, { id: "20", arabic: "وَنَبَذَ", latin: "WA - NA - BA - DZA" }, { id: "21", arabic: "لَخَطَايَا", latin: "LA - KHA - THAA - YAA", isLong: true }] },
      { id: "j2_p28_r8", items: [{ id: "22", arabic: "تَدَارَكَا", latin: "TA - DAA - RA - KAA", isLong: true }, { id: "23", arabic: "يَظْهَرَ", latin: "YA - ZH - HA - RA" }, { id: "24", arabic: "لاَزَاغَا", latin: "LAA - ZAA - GHAA", isLong: true }] }
    ]
  },
  {
    pageNumber: 29,
    title: "Halaman 29: JELAS BEDAKAN Bunyi Huruf & Panjang Pendeknya",
    subtitle: "Uji kontras ketelitian bunyi huruf yang mirip",
    teacherNote: "JELAS BEDAKAN Bunyi Huruf dan Panjang Pendeknya!",
    rows: [
      { id: "j2_p29_r1", items: [{ id: "1", arabic: "ثَاشَ", latin: "TSAA - SYA", isLong: true }, { id: "2", arabic: "سَاشَ", latin: "SAA - SYA", isLong: true }, { id: "3", arabic: "سَاثَ", latin: "SAA - TSA", isLong: true }, { id: "4", arabic: "صَاثَ", latin: "SHAA - TSA", isLong: true }] },
      { id: "j2_p29_r2", items: [{ id: "5", arabic: "شَاَ", latin: "SYAA - A", isLong: true }, { id: "6", arabic: "اَهَ", latin: "A - HA" }, { id: "7", arabic: "اَعَ", latin: "A - 'A" }, { id: "8", arabic: "حَاهَ", latin: "HAA - HA", isLong: true }] },
      { id: "j2_p29_r3", items: [{ id: "9", arabic: "قَاخَ", latin: "QAA - KHA", isLong: true }, { id: "10", arabic: "خَاغَ", latin: "KHAA - GHA", isLong: true }, { id: "11", arabic: "كَاَقَ", latin: "KAA - A - QA", isLong: true }, { id: "12", arabic: "تَاَطَ", latin: "TAA - A - THA", isLong: true }] },
      { id: "j2_p29_r4", items: [{ id: "13", arabic: "يَازَ", latin: "YAA - ZA", isLong: true }, { id: "14", arabic: "زَاجَ", latin: "ZAA - JA", isLong: true }, { id: "15", arabic: "زَاذَ", latin: "ZAA - DZA", isLong: true }, { id: "16", arabic: "ذَاَظَ", latin: "DZAA - A - ZHA", isLong: true }] },
      { id: "j2_p29_r5", items: [{ id: "17", arabic: "ظَاضَ", latin: "ZHAA - DHA", isLong: true }, { id: "18", arabic: "ضَاظَ", latin: "DHAA - ZHA", isLong: true }, { id: "19", arabic: "ظَاصَ", latin: "ZHAA - SHA", isLong: true }, { id: "20", arabic: "ظَاضَ", latin: "ZHAA - DHA", isLong: true }] },
      { id: "j2_p29_r6", items: [{ id: "21", arabic: "اَ عَ هَ حَ خَ قَ غَ ...غَى", latin: "Urutan Huruf Halq & Mad" }] },
      { id: "j2_p29_r7", items: [{ id: "22", arabic: "بَهَسَ", latin: "BA - HA - SA" }, { id: "23", arabic: "سَمَ", latin: "SA - MA" }, { id: "24", arabic: "سَجَ", latin: "SA - JA" }, { id: "25", arabic: "مَكَ", latin: "MA - KA" }, { id: "26", arabic: "صَابَارَا", latin: "SHAA - BAA - RAA", isLong: true }] }
    ]
  },
  {
    pageNumber: 30,
    title: "Halaman 30: EBTA Evaluasi Belajar Tahap Akhir Buku Iqro 2",
    subtitle: "Ujian Kelulusan Resmi Jilid 2 (Makhraj & Panjang Pendek)",
    teacherNote: "EBTA: Bila bacaan telah benar makhrojnya (walau pelan) dan betul semua PANJANG - PENDEKNYA boleh naik ke jilid berikutnya .............",
    rows: [
      { id: "j2_p30_r1", items: [{ id: "1", arabic: "ثَابَتَ", latin: "TSAA - BA - TA", isLong: true }, { id: "2", arabic: "اَذَانَ", latin: "A - DZAA - NA", isLong: true }, { id: "3", arabic: "صَالِحَا", latin: "SHAA - LI - HAA", isLong: true }, { id: "4", arabic: "خَطَايَايَ", latin: "KHA - THAA - YAA - YA", isLong: true }] },
      { id: "j2_p30_r2", items: [{ id: "5", arabic: "تَوَّابَ", latin: "TA - WWAA - BA", isLong: true }, { id: "6", arabic: "هَمَزَ", latin: "HA - MA - ZA" }, { id: "7", arabic: "خَافَتَا", latin: "KHAA - FA - TAA", isLong: true }, { id: "8", arabic: "لَضَلاَلاَ", latin: "LA - DHA - LAA - LAA", isLong: true }] },
      { id: "j2_p30_r3", items: [{ id: "9", arabic: "لَعَنَ", latin: "LA - 'A - NA" }, { id: "10", arabic: "الاَفَ", latin: "ALAA - FA", isLong: true }, { id: "11", arabic: "حَكَمَا", latin: "HA - KA - MAA", isLong: true }, { id: "12", arabic: "لَجَمَاعَ", latin: "LA - JA - MAA - 'A", isLong: true }] },
      { id: "j2_p30_r4", items: [{ id: "13", arabic: "غِلَظَا", latin: "GHI - LA - ZHAA", isLong: true }, { id: "14", arabic: "فَتَقَى", latin: "FA - TA - QAA", isLong: true }, { id: "15", arabic: "نَذَارَا", latin: "NA - DZAA - RAA", isLong: true }, { id: "16", arabic: "قَالَ بَلَى", latin: "QAA - LA - BA - LAA", isLong: true }] },
      { id: "j2_p30_r5", items: [{ id: "17", arabic: "فَطَغَى", latin: "FA - THA - GHAA", isLong: true }, { id: "18", arabic: "يَتَامَى", latin: "YA - TAA - MAA", isLong: true }, { id: "19", arabic: "لَمَكَا", latin: "LA - MA - KAA", isLong: true }, { id: "20", arabic: "لاَاطَاعَ", latin: "LAA - A - THAA - 'A", isLong: true }] },
      { id: "j2_p30_r6", items: [{ id: "21", arabic: "شَهَادَ", latin: "SYA - HAA - DA", isLong: true }, { id: "22", arabic: "فَقَضَى", latin: "FA - QA - DHAA", isLong: true }, { id: "23", arabic: "حَوَايَا", latin: "HA - WAA - YAA", isLong: true }, { id: "24", arabic: "بَنَانَكَ", latin: "BA - NAA - NA - KA", isLong: true }] },
      { id: "j2_p30_r7", items: [{ id: "25", arabic: "مَلاَ", latin: "MA - LAA", isLong: true }, { id: "26", arabic: "عَجَلاَ", latin: "'A - JA - LAA", isLong: true }, { id: "27", arabic: "آلَ", latin: "AA - LA", isLong: true }, { id: "28", arabic: "وَلَمَمَا", latin: "WA - LA - MA - MAA", isLong: true }] }
    ],
    quizQuestions: [
      {
        id: "q_j2_final",
        questionArabic: "ثَابَتَ . اَذَانَ . صَالِحَا . قَالَ بَلَى",
        questionText: "Apakah Anda telah menguasai membedakan panjang 2 harakat (Mad Alif) dan pendek 1 harakat secara tepat tanpa tertukar?",
        options: [
          "Sudah sangat lancar & siap naik ke Iqro 3",
          "Masih perlu melatih ketepatan panjang pendek"
        ],
        correctIndex: 0
      }
    ]
  }
];

// Read src/data/iqroData.ts
const filePath = path.join(__dirname, '../src/data/iqroData.ts');
let code = fs.readFileSync(filePath, 'utf8');

// Find start of level 2
const level2Marker = "level: 2,";
const level2Idx = code.indexOf(level2Marker);

// Find "pages: [" inside level 2
const pagesStartIdx = code.indexOf("pages: [", level2Idx);

// Find "level: 3,"
const level3Idx = code.indexOf("level: 3,");
const level3ObjStart = code.lastIndexOf("{", level3Idx);

const before = code.substring(0, pagesStartIdx + "pages: ".length);
const after = code.substring(level3ObjStart);

const jsonPages = JSON.stringify(iqro2Pages, null, 6);

const newCode = before + jsonPages + ",\n  },\n\n  " + after;

fs.writeFileSync(filePath, newCode, 'utf8');
console.log("Successfully updated Iqro Jilid 2 with ALL 30 pages cleanly!");
