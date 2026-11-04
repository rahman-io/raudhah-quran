/**
 * Iqro Audio Engine with Sequential Syllable Synthesis,
 * Mad Elongation, and 100% Arabic Harakat Precision.
 */

import { playHumanQariAudio, stopPronunciation } from './tajwidAudio';
import { playStitchedAudio, stopConcatenatedAudio } from './webAudioConcatenator';
import { IqroItem } from '../data/iqroData';

let activeSequentialTimer: NodeJS.Timeout | null = null;
let activeSpeechUtterance: SpeechSynthesisUtterance | null = null;
let playbackGeneration = 0;
let activeAiAudio: HTMLAudioElement | null = null;

// One speaker's labelled vowel recordings from the pronunciation dataset.
// Item 25 (nun) has only unexplained variants, so it is deliberately excluded.
const IQRO_LETTERS = Array.from('ابتثجحخدذرزسشصضطظعغفقكلمنوهي');
const VOWEL_NUMBER: Record<string, number> = { 'َ': 1, 'ِ': 2, 'ُ': 3 };

function recordedSyllableUrl(syllable: string): string | null {
  const chars = Array.from(syllable);
  if (chars.length !== 2) return null;
  const letter = ['أ', 'إ', 'ء'].includes(chars[0]) ? 'ا' : chars[0];
  const number = IQRO_LETTERS.indexOf(letter) + 1;
  const vowel = VOWEL_NUMBER[chars[1]];
  if (!number || number === 25 || !vowel) return null;
  return `/audio/iqro/verified/${number}-${vowel}.wav`;
}

export function getIqroRecordedUrls(item: IqroItem): string[] | null {
  const syllables = item.arabic.trim().split(/\s+/u).filter((part) => part !== '-' && part !== '=');
  const urls = syllables.map(recordedSyllableUrl);
  if (urls.every((url): url is string => url !== null)) return urls;
  if (item.audioUrls?.length) return item.audioUrls;
  if (item.audioUrl) {
    // An explicit recording is still useful for words; obsolete isolated
    // vowel clips must never override the labelled human recordings.
    if (!item.audioUrl.startsWith('/audio/iqro/harakat/')) return [item.audioUrl];
  }
  return null;
}

export function stopIqroAudio() {
  playbackGeneration++;
  if (activeAiAudio) {
    activeAiAudio.pause();
    activeAiAudio = null;
  }
  stopPronunciation();
  stopConcatenatedAudio();
  if (activeSequentialTimer) {
    clearTimeout(activeSequentialTimer);
    activeSequentialTimer = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  activeSpeechUtterance = null;
}

/**
 * Play a sequence of audio URLs (e.g. ["ku.mp3", "ti.mp3", "ba.mp3"])
 * stitched dynamically via Web Audio API for seamless human voice pronunciation.
 */
export function playSequentialAudio(
  urls: string[],
  speed: number = 0.85,
  onEnd?: () => void
): void {
  stopIqroAudio();
  const generation = playbackGeneration;

  if (!urls || urls.length === 0) {
    if (onEnd) onEnd();
    return;
  }

  // Use Web Audio API PCM stitching for click-free human voice concatenation
  playStitchedAudio(urls, speed, onEnd).then((success) => {
    if (!success && generation === playbackGeneration) {
      // Fallback to sequential HTML5 audio player if Web Audio decode fails
      let index = 0;
      function playNext() {
        if (generation !== playbackGeneration) return;
        if (index >= urls.length) {
          if (onEnd) onEnd();
          return;
        }
        const currentUrl = urls[index++];
        playHumanQariAudio(currentUrl, speed, () => {
          if (index < urls.length) {
            activeSequentialTimer = setTimeout(playNext, 120);
          } else if (onEnd) {
            onEnd();
          }
        });
      }
      playNext();
    }
  });
}

/**
 * Native Arabic SpeechSynthesis fallback/supplement
 * for 100% accurate Arabic harakat vocalization (A, I, U, Ba, Bi, Bu, Ku-Ti-Ba, etc.)
 */
export function speakArabicHarakat(
  text: string,
  isLong: boolean = false,
  speed: number = 0.8,
  onEnd?: () => void,
  latinHint?: string
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  try {
    window.speechSynthesis.cancel();

    // Map common arabic letters to clean phonetic latin so WebSpeech never says "alif" or "kufuwan"
    const phoneticMap: Record<string, string> = {
      'اَ': 'a', 'أَ': 'a', 'اِ': 'i', 'إِ': 'i', 'اُ': 'u', 'أُ': 'u', 'ا': 'a',
      'بَ': 'ba', 'بِ': 'bi', 'بُ': 'bu',
      'تَ': 'ta', 'تِ': 'ti', 'تُ': 'tu',
      'ثَ': 'tsa', 'ثِ': 'tsi', 'ثُ': 'tsu',
      'كُتِبَ': 'ku ti ba',
      'رُسُلُ': 'ru su lu',
    };

    const targetText = phoneticMap[text.trim()] || latinHint || text.trim();
    const utterance = new SpeechSynthesisUtterance(targetText);
    utterance.lang = 'id-ID'; // Use clean Indonesian/Global phonetic reader for exact 'a', 'i', 'u', 'ba', 'bi', 'bu'
    
    utterance.rate = isLong ? Math.max(0.5, speed * 0.7) : speed * 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      if (activeSpeechUtterance !== utterance) return;
      activeSpeechUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      if (activeSpeechUtterance !== utterance) return;
      activeSpeechUtterance = null;
      if (onEnd) onEnd();
    };

    activeSpeechUtterance = utterance;
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn('SpeechSynthesis error:', err);
    if (onEnd) onEnd();
    return false;
  }
}

