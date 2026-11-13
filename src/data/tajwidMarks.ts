/**
 * Hukum tajwid yang ditandai per kata di Baca & Tadabbur (data public/quran-tajwid).
 * Kode singkat dipakai di berkas data; `lesson` mengarah ke materi Belajar Tajwid (src/data/tajwidData.ts).
 * Penjelasan mengikuti riwayat Hafs 'an 'Ashim (jalur Syatibiyyah), sama dengan mushaf Kemenag.
 */

export type TajwidCode =
  | 'gh' | 'ig' | 'in' | 'ij' | 'iq' | 'is' | 'ks' | 'ik' | 'il' | 'ih' | 'iz'
  | 'm2' | 'ma' | 'm6' | 'mf' | 'mt' | 'qa' | 'hw' | 'sl' | 'ls' | 'lq';

export interface TajwidMarkInfo {
  nameLatin: string;
  nameArabic: string;
  color: string;
  /** Materi di Belajar Tajwid, bila ada. */
  lesson?: string;
  /** Penjelasan singkat; {huruf} diganti huruf yang terkena hukum, {pemicu} huruf sesudahnya. */
  reason: string;
  howToRead: string;
  /** Hanya catatan cara baca (bukan hukum yang diujikan di latihan). */
  note?: boolean;
}

