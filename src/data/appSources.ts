/**
 * Daftar sumber & rujukan konten aplikasi, ditampilkan di Pengaturan → "Sumber & Rujukan".
 * Teks sumber tidak lagi ditaruh di setiap layar; cukup perbarui daftar ini bila ada sumber baru.
 * Daftar qari murottal diambil otomatis dari src/data/reciters.ts.
 */

export interface AppSource {
  title: string;
  detail: string;
  url?: string;
}

export interface AppSourceGroup {
  id: string;
  title: string;
  items: AppSource[];
}

export const APP_SOURCE_GROUPS: AppSourceGroup[] = [
  {
    id: 'quran',
    title: "Teks & Terjemah Al-Qur'an",
    items: [
      {
        title: 'Teks Arab & latin',
        detail: "Mushaf Standar Indonesia dari Qur'an Kemenag RI, disusun Lajnah Pentashihan Mushaf Al-Qur'an (LPMQ).",
        url: 'https://quran.kemenag.go.id/'
      },
      {
        title: 'Font Arab',
        detail: 'LPMQ Isep Misbah, font resmi Mushaf Standar Indonesia dari LPMQ Kemenag RI.'
      },
      {
        title: 'Terjemah per ayat',
        detail: 'Terjemah Kementerian Agama RI, diambil melalui Quran.com API v4.',
        url: 'https://quran.com/'
      },
      {
        title: 'Arti per kata',
        detail: 'Terjemah kata per kata bahasa Indonesia dari Quran.com API v4.',
        url: 'https://quran.com/'
      },
      {
        title: 'Hukum tajwid per kata',
        detail: 'Data anotasi tajwid riwayat Hafs "quran-tajweed" (CC BY 4.0), dipetakan ke teks Mushaf Standar Indonesia. Penjelasannya mengikuti materi Belajar Tajwid.',
        url: 'https://github.com/cpfair/quran-tajweed'
      },
      {
        title: 'Data offline Juz 30 & Al-Fatihah',
        detail: 'Arti per kata, akar kata, dan catatan tadabbur bawaan aplikasi.'
      }
    ]
  },
  {
    id: 'tafsir',
    title: 'Tafsir & Info Surah',
    items: [
      {
        title: 'Tafsir per ayat',
        detail: 'Tafsir Ringkas (Wajiz) dan Tafsir Tahlili dari Qur\'an Kemenag RI.',
        url: 'https://quran.kemenag.go.id/'
      },
      {
        title: 'Tentang surah',
        detail: 'Latar belakang turun, makna nama, dan tema surah dari Indonesian Translation, King Fahad Complex, melalui Quran.com.',
        url: 'https://quran.com/'
      }
    ]
  },
  {
    id: 'hadits',
    title: 'Hadits & Motivasi',
    items: [
      {
        title: 'Keutamaan surah',
        detail: 'Hanya dari hadits sahih atau hasan. Kitab, nomor, dan derajatnya dicocokkan ke Sunnah.com, dan setiap keutamaan tetap mencantumkan riwayatnya.',
        url: 'https://sunnah.com/'
      },
      {
        title: 'Motivasi membaca & menghafal',
        detail: 'Disarikan dari kajian Ustadz Adi Hidayat dan Ustadz Abdul Somad. Hadits rujukannya dicek ke Sunnah.com dan HadeethEnc.',
        url: 'https://hadeethenc.com/'
      }
    ]
  }
];

/** Penyedia audio murottal (dikenali dari alamat berkas audionya). */
export const AUDIO_PROVIDERS: Record<string, AppSource> = {
  'cdn.islamic.network': { title: 'Islamic Network', detail: 'Audio murottal per ayat.', url: 'https://alquran.cloud/' },
  'everyayah.com': { title: 'EveryAyah.com', detail: 'Audio murottal per ayat.', url: 'https://everyayah.com/' }
};

export const OTHER_SOURCES: AppSource[] = [
  { title: 'Suara terjemah', detail: 'Dibacakan dengan suara bawaan perangkat (Text-to-Speech).' },
  { title: 'Cari ayat dengan suara', detail: 'Pengenal suara bawaan browser (Web Speech API). Suara diubah menjadi teks oleh layanan Google atau Apple, lalu dicocokkan ke teks Mushaf Standar Indonesia di perangkat.' },
  {
    title: 'Jadwal sholat',
    detail: "Dihitung di perangkat dengan pustaka Adhan (MIT). Metode mengikuti lokasi (Indonesia: kriteria Kemenag RI, Subuh −20°, Isya −18°, Ashar Syafi'i, ihtiyath 2–3 menit; Eropa: Muslim World League; dll.) dan bisa diganti serta dikoreksi per menit. Tanggal Hijriah dari kalender Umm al-Qura (bisa berbeda ±1 hari dengan ketetapan Kemenag).",
    url: 'https://github.com/batoulapps/adhan-js'
  },
  { title: 'Font tampilan', detail: 'Amiri, Scheherazade New, dan Plus Jakarta Sans dari Google Fonts.', url: 'https://fonts.google.com/' },
  { title: 'Ikon', detail: 'Lucide Icons.', url: 'https://lucide.dev/' }
];
