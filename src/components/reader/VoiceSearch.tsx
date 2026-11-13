import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { BookOpen, ChevronRight, Loader2, Mic, Square, X } from 'lucide-react';
import { loadKemenagSurah } from '../../services/quranReaderData';
import { arabicSkeletonWithMap } from '../../services/arabicSkeleton';
import { loadVoiceIndex, MIN_QUERY_LETTERS, searchByRecitation, voiceQueryLength, type VoiceMatch } from '../../services/voiceSearch';
import { useBackHandler } from '../../utils/backNavigation';

/**
 * Cari ayat dengan suara: pengguna membacakan potongan ayat, pengenal suara bawaan
 * browser (Web Speech API, bahasa Arab) mengubahnya menjadi teks, lalu teks itu
 * dicocokkan ke seluruh ayat (services/voiceSearch.ts). Tanpa server sendiri.
 */

interface SurahMeta {
  number: number;
  nameLatin: string;
}

// Web Speech API belum ada di tipe bawaan TypeScript: cukup bagian yang dipakai.
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

const ERROR_TEXT: Record<string, string> = {
  'not-allowed': 'Izin mikrofon ditolak. Izinkan mikrofon untuk situs ini di pengaturan browser, lalu coba lagi.',
  'service-not-allowed': 'Izin mikrofon ditolak. Izinkan mikrofon untuk situs ini di pengaturan browser, lalu coba lagi.',
  'no-speech': 'Suara belum terdengar. Ketuk mikrofon, lalu bacakan potongan ayat.',
  'audio-capture': 'Mikrofon tidak ditemukan di perangkat ini.',
  network: 'Pengenal suara butuh koneksi internet. Periksa koneksi, lalu coba lagi.',
  'language-not-supported': 'Pengenal suara di perangkat ini belum mendukung bahasa Arab.'
};

const FIRST_RESULTS = 5;
const MORE_RESULTS = 20;
const ayahKey = (surah: number, ayah: number) => `${surah}:${ayah}`;

/** Potongan ayat di sekitar bagian yang cocok, dengan kata-kata yang cocok disorot. */
function MatchedArabic({ text, match }: { text: string; match: VoiceMatch }) {
  const { positions } = arabicSkeletonWithMap(text);
  if (!positions.length) return <>{text}</>;
  // Perlebar ke batas kata agar sorotan tidak memotong kata.
  let from = positions[Math.min(match.start, positions.length - 1)];
  let to = match.end < positions.length ? positions[match.end] : text.length;
  from = text.lastIndexOf(' ', from) + 1;
  const space = text.indexOf(' ', Math.max(from, to - 1));
  to = space === -1 ? text.length : space;
  let before = text.slice(0, from);
  let after = text.slice(to);
  if (before.length > 70) before = `… ${before.slice(before.indexOf(' ', before.length - 50) + 1)}`;
  if (after.length > 90) after = `${after.slice(0, after.lastIndexOf(' ', 80))} …`;
  return (
    <>
      {before}
      <mark className="bg-[#D3A253]/30 text-inherit rounded-md px-0.5">{text.slice(from, to)}</mark>
      {after}
    </>
  );
}

