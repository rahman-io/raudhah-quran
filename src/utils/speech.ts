/**
 * Membacakan teks bahasa Indonesia dengan pembaca teks bawaan perangkat (Web Speech API).
 * Gratis dan tanpa internet; suaranya tergantung perangkat (mis. Google di Android, Damayanti di iPhone).
 */

export const speechSupported = (): boolean =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

const isIndonesian = (voice: SpeechSynthesisVoice) => /^(id|in)([-_]|$)/i.test(voice.lang);

function indonesianVoice(): SpeechSynthesisVoice | null {
  if (!speechSupported()) return null;
  const voices = window.speechSynthesis.getVoices().filter(isIndonesian);
  return voices.find((v) => /google/i.test(v.name)) ?? voices.find((v) => v.localService) ?? voices[0] ?? null;
}

// Daftar suara di sebagian browser baru tersedia setelah event "voiceschanged".
if (speechSupported()) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', () => window.speechSynthesis.getVoices());
}

/**
 * Panggil langsung di dalam ketukan pengguna sebelum rangkaian pemutaran dimulai.
 * iPhone/iPad hanya mengizinkan suara bila pembacaan pertama dipicu oleh ketukan.
 */
export function primeSpeech() {
  if (!speechSupported()) return;
  const utterance = new SpeechSynthesisUtterance(' ');
  utterance.volume = 0;
  utterance.lang = 'id-ID';
  window.speechSynthesis.speak(utterance);
}

/**
 * Pecah teks per kalimat (dan per koma bila terlalu panjang): sebagian browser
 * berhenti sendiri bila satu ucapan lebih dari ±15 detik.
 */
function chunk(text: string, max = 180): { text: string; offset: number }[] {
  const parts: { text: string; offset: number }[] = [];
  const pattern = /[^.!?;]+[.!?;]*["”']?\s*/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    let piece = match[0];
    let offset = match.index;
    while (piece.length > max) {
      const cut = Math.max(piece.lastIndexOf(', ', max), piece.lastIndexOf(' ', max));
      const at = cut > 40 ? cut + 1 : max;
      parts.push({ text: piece.slice(0, at), offset });
      piece = piece.slice(at);
      offset += at;
    }
    if (piece.trim()) parts.push({ text: piece, offset });
  }
  return parts.length ? parts : [{ text, offset: 0 }];
}

/**
 * Perkiraan lama tiap kata untuk perangkat yang tidak mengirim event "boundary"
 * (mis. Chrome di Android): ± 14,5 huruf per detik pada kecepatan normal,
 * ditambah jeda singkat setelah tanda baca.
 */
const CHARS_PER_SECOND = 14.5;
const BOUNDARY_WAIT_MS = 450;

function wordSchedule(text: string, rate: number) {
  const words: { start: number; at: number }[] = [];
  const pattern = /\S+/g;
  let elapsed = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    words.push({ start: match.index, at: elapsed });
    const word = match[0];
    let ms = ((word.length + 1) / (CHARS_PER_SECOND * rate)) * 1000;
    if (/[.!?;:]["”')]*$/.test(word)) ms += 380 / rate;
    else if (/[,)]["”']*$/.test(word)) ms += 220 / rate;
    elapsed += ms;
  }
  return words;
}

export interface SpeakHandlers {
  /** Posisi karakter (dalam teks asli) dari kata yang sedang dibacakan. */
  onWord?: (charIndex: number) => void;
  onEnd?: () => void;
  onError?: () => void;
}

/** Bacakan teks; kembalikan fungsi untuk menghentikannya. */
export function speak(text: string, rate: number, handlers: SpeakHandlers): () => void {
  if (!speechSupported()) {
    handlers.onError?.();
    return () => {};
  }
  const synth = window.speechSynthesis;
  // Nomor di awal terjemah (mis. "1. Ṣād, …") tidak ikut dibacakan.
  const lead = text.match(/^\s*\d+\.\s*/)?.[0].length ?? 0;
  const chunks = chunk(text.slice(lead)).map((c) => ({ ...c, offset: c.offset + lead }));
  const voice = indonesianVoice();
  let cancelled = false;
  let index = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  // Mode perkiraan dipakai bila perangkat tidak mengirim posisi kata.
  let realBoundaries = false;
  let estimating = false;
  let estimateTimers: ReturnType<typeof setTimeout>[] = [];
  const clearEstimate = () => {
    estimateTimers.forEach(clearTimeout);
    estimateTimers = [];
  };
  const startEstimate = (part: string, offset: number, startedAt: number) => {
    clearEstimate();
    const elapsed = Date.now() - startedAt;
    for (const word of wordSchedule(part, rate)) {
      estimateTimers.push(setTimeout(() => {
        if (!cancelled && !realBoundaries) handlers.onWord?.(offset + word.start);
      }, Math.max(0, word.at - elapsed)));
    }
  };

  const next = () => {
    if (cancelled) return;
    if (index >= chunks.length) {
      handlers.onEnd?.();
      return;
    }
    const { text: part, offset } = chunks[index++];
    const utterance = new SpeechSynthesisUtterance(part);
    utterance.lang = voice?.lang ?? 'id-ID';
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.onstart = () => {
      if (cancelled) return;
      handlers.onWord?.(offset);
      if (realBoundaries) return;
      const startedAt = Date.now();
      if (estimating) {
        startEstimate(part, offset, startedAt);
        return;
      }
      // Tunggu sebentar: bila tidak ada posisi kata dari perangkat, pakai perkiraan.
      estimateTimers.push(setTimeout(() => {
        if (cancelled || realBoundaries) return;
        estimating = true;
        startEstimate(part, offset, startedAt);
      }, BOUNDARY_WAIT_MS));
    };
    utterance.onboundary = (event) => {
      if (cancelled || (event.name !== undefined && event.name !== 'word')) return;
      realBoundaries = true;
      estimating = false;
      clearEstimate();
      handlers.onWord?.(offset + event.charIndex);
    };
    utterance.onend = () => {
      clearEstimate();
      next();
    };
    utterance.onerror = (event) => {
      clearEstimate();
      if (cancelled || event.error === 'interrupted' || event.error === 'canceled') return;
      cancelled = true;
      handlers.onError?.();
    };
    synth.speak(utterance);
  };

  synth.cancel();
  // Jeda singkat: di Chrome, speak() tepat setelah cancel() kadang diabaikan.
  timer = setTimeout(next, 80);

  return () => {
    cancelled = true;
    clearTimeout(timer);
    clearEstimate();
    synth.cancel();
  };
}
