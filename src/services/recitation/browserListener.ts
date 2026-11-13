/**
 * Pendengar bacaan versi gratis: pengenal suara bawaan browser (Web Speech API, bahasa Arab).
 *
 * Game "Tantangan Bacaan" hanya memakai antarmuka `RecitationListener`, jadi nanti mesin ini
 * bisa diganti mesin server (model khusus bacaan Qur'an) tanpa mengubah tampilan gamenya.
 *
 * - Teks yang terdengar dikirim terus (termasuk hasil sementara) sebagai satu teks utuh
 *   sejak `start()` pertama, sampai `reset()`.
 * - Pengenal suara browser berhenti sendiri setelah diam sebentar (jeda waqaf); pendengar
 *   ini langsung menyambung lagi. Bila dua kali berturut-turut tidak ada suara, ia berhenti
 *   dan melapor `silent`.
 */

export interface RecitationListener {
  /** Mulai / lanjut mendengarkan (teks sebelumnya tetap disimpan). Panggil dari ketukan. */
  start: () => void;
  /** Berhenti mendengarkan. */
  stop: () => void;
  /** Lupakan teks yang sudah terdengar (mulai baru). */
  reset: () => void;
}

export interface RecitationHandlers {
  onText: (text: string) => void;
  onListening: (listening: boolean) => void;
  /** Kode galat Web Speech API, atau `silent` bila berhenti karena lama tidak ada suara. */
  onError: (code: string) => void;
}

interface RecognitionAlternative {
  transcript: string;
}
interface RecognitionResultEvent {
  results: ArrayLike<ArrayLike<RecognitionAlternative>>;
}
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
type RecognitionCtor = new () => Recognition;

const recognitionCtor = (): RecognitionCtor | null => {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

export const isBrowserRecitationSupported = () => recognitionCtor() !== null;

/** Sesi tanpa suara berturut-turut sebelum berhenti sendiri. */
const MAX_SILENT_SESSIONS = 2;
const FATAL = new Set(['not-allowed', 'service-not-allowed', 'audio-capture', 'network', 'language-not-supported']);

export function createBrowserListener(handlers: RecitationHandlers): RecitationListener {
  // Mode "continuous" di Chrome Android sering mengulang hasil; di sana tiap jeda memulai sesi baru.
  const continuous = typeof navigator !== 'undefined' && !/Android/i.test(navigator.userAgent);
  let recognition: Recognition | null = null;
  let active = false;
  let finished = '';
  let session = '';
  let sessionHadText = false;
  let silentSessions = 0;

  const emit = () => handlers.onText(`${finished} ${session}`.replace(/\s+/g, ' ').trim());

  const halt = (abort: boolean) => {
    const current = recognition;
    recognition = null;
    if (!current) return;
    current.onresult = null;
    current.onerror = null;
    current.onend = null;
    try {
      if (abort) current.abort();
      else current.stop();
    } catch {
      // sudah berhenti
    }
  };

  const closeSession = () => {
    if (session) finished = `${finished} ${session}`.trim();
    session = '';
  };

  const startSession = () => {
    const Ctor = recognitionCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = 'ar-SA';
    rec.continuous = continuous;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    sessionHadText = false;
    rec.onresult = (event) => {
      session = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? '')
        .join(' ')
        .trim();
      if (session) sessionHadText = true;
      emit();
    };
    rec.onerror = (event) => {
      if (FATAL.has(event.error)) {
        active = false;
        handlers.onError(event.error);
      }
      // no-speech / aborted: ditangani di onend.
    };
    rec.onend = () => {
      if (recognition !== rec) return;
      recognition = null;
      closeSession();
      if (!active) {
        handlers.onListening(false);
        return;
      }
      silentSessions = sessionHadText ? 0 : silentSessions + 1;
      if (silentSessions >= MAX_SILENT_SESSIONS) {
        active = false;
        handlers.onListening(false);
        handlers.onError('silent');
        return;
      }
      startSession(); // jeda waqaf: sambung lagi
    };
    recognition = rec;
    try {
      rec.start();
    } catch {
      recognition = null;
      active = false;
      handlers.onListening(false);
      handlers.onError('start-failed');
    }
  };

  return {
    start: () => {
      if (active) return;
      active = true;
      silentSessions = 0;
      handlers.onListening(true);
      startSession();
    },
    stop: () => {
      if (!active && !recognition) return;
      active = false;
      halt(false);
      closeSession();
      emit();
      handlers.onListening(false);
    },
    reset: () => {
      finished = '';
      session = '';
      // Sesi yang sedang berjalan dimulai ulang agar teks lamanya tidak terbawa.
      if (active) {
        halt(true);
        startSession();
      }
      emit();
    }
  };
}
