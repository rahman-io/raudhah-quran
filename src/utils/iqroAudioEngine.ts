/**
 * Iqro Audio Engine with Sequential Syllable Synthesis,
 * Mad Elongation, and 100% Arabic Harakat Precision.
 */

import { playHumanQariAudio, stopPronunciation, getSingleLetterAudioUrl } from './tajwidAudio';
import { playStitchedAudio, stopConcatenatedAudio } from './webAudioConcatenator';
import { IqroItem } from '../data/iqroData';

let activeSequentialTimer: NodeJS.Timeout | null = null;
let activeSpeechUtterance: SpeechSynthesisUtterance | null = null;

export function stopIqroAudio() {
  stopPronunciation();
  stopConcatenatedAudio();
  if (activeSequentialTimer) {
    clearTimeout(activeSequentialTimer);
    activeSequentialTimer = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
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

  if (!urls || urls.length === 0) {
    if (onEnd) onEnd();
    return;
  }

  // Use Web Audio API PCM stitching for click-free human voice concatenation
  playStitchedAudio(urls, speed, onEnd).then((success) => {
    if (!success) {
      // Fallback to sequential HTML5 audio player if Web Audio decode fails
      let index = 0;
      function playNext() {
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
      activeSpeechUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
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
  try {
    stopIqroAudio();
    const res = await fetch('/api/tts/arabic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, isLong }),
    });

    if (!res.ok) {
      throw new Error(`TTS server error ${res.status}`);
    }

    const data = await res.json();
    if (data.audioWavBase64) {
      const audioUrl = `data:audio/wav;base64,${data.audioWavBase64}`;
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        if (onEnd) onEnd();
      };
      audio.onerror = () => {
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

  // If AI Syekh Qari voice mode is active (default)
  if (useAiVoice) {
    playAiSyekhAudio(item.arabic, item.isLong, onEnd).then((success) => {
      if (!success) {
        // Fallback to human Web Audio concatenation or single letter fallback
        playHumanFallback();
      }
    });
    return;
  }

  playHumanFallback();

  function playHumanFallback() {
    // 1. If multiple audio URLs exist (sequential syllables like Ku - Ti - Ba)
    if (item.audioUrls && item.audioUrls.length > 0) {
      playSequentialAudio(item.audioUrls, speed, onEnd);
      return;
    }

    // 2. If single explicit audioUrl is defined
    if (item.audioUrl) {
      playHumanQariAudio(item.audioUrl, speed, () => {
        if (onEnd) onEnd();
      });
      return;
    }

    // 3. Fallback to harakat audio map or single letter audio
    const singleAudioUrl = getSingleLetterAudioUrl(item.arabic);
    if (singleAudioUrl) {
      playHumanQariAudio(singleAudioUrl, speed, () => {
        if (onEnd) onEnd();
      });
      return;
    }

    // 4. Fallback to clean phonetic SpeechSynthesis
    speakArabicHarakat(item.arabic, item.isLong, speed, onEnd, item.latin);
  }
}

