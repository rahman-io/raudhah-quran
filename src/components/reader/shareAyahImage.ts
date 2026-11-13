import auroraStory from '../../assets/share/aurora-story.jpg';
import auroraPost from '../../assets/share/aurora-post.jpg';
import { splitKemenagWords } from '../../services/quranReaderData';
import type { AppIdentity } from '../../utils/appIdentity';

/**
 * Gambar "Bagikan Ayat": frame latar + ayat (teks Arab, latin, terjemah) digambar di <canvas>.
 * Teks ayat tidak pernah dipotong: bila tidak muat dengan huruf yang masih nyaman dibaca,
 * ayat dibagi ke beberapa gambar berurutan (cocok untuk carousel Instagram).
 */

export type ShareFormat = 'story' | 'post';

export interface ShareAyahContent {
  arabic: string;
  /** true bila teks Arab dari Mushaf Standar Indonesia (font LPMQ). */
  msi: boolean;
  latin?: string;
  translation: string;
  /** Mis. "QS. Ya-Sin : 1" */
  reference: string;
}

export interface ShareTheme {
  id: string;
  name: string;
  backgrounds: Record<ShareFormat, string>;
  colors: {
    arabic: string;
    latin: string;
    translation: string;
    brand: string;
    muted: string;
    accent: string;
    chipBg: string;
    panelFill: string;
    panelStroke: string;
  };
}

/** Tambah tema baru cukup dengan menambah entri di sini (dua gambar latar + warna teks). */
export const SHARE_THEMES: ShareTheme[] = [
  {
    id: 'aurora',
    name: 'Aurora',
    backgrounds: { story: auroraStory, post: auroraPost },
    colors: {
      arabic: '#123447',
      latin: '#1F6275',
      translation: '#26343E',
      brand: '#173B4E',
      muted: '#3E6F7C',
      accent: '#C8913A',
      chipBg: 'rgba(36, 101, 121, 0.10)',
      panelFill: 'rgba(255, 255, 255, 0.58)',
      panelStroke: 'rgba(255, 255, 255, 0.9)'
    }
  }
];

interface FormatSpec {
  width: number;
  height: number;
  /** Pusat vertikal baris logo + nama app, dan baris alamat di bawah. */
  brandY: number;
  footerY: number;
  /** Batas atas & bawah panel ayat. */
  areaTop: number;
  areaBottom: number;
  sidePad: number;
  panelPadX: number;
  panelPadY: number;
  logo: number;
  brandSize: number;
  footerSize: number;
  chipSize: number;
  /** Ukuran dasar teks (px) dan batas terkecilnya agar tetap nyaman dibaca di layar HP. */
  arabic: number;
  latin: number;
  translation: number;
  min: { arabic: number; latin: number; translation: number };
}

// Story/Reels/Status WA: ±250 px atas & bawah tertutup tombol aplikasi, jadi isi diletakkan di luar area itu.
const FORMATS: Record<ShareFormat, FormatSpec> = {
  story: {
    width: 1080, height: 1920, brandY: 280, footerY: 1666, areaTop: 350, areaBottom: 1600,
    sidePad: 64, panelPadX: 56, panelPadY: 60, logo: 64, brandSize: 34, footerSize: 25, chipSize: 27,
    arabic: 70, latin: 31, translation: 37, min: { arabic: 46, latin: 25, translation: 29 }
  },
  post: {
    width: 1080, height: 1350, brandY: 104, footerY: 1262, areaTop: 168, areaBottom: 1196,
    sidePad: 64, panelPadX: 52, panelPadY: 52, logo: 54, brandSize: 30, footerSize: 23, chipSize: 25,
    arabic: 60, latin: 28, translation: 33, min: { arabic: 42, latin: 23, translation: 27 }
  }
};

