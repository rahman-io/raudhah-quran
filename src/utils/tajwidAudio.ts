/**
 * Pure Human Qari Audio Service for Tajweed & Makhraj Learning.
 * 
 * 100% SUARA ASLI MANUSIA DARI QARI BERSANAD RESMI:
 * 1. Syaikh Mishary Rashid Al-Afasy (Sanad Hafsh 'an 'Ashim dari Syaikh Ahmad Abdul Aziz Az-Zayyat)
 * 2. Syaikh Mahmoud Khalil Al-Hushari (Syaikh Maqari' Mesir, Maestro Tajwid & Sanad Tertinggi Abad ke-20)
 * 
 * Bebas dari segala bentuk Text-To-Speech (TTS), AI audio, atau sintesis buatan perangkat.
 * Menggunakan HTML5 Audio API dengan dukungan pengaturan tempo talaqqi (0.5x, 0.75x, 1.0x, 1.25x)
 * serta preservasi pitch alami.
 */

export type QariId = 'alafasy' | 'husary';

export interface QariProfile {
  id: QariId;
  name: string;
  title: string;
  sanad: string;
  baseUrl: string;
}

export const QARI_PROFILES: Record<QariId, QariProfile> = {
  alafasy: {
    id: 'alafasy',
    name: 'Syaikh Mishary Rashid Al-Afasy',
    title: 'Imam Masjidil Kabir Kuwait & Qari Internasional',
    sanad: 'Sanad Riwayat Hafsh \'an \'Ashim (Thariq Asy-Syathibiyyah)',
    baseUrl: 'https://everyayah.com/data/Alafasy_128kbps/'
  },
  husary: {
    id: 'husary',
    name: 'Syaikh Mahmoud Khalil Al-Hushari (Mu\'allim)',
    title: 'Syaikhul Maqari\' Al-Mishriyyah (Maestro Talaqqi Tajwid)',
    sanad: "Sanad Riwayat Hafsh 'an 'Ashim & Qira'at 'Asyrah Al-Kubra",
    baseUrl: 'https://everyayah.com/data/Husary_Muallim_128kbps/'
  }
};

let activeQari: QariId = 'alafasy';

export function setActiveQari(qari: QariId) {
  activeQari = qari;
}

export function getActiveQari(): QariId {
  return activeQari;
}

/**
 * Generate authenticated EveryAyah MP3 URL for any Surah and Ayah.
 */
export function getAyahAudioUrl(surah: number, ayah: number, qari: QariId = activeQari): string {
  const s = String(surah).padStart(3, '0');
  const a = String(ayah).padStart(3, '0');
  const profile = QARI_PROFILES[qari] || QARI_PROFILES.alafasy;
  return `${profile.baseUrl}${s}${a}.mp3`;
}

export interface LetterPhoneticInfo {
  letter: string;
  nameLatin: string;
  transliteration: string;
  makhraj: string;
  sifat: string;
  tips: string;
  singleLetterAudioUrl?: string;
  // Human Talaqqi Quranic Proof:
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  targetWordArabic: string;
  exampleVerseArabic: string;
  exampleVerseLatin: string;
  audioUrlAlafasy: string;
  audioUrlHusary: string;
  qariSanad: string;
}

/**
 * Isolated authentic human recordings for individual letters (Alif, Ba, Ta, Tsa, Shod, etc.).
 * 100% human voice, ~1 second duration, no AI/TTS.
 */
export const ISOLATED_LETTER_AUDIO: Record<string, string> = {
  'ء': '/audio/letters/hamzah.mp3',
  'ا': '/audio/letters/alif.mp3',
  'ب': '/audio/letters/baa.mp3',
  'ت': '/audio/letters/taa.mp3',
  'ث': '/audio/letters/tsaa.mp3',
  'ج': '/audio/letters/jeem.mp3',
  'ح': '/audio/letters/haa.mp3',
  'خ': '/audio/letters/khaa.mp3',
  'د': '/audio/letters/daal.mp3',
  'ذ': '/audio/letters/dzaal.mp3',
  'ر': '/audio/letters/raa.mp3',
  'ز': '/audio/letters/zay.mp3',
  'س': '/audio/letters/seen.mp3',
  'ش': '/audio/letters/sheen.mp3',
  'ص': '/audio/letters/shaad.mp3',
  'ض': '/audio/letters/dhaad.mp3',
  'ط': '/audio/letters/thaa.mp3',
  'ظ': '/audio/letters/zhaa.mp3',
  'ع': '/audio/letters/ain.mp3',
  'غ': '/audio/letters/ghain.mp3',
  'ف': '/audio/letters/faa.mp3',
  'ق': '/audio/letters/qaaf.mp3',
  'ك': '/audio/letters/kaaf.mp3',
  'ل': '/audio/letters/laam.mp3',
  'م': '/audio/letters/meem.mp3',
  'ن': '/audio/letters/noon.mp3',
  'ه': '/audio/letters/haah.mp3',
  'هـ': '/audio/letters/haah.mp3',
  'و': '/audio/letters/waw.mp3',
  'ي': '/audio/letters/yaa.mp3',
  'ى': '/audio/letters/yaa.mp3',
  'لا': '/audio/letters/laam.mp3',
  'نّ': '/audio/letters/noon.mp3',
  'مّ': '/audio/letters/meem.mp3'
};

/**
 * IQRO Harakat & Word Audio Map (A, I, U, Ba, Bi, Bu, Ta, Ti, Tu, Ku-ti-ba, Ru-su-lu, etc.)
 * 100% authentic human vocal recordings.
 */
