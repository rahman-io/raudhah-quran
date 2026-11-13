/**
 * Perintah sekali pakai dari Beranda ke menu Baca: buka surah lalu langsung masuk ke fitur tertentu.
 *  - continue  : lanjut membaca di ayat/halaman terakhir
 *  - setor     : Mode Mushaf → Setor Hafalan (layar penuh)
 *  - challenge : Tadabbur → Tantangan Surah
 *  - hafalan   : Tadabbur → Mode Hafalkan untuk ayat terakhir yang dibaca
 */

export type ReaderIntent = { kind: 'continue' | 'setor' | 'challenge' } | { kind: 'hafalan'; ayah: number };

let pending: ReaderIntent | null = null;

export function setReaderIntent(intent: ReaderIntent) {
  pending = intent;
}

/** Ambil perintah yang menunggu (sekali saja). */
export function takeReaderIntent(): ReaderIntent | null {
  const intent = pending;
  pending = null;
  return intent;
}