export const TAJWID_MARKS: Record<TajwidCode, TajwidMarkInfo> = {
  ih: {
    nameLatin: 'Izhar Halqi',
    nameArabic: 'إِظْهَار حَلْقِي',
    color: '#3B6E8F',
    lesson: 'izhar-halqi',
    reason: 'Nun sukun atau tanwin bertemu huruf halqi (tenggorokan) {pemicu}.',
    howToRead: 'Nun/tanwin dibaca jelas dan terang, tanpa dengung.'
  },
  ig: {
    nameLatin: 'Idgham Bighunnah',
    nameArabic: 'إِدْغَام بِغُنَّة',
    color: '#169777',
    lesson: 'idgham-bighunnah',
    reason: 'Nun sukun atau tanwin bertemu salah satu huruf ي ن م و, yaitu {pemicu}.',
    howToRead: 'Nun/tanwin dimasukkan ke huruf sesudahnya dan dibaca berdengung (±2 harakat).'
  },
  in: {
    nameLatin: 'Idgham Bilaghunnah',
    nameArabic: 'إِدْغَام بِلَا غُنَّة',
    color: '#5E9E1F',
    lesson: 'idgham-bilaghunnah',
    reason: 'Nun sukun atau tanwin bertemu huruf ل atau ر, yaitu {pemicu}.',
    howToRead: 'Nun/tanwin dilebur penuh ke huruf sesudahnya tanpa dengung.'
  },
  il: {
    nameLatin: 'Iqlab',
    nameArabic: 'إِقْلَاب',
    color: '#1E9BD7',
    lesson: 'iqlab',
    reason: 'Nun sukun atau tanwin bertemu huruf ب.',
    howToRead: 'Bunyi nun/tanwin diganti menjadi mim (م) samar, dibaca berdengung (±2 harakat).'
  },
  ik: {
    nameLatin: 'Ikhfa Haqiqi',
    nameArabic: 'إِخْفَاء حَقِيقِي',
    color: '#9400A8',
    lesson: 'ikhfa-haqiqi',
    reason: 'Nun sukun atau tanwin bertemu salah satu dari 15 huruf ikhfa, yaitu {pemicu}.',
    howToRead: 'Nun/tanwin dibaca samar (antara jelas dan lebur) dengan dengung (±2 harakat).'
  },
  is: {
    nameLatin: 'Idgham Mimi (Syafawi)',
    nameArabic: 'إِدْغَام شَفَوِي',
    color: '#0E8C7F',
    lesson: 'mim-sukun',
    reason: 'Mim sukun bertemu huruf mim (م).',
    howToRead: 'Kedua mim dilebur menjadi satu mim bertasydid dan dibaca berdengung (±2 harakat).'
  },
  ks: {
    nameLatin: 'Ikhfa Syafawi',
    nameArabic: 'إِخْفَاء شَفَوِي',
    color: '#C2189A',
    lesson: 'mim-sukun',
    reason: 'Mim sukun bertemu huruf ب.',
    howToRead: 'Mim dibaca samar di bibir dengan dengung (±2 harakat).'
  },
  iz: {
    nameLatin: 'Izhar Syafawi',
    nameArabic: 'إِظْهَار شَفَوِي',
    color: '#4A6A7E',
    lesson: 'mim-sukun',
    reason: 'Mim sukun bertemu huruf selain م dan ب, yaitu {pemicu}.',
    howToRead: 'Mim dibaca jelas tanpa dengung; jangan dipanjangkan atau didengungkan.'
  },
  gh: {
    nameLatin: 'Ghunnah Musyaddadah',
    nameArabic: 'غُنَّة مُشَدَّدَة',
    color: '#E8740C',
    lesson: 'ghunnah-musyaddadah',
    reason: 'Huruf {huruf} bertasydid (نّ atau مّ).',
    howToRead: 'Dibaca berdengung dengan jelas, ditahan ±2 harakat.'
  },
  qa: {
    nameLatin: 'Qalqalah',
    nameArabic: 'قَلْقَلَة',
    color: '#D7192A',
    lesson: 'qalqalah',
    reason: 'Huruf qalqalah ({huruf}) dalam keadaan sukun atau diwaqafkan. Huruf qalqalah: ق ط ب ج د.',
    howToRead: 'Huruf dibaca memantul ringan; pantulan lebih kuat bila di akhir bacaan (qalqalah kubra).'
  },
  ls: {
    nameLatin: 'Al-Syamsiyah',
    nameArabic: 'إِدْغَام شَمْسِيَّة',
    color: '#A07A3C',
    lesson: 'al-syamsiyah',
    reason: 'Alif lam (ال) bertemu huruf syamsiyah.',
    howToRead: 'Lam tidak dibaca; langsung masuk ke huruf sesudahnya yang bertasydid.'
  },
  lq: {
    nameLatin: 'Al-Qamariyah',
    nameArabic: 'إِظْهَار قَمَرِيَّة',
    color: '#2F7D6D',
    lesson: 'al-qamariyah',
    reason: 'Alif lam (ال) bertemu huruf qamariyah {pemicu}.',
    howToRead: 'Lam dibaca jelas (sukun), lalu lanjut ke huruf sesudahnya.'
  },
  m2: {
    nameLatin: "Mad Thabi'i",
    nameArabic: 'مَدّ طَبِيعِي',
    color: '#4C7BEF',
    lesson: 'mad-dasar',
    reason: 'Huruf mad (ا و ي) tanpa diikuti hamzah atau sukun.',
    howToRead: 'Dipanjangkan 2 harakat (satu alif).'
  },
  ma: {
    nameLatin: "Mad 'Aridh Lissukun / Mad Lin",
    nameArabic: 'مَدّ عَارِض لِلسُّكُون',
    color: '#3A5FCD',
    lesson: 'mad-dasar',
    reason: 'Huruf mad atau lin sebelum huruf terakhir yang dibaca waqaf (berhenti).',
    howToRead: 'Saat berhenti, boleh dipanjangkan 2, 4, atau 6 harakat; saat bersambung dibaca biasa.'
  },
  mf: {
    nameLatin: 'Mad Jaiz Munfasil',
    nameArabic: 'مَدّ جَائِز مُنْفَصِل',
    color: '#2747B8',
    lesson: 'mad-dasar',
    reason: 'Huruf mad di akhir kata bertemu hamzah di awal kata berikutnya.',
    howToRead: 'Dipanjangkan 4 atau 5 harakat (riwayat Hafs).'
  },
  mt: {
    nameLatin: 'Mad Wajib Muttasil',
    nameArabic: 'مَدّ وَاجِب مُتَّصِل',
    color: '#1D338F',
    lesson: 'mad-dasar',
    reason: 'Huruf mad bertemu hamzah dalam satu kata.',
    howToRead: 'Wajib dipanjangkan 4 atau 5 harakat.'
  },
  m6: {
    nameLatin: 'Mad Lazim',
    nameArabic: 'مَدّ لَازِم',
    color: '#0F1F78',
    lesson: 'mad-dasar',
    reason: 'Huruf mad bertemu sukun asli atau tasydid dalam satu kata (atau huruf muqatha\'ah).',
    howToRead: 'Dipanjangkan 6 harakat.'
  },
  ij: {
    nameLatin: 'Idgham Mutajanisain',
    nameArabic: 'إِدْغَام مُتَجَانِسَيْن',
    color: '#6B5B95',
    reason: 'Dua huruf yang makhrajnya sama tetapi sifatnya berbeda bertemu (mis. تْ–ط, دْ–ت, ذْ–ظ, بْ–م).',
    howToRead: 'Huruf pertama dilebur ke huruf kedua.'
  },
  iq: {
    nameLatin: 'Idgham Mutaqaribain',
    nameArabic: 'إِدْغَام مُتَقَارِبَيْن',
    color: '#7A5C9E',
    reason: 'Dua huruf yang makhraj dan sifatnya berdekatan bertemu (mis. قْ–ك, لْ–ر).',
    howToRead: 'Huruf pertama dilebur ke huruf kedua.'
  },
  hw: {
    nameLatin: 'Hamzah Washal',
    nameArabic: 'هَمْزَة الوَصْل',
    color: '#8E9AA6',
    reason: 'Alif washal di awal kata.',
    howToRead: 'Tidak dibaca bila bacaan bersambung; hanya dibaca bila memulai bacaan dari kata ini.',
    note: true
  },
  sl: {
    nameLatin: 'Huruf Tidak Dibaca',
    nameArabic: 'حَرْف لَا يُنْطَق',
    color: '#8E9AA6',
    reason: 'Huruf ini tertulis tetapi tidak dilafalkan (mis. alif sesudah wawu jamak).',
    howToRead: 'Lewati huruf ini saat membaca.',
    note: true
  }
};

/** Urutan prioritas warna bila dua tanda menimpa huruf yang sama. */
export const TAJWID_PRIORITY: TajwidCode[] = ['gh', 'qa', 'il', 'ik', 'ks', 'ig', 'in', 'is', 'ij', 'iq', 'mt', 'mf', 'm6', 'ma', 'm2', 'ls', 'lq', 'ih', 'iz', 'hw', 'sl'];

/** Isi teks penjelasan dengan huruf yang ditandai dan huruf pemicunya. */
export const tajwidReason = (code: TajwidCode, letter: string, trigger: string) =>
  TAJWID_MARKS[code].reason.replace('{huruf}', letter || '').replace('{pemicu}', trigger ? `(${trigger})` : '').replace(/\s+\./g, '.').trim();
