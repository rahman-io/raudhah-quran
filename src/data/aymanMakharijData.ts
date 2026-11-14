export interface AymanLesson {
  id: number;
  index: number;
  letter: string;
  letterName: string;
  arabicName: string;
  title: string;
  category: 'Tenggorokan (Al-Halq)' | 'Lidah (Al-Lisan)' | 'Bibir (Asy-Syafatain)' | 'Rongga (Al-Jauf)';
  makhrajPoint: string;
  description: string;
  duration: string;
  videoId?: string;
}

export const AYMAN_PLAYLIST_ID = 'PL660h-wGc9fGYpCiW18k8hCENrfmerQeq';
export const AYMAN_PLAYLIST_URL = `https://www.youtube.com/playlist?list=${AYMAN_PLAYLIST_ID}`;

export const AYMAN_LESSONS: AymanLesson[] = [
  {
    id: 1,
    index: 1,
    letter: 'ء',
    letterName: 'Hamzah',
    arabicName: 'الهمزة',
    title: '1. Makhraj of Hamzah ء | By Sheikh Ayman Rushdi Suweid',
    category: 'Tenggorokan (Al-Halq)',
    makhrajPoint: 'Aqshal Halq (Pangkal Tenggorokan Terbawah)',
    description: 'Pita suara tertutup rapat saat sukun dan terbuka saat berharakat dari dasar tenggorokan terdalam.',
    duration: '2:01',
    videoId: 'aQ93eMKss0Q'
  },
  {
    id: 2,
    index: 2,
    letter: 'ب',
    letterName: 'Ba',
    arabicName: 'الباء',
    title: '2. Makhraj of Bā ب | By Sheikh Ayman Rushdi Suweid',
    category: 'Bibir (Asy-Syafatain)',
    makhrajPoint: 'Pertemuan Dua Bibir (Asy-Syafatain)',
    description: 'Rapatkan dua bibir bagian basah (dalam) dengan kuat, menimbulkan sifat Qalqalah saat sukun.',
    duration: '2:00'
  },
  {
    id: 3,
    index: 3,
    letter: 'ت',
    letterName: 'Ta',
    arabicName: 'التاء',
    title: '3. Makhraj of Tā ت | By Sheikh Ayman Rushdi Suweid',
    category: 'Lidah (Al-Lisan)',
    makhrajPoint: 'Ujung Lidah & Pangkal Gigi Seri Atas',
    description: 'Ujung lidah menempel pada pangkal gigi seri atas, disertai hembusan nafas halus (Hams) tanpa berlebihan.',
    duration: '2:12'
  },
  {
    id: 4,
    index: 4,
    letter: 'ث',
    letterName: 'Tsa',
    arabicName: 'الثاء',
    title: '4. Makhraj of Thā ث | By Sheikh Ayman Rushdi Suweid',
    category: 'Lidah (Al-Lisan)',
    makhrajPoint: 'Ujung Lidah & Ujung Gigi Seri Atas',
    description: 'Ujung lidah sedikit dijulurkan menyentuh ujung gigi seri atas dengan aliran nafas dan suara lembut.',
    duration: '2:07'
  },
  {
    id: 5,
    index: 5,
    letter: 'ج',
    letterName: 'Jim',
    arabicName: 'الجيم',
    title: '5. Makhraj of Jīm ج | By Sheikh Ayman Rushdi Suweid',
    category: 'Lidah (Al-Lisan)',
    makhrajPoint: 'Tengah Lidah & Langit-langit Keras',
    description: 'Tengah lidah menempel sempurna ke langit-langit mulut (Syiddah) tanpa desis angin (tidak seperti huruf J Indonesia).',
    duration: '2:11'
  },
  {
    id: 6,
    index: 6,
    letter: 'ح',
    letterName: 'Ha',
    arabicName: 'الحاء',
    title: '6. Makhraj of Ḥā ح | By Sheikh Ayman Rushdi Suweid',
    category: 'Tenggorokan (Al-Halq)',
    makhrajPoint: 'Wasathul Halq (Tenggorokan Bagian Tengah)',
    description: 'Katup epiglotis bergeser ke belakang dinding faring menghasilkan suara bersih, kering, dan berdesir nafas.',
    duration: '2:05'
  },
  {
    id: 7,
    index: 7,
    letter: 'خ',
    letterName: 'Kha',
    arabicName: 'الخاء',
    title: '7. Makhraj of Khā خ | By Sheikh Ayman Rushdi Suweid',
    category: 'Tenggorokan (Al-Halq)',
    makhrajPoint: 'Adnal Halq (Tenggorokan Bagian Atas)',
    description: 'Pangkal lidah dekat anak tekak menghasilkan suara gesekan tebal (Isti\'la & Tafkhim).',
    duration: '2:01'
  },
  {
    id: 8,
    index: 8,
    letter: 'د',
    letterName: 'Dal',
    arabicName: 'الدال',
    title: '8. Makhraj of Dāl د | By Sheikh Ayman Rushdi Suweid',
    category: 'Lidah (Al-Lisan)',
    makhrajPoint: 'Ujung Lidah & Pangkal Gigi Seri Atas',
    description: 'Ujung lidah menempel kuat menahan nafas (Jahr & Syiddah) lalu memantul jernih (Qalqalah) saat sukun.',
    duration: '1:39'
  },
  {
    id: 9,
    index: 9,
    letter: 'ذ',
    letterName: 'Dzal',
    arabicName: 'الذال',
    title: '9. Makhraj of Dhāl ذ | By Sheikh Ayman Rushdi Suweid',
    category: 'Lidah (Al-Lisan)',
    makhrajPoint: 'Ujung Lidah & Ujung Gigi Seri Atas',
    description: 'Ujung lidah keluar sedikit mengenai ujung gigi seri atas, suara mengalir lembut dan tipis (Tarqiq).',
    duration: '1:55'
  },
  {
    id: 10,
    index: 10,
    letter: 'ر',
    letterName: 'Ra',
    arabicName: 'الراء',
    title: '10. Makhraj of Rā ر | By Sheikh Ayman Rushdi Suweid',
    category: 'Lidah (Al-Lisan)',
    makhrajPoint: 'Ujung Lidah Dekat Punggung Lidah',
    description: 'Sentuhan halus ujung lidah ke gusi atas dengan satu kali getaran terkontrol (sifat Takrir tersembunyi).',
    duration: '2:15'
  },
  {
    id: 11,
    index: 11,
    letter: 'ز',
    letterName: 'Zay',
    arabicName: 'الزاي',
    title: '11. Makhraj of Zāy ز | By Sheikh Ayman Rushdi Suweid',
    category: 'Lidah (Al-Lisan)',
    makhrajPoint: 'Ujung Lidah Di Balik Gigi Seri Bawah',
    description: 'Ujung lidah diletakkan di belakang gigi seri bawah menghasilkan desis tajam berdengung (As-Safir).',
    duration: '1:50'
  },
  {
    id: 12,
    index: 12,
    letter: 'س',
    letterName: 'Sin',
    arabicName: 'السين',
    title: '12. Makhraj of Sīn س | By Sheikh Ayman Rushdi Suweid',
    category: 'Lidah (Al-Lisan)',
    makhrajPoint: 'Ujung Lidah Di Balik Gigi Seri Bawah',
    description: 'Suara desis murni dengan hembusan nafas deras (Hams & Safir), lisan mendatar tipis (Tarqiq).',
    duration: '1:58'
  },
  {
    id: 13,
    index: 13,
    letter: 'ش',
    letterName: 'Syin',
    arabicName: 'الشين',
    title: '13. Makhraj of Shīn ش | By Sheikh Ayman Rushdi Suweid',
    category: 'Lidah (Al-Lisan)',
    makhrajPoint: 'Tengah Lidah & Langit-langit',
    description: 'Angin menyebar deras memenuhi seluruh rongga mulut (sifat At-Tafasysyi) saat melafalkan Syin.',
    duration: '2:10'
  },
  {
    id: 14,
    index: 14,
    letter: 'ص',
    letterName: 'Shad',
    arabicName: 'الصاد',
    title: '14. Makhraj of Ṣād ص | By Sheikh Ayman Rushdi Suweid',
    category: 'Lidah (Al-Lisan)',
    makhrajPoint: 'Ujung Lidah Di Balik Gigi Seri Bawah + Lidah Terangkat',
    description: 'Desis tajam (Safir) yang sangat tebal karena pangkal dan tengah lidah menempel ke langit-langit (Isti\'la & Ithbaq).',
    duration: '2:08'
  },
  {
    id: 15,
    index: 15,
    letter: 'ض',
    letterName: 'Dhad',
    arabicName: 'الضاد',
    title: '15. Makhraj of Ḍād ض | By Sheikh Ayman Rushdi Suweid',
    category: 'Lidah (Al-Lisan)',
    makhrajPoint: 'Tepi / Sisi Lidah bertemu Gigi Geraham Atas',
    description: 'Huruf paling unik dalam bahasa Arab: sisi lidah menekan gigi geraham atas dengan suara memanjang perlahan (Istithalah).',
    duration: '2:30'
  },
  {
    id: 16,
    index: 16,
    letter: 'ط',
    letterName: 'Tha',
    arabicName: 'الطاء',
    title: '16. Makhraj of Ṭā ط | By Sheikh Ayman Rushdi Suweid',
    category: 'Lidah (Al-Lisan)',
    makhrajPoint: 'Ujung Lidah & Pangkal Gigi Seri Atas + Langit-langit',
    description: 'Huruf paling kuat dalam Al-Qur\'an: mengumpulkan sifat Syiddah, Jahr, Isti\'la, Ithbaq, dan Qalqalah terkuat.',
    duration: '2:14'
  },
  {
    id: 17,
    index: 17,
    letter: 'ظ',
    letterName: 'Zha',
    arabicName: 'الظاء',
    title: '17. Makhraj of Ẓā ظ | By Sheikh Ayman Rushdi Suweid',
    category: 'Lidah (Al-Lisan)',
    makhrajPoint: 'Ujung Lidah & Ujung Gigi Seri Atas + Tebal',
    description: 'Ujung lidah keluar sedikit mengenai gigi seri atas, dengan pangkal lidah terangkat tebal (Ithbaq).',
    duration: '2:02'
  },
  {
    id: 18,
    index: 18,
    letter: 'ع',
    letterName: 'Ain',
    arabicName: 'العين',
    title: "18. Makhraj of 'Ayn ع | By Sheikh Ayman Rushdi Suweid",
    category: 'Tenggorokan (Al-Halq)',
    makhrajPoint: 'Wasathul Halq (Tenggorokan Tengah)',
    description: 'Penyempitan epiglotis menahan sebagian suara (Bainiyyah/Tawassuth), suara terdengar dalam dan bulat tanpa sengau.',
    duration: '2:16'
  },
  {
    id: 19,
    index: 19,
    letter: 'غ',
    letterName: 'Ghain',
    arabicName: 'الغين',
    title: '19. Makhraj of Ghayn غ | By Sheikh Ayman Rushdi Suweid',
    category: 'Tenggorokan (Al-Halq)',
    makhrajPoint: 'Adnal Halq (Tenggorokan Atas)',
    description: 'Tenggorokan atas dekat anak tekak dengan suara mengalir tebal dan basah (Rakhawah & Isti\'la).',
    duration: '2:04'
  },
  {
    id: 20,
    index: 20,
    letter: 'ف',
    letterName: 'Fa',
    arabicName: 'الفاء',
    title: '20. Makhraj of Fā ف | By Sheikh Ayman Rushdi Suweid',
    category: 'Bibir (Asy-Syafatain)',
    makhrajPoint: 'Bibir Bawah Bagian Dalam & Ujung Gigi Seri Atas',
    description: 'Ujung dua gigi seri atas menempel ke perut bibir bawah bagian dalam disertai desis angin lembut.',
    duration: '1:52'
  },
  {
    id: 21,
    index: 21,
    letter: 'ق',
    letterName: 'Qaf',
    arabicName: 'القاف',
    title: '21. Makhraj of Qāf ق | By Sheikh Ayman Rushdi Suweid',
    category: 'Lidah (Al-Lisan)',
    makhrajPoint: 'Pangkal Lidah Terdalam & Langit-langit Lunak',
    description: 'Pangkal lidah paling belakang menekan kuat langit-langit lunak dekat anak tekak menghasilkan suara tebal berdentum (Qalqalah).',
    duration: '2:18'
  },
  {
    id: 22,
    index: 22,
    letter: 'ك',
    letterName: 'Kaf',
    arabicName: 'الكاف',
    title: '22. Makhraj of Kāf ك | By Sheikh Ayman Rushdi Suweid',
    category: 'Lidah (Al-Lisan)',
    makhrajPoint: 'Pangkal Lidah Sedikit Ke Depan & Langit-langit Keras',
    description: 'Di bawah sedikit dari makhraj Qaf; suara tertahan kuat lalu dilepas dengan hembusan nafas tipis (Hams).',
    duration: '2:09'
  },
  {
    id: 23,
    index: 23,
    letter: 'ل',
    letterName: 'Lam',
    arabicName: 'اللام',
    title: '23. Makhraj of Lām ل | By Sheikh Ayman Rushdi Suweid',
    category: 'Lidah (Al-Lisan)',
    makhrajPoint: 'Tepi Lidah Depan Hingga Ujungnya bertemu Gusi Atas',
    description: 'Area tepi lidah terluas menempel ke gusi atas, suara menyimpang mengalir lewat sisi samping lidah (Inhiraf).',
    duration: '2:12'
  },
  {
    id: 24,
    index: 24,
    letter: 'م',
    letterName: 'Mim',
    arabicName: 'الميم',
    title: '24. Makhraj of Mīm م | By Sheikh Ayman Rushdi Suweid',
    category: 'Bibir (Asy-Syafatain)',
    makhrajPoint: 'Pertemuan Dua Bibir Bagian Luar + Rongga Hidung',
    description: 'Dua bibir terkatup wajar dan separuh suara dialirkan menjadi dengung merdu lewat rongga hidung (Ghunnah).',
    duration: '2:01'
  },
  {
    id: 25,
    index: 25,
    letter: 'ن',
    letterName: 'Nun',
    arabicName: 'النون',
    title: '25. Makhraj of Nūn ن | By Sheikh Ayman Rushdi Suweid',
    category: 'Lidah (Al-Lisan)',
    makhrajPoint: 'Ujung Lidah bertemu Gusi Atas + Rongga Hidung',
    description: 'Ujung lidah menempel pada gusi atas gigi seri depan, dan separuh suaranya keluar melalui rongga hidung (Ghunnah).',
    duration: '2:03'
  },
  {
    id: 26,
    index: 26,
    letter: 'هـ',
    letterName: 'Ha (Besar)',
    arabicName: 'الهاء',
    title: '26. Makhraj of Hā هـ | By Sheikh Ayman Rushdi Suweid',
    category: 'Tenggorokan (Al-Halq)',
    makhrajPoint: 'Aqshal Halq (Pangkal Tenggorokan Terbawah)',
    description: 'Keluar dari pita suara yang terbuka sedikit di dasar dada/tenggorokan, nafas mengalir bebas tanpa hambatan.',
    duration: '1:58'
  },
  {
    id: 27,
    index: 27,
    letter: 'و / ي',
    letterName: 'Waw & Ya (Huruf Mad)',
    arabicName: 'الواو والياء الجوفية',
    title: '27. Makhraj of Wāw & Yā | By Sheikh Ayman Rushdi Suweid',
    category: 'Rongga (Al-Jauf)',
    makhrajPoint: 'Al-Jauf (Rongga Udara Mulut & Tenggorokan)',
    description: 'Rongga terbuka tanpa kontak organ fisik untuk memanjangkan suara harakat (Mad) dan huruf lin.',
    duration: '2:25'
  }
];
