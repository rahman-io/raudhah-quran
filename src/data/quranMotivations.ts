/**
 * Motivasi membaca & menghafal Al-Qur'an, disarikan dari transkrip kajian
 * Ustadz Adi Hidayat. Kalimatnya diringkas agar pas di layar, tanpa menambah klaim baru.
 *
 * Rujukan ayat/hadits yang dicantumkan sudah dicek: Tirmidzi 2910 (hasan),
 * Tirmidzi 2915 (hasan), Bukhari 1896 (sahih). Bagian kajian tentang mahkota
 * untuk orang tua penghafal tidak dimasukkan karena haditsnya (Abu Dawud 1453)
 * dinilai lemah oleh Al-Albani.
 */

export interface QuranMotivation {
  /** Judul singkat yang menarik. */
  title: string;
  /** Pesan utama, disarikan dari kajian. */
  message: string;
  /** Rujukan ayat atau hadits (opsional). */
  reference?: string;
  /** Tautan rujukan hadits (opsional). */
  url?: string;
}

export const MOTIVATION_SOURCE = 'Disarikan dari kajian Ustadz Adi Hidayat';

export const QURAN_MOTIVATIONS: QuranMotivation[] = [
  {
    title: 'Satu huruf, sepuluh kebaikan',
    message: 'Baca satu huruf saja dari Al-Qur\'an, "Nun", itu sudah setara dengan sepuluh kebaikan. Bayangkan satu halaman, bayangkan satu juz.',
    reference: 'HR. At-Tirmidzi no. 2910 · Hasan',
    url: 'https://hadeethenc.com/en/browse/hadith/6275'
  },
  {
    title: 'Jangan lewatkan satu hari pun',
    message: 'Jangan lewatkan satu hari tanpa membaca Al-Qur\'an. Hari ini satu halaman, besok dua halaman, lalu lihat perubahan dalam hidupmu. Paling minimal, Allah jaga dirimu dari kegelisahan; ada masalah apa pun, Allah beri ketenangan.'
  },
  {
    title: 'Dinanti penduduk langit',
    message: 'Yang sering membaca Al-Qur\'an mungkin tidak banyak dilihat di dunia, tetapi penduduk langit sudah menantinya. Kedudukan dan penghormatannya di akhirat pun berbeda.'
  },
  {
    title: 'Mahkota kemuliaan bagi penghafal',
    message: 'Kelak ahli Qur\'an dipanggil: "Bacalah dan naiklah." Al-Qur\'an memohon, "Ya Allah, hiasilah dia," maka dipakaikan mahkota kemuliaan. "Ya Allah, tambahkanlah," maka dipakaikan pakaian kemuliaan.',
    reference: 'HR. At-Tirmidzi no. 2915 · Hasan · QS. Fathir: 33',
    url: 'https://sunnah.com/tirmidhi:2915'
  },
  {
    title: 'Masuk surga bersama keluarga',
    message: 'Surga \'Adn dimasuki bersama orang-orang saleh dari orang tua, pasangan, dan anak cucu mereka. Malaikat masuk dari setiap pintu menyambut: "Salamun \'alaikum bima shabartum", selamat atas kesabaranmu.',
    reference: 'QS. Ar-Ra\'d: 23–24'
  },
  {
    title: 'Ahli Qur\'an tak mesti hafal 30 juz',
    message: 'Ada sahabat Nabi yang hafal satu surah saja, namun pandai mengamalkannya. Yang dikhawatirkan justru orang yang cepat menghafal seperti meminum air, tetapi sulit mengamalkannya.',
    reference: 'QS. Fathir: 32'
  },
  {
    title: 'Ketika Al-Qur\'an berkumpul dalam jiwa',
    message: 'Ahli Qur\'an yang sejati rajin tahajud, senang puasa sunnah, dan gemar bersedekah. Ketika Al-Qur\'an berkumpul dalam jiwa, di situlah puncak kebaikan tersemai.'
  },
  {
    title: 'Ayat yang hadir di saat sulit',
    message: 'Bila kebiasaan qur\'ani sudah tertanam di jiwa, ayat-ayat itu akan hadir membimbingmu dalam setiap kesulitan, seperti Nabi Yusuf yang dijaga Allah dengan petunjuk dari Rabb-nya.',
    reference: 'QS. Yusuf: 24'
  },
  {
    title: 'Punya cita-cita pintu surga',
    message: 'Ahli puasa dipanggil masuk dari pintu Ar-Rayyan, lalu pintunya ditutup rapat. Punyalah cita-cita, "Aku ingin masuk surga dari pintu ini," lalu dawamkan amalnya sejak sekarang.',
    reference: 'HR. Bukhari no. 1896 · Sahih',
    url: 'https://sunnah.com/bukhari:1896'
  }
];
