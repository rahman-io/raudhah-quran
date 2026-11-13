import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle, ArrowLeft, BookOpenCheck, ChevronDown, ChevronLeft, ChevronRight, Copy, Heart, Lightbulb, Loader2, Minus, PenLine, Plus,
  Search, Share2, SkipForward, Trash2, X
} from 'lucide-react';
import { useBackHandler } from '../../utils/backNavigation';
import { markActivity } from '../../services/dailyActivity';
import {
  ARABIC_SIZES, categoryIcon, deletePersonalDoa, doaShareText, savePersonalDoa, searchDoa, SET_INFO, setArabicSize, toggleFavorite,
  useArabicSize, useDoaData, useFavorites, usePersonalDoa, type DoaData, type DoaItem, type PersonalDoa
} from '../../services/doa';

type Tab = 'kategori' | 'semua' | 'favorit' | 'pribadi';
type SetId = keyof DoaData['sets'];

/** Doa pribadi ditampilkan dengan bentuk yang sama seperti doa bawaan. */
const personalAsItem = (p: PersonalDoa): DoaItem => ({
  id: p.id,
  c: 'pribadi',
  t: p.title,
  ar: p.arabic ?? '',
  lt: p.latin || undefined,
  tr: p.meaning,
  src: 'Doa pribadi'
});

const surface = 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700';

/* ---------- Kerangka layar penuh ---------- */

const Screen: React.FC<{
  z: number;
  title: React.ReactNode;
  onBack: () => void;
  right?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ z, title, onBack, right, children, footer }) => (
  <motion.div
    className="fixed inset-0 flex flex-col bg-[#F7F4EF] dark:bg-[#0D202A] text-[#293640] dark:text-[#E2E8F0]"
    style={{ zIndex: z }}
    initial={{ opacity: 0, x: 24 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.18, ease: 'easeOut' }}
    role="dialog"
    aria-modal="true"
  >
    <header className="shrink-0 flex items-center gap-2 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 max-w-2xl w-full mx-auto">
      <button type="button" onClick={onBack} className="p-2 rounded-xl text-[#246579] dark:text-[#A7CDD3] hover:bg-white/70 dark:hover:bg-slate-800" aria-label="Kembali">
        <ArrowLeft className="w-6 h-6" />
      </button>
      <div className="flex-1 min-w-0">{title}</div>
      {right}
    </header>
    <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
      <div className="max-w-2xl mx-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">{children}</div>
    </main>
    {footer}
  </motion.div>
);

/* ---------- Baris doa ---------- */

const DoaRow: React.FC<{ item: DoaItem; index: number; favorite: boolean; onOpen: () => void; showFavorite?: boolean }> = ({
  item,
  index,
  favorite,
  onOpen,
  showFavorite = true
}) => (
  <li className={`flex items-stretch rounded-2xl ${surface} shadow-[0_4px_14px_rgba(23,59,78,0.05)]`}>
    <button type="button" onClick={onOpen} className="flex-1 min-w-0 flex items-start gap-3 p-3.5 text-left">
      <span className="shrink-0 w-7 h-7 rounded-lg bg-[#F5D58A]/30 text-[11px] font-bold text-[#8A6420] dark:text-[#F5D58A] flex items-center justify-center tabular-nums">
        {index + 1}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-bold text-[#173B4E] dark:text-white leading-snug">{item.t}</span>
        <span className="block mt-0.5 text-xs text-[#477F8D] dark:text-[#94A3B8] line-clamp-2">{item.tr}</span>
        {item.n && <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-[#246579]/10 text-[10px] font-semibold text-[#246579] dark:text-[#A7CDD3]">{item.n}</span>}
      </span>
    </button>
    {showFavorite && (
      <button
        type="button"
        onClick={() => toggleFavorite(item.id)}
        className="shrink-0 px-3 flex items-start pt-4"
        aria-pressed={favorite}
        aria-label={favorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
      >
        <Heart className={`w-5 h-5 ${favorite ? 'fill-[#C8785A] text-[#C8785A]' : 'text-slate-300'}`} />
      </button>
    )}
  </li>
);

const DoaList: React.FC<{ items: DoaItem[]; onOpen: (index: number) => void; empty?: React.ReactNode }> = ({ items, onOpen, empty }) => {
  const favorites = useFavorites();
  if (!items.length) return <>{empty}</>;
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <DoaRow key={item.id} item={item} index={i} favorite={favorites.includes(item.id)} onOpen={() => onOpen(i)} showFavorite={item.c !== 'pribadi'} />
      ))}
    </ul>
  );
};