export const IQRO_HARAKAT_AUDIO_MAP: Record<string, string> = {
  // Single Hijaiyah Letter Audio Mappings (Using clean audio from /audio/iqro/harakat/ and /audio/letters/)
  'اَ': '/audio/iqro/harakat/a.mp3',
  'أَ': '/audio/iqro/harakat/a.mp3',
  'اِ': '/audio/iqro/harakat/i.mp3',
  'إِ': '/audio/iqro/harakat/i.mp3',
  'اُ': '/audio/iqro/harakat/u.mp3',
  'أُ': '/audio/iqro/harakat/u.mp3',
  'ا': '/audio/letters/alif.mp3',

  'بَ': '/audio/iqro/harakat/ba.mp3',
  'بِ': '/audio/iqro/harakat/bi.mp3',
  'بُ': '/audio/iqro/harakat/bu.mp3',
  'ب': '/audio/letters/baa.mp3',

  'تَ': '/audio/iqro/harakat/ta.mp3',
  'تِ': '/audio/iqro/harakat/ti.mp3',
  'تُ': '/audio/iqro/harakat/tu.mp3',
  'ت': '/audio/letters/taa.mp3',

  'ثَ': '/audio/iqro/harakat/tsa.mp3',
  'ثِ': '/audio/iqro/harakat/tsa.mp3',
  'ثُ': '/audio/iqro/harakat/tsa.mp3',
  'ث': '/audio/letters/tsaa.mp3',

  'جَ': '/audio/iqro/harakat/ja.mp3',
  'جِ': '/audio/iqro/harakat/ja.mp3',
  'جُ': '/audio/iqro/harakat/ja.mp3',
  'ج': '/audio/letters/jeem.mp3',

  'حَ': '/audio/iqro/harakat/ha.mp3',
  'حِ': '/audio/iqro/harakat/ha.mp3',
  'حُ': '/audio/iqro/harakat/ha.mp3',
  'ح': '/audio/letters/haa.mp3',

  'خَ': '/audio/iqro/harakat/kha.mp3',
  'خِ': '/audio/iqro/harakat/kha.mp3',
  'خُ': '/audio/iqro/harakat/kha.mp3',
  'خ': '/audio/letters/khaa.mp3',

  'دَ': '/audio/iqro/harakat/da.mp3',
  'دِ': '/audio/iqro/harakat/da.mp3',
  'دُ': '/audio/iqro/harakat/da.mp3',
  'د': '/audio/letters/daal.mp3',

  'ذَ': '/audio/iqro/harakat/dza.mp3',
  'ذِ': '/audio/iqro/harakat/dza.mp3',
  'ذُ': '/audio/iqro/harakat/dza.mp3',
  'ذ': '/audio/letters/dzaal.mp3',

  'رَ': '/audio/letters/raa.mp3',
  'رِ': '/audio/letters/raa.mp3',
  'رُ': '/audio/iqro/harakat/ru.mp3',
  'ر': '/audio/letters/raa.mp3',

  'زَ': '/audio/letters/zay.mp3',
  'زِ': '/audio/letters/zay.mp3',
  'زُ': '/audio/letters/zay.mp3',
  'ز': '/audio/letters/zay.mp3',

  'سَ': '/audio/letters/seen.mp3',
  'سِ': '/audio/letters/seen.mp3',
  'سُ': '/audio/iqro/harakat/su.mp3',
  'س': '/audio/letters/seen.mp3',

  'شَ': '/audio/letters/sheen.mp3',
  'شِ': '/audio/letters/sheen.mp3',
  'شُ': '/audio/letters/sheen.mp3',
  'ش': '/audio/letters/sheen.mp3',

  'صَ': '/audio/letters/shaad.mp3',
  'صِ': '/audio/letters/shaad.mp3',
  'صُ': '/audio/letters/shaad.mp3',
  'ص': '/audio/letters/shaad.mp3',

  'ضَ': '/audio/letters/dhaad.mp3',
  'ضِ': '/audio/letters/dhaad.mp3',
  'ضُ': '/audio/letters/dhaad.mp3',
  'ض': '/audio/letters/dhaad.mp3',

  'طَ': '/audio/letters/thaa.mp3',
  'طِ': '/audio/letters/thaa.mp3',
  'طُ': '/audio/letters/thaa.mp3',
  'ط': '/audio/letters/thaa.mp3',

  'ظَ': '/audio/letters/zhaa.mp3',
  'ظِ': '/audio/letters/zhaa.mp3',
  'ظُ': '/audio/letters/zhaa.mp3',
  'ظ': '/audio/letters/zhaa.mp3',

  'عَ': '/audio/letters/ain.mp3',
  'عِ': '/audio/letters/ain.mp3',
  'عُ': '/audio/letters/ain.mp3',
  'ع': '/audio/letters/ain.mp3',

  'غَ': '/audio/letters/ghain.mp3',
  'غِ': '/audio/letters/ghain.mp3',
  'غُ': '/audio/letters/ghain.mp3',
  'غ': '/audio/letters/ghain.mp3',

  'فَ': '/audio/letters/faa.mp3',
  'فِ': '/audio/letters/faa.mp3',
  'فُ': '/audio/letters/faa.mp3',
  'ف': '/audio/letters/faa.mp3',

  'قَ': '/audio/letters/qaaf.mp3',
  'قِ': '/audio/letters/qaaf.mp3',
  'قُ': '/audio/letters/qaaf.mp3',
  'ق': '/audio/letters/qaaf.mp3',

  'كَ': '/audio/letters/kaaf.mp3',
  'كِ': '/audio/letters/kaaf.mp3',
  'كُ': '/audio/iqro/harakat/ku.mp3',
  'ك': '/audio/letters/kaaf.mp3',

  'لَ': '/audio/letters/laam.mp3',
  'لِ': '/audio/letters/laam.mp3',
  'لُ': '/audio/iqro/harakat/lu.mp3',
  'ل': '/audio/letters/laam.mp3',

  'مَ': '/audio/letters/meem.mp3',
  'مِ': '/audio/letters/meem.mp3',
  'مُ': '/audio/letters/meem.mp3',
  'م': '/audio/letters/meem.mp3',

  'نَ': '/audio/letters/noon.mp3',
  'نِ': '/audio/letters/noon.mp3',
  'نُ': '/audio/letters/noon.mp3',
  'ن': '/audio/letters/noon.mp3',

  'وَ': '/audio/letters/waw.mp3',
  'وِ': '/audio/letters/waw.mp3',
  'وُ': '/audio/letters/waw.mp3',
  'و': '/audio/letters/waw.mp3',

  'هَ': '/audio/letters/haah.mp3',
  'هِ': '/audio/letters/haah.mp3',
  'هُ': '/audio/letters/haah.mp3',
  'ه': '/audio/letters/haah.mp3',
  'هـ': '/audio/letters/haah.mp3',

  'يَ': '/audio/letters/yaa.mp3',
  'يِ': '/audio/letters/yaa.mp3',
  'يُ': '/audio/letters/yaa.mp3',
  'ي': '/audio/letters/yaa.mp3',

  // Multi-syllable Iqro words
  'كُتِبَ': '/audio/iqro/ku_ti_ba.mp3',
  'رُسُلُ': '/audio/iqro/ru_su_lu.mp3',
  'تَبَوَ': '/audio/iqro/ta_ba_wa.mp3',
  'ثَبَتَ': '/audio/iqro/tsa_ba_ta.mp3',
  'بَاتَ': '/audio/iqro/baa_ta.mp3',
  'تَابَ': '/audio/iqro/taa_ba.mp3',
  'اَلۡحَمۡدُ': '/audio/iqro/al_ham_du.mp3',
  'كُفُوًا': '/audio/iqro/ku_fu_wan.mp3',
  'أَحَدٌ': '/audio/iqro/a_ha_dun.mp3',
  'رَبَّ': '/audio/iqro/rab_ba.mp3',
  'تَبَّتۡ': '/audio/iqro/tab_bat.mp3',
  'إِنَّ': '/audio/iqro/in_na.mp3',
  'عَمَّ': '/audio/iqro/am_ma.mp3'
};

export function getSingleLetterAudioUrl(letter: string): string {
  if (!letter) return '/audio/iqro/harakat/a.mp3';
  const trimmed = letter.trim();

  // 1. Check exact Harakat / Iqro word map
  if (IQRO_HARAKAT_AUDIO_MAP[trimmed]) return IQRO_HARAKAT_AUDIO_MAP[trimmed];

  // 2. Check base isolated letter map
  if (ISOLATED_LETTER_AUDIO[trimmed]) return ISOLATED_LETTER_AUDIO[trimmed];

  const cleaned = trimmed.replace(/[^\u0600-\u06FF]/g, '');
  if (cleaned && IQRO_HARAKAT_AUDIO_MAP[cleaned]) return IQRO_HARAKAT_AUDIO_MAP[cleaned];
  if (cleaned && ISOLATED_LETTER_AUDIO[cleaned]) return ISOLATED_LETTER_AUDIO[cleaned];

  const first = cleaned ? cleaned[0] : trimmed[0];
  if (first && IQRO_HARAKAT_AUDIO_MAP[first]) return IQRO_HARAKAT_AUDIO_MAP[first];
  if (first && ISOLATED_LETTER_AUDIO[first]) return ISOLATED_LETTER_AUDIO[first];

  return '/audio/iqro/harakat/a.mp3';
}

