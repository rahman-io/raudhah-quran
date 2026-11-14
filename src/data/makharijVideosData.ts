export interface MakharijLesson {
  id: number;
  index: number;
  title: string;
  arabicTitle?: string;
  letters: string[];
  category: 'Pengantar' | 'Tenggorokan (Al-Halq)' | 'Lidah (Al-Lisan)' | 'Bibir (Asy-Syafatain)' | 'Rongga (Al-Jauf & Khaisyum)' | 'Sifat Huruf (Sifaat)' | 'Evaluasi';
  description: string;
  duration: string;
  videoId?: string;
}

export const PLAYLIST_ID = 'PL6TIMIZ5yIgpmInN3EpkOec0tJ8OJZ5re';
export const PLAYLIST_URL = `https://www.youtube.com/playlist?list=${PLAYLIST_ID}`;

export const MAKHAREJ_LESSONS: MakharijLesson[] = [
  {
    id: 1,
    index: 1,
    title: 'The EASIEST explanation for Makharij & Sifaat - Lesson 1',
    arabicTitle: 'مقدمة في مخارج الحروف وصفاتها',
    letters: ['ـ'],
    category: 'Pengantar',
    description: 'Konsep dasar 5 area utama keluarnya huruf (Makharij) dan karakteristik suara (Sifaat) dengan ilustrasi visual anatomi mulut.',
    duration: '9:46',
    videoId: '-YrfRpwFMe8'
  },
  {
    id: 2,
    index: 2,
    title: 'The EASIEST explanation for Makharij ء + ه - Lesson 2',
    arabicTitle: 'أقصى الحلق (الهمزة والهاء)',
    letters: ['ء', 'هـ'],
    category: 'Tenggorokan (Al-Halq)',
    description: 'Anatomi tenggorokan bagian terdalam/bawah (Aqshal Halq) tempat keluarnya Hamzah (ء) dan Ha (هـ).',
    duration: '9:42'
  },
  {
    id: 3,
    index: 3,
    title: 'TWO TRICKS to master ع + ح sounds - Lesson 3',
    arabicTitle: 'وسط الحلق (العين والحاء)',
    letters: ['ع', 'ح'],
    category: 'Tenggorokan (Al-Halq)',
    description: 'Dua trik jitu menguasai huruf tenggorokan tengah (Wasathul Halq) yaitu Ain (ع) dan Ha bersih (ح) tanpa tertukar.',
    duration: '9:17'
  },
  {
    id: 4,
    index: 4,
    title: 'AVOID these FOUR mistakes with غ + خ - Lesson 4',
    arabicTitle: 'أدنى الحلق (الغين والخاء)',
    letters: ['غ', 'خ'],
    category: 'Tenggorokan (Al-Halq)',
    description: 'Hindari 4 kesalahan umum pada huruf tenggorokan atas (Adnal Halq) yaitu Ghain (غ) dan Kha (خ).',
    duration: '9:51'
  },
  {
    id: 5,
    index: 5,
    title: "With THIS method, you'll get ق right EVERY time - Lesson 5",
    arabicTitle: 'أقصى اللسان (القاف)',
    letters: ['ق'],
    category: 'Lidah (Al-Lisan)',
    description: 'Metode tepat melafalkan Qaf (ق) dari pangkal lidah terdalam yang menempel pada langit-langit lunak.',
    duration: '7:44'
  },
  {
    id: 6,
    index: 6,
    title: 'How to pronounce the PROPER Arabic ك - Lesson 6',
    arabicTitle: 'أقصى اللسان (الكاف)',
    letters: ['ك'],
    category: 'Lidah (Al-Lisan)',
    description: 'Cara melafalkan huruf Kaf (ك) dari pangkal lidah di bawah makhraj Qaf disertai hembusan nafas halus (Hams).',
    duration: '7:49'
  },
  {
    id: 7,
    index: 7,
    title: 'With THIS method, ANYONE can master ض - Lesson 7',
    arabicTitle: 'حافة اللسان (الضاد)',
    letters: ['ض'],
    category: 'Lidah (Al-Lisan)',
    description: 'Rahasia menguasai huruf Dhad (ض), huruf paling khas dalam bahasa Arab, dari tepi/sisi lidah dan sifat Istithalah.',
    duration: '8:28'
  },
  {
    id: 8,
    index: 8,
    title: 'How to pronounce Arabic ج, ش, ي properly - Lesson 8',
    arabicTitle: 'وسط اللسان (الجيم والشين والياء)',
    letters: ['ج', 'ش', 'ي'],
    category: 'Lidah (Al-Lisan)',
    description: 'Titik makhraj tengah lidah (Wasathul Lisan) yang diangkat ke langit-langit keras: Jim (ج), Syin (ش), dan Ya (ي).',
    duration: '9:12'
  },
  {
    id: 9,
    index: 9,
    title: 'Master the tricky Arabic ل, ن, ر sounds - Lesson 9',
    arabicTitle: 'طرف اللسان (اللام والنون والراء)',
    letters: ['ل', 'ن', 'ر'],
    category: 'Lidah (Al-Lisan)',
    description: 'Perbedaan halus makhraj ujung dan tepi lidah depan untuk melafalkan Lam (ل), Nun (ن), dan getaran halus Ra (ر).',
    duration: '9:30'
  },
  {
    id: 10,
    index: 10,
    title: 'Master ط, د, ت without confusion - Lesson 10',
    arabicTitle: 'الحروف النطعية (الطاء والدال والتاء)',
    letters: ['ط', 'د', 'ت'],
    category: 'Lidah (Al-Lisan)',
    description: 'Makhraj ujung lidah yang bertemu pangkal gigi seri atas (Huruf Nith\'iyyah) dan perbedaan tebal tipisnya.',
    duration: '8:55'
  },
  {
    id: 11,
    index: 11,
    title: 'Master the whistling letters ص, ز, س - Lesson 11',
    arabicTitle: 'حروف الصفير (الصاد والزاي والسين)',
    letters: ['ص', 'ز', 'س'],
    category: 'Lidah (Al-Lisan)',
    description: 'Makhraj dan teknik menghasilkan suara desis alami (As-Safir) pada huruf Shad (ص), Zay (ز), dan Sin (س).',
    duration: '8:40'
  },
  {
    id: 12,
    index: 12,
    title: 'Master ظ, ذ, ث with tongue position - Lesson 12',
    arabicTitle: 'الحروف اللثوية (الظاء والذال والثاء)',
    letters: ['ظ', 'ذ', 'ث'],
    category: 'Lidah (Al-Lisan)',
    description: 'Posisi ujung lidah yang sedikit keluar menyentuh ujung gigi seri depan atas (Huruf Litsawiyyah): Zha (ظ), Dzal (ذ), Tsa (ث).',
    duration: '9:05'
  },
  {
    id: 13,
    index: 13,
    title: 'How to pronounce ف, ب, م, و properly - Lesson 13',
    arabicTitle: 'مخارج الشفتين (الفاء والباء والميم والواو)',
    letters: ['ف', 'ب', 'م', 'و'],
    category: 'Bibir (Asy-Syafatain)',
    description: 'Makhraj huruf bibir: Fa (ف) dari bibir bawah & gigi atas, serta Ba (ب), Mim (م), Wawu (و) dari pertemuan dua bibir.',
    duration: '9:15'
  },
  {
    id: 14,
    index: 14,
    title: 'Letters of Al-Jauf & Al-Khaisyum - Lesson 14',
    arabicTitle: 'الجوف والخيشوم (حروف المد والغنة)',
    letters: ['ا', 'و', 'ي', 'نّ', 'مّ'],
    category: 'Rongga (Al-Jauf & Khaisyum)',
    description: 'Rongga terbuka tenggorokan & mulut (Al-Jauf) untuk huruf Mad panjang, serta rongga hidung (Al-Khaisyum) untuk suara dengung (Ghunnah).',
    duration: '8:20'
  },
  {
    id: 15,
    index: 15,
    title: 'Introduction to Sifaat Al-Huruf: Hams vs Jahr - Lesson 15',
    arabicTitle: 'صفات الحروف: الهمس والجهر',
    letters: ['ف', 'ح', 'ث', 'هـ', 'ش', 'خ', 'ص', 'س', 'ك', 'ت'],
    category: 'Sifat Huruf (Sifaat)',
    description: 'Karakteristik aliran nafas saat pengucapan huruf: Hams (berhembus nafas) lawan dari Jahr (tertahan nafas).',
    duration: '9:35'
  },
  {
    id: 16,
    index: 16,
    title: 'Sifat Asy-Syiddah, Ar-Rakhawah & Al-Bainiyyah - Lesson 16',
    arabicTitle: 'الشدة والرخاوة والتوسط (البينية)',
    letters: ['أ', 'ج', 'د', 'ق', 'ط', 'ب', 'ك', 'ت'],
    category: 'Sifat Huruf (Sifaat)',
    description: 'Karakteristik aliran suara: Syiddah (suara tertahan kuat), Rakhawah (suara mengalir), dan Bainiyyah (pertengahan pada ل, ن, ع, م, ر).',
    duration: '10:10'
  },
  {
    id: 17,
    index: 17,
    title: "Sifat Al-Isti'la vs Al-Istifal - Lesson 17",
    arabicTitle: 'الاستعلاء والاستفال (التفخيم والترقيق)',
    letters: ['خ', 'ص', 'ض', 'غ', 'ط', 'ق', 'ظ'],
    category: 'Sifat Huruf (Sifaat)',
    description: 'Mengangkat pangkal lidah ke langit-langit (Isti\'la/huruf tebal) versus merendahkan lidah (Istifal/huruf tipis).',
    duration: '9:40'
  },
  {
    id: 18,
    index: 18,
    title: 'Sifat Al-Ithbaq vs Al-Infitah - Lesson 18',
    arabicTitle: 'الإطباق والانفتاح',
    letters: ['ص', 'ض', 'ط', 'ظ'],
    category: 'Sifat Huruf (Sifaat)',
    description: 'Menempelkan bagian tengah lidah ke langit-langit mulut (Ithbaq) yang membuat 4 huruf ini terdengar sangat tebal.',
    duration: '8:50'
  },
  {
    id: 19,
    index: 19,
    title: 'The Complete Guide to Qalqalah & Its Levels - Lesson 19',
    arabicTitle: 'صفة القلقلة ومراتبها',
    letters: ['ق', 'ط', 'ب', 'ج', 'د'],
    category: 'Sifat Huruf (Sifaat)',
    description: 'Sifat pantulan suara getar (Qalqalah) pada huruf Quthbu Jadin, tingkatan sughra (ringan) dan kubra (kuat saat waqaf).',
    duration: '9:15'
  },
  {
    id: 20,
    index: 20,
    title: 'Sifat As-Safir & At-Tafasysyi - Lesson 20',
    arabicTitle: 'الصفير والتفشي',
    letters: ['ص', 'ز', 'س', 'ش'],
    category: 'Sifat Huruf (Sifaat)',
    description: 'Sifat suara siulan/desis tajam (Safir) dan sebaran angin yang memenuhi rongga mulut pada huruf Syin (Tafasysyi).',
    duration: '8:30'
  },
  {
    id: 21,
    index: 21,
    title: 'Sifat Al-Istithalah in Letter Dhad (ض) - Lesson 21',
    arabicTitle: 'صفة الاستطالة في حرف الضاد',
    letters: ['ض'],
    category: 'Sifat Huruf (Sifaat)',
    description: 'Penjelasan mendalam sifat memanjangnya makhraj Dhad dari awal tepi lidah hingga mendekati makhraj Lam.',
    duration: '9:00'
  },
  {
    id: 22,
    index: 22,
    title: 'Sifat Al-Inhiraf & At-Takrir - Lesson 22',
    arabicTitle: 'الانحراف والتكرير (اللام والراء)',
    letters: ['ل', 'ر'],
    category: 'Sifat Huruf (Sifaat)',
    description: 'Penyimpangan aliran suara pada huruf Lam (Inhiraf) dan batasan getaran ujung lidah pada huruf Ra agar tidak berlebihan (Takrir).',
    duration: '8:45'
  },
  {
    id: 23,
    index: 23,
    title: 'Summary & Practical Quranic Testing for Makharij & Sifaat - Lesson 23',
    arabicTitle: 'خلاصة واختبار تطبيقي لمخارج الحروف',
    letters: ['أ-ي'],
    category: 'Evaluasi',
    description: 'Rangkuman lengkap seluruh makhraj & sifat huruf serta latihan praktis membaca ayat-ayat Al-Qur\'an secara fasih.',
    duration: '11:20'
  }
];
