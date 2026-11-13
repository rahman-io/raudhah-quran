import { useCallback, useEffect, useRef, useState } from 'react';
import { openingAudio, reciterAudioUrl } from '../../data/reciters';
import { primeSpeech, speak, speechSupported } from '../../utils/speech';
import type { ReaderAyah } from '../../services/quranReaderData';

/**
 * Pemutar berurutan untuk menu Baca & Tadabbur:
 *  - "arab": murottal ayat demi ayat;
 *  - "arab_arti": murottal, lalu artinya dibacakan, lalu ayat berikutnya;
 *  - "arti": hanya artinya yang dibacakan.
 * Setiap ayat bisa diulang 1×, 3×, atau 5× sebelum lanjut.
 */

export type PlayMode = 'arab' | 'arab_arti' | 'arti';
export type RepeatCount = 1 | 3 | 5;
/** "taawudz" dan "basmalah": pembuka sebelum ayat pertama surah. */
export type PlayPart = 'taawudz' | 'basmalah' | 'arab' | 'arti';
export const isOpeningPart = (part: PlayPart) => part === 'taawudz' || part === 'basmalah';

export interface PlayerPrefs {
  mode: PlayMode;
  repeat: RepeatCount;
  /** Diawali ta'awudz dan basmalah bila diputar dari ayat pertama. */
  opening: boolean;
}

export interface PlayerState {
  status: 'idle' | 'playing' | 'paused' | 'done';
  index: number;
  part: PlayPart;
  /** Pengulangan ke berapa (mulai 0). */
  rep: number;
  /** Posisi kata terjemah yang sedang dibacakan; null bila tidak diketahui. */
  wordChar: number | null;
  /** true bila hanya satu ayat (tombol "Arti" per ayat), tidak lanjut ke ayat berikutnya. */
  single: boolean;
  /** Pembuka (ta'awudz) memakai suara qari lain karena qari terpilih tidak punya rekamannya. */
  otherVoice?: boolean;
}

const PREFS_KEY = 'raudhah_reader_player_v1';
const IDLE: PlayerState = { status: 'idle', index: 0, part: 'arab', rep: 0, wordChar: null, single: false };

function loadPrefs(): PlayerPrefs {
  try {
    const saved = JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}');
    return {
      mode: ['arab', 'arab_arti', 'arti'].includes(saved.mode) ? saved.mode : 'arab',
      repeat: [1, 3, 5].includes(saved.repeat) ? saved.repeat : 1,
      opening: saved.opening !== false
    };
  } catch {
    return { mode: 'arab', repeat: 1, opening: true };
  }
}