/* ---------- Isi satu doa (dipakai di halaman doa dan dzikir terpandu) ---------- */

const DoaContent: React.FC<{ item: DoaItem; compact?: boolean }> = ({ item, compact }) => {
  const size = ARABIC_SIZES[useArabicSize()];
  const [takhrijOpen, setTakhrijOpen] = useState(false);
  useEffect(() => setTakhrijOpen(false), [item.id]);
  return (
    <div className="space-y-4">
      {item.ar && (
        <p dir="rtl" className="font-mushaf-id text-right text-[#173B4E] dark:text-white whitespace-pre-line" style={{ fontSize: `${size}rem`, lineHeight: 2.15 }}>
          {item.ar}
        </p>
      )}
      {item.lt && <p className="text-[15px] leading-relaxed italic text-[#246579] dark:text-[#A7CDD3] whitespace-pre-line">{item.lt}</p>}
      <div>
        {item.ar && <p className="text-[11px] font-semibold uppercase tracking-wider text-[#BE9452] mb-1">Artinya</p>}
        <p className="text-[15px] leading-relaxed text-[#293640] dark:text-slate-200 whitespace-pre-line">{item.tr}</p>
      </div>
      {!compact && item.c !== 'pribadi' && (
        <div className="rounded-2xl bg-[#FBF6EA] dark:bg-slate-900/60 border border-[#F5D58A]/50 p-3.5 space-y-2 text-sm">
          <p className="flex items-start gap-2 text-[#293640] dark:text-slate-200">
            <BookOpenCheck className="w-4 h-4 mt-0.5 shrink-0 text-[#BE9452]" />
            <span className="font-semibold">{item.src}</span>
          </p>
          {item.g && (
            <p className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {item.g}
            </p>
          )}
          {item.tk && (
            <div>
              <button type="button" onClick={() => setTakhrijOpen((v) => !v)} className="inline-flex items-center gap-1 text-xs font-semibold text-[#246579] dark:text-[#A7CDD3]" aria-expanded={takhrijOpen}>
                Takhrij lengkap <ChevronDown className={`w-3.5 h-3.5 transition-transform ${takhrijOpen ? 'rotate-180' : ''}`} />
              </button>
              {takhrijOpen && <p className="mt-1 text-xs leading-relaxed text-[#477F8D] dark:text-[#94A3B8]">{item.tk}</p>}
            </div>
          )}
          {item.hisn && <p className="text-[11px] text-slate-500">Hisnul Muslim no. {item.hisn}</p>}
        </div>
      )}
      {!compact && item.f && (
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3.5">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#246579] dark:text-[#A7CDD3] mb-1">
            <Lightbulb className="w-3.5 h-3.5" /> Faedah
          </p>
          <p className="text-sm leading-relaxed text-[#293640] dark:text-slate-200">{item.f}</p>
        </div>
      )}
    </div>
  );
};

const FontSizeControl: React.FC = () => {
  const size = useArabicSize();
  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={() => setArabicSize(size - 1)} disabled={size === 0} className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#246579] dark:text-[#A7CDD3] disabled:opacity-40 flex items-center justify-center" aria-label="Perkecil huruf Arab">
        <Minus className="w-4 h-4" />
      </button>
      <button type="button" onClick={() => setArabicSize(size + 1)} disabled={size === ARABIC_SIZES.length - 1} className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#246579] dark:text-[#A7CDD3] disabled:opacity-40 flex items-center justify-center" aria-label="Perbesar huruf Arab">
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};

