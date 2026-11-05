import { Surah, GardenPlant } from '../types/quran';

/**
 * Rich offline dataset for Juz 30 and Al-Fatihah with word-by-word breakdowns,
 * authentic harakat, translations, transliterations, grammatical tags, and audio links.
 */
export const SURAHS_DATA: Surah[] = [
  {
    number: 1,
    nameArabic: 'الفَاتِحَة',
    nameLatin: 'Al-Fatihah',
    translationLatin: 'Pembukaan',
    numberOfAyahs: 7,
    revelationType: 'Makkiyah',
    bismillahPre: false,
    themeColor: '#52796F',
    ayahs: [
      {
        id: '1:1',
        surahNumber: 1,
        ayahNumber: 1,
        globalAyahNumber: 1,
        arabicText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        transliteration: 'Bismillāhir-raḥmānir-raḥīm',
        translationId: 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3',
        tadabbur: {
          title: 'Memulai dengan Keberkahan',
          hikmah: 'Segala aktivitas terbaik orang beriman selalu diawali dengan menyebut asma Allah agar bernilai ibadah dan diliputi rahmat.',
          amal: 'Ucapkan Basmalah setiap kali hendak memulai makan, belajar, dan bekerja hari ini.'
        },
        words: [
          { id: '1:1:1', arabic: 'بِسْمِ', transliteration: 'Bismi', translation: 'Dengan nama', rootWord: 'س-م-و', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Gabungan huruf jar "bi" (dengan) dan "ism" (nama).' },
          { id: '1:1:2', arabic: 'اللَّهِ', transliteration: 'Allāh', translation: 'Allah', rootWord: 'أ-ل-ه', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Lafdzul Jalalah, nama Dzat Yang Maha Suci.' },
          { id: '1:1:3', arabic: 'الرَّحْمَٰنِ', transliteration: 'Ar-Raḥmān', translation: 'Yang Maha Pengasih', rootWord: 'ر-ح-م', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Kasih sayang Allah yang luas mencakup seluruh makhluk di alam semesta.' },
          { id: '1:1:4', arabic: 'الرَّحِيمِ', transliteration: 'Ar-Raḥīm', translation: 'Maha Penyayang', rootWord: 'ر-ح-م', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Rahmat khusus yang Allah berikan kepada hamba-Nya yang beriman.' }
        ]
      },
      {
        id: '1:2',
        surahNumber: 1,
        ayahNumber: 2,
        globalAyahNumber: 2,
        arabicText: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        transliteration: 'Al-ḥamdu lillāhi rabbil-\'ālamīn',
        translationId: 'Segala puji bagi Allah, Tuhan seluruh alam.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/2.mp3',
        tadabbur: {
          title: 'Hati yang Senantiasa Bersyukur',
          hikmah: 'Pujian sejati hanyalah milik Sang Pencipta yang memelihara setiap detik napas kita.',
          amal: 'Rasakan nikmat terkecil hari ini dan ucapkan Alhamdulillah dengan penuh ketulusan.'
        },
        words: [
          { id: '1:2:1', arabic: 'الْحَمْدُ', transliteration: 'Al-ḥamdu', translation: 'Segala puji', rootWord: 'ح-م-د', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Pujian sempurna yang disertai rasa cinta dan pengagungan.' },
          { id: '1:2:2', arabic: 'لِلَّهِ', transliteration: 'Lillāh', translation: 'Bagi Allah', rootWord: 'أ-ل-ه', grammarType: 'Harf (Kata Sambung/Huruf)', explanation: 'Huruf jar "li" (kepunyaan/untuk) bersambung dengan lafaz Allah.' },
          { id: '1:2:3', arabic: 'رَبِّ', transliteration: 'Rabbi', translation: 'Tuhan / Pemelihara', rootWord: 'ر-ب-ب', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Maha Pencipta, Pemilik, Pengatur, dan Pendidik segenap alam.' },
          { id: '1:2:4', arabic: 'الْعَالَمِينَ', transliteration: 'Al-\'ālamīn', translation: 'Semesta alam', rootWord: 'ع-ل-م', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Bentuk jamak dari \'alam, mencakup alam manusia, jin, malaikat, dan semesta.' }
        ]
      },
      {
        id: '1:3',
        surahNumber: 1,
        ayahNumber: 3,
        globalAyahNumber: 3,
        arabicText: 'الرَّحْمَٰنِ الرَّحِيمِ',
        transliteration: 'Ar-Raḥmānir-Raḥīm',
        translationId: 'Yang Maha Pengasih, Maha Penyayang.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/3.mp3',
        tadabbur: {
          title: 'Samudra Kasih Sayang',
          hikmah: 'Allah mengulang sifat kasih sayang-Nya agar kita tidak pernah berputus asa dari rahmat-Nya.',
          amal: 'Bersikaplah lembut kepada keluarga dan orang sekitar hari ini.'
        },
        words: [
          { id: '1:3:1', arabic: 'الرَّحْمَٰنِ', transliteration: 'Ar-Raḥmān', translation: 'Yang Maha Pengasih', rootWord: 'ر-ح-م', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Maha Pemurah yang memberi rezeki pada semua makhluk.' },
          { id: '1:3:2', arabic: 'الرَّحِيمِ', transliteration: 'Ar-Raḥīm', translation: 'Maha Penyayang', rootWord: 'ر-ح-م', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Kasih sayang abadi untuk kehidupan akhirat.' }
        ]
      },
      {
        id: '1:4',
        surahNumber: 1,
        ayahNumber: 4,
        globalAyahNumber: 4,
        arabicText: 'مَالِكِ يَوْمِ الدِّينِ',
        transliteration: 'Māliki yawmid-dīn',
        translationId: 'Pemilik hari pembalasan.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/4.mp3',
        tadabbur: {
          title: 'Pengingat Masa Depan Hakiki',
          hikmah: 'Hari di mana semua topeng dunia gugur, dan keadilan mutlak Allah berdiri tegak.',
          amal: 'Niatkan setiap perbuatan baik semata-mata untuk bekal di yaumul akhir.'
        },
        words: [
          { id: '1:4:1', arabic: 'مَالِكِ', transliteration: 'Māliki', translation: 'Pemilik / Raja', rootWord: 'م-ل-ك', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Penguasa mutlak yang tiada tandingan di hari itu.' },
          { id: '1:4:2', arabic: 'يَوْمِ', transliteration: 'Yawmi', translation: 'Hari', rootWord: 'ي-و-م', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Waktu atau zaman terjadinya pembalasan amal.' },
          { id: '1:4:3', arabic: 'الدِّينِ', transliteration: 'Ad-dīn', translation: 'Pembalasan', rootWord: 'د-ي-ن', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Hari perhitungan dan balasan yang sempurna atas setiap amal.' }
        ]
      },
      {
        id: '1:5',
        surahNumber: 1,
        ayahNumber: 5,
        globalAyahNumber: 5,
        arabicText: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
        transliteration: 'Iyyāka na\'budu wa iyyāka nasta\'īn',
        translationId: 'Hanya kepada Engkaulah kami menyembah dan hanya kepada Engkaulah kami memohon pertolongan.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/5.mp3',
        tadabbur: {
          title: 'Ikrarnya Jiwa yang Bertauhid',
          hikmah: 'Pemberitahuan bahwa manusia lemah tanpa pertolongan Allah. Kita menyembah-Nya dengan tulus dan bersandar pada-Nya.',
          amal: 'Ketika menghadapi kesulitan hari ini, langsung bersimpuh dan memohon bantuan-Nya.'
        },
        words: [
          { id: '1:5:1', arabic: 'إِيَّاكَ', transliteration: 'Iyyāka', translation: 'Hanya kepada-Mu', rootWord: 'إ-ي-ا', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Dhamir munfashil bermakna pengkhususan (takhshish).' },
          { id: '1:5:2', arabic: 'نَعْبُدُ', transliteration: 'Na\'budu', translation: 'Kami beribadah', rootWord: 'ع-ب-د', grammarType: 'Fi\'il (Kata Kerja)', explanation: 'Fi\'il mudhari\' (kata kerja masa kini/akan datang): kami beribadah & tunduk.' },
          { id: '1:5:3', arabic: 'وَإِيَّاكَ', transliteration: 'Wa iyyāka', translation: 'Dan hanya kepada-Mu', rootWord: 'إ-ي-ا', grammarType: 'Harf (Kata Sambung/Huruf)', explanation: 'Huruf athaf "wa" ditambah pengkhususan.' },
          { id: '1:5:4', arabic: 'نَسْتَعِينُ', transliteration: 'Nasta\'īn', translation: 'Kami mohon pertolongan', rootWord: 'ع-و-ن', grammarType: 'Fi\'il (Kata Kerja)', explanation: 'Fi\'il mudhari\' dari wazan istif\'al: memohon pertolongan tiada henti.' }
        ]
      },
      {
        id: '1:6',
        surahNumber: 1,
        ayahNumber: 6,
        globalAyahNumber: 6,
        arabicText: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
        transliteration: 'Ihdinaṣ-ṣirāṭal-mustaqīm',
        translationId: 'Tunjukilah kami jalan yang lurus,',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6.mp3',
        tadabbur: {
          title: 'Doa Terpenting Sepanjang Hidup',
          hikmah: 'Hidayah adalah harta termahal, memohon agar istiqomah di jalan kebenaran hingga akhir hayat.',
          amal: 'Doakan kebaikan dan petunjuk bagi keluarga dan sahabat tercinta.'
        },
        words: [
          { id: '1:6:1', arabic: 'اهْدِنَا', transliteration: 'Ihdinā', translation: 'Tunjukilah kami', rootWord: 'ه-د-ي', grammarType: 'Fi\'il (Kata Kerja)', explanation: 'Fi\'il amr (kata permohonan doa): bimbing dan teguhkanlah kami.' },
          { id: '1:6:2', arabic: 'الصِّرَاطَ', transliteration: 'Aṣ-ṣirāṭa', translation: 'Jalan', rootWord: 'ص-ر-ط', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Jalan yang luas, terang, dan lurus tanpa kelokan.' },
          { id: '1:6:3', arabic: 'الْمُسْتَقِيمَ', transliteration: 'Al-mustaqīm', translation: 'Yang lurus', rootWord: 'ق-و-م', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Sifat jalan yang benar, tidak menyimpang ke kiri atau kanan.' }
        ]
      },
      {
        id: '1:7',
        surahNumber: 1,
        ayahNumber: 7,
        globalAyahNumber: 7,
        arabicText: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
        transliteration: 'Ṣirāṭallażīna an\'amta \'alaihim gairil-magḍūbi \'alaihim wa laḍ-ḍāllīn',
        translationId: '(yaitu) jalan orang-orang yang telah Engkau beri nikmat kepadanya; bukan (jalan) mereka yang dimurkai, dan bukan (pula jalan) mereka yang sesat.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/7.mp3',
        tadabbur: {
          title: 'Meneladani Orang-Orang Shalih',
          hikmah: 'Jalan para Nabi, shiddiqin, syuhada, dan shalihin adalah jalan keselamatan yang penuh ketenangan hati.',
          amal: 'Buka kisah para sahabat Nabi untuk memetik teladan akhlak mulia mereka.'
        },
        words: [
          { id: '1:7:1', arabic: 'صِرَاطَ', transliteration: 'Ṣirāṭa', translation: 'Jalan', rootWord: 'ص-ر-ط', grammarType: 'Isim (Kata Benda/Nama)' },
          { id: '1:7:2', arabic: 'الَّذِينَ', transliteration: 'Allażīna', translation: 'Orang-orang yang', rootWord: 'ل-ذ-ي', grammarType: 'Isim (Kata Benda/Nama)' },
          { id: '1:7:3', arabic: 'أَنْعَمْتَ', transliteration: 'An\'amta', translation: 'Telah Engkau beri nikmat', rootWord: 'ن-ع-م', grammarType: 'Fi\'il (Kata Kerja)' },
          { id: '1:7:4', arabic: 'عَلَيْهِمْ', transliteration: '\'Alaihim', translation: 'Atas mereka', rootWord: 'ع-ل-ي', grammarType: 'Harf (Kata Sambung/Huruf)' },
          { id: '1:7:5', arabic: 'غَيْرِ', transliteration: 'Gairi', translation: 'Bukan', rootWord: 'غ-ي-ر', grammarType: 'Isim (Kata Benda/Nama)' },
          { id: '1:7:6', arabic: 'الْمَغْضُوبِ', transliteration: 'Al-magḍūbi', translation: 'Mereka yang dimurkai', rootWord: 'غ-ض-ب', grammarType: 'Isim (Kata Benda/Nama)' },
          { id: '1:7:7', arabic: 'عَلَيْهِمْ', transliteration: '\'Alaihim', translation: 'Atas mereka', rootWord: 'ع-ل-ي', grammarType: 'Harf (Kata Sambung/Huruf)' },
          { id: '1:7:8', arabic: 'وَلَا', transliteration: 'Wa lā', translation: 'Dan bukan pula', rootWord: 'ل-ا', grammarType: 'Harf (Kata Sambung/Huruf)' },
          { id: '1:7:9', arabic: 'الضَّالِّينَ', transliteration: 'Aḍ-ḍāllīn', translation: 'Mereka yang tersesat', rootWord: 'ض-ل-ل', grammarType: 'Isim (Kata Benda/Nama)' }
        ]
      }
    ]
  },
  {
    number: 114,
    nameArabic: 'النَّاس',
    nameLatin: 'An-Naas',
    translationLatin: 'Manusia',
    numberOfAyahs: 6,
    revelationType: 'Makkiyah',
    bismillahPre: true,
    themeColor: '#84A98C',
    ayahs: [
      {
        id: '114:1',
        surahNumber: 114,
        ayahNumber: 1,
        globalAyahNumber: 6231,
        arabicText: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
        transliteration: 'Qul a\'ūżu birabbin-nās',
        translationId: 'Katakanlah, "Aku berlindung kepada Tuhannya manusia,',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6231.mp3',
        tadabbur: {
          title: 'Benteng Perlindungan Utama',
          hikmah: 'Allah adalah satu-satunya pelindung sejati dari segala rasa cemas, was-was, dan ketakutan manusia.',
          amal: 'Baca doa perlindungan ini saat hendak tidur dan terbangun di pagi hari.'
        },
        words: [
          { id: '114:1:1', arabic: 'قُلْ', transliteration: 'Qul', translation: 'Katakanlah', rootWord: 'ق-و-ل', grammarType: 'Fi\'il (Kata Kerja)', explanation: 'Fi\'il amr (perintah Allah kepada Nabi dan umatnya).' },
          { id: '114:1:2', arabic: 'أَعُوذُ', transliteration: 'A\'ūżu', translation: 'Aku berlindung', rootWord: 'ع-و-ذ', grammarType: 'Fi\'il (Kata Kerja)', explanation: 'Fi\'il mudhari\': Aku bersandar dan meminta perlindungan penuh.' },
          { id: '114:1:3', arabic: 'بِرَبِّ', transliteration: 'Bi-rabbi', translation: 'Kepada Pemelihara / Tuhan', rootWord: 'ر-ب-ب', grammarType: 'Harf (Kata Sambung/Huruf)', explanation: 'Huruf jar "bi" digabung dengan Rabb (Tuhan Pencipta).' },
          { id: '114:1:4', arabic: 'النَّاسِ', transliteration: 'An-nās', translation: 'Manusia', rootWord: 'ن-و-س', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Seluruh umat manusia tanpa membedakan suku dan bangsa.' }
        ]
      },
      {
        id: '114:2',
        surahNumber: 114,
        ayahNumber: 2,
        globalAyahNumber: 6232,
        arabicText: 'مَلِكِ النَّاسِ',
        transliteration: 'Malikin-nās',
        translationId: 'Raja manusia,',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6232.mp3',
        tadabbur: {
          title: 'Raja yang Sebenarnya',
          hikmah: 'Kekuasaan manusia bersifat fana. Hanya Allah yang kerajaannya kekal abadi.',
          amal: 'Hilangkan rasa minder di hadapan orang kaya atau berkuasa, karena hanya Allah Raja Tertinggi.'
        },
        words: [
          { id: '114:2:1', arabic: 'مَلِكِ', transliteration: 'Maliki', translation: 'Raja', rootWord: 'م-ل-ك', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Penguasa dan pemilik kedaulatan mutlak.' },
          { id: '114:2:2', arabic: 'النَّاسِ', transliteration: 'An-nās', translation: 'Manusia', rootWord: 'ن-و-س', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Seluruh umat manusia.' }
        ]
      },
      {
        id: '114:3',
        surahNumber: 114,
        ayahNumber: 3,
        globalAyahNumber: 6233,
        arabicText: 'إِلَٰهِ النَّاسِ',
        transliteration: 'Ilāhin-nās',
        translationId: 'Sembahan manusia,',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6233.mp3',
        tadabbur: {
          title: 'Fokus Ibadah Kita',
          hikmah: 'Hati manusia diciptakan untuk menyembah Sang Khaliq. Menyembah selain-Nya hanya membawa kehampaan.',
          amal: 'Jaga keikhlasan niat agar ibadah tidak ternodai riya.'
        },
        words: [
          { id: '114:3:1', arabic: 'إِلَٰهِ', transliteration: 'Ilāhi', translation: 'Sesembahan', rootWord: 'أ-ل-ه', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Dzat yang berhak diibadahi dengan cinta dan ketaatan.' },
          { id: '114:3:2', arabic: 'النَّاسِ', transliteration: 'An-nās', translation: 'Manusia', rootWord: 'ن-و-س', grammarType: 'Isim (Kata Benda/Nama)' }
        ]
      },
      {
        id: '114:4',
        surahNumber: 114,
        ayahNumber: 4,
        globalAyahNumber: 6234,
        arabicText: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ',
        transliteration: 'Min syarril-waswāsil-khannās',
        translationId: 'Dari kejahatan (bisikan) setan yang bersembunyi,',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6234.mp3',
        tadabbur: {
          title: 'Waspada Bisikan Halus',
          hikmah: 'Setan membisikkan keraguan saat manusia lalai dan mundur saat manusia berdzikir.',
          amal: 'Segera ucapkan ta\'awwudz saat terlintas prasangka buruk atau bisikan malas beribadah.'
        },
        words: [
          { id: '114:4:1', arabic: 'مِن', transliteration: 'Min', translation: 'Dari', rootWord: 'م-ن', grammarType: 'Harf (Kata Sambung/Huruf)', explanation: 'Huruf jar menunjukkan asal permulaan.' },
          { id: '114:4:2', arabic: 'شَرِّ', transliteration: 'Syarri', translation: 'Kejahatan / Bahaya', rootWord: 'ش-ر-ر', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Segala hal yang merugikan lahir dan batin.' },
          { id: '114:4:3', arabic: 'الْوَسْوَاسِ', transliteration: 'Al-waswāsi', translation: 'Pembisik was-was', rootWord: 'و-س-و-س', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Suara lembut penggoda keburukan.' },
          { id: '114:4:4', arabic: 'الْخَنَّاسِ', transliteration: 'Al-khannās', translation: 'Yang bersembunyi / lari', rootWord: 'خ-ن-س', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Mundur dan bersembunyi ketika disebut nama Allah.' }
        ]
      },
      {
        id: '114:5',
        surahNumber: 114,
        ayahNumber: 5,
        globalAyahNumber: 6235,
        arabicText: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ',
        transliteration: 'Allażī yuwaswisu fī ṣudūrin-nās',
        translationId: 'yang membisikkan (kejahatan) ke dalam dada manusia,',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6235.mp3',
        tadabbur: {
          title: 'Menjaga Kebersihan Dada',
          hikmah: 'Hati adalah medan pertempuran cahaya dan kegelapan. Isi dada dengan lantunan Al-Qur\'an.',
          amal: 'Tenangkan diri dengan istighfar tiga kali saat merasa gelisah.'
        },
        words: [
          { id: '114:5:1', arabic: 'الَّذِي', transliteration: 'Allażī', translation: 'Yang', rootWord: 'ل-ذ-ي', grammarType: 'Isim (Kata Benda/Nama)' },
          { id: '114:5:2', arabic: 'يُوَسْوِسُ', transliteration: 'Yuwaswisu', translation: 'Membisikkan was-was', rootWord: 'و-س-و-س', grammarType: 'Fi\'il (Kata Kerja)' },
          { id: '114:5:3', arabic: 'فِي', transliteration: 'Fī', translation: 'Di dalam', rootWord: 'ف-ي', grammarType: 'Harf (Kata Sambung/Huruf)' },
          { id: '114:5:4', arabic: 'صُدُورِ', transliteration: 'Ṣudūri', translation: 'Dada-dada', rootWord: 'ص-د-ر', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Bentuk jamak dari shadr (dada/tempat bertakhtanya hati).' },
          { id: '114:5:5', arabic: 'النَّاسِ', transliteration: 'An-nās', translation: 'Manusia', rootWord: 'ن-و-س', grammarType: 'Isim (Kata Benda/Nama)' }
        ]
      },
      {
        id: '114:6',
        surahNumber: 114,
        ayahNumber: 6,
        globalAyahNumber: 6236,
        arabicText: 'مِنَ الْجِنَّةِ وَالنَّاسِ',
        transliteration: 'Minal-jinnati wan-nās',
        translationId: 'dari (golongan) jin dan manusia.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6236.mp3',
        tadabbur: {
          title: 'Memilih Lingkungan Sahabat',
          hikmah: 'Penggoda bukan hanya makhluk tak kasat mata, melainkan teman yang mengajak pada keburukan.',
          amal: 'Pilihlah teman yang mengingatkanmu untuk shalat dan berbuat kebaikan.'
        },
        words: [
          { id: '114:6:1', arabic: 'مِنَ', transliteration: 'Mina', translation: 'Dari golongan', rootWord: 'م-ن', grammarType: 'Harf (Kata Sambung/Huruf)' },
          { id: '114:6:2', arabic: 'الْجِنَّةِ', transliteration: 'Al-jinnati', translation: 'Jin', rootWord: 'ج-ن-ن', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Makhluk gaib yang tersembunyi dari pandangan.' },
          { id: '114:6:3', arabic: 'وَالنَّاسِ', transliteration: 'Wan-nās', translation: 'Dan manusia', rootWord: 'ن-و-س', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Manusia yang tabiatnya mengajak kemaksiatan.' }
        ]
      }
    ]
  },
  {
    number: 113,
    nameArabic: 'الفَلَق',
    nameLatin: 'Al-Falaq',
    translationLatin: 'Waktu Subuh',
    numberOfAyahs: 5,
    revelationType: 'Makkiyah',
    bismillahPre: true,
    themeColor: '#354F52',
    ayahs: [
      {
        id: '113:1',
        surahNumber: 113,
        ayahNumber: 1,
        globalAyahNumber: 6226,
        arabicText: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',
        transliteration: 'Qul a\'ūżu birabbil-falaq',
        translationId: 'Katakanlah, "Aku berlindung kepada Tuhan yang menguasai subuh (fajar),',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6226.mp3',
        tadabbur: {
          title: 'Fajar yang Membelah Gelap',
          hikmah: 'Sebagaimana Allah membelah gulita malam dengan cahaya fajar, Dia mampu mengangkat segala kesempitan hidup kita.',
          amal: 'Bangun lebih awal sebelum fajar untuk menikmati keheningan dan shalat tahajjud.'
        },
        words: [
          { id: '113:1:1', arabic: 'قُلْ', transliteration: 'Qul', translation: 'Katakanlah', rootWord: 'ق-و-ل', grammarType: 'Fi\'il (Kata Kerja)' },
          { id: '113:1:2', arabic: 'أَعُوذُ', transliteration: 'A\'ūżu', translation: 'Aku berlindung', rootWord: 'ع-و-ذ', grammarType: 'Fi\'il (Kata Kerja)' },
          { id: '113:1:3', arabic: 'بِرَبِّ', transliteration: 'Bi-rabbi', translation: 'Kepada Pemelihara / Tuhan', rootWord: 'ر-ب-ب', grammarType: 'Harf (Kata Sambung/Huruf)' },
          { id: '113:1:4', arabic: 'الْفَلَقِ', transliteration: 'Al-falaq', translation: 'Waktu Subuh / Fajar', rootWord: 'ف-ل-ق', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Cahaya pagi yang membelah kegelapan malam.' }
        ]
      },
      {
        id: '113:2',
        surahNumber: 113,
        ayahNumber: 2,
        globalAyahNumber: 6227,
        arabicText: 'مِن شَرِّ مَا خَلَقَ',
        transliteration: 'Min syarri mā khalaq',
        translationId: 'dari kejahatan (makhluk yang) Dia ciptakan,',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6227.mp3',
        tadabbur: {
          title: 'Perlindungan Menyeluruh',
          hikmah: 'Kita memohon perlindungan dari bahaya binatang berbisa, manusia berniat jahat, dan musibah alam.',
          amal: 'Senantiasa membaca doa perlindungan saat keluar rumah.'
        },
        words: [
          { id: '113:2:1', arabic: 'مِن', transliteration: 'Min', translation: 'Dari', rootWord: 'م-ن', grammarType: 'Harf (Kata Sambung/Huruf)' },
          { id: '113:2:2', arabic: 'شَرِّ', transliteration: 'Syarri', translation: 'Kejahatan / Bahaya', rootWord: 'ش-ر-ر', grammarType: 'Isim (Kata Benda/Nama)' },
          { id: '113:2:3', arabic: 'مَا', transliteration: 'Mā', translation: 'Apa yang', rootWord: 'م-ا', grammarType: 'Isim (Kata Benda/Nama)' },
          { id: '113:2:4', arabic: 'خَلَقَ', transliteration: 'Khalaqa', translation: 'Dia ciptakan', rootWord: 'خ-ل-ق', grammarType: 'Fi\'il (Kata Kerja)', explanation: 'Fi\'il madhi (telah menciptakan segenap makhluk).' }
        ]
      },
      {
        id: '113:3',
        surahNumber: 113,
        ayahNumber: 3,
        globalAyahNumber: 6228,
        arabicText: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ',
        transliteration: 'Wa min syarri gāsiqin iżā waqab',
        translationId: 'dan dari kejahatan malam apabila telah gelap gulita,',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6228.mp3',
        tadabbur: {
          title: 'Ketenangan di Keheningan Malam',
          hikmah: 'Malam adalah saat makhluk-makhluk berbahaya bertebaran. Jadikan zikir sebagai perisai penenang tidur.',
          amal: 'Tutup pintu, padamkan lampu, dan baca ayat kursi sebelum beristirahat.'
        },
        words: [
          { id: '113:3:1', arabic: 'وَمِن', transliteration: 'Wa min', translation: 'Dan dari', rootWord: 'م-ن', grammarType: 'Harf (Kata Sambung/Huruf)' },
          { id: '113:3:2', arabic: 'شَرِّ', transliteration: 'Syarri', translation: 'Kejahatan', rootWord: 'ش-ر-ر', grammarType: 'Isim (Kata Benda/Nama)' },
          { id: '113:3:3', arabic: 'غَاسِقٍ', transliteration: 'Gāsiqin', translation: 'Malam gelap', rootWord: 'غ-س-ق', grammarType: 'Isim (Kata Benda/Nama)' },
          { id: '113:3:4', arabic: 'إِذَا', transliteration: 'Iżā', translation: 'Apabila', rootWord: 'إ-ذ-ا', grammarType: 'Harf (Kata Sambung/Huruf)' },
          { id: '113:3:5', arabic: 'وَقَبَ', transliteration: 'Waqaba', translation: 'Telah gelap gulita / masuk', rootWord: 'و-ق-ب', grammarType: 'Fi\'il (Kata Kerja)' }
        ]
      },
      {
        id: '113:4',
        surahNumber: 113,
        ayahNumber: 4,
        globalAyahNumber: 6229,
        arabicText: 'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ',
        transliteration: 'Wa min syarrin-naffāṡāti fīl-\'uqad',
        translationId: 'dan dari kejahatan (wanita-wanita) penyihir yang meniup pada buhul-buhul (talinya),',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6229.mp3',
        tadabbur: {
          title: 'Kemenangan Tauhid Atas Sihir',
          hikmah: 'Kekuatan sihir dan tipu daya dukun hancur luluh dengan membaca Mu\'awwidzatain (Al-Falaq & An-Naas).',
          amal: 'Teguhkan tauhid, jangan pernah percaya ramalan bintang atau jimat-jimat.'
        },
        words: [
          { id: '113:4:1', arabic: 'وَمِن', transliteration: 'Wa min', translation: 'Dan dari', rootWord: 'م-ن', grammarType: 'Harf (Kata Sambung/Huruf)' },
          { id: '113:4:2', arabic: 'شَرِّ', transliteration: 'Syarri', translation: 'Kejahatan', rootWord: 'ش-ر-ر', grammarType: 'Isim (Kata Benda/Nama)' },
          { id: '113:4:3', arabic: 'النَّفَّاثَاتِ', transliteration: 'An-naffāṡāti', translation: 'Peniup-peniup', rootWord: 'ن-ف-ث', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Tukang sihir yang meniup buhul mantra.' },
          { id: '113:4:4', arabic: 'فِي', transliteration: 'Fī', translation: 'Pada', rootWord: 'ف-ي', grammarType: 'Harf (Kata Sambung/Huruf)' },
          { id: '113:4:5', arabic: 'الْعُقَدِ', transliteration: 'Al-\'uqad', translation: 'Buhul-buhul / simpul tali', rootWord: 'ع-ق-د', grammarType: 'Isim (Kata Benda/Nama)' }
        ]
      },
      {
        id: '113:5',
        surahNumber: 113,
        ayahNumber: 5,
        globalAyahNumber: 6230,
        arabicText: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
        transliteration: 'Wa min syarri ḥāsidin iżā ḥasad',
        translationId: 'dan dari kejahatan orang yang dengki apabila dia dengki.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6230.mp3',
        tadabbur: {
          title: 'Pembersih Racun Hasad',
          hikmah: 'Hasad (dengki) adalah api yang membakar pahala. Lindungi diri dari mata jahat (\'ain) dengan rasa syukur dan doa.',
          amal: 'Ucapkan "Barakallahu laka" saat melihat nikmat dan kelebihan orang lain.'
        },
        words: [
          { id: '113:5:1', arabic: 'وَمِن', transliteration: 'Wa min', translation: 'Dan dari', rootWord: 'م-ن', grammarType: 'Harf (Kata Sambung/Huruf)' },
          { id: '113:5:2', arabic: 'شَرِّ', transliteration: 'Syarri', translation: 'Kejahatan', rootWord: 'ش-ر-ر', grammarType: 'Isim (Kata Benda/Nama)' },
          { id: '113:5:3', arabic: 'حَاسِدٍ', transliteration: 'Ḥāsidin', translation: 'Orang yang dengki', rootWord: 'ح-س-د', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Orang yang mengharapkan hilangnya nikmat dari sesamanya.' },
          { id: '113:5:4', arabic: 'إِذَا', transliteration: 'Iżā', translation: 'Apabila', rootWord: 'إ-ذ-ا', grammarType: 'Harf (Kata Sambung/Huruf)' },
          { id: '113:5:5', arabic: 'حَسَدَ', transliteration: 'Ḥasada', translation: 'Dia dengki / beraksi', rootWord: 'ح-س-د', grammarType: 'Fi\'il (Kata Kerja)' }
        ]
      }
    ]
  },
  {
    number: 112,
    nameArabic: 'الإِخْلَاص',
    nameLatin: 'Al-Ikhlas',
    translationLatin: 'Ikhlas / Kemurnian Keesaan Allah',
    numberOfAyahs: 4,
    revelationType: 'Makkiyah',
    bismillahPre: true,
    themeColor: '#C5A059',
    ayahs: [
      {
        id: '112:1',
        surahNumber: 112,
        ayahNumber: 1,
        globalAyahNumber: 6222,
        arabicText: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
        transliteration: 'Qul huwallāhu aḥad',
        translationId: 'Katakanlah (Muhammad), "Dialah Allah, Yang Maha Esa.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6222.mp3',
        tadabbur: {
          title: 'Pilar Utama Keimanan',
          hikmah: 'Allah itu Tunggal tanpa sekutu. Membaca surah ini bernilai sepertiga Al-Qur\'an karena merangkum inti ajaran tauhid.',
          amal: 'Bulan ini kuatkan niat salat dan sedekah murni karena Allah, bukan pujian manusia.'
        },
        words: [
          { id: '112:1:1', arabic: 'قُلْ', transliteration: 'Qul', translation: 'Katakanlah', rootWord: 'ق-و-ل', grammarType: 'Fi\'il (Kata Kerja)' },
          { id: '112:1:2', arabic: 'هُوَ', transliteration: 'Huwa', translation: 'Dia', rootWord: 'ه-و', grammarType: 'Isim (Kata Benda/Nama)' },
          { id: '112:1:3', arabic: 'اللَّهُ', transliteration: 'Allāh', translation: 'Allah', rootWord: 'أ-ل-ه', grammarType: 'Isim (Kata Benda/Nama)' },
          { id: '112:1:4', arabic: 'أَحَدٌ', transliteration: 'Aḥad', translation: 'Maha Esa / Tunggal', rootWord: 'و-ح-د', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Tunggal Dzat-Nya, Sifat-Nya, dan Perbuatan-Nya tiada tara.' }
        ]
      },
      {
        id: '112:2',
        surahNumber: 112,
        ayahNumber: 2,
        globalAyahNumber: 6223,
        arabicText: 'اللَّهُ الصَّمَدُ',
        transliteration: 'Allāhuṣ-ṣamad',
        translationId: 'Allah tempat meminta segala sesuatu.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6223.mp3',
        tadabbur: {
          title: 'Muara Segala Kebutuhan',
          hikmah: 'Ash-Shamad berarti seluruh makhluk bergantung kepada-Nya, sedangkan Dia Maha Kaya dan tidak butuh pada siapa pun.',
          amal: 'Curahkan keluh kesahmu terlebih dahulu kepada Allah dalam sujud sebelum menceritakan ke media sosial.'
        },
        words: [
          { id: '112:2:1', arabic: 'اللَّهُ', transliteration: 'Allāh', translation: 'Allah', rootWord: 'أ-ل-ه', grammarType: 'Isim (Kata Benda/Nama)' },
          { id: '112:2:2', arabic: 'الصَّمَدُ', transliteration: 'Aṣ-ṣamad', translation: 'Tempat bergantung segala makhluk', rootWord: 'ص-م-د', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Tumpuan harapan seluruh semesta.' }
        ]
      },
      {
        id: '112:3',
        surahNumber: 112,
        ayahNumber: 3,
        globalAyahNumber: 6224,
        arabicText: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
        transliteration: 'Lam yalid wa lam yūlad',
        translationId: '(Allah) tidak beranak dan tidak pula diperanakkan,',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6224.mp3',
        tadabbur: {
          title: 'Kesucian dari Sifat Kekurangan',
          hikmah: 'Maha Suci Allah dari anggapan memiliki anak atau orang tua; Dia Maha Awal tanpa permulaan dan Maha Akhir tanpa batas.',
          amal: 'Tolak segala bentuk syirik dan yakini kemurnian tauhid dalam sanubari.'
        },
        words: [
          { id: '112:3:1', arabic: 'لَمْ', transliteration: 'Lam', translation: 'Tidak', rootWord: 'ل-م', grammarType: 'Harf (Kata Sambung/Huruf)' },
          { id: '112:3:2', arabic: 'يَلِدْ', transliteration: 'Yalid', translation: 'Beranak', rootWord: 'و-ل-د', grammarType: 'Fi\'il (Kata Kerja)' },
          { id: '112:3:3', arabic: 'وَلَمْ', transliteration: 'Wa lam', translation: 'Dan tidak pula', rootWord: 'ل-م', grammarType: 'Harf (Kata Sambung/Huruf)' },
          { id: '112:3:4', arabic: 'يُولَدْ', transliteration: 'Yūlad', translation: 'Diperanakkan', rootWord: 'و-ل-د', grammarType: 'Fi\'il (Kata Kerja)' }
        ]
      },
      {
        id: '112:4',
        surahNumber: 112,
        ayahNumber: 4,
        globalAyahNumber: 6225,
        arabicText: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
        transliteration: 'Wa lam yakun lahū kufuwan aḥad',
        translationId: 'dan tidak ada sesuatu yang setara dengan Dia."',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6225.mp3',
        tadabbur: {
          title: 'Tiada Yang Sebanding',
          hikmah: 'Tidak ada seorang pun, ciptaan mana pun, atau kekuatan apa pun yang dapat menyamai keagungan dan kasih sayang Allah.',
          amal: 'Jadikan cinta kepada Allah dan Rasul-Nya lebih tinggi dari kecintaan pada perhiasan duniawi.'
        },
        words: [
          { id: '112:4:1', arabic: 'وَلَمْ', transliteration: 'Wa lam', translation: 'Dan tidak', rootWord: 'ل-م', grammarType: 'Harf (Kata Sambung/Huruf)' },
          { id: '112:4:2', arabic: 'يَكُن', transliteration: 'Yakun', translation: 'Ada', rootWord: 'ك-و-ن', grammarType: 'Fi\'il (Kata Kerja)' },
          { id: '112:4:3', arabic: 'لَّهُ', transliteration: 'Lahū', translation: 'Bagi-Nya', rootWord: 'ل-ه', grammarType: 'Harf (Kata Sambung/Huruf)' },
          { id: '112:4:4', arabic: 'كُفُوًا', transliteration: 'Kufuwan', translation: 'Setara / Serupa', rootWord: 'ك-ف-أ', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Tandingan, padanan, atau sekutu.' },
          { id: '112:4:5', arabic: 'أَحَدٌ', transliteration: 'Aḥad', translation: 'Seorang pun', rootWord: 'و-ح-د', grammarType: 'Isim (Kata Benda/Nama)' }
        ]
      }
    ]
  },
  {
    number: 108,
    nameArabic: 'الكَوْثَر',
    nameLatin: 'Al-Kautsar',
    translationLatin: 'Nikmat yang Berlimpah',
    numberOfAyahs: 3,
    revelationType: 'Makkiyah',
    bismillahPre: true,
    themeColor: '#2F3E46',
    ayahs: [
      {
        id: '108:1',
        surahNumber: 108,
        ayahNumber: 1,
        globalAyahNumber: 6205,
        arabicText: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ',
        transliteration: 'Innā a\'ṭainākal-kauṡar',
        translationId: 'Sungguh, Kami telah memberimu (Muhammad) nikmat yang banyak.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6205.mp3',
        tadabbur: {
          title: 'Sungai Kautsar di Surga',
          hikmah: 'Allah menghibur Rasulullah ﷺ dengan telaga dan karunia kebaikan yang tiada putus-putusnya.',
          amal: 'Hitunglah nikmat sehat, iman, dan keluarga yang telah kau terima hari ini.'
        },
        words: [
          { id: '108:1:1', arabic: 'إِنَّا', transliteration: 'Innā', translation: 'Sungguh Kami', rootWord: 'إ-ن-ن', grammarType: 'Harf (Kata Sambung/Huruf)' },
          { id: '108:1:2', arabic: 'أَعْطَيْنَاكَ', transliteration: 'A\'ṭaināka', translation: 'Telah Kami beri kamu', rootWord: 'ع-ط-و', grammarType: 'Fi\'il (Kata Kerja)' },
          { id: '108:1:3', arabic: 'الْكَوْثَرَ', transliteration: 'Al-kauṡara', translation: 'Nikmat yang melimpah / Telaga Kautsar', rootWord: 'ك-ث-ر', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Kebaikan berlimpah di dunia dan sungai indah di surga.' }
        ]
      },
      {
        id: '108:2',
        surahNumber: 108,
        ayahNumber: 2,
        globalAyahNumber: 6206,
        arabicText: 'فَصَلِّ لِرَبِّكَ وَانْحَرْ',
        transliteration: 'Faṣalli lirabbika wan-ḥar',
        translationId: 'Maka laksanakanlah salat karena Tuhanmu, dan berkurbanlah.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6206.mp3',
        tadabbur: {
          title: 'Wujud Syukur dengan Amal Nyata',
          hikmah: 'Syukur sejati diwujudkan dengan menjaga salat tepat waktu dan berbagi rezeki melalui kurban atau sedekah.',
          amal: 'Sisihkan sebagian uang saku atau rezeki hari ini untuk kotak infak masjid.'
        },
        words: [
          { id: '108:2:1', arabic: 'فَصَلِّ', transliteration: 'Fa-ṣalli', translation: 'Maka salatlah', rootWord: 'ص-ل-و', grammarType: 'Fi\'il (Kata Kerja)', explanation: 'Dirikanlah shalat dengan penuh khusyuk semata karena Allah.' },
          { id: '108:2:2', arabic: 'لِرَبِّكَ', transliteration: 'Li-rabbika', translation: 'Karena Tuhanmu', rootWord: 'ر-ب-ب', grammarType: 'Harf (Kata Sambung/Huruf)' },
          { id: '108:2:3', arabic: 'وَانْحَرْ', transliteration: 'Wan-ḥar', translation: 'Dan berkurbanlah', rootWord: 'ن-ح-ر', grammarType: 'Fi\'il (Kata Kerja)', explanation: 'Sembelihlah hewan qurban sebagai wujud ketundukan.' }
        ]
      },
      {
        id: '108:3',
        surahNumber: 108,
        ayahNumber: 3,
        globalAyahNumber: 6207,
        arabicText: 'إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ',
        transliteration: 'Inna syāni\'aka huwal-abtar',
        translationId: 'Sungguh, orang yang membencimu dialah yang terputus (dari rahmat Allah).',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6207.mp3',
        tadabbur: {
          title: 'Kekalnya Nama Orang Beriman',
          hikmah: 'Orang yang mencaci kebenaran akan sirna terlupakan, sedangkan pengikut kebenaran akan abadi dikenang dalam kemuliaan.',
          amal: 'Jangan membalas ejekan dengan kemarahan, balaslah dengan kesabaran dan akhlak terpuji.'
        },
        words: [
          { id: '108:3:1', arabic: 'إِنَّ', transliteration: 'Inna', translation: 'Sungguh', rootWord: 'إ-ن-ن', grammarType: 'Harf (Kata Sambung/Huruf)' },
          { id: '108:3:2', arabic: 'شَانِئَكَ', transliteration: 'Syāni\'aka', translation: 'Orang yang membencimu', rootWord: 'ش-ن-أ', grammarType: 'Isim (Kata Benda/Nama)' },
          { id: '108:3:3', arabic: 'هُوَ', transliteration: 'Huwa', translation: 'Dialah', rootWord: 'ه-و', grammarType: 'Isim (Kata Benda/Nama)' },
          { id: '108:3:4', arabic: 'الْأَبْتَرُ', transliteration: 'Al-abtar', translation: 'Yang terputus', rootWord: 'ب-ت-ر', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Terputus dari segala jejak kebaikan dan keturunan yang mendoakan.' }
        ]
      }
    ]
  },
  {
    number: 103,
    nameArabic: 'العَصْر',
    nameLatin: 'Al-\'Asr',
    translationLatin: 'Masa / Waktu',
    numberOfAyahs: 3,
    revelationType: 'Makkiyah',
    bismillahPre: true,
    themeColor: '#52796F',
    ayahs: [
      {
        id: '103:1',
        surahNumber: 103,
        ayahNumber: 1,
        globalAyahNumber: 6178,
        arabicText: 'وَالْعَصْرِ',
        transliteration: 'Wal-\'aṣr',
        translationId: 'Demi masa,',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6178.mp3',
        tadabbur: {
          title: 'Sumpah Atas Waktu',
          hikmah: 'Waktu adalah modal terpenting kehidupan yang berlalu dan tak pernah kembali.',
          amal: 'Kurangi scrolling media sosial yang sia-sia dan manfaatkan waktu untuk belajar.'
        },
        words: [
          { id: '103:1:1', arabic: 'وَالْعَصْرِ', transliteration: 'Wal-\'aṣr', translation: 'Demi masa / waktu', rootWord: 'ع-ص-ر', grammarType: 'Harf (Kata Sambung/Huruf)', explanation: 'Wawu qasam (sumpah Allah atas waktu sore atau sepanjang zaman).' }
        ]
      },
      {
        id: '103:2',
        surahNumber: 103,
        ayahNumber: 2,
        globalAyahNumber: 6179,
        arabicText: 'إِنَّ الْإِنسَانَ لَفِي خُسْرٍ',
        transliteration: 'Innal-insāna lafī khusr',
        translationId: 'sungguh, manusia berada dalam kerugian,',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6179.mp3',
        tadabbur: {
          title: 'Kerugian yang Nyata',
          hikmah: 'Setiap detik tanpa amal kebajikan adalah kerugian yang mengurangi jatah usia manusia.',
          amal: 'Evaluasi kegiatanmu hari ini sebelum tidur: berapa banyak kebaikan yang sudah kau tabung?'
        },
        words: [
          { id: '103:2:1', arabic: 'إِنَّ', transliteration: 'Inna', translation: 'Sungguh', rootWord: 'إ-ن-ن', grammarType: 'Harf (Kata Sambung/Huruf)' },
          { id: '103:2:2', arabic: 'الْإِنسَانَ', transliteration: 'Al-insāna', translation: 'Manusia', rootWord: 'أ-ن-س', grammarType: 'Isim (Kata Benda/Nama)' },
          { id: '103:2:3', arabic: 'لَفِي', transliteration: 'La-fī', translation: 'Benar-benar berada dalam', rootWord: 'ف-ي', grammarType: 'Harf (Kata Sambung/Huruf)' },
          { id: '103:2:4', arabic: 'خُسْرٍ', transliteration: 'Khusr', translation: 'Kerugian', rootWord: 'خ-س-ر', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Kebinasaan dan penyesalan mendalam.' }
        ]
      },
      {
        id: '103:3',
        surahNumber: 103,
        ayahNumber: 3,
        globalAyahNumber: 6180,
        arabicText: 'إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ',
        transliteration: 'Illallażīna āmanū wa \'amiluṣ-ṣāliḥāti wa tawāṣau bil-ḥaqqi wa tawāṣau biṣ-ṣabr',
        translationId: 'kecuali orang-orang yang beriman dan mengerjakan kebajikan serta saling menasihati untuk kebenaran dan saling menasihati untuk kesabaran.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6180.mp3',
        tadabbur: {
          title: 'Empat Kunci Keselamatan',
          hikmah: 'Imam Syafi\'i berkata: Seandainya Allah hanya menurunkan surah ini, niscaya sudah cukup menjadi petunjuk bagi umat manusia.',
          amal: 'Ajak saudaramu berbuat baik dengan cara yang santun dan sabar.'
        },
        words: [
          { id: '103:3:1', arabic: 'إِلَّا', transliteration: 'Illā', translation: 'Kecuali', rootWord: 'إ-ل-ا', grammarType: 'Harf (Kata Sambung/Huruf)' },
          { id: '103:3:2', arabic: 'الَّذِينَ', transliteration: 'Allażīna', translation: 'Orang-orang yang', rootWord: 'ل-ذ-ي', grammarType: 'Isim (Kata Benda/Nama)' },
          { id: '103:3:3', arabic: 'آمَنُوا', transliteration: 'Āmanū', translation: 'Beriman', rootWord: 'أ-م-ن', grammarType: 'Fi\'il (Kata Kerja)' },
          { id: '103:3:4', arabic: 'وَعَمِلُوا', transliteration: 'Wa \'amilū', translation: 'Dan beramal / berbuat', rootWord: 'ع-م-ل', grammarType: 'Fi\'il (Kata Kerja)' },
          { id: '103:3:5', arabic: 'الصَّالِحَاتِ', transliteration: 'Aṣ-ṣāliḥāti', translation: 'Kebajikan', rootWord: 'ص-ل-ح', grammarType: 'Isim (Kata Benda/Nama)' },
          { id: '103:3:6', arabic: 'وَتَوَاصَوْا', transliteration: 'Wa tawāṣau', translation: 'Dan saling berwasiat/menasihati', rootWord: 'و-ص-ي', grammarType: 'Fi\'il (Kata Kerja)' },
          { id: '103:3:7', arabic: 'بِالْحَقِّ', transliteration: 'Bil-ḥaqqi', translation: 'Dengan kebenaran', rootWord: 'ح-ق-ق', grammarType: 'Isim (Kata Benda/Nama)' },
          { id: '103:3:8', arabic: 'وَتَوَاصَوْا', transliteration: 'Wa tawāṣau', translation: 'Dan saling berwasiat/menasihati', rootWord: 'و-ص-ي', grammarType: 'Fi\'il (Kata Kerja)' },
          { id: '103:3:9', arabic: 'بِالصَّبْرِ', transliteration: 'Biṣ-ṣabr', translation: 'Dengan kesabaran', rootWord: 'ص-ب-ر', grammarType: 'Isim (Kata Benda/Nama)' }
        ]
      }
    ]
  },
  {
    number: 94,
    nameArabic: 'الشَّرْح',
    nameLatin: 'Asy-Syarh',
    translationLatin: 'Kelapangan Dada',
    numberOfAyahs: 8,
    revelationType: 'Makkiyah',
    bismillahPre: true,
    themeColor: '#84A98C',
    ayahs: [
      {
        id: '94:1',
        surahNumber: 94,
        ayahNumber: 1,
        globalAyahNumber: 6096,
        arabicText: 'أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ',
        transliteration: 'Alam nasyraḥ laka ṣadrak',
        translationId: 'Bukankah Kami telah melapangkan dadamu (Muhammad)?',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6096.mp3',
        tadabbur: {
          title: 'Kelapangan Jiwa',
          hikmah: 'Allah melimpahkan ketenangan, ilmu, dan kelembutan ke dalam hati orang yang bersandar kepada-Nya.',
          amal: 'Tarik napas dalam-dalam, lalu ucapkan: "Rabbi syrahli shadri" (Ya Tuhanku, lapangkanlah dadaku).'
        },
        words: [
          { id: '94:1:1', arabic: 'أَلَمْ', transliteration: 'Alam', translation: 'Bukankah', rootWord: 'ل-م', grammarType: 'Harf (Kata Sambung/Huruf)' },
          { id: '94:1:2', arabic: 'نَشْرَحْ', transliteration: 'Nasyraḥ', translation: 'Kami telah melapangkan', rootWord: 'ش-ر-ح', grammarType: 'Fi\'il (Kata Kerja)' },
          { id: '94:1:3', arabic: 'لَكَ', transliteration: 'Laka', translation: 'Bagimu', rootWord: 'ل-ك', grammarType: 'Harf (Kata Sambung/Huruf)' },
          { id: '94:1:4', arabic: 'صَدْرَكَ', transliteration: 'Ṣadraka', translation: 'Dadamu', rootWord: 'ص-د-ر', grammarType: 'Isim (Kata Benda/Nama)' }
        ]
      },
      {
        id: '94:2',
        surahNumber: 94,
        ayahNumber: 2,
        globalAyahNumber: 6097,
        arabicText: 'وَوَضَعْنَا عَنْكَ وِزْرَكَ',
        transliteration: 'Wa waḍa‘nā ‘anka wizrak',
        translationId: 'Dan Kami pun telah menurunkan beban darimu,',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6097.mp3',
        tadabbur: {
          title: 'Beban yang Diringankan',
          hikmah: 'Allah mengingatkan Nabi Muhammad bahwa Dia telah meringankan bebannya.',
          amal: 'Mohonlah pertolongan Allah ketika menghadapi beban yang berat.'
        },
        words: [
          { id: '94:2:1', arabic: 'وَوَضَعْنَا', transliteration: 'Wa waḍa‘nā', translation: 'Dan Kami telah menurunkan', rootWord: 'و-ض-ع', grammarType: 'Fi\'il (Kata Kerja)' },
          { id: '94:2:2', arabic: 'عَنْكَ', transliteration: '‘Anka', translation: 'Darimu', rootWord: 'ع-ن', grammarType: 'Harf (Kata Sambung/Huruf)' },
          { id: '94:2:3', arabic: 'وِزْرَكَ', transliteration: 'Wizraka', translation: 'Bebanmu', rootWord: 'و-ز-ر', grammarType: 'Isim (Kata Benda/Nama)' }
        ]
      },
      {
        id: '94:3',
        surahNumber: 94,
        ayahNumber: 3,
        globalAyahNumber: 6098,
        arabicText: 'الَّذِي أَنْقَضَ ظَهْرَكَ',
        transliteration: 'Allażī anqaḍa ẓahrak',
        translationId: 'yang memberatkan punggungmu,',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6098.mp3',
        tadabbur: {
          title: 'Pertolongan dalam Kesulitan',
          hikmah: 'Allah mengetahui beban yang berat dalam menjalankan amanah.',
          amal: 'Ingatlah untuk meminta pertolongan Allah saat menghadapi kesulitan.'
        },
        words: [
          { id: '94:3:1', arabic: 'الَّذِي', transliteration: 'Allażī', translation: 'Yang', rootWord: 'ل-ذ-ي', grammarType: 'Isim (Kata Benda/Nama)' },
          { id: '94:3:2', arabic: 'أَنْقَضَ', transliteration: 'Anqaḍa', translation: 'Memberatkan', rootWord: 'ن-ق-ض', grammarType: 'Fi\'il (Kata Kerja)' },
          { id: '94:3:3', arabic: 'ظَهْرَكَ', transliteration: 'Ẓahraka', translation: 'Punggungmu', rootWord: 'ظ-ه-ر', grammarType: 'Isim (Kata Benda/Nama)' }
        ]
      },
      {
        id: '94:4',
        surahNumber: 94,
        ayahNumber: 4,
        globalAyahNumber: 6099,
        arabicText: 'وَرَفَعْنَا لَكَ ذِكْرَكَ',
        transliteration: 'Wa rafa‘nā laka żikrak',
        translationId: 'dan Kami tinggikan sebutan (nama)mu bagimu.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6099.mp3',
        tadabbur: {
          title: 'Nama yang Ditinggikan',
          hikmah: 'Allah meninggikan sebutan Nabi Muhammad.',
          amal: 'Berselawatlah untuk Nabi Muhammad hari ini.'
        },
        words: [
          { id: '94:4:1', arabic: 'وَرَفَعْنَا', transliteration: 'Wa rafa‘nā', translation: 'Dan Kami tinggikan', rootWord: 'ر-ف-ع', grammarType: 'Fi\'il (Kata Kerja)' },
          { id: '94:4:2', arabic: 'لَكَ', transliteration: 'Laka', translation: 'Bagimu', rootWord: 'ل-ك', grammarType: 'Harf (Kata Sambung/Huruf)' },
          { id: '94:4:3', arabic: 'ذِكْرَكَ', transliteration: 'Żikraka', translation: 'Sebutanmu', rootWord: 'ذ-ك-ر', grammarType: 'Isim (Kata Benda/Nama)' }
        ]
      },
      {
        id: '94:5',
        surahNumber: 94,
        ayahNumber: 5,
        globalAyahNumber: 6100,
        arabicText: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
        transliteration: 'Fa inna ma\'al-\'usri yusrā',
        translationId: 'Maka sesungguhnya beserta kesulitan ada kemudahan,',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6100.mp3',
        tadabbur: {
          title: 'Kemudahan Selalu Menyertai',
          hikmah: 'Bukan "setelah" melainkan "beserta" kesulitan Allah sisipkan kemudahan dan jalan keluar bagi hamba-Nya yang bersabar.',
          amal: 'Saat ujian datang, cari sisi baik dan hikmah yang Allah siapkan di baliknya.'
        },
        words: [
          { id: '94:5:1', arabic: 'فَإِنَّ', transliteration: 'Fa inna', translation: 'Maka sesungguhnya', rootWord: 'إ-ن-ن', grammarType: 'Harf (Kata Sambung/Huruf)' },
          { id: '94:5:2', arabic: 'مَعَ', transliteration: 'Ma\'a', translation: 'Beserta', rootWord: 'م-ع', grammarType: 'Harf (Kata Sambung/Huruf)' },
          { id: '94:5:3', arabic: 'الْعُسْرِ', transliteration: 'Al-\'usri', translation: 'Kesulitan', rootWord: 'ع-س-ر', grammarType: 'Isim (Kata Benda/Nama)' },
          { id: '94:5:4', arabic: 'يُسْرًا', transliteration: 'Yusrā', translation: 'Kemudahan', rootWord: 'ي-س-ر', grammarType: 'Isim (Kata Benda/Nama)', explanation: 'Kelonggaran dan jalan keluar yang luas.' }
        ]
      },
      {
        id: '94:6',
        surahNumber: 94,
        ayahNumber: 6,
        globalAyahNumber: 6101,
        arabicText: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
        transliteration: 'Inna ma\'al-\'usri yusrā',
        translationId: 'sesungguhnya beserta kesulitan itu ada kemudahan.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6101.mp3',
        tadabbur: {
          title: 'Penegasan Janji Allah',
          hikmah: 'Pengulangan ayat ini adalah janji suci bahwa satu kesulitan tidak akan pernah bisa mengalahkan dua kemudahan.',
          amal: 'Tersenyumlah dan kuatkan hatimu, pertolongan Allah begitu dekat.'
        },
        words: [
          { id: '94:6:1', arabic: 'إِنَّ', transliteration: 'Inna', translation: 'Sesungguhnya', rootWord: 'إ-ن-ن', grammarType: 'Harf (Kata Sambung/Huruf)' },
          { id: '94:6:2', arabic: 'مَعَ', transliteration: 'Ma\'a', translation: 'Beserta', rootWord: 'م-ع', grammarType: 'Harf (Kata Sambung/Huruf)' },
          { id: '94:6:3', arabic: 'الْعُسْرِ', transliteration: 'Al-\'usri', translation: 'Kesulitan itu', rootWord: 'ع-س-ر', grammarType: 'Isim (Kata Benda/Nama)' },
          { id: '94:6:4', arabic: 'يُسْرًا', transliteration: 'Yusrā', translation: 'Kemudahan', rootWord: 'ي-س-ر', grammarType: 'Isim (Kata Benda/Nama)' }
        ]
      },
      {
        id: '94:7',
        surahNumber: 94,
        ayahNumber: 7,
        globalAyahNumber: 6102,
        arabicText: 'فَإِذَا فَرَغْتَ فَانْصَبْ',
        transliteration: 'Fa iżā faraghta fanṣab',
        translationId: 'Maka apabila engkau telah selesai (dari suatu urusan), tetaplah bekerja keras (untuk urusan yang lain),',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6102.mp3',
        tadabbur: {
          title: 'Terus Berbuat Baik',
          hikmah: 'Setelah menyelesaikan suatu urusan, lanjutkan usaha dan ibadah dengan sungguh-sungguh.',
          amal: 'Selesaikan satu urusan baik, lalu kerjakan urusan baik berikutnya.'
        },
        words: [
          { id: '94:7:1', arabic: 'فَإِذَا', transliteration: 'Fa iżā', translation: 'Maka apabila', rootWord: 'إ-ذ', grammarType: 'Harf (Kata Sambung/Huruf)' },
          { id: '94:7:2', arabic: 'فَرَغْتَ', transliteration: 'Faraghta', translation: 'Engkau telah selesai', rootWord: 'ف-ر-غ', grammarType: 'Fi\'il (Kata Kerja)' },
          { id: '94:7:3', arabic: 'فَانْصَبْ', transliteration: 'Fanṣab', translation: 'Maka bersungguh-sungguhlah', rootWord: 'ن-ص-ب', grammarType: 'Fi\'il (Kata Kerja)' }
        ]
      },
      {
        id: '94:8',
        surahNumber: 94,
        ayahNumber: 8,
        globalAyahNumber: 6103,
        arabicText: 'وَإِلَىٰ رَبِّكَ فَارْغَبْ',
        transliteration: 'Wa ilā rabbika farghab',
        translationId: 'dan hanya kepada Tuhanmulah engkau berharap.',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6103.mp3',
        tadabbur: {
          title: 'Harapan kepada Allah',
          hikmah: 'Hanya kepada Allah kita menaruh harapan dan memohon pertolongan.',
          amal: 'Sampaikan harapanmu kepada Allah melalui doa.'
        },
        words: [
          { id: '94:8:1', arabic: 'وَإِلَىٰ', transliteration: 'Wa ilā', translation: 'Dan hanya kepada', rootWord: 'إ-ل-ى', grammarType: 'Harf (Kata Sambung/Huruf)' },
          { id: '94:8:2', arabic: 'رَبِّكَ', transliteration: 'Rabbika', translation: 'Tuhanmu', rootWord: 'ر-ب-ب', grammarType: 'Isim (Kata Benda/Nama)' },
          { id: '94:8:3', arabic: 'فَارْغَبْ', transliteration: 'Farghab', translation: 'Maka berharaplah', rootWord: 'ر-غ-ب', grammarType: 'Fi\'il (Kata Kerja)' }
        ]
      }
    ]
  }
];

export const INITIAL_PLANTS_CATALOG: { type: GardenPlant['type']; name: string; requiredAyahs: number }[] = [
  { type: 'olive_tree', name: 'Pohon Zaitun Berkah (شَجَرَةٍ مُّبَارَكَةٍ)', requiredAyahs: 1 },
  { type: 'date_palm', name: 'Pohon Kurma Raudhah (نَخْلَةٍ)', requiredAyahs: 3 },
  { type: 'jasmine_flower', name: 'Bunga Melati Kautsar', requiredAyahs: 5 },
  { type: 'sidr_tree', name: 'Pohon Bidara Sidratul Muntaha', requiredAyahs: 8 },
  { type: 'lotus_flower', name: 'Teratai Cahaya Telaga', requiredAyahs: 12 },
  { type: 'pomegranate', name: 'Pohon Delima Surga (رُمَّانٌ)', requiredAyahs: 16 }
];

export const INITIAL_BADGES: { id: string; title: string; description: string; iconName: string; xpReward: number }[] = [
  { id: 'first_ayah', title: 'Langkah Pertama', description: 'Menyelesaikan hafalan ayat Al-Qur\'an pertama.', iconName: 'Sparkles', xpReward: 50 },
  { id: 'streak_3', title: 'Cahaya Istiqomah', description: 'Belajar dan muraja\'ah 3 hari berturut-turut.', iconName: 'Flame', xpReward: 100 },
  { id: 'surah_naas', title: 'Penjaga An-Naas', description: 'Menghafal seluruh ayat dalam Surah An-Naas.', iconName: 'ShieldCheck', xpReward: 150 },
  { id: 'word_master', title: 'Penyelam Tadabbur', description: 'Membuka arti kata per kata lebih dari 10 kali.', iconName: 'BookOpen', xpReward: 80 },
  { id: 'garden_oasis', title: 'Taman Surga Rindang', description: 'Menumbuhkan minimal 3 tanaman di Taman Surga.', iconName: 'Palmtree', xpReward: 120 },
  { id: 'mutqin_master', title: 'Hafalan Mutqin', description: 'Menyelesaikan Game Ayat Menghilang tingkat 100%.', iconName: 'Award', xpReward: 200 }
];