export function useSurahPlayer(ayahs: ReaderAyah[], reciterId: string, speed: number) {
  const [state, setState] = useState<PlayerState>(IDLE);
  const [prefs, setPrefsState] = useState<PlayerPrefs>(loadPrefs);

  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;
  const ayahsRef = useRef(ayahs);
  ayahsRef.current = ayahs;
  const settingsRef = useRef({ reciterId, speed });
  settingsRef.current = { reciterId, speed };
  const stateRef = useRef(state);
  stateRef.current = state;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopSpeechRef = useRef<() => void>(() => {});
  /** Penanda putaran; langkah dari putaran lama diabaikan. */
  const runRef = useRef(0);

  const canSpeak = speechSupported();

  const setPrefs = useCallback((next: Partial<PlayerPrefs>) => {
    setPrefsState((prev) => {
      const merged = { ...prev, ...next };
      try {
        localStorage.setItem(PREFS_KEY, JSON.stringify(merged));
      } catch {
        // penyimpanan tidak tersedia: pilihan tetap berlaku selama sesi ini
      }
      return merged;
    });
  }, []);

  const firstPart = (): PlayPart => (prefsRef.current.mode === 'arti' && canSpeak ? 'arti' : 'arab');

  const haltMedia = () => {
    audioRef.current?.pause();
    stopSpeechRef.current();
    stopSpeechRef.current = () => {};
  };

  const playUnit = useCallback((index: number, part: PlayPart, rep: number, run: number, single: boolean) => {
    if (run !== runRef.current) return;
    const ayah = ayahsRef.current[index];
    if (!ayah) {
      setState((s) => ({ ...s, status: 'done' }));
      return;
    }
    setState({ status: 'playing', index, part, rep, wordChar: null, single });

    const after = () => {
      if (run !== runRef.current) return;
      const { mode, repeat } = prefsRef.current;
      if (part === 'taawudz') {
        // Al-Fatihah: basmalah adalah ayat 1. At-Taubah: tidak diawali basmalah.
        const surah = ayahsRef.current[0]?.surahNumber;
        return playUnit(0, surah === 1 || surah === 9 ? firstPart() : 'basmalah', 0, run, false);
      }
      if (part === 'basmalah') return playUnit(0, firstPart(), 0, run, false);
      if (!single) {
        if (part === 'arab' && rep + 1 < repeat) return playUnit(index, 'arab', rep + 1, run, false);
        if (part === 'arab' && mode === 'arab_arti' && canSpeak) return playUnit(index, 'arti', 0, run, false);
        if (part === 'arti' && mode === 'arti' && rep + 1 < repeat) return playUnit(index, 'arti', rep + 1, run, false);
      }
      if (single || index + 1 >= ayahsRef.current.length) {
        setState((s) => ({ ...s, status: single ? 'idle' : 'done', wordChar: null }));
        return;
      }
      playUnit(index + 1, firstPart(), 0, run, false);
    };

    if (part !== 'arti') {
      audioRef.current ??= new Audio();
      const audio = audioRef.current;
      const { reciterId: qari, speed: rate } = settingsRef.current;
      const opening = isOpeningPart(part) ? openingAudio(qari, part as 'taawudz' | 'basmalah') : null;
      if (opening && !opening.ownVoice) setState((s) => ({ ...s, otherVoice: true }));
      const fallback = opening ? '' : ayah.audioUrl;
      const primary = opening ? opening.url : reciterAudioUrl(qari, ayah) || ayah.audioUrl;
      audio.onended = after;
      audio.onerror = () => {
        if (run !== runRef.current) return;
        // Audio qari pilihan gagal: coba audio bawaan ayat, lalu lewati bila tetap gagal.
        if (fallback && audio.src !== fallback) {
          audio.src = fallback;
          audio.playbackRate = rate;
          audio.play().catch(() => {});
          return;
        }
        after();
      };
      audio.src = primary;
      audio.playbackRate = rate;
      audio.play().catch((error: DOMException) => {
        // Diblokir browser (perlu ketukan): jeda, pengguna tinggal menekan putar lagi.
        if (run === runRef.current && error?.name === 'NotAllowedError') setState((s) => ({ ...s, status: 'paused' }));
      });
    } else {
      stopSpeechRef.current = speak(ayah.translationId, settingsRef.current.speed, {
        onWord: (wordChar) => run === runRef.current && setState((s) => ({ ...s, wordChar })),
        onEnd: after,
        onError: after
      });
    }
  }, [canSpeak]);

  /** Mulai (atau lompat ke) ayat tertentu dan lanjut berurutan. */
  const playFrom = useCallback((index: number) => {
    const run = ++runRef.current;
    haltMedia();
    const { mode, opening } = prefsRef.current;
    if (mode !== 'arab') primeSpeech();
    // Dari ayat pertama: biasakan diawali ta'awudz dan basmalah (kecuali mode "Arti saja").
    const withOpening = index === 0 && opening && mode !== 'arti';
    playUnit(index, withOpening ? 'taawudz' : firstPart(), 0, run, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playUnit]);

  /** Bacakan arti satu ayat saja (tombol "Arti"). */
  const speakArti = useCallback((index: number) => {
    const run = ++runRef.current;
    haltMedia();
    primeSpeech();
    playUnit(index, 'arti', 0, run, true);
  }, [playUnit]);

  const stop = useCallback(() => {
    runRef.current++;
    haltMedia();
    setState(IDLE);
  }, []);

  const pause = useCallback(() => {
    const s = stateRef.current;
    if (s.status !== 'playing') return;
    if (s.part !== 'arti') audioRef.current?.pause();
    else {
      stopSpeechRef.current();
      stopSpeechRef.current = () => {};
    }
    setState({ ...s, status: 'paused' });
  }, []);

  const resume = useCallback(() => {
    const s = stateRef.current;
    if (s.status === 'done') return playFrom(0);
    if (s.status !== 'paused') return;
    if (s.part !== 'arti' && audioRef.current?.src) {
      setState({ ...s, status: 'playing' });
      audioRef.current.play().catch(() => setState((p) => ({ ...p, status: 'paused' })));
    } else {
      // Pembaca teks tidak bisa dilanjutkan dari tengah dengan andal: ulangi arti ayat ini.
      primeSpeech();
      playUnit(s.index, s.part, s.rep, runRef.current, s.single);
    }
  }, [playFrom, playUnit]);

  const next = useCallback(() => {
    const s = stateRef.current;
    if (s.index + 1 < ayahsRef.current.length) playFrom(s.index + 1);
  }, [playFrom]);

  const previous = useCallback(() => {
    playFrom(Math.max(0, stateRef.current.index - 1));
  }, [playFrom]);

  // Ganti surah: hentikan.
  useEffect(() => stop, [ayahs, stop]);
  // Keluar dari menu Baca: hentikan suara.
  useEffect(() => () => {
    runRef.current++;
    audioRef.current?.pause();
    stopSpeechRef.current();
  }, []);

  const active = state.status !== 'idle';
  return { state, prefs, setPrefs, active, canSpeak, playFrom, speakArti, pause, resume, stop, next, previous };
}
