import { saveView } from './viewState';

/**
 * Tautan langsung ke satu ayat, mis. https://…/raudhah-quran/?surah=62&ayat=9
 * Dipakai di teks "Bagikan Ayat"; saat dibuka, app langsung membuka surah itu di ayat tersebut.
 */

export function ayahLink(appUrl: string, surah: number, ayah: number): string {
  const url = new URL(appUrl);
  url.searchParams.set('surah', String(surah));
  url.searchParams.set('ayat', String(ayah));
  return url.href;
}

/**
 * Dipanggil sekali sebelum app tampil: bila alamat berisi ?surah=&ayat=, siapkan tampilan
 * Baca & Tadabbur di ayat itu, lalu bersihkan alamatnya (refresh berikutnya berjalan seperti biasa).
 */
export function consumeAyahLink() {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  if (!params.has('surah')) return;
  const surah = Number(params.get('surah'));
  const ayah = Number(params.get('ayat') ?? '1');
  if (Number.isInteger(surah) && surah >= 1 && surah <= 114) {
    saveView({
      tab: 'reader',
      reader: { surah, open: true, hafalanAyah: null, linkAyah: Number.isInteger(ayah) && ayah >= 1 ? ayah : 1 }
    });
  }
  params.delete('surah');
  params.delete('ayat');
  const query = params.toString();
  window.history.replaceState(window.history.state, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
}