/* ---------- Halaman satu doa ---------- */

const DoaDetail: React.FC<{ list: DoaItem[]; start: number; onClose: () => void; onEditPersonal: (id: string) => void }> = ({ list, start, onClose, onEditPersonal }) => {
  useBackHandler(true, onClose, 12);
  const [index, setIndex] = useState(start);
  const [toast, setToast] = useState<string | null>(null);
  const favorites = useFavorites();
  const scrollRef = useRef<HTMLDivElement>(null);
  const item = list[Math.min(index, list.length - 1)];
  useEffect(() => {
    scrollRef.current?.closest('main')?.scrollTo({ top: 0 });
  }, [index]);
  if (!item) return null;
  const isFav = favorites.includes(item.id);
  const flash = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(null), 1800);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(doaShareText(item));
      flash('Doa disalin');
    } catch {
      flash('Gagal menyalin');
    }
  };
  const share = async () => {
    const text = doaShareText(item);
    if (navigator.share) {
      try {
        await navigator.share({ title: item.t, text });
      } catch {
        /* dibatalkan */
      }
    } else void copy();
  };
  return (
    <Screen
      z={67}
      onBack={onClose}
      title={<p className="text-sm font-semibold text-[#477F8D] tabular-nums">{list.length > 1 ? `${index + 1} / ${list.length}` : ''}</p>}
      right={
        <div className="flex items-center gap-1">
          <FontSizeControl />
          {item.c === 'pribadi' ? (
            <button type="button" onClick={() => onEditPersonal(item.id)} className="p-2 rounded-xl text-[#246579] dark:text-[#A7CDD3]" aria-label="Ubah doa pribadi">
              <PenLine className="w-5 h-5" />
            </button>
          ) : (
            <button type="button" onClick={() => toggleFavorite(item.id)} className="p-2 rounded-xl" aria-pressed={isFav} aria-label={isFav ? 'Hapus dari favorit' : 'Tambah ke favorit'}>
              <Heart className={`w-5 h-5 ${isFav ? 'fill-[#C8785A] text-[#C8785A]' : 'text-[#246579] dark:text-[#A7CDD3]'}`} />
            </button>
          )}
        </div>
      }
      footer={
        <div className="shrink-0 border-t border-slate-200/70 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
          <div className="max-w-2xl mx-auto flex items-center gap-2">
            <button type="button" onClick={() => setIndex((i) => i - 1)} disabled={index === 0} className="p-2.5 rounded-xl bg-[#F1F6F7] dark:bg-slate-800 text-[#246579] dark:text-[#A7CDD3] disabled:opacity-30" aria-label="Doa sebelumnya">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button type="button" onClick={copy} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#F1F6F7] dark:bg-slate-800 text-sm font-semibold text-[#246579] dark:text-[#A7CDD3]">
              <Copy className="w-4 h-4" /> Salin
            </button>
            <button type="button" onClick={share} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#246579] text-sm font-semibold text-white">
              <Share2 className="w-4 h-4" /> Bagikan
            </button>
            <button type="button" onClick={() => setIndex((i) => i + 1)} disabled={index >= list.length - 1} className="p-2.5 rounded-xl bg-[#F1F6F7] dark:bg-slate-800 text-[#246579] dark:text-[#A7CDD3] disabled:opacity-30" aria-label="Doa berikutnya">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      }
    >
      <div ref={scrollRef} className="pt-2 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-[#173B4E] dark:text-white leading-snug">{item.t}</h1>
          {item.n && <span className="inline-block mt-2 px-2.5 py-1 rounded-lg bg-[#246579]/10 text-xs font-semibold text-[#246579] dark:text-[#A7CDD3]">{item.n}</span>}
        </div>
        <DoaContent item={item} />
      </div>
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed left-1/2 -translate-x-1/2 bottom-24 z-[80] px-4 py-2 rounded-xl bg-[#173B4E] text-white text-sm shadow-lg">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </Screen>
  );
};

/* ---------- Dzikir terpandu ---------- */