export const ARABIC_LETTERS_MAP: Record<string, LetterPhoneticInfo> = {
  'ء': {
    letter: 'ء',
    nameLatin: 'Hamzah',
    transliteration: 'Hamzah (\' / A)',
    makhraj: 'Pangkal Tenggorokan paling dalam (أَقْصَى الحَلْق)',
    sifat: 'Syiddah (suara tertahan kuat), Jahr (nafas murni tidak berdesis)',
    tips: 'Hentakan suara murni pada pita suara di pangkal tenggorokan tanpa desah nafas.',
    surahNumber: 1,
    ayahNumber: 5,
    surahName: 'Al-Fatihah',
    targetWordArabic: 'إِيَّاكَ',
    exampleVerseArabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
    exampleVerseLatin: 'Iyyāka na\'budu wa iyyāka nasta\'īn',
    audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/001005.mp3',
    audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/001005.mp3',
    qariSanad: 'Sanad Riwayat Hafsh \'an \'Ashim'
  },
  'ا': {
    letter: 'ا',
    nameLatin: 'Alif',
    transliteration: 'Alif / Hamzah (A / I / U)',
    makhraj: 'Pangkal Tenggorokan (أَقْصَى الحَلْق) & Rongga Mulut (الجَوْف)',
    sifat: 'Jahr (jelas, tidak berdesis), Tarqiq (tipis)',
    tips: 'Keluar dari rongga dada tanpa desah nafas, bunyi murni vokal.',
    surahNumber: 1,
    ayahNumber: 1,
    surahName: 'Al-Fatihah',
    targetWordArabic: 'الرَّحْمَٰنِ',
    exampleVerseArabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    exampleVerseLatin: 'Bismillāhir-raḥmānir-raḥīm',
    audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/001001.mp3',
    audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/001001.mp3',
    qariSanad: 'Sanad Riwayat Hafsh \'an \'Ashim'
  },
  'ب': {
    letter: 'ب',
    nameLatin: 'Ba',
    transliteration: 'Baa (B)',
    makhraj: 'Dua Bibir dirapatkan (الشَّفَتَيْن)',
    sifat: 'Jahr (tertahan nafas), Syiddah (kuat), Qalqalah (memantul saat sukun)',
    tips: 'Kedua bibir dirapatkan secara rapat dan memantul tegas saat berharakat sukun (بْ).',
    surahNumber: 111,
    ayahNumber: 1,
    surahName: 'Al-Lahab',
    targetWordArabic: 'تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ',
    exampleVerseArabic: 'تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ',
    exampleVerseLatin: 'Tabbat yadā abī lahabiw-wa tabb',
    audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/111001.mp3',
    audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/111001.mp3',
    qariSanad: 'Sanad Riwayat Hafsh \'an \'Ashim'
  },
  'ت': {
    letter: 'ت',
    nameLatin: 'Ta',
    transliteration: 'Taa (T)',
    makhraj: 'Ujung lidah menempel pada pangkal gigi seri atas',
    sifat: 'Hams (mengalir hembusan nafas halus)',
    tips: 'Ujung lidah ditekan lembut, ada sedikit desis hembusan nafas (hams).',
    surahNumber: 102,
    ayahNumber: 1,
    surahName: 'At-Takatsur',
    targetWordArabic: 'التَّكَاثُرُ',
    exampleVerseArabic: 'أَلْهَاكُمُ التَّكَاثُرُ',
    exampleVerseLatin: 'Alhākumut-takātsur',
    audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/102001.mp3',
    audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/102001.mp3',
    qariSanad: 'Sanad Riwayat Hafsh \'an \'Ashim'
  },
  'ث': {
    letter: 'ث',
    nameLatin: 'Tsa',
    transliteration: 'Tsaa (Ṡ / Th)',
    makhraj: 'Ujung lidah keluar sedikit di antara gigi seri atas dan bawah',
    sifat: 'Hams (mengalir nafas), Rakhawah (suara mengalir lembut)',
    tips: 'Ujung lidah digigit lembut sedikit oleh gigi seri atas, bunyi mendesir halus tanpa desis lebah.',
    surahNumber: 102,
    ayahNumber: 3,
    surahName: 'At-Takatsur',
    targetWordArabic: 'ثُمَّ',
    exampleVerseArabic: 'ثُمَّ كَلَّا سَوْفَ تَعْلَمُونَ',
    exampleVerseLatin: 'Ṡumma kallā saufa ta\'lamūn',
    audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/102003.mp3',
    audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/102003.mp3',
    qariSanad: 'Sanad Riwayat Hafsh \'an \'Ashim'
  },
  'ج': {
    letter: 'ج',
    nameLatin: 'Jim',
    transliteration: 'Jiim (J)',
    makhraj: 'Tengah lidah menempel pada langit-langit atas (وَسَطُ اللِّسَان)',
    sifat: 'Syiddah (kuat tertahan), Qalqalah (memantul)',
    tips: 'Tengah lidah menempel kuat di langit-langit keras, tidak mendesis "sy" atau "c".',
    surahNumber: 110,
    ayahNumber: 2,
    surahName: 'An-Nasr',
    targetWordArabic: 'أَفْوَاجًا',
    exampleVerseArabic: 'وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا',
    exampleVerseLatin: 'Wa ra\'aitan-nāsa yadkhulūna fī dīnillāhi afwājā',
    audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/110002.mp3',
    audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/110002.mp3',
    qariSanad: 'Sanad Riwayat Hafsh \'an \'Ashim'
  },
  'ح': {
    letter: 'ح',
    nameLatin: 'Ha Pedas / Bersih',
    transliteration: 'Ḥaa (Ha Bersih)',
    makhraj: 'Tengah Tenggorokan (وَسَطُ الحَلْق)',
    sifat: 'Hams (nafas berhembus), Rakhawah (suara mengalir), Tarqiq (tipis)',
    tips: 'Bunyi desah nafas bersih dan kering, tidak serak, keluar murni dari tenggorokan tengah.',
    surahNumber: 1,
    ayahNumber: 2,
    surahName: 'Al-Fatihah',
    targetWordArabic: 'الْحَمْدُ',
    exampleVerseArabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    exampleVerseLatin: 'Al-ḥamdu lillāhi rabbil-\'ālamīn',
    audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/001002.mp3',
    audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/001002.mp3',
    qariSanad: 'Sanad Riwayat Hafsh \'an \'Ashim'
  },
  'خ': {
    letter: 'خ',
    nameLatin: 'Kha / Kho',
    transliteration: 'Khā\' (Kh Tebal)',
    makhraj: 'Tenggorokan Atas mendekati pangkal lidah (أَدْنَى الحَلْق)',
    sifat: 'Isti\'la (tebal/mulut terangkat), Hams (bernafas), Rakhawah (mengalir)',
    tips: 'Bunyi tebal mengalir dengan gesekan basah di tenggorokan atas (seperti dengkuran halus).',
    surahNumber: 113,
    ayahNumber: 2,
    surahName: 'Al-Falaq',
    targetWordArabic: 'خَلَقَ',
    exampleVerseArabic: 'مِن شَرِّ مَا خَلَقَ',
    exampleVerseLatin: 'Min syarri mā khalaq',
    audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/113002.mp3',
    audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/113002.mp3',
    qariSanad: 'Sanad Riwayat Hafsh \'an \'Ashim'
  },
  'د': {
    letter: 'د',
    nameLatin: 'Dal',
    transliteration: 'Dāl (D)',
    makhraj: 'Ujung lidah bertemu pangkal gigi seri atas',
    sifat: 'Jahr (nafas tertahan), Syiddah, Qalqalah (memantul)',
    tips: 'Ujung lidah menempel mantap, memantul jelas saat mati/waqaf.',
    surahNumber: 112,
    ayahNumber: 1,
    surahName: 'Al-Ikhlas',
    targetWordArabic: 'أَحَدٌ',
    exampleVerseArabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
    exampleVerseLatin: 'Qul huwallāhu aḥad',
    audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/112001.mp3',
    audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/112001.mp3',
    qariSanad: 'Sanad Riwayat Hafsh \'an \'Ashim'
  },
  'ذ': {
    letter: 'ذ',
    nameLatin: 'Dzal',
    transliteration: 'Żāl (Dh)',
    makhraj: 'Ujung lidah sedikit keluar di ujung gigi seri atas',
    sifat: 'Jahr (nafas tertahan), Rakhawah (suara mengalir lembut)',
    tips: 'Ujung lidah disentuhkan ke ujung gigi seri atas, lembut tanpa hentakan dan tanpa bersiul.',
    surahNumber: 113,
    ayahNumber: 1,
    surahName: 'Al-Falaq',
    targetWordArabic: 'أَعُوذُ',
    exampleVerseArabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',
    exampleVerseLatin: 'Qul a\'ūżu birabbil-falaq',
    audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/113001.mp3',
    audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/113001.mp3',
    qariSanad: 'Sanad Riwayat Hafsh \'an \'Ashim'
  },
  'ر': {
    letter: 'ر',
    nameLatin: 'Ra',
    transliteration: 'Rā\' (R)',
    makhraj: 'Ujung lidah dekat makhraj Nun dengan sedikit getaran (تَكْرِير)',
    sifat: 'Tafkhim (tebal saat fathah/dhammah) & Tarqiq (tipis saat kasrah)',
    tips: 'Getaran lidah cukup 1-2 kali getar saja, tidak bergetar berlebihan.',
    surahNumber: 108,
    ayahNumber: 2,
    surahName: 'Al-Kautsar',
    targetWordArabic: 'وَانْحَرْ',
    exampleVerseArabic: 'فَصَلِّ لِرَبِّكَ وَانْحَرْ',
    exampleVerseLatin: 'Fa ṣalli lirabbika wan-ḥar',
    audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/108002.mp3',
    audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/108002.mp3',
    qariSanad: 'Sanad Riwayat Hafsh \'an \'Ashim'
  },
  'ز': {
    letter: 'ز',
    nameLatin: 'Zay',
    transliteration: 'Zāy (Z)',
    makhraj: 'Ujung lidah sejajar di atas gigi seri bawah',
    sifat: 'Shafir (desis tajam laksana lebah), Jahr',
    tips: 'Bunyi desis tajam bergetar kuat mirip suara lebah.',
    surahNumber: 99,
    ayahNumber: 1,
    surahName: 'Az-Zalzalah',
    targetWordArabic: 'زِلْزَالَهَا',
    exampleVerseArabic: 'إِذَا زُلْزِلَتِ الْأَرْضُ زِلْزَالَهَا',
    exampleVerseLatin: 'Iżā zulzilatil-arḍu zilzālahā',
    audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/099001.mp3',
    audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/099001.mp3',
    qariSanad: 'Sanad Riwayat Hafsh \'an \'Ashim'
  },
  'س': {
    letter: 'س',
    nameLatin: 'Sin',
    transliteration: 'Sīn (S Tipis)',
    makhraj: 'Ujung lidah sejajar di belakang gigi seri bawah',
    sifat: 'Shafir (desis tajam halus laksana suara burung/angin), Hams (bernafas)',
    tips: 'Mendesir tajam dan tipis (tarqiq), bibir agak tersenyum.',
    surahNumber: 114,
    ayahNumber: 6,
    surahName: 'An-Naas',
    targetWordArabic: 'وَالنَّاسِ',
    exampleVerseArabic: 'مِنَ الْجِنَّةِ وَالنَّاسِ',
    exampleVerseLatin: 'Minal-jinnati wan-nās',
    audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/114006.mp3',
    audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/114006.mp3',
    qariSanad: 'Sanad Riwayat Hafsh \'an \'Ashim'
  },
  'ش': {
    letter: 'ش',
    nameLatin: 'Syin',
    transliteration: 'Syīn (Sy)',
    makhraj: 'Tengah lidah terangkat ke langit-langit (وَسَطُ اللِّسَان)',
    sifat: 'Tafasysyi (angin berhamburan memenuhi rongga mulut)',
    tips: 'Angin hembusan nafas menyebar memenuhi seluruh rongga mulut.',
    surahNumber: 101,
    ayahNumber: 5,
    surahName: 'Al-Qari\'ah',
    targetWordArabic: 'الْمَنفُوشِ',
    exampleVerseArabic: 'وَتَكُونُ الْجِبَالُ كَالْعِهْنِ الْمَنفُوشِ',
    exampleVerseLatin: 'Wa takūnul-jibālu kal-\'ihnil-manfūsy',
    audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/101005.mp3',
    audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/101005.mp3',
    qariSanad: 'Sanad Riwayat Hafsh \'an \'Ashim'
  },
  'ص': {
    letter: 'ص',
    nameLatin: 'Shad',
    transliteration: 'Ṣād (S Tebal)',
    makhraj: 'Ujung lidah di atas gigi seri bawah dengan pangkal lidah terangkat (itbaq)',
    sifat: 'Shafir (desis tebal bulat), Isti\'la, Itbaq',
    tips: 'Suara desis tebal dan bergema bulat di dalam rongga mulut (itbaq).',
    surahNumber: 1,
    ayahNumber: 6,
    surahName: 'Al-Fatihah',
    targetWordArabic: 'الصِّرَاطَ',
    exampleVerseArabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
    exampleVerseLatin: 'Ihdinaṣ-ṣirāṭal-mustaqīm',
    audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/001006.mp3',
    audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/001006.mp3',
    qariSanad: 'Sanad Riwayat Hafsh \'an \'Ashim'
  },
  'ض': {
    letter: 'ض',
    nameLatin: 'Dhad',
    transliteration: 'Ḍād (Dh Tebal)',
    makhraj: 'Salah satu atau kedua tepi lidah menempel pada gigi geraham atas (حَافَةِ اللِّسَان)',
    sifat: 'Istithalah (suara memanjang menyusur geraham), Itbaq, Isti\'la',
    tips: 'Huruf terunik dalam bahasa Arab. Tepi lidah ditekan ke dinding gigi geraham atas.',
    surahNumber: 1,
    ayahNumber: 7,
    surahName: 'Al-Fatihah',
    targetWordArabic: 'الضَّالِّينَ',
    exampleVerseArabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
    exampleVerseLatin: 'Ghairil-maghdhūbi \'alaihim wa laḍ-ḍāllīn',
    audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/001007.mp3',
    audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/001007.mp3',
    qariSanad: 'Sanad Riwayat Hafsh \'an \'Ashim'
  },
  'ط': {
    letter: 'ط',
    nameLatin: 'Tha',
    transliteration: 'Ṭā\' (Th Tebal)',
    makhraj: 'Ujung lidah menempel pada pangkal gigi seri atas',
    sifat: 'Huruf terkuat! Isti\'la, Itbaq, Syiddah, Qalqalah',
    tips: 'Tebal menggelegar dan memantul kuat saat sukun/mati.',
    surahNumber: 105,
    ayahNumber: 3,
    surahName: 'Al-Fil',
    targetWordArabic: 'طَيْرًا',
    exampleVerseArabic: 'وَأَرْسَلَ عَلَيْهِمْ طَيْرًا أَبَابِيلَ',
    exampleVerseLatin: 'Wa arsala \'alaihim ṭairan abābīl',
    audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/105003.mp3',
    audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/105003.mp3',
    qariSanad: 'Sanad Riwayat Hafsh \'an \'Ashim'
  },
  'ظ': {
    letter: 'ظ',
    nameLatin: 'Zha',
    transliteration: 'Ẓā\' (Zh Tebal)',
    makhraj: 'Ujung lidah keluar sedikit di ujung gigi seri atas dengan lidah terangkat',
    sifat: 'Isti\'la, Itbaq (tebal penuh), Rakhawah',
    tips: 'Mirip makhraj Dzal (ذ) namun pangkal lidah diangkat tebal (itbaq).',
    surahNumber: 2,
    ayahNumber: 59,
    surahName: 'Al-Baqarah',
    targetWordArabic: 'يَظْلِمُونَ',
    exampleVerseArabic: 'فَبَدَّلَ الَّذِينَ ظَلَمُوا قَوْلًا غَيْرَ الَّذِي قِيلَ لَهُمْ',
    exampleVerseLatin: 'Fa baddalallażīna ẓalamū...',
    audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/002059.mp3',
    audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/002059.mp3',
    qariSanad: 'Sanad Riwayat Hafsh \'an \'Ashim'
  },
  'ع': {
    letter: 'ع',
    nameLatin: '\'Ain',
    transliteration: '\'Ain (Khas Tengah Tenggorokan)',
    makhraj: 'Tengah Tenggorokan (وَسَطُ الحَلْق)',
    sifat: 'Tawassuth (antara kuat dan mengalir), Jahr',
    tips: 'Suara ditekan dari katup epiglotis tengah tenggorokan, tidak tersumbat di hidung.',
    surahNumber: 1,
    ayahNumber: 5,
    surahName: 'Al-Fatihah',
    targetWordArabic: 'نَعْبُدُ',
    exampleVerseArabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
    exampleVerseLatin: 'Iyyāka na\'budu wa iyyāka nasta\'īn',
    audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/001005.mp3',
    audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/001005.mp3',
    qariSanad: 'Sanad Riwayat Hafsh \'an \'Ashim'
  },
  'غ': {
    letter: 'غ',
    nameLatin: 'Ghain',
    transliteration: 'Gain (Gh Tebal)',
    makhraj: 'Tenggorokan Atas (أَدْنَى الحَلْق)',
    sifat: 'Isti\'la (tebal), Rakhawah (suara mengalir basah)',
    tips: 'Mirip suara orang berkumur air di tenggorokan atas.',
    surahNumber: 1,
    ayahNumber: 7,
    surahName: 'Al-Fatihah',
    targetWordArabic: 'غَيْرِ',
    exampleVerseArabic: 'غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
    exampleVerseLatin: 'Ghairil-maghdhūbi \'alaihim...',
    audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/001007.mp3',
    audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/001007.mp3',
    qariSanad: 'Sanad Riwayat Hafsh \'an \'Ashim'
  },
  'ف': {
    letter: 'ف',
    nameLatin: 'Fa',
    transliteration: 'Fā\' (F)',
    makhraj: 'Bibir bawah bagian dalam bertemu dengan ujung dua gigi seri atas',
    sifat: 'Hams (nafas mengalir lepas), Tarqiq',
    tips: 'Gigi seri atas menekan lembut bagian dalam bibir bawah.',
    surahNumber: 105,
    ayahNumber: 1,
    surahName: 'Al-Fil',
    targetWordArabic: 'فَعَلَ',
    exampleVerseArabic: 'أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ',
    exampleVerseLatin: 'Alam tara kaifa fa\'ala rabbuka bi\'aṣḥābil-fīl',
    audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/105001.mp3',
    audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/105001.mp3',
    qariSanad: 'Sanad Riwayat Hafsh \'an \'Ashim'
  },
  'ق': {
    letter: 'ق',
    nameLatin: 'Qaf',
    transliteration: 'Qāf (Q Tebal)',
    makhraj: 'Pangkal Lidah paling belakang bertemu langit-langit lunak (أَقْصَى اللِّسَان)',
    sifat: 'Isti\'la (tebal), Syiddah, Qalqalah (memantul)',
    tips: 'Pangkal lidah menempel di langit-langit daging lunak, memantul kokoh.',
    surahNumber: 113,
    ayahNumber: 1,
    surahName: 'Al-Falaq',
    targetWordArabic: 'الْفَلَقِ',
    exampleVerseArabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',
    exampleVerseLatin: 'Qul a\'ūżu birabbil-falaq',
    audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/113001.mp3',
    audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/113001.mp3',
    qariSanad: 'Sanad Riwayat Hafsh \'an \'Ashim'
  },
  'ك': {
    letter: 'ك',
    nameLatin: 'Kaf',
    transliteration: 'Kāf (K Berdesis)',
    makhraj: 'Pangkal lidah sedikit ke depan dari makhraj Qaf',
    sifat: 'Hams (hembusan nafas setelah ditahan), Syiddah',
    tips: 'Setelah suara ditahan sekejap, lepaskan sedikit desah angin (hams).',
    surahNumber: 109,
    ayahNumber: 1,
    surahName: 'Al-Kafirun',
    targetWordArabic: 'الْكَافِرُونَ',
    exampleVerseArabic: 'قُلْ يَا أَيُّهَا الْكَافِرُونَ',
    exampleVerseLatin: 'Qul yā ayyuhal-kāfirūn',
    audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/109001.mp3',
    audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/109001.mp3',
    qariSanad: 'Sanad Riwayat Hafsh \'an \'Ashim'
  },
  'ل': {
    letter: 'ل',
    nameLatin: 'Lam',
    transliteration: 'Lām (L)',
    makhraj: 'Ujung tepi lidah ke depan bertemu gusi gigi atas',
    sifat: 'Inhiraf (suara menyimpang ke sisi lidah), Tarqiq',
    tips: 'Ujung lidah menempel lebar di gusi atas, lafazkan jelas.',
    surahNumber: 112,
    ayahNumber: 3,
    surahName: 'Al-Ikhlas',
    targetWordArabic: 'لَمْ يَلِدْ',
    exampleVerseArabic: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
    exampleVerseLatin: 'Lam yalid wa lam yūlad',
    audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/112003.mp3',
    audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/112003.mp3',
    qariSanad: 'Sanad Riwayat Hafsh \'an \'Ashim'
  },
  'م': {
    letter: 'م',
    nameLatin: 'Mim',
    transliteration: 'Mīm (M)',
    makhraj: 'Dua Bibir dirapatkan dengan suara dengung di hidung (Khoisyum)',
    sifat: 'Ghunnah (dengung alami rongga hidung), Tawassuth',
    tips: 'Kedua bibir tertutup santai, dengung mengalir dari hidung.',
    surahNumber: 105,
    ayahNumber: 1,
    surahName: 'Al-Fil',
    targetWordArabic: 'أَلَمْ',
    exampleVerseArabic: 'أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ',
    exampleVerseLatin: 'Alam tara kaifa fa\'ala rabbuka bi\'aṣḥābil-fīl',
    audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/105001.mp3',
    audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/105001.mp3',
    qariSanad: 'Sanad Riwayat Hafsh \'an \'Ashim'
  },
  'ن': {
    letter: 'ن',
    nameLatin: 'Nun',
    transliteration: 'Nūn (N)',
    makhraj: 'Ujung lidah menempel pada gusi gigi seri atas di bawah makhraj Lam',
    sifat: 'Ghunnah (dengung hidung)',
    tips: 'Setengah suara di lidah dan setengahnya di rongga hidung.',
    surahNumber: 114,
    ayahNumber: 1,
    surahName: 'An-Naas',
    targetWordArabic: 'النَّاسِ',
    exampleVerseArabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
    exampleVerseLatin: 'Qul a\'ūżu birabbin-nās',
    audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/114001.mp3',
    audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/114001.mp3',
    qariSanad: 'Sanad Riwayat Hafsh \'an \'Ashim'
  },
  'هـ': {
    letter: 'هـ',
    nameLatin: 'Ha Besar',
    transliteration: 'Hā\' (Ha Dada / Dalam)',
    makhraj: 'Pangkal Tenggorokan paling dalam (أَقْصَى الحَلْق)',
    sifat: 'Hams, Rakhawah, Khafa\' (huruf sangat lembut tersembunyi)',
    tips: 'Keluarkan dari pangkal leher/dada dengan hembusan nafas lepas tanpa ditekan.',
    surahNumber: 112,
    ayahNumber: 1,
    surahName: 'Al-Ikhlas',
    targetWordArabic: 'هُوَ',
    exampleVerseArabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
    exampleVerseLatin: 'Qul huwallāhu aḥad',
    audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/112001.mp3',
    audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/112001.mp3',
    qariSanad: 'Sanad Riwayat Hafsh \'an \'Ashim'
  },
  'و': {
    letter: 'و',
    nameLatin: 'Wawu',
    transliteration: 'Wāw (W / U)',
    makhraj: 'Dua Bibir dimoncongkan ke depan (الشَّفَتَيْن)',
    sifat: 'Rakhawah, Tarqiq, Mad/Layyin',
    tips: 'Bibir dimoncongkan bulat ke depan laksana meniup seruling.',
    surahNumber: 111,
    ayahNumber: 1,
    surahName: 'Al-Lahab',
    targetWordArabic: 'وَتَبَّ',
    exampleVerseArabic: 'تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ',
    exampleVerseLatin: 'Tabbat yadā abī lahabiw-wa tabb',
    audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/111001.mp3',
    audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/111001.mp3',
    qariSanad: 'Sanad Riwayat Hafsh \'an \'Ashim'
  },
  'ي': {
    letter: 'ي',
    nameLatin: 'Ya',
    transliteration: 'Yā\' (Y / I)',
    makhraj: 'Tengah lidah terangkat ke langit-langit tanpa menyentuh rapat',
    sifat: 'Rakhawah, Tarqiq, Mad/Layyin',
    tips: 'Tengah lidah naik lembut, kedua sudut bibir ditarik santai.',
    surahNumber: 112,
    ayahNumber: 3,
    surahName: 'Al-Ikhlas',
    targetWordArabic: 'يَلِدْ',
    exampleVerseArabic: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
    exampleVerseLatin: 'Lam yalid wa lam yūlad',
    audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/112003.mp3',
    audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/112003.mp3',
    qariSanad: 'Sanad Riwayat Hafsh \'an \'Ashim'
  },
  'نّ': {
    letter: 'نّ',
    nameLatin: 'Nun Tasydid (Ghunnah)',
    transliteration: 'Nun Musyaddadah (Dengung 2-3 Harakat)',
    makhraj: 'Rongga Hidung (الخَيْشُوم)',
    sifat: 'Ghunnah Akmal ma takun (Tingkat dengung paling sempurna)',
    tips: 'Tahan suara di rongga hidung selama 2 ketukan harakat penuh sebelum melanjutkan.',
    surahNumber: 114,
    ayahNumber: 1,
    surahName: 'An-Naas',
    targetWordArabic: 'النَّاسِ',
    exampleVerseArabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
    exampleVerseLatin: 'Qul a\'ūżu birabbin-nās',
    audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/114001.mp3',
    audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/114001.mp3',
    qariSanad: 'Sanad Riwayat Hafsh \'an \'Ashim'
  },
  'مّ': {
    letter: 'مّ',
    nameLatin: 'Mim Tasydid (Ghunnah)',
    transliteration: 'Mim Musyaddadah (Dengung 2-3 Harakat)',
    makhraj: 'Bibir dirapatkan + Rongga Hidung',
    sifat: 'Ghunnah Akmal ma takun',
    tips: 'Bibir dirapatkan dengan dengungan hidung selama 2 ketukan harakat penuh.',
    surahNumber: 78,
    ayahNumber: 1,
    surahName: 'An-Naba\'',
    targetWordArabic: 'عَمَّ',
    exampleVerseArabic: 'عَمَّ يَتَسَاءَلُونَ',
    exampleVerseLatin: '\'Amma yatasā\'alūn',
    audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/078001.mp3',
    audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/078001.mp3',
    qariSanad: 'Sanad Riwayat Hafsh \'an \'Ashim'
  }
};