/**
 * Main Iqro Item Audio Player with AI Syekh Qari & Web Audio API human voice stitching
 */
export async function playAiSyekhAudio(
  text: string,
  isLong: boolean = false,
  onEnd?: () => void
): Promise<boolean> {
  const generation = playbackGeneration;
  try {
    const res = await fetch('/api/tts/arabic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, isLong }),
    });

    if (!res.ok) {
      throw new Error(`TTS server error ${res.status}`);
    }

    const data = await res.json();
    if (generation !== playbackGeneration) return true;
    if (data.audioWavBase64) {
      const audioUrl = `data:audio/wav;base64,${data.audioWavBase64}`;
      const audio = new Audio(audioUrl);
      activeAiAudio = audio;
      audio.onended = () => {
        if (activeAiAudio !== audio) return;
        activeAiAudio = null;
        if (onEnd) onEnd();
      };
      audio.onerror = () => {
        if (activeAiAudio !== audio) return;
        activeAiAudio = null;
        if (onEnd) onEnd();
      };
      await audio.play();
      return true;
    }
  } catch (err) {
    console.warn('AI Syekh TTS error:', err);
  }
  return false;
}

export function playIqroItem(
  item: IqroItem,
  speed: number = 0.85,
  onEnd?: () => void,
  useAiVoice: boolean = true
): void {
  stopIqroAudio();
  const generation = playbackGeneration;
  const recordedUrls = getIqroRecordedUrls(item);

  // Exact recordings take priority, including multi-letter cards. AI can
  // pronounce a different word when given a short series of isolated letters.
  if (recordedUrls) {
    if (recordedUrls.length > 1) playSequentialAudio(recordedUrls, speed, onEnd);
    else playHumanQariAudio(recordedUrls[0], speed, onEnd);
    return;
  }

  // AI is optional for cards without a matching recording.
  if (useAiVoice) {
    playAiSyekhAudio(item.arabic, item.isLong, onEnd).then((success) => {
      if (!success && generation === playbackGeneration) {
        // Fall back to the displayed phonetic reading.
        playHumanFallback();
      }
    });
    return;
  }

  playHumanFallback();

  function playHumanFallback() {
    // No exact recording: use the displayed phonetic reading, never a
    // recording of a different letter or only the first part of the card.
    speakArabicHarakat(item.arabic, item.isLong, speed, onEnd, item.latin);
  }
}

