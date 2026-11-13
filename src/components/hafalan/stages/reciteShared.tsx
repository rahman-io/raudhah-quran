import React, { useEffect, useRef, useState } from 'react';
import { Mic, Square } from 'lucide-react';
import { createBrowserListener, type RecitationListener } from '../../../services/recitation/browserListener';

/** Bagian bersama game 9 "Tantangan Bacaan" (mode Tantangan & Latihan bebas). */

export const RECITE_ERROR_TEXT: Record<string, string> = {
  'not-allowed': 'Izin mikrofon ditolak. Izinkan mikrofon untuk situs ini di pengaturan browser, lalu coba lagi.',
  'service-not-allowed': 'Izin mikrofon ditolak. Izinkan mikrofon untuk situs ini di pengaturan browser, lalu coba lagi.',
  'audio-capture': 'Mikrofon tidak ditemukan di perangkat ini.',
  network: 'Pengenal suara butuh koneksi internet. Periksa koneksi, lalu coba lagi.',
  'language-not-supported': 'Pengenal suara di perangkat ini belum mendukung bahasa Arab.',
  silent: 'Mikrofon berhenti karena suara tidak terdengar. Ketuk mikrofon untuk melanjutkan.',
  'start-failed': 'Mikrofon belum bisa dimulai. Coba ketuk lagi.'
};

const errorText = (code: string) => RECITE_ERROR_TEXT[code] ?? 'Pengenal suara sedang bermasalah. Coba lagi sebentar lagi.';

/** Pendengar bacaan untuk satu layar game: status mendengar, teks yang terdengar, dan galat. */
export function useRecitation() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<RecitationListener | null>(null);
  const listener = () => {
    ref.current ??= createBrowserListener({
      onText: setTranscript,
      onListening: setListening,
      onError: (code) => setError(errorText(code))
    });
    return ref.current;
  };
  useEffect(() => () => ref.current?.stop(), []);
  return {
    listening,
    transcript,
    error,
    start: () => {
      setError(null);
      listener().start();
    },
    stop: () => ref.current?.stop(),
    /** Lupakan bacaan sebelumnya; tetap mendengarkan bila mikrofon sedang menyala. */
    reset: () => {
      ref.current?.reset();
      setTranscript('');
    }
  };
}

export const MicButton: React.FC<{ listening: boolean; onClick: () => void; size?: 'md' | 'lg' }> = ({ listening, onClick, size = 'md' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative ${size === 'lg' ? 'w-20 h-20' : 'w-16 h-16'} rounded-full flex items-center justify-center text-white shadow-lg transition-colors ${
      listening ? 'bg-[#C0563F]' : 'bg-[#246579] hover:bg-[#1D5466]'
    }`}
    aria-label={listening ? 'Jeda mendengarkan' : 'Mulai membaca'}
  >
    {listening && <span className="absolute inset-0 rounded-full bg-[#C0563F]/40 animate-ping" />}
    {listening ? <Square className="relative w-6 h-6 fill-current" /> : <Mic className="relative w-7 h-7" />}
  </button>
);