const GuidedDzikir: React.FC<{ setId: SetId; items: DoaItem[]; onClose: () => void }> = ({ setId, items, onClose }) => {
  useBackHandler(true, onClose, 12);
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const advanceTimer = useRef<number | undefined>(undefined);
  const info = SET_INFO[setId];
  const item = items[index];
  const target = Math.max(1, item?.rep ?? 1);

  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);
  useEffect(() => {
    if (done && setId !== 'shalat') markActivity('dzikir');
  }, [done, setId]);

  const goTo = (next: number) => {
    window.clearTimeout(advanceTimer.current);
    setCount(0);
    if (next >= items.length) setDone(true);
    else setIndex(Math.max(0, next));
    document.getElementById('dzikir-guided-scroll')?.scrollTo({ top: 0 });
  };

  const tap = () => {
    if (done || count >= target) return;
    const next = count + 1;
    setCount(next);
    try {
      navigator.vibrate?.(next >= target ? [50, 60, 50] : 10);
    } catch {
      /* abaikan */
    }
    if (next >= target) advanceTimer.current = window.setTimeout(() => goTo(index + 1), 550);
  };

  const progress = done ? 1 : (index + count / target) / items.length;

  return (
    <motion.div className="fixed inset-0 z-[67] flex flex-col bg-[#F7F4EF] dark:bg-[#0D202A] text-[#293640] dark:text-[#E2E8F0]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="dialog" aria-modal="true" aria-label={info.title}>
      <header className="shrink-0 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 max-w-2xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <button type="button" onClick={onClose} className="p-2 rounded-xl text-[#246579] dark:text-[#A7CDD3]" aria-label="Kembali">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#173B4E] dark:text-white">{info.title}</p>
            <p className="text-[11px] text-[#477F8D] tabular-nums">{done ? 'Selesai' : `Bacaan ${index + 1} dari ${items.length}`}</p>
          </div>
          <FontSizeControl />
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-[#EFE7D8] dark:bg-slate-700 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-[#246579] to-[#C9A24A] transition-all duration-300" style={{ width: `${progress * 100}%` }} />
        </div>
      </header>

      {done ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <img src={categoryIcon(info.icon)} alt="" className="w-24 h-24" />
          <p className="text-xl font-bold text-[#173B4E] dark:text-white">Alhamdulillah, {info.title.toLowerCase()} selesai</p>
          <p className="text-sm text-[#477F8D] dark:text-[#94A3B8]">Semoga Allah menerima dzikir kita dan menjaga kita sepanjang hari.</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setDone(false); setIndex(0); setCount(0); }} className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-[#246579] dark:text-[#A7CDD3]">
              Ulangi
            </button>
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl bg-[#246579] text-white text-sm font-bold">
              Selesai
            </button>
          </div>
        </div>
      ) : (
        <>
          <main id="dzikir-guided-scroll" className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
            <div className="max-w-2xl mx-auto px-4 pb-4">
              <AnimatePresence mode="wait">
                <motion.div key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }} className={`rounded-3xl ${surface} p-4 space-y-3`}>
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-base font-bold text-[#173B4E] dark:text-white leading-snug">{item.t}</h2>
                    {item.n && <span className="shrink-0 px-2 py-0.5 rounded-md bg-[#246579]/10 text-[10px] font-semibold text-[#246579] dark:text-[#A7CDD3]">{item.n}</span>}
                  </div>
                  <DoaContent item={item} compact />
                  <p className="text-[11px] font-semibold text-[#BE9452]">{item.src}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
          <footer className="shrink-0 border-t border-slate-200/70 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
              <button type="button" onClick={() => goTo(index - 1)} disabled={index === 0} className="w-12 h-12 rounded-full bg-[#F1F6F7] dark:bg-slate-800 text-[#246579] dark:text-[#A7CDD3] disabled:opacity-30 flex items-center justify-center" aria-label="Bacaan sebelumnya">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={tap}
                className="relative w-24 h-24 rounded-full bg-gradient-to-b from-[#F5D58A] to-[#C9A24A] shadow-[0_10px_24px_rgba(201,162,74,0.45),inset_0_-4px_8px_rgba(0,0,0,0.12)] active:scale-95 transition-transform flex flex-col items-center justify-center text-[#173B4E]"
                aria-label={`Hitung bacaan. ${count} dari ${target}`}
              >
                <span className="text-2xl font-extrabold tabular-nums leading-none">{count}</span>
                <span className="text-[11px] font-semibold opacity-75 tabular-nums">dari {target}</span>
              </button>
              <button type="button" onClick={() => goTo(index + 1)} className="w-12 h-12 rounded-full bg-[#F1F6F7] dark:bg-slate-800 text-[#246579] dark:text-[#A7CDD3] flex items-center justify-center" aria-label="Lewati bacaan ini">
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-[#477F8D] dark:text-[#94A3B8]">Ketuk tombol emas setiap selesai membaca; lanjut otomatis bila jumlahnya tercapai.</p>
          </footer>
        </>
      )}
    </motion.div>
  );
};

