/**
 * Identitas aplikasi (nama, logo, alamat) dibaca dari public/manifest.json saat aplikasi berjalan,
 * jadi tidak ditulis ulang di kode. Ganti nama atau logo di manifest.json, dan semua yang memakai
 * identitas ini (mis. gambar "Bagikan Ayat") ikut berubah otomatis.
 */

export interface AppIdentity {
  /** Nama tampilan, mis. "Raudhah Qur'an" (bagian sebelum " - " pada `name` di manifest). */
  name: string;
  shortName: string;
  /** Alamat logo (ikon manifest yang terbesar), sudah berupa URL lengkap. */
  logoUrl: string | null;
  /** Alamat aplikasi (start_url manifest), sudah berupa URL lengkap. */
  url: string;
}

interface ManifestIcon {
  src: string;
  sizes?: string;
  type?: string;
}

interface Manifest {
  name?: string;
  short_name?: string;
  start_url?: string;
  icons?: ManifestIcon[];
}

/** Ukuran ikon untuk memilih yang paling tajam: "any" (SVG) dianggap paling besar. */
const iconSize = (icon: ManifestIcon) =>
  icon.sizes === 'any' ? Number.MAX_SAFE_INTEGER : Math.max(0, ...(icon.sizes ?? '').split(/\s+/).map((s) => Number(s.split('x')[0]) || 0));

/** Nama tampilan: buang slogan setelah pemisah, mis. "Nama - Slogan" → "Nama". */
const displayName = (name: string) => name.split(/\s+[-–—|:]\s+/)[0].trim();

function fromDocument(): AppIdentity {
  const title = document.title || 'Aplikasi';
  const icon = document.querySelector<HTMLLinkElement>('link[rel~="icon"]')?.href ?? null;
  return { name: displayName(title), shortName: displayName(title), logoUrl: icon, url: new URL(import.meta.env.BASE_URL, window.location.origin).href };
}

let identityPromise: Promise<AppIdentity> | null = null;

export function loadAppIdentity(): Promise<AppIdentity> {
  identityPromise ??= (async () => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    const manifestUrl = link?.href ?? new URL(`${import.meta.env.BASE_URL}manifest.json`, window.location.origin).href;
    try {
      const response = await fetch(manifestUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const manifest = (await response.json()) as Manifest;
      const fallback = fromDocument();
      const name = manifest.name ? displayName(manifest.name) : fallback.name;
      const icon = [...(manifest.icons ?? [])].sort((a, b) => iconSize(b) - iconSize(a))[0];
      return {
        name,
        shortName: manifest.short_name?.trim() || name,
        logoUrl: icon ? new URL(icon.src, manifestUrl).href : fallback.logoUrl,
        url: new URL(manifest.start_url ?? './', manifestUrl).href
      };
    } catch {
      return fromDocument();
    }
  })();
  return identityPromise;
}
