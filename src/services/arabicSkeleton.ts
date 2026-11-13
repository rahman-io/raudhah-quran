/**
 * Kerangka huruf Arab untuk pencarian ayat dengan suara.
 *
 * Hasil pengenal suara ditulis dengan ejaan Arab biasa tanpa harakat (mis. الصلاة),
 * sedangkan teks Mushaf Standar Indonesia memakai rasm utsmani berharakat (الصَّلٰوةَ).
 * Agar keduanya bisa dicocokkan, keduanya diubah ke kerangka yang sama:
 *  - harakat, tanda waqaf, dan huruf kecil (alif/wau/ya kecil) dibuang;
 *  - alif dan hamzah dalam bentuk apa pun dibuang (ejaannya paling sering berbeda);
 *  - ؤ → و, ئ/ى → ي, ة → ه;
 *  - spasi dibuang, jadi pemenggalan kata yang berbeda (يا أيها / يٰٓاَيُّهَا) tetap cocok.
 *
 * Dipakai juga oleh scripts/build-voice-index.mjs, jadi indeks dan suara selalu
 * dinormalkan dengan aturan yang persis sama. Berkas ini tidak boleh mengimpor apa pun.
 */

const MAP: Record<string, string> = {
  'ؤ': 'و', // ؤ → و
  'ئ': 'ي', // ئ → ي
  'ى': 'ي', // ى → ي
  'ی': 'ي', // ی (Persia) → ي
  'ک': 'ك', // ک (Persia) → ك
  'ة': 'ه', // ة → ه
  'ە': 'ه' // ە → ه
};

/** Huruf yang dipakai: ب–غ dan ف–ي (alif, hamzah, tatweel, dan tanda lain dibuang). */
const isKept = (code: number) => (code >= 0x0628 && code <= 0x063a) || (code >= 0x0641 && code <= 0x064a);

/**
 * Kerangka teks, beserta posisi setiap hurufnya di teks asli
 * (untuk menyorot bagian ayat yang cocok).
 */
export function arabicSkeletonWithMap(text: string): { skeleton: string; positions: number[] } {
  let skeleton = '';
  const positions: number[] = [];
  for (let i = 0; i < text.length; i += 1) {
    const ch = MAP[text[i]] ?? text[i];
    if (!isKept(ch.charCodeAt(0))) continue;
    skeleton += ch;
    positions.push(i);
  }
  return { skeleton, positions };
}

export const arabicSkeleton = (text: string): string => arabicSkeletonWithMap(text).skeleton;