/* ---------- Form doa pribadi ---------- */

const PersonalForm: React.FC<{ initial: PersonalDoa | null; onClose: () => void }> = ({ initial, onClose }) => {
  useBackHandler(true, onClose, 13);
  const [title, setTitle] = useState(initial?.title ?? '');
  const [arabic, setArabic] = useState(initial?.arabic ?? '');
  const [latin, setLatin] = useState(initial?.latin ?? '');
  const [meaning, setMeaning] = useState(initial?.meaning ?? '');
  const valid = title.trim() && meaning.trim();
  const field = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-[#173B4E] dark:text-white placeholder:text-slate-400';
  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-6" role="dialog" aria-modal="true" aria-label="Doa pribadi">
      <motion.div className="absolute inset-0 bg-[#0B1F27]/45" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} />
      <motion.form
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          savePersonalDoa({ id: initial?.id, title: title.trim(), arabic: arabic.trim() || undefined, latin: latin.trim() || undefined, meaning: meaning.trim() });
          onClose();
        }}
        className="relative w-full sm:max-w-md max-h-[90vh] overflow-y-auto bg-[#FBF8F2] dark:bg-[#152E38] rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 space-y-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center gap-3">
          <h2 className="flex-1 text-base font-bold text-[#173B4E] dark:text-white">{initial ? 'Ubah doa pribadi' : 'Tambah doa pribadi'}</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-xl text-slate-500" aria-label="Tutup">
            <X className="w-5 h-5" />
          </button>
        </div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} placeholder="Judul, mis. Doa untuk keluarga" className={field} />
        <textarea value={arabic} onChange={(e) => setArabic(e.target.value)} rows={2} dir="rtl" placeholder="Teks Arab (opsional)" className={`${field} font-mushaf-id text-lg`} style={{ lineHeight: 1.9 }} />
        <textarea value={latin} onChange={(e) => setLatin(e.target.value)} rows={2} placeholder="Latin (opsional)" className={field} />
        <textarea value={meaning} onChange={(e) => setMeaning(e.target.value)} rows={4} placeholder="Isi atau arti doa" className={field} />
        <div className="flex gap-2 pt-1">
          {initial && (
            <button
              type="button"
              onClick={() => {
                deletePersonalDoa(initial.id);
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> Hapus
            </button>
          )}
          <button type="submit" disabled={!valid} className="flex-1 py-2.5 rounded-xl bg-[#246579] disabled:opacity-40 text-white text-sm font-bold">
            Simpan
          </button>
        </div>
        <p className="text-[11px] text-slate-500">Doa pribadi hanya tersimpan di perangkat ini.</p>
      </motion.form>
    </div>
  );
};

/* ---------- Layar utama ---------- */

