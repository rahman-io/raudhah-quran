/**
 * Keutamaan surah yang bersumber dari hadits sahih atau hasan saja.
 *
 * Setiap entri sudah dicocokkan ke Sunnah.com (kitab, nomor, dan derajat).
 * Surah yang keutamaannya hanya diriwayatkan lewat hadits lemah atau palsu
 * (mis. hadits panjang Ubay bin Ka'ab tentang keutamaan tiap surah) sengaja
 * tidak dimasukkan. Sebaiknya daftar ini ditinjau ustadz sebelum ditambah.
 */

export interface SurahVirtue {
  /** Label singkat yang tampil sebagai judul. */
  label: string;
  /** Ringkasan isi hadits dalam bahasa Indonesia. */
  text: string;
  /** Rujukan kitab dan nomor hadits. */
  reference: string;
  /** Derajat hadits. */
  grade: string;
  /** Halaman hadits di Sunnah.com. */
  url: string;
}

const muslim804: SurahVirtue = {
  label: 'Menaungi pembacanya di hari kiamat',
  text: 'Al-Baqarah dan Ali \'Imran disebut "az-zahrawain" (dua yang bercahaya). Pada hari kiamat keduanya datang seperti dua awan yang menaungi orang yang membacanya.',
  reference: 'HR. Muslim no. 804',
  grade: 'Sahih',
  url: 'https://sunnah.com/muslim:804a'
};

const bukhari891: SurahVirtue = {
  label: 'Dibaca Nabi ﷺ pada Subuh hari Jumat',
  text: 'Rasulullah ﷺ biasa membaca Surah As-Sajdah dan Surah Al-Insan pada shalat Subuh hari Jumat.',
  reference: 'HR. Bukhari no. 891',
  grade: 'Sahih',
  url: 'https://sunnah.com/bukhari:891'
};

const muslim891: SurahVirtue = {
  label: 'Dibaca Nabi ﷺ pada shalat Id',
  text: 'Rasulullah ﷺ membaca Surah Qaf dan Surah Al-Qamar pada shalat Idul Fitri dan Idul Adha.',
  reference: 'HR. Muslim no. 891',
  grade: 'Sahih',
  url: 'https://sunnah.com/muslim:891a'
};

const muslim877: SurahVirtue = {
  label: 'Dibaca Nabi ﷺ pada shalat Jumat',
  text: 'Rasulullah ﷺ membaca Surah Al-Jumu\'ah dan Surah Al-Munafiqun pada shalat Jumat.',
  reference: 'HR. Muslim no. 877',
  grade: 'Sahih',
  url: 'https://sunnah.com/muslim:877a'
};

const muslim878: SurahVirtue = {
  label: 'Dibaca Nabi ﷺ pada shalat Id dan Jumat',
  text: 'Rasulullah ﷺ membaca Surah Al-A\'la dan Surah Al-Ghasyiyah pada shalat Id dan shalat Jumat.',
  reference: 'HR. Muslim no. 878',
  grade: 'Sahih',
  url: 'https://sunnah.com/muslim:878a'
};

const muslim726: SurahVirtue = {
  label: 'Dibaca Nabi ﷺ pada dua rakaat sebelum Subuh',
  text: 'Rasulullah ﷺ membaca Surah Al-Kafirun dan Surah Al-Ikhlas pada dua rakaat sunnah sebelum Subuh.',
  reference: 'HR. Muslim no. 726',
  grade: 'Sahih',
  url: 'https://sunnah.com/muslim:726'
};

const muslim814: SurahVirtue = {
  label: 'Ayat perlindungan yang tiada tandingannya',
  text: 'Rasulullah ﷺ bersabda tentang Al-Falaq dan An-Nas: "Tidakkah engkau lihat ayat-ayat yang diturunkan malam ini? Belum pernah terlihat yang semisal dengannya."',
  reference: 'HR. Muslim no. 814',
  grade: 'Sahih',
  url: 'https://sunnah.com/muslim:814a'
};

