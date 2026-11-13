/**
 * Daftar qari untuk murottal per ayat.
 *
 * Semua alamat audio sudah dicek bisa diputar (ayat awal, tengah, dan akhir mushaf):
 *  - cdn.islamic.network (Islamic Network / AlQuran.cloud), nomor ayat global 1–6236;
 *  - everyayah.com, nama berkas SSSAAA (nomor surah + nomor ayat).
 */

export interface Reciter {
  id: string;
  name: string;
  /** Keterangan singkat gaya bacaan. */
  note: string;
  url: (ayah: { surahNumber: number; ayahNumber: number; globalAyahNumber: number }) => string;
  /** Rekaman ta'awudz qari ini sendiri (bila tersedia). */
  taawudz?: string;
}

const islamicNetwork = (edition: string, bitrate: number): Reciter['url'] =>
  ({ globalAyahNumber }) => `https://cdn.islamic.network/quran/audio/${bitrate}/${edition}/${globalAyahNumber}.mp3`;

const everyAyah = (folder: string): Reciter['url'] =>
  ({ surahNumber, ayahNumber }) =>
    `https://everyayah.com/data/${folder}/${String(surahNumber).padStart(3, '0')}${String(ayahNumber).padStart(3, '0')}.mp3`;

export const DEFAULT_RECITER_ID = 'minshawi';

/**
 * Ta'awudz (a'udzu billahi minasy-syaithanir-rajim). Hanya sebagian qari punya rekamannya
 * sendiri di everyayah.com; qari lain memakai rekaman Al-Husary.
 */
const HUSARY_TAAWUDZ = 'https://everyayah.com/data/Husary_128kbps/audhubillah.mp3';

export const RECITERS: Reciter[] = [
  { id: 'minshawi', name: 'Muhammad Siddiq Al-Minshawi', note: 'Murattal · khusyuk, tajwid rapi', url: islamicNetwork('ar.minshawi', 128) },
  { id: 'alafasy', name: 'Mishary Rashid Alafasy', note: 'Murattal · lembut dan jernih', url: islamicNetwork('ar.alafasy', 128), taawudz: 'https://everyayah.com/data/Alafasy_128kbps/audhubillah.mp3' },
  { id: 'mahermuaiqly', name: 'Maher Al-Muaiqly', note: 'Imam Masjidil Haram · tenang', url: islamicNetwork('ar.mahermuaiqly', 128) },
  { id: 'sudais', name: 'Abdurrahman As-Sudais', note: 'Imam Masjidil Haram · khas dan tegas', url: islamicNetwork('ar.abdurrahmaansudais', 192) },
  { id: 'shuraym', name: 'Saud Asy-Syuraim', note: 'Imam Masjidil Haram · berwibawa', url: islamicNetwork('ar.saoodshuraym', 64) },
  { id: 'yasseraldossari', name: 'Yasser Ad-Dossari', note: 'Imam Masjidil Haram · menyentuh', url: everyAyah('Yasser_Ad-Dussary_128kbps') },
  { id: 'ghamdi', name: 'Saad Al-Ghamdi', note: 'Murattal · halus, cocok untuk murajaah', url: everyAyah('Ghamadi_40kbps') },
  { id: 'shaatree', name: 'Abu Bakr Asy-Syatri', note: 'Murattal · merdu dan santai', url: islamicNetwork('ar.shaatree', 128), taawudz: 'https://everyayah.com/data/Abu_Bakr_Ash-Shaatree_128kbps/audhubillah.mp3' },
  { id: 'hanirifai', name: 'Hani Ar-Rifai', note: 'Murattal · sangat menyentuh', url: islamicNetwork('ar.hanirifai', 192) },
  { id: 'abdulbasit', name: 'Abdul Basit Abdus Samad', note: 'Murattal · legendaris, nafas panjang', url: islamicNetwork('ar.abdulbasitmurattal', 192) },
  { id: 'husary', name: 'Mahmoud Khalil Al-Husary', note: 'Murattal · jelas, standar belajar tajwid', url: islamicNetwork('ar.husary', 128), taawudz: HUSARY_TAAWUDZ },
  { id: 'husarymuallim', name: 'Al-Husary (Muallim)', note: 'Untuk belajar · pelan, per huruf jelas', url: everyAyah('Husary_Muallim_128kbps'), taawudz: HUSARY_TAAWUDZ },
  { id: 'minshawimuallim', name: 'Al-Minshawi (Muallim)', note: 'Untuk anak · diselingi suara anak menirukan', url: everyAyah('Minshawy_Teacher_128kbps') }
];

/** Audio pembuka bacaan surah: ta'awudz, lalu basmalah (Al-Fatihah ayat 1 dari qari yang sama). */
export function openingAudio(reciterId: string | undefined, part: 'taawudz' | 'basmalah'): { url: string; ownVoice: boolean } {
  const reciter = getReciter(reciterId);
  if (part === 'basmalah') return { url: reciter.url({ surahNumber: 1, ayahNumber: 1, globalAyahNumber: 1 }), ownVoice: true };
  return { url: reciter.taawudz ?? HUSARY_TAAWUDZ, ownVoice: !!reciter.taawudz };
}

export const getReciter = (id?: string): Reciter =>
  RECITERS.find((r) => r.id === id) ?? RECITERS.find((r) => r.id === DEFAULT_RECITER_ID)!;

/** Alamat audio ayat untuk qari terpilih; memakai audio bawaan ayat bila datanya tidak lengkap. */
export function reciterAudioUrl(
  reciterId: string | undefined,
  ayah: { surahNumber?: number; ayahNumber?: number; globalAyahNumber?: number; audioUrl?: string }
): string {
  const { surahNumber, ayahNumber, globalAyahNumber } = ayah;
  if (surahNumber && ayahNumber && globalAyahNumber) {
    return getReciter(reciterId).url({ surahNumber, ayahNumber, globalAyahNumber });
  }
  return ayah.audioUrl ?? '';
}