export const DoaView: React.FC<{ onClose: () => void; startSet?: SetId }> = ({ onClose, startSet }) => {
  useBackHandler(true, onClose, 10);
  const { data, error, retry } = useDoaData();
  const favorites = useFavorites();
  const personal = usePersonalDoa();
  const [tab, setTab] = useState<Tab>('kategori');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ list: DoaItem[]; index: number } | null>(null);
  const [guided, setGuided] = useState<SetId | null>(startSet ?? null);
  const [editing, setEditing] = useState<PersonalDoa | 'new' | null>(null);

  useBackHandler(!!category, () => setCategory(null), 11);

  const byId = useMemo(() => new Map((data?.items ?? []).map((it) => [it.id, it])), [data]);
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    data?.items.forEach((it) => map.set(it.c, (map.get(it.c) ?? 0) + 1));
    return map;
  }, [data]);
  const personalItems = useMemo(() => personal.map(personalAsItem), [personal]);
  const favoriteItems = useMemo(() => favorites.map((id) => byId.get(id)).filter((x): x is DoaItem => !!x), [favorites, byId]);
  const results = useMemo(() => (data && query.trim() ? searchDoa([...data.items, ...personalItems], query) : []), [data, query, personalItems]);
  const setItems = (id: SetId) => (data?.sets[id] ?? []).map((x) => byId.get(x)).filter((x): x is DoaItem => !!x);

  const tabs: [Tab, string][] = [
    ['kategori', 'Kategori'],
    ['semua', `Semua${data ? ` (${data.items.length})` : ''}`],
    ['favorit', `Favorit${favorites.length ? ` (${favorites.length})` : ''}`],
    ['pribadi', `Pribadi${personal.length ? ` (${personal.length})` : ''}`]
  ];

  const open = (list: DoaItem[], index: number) => setDetail({ list, index });
  const editPersonal = (id: string) => {
    const p = personal.find((x) => x.id === id);
    if (p) setEditing(p);
  };

  const categoryInfo = category ? data?.categories.find((c) => c.id === category) : null;
  const categoryItems = category && data ? data.items.filter((it) => it.c === category) : [];

  return createPortal(
    <>
      <Screen z={65} onBack={onClose} title={<h1 className="text-lg font-bold text-[#173B4E] dark:text-white">Doa & Dzikir</h1>}>
        <div className="sticky top-0 z-10 -mx-4 px-4 pt-1 pb-3 bg-[#F7F4EF]/95 dark:bg-[#0D202A]/95 backdrop-blur space-y-3">
          <label className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl ${surface}`}>
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari doa: makan, safar, hujan…"
              className="flex-1 min-w-0 bg-transparent text-sm text-[#173B4E] dark:text-white placeholder:text-slate-400 outline-none"
              aria-label="Cari doa"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="Hapus pencarian">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </label>
          {!query && (
            <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-[#EFE9DE] dark:bg-slate-800" role="tablist">
              {tabs.map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={`py-2 rounded-xl text-[12px] font-semibold truncate ${tab === id ? 'bg-white dark:bg-slate-700 text-[#BE6F3E] dark:text-[#F5D58A] shadow-sm' : 'text-[#477F8D] dark:text-slate-300'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {!data ? (
          <div className="py-16 flex flex-col items-center gap-3 text-sm text-[#477F8D]">
            {error ? (
              <>
                <p>Data doa belum bisa dimuat.</p>
                <button type="button" onClick={retry} className="px-4 py-2 rounded-xl bg-[#246579] text-white font-semibold">
                  Coba lagi
                </button>
              </>
            ) : (
              <Loader2 className="w-6 h-6 animate-spin" />
            )}
          </div>
        ) : query.trim() ? (
          <div className="space-y-3">
            <p className="text-xs text-[#477F8D]">{results.length} doa ditemukan</p>
            <DoaList items={results} onOpen={(i) => open(results, i)} empty={<p className="py-10 text-center text-sm text-slate-500">Tidak ada doa yang cocok.</p>} />
          </div>
        ) : tab === 'kategori' ? (
          <div className="space-y-5">
            <section>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#BE9452] mb-2">Dzikir terpandu</p>
              <div className="grid grid-cols-3 gap-2.5">
                {(Object.keys(SET_INFO) as SetId[]).map((id) => (
                  <button key={id} type="button" onClick={() => setGuided(id)} className="rounded-2xl bg-gradient-to-b from-[#246579] to-[#1C5668] text-white p-3 text-left shadow-[0_8px_20px_rgba(36,101,121,0.25)]">
                    <img src={categoryIcon(SET_INFO[id].icon)} alt="" className="w-10 h-10" />
                    <span className="block mt-1.5 text-[13px] font-bold leading-tight">{SET_INFO[id].title}</span>
                    <span className="block text-[10px] text-white/70">{data.sets[id].length} bacaan</span>
                  </button>
                ))}
              </div>
            </section>
            <section>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#BE9452] mb-2">Kategori</p>
              <div className="grid grid-cols-2 gap-2.5">
                {data.categories.map((c) => (
                  <button key={c.id} type="button" onClick={() => setCategory(c.id)} className={`flex items-center gap-3 p-3 rounded-2xl ${surface} text-left shadow-[0_4px_14px_rgba(23,59,78,0.05)]`}>
                    <img src={categoryIcon(c.id)} alt="" className="w-12 h-12 shrink-0" loading="lazy" />
                    <span className="min-w-0">
                      <span className="block text-[13px] font-bold text-[#173B4E] dark:text-white leading-tight">{c.title}</span>
                      <span className="block text-[11px] text-[#BE9452] font-semibold">{counts.get(c.id) ?? 0} doa</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        ) : tab === 'semua' ? (
          <DoaList items={data.items} onOpen={(i) => open(data.items, i)} />
        ) : tab === 'favorit' ? (
          <DoaList
            items={favoriteItems}
            onOpen={(i) => open(favoriteItems, i)}
            empty={<p className="py-12 text-center text-sm text-slate-500">Belum ada favorit. Ketuk ikon hati pada doa untuk menyimpannya di sini.</p>}
          />
        ) : (
          <div className="space-y-3">
            <button type="button" onClick={() => setEditing('new')} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-[#C9A24A]/60 text-sm font-bold text-[#8A6420] dark:text-[#F5D58A]">
              <Plus className="w-4 h-4" /> Tambah doa pribadi
            </button>
            <DoaList
              items={personalItems}
              onOpen={(i) => open(personalItems, i)}
              empty={<p className="py-8 text-center text-sm text-slate-500">Tulis doa-doa pribadimu sendiri; tersimpan hanya di perangkat ini.</p>}
            />
          </div>
        )}
      </Screen>

      <AnimatePresence>
        {category && categoryInfo && (
          <Screen
            key="category"
            z={66}
            onBack={() => setCategory(null)}
            title={
              <div className="flex items-center gap-2">
                <img src={categoryIcon(categoryInfo.id)} alt="" className="w-9 h-9" />
                <div className="min-w-0">
                  <p className="text-base font-bold text-[#173B4E] dark:text-white truncate">{categoryInfo.title}</p>
                  <p className="text-[11px] text-[#BE9452] font-semibold">{categoryItems.length} doa</p>
                </div>
              </div>
            }
          >
            {category === 'pagi-petang' && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {(['pagi', 'petang'] as SetId[]).map((id) => (
                  <button key={id} type="button" onClick={() => setGuided(id)} className="py-2.5 rounded-xl bg-[#246579] text-white text-sm font-semibold">
                    Mulai {SET_INFO[id].title}
                  </button>
                ))}
              </div>
            )}
            <DoaList items={categoryItems} onOpen={(i) => open(categoryItems, i)} />
          </Screen>
        )}
      </AnimatePresence>

      {detail && (
        <DoaDetail
          key={`${detail.list[detail.index]?.id}-${detail.list.length}`}
          list={detail.list}
          start={detail.index}
          onClose={() => setDetail(null)}
          onEditPersonal={(id) => {
            setDetail(null);
            editPersonal(id);
          }}
        />
      )}
      {guided && data && <GuidedDzikir setId={guided} items={setItems(guided)} onClose={() => setGuided(null)} />}
      {editing && <PersonalForm initial={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </>,
    document.body
  );
};