const SANS = '"Plus Jakarta Sans", system-ui, sans-serif';
/** Ayat pendek boleh tampil lebih besar dari ukuran dasar (teks Arab paling besar). */
const MAX_SCALE = { arabic: 1.7, latin: 1.3, translation: 1.3 };
const MIN_SCALE = 0.5;
/** Ukuran saat ayat dibagi ke beberapa gambar: tetap besar dan nyaman dibaca. */
const PAGED_SCALE = 0.85;

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Gambar gagal dimuat: ${src}`));
    image.src = src;
  });

async function ensureFonts(msi: boolean) {
  if (!document.fonts?.load) return;
  const arabicFont = msi ? '"LPMQ Isep Misbah"' : 'Amiri';
  await Promise.all([
    document.fonts.load(`40px ${arabicFont}`, 'بِسْمِ'),
    document.fonts.load(`400 30px ${SANS}`),
    document.fonts.load(`600 30px ${SANS}`),
    document.fonts.load(`700 30px ${SANS}`),
    document.fonts.load(`italic 500 30px ${SANS}`)
  ]).catch(() => undefined);
}

function wrapWords(ctx: CanvasRenderingContext2D, words: string[], maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else line = candidate;
  });
  if (line) lines.push(line);
  return lines;
}

interface Row {
  height: number;
  /** Jarak/ornamen: dibuang bila jatuh di awal atau akhir gambar. */
  spacer?: boolean;
  draw?: (ctx: CanvasRenderingContext2D, centerX: number, top: number) => void;
}

/** Bagian isi: teks Arab, latin, atau terjemah (masing-masing beberapa baris). */
type Section = Row[];

const sized = (base: number, scale: number, min: number, max: number) => Math.round(Math.min(base * max, Math.max(min, base * scale)));

function buildSections(ctx: CanvasRenderingContext2D, content: ShareAyahContent, spec: FormatSpec, theme: ShareTheme, scale: number): Section[] {
  const maxWidth = spec.width - 2 * (spec.sidePad + spec.panelPadX);
  const sections: Section[] = [];
  let rows: Row[] = [];
  const text = (font: string, color: string, size: number, lineHeight: number, lines: string[], rtl = false) => {
    rows = [];
    sections.push(rows);
    lines.forEach((line) => {
      rows.push({
        height: size * lineHeight,
        draw: (c, x, top) => {
          c.font = font;
          c.fillStyle = color;
          c.direction = rtl ? 'rtl' : 'ltr';
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          c.fillText(line, x, top + (size * lineHeight) / 2);
        }
      });
    });
  };

  // Teks Arab
  const arabicSize = sized(spec.arabic, scale, spec.min.arabic, MAX_SCALE.arabic);
  const arabicFont = `${arabicSize}px ${content.msi ? '"LPMQ Isep Misbah"' : 'Amiri'}, Amiri, serif`;
  ctx.font = arabicFont;
  ctx.direction = 'rtl';
  const arabicWords = content.msi ? splitKemenagWords(content.arabic) : content.arabic.split(/\s+/).filter(Boolean);
  text(arabicFont, theme.colors.arabic, arabicSize, content.msi ? 2.05 : 1.95, wrapWords(ctx, arabicWords, maxWidth), true);
  ctx.direction = 'ltr';

  // Ornamen pemisah
  const gap = Math.round(30 * Math.min(1.2, Math.max(0.8, scale)));
  sections.push([{
    height: gap * 2 + 8,
    spacer: true,
    draw: (c, x, top) => {
      const y = top + gap + 4;
      c.strokeStyle = theme.colors.accent;
      c.globalAlpha = 0.7;
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(x - 70, y);
      c.lineTo(x - 14, y);
      c.moveTo(x + 14, y);
      c.lineTo(x + 70, y);
      c.stroke();
      c.globalAlpha = 1;
      c.fillStyle = theme.colors.accent;
      c.beginPath();
      c.moveTo(x, y - 6);
      c.lineTo(x + 6, y);
      c.lineTo(x, y + 6);
      c.lineTo(x - 6, y);
      c.closePath();
      c.fill();
    }
  }]);

  // Latin
  if (content.latin) {
    const latinSize = sized(spec.latin, scale, spec.min.latin, MAX_SCALE.latin);
    const latinFont = `italic 500 ${latinSize}px ${SANS}`;
    ctx.font = latinFont;
    text(latinFont, theme.colors.latin, latinSize, 1.5, wrapWords(ctx, content.latin.split(/\s+/).filter(Boolean), maxWidth));
    sections.push([{ height: Math.round(26 * Math.min(1.2, Math.max(0.8, scale))), spacer: true }]);
  }

  // Terjemah
  const translationSize = sized(spec.translation, scale, spec.min.translation, MAX_SCALE.translation);
  const translationFont = `400 ${translationSize}px ${SANS}`;
  ctx.font = translationFont;
  const translationWords = `“${content.translation.trim()}”`.split(/\s+/).filter(Boolean);
  text(translationFont, theme.colors.translation, translationSize, 1.55, wrapWords(ctx, translationWords, maxWidth));
  return sections;
}

const heightOf = (rows: Row[]) => rows.reduce((sum, row) => sum + row.height, 0);

/**
 * Bagi isi ke beberapa gambar. Satu bagian (mis. teks latin) dipindah utuh ke gambar berikutnya
 * bila masih muat di satu gambar; hanya bagian yang lebih panjang dari satu gambar yang dipecah per baris.
 */
function paginate(sections: Section[], available: number): Row[][] {
  const pages: Row[][] = [[]];
  let used = 0;
  const newPage = () => {
    pages.push([]);
    used = 0;
  };
  sections.forEach((section) => {
    const isSpacer = section.every((row) => row.spacer);
    if (isSpacer) {
      if (pages[pages.length - 1].length && used + heightOf(section) <= available) {
        pages[pages.length - 1].push(...section);
        used += heightOf(section);
      }
      return;
    }
    const height = heightOf(section);
    if (used > 0 && used + height > available && height <= available) newPage();
    section.forEach((row) => {
      if (used + row.height > available && used > 0) newPage();
      pages[pages.length - 1].push(row);
      used += row.height;
    });
  });
  pages.forEach((page) => {
    while (page.length && page[page.length - 1].spacer) page.pop();
    while (page.length && page[0].spacer) page.shift();
  });
  return pages.filter((page) => page.length);
}

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

const displayUrl = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

export interface RenderedShareImage {
  blob: Blob;
  page: number;
  pages: number;
}

export async function renderShareImages(
  content: ShareAyahContent,
  format: ShareFormat,
  theme: ShareTheme,
  identity: AppIdentity
): Promise<RenderedShareImage[]> {
  const spec = FORMATS[format];
  await ensureFonts(content.msi);
  const [background, logo] = await Promise.all([
    loadImage(theme.backgrounds[format]),
    identity.logoUrl ? loadImage(identity.logoUrl).catch(() => null) : Promise.resolve(null)
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = spec.width;
  canvas.height = spec.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas tidak didukung');

  const chipHeight = Math.round(spec.chipSize * 2);
  const chipGap = 36;
  const available = spec.areaBottom - spec.areaTop - 2 * spec.panelPadY - chipHeight - chipGap;

  // Huruf sebesar mungkin selama satu gambar muat; bila tidak, bagi ke beberapa gambar.
  let pages: Row[][] | null = null;
  for (let scale = MAX_SCALE.arabic; scale >= MIN_SCALE - 0.001; scale -= 0.04) {
    const rows = buildSections(ctx, content, spec, theme, scale).flat();
    if (heightOf(rows) <= available) {
      pages = [rows];
      break;
    }
  }
  pages ??= paginate(buildSections(ctx, content, spec, theme, PAGED_SCALE), available);

  const results: RenderedShareImage[] = [];
  for (let index = 0; index < pages.length; index += 1) {
    const rows = pages[index];
    const centerX = spec.width / 2;
    ctx.clearRect(0, 0, spec.width, spec.height);
    ctx.drawImage(background, 0, 0, spec.width, spec.height);

    // Logo + nama aplikasi (dari manifest)
    ctx.font = `700 ${spec.brandSize}px ${SANS}`;
    ctx.direction = 'ltr';
    const nameWidth = ctx.measureText(identity.name).width;
    const logoSize = logo ? spec.logo : 0;
    const brandGap = logo ? 18 : 0;
    const brandLeft = centerX - (logoSize + brandGap + nameWidth) / 2;
    if (logo) {
      ctx.save();
      roundRect(ctx, brandLeft, spec.brandY - logoSize / 2, logoSize, logoSize, logoSize * 0.26);
      ctx.clip();
      ctx.drawImage(logo, brandLeft, spec.brandY - logoSize / 2, logoSize, logoSize);
      ctx.restore();
    }
    ctx.fillStyle = theme.colors.brand;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(identity.name, brandLeft + logoSize + brandGap, spec.brandY + 1);

    // Panel kaca: setinggi isi, di tengah area
    const contentHeight = heightOf(rows);
    const panelHeight = Math.min(spec.areaBottom - spec.areaTop, contentHeight + chipHeight + chipGap + 2 * spec.panelPadY);
    const panelTop = spec.areaTop + (spec.areaBottom - spec.areaTop - panelHeight) / 2;
    const panelX = spec.sidePad;
    const panelWidth = spec.width - 2 * spec.sidePad;
    ctx.save();
    ctx.shadowColor = 'rgba(23, 59, 78, 0.10)';
    ctx.shadowBlur = 50;
    ctx.shadowOffsetY = 16;
    roundRect(ctx, panelX, panelTop, panelWidth, panelHeight, 44);
    ctx.fillStyle = theme.colors.panelFill;
    ctx.fill();
    ctx.restore();
    roundRect(ctx, panelX, panelTop, panelWidth, panelHeight, 44);
    ctx.strokeStyle = theme.colors.panelStroke;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label surah & ayat (+ nomor gambar bila dibagi)
    const chipLabel = pages.length > 1 ? `${content.reference}  ·  ${index + 1}/${pages.length}` : content.reference;
    ctx.font = `600 ${spec.chipSize}px ${SANS}`;
    const chipWidth = ctx.measureText(chipLabel).width + spec.chipSize * 2;
    const chipTop = panelTop + spec.panelPadY;
    roundRect(ctx, centerX - chipWidth / 2, chipTop, chipWidth, chipHeight, chipHeight / 2);
    ctx.fillStyle = theme.colors.chipBg;
    ctx.fill();
    ctx.fillStyle = theme.colors.latin;
    ctx.textAlign = 'center';
    ctx.fillText(chipLabel, centerX, chipTop + chipHeight / 2 + 1);

    let y = chipTop + chipHeight + chipGap;
    rows.forEach((row) => {
      row.draw?.(ctx, centerX, y);
      y += row.height;
    });
    ctx.direction = 'ltr';

    // Alamat aplikasi
    ctx.font = `500 ${spec.footerSize}px ${SANS}`;
    ctx.fillStyle = theme.colors.muted;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(displayUrl(identity.url), centerX, spec.footerY);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
    if (!blob) throw new Error('Gambar gagal dibuat');
    results.push({ blob, page: index + 1, pages: pages.length });
  }
  return results;
}

/** Versi teks untuk dibagikan / disalin. */
export function buildShareText(content: ShareAyahContent, identity: AppIdentity, link: string = identity.url): string {
  const ayah = [content.arabic, content.latin, `“${content.translation.trim()}”`, `(${content.reference})`].filter(Boolean).join('\n\n');
  return `${ayah}\n\nDibagikan dari ${identity.name}\n${link}`;
}
