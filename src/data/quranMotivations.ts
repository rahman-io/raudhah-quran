/**
 * Motivasi membaca & menghafal Al-Qur'an, disarikan dari transkrip kajian
 * Ustadz Adi Hidayat dan Ustadz Abdul Somad. Kalimatnya diringkas agar pas di layar,
 * tanpa menambah klaim baru.
 *
 * Rujukan yang dicantumkan sudah dicek: Tirmidzi 2910 (hasan), Tirmidzi 2915 (hasan),
 * Bukhari 1896 (sahih), Bukhari 4937 & Muslim 798 (sahih).
 * Sengaja tidak dimasukkan karena haditsnya lemah:
 *  - mahkota cahaya untuk orang tua penghafal (Abu Dawud 1453, lemah menurut Al-Albani);
 *  - penghafal memberi syafaat kepada sepuluh anggota keluarga (Tirmidzi 2905, lemah).
 */

export interface QuranMotivation {
  /** Judul singkat yang menarik. */
  title: string;
  /** Pesan utama, disarikan dari kajian. */
  message: string;
  /** Penceramah yang kajiannya disarikan. */
  source: string;
  /** Rujukan ayat atau hadits (opsional). */
  reference?: string;
  /** Tautan rujukan hadits (opsional). */
  url?: string;
}

const UAH = 'Ustadz Adi Hidayat';
const UAS = 'Ustadz Abdul Somad';

