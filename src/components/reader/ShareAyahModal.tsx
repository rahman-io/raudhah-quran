import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Copy, Download, Image as ImageIcon, Loader2, Share2, Type, X } from 'lucide-react';
import { useBackHandler } from '../../utils/backNavigation';
import { loadAppIdentity, type AppIdentity } from '../../utils/appIdentity';
import { ayahLink } from '../../utils/ayahLink';
import {
  buildShareText,
  renderShareImages,
  SHARE_THEMES,
  type ShareAyahContent,
  type ShareFormat
} from './shareAyahImage';

interface Props {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  arabic: string;
  msi: boolean;
  latin: string;
  translation: string;
  onClose: () => void;
}

interface PreviewImage {
  file: File;
  url: string;
  page: number;
  pages: number;
}

const FORMATS: { id: ShareFormat; label: string; hint: string }[] = [
  { id: 'story', label: 'Story · Reels · Status WA', hint: '9:16' },
  { id: 'post', label: 'Post Instagram', hint: '4:5' }
];

const slug = (text: string) => text.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const isAbort = (error: unknown) => error instanceof DOMException && error.name === 'AbortError';

/** Jendela "Bagikan Ayat": gambar berbingkai (Story / Post) atau teks, lewat menu bagikan HP. */
export const ShareAyahModal: React.FC<Props> = ({ surahNumber, surahName, ayahNumber, arabic, msi, latin, translation, onClose }) => {
  const [mode, setMode] = useState<'image' | 'text'>('image');
  const [format, setFormat] = useState<ShareFormat>('story');
  const [themeId, setThemeId] = useState(SHARE_THEMES[0].id);
  const [withLatin, setWithLatin] = useState(true);
  const [identity, setIdentity] = useState<AppIdentity | null>(null);
  const [images, setImages] = useState<PreviewImage[] | null>(null);
  const [error, setError] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useBackHandler(true, onClose, 10);

  useEffect(() => {
    loadAppIdentity().then(setIdentity);
  }, []);

  // Kunci gulir halaman di belakang jendela; Esc untuk menutup.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const reference = `QS. ${surahName} : ${ayahNumber}`;
  const content = useMemo<ShareAyahContent>(
    () => ({ arabic, msi, latin: withLatin && latin ? latin : undefined, translation, reference }),
    [arabic, msi, latin, withLatin, translation, reference]
  );
  const theme = SHARE_THEMES.find((t) => t.id === themeId) ?? SHARE_THEMES[0];

  // Gambar dibuat ulang setiap pilihan berubah; berkasnya disiapkan lebih dulu agar
  // tombol Bagikan langsung membuka menu bagikan HP (tanpa menunggu).
  useEffect(() => {
    if (!identity || mode !== 'image') return;
    let cancelled = false;
    let created: PreviewImage[] = [];
    setImages(null);
    setError(false);
    renderShareImages(content, format, theme, identity)
      .then((rendered) => {
        if (cancelled) return;
        const base = `${slug(identity.shortName || identity.name) || 'ayat'}-qs-${surahNumber}-${ayahNumber}-${format}`;
        created = rendered.map(({ blob, page, pages }) => ({
          file: new File([blob], `${base}${pages > 1 ? `-${page}` : ''}.jpg`, { type: 'image/jpeg' }),
          url: URL.createObjectURL(blob),
          page,
          pages
        }));
        setImages(created);
      })
      .catch((err) => {
        console.warn('Gambar bagikan gagal dibuat:', err);
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
      created.forEach((image) => URL.revokeObjectURL(image.url));
    };
  }, [identity, mode, content, format, theme, surahNumber, ayahNumber]);

  const flash = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice((current) => (current === message ? null : current)), 2200);
  };

  const files = images?.map((image) => image.file) ?? [];
  const canShareFiles = files.length > 0 && typeof navigator.canShare === 'function' && navigator.canShare({ files });
  // Tautan langsung ke ayat ini: saat dibuka, app langsung menuju surah & ayatnya.
  const text = identity ? buildShareText(content, identity, ayahLink(identity.url, surahNumber, ayahNumber)) : '';

  const download = () => {
    images?.forEach((image) => {
      const link = document.createElement('a');
      link.href = image.url;
      link.download = image.file.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
    flash(images && images.length > 1 ? `${images.length} gambar disimpan` : 'Gambar disimpan');
  };

  const shareImages = async () => {
    if (!canShareFiles) return download();
    try {
      await navigator.share({ files, title: reference });
    } catch (err) {
      if (!isAbort(err)) download();
    }
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      flash('Teks disalin');
    } catch {
      flash('Gagal menyalin teks');
    }
  };

  const shareText = async () => {
    if (typeof navigator.share !== 'function') return copyText();
    try {
      await navigator.share({ text });
    } catch (err) {
      if (!isAbort(err)) copyText();
    }
  };

  const chip = (active: boolean) =>
    `px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
      active
        ? 'bg-[#246579] border-[#246579] text-white'
        : 'border-[#246579]/20 text-[#246579] dark:text-[#A7CDD3] hover:bg-[#246579]/5'
    }`;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-6" role="dialog" aria-modal="true" aria-label={`Bagikan ${reference}`}>
      <motion.div className="absolute inset-0 bg-[#0B1F27]/55 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative w-full sm:max-w-xl max-h-[92vh] flex flex-col bg-[#FBF8F2] dark:bg-[#152E38] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Kepala */}
        <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-700">
          <span className="w-9 h-9 shrink-0 rounded-xl bg-[#246579]/10 text-[#246579] dark:text-[#A7CDD3] flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-[#173B4E] dark:text-white">Bagikan Ayat</h2>
            <p className="text-[11px] text-[#477F8D] dark:text-[#94A3B8] truncate">{reference}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Tutup">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-4">
          {/* Gambar / Teks */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-[#246579]/[0.07] dark:bg-slate-900/40" role="tablist">
            {([
              { id: 'image', label: 'Gambar', Icon: ImageIcon },
              { id: 'text', label: 'Teks', Icon: Type }
            ] as const).map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={mode === id}
                onClick={() => setMode(id)}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  mode === id ? 'bg-white dark:bg-[#246579] text-[#173B4E] dark:text-white shadow-xs' : 'text-[#477F8D] dark:text-[#94A3B8]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Pilihan */}
          <div className="space-y-2.5">
            {mode === 'image' && (
              <div className="flex flex-wrap gap-2">
                {FORMATS.map(({ id, label, hint }) => (
                  <button key={id} type="button" onClick={() => setFormat(id)} className={chip(format === id)} aria-pressed={format === id}>
                    {label} <span className="opacity-70 font-medium">{hint}</span>
                  </button>
                ))}
              </div>
            )}
            {mode === 'image' && SHARE_THEMES.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {SHARE_THEMES.map((t) => (
                  <button key={t.id} type="button" onClick={() => setThemeId(t.id)} className={chip(themeId === t.id)} aria-pressed={themeId === t.id}>
                    {t.name}
                  </button>
                ))}
              </div>
            )}
            {latin && (
              <label className="flex items-center gap-2 text-xs font-medium text-[#173B4E] dark:text-slate-200 select-none">
                <input
                  type="checkbox"
                  checked={withLatin}
                  onChange={(event) => setWithLatin(event.target.checked)}
                  className="w-4 h-4 accent-[#246579]"
                />
                Sertakan teks latin
              </label>
            )}
          </div>

          {/* Pratinjau */}
          {mode === 'image' ? (
            error ? (
              <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">Gambar gagal dibuat. Coba tutup lalu buka lagi.</p>
            ) : !images ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-[#246579] dark:text-[#A7CDD3]">
                <Loader2 className="w-5 h-5 animate-spin" /> Menyiapkan gambar…
              </div>
            ) : (
              <div className="space-y-2">
                <div className={`flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 ${images.length === 1 ? 'justify-center' : ''}`}>
                  {images.map((image) => (
                    <figure key={image.url} className="snap-center shrink-0">
                      <img
                        src={image.url}
                        alt={`${reference}${image.pages > 1 ? ` bagian ${image.page} dari ${image.pages}` : ''}`}
                        className={`rounded-2xl shadow-md border border-white ${format === 'story' ? 'h-[46vh] max-h-[440px]' : 'h-[38vh] max-h-[380px]'} w-auto`}
                      />
                      {image.pages > 1 && (
                        <figcaption className="mt-1 text-center text-[11px] text-[#477F8D]">{image.page}/{image.pages}</figcaption>
                      )}
                    </figure>
                  ))}
                </div>
                {images.length > 1 && (
                  <p className="text-[11px] text-[#8A6420] dark:text-[#E9CF99] text-center">
                    Ayat ini panjang, jadi dibagi menjadi {images.length} gambar agar tetap utuh dan mudah dibaca. Cocok untuk carousel Instagram.
                  </p>
                )}
              </div>
            )
          ) : (
            <pre className="whitespace-pre-wrap break-words rounded-2xl bg-white dark:bg-slate-900/50 border border-[#246579]/10 p-4 text-sm leading-relaxed text-[#26343E] dark:text-slate-200 font-sans">
              {text || 'Menyiapkan teks…'}
            </pre>
          )}
        </div>

        {/* Tombol */}
        <div className="px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-slate-100 dark:border-slate-700 space-y-2">
          {notice && (
            <p className="flex items-center justify-center gap-1 text-xs font-semibold text-[#246579] dark:text-[#A7CDD3]" role="status">
              <Check className="w-4 h-4" /> {notice}
            </p>
          )}
          {mode === 'image' ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={shareImages}
                disabled={!images}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#246579] hover:bg-[#174C60] disabled:opacity-50 text-white text-sm font-semibold shadow-xs"
              >
                {canShareFiles ? <Share2 className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                {canShareFiles ? 'Bagikan Gambar' : 'Unduh Gambar'}
              </button>
              {canShareFiles && (
                <button
                  type="button"
                  onClick={download}
                  className="px-4 rounded-2xl border border-[#246579]/30 text-[#246579] dark:text-[#A7CDD3] hover:bg-[#246579]/5"
                  aria-label="Simpan gambar"
                  title="Simpan gambar"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={shareText}
                disabled={!text}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#246579] hover:bg-[#174C60] disabled:opacity-50 text-white text-sm font-semibold shadow-xs"
              >
                <Share2 className="w-4 h-4" /> Bagikan Teks
              </button>
              <button
                type="button"
                onClick={copyText}
                disabled={!text}
                className="px-4 flex items-center gap-1.5 rounded-2xl border border-[#246579]/30 text-[#246579] dark:text-[#A7CDD3] hover:bg-[#246579]/5 text-sm font-semibold"
              >
                <Copy className="w-4 h-4" /> Salin
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
