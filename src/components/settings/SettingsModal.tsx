import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Volume2, VolumeX, Sparkles, Type, Sliders, RefreshCw, Moon, Sun, Check, Mic, Play, Pause } from 'lucide-react';
import { useQuranGame } from '../../context/QuranGameContext';
import { sounds } from '../../utils/soundEffects';
import { RECITERS } from '../../data/reciters';

/** Contoh suara qari: Al-Fatihah ayat 2. */
const SAMPLE_AYAH = { surahNumber: 1, ayahNumber: 2, globalAyahNumber: 2 };

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    mode,
    setMode,
    fontSize,
    setFontSize,
    soundEnabled,
    toggleSound,
    reciterSpeed,
    setReciterSpeed,
    reciterId,
    setReciterId,
    pauseMurottal,
    firebaseConfigured,
    firebaseUser,
    syncStatus,
    signIn,
    signOut,
    resetProgress
  } = useQuranGame();

  // Pratinjau suara qari di dalam pengaturan
  const previewRef = useRef<HTMLAudioElement | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const stopPreview = () => {
    previewRef.current?.pause();
    setPreviewId(null);
  };

  const togglePreview = (id: string) => {
    if (previewId === id) {
      stopPreview();
      return;
    }
    const reciter = RECITERS.find((r) => r.id === id);
    if (!reciter) return;
    pauseMurottal();
    previewRef.current ??= new Audio();
    const audio = previewRef.current;
    audio.pause();
    audio.src = reciter.url(SAMPLE_AYAH);
    audio.onended = () => setPreviewId(null);
    audio.onerror = () => setPreviewId(null);
    setPreviewId(id);
    audio.play().catch(() => setPreviewId(null));
  };

  useEffect(() => {
    if (!isOpen) stopPreview();
  }, [isOpen]);

  useEffect(() => () => previewRef.current?.pause(), []);

  const handleResetData = async () => {
    if (window.confirm('Apakah Anda yakin ingin mereset seluruh progres hafalan dan poin? Tindakan ini tidak dapat dibatalkan.')) {
      try {
        await resetProgress();
      } catch (error) {
        window.alert(`Gagal menghapus progres dari Firebase: ${String(error)}`);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="settings_modal_overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <motion.div
            key="settings_modal_dialog"
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#F8F6F1] dark:bg-[#1E293B] border border-[#477F8D]/40 rounded-3xl p-6 shadow-xl text-[#293640] dark:text-[#E2E8F0] space-y-5"
          >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#246579]/10 dark:bg-[#246579]/30 text-[#246579] dark:text-[#477F8D]">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#293640] dark:text-white">
                  Pengaturan Aplikasi
                </h3>
                <p className="text-[11px] text-[#246579] dark:text-[#94A3B8]">
                  Sesuaikan kenyamanan membaca dan belajar
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#246579] dark:text-[#94A3B8] block">
              Pilihan Mode Pengguna:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  sounds.playWordClick();
                  setMode('ceria');
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  mode === 'ceria'
                    ? 'border-[#246579] bg-white dark:bg-slate-800 ring-2 ring-[#246579]/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg">🐣</span>
                  {mode === 'ceria' && <Check className="w-4 h-4 text-[#246579]" />}
                </div>
                <p className="font-bold text-xs text-[#293640] dark:text-white">Mode Ceria</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Anak & Remaja · Maskot Hud-hud & XP
                </p>
              </button>

              <button
                onClick={() => {
                  sounds.playWordClick();
                  setMode('sakinah');
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  mode === 'sakinah'
                    ? 'border-[#BE9452] bg-white dark:bg-slate-800 ring-2 ring-[#BE9452]/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg">🏮</span>
                  {mode === 'sakinah' && <Check className="w-4 h-4 text-[#BE9452]" />}
                </div>
                <p className="font-bold text-xs text-[#293640] dark:text-white">Mode Sakinah</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Dewasa & Lansia · Tenang & Huruf Besar
                </p>
              </button>
            </div>
          </div>

          {/* Arabic Font Size Control (Crucial for elderly!) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#246579] dark:text-[#94A3B8] flex items-center gap-1.5">
                <Type className="w-4 h-4" />
                <span>Ukuran Teks Arab:</span>
              </span>
              <span className="font-bold tabular-nums text-[#173B4E] dark:text-white">{fontSize}px</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setFontSize(Math.max(fontSize - 4, 24))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                A-
              </button>

              <input
                type="range"
                min="24"
                max="44"
                step="2"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-[#246579] cursor-pointer"
              />

              <button
                onClick={() => setFontSize(Math.min(fontSize + 4, 44))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                A+
              </button>
            </div>

            {/* Arabic Sample Preview */}
            <div className="p-3 bg-[#F1EDE6] dark:bg-slate-900 rounded-xl text-center overflow-x-hidden">
              <p
                className="font-arabic text-[#173B4E] dark:text-[#D3A253] truncate"
                style={{ fontSize: `${fontSize}px` }}
              >
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
            </div>
          </div>

          {/* Reciter Speed & Sound */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
            {/* Pilihan Qari */}
            <div className="space-y-2">
              <span className="font-semibold text-[#246579] dark:text-[#94A3B8] flex items-center gap-1.5">
                <Mic className="w-4 h-4" />
                <span>Suara Qari (Murottal):</span>
              </span>
              <div
                role="radiogroup"
                aria-label="Pilih suara qari"
                className="max-h-56 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700"
              >
                {RECITERS.map((reciter) => {
                  const selected = reciter.id === reciterId;
                  const previewing = previewId === reciter.id;
                  return (
                    <div key={reciter.id} className={`flex items-center gap-2 px-3 py-2 ${selected ? 'bg-[#246579]/5 dark:bg-[#246579]/20' : ''}`}>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => {
                          sounds.playWordClick();
                          setReciterId(reciter.id);
                        }}
                        className="flex-1 min-w-0 flex items-center gap-2 text-left"
                      >
                        <span
                          className={`w-4 h-4 shrink-0 rounded-full border flex items-center justify-center ${
                            selected ? 'border-[#246579] bg-[#246579] text-white' : 'border-slate-300 dark:border-slate-500'
                          }`}
                        >
                          {selected && <Check className="w-3 h-3" />}
                        </span>
                        <span className="min-w-0">
                          <span className={`block truncate font-semibold ${selected ? 'text-[#173B4E] dark:text-white' : 'text-[#293640] dark:text-slate-200'}`}>
                            {reciter.name}
                          </span>
                          <span className="block truncate text-[10px] text-slate-500 dark:text-slate-400">{reciter.note}</span>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => togglePreview(reciter.id)}
                        className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
                          previewing ? 'bg-[#D3A253] text-[#173B4E]' : 'bg-slate-100 dark:bg-slate-700 text-[#246579] dark:text-slate-200 hover:bg-slate-200'
                        }`}
                        aria-label={previewing ? `Hentikan contoh suara ${reciter.name}` : `Dengar contoh suara ${reciter.name}`}
                        title={previewing ? 'Hentikan' : 'Dengar contoh (Al-Fatihah: 2)'}
                      >
                        {previewing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Dipakai untuk semua tombol putar murottal. Tekan ▶ untuk mendengar contoh.
              </p>
            </div>

            {/* Audio Speed */}
            <div className="flex items-center justify-between">
              <span className="font-medium text-[#246579] dark:text-[#94A3B8]">
                Kecepatan Bacaan Murottal:
              </span>
              <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setReciterSpeed(0.8)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    reciterSpeed === 0.8
                      ? 'bg-[#246579] text-white'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  0.8x (Perlahan)
                </button>
                <button
                  onClick={() => setReciterSpeed(1.0)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    reciterSpeed === 1.0
                      ? 'bg-[#246579] text-white'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  1.0x (Normal)
                </button>
              </div>
            </div>

            {/* Sound Effects Toggle */}
            <div className="flex items-center justify-between">
              <span className="font-medium text-[#246579] dark:text-[#94A3B8]">
                Efek Suara Mikro (SFX):
              </span>
              <button
                onClick={toggleSound}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold transition-colors ${
                  soundEnabled
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{soundEnabled ? 'Aktif' : 'Mati'}</span>
              </button>
            </div>
          </div>

          {/* Firebase account and progress sync */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <p className="font-semibold">Sinkronisasi progres</p>
            <p>{!firebaseConfigured ? 'Firebase belum dihubungkan. Progres tersimpan di perangkat ini.' : firebaseUser
              ? `${firebaseUser.email || 'Akun Google'} · ${syncStatus === 'synced' ? 'Tersinkron' : syncStatus === 'error' ? 'Gagal sinkronisasi' : 'Menghubungkan…'}`
              : 'Masuk dengan Google agar progres tersedia di perangkat lain.'}</p>
            {firebaseConfigured && <button className="rounded-xl border border-[#246579] px-3 py-2 text-[#246579]" onClick={() => {
              (firebaseUser ? signOut() : signIn()).catch((error) => window.alert(`Akun Firebase: ${String(error)}`));
            }}>{firebaseUser ? 'Keluar dari Google' : 'Masuk dengan Google'}</button>}
          </div>
          {/* Reset Progress */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={handleResetData}
              className="flex items-center gap-1.5 text-[11px] text-red-600 dark:text-red-400 hover:underline mx-auto font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Seluruh Data & Hafalan</span>
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
};