export const QURAN_MOTIVATIONS: QuranMotivation[] = [
  {
    title: 'Satu huruf, sepuluh kebaikan',
    message: 'Baca satu huruf saja dari Al-Qur\'an, "Nun", itu sudah setara dengan sepuluh kebaikan. Bayangkan satu halaman, bayangkan satu juz.',
    source: UAH,
    reference: 'HR. At-Tirmidzi no. 2910 · Hasan',
    url: 'https://hadeethenc.com/en/browse/hadith/6275'
  },
  {
    title: 'Kepala anakmu bukan flashdisk',
    message: 'Jangan khawatir hafalan Al-Qur\'an membuat kepala anak "penuh" untuk fisika, biologi, atau matematika. Pengalaman para guru: anak yang terbiasa menghafal Al-Qur\'an justru lebih cepat paham dan lebih cepat menghafal pelajaran lain.',
    source: UAS
  },
  {
    title: 'Jangan lewatkan satu hari pun',
    message: 'Jangan lewatkan satu hari tanpa membaca Al-Qur\'an. Hari ini satu halaman, besok dua halaman, lalu lihat perubahan dalam hidupmu. Paling minimal, Allah jaga dirimu dari kegelisahan; ada masalah apa pun, Allah beri ketenangan.',
    source: UAH
  },
  {
    title: 'Bersama para malaikat yang mulia',
    message: 'Orang yang mahir membaca Al-Qur\'an akan bersama para malaikat yang mulia lagi taat. Yang masih terbata-bata dan merasa berat pun mendapat dua pahala. Jadi jangan berhenti belajar.',
    source: UAS,
    reference: 'HR. Bukhari no. 4937 & Muslim no. 798 · Sahih',
    url: 'https://hadeethenc.com/ar/browse/hadith/10113'
  },
  {
    title: 'Dinanti penduduk langit',
    message: 'Yang sering membaca Al-Qur\'an mungkin tidak banyak dilihat di dunia, tetapi penduduk langit sudah menantinya. Kedudukan dan penghormatannya di akhirat pun berbeda.',
    source: UAH
  },
  {
    title: 'Penghafal Qur\'an bisa jadi apa saja',
    message: 'Penghafal Al-Qur\'an bisa menjadi dokter spesialis, tentara, pilot, ahli sains dan teknologi. Banyak kampus dan instansi kini membuka beasiswa dan jalur khusus bagi penghafal Al-Qur\'an. Yang penting, di kepalanya ada Al-Qur\'an.',
    source: UAS
  },
  {
    title: 'Mahkota kemuliaan bagi penghafal',
    message: 'Kelak ahli Qur\'an dipanggil: "Bacalah dan naiklah." Al-Qur\'an memohon, "Ya Allah, hiasilah dia," maka dipakaikan mahkota kemuliaan. "Ya Allah, tambahkanlah," maka dipakaikan pakaian kemuliaan.',
    source: UAH,
    reference: 'HR. At-Tirmidzi no. 2915 · Hasan · QS. Fathir: 33',
    url: 'https://sunnah.com/tirmidhi:2915'
  },
  {
    title: 'Benteng di zaman modern',
    message: 'Al-Qur\'an adalah benteng yang menjaga anak-anak kita dari narkoba, pergaulan bebas, dan berbagai tantangan zaman. Dunia mereka dapat, akhirat mereka pun insya Allah selamat.',
    source: UAS
  },
  {
    title: 'Masuk surga bersama keluarga',
    message: 'Surga \'Adn dimasuki bersama orang-orang saleh dari orang tua, pasangan, dan anak cucu mereka. Malaikat masuk dari setiap pintu menyambut: "Salamun \'alaikum bima shabartum", selamat atas kesabaranmu.',
    source: UAH,
    reference: 'QS. Ar-Ra\'d: 23–24'
  },
  {
    title: 'Hafalan butuh hati yang bersih',
    message: '"Aku mengadu kepada Waki\' tentang buruknya hafalanku, maka beliau menasihatiku untuk meninggalkan maksiat. Sebab ilmu adalah cahaya, dan cahaya Allah tidak diberikan kepada pelaku maksiat." Jaga mata dan telinga agar Al-Qur\'an mudah melekat.',
    source: UAS,
    reference: 'Syair Imam asy-Syafi\'i'
  },
  {
    title: 'Ahli Qur\'an tak mesti hafal 30 juz',
    message: 'Ada sahabat Nabi yang hafal satu surah saja, namun pandai mengamalkannya. Yang dikhawatirkan justru orang yang cepat menghafal seperti meminum air, tetapi sulit mengamalkannya.',
    source: UAH,
    reference: 'QS. Fathir: 32'
  },
  {
    title: 'Semua yang didengar & dilihat akan ditanya',
    message: 'Pendengaran, penglihatan, dan hati semuanya akan dimintai pertanggungjawaban. Maka isilah dengan Al-Qur\'an: yang paling sering dibaca, didengar, dan direnungkan.',
    source: UAS,
    reference: 'QS. Al-Isra\': 36'
  },
  {
    title: 'Ketika Al-Qur\'an berkumpul dalam jiwa',
    message: 'Ahli Qur\'an yang sejati rajin tahajud, senang puasa sunnah, dan gemar bersedekah. Ketika Al-Qur\'an berkumpul dalam jiwa, di situlah puncak kebaikan tersemai.',
    source: UAH
  },
  {
    title: 'Al-Qur\'an menemani di akhir hayat',
    message: 'Apa yang paling sering kita baca, dengar, ucapkan, dan renungkan, itulah yang hadir saat ajal menjemput. Biasakan Al-Qur\'an, agar Al-Qur\'an pula yang terngiang di telinga kita di saat terakhir.',
    source: UAS
  },
  {
    title: 'Ayat yang hadir di saat sulit',
    message: 'Bila kebiasaan qur\'ani sudah tertanam di jiwa, ayat-ayat itu akan hadir membimbingmu dalam setiap kesulitan, seperti Nabi Yusuf yang dijaga Allah dengan petunjuk dari Rabb-nya.',
    source: UAH,
    reference: 'QS. Yusuf: 24'
  },
  {
    title: 'Punya cita-cita pintu surga',
    message: 'Ahli puasa dipanggil masuk dari pintu Ar-Rayyan, lalu pintunya ditutup rapat. Punyalah cita-cita, "Aku ingin masuk surga dari pintu ini," lalu dawamkan amalnya sejak sekarang.',
    source: UAH,
    reference: 'HR. Bukhari no. 1896 · Sahih',
    url: 'https://sunnah.com/bukhari:1896'
  }
];