export const SURAH_VIRTUES: Record<number, SurahVirtue[]> = {
  1: [{
    label: 'Surah paling agung dalam Al-Qur\'an',
    text: 'Rasulullah ﷺ menyebut Al-Fatihah ("Alhamdulillahi rabbil \'alamin") sebagai surah paling agung dalam Al-Qur\'an, yaitu as-sab\'ul matsani (tujuh ayat yang diulang-ulang).',
    reference: 'HR. Bukhari no. 4474',
    grade: 'Sahih',
    url: 'https://sunnah.com/bukhari:4474'
  }],
  2: [
    {
      label: 'Setan lari dari rumah yang dibacakan surah ini',
      text: '"Janganlah jadikan rumah kalian seperti kuburan. Sesungguhnya setan lari dari rumah yang dibacakan Surah Al-Baqarah di dalamnya."',
      reference: 'HR. Muslim no. 780',
      grade: 'Sahih',
      url: 'https://sunnah.com/muslim:780'
    },
    {
      label: 'Dua ayat terakhirnya mencukupi di malam hari',
      text: 'Siapa yang membaca dua ayat terakhir Surah Al-Baqarah pada malam hari, keduanya akan mencukupinya.',
      reference: 'HR. Bukhari no. 5009',
      grade: 'Sahih',
      url: 'https://sunnah.com/bukhari:5009'
    },
    {
      label: 'Memuat Ayat Kursi, ayat paling agung',
      text: 'Rasulullah ﷺ membenarkan Ubay bin Ka\'ab bahwa ayat paling agung dalam Kitabullah adalah Ayat Kursi (Al-Baqarah: 255).',
      reference: 'HR. Muslim no. 810',
      grade: 'Sahih',
      url: 'https://sunnah.com/muslim:810'
    },
    muslim804
  ],
  3: [muslim804],
  18: [
    {
      label: 'Pelindung dari fitnah Dajjal',
      text: 'Siapa yang menghafal sepuluh ayat pertama Surah Al-Kahf akan dilindungi dari Dajjal.',
      reference: 'HR. Muslim no. 809',
      grade: 'Sahih',
      url: 'https://sunnah.com/muslim:809a'
    },
    {
      label: 'Cahaya di antara dua Jumat',
      text: 'Siapa yang membaca Surah Al-Kahf pada hari Jumat, cahaya akan meneranginya di antara dua Jumat.',
      reference: 'HR. Al-Hakim; Shahih at-Targhib wa at-Tarhib no. 736',
      grade: 'Sahih (menurut Al-Albani)',
      url: 'https://sunnah.com/virtues:36'
    }
  ],
  32: [bukhari891],
  48: [{
    label: 'Lebih dicintai Nabi ﷺ daripada dunia seisinya',
    text: 'Saat Surah Al-Fath turun, Rasulullah ﷺ bersabda: "Malam ini telah diturunkan kepadaku sebuah surah yang lebih aku cintai daripada apa yang disinari matahari."',
    reference: 'HR. Bukhari no. 4177',
    grade: 'Sahih',
    url: 'https://sunnah.com/bukhari:4177'
  }],
  50: [muslim891],
  54: [muslim891],
  62: [muslim877],
  63: [muslim877],
  67: [{
    label: 'Memberi syafaat bagi pembacanya',
    text: 'Ada satu surah dalam Al-Qur\'an berisi tiga puluh ayat yang terus memberi syafaat bagi seseorang hingga ia diampuni, yaitu "Tabarakalladzi biyadihil mulk".',
    reference: 'HR. Abu Dawud dan At-Tirmidzi',
    grade: 'Hasan (menurut At-Tirmidzi)',
    url: 'https://sunnah.com/riyadussalihin:1016'
  }],
  76: [bukhari891],
  87: [muslim878],
  88: [muslim878],
  109: [muslim726],
  112: [
    {
      label: 'Setara sepertiga Al-Qur\'an',
      text: '"Qul huwallahu ahad" sebanding dengan sepertiga Al-Qur\'an.',
      reference: 'HR. Muslim no. 811',
      grade: 'Sahih',
      url: 'https://sunnah.com/muslim:811a'
    },
    muslim726
  ],
  113: [muslim814],
  114: [muslim814]
};
