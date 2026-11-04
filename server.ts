import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Audio Cache for AI Syekh Recitation
const ttsAudioCache = new Map<string, string>();

function formatArabicPhoneticPrompt(rawText: string, isLong: boolean = false): string {
  const text = rawText.trim();

  // Explicit phonetic overrides for single harakat letters to avoid Gemini spelling letter names
  const harakatMap: Record<string, string> = {
    'اَ': "Say only the short Arabic vowel sound 'A' as in 'Alhamdu'. Do NOT say the alphabet name 'Alif' or 'Fathah'. Just say 'A'.",
    'أَ': "Say only the short Arabic vowel sound 'A' as in 'Alhamdu'. Do NOT say 'Alif' or 'Fathah'. Just say 'A'.",
    'اِ': "Say only the short Arabic vowel sound 'I' as in 'Iyyaka'. Do NOT say 'Alif' or 'Kasrah'. Just say 'I'.",
    'إِ': "Say only the short Arabic vowel sound 'I' as in 'Iyyaka'. Do NOT say 'Alif' or 'Kasrah'. Just say 'I'.",
    'اُ': "Say only the short Arabic vowel sound 'U' as in 'Uskun'. Do NOT say 'Alif' or 'Dhammah'. Just say 'U'.",
    'أُ': "Say only the short Arabic vowel sound 'U' as in 'Uskun'. Do NOT say 'Alif' or 'Dhammah'. Just say 'U'.",
    'ا': "Say the short vowel sound 'A'. Do NOT say 'Alif'.",

    'بَ': "Say the short Arabic sound 'BA'. Do NOT say 'Baa' or 'Fathah'.",
    'بِ': "Say the short Arabic sound 'BI'. Do NOT say 'Baa' or 'Kasrah'.",
    'بُ': "Say the short Arabic sound 'BU'. Do NOT say 'Baa' or 'Dhammah'.",

    'تَ': "Say the short Arabic sound 'TA'.",
    'تِ': "Say the short Arabic sound 'TI'.",
    'تُ': "Say the short Arabic sound 'TU'.",

    'ثَ': "Say the short Arabic sound 'TSA'.",
    'ثِ': "Say the short Arabic sound 'TSI'.",
    'ثُ': "Say the short Arabic sound 'TSU'.",

    'جَ': "Say the short Arabic sound 'JA'.",
    'جِ': "Say the short Arabic sound 'JI'.",
    'جُ': "Say the short Arabic sound 'JU'.",

    'حَ': "Say the short Arabic sound 'HA' with clear throat Makhraj.",
    'حِ': "Say the short Arabic sound 'HI' with clear throat Makhraj.",
    'حُ': "Say the short Arabic sound 'HU' with clear throat Makhraj.",

    'خَ': "Say the short Arabic sound 'KHA'.",
    'خِ': "Say the short Arabic sound 'KHI'.",
    'خُ': "Say the short Arabic sound 'KHU'.",

    'دَ': "Say the short Arabic sound 'DA'.",
    'دِ': "Say the short Arabic sound 'DI'.",
    'دُ': "Say the short Arabic sound 'DU'.",

    'ذَ': "Say the short Arabic sound 'DZA'.",
    'ذِ': "Say the short Arabic sound 'DZI'.",
    'ذُ': "Say the short Arabic sound 'DZU'.",

    'رَ': "Say the short Arabic sound 'RA'.",
    'رِ': "Say the short Arabic sound 'RI'.",
    'رُ': "Say the short Arabic sound 'RU'.",

    'زَ': "Say the short Arabic sound 'ZA'.",
    'زِ': "Say the short Arabic sound 'ZI'.",
    'زُ': "Say the short Arabic sound 'ZU'.",

    'سَ': "Say the short Arabic sound 'SA'.",
    'سِ': "Say the short Arabic sound 'SI'.",
    'سُ': "Say the short Arabic sound 'SU'.",

    'كُتِبَ': "Pronounce the Arabic word 'كُتِبَ' cleanly as three connected short syllables: 'ku' 'ti' 'ba'. Do NOT say 'kufuwan' or 'alif'.",
    'رُسُلُ': "Pronounce the Arabic word 'رُسُلُ' cleanly as three connected short syllables: 'ru' 'su' 'lu'.",
  };

  if (harakatMap[text]) {
    return harakatMap[text];
  }

  if (isLong) {
    return `Recite the Arabic text "${text}" slowly with 2 harakat elongation (Mad Thabi'i), clear Makhraj and Tajweed. Do NOT spell letter names.`;
  }

  return `Recite the Arabic phrase "${text}" with authentic Arabic Qur'anic Talaqqi pronunciation, correct Makhraj and exact short vowels. Do NOT spell out letter names or diacritic names.`;
}

/**
 * AI Arabic Syekh Reciter TTS Endpoint
 */
app.post('/api/tts/arabic', async (req, res) => {
  try {
    const { text, isLong } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    const cacheKey = `${text.trim()}_${isLong ? 'long' : 'short'}`;
    if (ttsAudioCache.has(cacheKey)) {
      return res.json({ audioWavBase64: ttsAudioCache.get(cacheKey) });
    }

    if (!ai) {
      return res.status(503).json({ error: 'Gemini API Key is not configured' });
    }

    // System prompt instructing exact Arabic Qur'anic recitation
    const prompt = formatArabicPhoneticPrompt(text, isLong);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: prompt,
              speechMetadata: {
                style: "Clear, authentic, slow Arabic Qur'anic reciter (Syekh) with correct Tajweed and Makhraj pronunciation",
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Puck' }, // Authentic, rich resonant voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(500).json({ error: 'Failed to generate audio from Gemini TTS' });
    }

    ttsAudioCache.set(cacheKey, base64Audio);
    return res.json({ audioWavBase64: base64Audio });
  } catch (err) {
    console.error('Error generating AI Arabic TTS:', err);
    return res.status(500).json({ error: 'Failed to process AI TTS request' });
  }
});

async function startServer() {
  // Mount Vite middleware in development mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
  });
}

startServer();
