/**
 * Bacaan dzikir untuk Tasbih digital.
 * Keutamaan hanya dari hadits sahih/hasan; nomor hadits dicocokkan ke Sunnah.com.
 */

export interface Dzikir {
  id: string;
  arabic: string;
  latin: string;
  meaning: string;
  /** Target hitungan satu putaran. */
  target: number;
  /** Keutamaan singkat beserta riwayatnya. */
  virtue?: { text: string; source: string; url: string };
}

const MUSLIM_597 = {
  text: 'Barang siapa bertasbih 33 kali, bertahmid 33 kali, dan bertakbir 33 kali setiap selesai sholat, lalu menggenapkan seratus dengan "Lā ilāha illallāhu waḥdahū lā syarīka lah…", diampuni kesalahannya walaupun sebanyak buih di lautan.',
  source: 'HR. Muslim no. 597',
  url: 'https://sunnah.com/muslim:597a'
};

export const DZIKIR: Dzikir[] = [
  {
    id: 'tasbih',
    arabic: 'سُبْحَانَ اللّٰهِ',
    latin: 'Subḥānallāh',
    meaning: 'Mahasuci Allah',
    target: 33,
    virtue: MUSLIM_597
  },
  {
    id: 'tahmid',
    arabic: 'اَلْحَمْدُ لِلّٰهِ',
    latin: 'Alḥamdulillāh',
    meaning: 'Segala puji bagi Allah',
    target: 33,
    virtue: MUSLIM_597
  },
  {
    id: 'takbir',
    arabic: 'اَللّٰهُ أَكْبَرُ',
    latin: 'Allāhu akbar',
    meaning: 'Allah Mahabesar',
    target: 33,
    virtue: MUSLIM_597
  },
  {
    id: 'tahlil-penutup',
    arabic: 'لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيْكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلٰى كُلِّ شَيْءٍ قَدِيْرٌ',
    latin: 'Lā ilāha illallāhu waḥdahū lā syarīka lah, lahul-mulku wa lahul-ḥamdu wa huwa ‘alā kulli syai’in qadīr',
    meaning: 'Tidak ada tuhan selain Allah semata, tidak ada sekutu bagi-Nya. Milik-Nya kerajaan dan milik-Nya segala puji, dan Dia Mahakuasa atas segala sesuatu.',
    target: 1,
    virtue: MUSLIM_597
  },
  {
    id: 'tasbih-tahmid',
    arabic: 'سُبْحَانَ اللّٰهِ وَبِحَمْدِهٖ',
    latin: 'Subḥānallāhi wa biḥamdih',
    meaning: 'Mahasuci Allah dan dengan memuji-Nya',
    target: 100,
    virtue: {
      text: 'Barang siapa mengucapkan "Subḥānallāhi wa biḥamdih" seratus kali dalam sehari, diampuni kesalahannya walaupun sebanyak buih di lautan.',
      source: 'HR. Bukhari no. 6405',
      url: 'https://sunnah.com/bukhari:6405'
    }
  },
  {
    id: 'istighfar',
    arabic: 'أَسْتَغْفِرُ اللّٰهَ',
    latin: 'Astagfirullāh',
    meaning: 'Aku memohon ampun kepada Allah',
    target: 100,
    virtue: {
      text: 'Nabi ﷺ bersabda: "Demi Allah, sungguh aku memohon ampun kepada Allah dan bertobat kepada-Nya dalam sehari lebih dari tujuh puluh kali."',
      source: 'HR. Bukhari no. 6307',
      url: 'https://sunnah.com/bukhari:6307'
    }
  },
  {
    id: 'shalawat',
    arabic: 'اَللّٰهُمَّ صَلِّ عَلٰى مُحَمَّدٍ',
    latin: 'Allāhumma ṣalli ‘alā Muḥammad',
    meaning: 'Ya Allah, limpahkanlah selawat kepada Muhammad',
    target: 100,
    virtue: {
      text: 'Barang siapa berselawat kepadaku satu kali, Allah berselawat kepadanya sepuluh kali.',
      source: 'HR. Muslim no. 408',
      url: 'https://sunnah.com/muslim:408'
    }
  },
  {
    id: 'tahlil',
    arabic: 'لَا إِلٰهَ إِلَّا اللّٰهُ',
    latin: 'Lā ilāha illallāh',
    meaning: 'Tidak ada tuhan selain Allah',
    target: 100,
    virtue: {
      text: 'Zikir yang paling utama adalah "Lā ilāha illallāh", dan doa yang paling utama adalah "Alḥamdulillāh".',
      source: 'HR. Tirmidzi no. 3383, hasan',
      url: 'https://sunnah.com/tirmidhi:3383'
    }
  },
  {
    id: 'hauqalah',
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ',
    latin: 'Lā ḥaula wa lā quwwata illā billāh',
    meaning: 'Tidak ada daya dan kekuatan kecuali dengan (pertolongan) Allah',
    target: 33,
    virtue: {
      text: 'Nabi ﷺ bersabda kepada Abu Musa: "Ucapkanlah Lā ḥaula wa lā quwwata illā billāh, karena ia adalah salah satu perbendaharaan surga."',
      source: 'HR. Bukhari no. 6384',
      url: 'https://sunnah.com/bukhari:6384'
    }
  }
];

/** Urutan dzikir setelah sholat (HR. Muslim no. 597): 33 + 33 + 33 + 1 = 100. */
export const AFTER_PRAYER_SEQUENCE = ['tasbih', 'tahmid', 'takbir', 'tahlil-penutup'];
