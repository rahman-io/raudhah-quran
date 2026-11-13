import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Download, MoreVertical, PlusSquare, Share, Smartphone, X } from 'lucide-react';
import { loadAppIdentity, type AppIdentity } from '../utils/appIdentity';
import { useBackHandler } from '../utils/backNavigation';
import { isIOS, promptInstall, useInstallMode } from '../utils/installPrompt';

const DISMISS_KEY = 'raudhah_install_dismissed_v1';
const DISMISS_DAYS = 7;
/** Ajakan muncul setelah pengguna sempat melihat app, bukan langsung saat dibuka. */
const SHOW_DELAY_MS = 8000;

const dismissedRecently = () => {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY));
    return at > 0 && Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
};

function useAppIdentity() {
  const [identity, setIdentity] = useState<AppIdentity | null>(null);
  useEffect(() => {
    loadAppIdentity().then(setIdentity);
  }, []);
  return identity;
}

const AppLogo: React.FC<{ identity: AppIdentity | null; className?: string }> = ({ identity, className = 'w-11 h-11' }) =>
  identity?.logoUrl ? (
    <img src={identity.logoUrl} alt="" className={`${className} shrink-0 rounded-2xl`} />
  ) : (
    <span className={`${className} shrink-0 rounded-2xl bg-[#246579] text-white flex items-center justify-center`}>
      <Smartphone className="w-5 h-5" />
    </span>
  );

/** Panduan memasang untuk iPhone/iPad dan browser yang tidak punya tombol pasang otomatis. */
export const InstallGuide: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const identity = useAppIdentity();
  const name = identity?.name ?? 'aplikasi ini';
  useBackHandler(true, onClose, 10);

  const steps = isIOS()
    ? [
        { Icon: Share, text: 'Ketuk tombol Bagikan (ikon kotak dengan panah ke atas). Di Safari ada di bilah bawah atau di menu ⋯, di Chrome ada di kanan atas bilah alamat.' },
        { Icon: PlusSquare, text: 'Pilih "Tambahkan ke Layar Utama" (Add to Home Screen). Bila belum terlihat, gulir daftar menu ke bawah.' },
        { Icon: Smartphone, text: `Ketuk "Tambah", lalu buka ${name} dari ikon di layar utama. App tampil layar penuh tanpa bilah browser.` }
      ]
    : [
        { Icon: MoreVertical, text: 'Buka menu browser (ikon ⋮ atau ≡).' },
        { Icon: Download, text: 'Pilih "Instal aplikasi" atau "Tambahkan ke Layar utama".' },
        { Icon: Smartphone, text: `Buka ${name} dari ikon di layar utama. App tampil layar penuh tanpa bilah browser.` }
      ];

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center sm:p-6" role="dialog" aria-modal="true" aria-label="Cara memasang aplikasi">
      <motion.div className="absolute inset-0 bg-[#0B1F27]/55 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative w-full sm:max-w-md bg-[#FBF8F2] dark:bg-[#152E38] rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-4"
      >
        <div className="flex items-center gap-3">
          <AppLogo identity={identity} />
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-[#173B4E] dark:text-white">Pasang {identity?.name ?? 'Aplikasi'}</h2>
            <p className="text-[11px] text-[#477F8D] dark:text-[#94A3B8]">Gratis, tanpa toko aplikasi, hanya beberapa detik.</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl text-slate-500 hover:bg-white dark:hover:bg-slate-700" aria-label="Tutup">
            <X className="w-5 h-5" />
          </button>
        </div>
        <ol className="space-y-2.5">
          {steps.map(({ Icon, text }, i) => (
            <li key={i} className="flex items-start gap-3 rounded-2xl bg-white dark:bg-slate-900/40 border border-[#246579]/10 p-3">
              <span className="w-8 h-8 shrink-0 rounded-xl bg-[#246579]/10 text-[#246579] dark:text-[#A7CDD3] flex items-center justify-center">
                <Icon className="w-4 h-4" />
              </span>
              <p className="text-xs leading-relaxed text-[#26343E] dark:text-slate-200">
                <b className="text-[#246579] dark:text-[#A7CDD3]">{i + 1}.</b> {text}
              </p>
            </li>
          ))}
        </ol>
        <button type="button" onClick={onClose} className="w-full py-3 rounded-2xl bg-[#246579] hover:bg-[#174C60] text-white text-sm font-semibold">
          Mengerti
        </button>
      </motion.div>
    </div>,
    document.body
  );
};

/** Tombol "Pasang" yang memilih cara sesuai perangkat; dipakai di ajakan & di Pengaturan. */
export function useInstallAction() {
  const mode = useInstallMode();
  const [guideOpen, setGuideOpen] = useState(false);
  const install = async () => {
    if (mode === 'prompt') return promptInstall();
    setGuideOpen(true);
    return false;
  };
  const guide = guideOpen ? <InstallGuide onClose={() => setGuideOpen(false)} /> : null;
  return { mode, install, guide };
}

/** Ajakan kecil "Pasang aplikasi" di bawah layar; bisa ditutup (muncul lagi setelah 7 hari). */
export const InstallAppPrompt: React.FC = () => {
  const identity = useAppIdentity();
  const { mode, install, guide } = useInstallAction();
  const [ready, setReady] = useState(false);
  const [hidden, setHidden] = useState(dismissedRecently);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setHidden(true);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // abaikan
    }
  };

  // Hanya bila ada cara pasang yang jelas: tombol pasang Android/Chrome, atau panduan iPhone/iPad.
  const visible = ready && !hidden && (mode === 'prompt' || mode === 'ios');

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            key="install_prompt"
            role="region"
            aria-label="Pasang aplikasi"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-3 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] lg:bottom-6 lg:left-auto lg:right-6 lg:w-96 z-[60] mx-auto max-w-md flex items-center gap-3 rounded-3xl bg-white/95 dark:bg-[#152E38]/95 backdrop-blur-md border border-[#D3A253]/40 shadow-[0_12px_40px_rgba(23,59,78,0.18)] p-3"
          >
            <AppLogo identity={identity} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#173B4E] dark:text-white truncate">Pasang {identity?.name ?? 'aplikasi'}</p>
              <p className="text-[11px] leading-snug text-[#477F8D] dark:text-[#94A3B8]">Layar penuh tanpa bilah browser, buka langsung dari layar utama.</p>
            </div>
            <button
              type="button"
              onClick={async () => {
                if (await install()) dismiss();
              }}
              className="shrink-0 px-3.5 py-2 rounded-xl bg-[#246579] hover:bg-[#174C60] text-white text-xs font-semibold"
            >
              Pasang
            </button>
            <button type="button" onClick={dismiss} className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Nanti saja">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {guide}
    </>
  );
};

/** Baris "Pasang Aplikasi" di Pengaturan (tidak tampil bila app sudah terpasang). */
export const InstallAppSettingsRow: React.FC = () => {
  const { mode, install, guide } = useInstallAction();
  if (mode === 'installed') return null;
  return (
    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2 text-xs">
      <p className="font-semibold">Pasang aplikasi</p>
      <p>Pasang ke layar utama agar app terbuka layar penuh tanpa bilah browser.</p>
      <button
        type="button"
        onClick={() => install()}
        className="inline-flex items-center gap-1.5 rounded-xl border border-[#246579] px-3 py-2 text-[#246579] dark:text-[#A7CDD3]"
      >
        <Download className="w-3.5 h-3.5" />
        {mode === 'prompt' ? 'Pasang Sekarang' : 'Lihat Caranya'}
      </button>
      {guide}
    </div>
  );
};
