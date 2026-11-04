export interface TajwidRule {
  id: string;
  category: 'alif-lam' | 'nun-mati' | 'qalqalah' | 'ghunnah' | 'mim-mati' | 'mad' | 'ra';
  categoryTitle: string;
  nameArabic: string;
  nameLatin: string;
  meaning: string;
  letters: string[];
  mnemonic?: string;
  description: string;
  readingMethod: string;
  harakatCount?: string;
  colorTheme: string; // Tailwind color class or hex
  examples: {
    phraseArabic: string;
    phraseLatin: string;
    surahName: string;
    surahAyah: string;
    surahNumber: number;
    ayahNumber: number;
    audioUrl: string;
    explanation: string;
  }[];
}

export const TAJWID_RULES: TajwidRule[] = [
  // 1. ALIF LAM
  {
    id: 'al-qamariyah',
    category: 'alif-lam',
    categoryTitle: 'Hukum Alif Lam (ال)',
    nameArabic: 'إِظْهَار قَمَرِيَّة',
    nameLatin: 'Alif Lam Qamariyah',
    meaning: 'Alif Lam yang dibaca jelas laksana terangnya bulan (Qamar)',
    letters: ['ا', 'ب', 'غ', 'ح', 'ج', 'ك', 'و', 'خ', 'ف', 'ع', 'ق', 'ي', 'م', 'هـ'],
    mnemonic: 'Ringkasan: اِبْغِ حَجَّكَ وَخَفْ عَقِيمَهُ (Ibghi hajjaka wa khof \'aqiimah)',
    description: 'Terjadi apabila huruf Alif Lam (ال) bertemu dengan salah satu dari 14 huruf Qamariyah. Huruf lam tetap berharakat sukun (ْ) dan dibaca jelas bunyi "L"-nya.',
    readingMethod: 'Lafazkan huruf Lam sukun secara tegas, jelas, dan terang tanpa mendengung.',
    harakatCount: '1 Harakat (Jelas)',
    colorTheme: '#2A9D8F',
    examples: [
      {
        phraseArabic: 'الْحَمْدُ لِلَّهِ',
        phraseLatin: 'Al-ḥamdu lillāh',
        surahName: 'Al-Fatihah',
        surahAyah: '1:2',
        surahNumber: 1,
        ayahNumber: 2,
        audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/001002.mp3',
        explanation: 'Alif Lam bertemu huruf Ha (ح), bunyi "Al" dibaca jelas oleh Syaikh.'
      },
      {
        phraseArabic: 'بِرَبِّ الْفَلَقِ',
        phraseLatin: 'Bi-rabbil-falaq',
        surahName: 'Al-Falaq',
        surahAyah: '113:1',
        surahNumber: 113,
        ayahNumber: 1,
        audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/113001.mp3',
        explanation: 'Alif Lam bertemu huruf Fa (ف), lam sukun dibaca terang.'
      },
      {
        phraseArabic: 'إِنَّ الْإِنسَانَ',
        phraseLatin: 'Innal-insāna',
        surahName: 'Al-\'Asr',
        surahAyah: '103:2',
        surahNumber: 103,
        ayahNumber: 2,
        audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/103002.mp3',
        explanation: 'Alif Lam bertemu huruf Alif/Hamzah (ا), dibaca jelas.'
      }
    ]
  },
  {
    id: 'al-syamsiyah',
    category: 'alif-lam',
    categoryTitle: 'Hukum Alif Lam (ال)',
    nameArabic: 'إِدْغَام شَمْسِيَّة',
    nameLatin: 'Alif Lam Syamsiyah',
    meaning: 'Alif Lam yang melebur laksana silau cahaya matahari (Syams)',
    letters: ['ط', 'ث', 'ص', 'ر', 'ت', 'ض', 'ذ', 'ن', 'د', 'س', 'ظ', 'ز', 'ش', 'ل'],
    mnemonic: '14 huruf selain huruf Qamariyah, ditandai tasydid pada huruf berikutnya.',
    description: 'Terjadi apabila huruf Alif Lam (ال) bertemu salah satu dari 14 huruf Syamsiyah. Bunyi huruf Lam tidak dibaca melainkan dileburkan (di-idgham-kan) ke huruf berikutnya yang bertasydid.',
    readingMethod: 'Masukkan bunyi vokal langsung ke huruf Syamsiyah berikutnya dengan penekanan tasydid tanpa membunyikan huruf "L".',
    harakatCount: 'Melebur bertasydid',
    colorTheme: '#E76F51',
    examples: [
      {
        phraseArabic: 'بِرَبِّ النَّاسِ',
        phraseLatin: 'Bi-rabbin-nās',
        surahName: 'An-Naas',
        surahAyah: '114:1',
        surahNumber: 114,
        ayahNumber: 1,
        audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/114001.mp3',
        explanation: 'Alif Lam bertemu huruf Nun (ن), bunyi Lam lebur menjadi "an-nās".'
      },
      {
        phraseArabic: 'الرَّحْمَٰنِ الرَّحِيمِ',
        phraseLatin: 'Ar-Raḥmānir-Raḥīm',
        surahName: 'Al-Fatihah',
        surahAyah: '1:1',
        surahNumber: 1,
        ayahNumber: 1,
        audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/001001.mp3',
        explanation: 'Alif Lam bertemu huruf Ra (ر), bunyi Lam lebur menjadi "ar-raḥmān".'
      },
      {
        phraseArabic: 'اهْدِنَا الصِّرَاطَ',
        phraseLatin: 'Ihdinaṣ-ṣirāṭ',
        surahName: 'Al-Fatihah',
        surahAyah: '1:6',
        surahNumber: 1,
        ayahNumber: 6,
        audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/001006.mp3',
        explanation: 'Alif Lam bertemu huruf Shad (ص), langsung masuk ke huruf Shad.'
      }
    ]
  },

  // 2. NUN SUKUN & TANWIN
  {
    id: 'izhar-halqi',
    category: 'nun-mati',
    categoryTitle: 'Hukum Nun Sukun & Tanwin',
    nameArabic: 'إِظْهَار حَلْقِي',
    nameLatin: 'Izhar Halqi',
    meaning: 'Jelas keluar dari pangkal/tenggorokan (Halq)',
    letters: ['ء', 'هـ', 'ع', 'ح', 'غ', 'خ'],
    description: 'Terjadi apabila Nun Sukun (نْ) atau Tanwin (ـً ـٍ ـٌ) bertemu salah satu dari 6 huruf halqi (huruf yang keluar dari tenggorokan).',
    readingMethod: 'Wajib dibaca terang, jelas, dan tegas tanpa dengung atau jeda berlebihan.',
    harakatCount: '1 Harakat (Tanpa Dengung)',
    colorTheme: '#457B9D',
    examples: [
      {
        phraseArabic: 'مِنْ حَكِيمٍ',
        phraseLatin: 'Min ḥakīm',
        surahName: 'Fushshilat',
        surahAyah: '41:42',
        surahNumber: 41,
        ayahNumber: 42,
        audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/041042.mp3',
        explanation: 'Nun sukun bertemu huruf Ha (ح), dibaca jelas "min ḥakīm".'
      },
      {
        phraseArabic: 'نَارٌ حَامِيَةٌ',
        phraseLatin: 'Nārun ḥāmiyah',
        surahName: 'Al-Qari\'ah',
        surahAyah: '101:11',
        surahNumber: 101,
        ayahNumber: 11,
        audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/101011.mp3',
        explanation: 'Tanwin dhommah bertemu huruf Ha (ح), dibaca terang.'
      }
    ]
  },
  {
    id: 'idgham-bighunnah',
    category: 'nun-mati',
    categoryTitle: 'Hukum Nun Sukun & Tanwin',
    nameArabic: 'إِدْغَام بِغُنَّة',
    nameLatin: 'Idgham Bighunnah',
    meaning: 'Memasukkan bunyi disertai dengungan indah',
    letters: ['ي', 'ن', 'م', 'و'],
    mnemonic: 'Dirangkum dalam kata: يَنْمُو (Yanmu)',
    description: 'Terjadi apabila Nun Sukun (نْ) atau Tanwin bertemu salah satu dari 4 huruf Yanmu di kata yang terpisah.',
    readingMethod: 'Leburkan bunyi Nun/Tanwin ke dalam huruf berikutnya sambil ditahan dengung (ghunnah) sepanjang 2 harakat.',
    harakatCount: 'Dengung 2 Harakat',
    colorTheme: '#52796F',
    examples: [
      {
        phraseArabic: 'مَن يَقُولُ',
        phraseLatin: 'May-yaqūlu',
        surahName: 'Al-Baqarah',
        surahAyah: '2:8',
        surahNumber: 2,
        ayahNumber: 8,
        audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/002008.mp3',
        explanation: 'Nun sukun bertemu Ya (ي), melebur menjadi "may-yaqūl" disertai dengung.'
      },
      {
        phraseArabic: 'لَهَبٍ وَتَبَّ',
        phraseLatin: 'Lahabiw-wa tabb',
        surahName: 'Al-Lahab',
        surahAyah: '111:1',
        surahNumber: 111,
        ayahNumber: 1,
        audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/111001.mp3',
        explanation: 'Tanwin kasrah bertemu Wawu (و), melebur dengan dengung.'
      }
    ]
  },
  {
    id: 'idgham-bilaghunnah',
    category: 'nun-mati',
    categoryTitle: 'Hukum Nun Sukun & Tanwin',
    nameArabic: 'إِدْغَام بِلَا غُنَّة',
    nameLatin: 'Idgham Bilaghunnah',
    meaning: 'Memasukkan bunyi tanpa dengung',
    letters: ['ل', 'ر'],
    description: 'Terjadi apabila Nun Sukun (نْ) atau Tanwin bertemu dengan huruf Lam (ل) atau Ra (ر).',
    readingMethod: 'Masukkan bunyi Nun/Tanwin sepenuhnya ke dalam huruf Lam atau Ra secara rapat tanpa ada dengungan sama sekali.',
    harakatCount: '0 Dengung (Langsung Masuk)',
    colorTheme: '#84A98C',
    examples: [
      {
        phraseArabic: 'مِن رَّبِّهِمْ',
        phraseLatin: 'Mir-rabbihim',
        surahName: 'Al-Baqarah',
        surahAyah: '2:5',
        surahNumber: 2,
        ayahNumber: 5,
        audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/002005.mp3',
        explanation: 'Nun sukun bertemu Ra (ر), dibaca rapat "mir-rabbihim".'
      },
      {
        phraseArabic: 'هُدًى لِّلْمُتَّقِينَ',
        phraseLatin: 'Hudal-lil-muttaqīn',
        surahName: 'Al-Baqarah',
        surahAyah: '2:2',
        surahNumber: 2,
        ayahNumber: 2,
        audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/002002.mp3',
        explanation: 'Tanwin fathah bertemu Lam (ل), dibaca "hudal-lil".'
      }
    ]
  },
  {
    id: 'iqlab',
    category: 'nun-mati',
    categoryTitle: 'Hukum Nun Sukun & Tanwin',
    nameArabic: 'إِقْلَاب',
    nameLatin: 'Iqlab',
    meaning: 'Mengganti / membalik bunyi menjadi Mim halus',
    letters: ['ب'],
    description: 'Terjadi apabila Nun Sukun (نْ) atau Tanwin bertemu huruf Ba (ب). Di Mushaf Al-Qur\'an biasanya ditandai huruf Mim kecil (مـ) di atas huruf.',
    readingMethod: 'Ganti bunyi "N" menjadi bunyi "M" lembut di bibir disertai dengungan (ghunnah) 2 harakat.',
    harakatCount: 'Dengung 2 Harakat (Bibir Lembut)',
    colorTheme: '#C5A059',
    examples: [
      {
        phraseArabic: 'مِن بَعْدِ',
        phraseLatin: 'Mim-ba\'di',
        surahName: 'Al-Baqarah',
        surahAyah: '2:27',
        surahNumber: 2,
        ayahNumber: 27,
        audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/002027.mp3',
        explanation: 'Nun sukun bertemu Ba (ب), bunyinya beralih menjadi "mim-ba\'di".'
      },
      {
        phraseArabic: 'كَلَّا لَيُنبَذَنَّ',
        phraseLatin: 'Layumbażanna',
        surahName: 'Al-Humazah',
        surahAyah: '104:4',
        surahNumber: 104,
        ayahNumber: 4,
        audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/104004.mp3',
        explanation: 'Nun sukun bertemu Ba (ب), dibaca dengan huruf Mim tersembunyi.'
      }
    ]
  },
  {
    id: 'ikhfa-haqiqi',
    category: 'nun-mati',
    categoryTitle: 'Hukum Nun Sukun & Tanwin',
    nameArabic: 'إِخْفَاء حَقِيقِي',
    nameLatin: 'Ikhfa Haqiqi',
    meaning: 'Menyamarkan bunyi antara Izhar dan Idgham disertai dengung',
    letters: ['ت', 'ث', 'ج', 'د', 'ذ', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ف', 'ق', 'ك'],
    mnemonic: '15 huruf hijaiyah selain huruf Halqi, Idgham, dan Iqlab.',
    description: 'Terjadi apabila Nun Sukun (نْ) atau Tanwin bertemu salah satu dari 15 huruf Ikhfa. Bunyi "N" disamarkan mendekati makhraj huruf berikutnya.',
    readingMethod: 'Samarkan bunyi vokal sambil mendengungkan rongga hidung selama 2 harakat dengan posisi lidah siap melafalkan huruf setelahnya.',
    harakatCount: 'Samar & Dengung 2 Harakat',
    colorTheme: '#1D3557',
    examples: [
      {
        phraseArabic: 'مِن شَرِّ',
        phraseLatin: 'Min syarri',
        surahName: 'An-Naas & Al-Falaq',
        surahAyah: '114:4',
        surahNumber: 114,
        ayahNumber: 4,
        audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/114004.mp3',
        explanation: 'Nun sukun bertemu Syin (ش), dibaca samar mendengung "ming-syarri".'
      },
      {
        phraseArabic: 'أَنتُمْ',
        phraseLatin: 'Antum',
        surahName: 'Al-Kafirun',
        surahAyah: '109:3',
        surahNumber: 109,
        ayahNumber: 3,
        audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/109003.mp3',
        explanation: 'Nun sukun bertemu Ta (ت), dibaca samar menuju makhraj Ta.'
      }
    ]
  },

  // 3. QALQALAH
  {
    id: 'qalqalah',
    category: 'qalqalah',
    categoryTitle: 'Hukum Qalqalah (Pantulan)',
    nameArabic: 'قَلْقَلَة',
    nameLatin: 'Qalqalah (Sughra & Kubra)',
    meaning: 'Memantulkan suara getaran getar makhraj saat huruf sukun',
    letters: ['ب', 'ج', 'د', 'ط', 'ق'],
    mnemonic: 'Disingkat: بَجَدْ طَقْ (Baju Di Toko) / قُطْبُ جَدٍّ',
    description: 'Huruf qalqalah ada 5. Dibagi menjadi dua jenis utama:\n1. Qalqalah Sughra: Sukun asli di tengah kata (pantulan ringan).\n2. Qalqalah Kubra: Huruf qalqalah di akhir kata yang disukunkan karena berhenti/waqaf (pantulan kuat dan mantap).',
    readingMethod: 'Pantulkan suara tanpa mengubah harakat menjadi vokal "e", "a", atau "o". Pantulan mengalir alami dari makhraj aslinya.',
    harakatCount: 'Pantulan Menghentak',
    colorTheme: '#E9C46A',
    examples: [
      {
        phraseArabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝',
        phraseLatin: 'Qul huwallāhu aḥad (waqaf)',
        surahName: 'Al-Ikhlas',
        surahAyah: '112:1',
        surahNumber: 112,
        ayahNumber: 1,
        audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/112001.mp3',
        explanation: 'Huruf Dal (د) di akhir ayat dibaca waqaf -> Qalqalah Kubra (pantulan kuat).'
      },
      {
        phraseArabic: 'الْفَلَقِ ۝',
        phraseLatin: 'Al-falaq (waqaf)',
        surahName: 'Al-Falaq',
        surahAyah: '113:1',
        surahNumber: 113,
        ayahNumber: 1,
        audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/113001.mp3',
        explanation: 'Huruf Qaf (ق) di akhir ayat dibaca waqaf -> Qalqalah Kubra.'
      },
      {
        phraseArabic: 'يَجْعَلْ كَيْدَهُمْ',
        phraseLatin: 'Yaj\'al kaidahum',
        surahName: 'Al-Fil',
        surahAyah: '105:2',
        surahNumber: 105,
        ayahNumber: 2,
        audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/105002.mp3',
        explanation: 'Huruf Jim (ج) sukun di tengah kalimat -> Qalqalah Sughra (pantulan ringan).'
      }
    ]
  },

  // 4. GHUNNAH MUSYADDADAH
  {
    id: 'ghunnah-musyaddadah',
    category: 'ghunnah',
    categoryTitle: 'Hukum Ghunnah Musyaddadah',
    nameArabic: 'غُنَّة مُشَدَّدَة',
    nameLatin: 'Ghunnah Musyaddadah',
    meaning: 'Dengungan wajib pada huruf Nun atau Mim bertasydid',
    letters: ['نّ', 'مّ'],
    description: 'Setiap huruf Nun yang bertasydid (نّ) atau Mim yang bertasydid (مّ), baik di awal, tengah, maupun akhir kalimat.',
    readingMethod: 'Tahan suara dengungan yang bersumber dari rongga hidung (khoisyum) secara sempurna sepanjang 2 hingga 3 harakat.',
    harakatCount: '2 - 3 Harakat (Dengung Sempurna)',
    colorTheme: '#D97706',
    examples: [
      {
        phraseArabic: 'إِنَّا أَعْطَيْنَاكَ',
        phraseLatin: 'Innā a\'ṭaināk',
        surahName: 'Al-Kautsar',
        surahAyah: '108:1',
        surahNumber: 108,
        ayahNumber: 1,
        audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/108001.mp3',
        explanation: 'Huruf Nun bertasydid (نّ), ditahan dengung 2 harakat.'
      },
      {
        phraseArabic: 'عَمَّ يَتَسَاءَلُونَ',
        phraseLatin: '\'Amma yatasā\'alūn',
        surahName: 'An-Naba\'',
        surahAyah: '78:1',
        surahNumber: 78,
        ayahNumber: 1,
        audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/078001.mp3',
        explanation: 'Huruf Mim bertasydid (مّ), ditahan dengung 2 harakat penuh.'
      }
    ]
  },

  // 5. MIM SUKUN
  {
    id: 'mim-sukun',
    category: 'mim-mati',
    categoryTitle: 'Hukum Mim Sukun (مْ)',
    nameArabic: 'أَحْكَام المِيم السَّاكِنَة',
    nameLatin: 'Hukum Mim Sukun (Syafawi)',
    meaning: 'Hukum bacaan bibir (Syafawi) saat huruf Mim mati bertemu huruf hijaiyah',
    letters: ['ب', 'م', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'ن', 'و', 'هـ', 'ي'],
    mnemonic: '1. Ikhfa Syafawi: ب (dengung 2 harakat) | 2. Idgham Mimi: م (dengung 2 harakat) | 3. Izhar Syafawi: 26 huruf lainnya (jelas tanpa dengung)',
    description: 'Terbagi menjadi 3 hukum utama:\n1. Ikhfa Syafawi: Mim sukun bertemu huruf Ba (ب) -> dengung 2 harakat.\n2. Idgham Mimi / Mutamatsilain: Mim sukun bertemu huruf Mim (م) -> melebur dengung 2 harakat.\n3. Izhar Syafawi: Mim sukun bertemu seluruh huruf hijaiyah selain Ba dan Mim -> dibaca terang tanpa dengung.',
    readingMethod: 'Rapatkan kedua bibir secara lembut tanpa tekanan berlebihan, sesuaikan dengungan berdasarkan hukumnya.',
    harakatCount: 'Sesuai jenis (Dengung 2 Harakat / Jelas 1 Harakat)',
    colorTheme: '#0284C7',
    examples: [
      {
        phraseArabic: 'تَرْمِيهِم بِحِجَارَةٍ',
        phraseLatin: 'Tarmīhim bi-ḥijārah',
        surahName: 'Al-Fil',
        surahAyah: '105:4',
        surahNumber: 105,
        ayahNumber: 4,
        audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/105004.mp3',
        explanation: 'Mim sukun bertemu Ba (ب) -> Ikhfa Syafawi (bibir merapat lembut disertai dengung).'
      },
      {
        phraseArabic: 'أَلَمْ يَجْعَلْ',
        phraseLatin: 'Alam yaj\'al',
        surahName: 'Al-Fil',
        surahAyah: '105:2',
        surahNumber: 105,
        ayahNumber: 2,
        audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/105002.mp3',
        explanation: 'Mim sukun bertemu Ya (ي) -> Izhar Syafawi (dibaca jelas tanpa dengung).'
      }
    ]
  },

  // 6. MAD
  {
    id: 'mad-dasar',
    category: 'mad',
    categoryTitle: 'Hukum Mad (Panjang)',
    nameArabic: 'مَدّ طَبِيعِي / فَرْعِي',
    nameLatin: 'Mad Thabi\'i & Mad Cabang',
    meaning: 'Memanjangkan bacaan suara huruf vokal',
    letters: ['ا', 'و', 'ي'],
    mnemonic: 'Huruf Mad: Alif (ا) didahului fathah, Wawu sukun (و) didahului dhammah, Ya sukun (ي) didahului kasrah.',
    description: 'Mad Thabi\'i (Mad Asli): Memanjangkan bunyi huruf vokal sebanyak 2 harakat (1 ayunan).\nMad Wajib Muttashil: Huruf mad bertemu hamzah dalam 1 kata (panjang 4-5 harakat).\nMad Jaiz Munfashil: Huruf mad bertemu hamzah di kata terpisah (panjang 2, 4, atau 5 harakat).\nMad \'Aridh Lissukun: Huruf mad bertemu huruf hidup yang dibaca waqaf (panjang 2, 4, atau 6 harakat).',
    readingMethod: 'Ayunkan suara secara teratur dan stabil tanpa melebihi atau mengurangi kadar harakat yang ditentukan.',
    harakatCount: '2 hingga 6 Harakat',
    colorTheme: '#7C3AED',
    examples: [
      {
        phraseArabic: 'مَالِكِ يَوْمِ الدِّينِ',
        phraseLatin: 'Māliki yawmid-dīn',
        surahName: 'Al-Fatihah',
        surahAyah: '1:4',
        surahNumber: 1,
        ayahNumber: 4,
        audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/001004.mp3',
        explanation: 'Huruf Mim berfathah berdiri (Mad Thabi\'i 2 harakat); huruf Ya sukun di kata "ad-dīn" saat waqaf menjadi Mad \'Aridh Lissukun (bisa 2, 4, atau 6 harakat).'
      },
      {
        phraseArabic: 'إِذَا جَاءَ نَصْرُ اللَّهِ',
        phraseLatin: 'Iżā jā\'a naṣrullāh',
        surahName: 'An-Nasr',
        surahAyah: '110:1',
        surahNumber: 110,
        ayahNumber: 1,
        audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/110001.mp3',
        explanation: '"Jā\'a": Mad Wajib Muttashil (mad bertemu hamzah dalam satu kata, dibaca panjang 4-5 harakat).'
      }
    ]
  }
];