export const VoiceSearchButton: React.FC<{
  surahs: SurahMeta[];
  onOpen: (surah: number, ayah: number) => void;
}> = ({ surahs, onOpen }) => {
  const [supported] = useState(() => recognitionCtor() !== null);
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [index, setIndex] = useState<Awaited<ReturnType<typeof loadVoiceIndex>> | null>(null);
  const [indexError, setIndexError] = useState(false);
  const [limit, setLimit] = useState(FIRST_RESULTS);
  const [texts, setTexts] = useState<Record<string, string>>({});
  const recognitionRef = useRef<Recognition | null>(null);

  const stopListening = (abort = false) => {
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (!recognition) return;
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
    try {
      if (abort) recognition.abort();
      else recognition.stop();
    } catch {
      // sudah berhenti
    }
    setListening(false);
  };

  const prepareIndex = () => {
    if (index) return;
    setIndexError(false);
    loadVoiceIndex()
      .then(setIndex)
      .catch(() => setIndexError(true));
  };

  // Dipanggil langsung dari ketukan (beberapa browser hanya mengizinkan mikrofon dari ketukan).
  const startListening = () => {
    const Ctor = recognitionCtor();
    if (!Ctor) return;
    stopListening(true);
    prepareIndex();
    setError(null);
    setHeard(false);
    setLimit(FIRST_RESULTS);
    const recognition = new Ctor();
    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    recognition.onresult = (event) => {
      const results = Array.from(event.results);
      setTranscript(results.map((result) => result[0]?.transcript ?? '').join(' ').replace(/\s+/g, ' ').trim());
      setAlternatives(results.length === 1 ? Array.from(results[0]).slice(1).map((alt) => alt.transcript) : []);
      setHeard(true);
    };
    recognition.onerror = (event) => {
      if (event.error === 'aborted') return;
      setError(ERROR_TEXT[event.error] ?? 'Pengenal suara sedang bermasalah. Coba lagi sebentar lagi.');
    };
    recognition.onend = () => {
      if (recognitionRef.current === recognition) recognitionRef.current = null;
      setListening(false);
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
      setTranscript('');
      setAlternatives([]);
    } catch {
      recognitionRef.current = null;
      setError('Pengenal suara belum bisa dimulai. Coba lagi.');
    }
  };

  const openSheet = () => {
    setOpen(true);
    startListening();
  };

  const close = () => {
    stopListening(true);
    setOpen(false);
  };
  useBackHandler(open, close, 10);
  useEffect(() => () => stopListening(true), []);

  const queryLength = voiceQueryLength(transcript);
  const results = useMemo(
    () => (index && queryLength >= MIN_QUERY_LETTERS ? searchByRecitation(index, [transcript, ...alternatives], MORE_RESULTS) : []),
    [index, transcript, alternatives, queryLength]
  );
  const shown = results.slice(0, limit);

  // Teks Arab ayat yang tampil (dari berkas Kemenag per surah).
  useEffect(() => {
    let cancelled = false;
    const missing = [...new Set(shown.filter((m) => !texts[ayahKey(m.surah, m.ayah)]).map((m) => m.surah))];
    missing.forEach((surah) =>
      loadKemenagSurah(surah)
        .then((map) => {
          if (cancelled || !map) return;
          setTexts((prev) => {
            const next = { ...prev };
            map.forEach((text, ayah) => (next[ayahKey(surah, ayah)] = text));
            return next;
          });
        })
        .catch(() => undefined)
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown.map((m) => ayahKey(m.surah, m.ayah)).join(',')]);

  const choose = (match: VoiceMatch) => {
    close();
    onOpen(match.surah, match.ayah);
  };

  if (!supported) return null;

  const surahName = (n: number) => surahs.find((s) => s.number === n)?.nameLatin ?? `Surah ${n}`;
  const finished = !listening && heard;
  let status: string;
  if (error) status = error;
  else if (listening) status = transcript ? 'Mendengarkan…' : 'Mendengarkan… bacakan potongan ayat';
  else if (!transcript) status = 'Ketuk mikrofon, lalu bacakan 3 kata atau lebih dari ayat yang dicari.';
  else if (queryLength < MIN_QUERY_LETTERS) status = 'Bacaan terlalu pendek. Coba bacakan minimal 3 kata.';
  else if (indexError) status = 'Data pencarian belum bisa dimuat. Periksa koneksi, lalu coba lagi.';
  else if (!index) status = 'Menyiapkan pencarian…';
  else if (!results.length) status = 'Belum ada ayat yang cocok. Coba bacakan lebih jelas atau lebih panjang, atau perbaiki teksnya.';
  else status = `${results.length >= MORE_RESULTS ? `${MORE_RESULTS}+` : results.length} ayat paling mirip`;

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
        className="p-1 rounded-full text-[#477F8D] hover:text-[#246579] hover:bg-slate-100 dark:hover:bg-slate-700 shrink-0"
        aria-label="Cari ayat dengan suara"
        title="Cari ayat dengan suara"
      >
        <Mic className="w-4 h-4" />
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-6" role="dialog" aria-modal="true" aria-label="Cari ayat dengan suara">
            <motion.div className="absolute inset-0 bg-[#0B1F27]/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={close} />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="relative w-full sm:max-w-md max-h-[85vh] flex flex-col bg-[#FBF8F2] dark:bg-[#152E38] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-700">
                <h2 className="flex-1 min-w-0 text-base font-bold text-[#173B4E] dark:text-white">Cari ayat dengan suara</h2>
                <button type="button" onClick={close} className="p-2 rounded-xl text-slate-500 hover:bg-white dark:hover:bg-slate-700" aria-label="Tutup">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 space-y-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                <div className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={() => (listening ? stopListening() : startListening())}
                    className={`relative w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition-colors ${
                      listening ? 'bg-[#C0563F]' : 'bg-[#246579] hover:bg-[#1D5466]'
                    }`}
                    aria-label={listening ? 'Berhenti mendengarkan' : 'Mulai mendengarkan'}
                  >
                    {listening && <span className="absolute inset-0 rounded-full bg-[#C0563F]/40 animate-ping" />}
                    {listening ? <Square className="relative w-7 h-7 fill-current" /> : <Mic className="relative w-8 h-8" />}
                  </button>
                  <p
                    className={`text-center text-xs leading-relaxed min-h-[2.5em] ${error ? 'text-amber-700 dark:text-amber-300' : 'text-[#477F8D] dark:text-[#94A3B8]'}`}
                    aria-live="polite"
                  >
                    {status}
                  </p>
                </div>

                {(transcript || finished) && (
                  <label className="block">
                    <span className="block mb-1 text-[11px] font-semibold text-[#477F8D] dark:text-[#94A3B8]">Yang terdengar (bisa diperbaiki)</span>
                    <textarea
                      rows={2}
                      dir="rtl"
                      lang="ar"
                      value={transcript}
                      onChange={(event) => {
                        stopListening();
                        setTranscript(event.target.value);
                        setAlternatives([]);
                        setLimit(FIRST_RESULTS);
                      }}
                      className="w-full px-4 py-2 resize-none rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-arabic text-xl leading-normal text-[#173B4E] dark:text-white outline-none focus:border-[#246579] focus:ring-2 focus:ring-[#246579]/15"
                      aria-label="Teks bacaan yang terdengar"
                    />
                  </label>
                )}

                {shown.length > 0 && (
                  <div className="space-y-2">
                    {shown.map((match) => {
                      const text = texts[ayahKey(match.surah, match.ayah)];
                      const percent = Math.round(match.score * 100);
                      return (
                        <button
                          key={ayahKey(match.surah, match.ayah)}
                          type="button"
                          onClick={() => choose(match)}
                          className="w-full text-left p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-[#477F8D]/50 transition-colors"
                        >
                          <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#246579] dark:text-[#A7CDD3]">
                            <BookOpen className="w-3.5 h-3.5 text-[#D3A253] shrink-0" />
                            <span className="flex-1 min-w-0 truncate">
                              QS. {surahName(match.surah)} : {match.ayah}
                              {match.toAyah !== match.ayah && `–${match.toAyah}`}
                            </span>
                            <span
                              className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] ${
                                percent >= 85 ? 'bg-[#246579]/10 text-[#246579] dark:text-[#A7CDD3]' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                              }`}
                            >
                              {percent}% mirip
                            </span>
                            <ChevronRight className="w-4 h-4 shrink-0 text-slate-400" />
                          </span>
                          <span dir="rtl" lang="ar" className="mt-1.5 block font-mushaf-id text-xl text-right text-[#173B4E] dark:text-[#E2E8F0]">
                            {text ? <MatchedArabic text={text} match={match} /> : <Loader2 className="inline w-4 h-4 animate-spin text-[#477F8D]" />}
                          </span>
                        </button>
                      );
                    })}
                    {results.length > limit && (
                      <button
                        type="button"
                        onClick={() => setLimit(MORE_RESULTS)}
                        className="w-full py-2.5 rounded-2xl text-xs font-semibold text-[#246579] dark:text-[#A7CDD3] bg-[#246579]/5 hover:bg-[#246579]/10"
                      >
                        Tampilkan {results.length - limit} ayat lain yang mirip
                      </button>
                    )}
                  </div>
                )}

                {!transcript && !error && (
                  <p className="text-center text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
                    Suara diubah menjadi teks oleh pengenal suara bawaan browser (Google/Apple).
                  </p>
                )}
              </div>
            </motion.div>
          </div>,
          document.body
        )}
    </>
  );
};
