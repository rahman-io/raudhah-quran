/**
 * Web Audio API Seamless Concatenation Engine
 * 
 * Stitches individual human phoneme / harakat PCM AudioBuffers into a single,
 * natural, click-free continuous AudioBuffer with crossfading and boundary smoothing.
 * Provides 100% natural human voice playback without robotic AI artifacts.
 */

import { assetUrl } from './assetUrl';

let audioCtx: AudioContext | null = null;
const bufferCache = new Map<string, AudioBuffer>();
let activeSourceNode: AudioBufferSourceNode | null = null;
let playbackGeneration = 0;

/**
 * Get or initialize Web Audio Context singleton.
 */
export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioCtxClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Fetch and decode an audio file into an AudioBuffer with in-memory caching.
 */
export async function fetchAndDecodeAudio(url: string): Promise<AudioBuffer | null> {
  if (bufferCache.has(url)) {
    return bufferCache.get(url)!;
  }

  try {
    const ctx = getAudioContext();
    const response = await fetch(assetUrl(url));
    if (!response.ok) {
      console.warn(`Failed to fetch audio file from ${url}: ${response.statusText}`);
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    bufferCache.set(url, audioBuffer);
    return audioBuffer;
  } catch (err) {
    console.error(`Error decoding audio buffer for ${url}:`, err);
    return null;
  }
}

/**
 * Stop any currently playing concatenated audio.
 */
export function stopConcatenatedAudio(): void {
  playbackGeneration++;
  if (activeSourceNode) {
    try {
      activeSourceNode.stop();
      activeSourceNode.disconnect();
    } catch {
      // Ignore if already stopped
    }
    activeSourceNode = null;
  }
}

/**
 * Dynamically concatenate multiple audio URLs into a single continuous AudioBuffer.
 * Applies 10ms linear crossfade and optional gap between phonemes for seamless human speech.
 * 
 * @param urls Array of MP3 URLs to stitch (e.g. ['/audio/iqro/harakat/ku.mp3', '/audio/iqro/harakat/ti.mp3', '/audio/iqro/harakat/ba.mp3'])
 * @param gapMs Interval gap in milliseconds between phonemes (default: 40ms for natural speech flow)
 */
export async function concatenateAudioUrls(
  urls: string[],
  gapMs: number = 40
): Promise<AudioBuffer | null> {
  if (!urls || urls.length === 0) return null;

  // Fetch all buffers in parallel
  const buffers = await Promise.all(urls.map((url) => fetchAndDecodeAudio(url)));
  // A partial sequence would teach the wrong reading; let the caller fall back.
  if (buffers.some((buffer) => buffer === null)) return null;
  const validBuffers = buffers.filter((b): b is AudioBuffer => b !== null);

  if (validBuffers.length === 0) return null;
  if (validBuffers.length === 1) return validBuffers[0];

  const ctx = getAudioContext();
  const sampleRate = validBuffers[0].sampleRate;
  const numChannels = validBuffers[0].numberOfChannels;
  const gapSamples = Math.floor((sampleRate * gapMs) / 1000);
  const fadeDuration = 0.008; // 8ms fade to avoid clicks at boundaries
  const fadeSamples = Math.floor(sampleRate * fadeDuration);

  // Calculate total sample length
  let totalLength = 0;
  for (let i = 0; i < validBuffers.length; i++) {
    totalLength += validBuffers[i].length;
    if (i < validBuffers.length - 1) {
      totalLength += gapSamples;
    }
  }

  // Create combined target AudioBuffer
  const combinedBuffer = ctx.createBuffer(numChannels, totalLength, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const outputData = combinedBuffer.getChannelData(channel);
    let offset = 0;

    for (let i = 0; i < validBuffers.length; i++) {
      const buffer = validBuffers[i];
      // Safely read channel data (fallback to channel 0 if mono vs stereo)
      const inputData = buffer.getChannelData(channel < buffer.numberOfChannels ? channel : 0);

      for (let j = 0; j < inputData.length; j++) {
        let sample = inputData[j];

        // Apply fade-in at the start of each phoneme
        if (j < fadeSamples) {
          sample *= j / fadeSamples;
        }

        // Apply fade-out at the end of each phoneme
        if (j > inputData.length - fadeSamples) {
          sample *= (inputData.length - j) / fadeSamples;
        }

        outputData[offset + j] = sample;
      }

      offset += inputData.length + gapSamples;
    }
  }

  return combinedBuffer;
}

/**
 * Play a sequence of audio URLs stitched seamlessly via Web Audio API.
 */
export async function playStitchedAudio(
  urls: string[],
  speed: number = 1.0,
  onEnd?: () => void
): Promise<boolean> {
  stopConcatenatedAudio();
  const generation = playbackGeneration;

  const combinedBuffer = await concatenateAudioUrls(urls, 35);
  if (generation !== playbackGeneration) return true;
  if (!combinedBuffer) {
    return false;
  }

  try {
    const ctx = getAudioContext();
    const source = ctx.createBufferSource();
    source.buffer = combinedBuffer;
    source.playbackRate.value = speed;

    source.connect(ctx.destination);

    source.onended = () => {
      if (activeSourceNode !== source) return;
      activeSourceNode = null;
      if (onEnd) onEnd();
    };

    activeSourceNode = source;
    source.start(0);
    return true;
  } catch (err) {
    console.error('Error playing stitched Web Audio:', err);
    return false;
  }
}