/**
 * Get phonetic info for any letter or annotation string safely.
 */
export function getLetterPhoneticInfo(rawLetter: string): LetterPhoneticInfo {
  const singleAudio = getSingleLetterAudioUrl(rawLetter);
  if (!rawLetter) {
    return {
      letter: '',
      nameLatin: 'Huruf',
      transliteration: '',
      makhraj: 'Kaidah makharijul huruf',
      sifat: 'Sifat makhraj',
      tips: 'Perhatikan makhraj dan sifat huruf.',
      singleLetterAudioUrl: '/audio/letters/alif.mp3',
      surahNumber: 1,
      ayahNumber: 1,
      surahName: 'Al-Fatihah',
      targetWordArabic: 'بِسْمِ اللَّهِ',
      exampleVerseArabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      exampleVerseLatin: 'Bismillāhir-raḥmānir-raḥīm',
      audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/001001.mp3',
      audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/001001.mp3',
      qariSanad: 'Sanad Riwayat Hafsh \'an \'Ashim'
    };
  }

  // Exact match
  if (ARABIC_LETTERS_MAP[rawLetter]) {
    return { ...ARABIC_LETTERS_MAP[rawLetter], singleLetterAudioUrl: singleAudio };
  }

  // Clean annotations like "ا (setelah fathah)"
  const cleaned = rawLetter.replace(/[^\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g, '').trim();
  if (cleaned && ARABIC_LETTERS_MAP[cleaned]) {
    return { ...ARABIC_LETTERS_MAP[cleaned], singleLetterAudioUrl: singleAudio };
  }
  const firstChar = cleaned ? cleaned[0] : rawLetter[0];
  if (firstChar && ARABIC_LETTERS_MAP[firstChar]) {
    return { ...ARABIC_LETTERS_MAP[firstChar], singleLetterAudioUrl: singleAudio };
  }

  return {
    letter: rawLetter,
    nameLatin: `Huruf ${rawLetter}`,
    transliteration: rawLetter,
    makhraj: 'Keluaran huruf hijaiyah sesuai kaidah makhraj',
    sifat: 'Sifat huruf hijaiyah',
    tips: 'Perhatikan posisi lidah, rongga mulut, dan desah nafas yang tepat.',
    singleLetterAudioUrl: singleAudio,
    surahNumber: 1,
    ayahNumber: 1,
    surahName: 'Al-Fatihah',
    targetWordArabic: rawLetter,
    exampleVerseArabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    exampleVerseLatin: 'Bismillāhir-raḥmānir-raḥīm',
    audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/001001.mp3',
    audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/001001.mp3',
    qariSanad: 'Sanad Riwayat Hafsh \'an \'Ashim'
  };
}

export interface ComparisonLetter {
  char: string;
  nameLatin: string;
  transliteration: string;
  makhraj: string;
  soundFeature: string;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  targetWord: string;
  exampleText: string;
  exampleLatin: string;
  audioUrlAlafasy: string;
  audioUrlHusary: string;
}

export interface LetterComparisonGroup {
  id: string;
  title: string;
  badge: string;
  description: string;
  differentiationTips: string;
  letters: ComparisonLetter[];
}

export const LETTER_COMPARISON_GROUPS: LetterComparisonGroup[] = [
  {
    id: 'throat-letters',
    title: 'Perbedaan Bunyi Huruf Tenggorokan (Al-Halq)',
    badge: 'Kha (خ) vs Ha Pedas (ح) vs Ha Dada (هـ)',
    description: 'Tiga huruf yang sering tertukar karena sama-sama berasal dari tenggorokan, namun berbeda tingkatan letak dan sifatnya.',
    differentiationTips: 'خ (Kho) bergesek kasar serak basah di tenggorokan atas; ح (Ha) bersih pedas di tengah leher; هـ (Ha) berhembus ringan lepas dari rongga dada.',
    letters: [
      {
        char: 'خ',
        nameLatin: 'Kho / Kha',
        transliteration: 'Khā\' (Kh)',
        makhraj: 'Tenggorokan Atas (أَدْنَى الحَلْق)',
        soundFeature: 'Tebal (Isti\'la) & bergeser kasar serak basah',
        surahNumber: 113,
        ayahNumber: 2,
        surahName: 'Al-Falaq',
        targetWord: 'خَلَقَ',
        exampleText: 'مِن شَرِّ مَا خَلَقَ',
        exampleLatin: 'Min syarri mā khalaq',
        audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/113002.mp3',
        audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/113002.mp3'
      },
      {
        char: 'ح',
        nameLatin: 'Ha Pedas / Bersih',
        transliteration: 'Ḥā\' (Ḥ)',
        makhraj: 'Tengah Tenggorokan (وَسَطُ الحَلْق)',
        soundFeature: 'Tipis (Tarqiq), desah nafas bersih mengalir tanpa serak',
        surahNumber: 1,
        ayahNumber: 2,
        surahName: 'Al-Fatihah',
        targetWord: 'الْحَمْدُ',
        exampleText: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        exampleLatin: 'Al-ḥamdu lillāhi rabbil-\'ālamīn',
        audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/001002.mp3',
        audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/001002.mp3'
      },
      {
        char: 'هـ',
        nameLatin: 'Ha Besar / Dada',
        transliteration: 'Hā\' (H)',
        makhraj: 'Pangkal Tenggorokan Dalam (أَقْصَى الحَلْق)',
        soundFeature: 'Lepas dari dada, lembut tanpa gesekan leher',
        surahNumber: 112,
        ayahNumber: 1,
        surahName: 'Al-Ikhlas',
        targetWord: 'هُوَ اللَّهُ',
        exampleText: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
        exampleLatin: 'Qul huwallāhu aḥad',
        audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/112001.mp3',
        audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/112001.mp3'
      }
    ]
  },
  {
    id: 'shafir-letters',
    title: 'Perbedaan Huruf Desis Shafir & Ujung Lidah',
    badge: 'Shad (ص) vs Sin (س) vs Tsa (ث)',
    description: 'Perbedaan ketebalan mulut (Itbaq) dan desah ujung lidah yang sangat mencolok saat talaqqi.',
    differentiationTips: 'ص (Shad) mulut membulat tebal menggelegar; س (Sin) tersenyum mendesir tajam; ث (Tsa) ujung lidah digigit lembut tanpa siulan.',
    letters: [
      {
        char: 'ص',
        nameLatin: 'Shad',
        transliteration: 'Ṣād (Ṣ)',
        makhraj: 'Ujung lidah di atas gigi seri bawah + lidah terangkat tebal (Itbaq)',
        soundFeature: 'Tebal bergema bulat (Isti\'la & Itbaq), desis tebal',
        surahNumber: 1,
        ayahNumber: 6,
        surahName: 'Al-Fatihah',
        targetWord: 'الصِّرَاطَ',
        exampleText: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
        exampleLatin: 'Ihdinaṣ-ṣirāṭal-mustaqīm',
        audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/001006.mp3',
        audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/001006.mp3'
      },
      {
        char: 'س',
        nameLatin: 'Sin',
        transliteration: 'Sīn (S)',
        makhraj: 'Ujung lidah di belakang gigi seri bawah',
        soundFeature: 'Tipis mendesir tajam laksana desau angin/burung',
        surahNumber: 1,
        ayahNumber: 1,
        surahName: 'Al-Fatihah',
        targetWord: 'بِسْمِ اللَّهِ',
        exampleText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        exampleLatin: 'Bismillāhir-raḥmānir-raḥīm',
        audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/001001.mp3',
        audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/001001.mp3'
      },
      {
        char: 'ث',
        nameLatin: 'Tsa',
        transliteration: 'Thā\' / Ṡā\' (Th)',
        makhraj: 'Ujung lidah dikeluarkan sedikit & digigit lembut gigi seri atas',
        soundFeature: 'Mengalir lembut tanpa bersiul / desis tajam',
        surahNumber: 102,
        ayahNumber: 3,
        surahName: 'At-Takatsur',
        targetWord: 'ثُمَّ',
        exampleText: 'ثُمَّ كَلَّا سَوْفَ تَعْلَمُونَ',
        exampleLatin: 'Ṡumma kallā saufa ta\'lamūn',
        audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/102003.mp3',
        audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/102003.mp3'
      }
    ]
  },
  {
    id: 'tha-vs-ta',
    title: 'Perbedaan Huruf Pangkal Gigi Seri Atas',
    badge: 'Tha (ط) vs Ta (ت)',
    description: 'Dua huruf dari makhraj yang persis sama, namun dibedakan oleh kekuatan sifat Isti\'la dan Itbaq.',
    differentiationTips: 'ط (Tha) huruf paling kuat di Al-Qur\'an, tebal membahana & memantul; ت (Ta) tipis dengan desis hembusan nafas halus (Hams).',
    letters: [
      {
        char: 'ط',
        nameLatin: 'Tha',
        transliteration: 'Ṭā\' (Ṭ)',
        makhraj: 'Ujung lidah pada pangkal gigi seri atas (lidah diangkat tebal)',
        soundFeature: 'Sangat tebal (Itbaq) & memantul kuat saat sukun',
        surahNumber: 105,
        ayahNumber: 3,
        surahName: 'Al-Fil',
        targetWord: 'طَيْرًا',
        exampleText: 'وَأَرْسَلَ عَلَيْهِمْ طَيْرًا أَبَابِيلَ',
        exampleLatin: 'Wa arsala \'alaihim ṭairan abābīl',
        audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/105003.mp3',
        audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/105003.mp3'
      },
      {
        char: 'ت',
        nameLatin: 'Ta',
        transliteration: 'Tā\' (T)',
        makhraj: 'Ujung lidah pada pangkal gigi seri atas',
        soundFeature: 'Tipis (Tarqiq) dengan hembusan nafas desis halus (Hams)',
        surahNumber: 111,
        ayahNumber: 1,
        surahName: 'Al-Lahab',
        targetWord: 'تَبَّتْ يَدَا',
        exampleText: 'تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ',
        exampleLatin: 'Tabbat yadā abī lahabiw-wa tabb',
        audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/111001.mp3',
        audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/111001.mp3'
      }
    ]
  },
  {
    id: 'zha-dzal-zay',
    title: 'Perbedaan Huruf Zha (ظ), Dzal (ذ), & Zay (ز)',
    badge: 'Zha (ظ) vs Dzal (ذ) vs Zay (ز)',
    description: 'Membedakan penempatan lidah pada gigi seri atas dan bawah.',
    differentiationTips: 'ظ (Zha) ujung lidah gigit sedikit + tebal; ذ (Dzal) gigit sedikit tapi tipis lembut; ز (Zay) lidah di belakang gigi seri bawah mendesis lebah.',
    letters: [
      {
        char: 'ظ',
        nameLatin: 'Zha',
        transliteration: 'Ẓā\' (Ẓ)',
        makhraj: 'Ujung lidah keluar sedikit di gigi seri atas + lidah terangkat tebal',
        soundFeature: 'Tebal bulat penuh (Itbaq & Isti\'la)',
        surahNumber: 2,
        ayahNumber: 59,
        surahName: 'Al-Baqarah',
        targetWord: 'ظَلَمُوا',
        exampleText: 'فَبَدَّلَ الَّذِينَ ظَلَمُوا قَوْلًا',
        exampleLatin: 'Fa baddalallażīna ẓalamū...',
        audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/002059.mp3',
        audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/002059.mp3'
      },
      {
        char: 'ذ',
        nameLatin: 'Dzal',
        transliteration: 'Dhāl (Dh)',
        makhraj: 'Ujung lidah keluar sedikit di gigi seri atas',
        soundFeature: 'Tipis mengalir lembut tanpa hentakan dan tanpa bersiul',
        surahNumber: 113,
        ayahNumber: 1,
        surahName: 'Al-Falaq',
        targetWord: 'أَعُوذُ',
        exampleText: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',
        exampleLatin: 'Qul a\'ūżu birabbil-falaq',
        audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/113001.mp3',
        audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/113001.mp3'
      },
      {
        char: 'ز',
        nameLatin: 'Zay',
        transliteration: 'Zāy (Z)',
        makhraj: 'Ujung lidah di belakang gigi seri bawah',
        soundFeature: 'Desis tajam bergetar kuat mirip suara lebah (Shafir)',
        surahNumber: 99,
        ayahNumber: 1,
        surahName: 'Az-Zalzalah',
        targetWord: 'زِلْزَالَهَا',
        exampleText: 'إِذَا زُلْزِلَتِ الْأَرْضُ زِلْزَالَهَا',
        exampleLatin: 'Iżā zulzilatil-arḍu zilzālahā',
        audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/099001.mp3',
        audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/099001.mp3'
      }
    ]
  },
  {
    id: 'ain-vs-ghain',
    title: 'Perbedaan Tengah vs Atas Tenggorokan',
    badge: '\'Ain (ع) vs Ghain (غ)',
    description: 'Huruf \'Ain ditekan dari epiglotis tengah, sedangkan Ghain bergetar basah di rongga atas tenggorokan.',
    differentiationTips: 'ع (\'Ain) ditekan jernih tanpa sengau hidung; غ (Ghain) bergetar tebal laksana suara orang berkumur air.',
    letters: [
      {
        char: 'ع',
        nameLatin: '\'Ain',
        transliteration: '\'Ain (Khas Epiglotis)',
        makhraj: 'Tengah Tenggorokan (وَسَطُ الحَلْق)',
        soundFeature: 'Suara ditekan dari katup tengah tenggorokan',
        surahNumber: 1,
        ayahNumber: 2,
        surahName: 'Al-Fatihah',
        targetWord: 'الْعَالَمِينَ',
        exampleText: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        exampleLatin: 'Al-ḥamdu lillāhi rabbil-\'ālamīn',
        audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/001002.mp3',
        audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/001002.mp3'
      },
      {
        char: 'غ',
        nameLatin: 'Ghain',
        transliteration: 'Ghain (Gh Tebal)',
        makhraj: 'Tenggorokan Atas (أَدْنَى الحَلْق)',
        soundFeature: 'Tebal bergetar basah mengalir (rakhawah)',
        surahNumber: 1,
        ayahNumber: 7,
        surahName: 'Al-Fatihah',
        targetWord: 'غَيْرِ الْمَغْضُوبِ',
        exampleText: 'غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
        exampleLatin: 'Ghairil-maghdhūbi \'alaihim...',
        audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/001007.mp3',
        audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/001007.mp3'
      }
    ]
  },
  {
    id: 'ghunnah-nasal',
    title: 'Perbedaan Tingkat Dengung (Ghunnah)',
    badge: 'Nun Tasydid (نّ) vs Mim Tasydid (مّ)',
    description: 'Dengung sempurna bersumber murni dari rongga hidung (Al-Khaisyum) selama 2-3 ketukan harakat.',
    differentiationTips: 'Tahan aliran suara di rongga hidung selama 2 ketukan penuh sebelum melepas ke huruf berikutnya.',
    letters: [
      {
        char: 'نّ',
        nameLatin: 'Nun Bertasydid',
        transliteration: 'Nun Musyaddadah',
        makhraj: 'Ujung lidah di gusi + Rongga Hidung (الخَيْشُوم)',
        soundFeature: 'Dengung sempurna 2-3 ketukan di hidung',
        surahNumber: 114,
        ayahNumber: 1,
        surahName: 'An-Naas',
        targetWord: 'النَّاسِ',
        exampleText: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
        exampleLatin: 'Qul a\'ūżu birabbin-nās',
        audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/114001.mp3',
        audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/114001.mp3'
      },
      {
        char: 'مّ',
        nameLatin: 'Mim Bertasydid',
        transliteration: 'Mim Musyaddadah',
        makhraj: 'Dua bibir dirapatkan + Rongga Hidung',
        soundFeature: 'Bibir merapat rapat dengan dengungan hidung 2-3 ketukan',
        surahNumber: 78,
        ayahNumber: 1,
        surahName: 'An-Naba\'',
        targetWord: 'عَمَّ',
        exampleText: 'عَمَّ يَتَسَاءَلُونَ',
        exampleLatin: '\'Amma yatasā\'alūn',
        audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/078001.mp3',
        audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/078001.mp3'
      }
    ]
  }
];

// Single audio element tracker for pure human voice playback
let currentHumanAudio: HTMLAudioElement | null = null;

/**
 * Play authentic human Qari audio from studio recording with tempo regulation.
 * ZERO speech synthesis / AI tools.
 */
export function playHumanQariAudio(
  audioUrl: string,
  speed: number = 1.0,
  onEnd?: () => void
): boolean {
  if (typeof window === 'undefined') {
    if (onEnd) onEnd();
    return false;
  }

  try {
    stopPronunciation();

    const audio = new Audio(audioUrl);
    currentHumanAudio = audio;
    audio.playbackRate = Math.max(0.4, Math.min(speed, 1.5));
    // Native pitch preservation so human vocal tract remains natural
    // even when slowed down for detailed makhraj study:
    (audio as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = true;

    let ended = false;
    const cleanup = () => {
      if (!ended) {
        ended = true;
        if (currentHumanAudio === audio) {
          currentHumanAudio = null;
        }
        if (onEnd) onEnd();
      }
    };

    audio.onended = cleanup;
    audio.onerror = (e) => {
      console.warn('Audio play error, fallback to Islamic Network:', e);
      cleanup();
    };

    audio.play().catch((err) => {
      console.warn('Playback blocked or network err:', err);
      cleanup();
    });

    return true;
  } catch (err) {
    console.error('Human audio playback failed:', err);
    if (onEnd) onEnd();
    return false;
  }
}

/**
 * Stop any ongoing human Qari audio playback.
 */
export function stopPronunciation() {
  if (currentHumanAudio) {
    try {
      currentHumanAudio.pause();
      currentHumanAudio.currentTime = 0;
    } catch {
      // Ignore
    }
    currentHumanAudio = null;
  }
}

/**
 * Play isolated single letter recording (e.g. "Tsa", "Shod", "Dhod").
 * Instant ~1s authentic human recording.
 */
export function playIsolatedLetterAudio(
  letter: string,
  speed: number = 1.0,
  onEnd?: () => void
): boolean {
  const url = getSingleLetterAudioUrl(letter);
  return playHumanQariAudio(url, speed, onEnd);
}

/**
 * Backward-compatible helper that resolves either a direct URL or letter/text
 * to an authentic human audio URL.
 */
export function playPronunciation(
  input: string,
  speed: number = 0.75,
  onEnd?: () => void
): boolean {
  if (!input) {
    if (onEnd) onEnd();
    return false;
  }

  // 1. Direct URL provided (HTTP, HTTPS, or local /audio/...)
  if (input.startsWith('http://') || input.startsWith('https://') || input.startsWith('/')) {
    return playHumanQariAudio(input, speed, onEnd);
  }

  // 2. Check harakat or isolated letter audio
  const singleUrl = getSingleLetterAudioUrl(input);
  if (singleUrl) {
    return playHumanQariAudio(singleUrl, speed, onEnd);
  }

  // 3. Fallback letter lookup
  const letterInfo = getLetterPhoneticInfo(input);
  if (letterInfo) {
    const url = letterInfo.singleLetterAudioUrl || (activeQari === 'husary' ? letterInfo.audioUrlHusary : letterInfo.audioUrlAlafasy);
    return playHumanQariAudio(url, speed, onEnd);
  }

  // Fallback default ayah: Al-Fatihah 1
  return playHumanQariAudio('https://everyayah.com/data/Alafasy_128kbps/001001.mp3', speed, onEnd);
}
