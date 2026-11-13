import type { QuranWord } from '../../types/quran';
import type { ReaderAyah, ReaderSurah } from '../../services/quranReaderData';

/**
 * Logika mode "Hafalkan": pemotongan ayat panjang, pembuatan soal tajwid otomatis
 * dari teks Utsmani (Quran.com API), dan penyimpanan progres per ayat.
 */

export type StageId = 'memory' | 'tajwid' | 'vanish' | 'puzzle' | 'blank' | 'audio' | 'write' | 'taisir';

export const STAGES: { id: StageId; title: string; goal: string }[] = [
  { id: 'memory', title: 'Kartu Pasangan', goal: 'Pahami arti setiap kata' },
  { id: 'tajwid', title: 'Kuis Tajwid', goal: 'Kenali hukum bacaan di ayat ini' },
  { id: 'vanish', title: 'Ayat Menghilang', goal: 'Hafalkan sampai tanpa melihat teks' },
  { id: 'puzzle', title: 'Susun Ayat', goal: 'Susun kata sesuai urutan ayat' },
  { id: 'blank', title: 'Tebak Lanjutan', goal: 'Lengkapi kata yang hilang' },
  { id: 'audio', title: 'Sambung Audio', goal: 'Sambungkan bacaan yang kamu dengar' },
  { id: 'write', title: 'Tulis Ayat', goal: 'Tulis kata kunci dari ingatan' },
  { id: 'taisir', title: 'Kunci Ayat', goal: "Metode At-Taisir: ingat ayat dari kata pertamanya" }
];

export interface HafalanContext {
  surah: ReaderSurah;
  ayah: ReaderAyah;
  ayahIndex: number;
  segments: QuranWord[][];
}

/* ------------------------------------------------------------------ */
/* Karakter Arab                                                       */
/* ------------------------------------------------------------------ */

const FATHATAN = 'ً';
const FATHA = 'َ';
const DAMMA = 'ُ';
const KASRA = 'ِ';
const SHADDA = 'ّ';
const SUKUN = 'ْ';
const MADDAH = 'ٓ';
const DAGGER_ALIF = 'ٰ';
const WASLA = 'ٱ';
const TATWEEL = 'ـ';
const SMALL_HIGH_MEEM = 'ۢ'; // tanda iqlab

/** Tanda waqaf yang boleh/dianjurkan berhenti (bukan ۙ "jangan berhenti" atau ۜ saktah). */
const STOP_MARKS = /[ۖۗۘۚۛ]/;
const ALL_WAQF_MARKS = /[ۖ-ۜ]/g;

const isLetter = (ch: string) => ((ch >= 'ء' && ch <= 'ي') && ch !== TATWEEL) || ch === WASLA;
const HAMZAS = new Set(['ء', 'أ', 'إ', 'ؤ', 'ئ', 'آ']);
const QALQALAH = new Set(['ق', 'ط', 'ب', 'ج', 'د']);
const SHAMSIYAH = new Set(['ت', 'ث', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ل', 'ن']);
const HALQI = new Set(['ء', 'أ', 'إ', 'ؤ', 'ئ', 'ه', 'ع', 'ح', 'غ', 'خ']);
const IDGHAM_GHUNNAH = new Set(['ي', 'ن', 'م', 'و']);
const IDGHAM_NO_GHUNNAH = new Set(['ل', 'ر']);
const IKHFA = new Set(['ت', 'ث', 'ج', 'د', 'ذ', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ف', 'ق', 'ك']);
const MAD_LETTERS = new Set(['ا', 'و', 'ي', 'ى']);

/** Teks kata tanpa tanda waqaf/hizb, untuk ditampilkan di game tulis & perbandingan. */
export const cleanWord = (arabic: string) =>
  arabic.replace(ALL_WAQF_MARKS, '').replace(/[۞۩‏]/g, '').replace(/\s+/g, ' ').trim();

interface Glyph { letter: string; marks: string }

/** Pecah satu kata menjadi huruf dasar + tanda-tandanya (tatweel dilewati). */
function glyphs(arabic: string): Glyph[] {
  const result: Glyph[] = [];
  for (const ch of cleanWord(arabic)) {
    if (isLetter(ch)) result.push({ letter: ch, marks: '' });
    else if (result.length && ch !== ' ' && ch !== TATWEEL) result[result.length - 1].marks += ch;
  }
  return result;
}

const hasVowel = (marks: string) => /[ً-ِ]/.test(marks);

/* ------------------------------------------------------------------ */
/* Pemotongan ayat                                                     */
/* ------------------------------------------------------------------ */

const SINGLE_SEGMENT_MAX = 10;
const SEGMENT_MAX = 8;
const SEGMENT_MIN = 3;

/** Potong ayat panjang per tanda waqaf (3–8 kata per potongan). */
export function splitIntoSegments(words: QuranWord[]): QuranWord[][] {
  if (words.length <= SINGLE_SEGMENT_MAX) return [words];
  const segments: QuranWord[][] = [];
  let current: QuranWord[] = [];
  words.forEach((word, index) => {
    current.push(word);
    const remaining = words.length - index - 1;
    const atStopMark = STOP_MARKS.test(word.arabic) && current.length >= SEGMENT_MIN;
    if ((atStopMark || current.length >= SEGMENT_MAX) && remaining > 0) {
      segments.push(current);
      current = [];
    }
  });
  if (current.length) {
    const last = segments[segments.length - 1];
    if (last && current.length < SEGMENT_MIN && last.length + current.length <= SEGMENT_MAX + 2) {
      last.push(...current);
    } else {
      segments.push(current);
    }
  }
  return segments;
}

/* ------------------------------------------------------------------ */
/* Soal tajwid otomatis                                                */
/* ------------------------------------------------------------------ */

export type TajwidRule =
  | 'Alif Lam Qamariyah' | 'Alif Lam Syamsiyah' | 'Ghunnah Musyaddadah'
  | 'Qalqalah Sughra' | 'Qalqalah Kubra'
  | 'Izhar Halqi' | 'Idgham Bighunnah' | 'Idgham Bilaghunnah' | 'Iqlab' | 'Ikhfa Haqiqi'
  | 'Izhar Syafawi' | 'Ikhfa Syafawi' | 'Idgham Mimi'
  | "Mad Thabi'i" | 'Mad Wajib Muttashil' | 'Mad Jaiz Munfashil' | 'Mad Lazim Kalimi Mutsaqqal'
  | "Mad 'Aridh Lissukun" | "Mad 'Iwadh" | 'Mad Liin';

const RULE_GROUP: Record<TajwidRule, string> = {
  'Alif Lam Qamariyah': 'Alif Lam', 'Alif Lam Syamsiyah': 'Alif Lam',
  'Ghunnah Musyaddadah': 'Ghunnah',
  'Qalqalah Sughra': 'Qalqalah', 'Qalqalah Kubra': 'Qalqalah',
  'Izhar Halqi': 'Nun Sukun & Tanwin', 'Idgham Bighunnah': 'Nun Sukun & Tanwin',
  'Idgham Bilaghunnah': 'Nun Sukun & Tanwin', Iqlab: 'Nun Sukun & Tanwin', 'Ikhfa Haqiqi': 'Nun Sukun & Tanwin',
  'Izhar Syafawi': 'Mim Sukun', 'Ikhfa Syafawi': 'Mim Sukun', 'Idgham Mimi': 'Mim Sukun',
  "Mad Thabi'i": 'Mad', 'Mad Wajib Muttashil': 'Mad', 'Mad Jaiz Munfashil': 'Mad',
  'Mad Lazim Kalimi Mutsaqqal': 'Mad', "Mad 'Aridh Lissukun": 'Mad', "Mad 'Iwadh": 'Mad', 'Mad Liin': 'Mad'
};

/** Pengecoh yang masuk akal: hukum lain dalam kelompok yang sama lebih dulu. */
const DISTRACTORS: Record<TajwidRule, TajwidRule[]> = {
  'Alif Lam Qamariyah': ['Alif Lam Syamsiyah', 'Qalqalah Sughra'],
  'Alif Lam Syamsiyah': ['Alif Lam Qamariyah', 'Ghunnah Musyaddadah'],
  'Ghunnah Musyaddadah': ['Idgham Bighunnah', 'Ikhfa Haqiqi'],
  'Qalqalah Sughra': ['Qalqalah Kubra', 'Izhar Halqi'],
  'Qalqalah Kubra': ['Qalqalah Sughra', "Mad 'Aridh Lissukun"],
  'Izhar Halqi': ['Ikhfa Haqiqi', 'Idgham Bighunnah'],
  'Idgham Bighunnah': ['Idgham Bilaghunnah', 'Ikhfa Haqiqi'],
  'Idgham Bilaghunnah': ['Idgham Bighunnah', 'Izhar Halqi'],
  Iqlab: ['Ikhfa Haqiqi', 'Ikhfa Syafawi'],
  'Ikhfa Haqiqi': ['Izhar Halqi', 'Idgham Bighunnah'],
  'Izhar Syafawi': ['Ikhfa Syafawi', 'Idgham Mimi'],
  'Ikhfa Syafawi': ['Izhar Syafawi', 'Iqlab'],
  'Idgham Mimi': ['Ikhfa Syafawi', 'Izhar Syafawi'],
  "Mad Thabi'i": ['Mad Jaiz Munfashil', 'Mad Wajib Muttashil'],
  'Mad Wajib Muttashil': ['Mad Jaiz Munfashil', "Mad Thabi'i"],
  'Mad Jaiz Munfashil': ['Mad Wajib Muttashil', "Mad Thabi'i"],
  'Mad Lazim Kalimi Mutsaqqal': ['Mad Wajib Muttashil', "Mad Thabi'i"],
  "Mad 'Aridh Lissukun": ["Mad Thabi'i", 'Mad Liin'],
  "Mad 'Iwadh": ["Mad 'Aridh Lissukun", "Mad Thabi'i"],
  'Mad Liin': ["Mad 'Aridh Lissukun", "Mad Thabi'i"]
};

const EXPLANATION: Record<TajwidRule, (letter: string) => string> = {
  'Alif Lam Qamariyah': (l) => `Alif Lam bertemu huruf ${l} (huruf qamariyah), sehingga lam dibaca jelas.`,
  'Alif Lam Syamsiyah': (l) => `Alif Lam bertemu huruf ${l} (huruf syamsiyah) yang bertasydid, sehingga lam tidak dibaca dan langsung melebur ke huruf ${l}.`,
  'Ghunnah Musyaddadah': (l) => `Huruf ${l} bertasydid wajib dibaca berdengung (ghunnah) sekitar 2 harakat.`,
  'Qalqalah Sughra': (l) => `Huruf qalqalah ${l} berharakat sukun di tengah bacaan, dipantulkan ringan.`,
  'Qalqalah Kubra': (l) => `Huruf qalqalah ${l} berada di akhir ayat dan dimatikan karena waqaf, dipantulkan lebih kuat.`,
  'Izhar Halqi': (l) => `Nun sukun/tanwin bertemu huruf halqi ${l}, sehingga nun dibaca jelas tanpa dengung.`,
  'Idgham Bighunnah': (l) => `Nun sukun/tanwin bertemu huruf ${l} (ي ن م و), sehingga dileburkan disertai dengung.`,
  'Idgham Bilaghunnah': (l) => `Nun sukun/tanwin bertemu huruf ${l} (ل atau ر), sehingga dileburkan tanpa dengung.`,
  Iqlab: () => 'Nun sukun/tanwin bertemu huruf ب, sehingga bunyi nun diganti menjadi mim disertai dengung.',
  'Ikhfa Haqiqi': (l) => `Nun sukun/tanwin bertemu huruf ${l} (salah satu dari 15 huruf ikhfa), dibaca samar disertai dengung.`,
  'Izhar Syafawi': (l) => `Mim sukun bertemu huruf ${l} (selain ب dan م), sehingga mim dibaca jelas.`,
  'Ikhfa Syafawi': () => 'Mim sukun bertemu huruf ب, dibaca samar di bibir disertai dengung.',
  'Idgham Mimi': () => 'Mim sukun bertemu huruf م, dileburkan menjadi mim bertasydid disertai dengung.',
  "Mad Thabi'i": () => 'Huruf mad didahului harakat yang sesuai tanpa sebab lain, dibaca panjang 2 harakat.',
  'Mad Wajib Muttashil': () => 'Huruf mad bertemu hamzah dalam satu kata, wajib dibaca panjang 4–5 harakat.',
  'Mad Jaiz Munfashil': () => 'Huruf mad di akhir kata bertemu hamzah di awal kata berikutnya, boleh dibaca panjang 2–5 harakat.',
  'Mad Lazim Kalimi Mutsaqqal': () => 'Huruf mad bertemu huruf bertasydid dalam satu kata, wajib dibaca panjang 6 harakat.',
  "Mad 'Aridh Lissukun": () => 'Huruf mad sebelum huruf terakhir yang dimatikan karena waqaf, boleh dibaca 2, 4, atau 6 harakat.',
  "Mad 'Iwadh": () => 'Tanwin fathah di akhir ayat saat waqaf diganti bunyi "a" panjang 2 harakat.',
  'Mad Liin': () => 'Wau/ya sukun didahului fathah sebelum huruf yang dimatikan karena waqaf, dibaca lunak dan boleh dipanjangkan.'
};

export interface TajwidQuestion {
  label: string;
  phrase: string;
  question: string;
  options: { text: string; correct: boolean }[];
  explanation: string;
}

interface Finding { rule: TajwidRule; phrase: string; letter: string; question: string }

const firstLetterOf = (word: string): Glyph | undefined => glyphs(word)[0];

function nunTanwinRule(next: Glyph): TajwidRule | null {
  if (next.letter === WASLA || next.letter === 'ا') return null;
  if (HALQI.has(next.letter)) return 'Izhar Halqi';
  if (IDGHAM_GHUNNAH.has(next.letter)) return 'Idgham Bighunnah';
  if (IDGHAM_NO_GHUNNAH.has(next.letter)) return 'Idgham Bilaghunnah';
  if (next.letter === 'ب') return 'Iqlab';
  if (IKHFA.has(next.letter)) return 'Ikhfa Haqiqi';
  return null;
}

/** Cari hukum tajwid dalam satu ayat. Hanya kasus yang jelas dari ejaan Utsmani yang diambil. */
export function findTajwid(words: QuranWord[]): Finding[] {
  const found: Finding[] = [];
  const texts = words.map((w) => cleanWord(w.arabic));
  const lastIndex = texts.length - 1;

  texts.forEach((text, wi) => {
    const g = glyphs(text);
    const isLastWord = wi === lastIndex;
    const nextWordFirst = wi < lastIndex ? firstLetterOf(texts[wi + 1]) : undefined;
    const pausesHere = STOP_MARKS.test(words[wi].arabic);
    const pair = wi < lastIndex ? `${text} ${texts[wi + 1]}` : text;

    // Alif Lam (ٱل) — kecuali lafaz Allah dan ism mausul (ٱلَّذِى dsb.)
    const alIndex = g.findIndex((x, i) => x.letter === WASLA && g[i + 1]?.letter === 'ل');
    if (alIndex >= 0 && !/ٱللَّه|لِلَّه/.test(text)) {
      const lam = g[alIndex + 1];
      const after = g[alIndex + 2];
      if (after && lam.marks.includes(SUKUN) && !SHAMSIYAH.has(after.letter)) {
        found.push({ rule: 'Alif Lam Qamariyah', phrase: text, letter: after.letter,
          question: `Pada lafaz "${text}", apa hukum bacaan Alif Lam (ال)-nya?` });
      } else if (after && !lam.marks && after.marks.includes(SHADDA) && SHAMSIYAH.has(after.letter) && after.letter !== 'ل') {
        found.push({ rule: 'Alif Lam Syamsiyah', phrase: text, letter: after.letter,
          question: `Pada lafaz "${text}", apa hukum bacaan Alif Lam (ال)-nya?` });
      } else if (after && lam.marks.includes(SHADDA) && !['ذ', 'ت', 'ى'].includes(after.letter)) {
        // ٱلَّيْلِ: lam ta'rif melebur ke lam berikutnya (ditulis satu lam bertasydid)
        found.push({ rule: 'Alif Lam Syamsiyah', phrase: text, letter: 'ل',
          question: `Pada lafaz "${text}", apa hukum bacaan Alif Lam (ال)-nya?` });
      }
    }

    g.forEach((x, gi) => {
      const isFinalGlyph = gi === g.length - 1;

      // Ghunnah musyaddadah
      // (huruf pertama bertasydid berasal dari idgham kata sebelumnya, jadi dilewati)
      if ((x.letter === 'ن' || x.letter === 'م') && gi > 0 && x.marks.includes(SHADDA) && !(isLastWord && isFinalGlyph)) {
        found.push({ rule: 'Ghunnah Musyaddadah', phrase: text, letter: x.letter,
          question: `Huruf ${x.letter} bertasydid pada "${text}" dibaca dengan hukum...` });
      }

      // Qalqalah sughra (sukun asli di tengah bacaan)
      if (QALQALAH.has(x.letter) && x.marks.includes(SUKUN) && !(isLastWord && isFinalGlyph)) {
        found.push({ rule: 'Qalqalah Sughra', phrase: text, letter: x.letter,
          question: `Huruf ${x.letter} sukun pada "${text}" dibaca dengan hukum...` });
      }

      // Nun sukun di tengah kata
      if (x.letter === 'ن' && !isFinalGlyph) {
        const next = g[gi + 1];
        const rule = nunTanwinRule(next);
        const written = x.marks.includes(SUKUN);
        // Ejaan Utsmani: izhar ditulis dengan sukun, ikhfa/idgham/iqlab tanpa sukun.
        if (rule === 'Ikhfa Haqiqi' && !hasVowel(x.marks) && !x.marks.includes(SHADDA) && !written) {
          found.push({ rule, phrase: text, letter: next.letter,
            question: `Nun sukun pada "${text}" bertemu huruf ${next.letter}. Apa hukum bacaannya?` });
        } else if (rule === 'Izhar Halqi' && written) {
          found.push({ rule, phrase: text, letter: next.letter,
            question: `Nun sukun pada "${text}" bertemu huruf ${next.letter}. Apa hukum bacaannya?` });
        }
      }

      // Mim sukun di tengah kata (izhar syafawi)
      if (x.letter === 'م' && !isFinalGlyph && x.marks.includes(SUKUN)) {
        const next = g[gi + 1];
        if (next.letter !== 'ب' && next.letter !== 'م') {
          found.push({ rule: 'Izhar Syafawi', phrase: text, letter: next.letter,
            question: `Mim sukun pada "${text}" bertemu huruf ${next.letter}. Apa hukum bacaannya?` });
        }
      }

      // Mad karena maddah (ٓ) di atas huruf mad
      if (['ا', 'و', 'ي', 'ى'].includes(x.letter) && x.marks.includes(MADDAH)) {
        const next = g[gi + 1];
        if (next && HAMZAS.has(next.letter)) {
          found.push({ rule: 'Mad Wajib Muttashil', phrase: text, letter: next.letter,
            question: `Bacaan panjang pada "${text}" termasuk hukum mad apa?` });
        } else if (next && next.marks.includes(SHADDA)) {
          found.push({ rule: 'Mad Lazim Kalimi Mutsaqqal', phrase: text, letter: next.letter,
            question: `Bacaan panjang pada "${text}" termasuk hukum mad apa?` });
        } else if (!next && nextWordFirst && HAMZAS.has(nextWordFirst.letter)) {
          found.push({ rule: 'Mad Jaiz Munfashil', phrase: pair, letter: nextWordFirst.letter,
            question: `Bacaan panjang pada "${pair}" termasuk hukum mad apa?` });
        }
      }

      // Mad thabi'i: huruf mad tanpa tanda (atau alif kecil ٰ) dengan harakat yang sesuai.
      // Dilewati: dekat akhir ayat (area waqaf), setelah hamzah (Mad Badal), sebelum
      // hamzah/tasydid (mad far'i), dan huruf mad di akhir kata sebelum hamzah washal.
      const prevG = g[gi - 1];
      const nextG = g[gi + 1];
      const nearEnd = isLastWord && gi >= g.length - 2;
      const madByLetter = !x.marks && prevG && !prevG.marks.includes(FATHATAN) && (
        (x.letter === 'ا' && prevG.marks.endsWith(FATHA)) ||
        (x.letter === 'و' && prevG.marks.includes(DAMMA)) ||
        (x.letter === 'ي' && prevG.marks.includes(KASRA))
      );
      const madByDagger = x.marks.includes(DAGGER_ALIF) && !x.marks.includes(MADDAH) && !HAMZAS.has(x.letter);
      const blockedAfter = nextG
        ? HAMZAS.has(nextG.letter) || nextG.marks.includes(SHADDA)
        : !nextWordFirst || nextWordFirst.letter === WASLA || HAMZAS.has(nextWordFirst.letter);
      if ((madByLetter || madByDagger) && !nearEnd && !blockedAfter && !(prevG && HAMZAS.has(prevG.letter))) {
        found.push({ rule: "Mad Thabi'i", phrase: text, letter: x.letter,
          question: `Bacaan panjang pada "${text}" termasuk hukum mad apa?` });
      }
    });

    // Antar kata: nun sukun / tanwin / mim sukun di akhir kata
    if (!isLastWord && !pausesHere && nextWordFirst && g.length) {
      const last = g[g.length - 1];
      const tanwin = /[ً-ٍ]/.test(last.marks)
        || (last.letter === 'ا' && g.length > 1 && g[g.length - 2].marks.includes(FATHATAN))
        || (last.letter === 'ى' && g.length > 1 && g[g.length - 2].marks.includes(FATHATAN));
      if (tanwin) {
        const rule = nunTanwinRule(nextWordFirst);
        if (rule) {
          found.push({ rule, phrase: pair, letter: nextWordFirst.letter,
            question: `Tanwin pada "${pair}" bertemu huruf ${nextWordFirst.letter}. Apa hukum bacaannya (dibaca sambung)?` });
        }
      } else if (last.letter === 'ن' && !hasVowel(last.marks) && !last.marks.includes(SHADDA)) {
        const rule = nunTanwinRule(nextWordFirst);
        const written = last.marks.includes(SUKUN);
        const iqlabMark = last.marks.includes(SMALL_HIGH_MEEM);
        const consistent = rule === 'Izhar Halqi' ? written
          : rule === 'Iqlab' ? iqlabMark
          : rule !== null && !written;
        if (rule && consistent) {
          found.push({ rule, phrase: pair, letter: nextWordFirst.letter,
            question: `Nun sukun pada "${pair}" bertemu huruf ${nextWordFirst.letter}. Apa hukum bacaannya (dibaca sambung)?` });
        }
      } else if (last.letter === 'م' && !hasVowel(last.marks) && !last.marks.includes(SHADDA)) {
        const written = last.marks.includes(SUKUN);
        const nextGlyph = glyphs(texts[wi + 1])[0];
        if (nextWordFirst.letter === 'ب' && !written) {
          found.push({ rule: 'Ikhfa Syafawi', phrase: pair, letter: 'ب',
            question: `Mim sukun pada "${pair}" bertemu huruf ب. Apa hukum bacaannya (dibaca sambung)?` });
        } else if (nextWordFirst.letter === 'م' && !written && nextGlyph?.marks.includes(SHADDA)) {
          found.push({ rule: 'Idgham Mimi', phrase: pair, letter: 'م',
            question: `Mim sukun pada "${pair}" bertemu huruf م. Apa hukum bacaannya (dibaca sambung)?` });
        } else if (written && nextWordFirst.letter !== 'ب' && nextWordFirst.letter !== 'م' && nextWordFirst.letter !== WASLA) {
          found.push({ rule: 'Izhar Syafawi', phrase: pair, letter: nextWordFirst.letter,
            question: `Mim sukun pada "${pair}" bertemu huruf ${nextWordFirst.letter}. Apa hukum bacaannya?` });
        }
      }
    }

    // Akhir ayat (waqaf)
    if (isLastWord && g.length >= 2) {
      const last = g[g.length - 1];
      const prev = g[g.length - 2];
      const beforePrev = g[g.length - 3];
      if (last.letter === 'ا' && prev.marks.includes(FATHATAN)) {
        found.push({ rule: "Mad 'Iwadh", phrase: text, letter: prev.letter,
          question: `Saat berhenti (waqaf) di akhir ayat pada "${text}", bacaannya termasuk hukum...` });
      } else if (QALQALAH.has(last.letter)) {
        found.push({ rule: 'Qalqalah Kubra', phrase: text, letter: last.letter,
          question: `Saat berhenti (waqaf) pada "${text}", huruf ${last.letter} di akhir dibaca dengan hukum...` });
      } else if (!last.marks.includes(SHADDA)) {
        const madLetter = !prev.marks && beforePrev && (
          (prev.letter === 'ا' && beforePrev.marks.includes(FATHA)) ||
          (prev.letter === 'و' && beforePrev.marks.includes(DAMMA)) ||
          ((prev.letter === 'ي' || prev.letter === 'ى') && beforePrev.marks.includes(KASRA))
        );
        const daggerMad = prev.marks.includes(DAGGER_ALIF) && !prev.marks.includes(SUKUN);
        const liin = (prev.letter === 'و' || prev.letter === 'ي') && prev.marks.includes(SUKUN)
          && beforePrev?.marks.includes(FATHA);
        const finalMad = MAD_LETTERS.has(last.letter) && !last.marks.includes(MADDAH) && !last.marks.includes(SUKUN)
          && !hasVowel(last.marks) && (
            (last.letter === 'ا' && prev.marks.includes(FATHA)) ||
            (last.letter === 'و' && prev.marks.includes(DAMMA)) ||
            (last.letter === 'ي' && prev.marks.includes(KASRA)) ||
            (last.letter === 'ى' && (prev.marks.includes(KASRA) || prev.marks.includes(FATHA) || last.marks.includes(DAGGER_ALIF)))
          ) && !HAMZAS.has(prev.letter);
        if (finalMad) {
          found.push({ rule: "Mad Thabi'i", phrase: text, letter: last.letter,
            question: `Bacaan panjang di akhir ayat pada "${text}" termasuk hukum mad apa?` });
        } else if (madLetter || daggerMad) {
          found.push({ rule: "Mad 'Aridh Lissukun", phrase: text, letter: prev.letter,
            question: `Saat berhenti (waqaf) di akhir ayat pada "${text}", bacaan panjangnya termasuk hukum...` });
        } else if (liin) {
          found.push({ rule: 'Mad Liin', phrase: text, letter: prev.letter,
            question: `Saat berhenti (waqaf) di akhir ayat pada "${text}", bacaan huruf ${prev.letter}-nya termasuk hukum...` });
        }
      }
    }
  });
  return found;
}

const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};
export { shuffle };

/** Pilih hingga `max` soal dengan kelompok hukum berbeda-beda. */
export function buildTajwidQuestions(words: QuranWord[], max = 3): TajwidQuestion[] {
  const findings = findTajwid(words);
  const byGroup = new Map<string, Finding[]>();
  findings.forEach((f) => {
    const group = RULE_GROUP[f.rule];
    byGroup.set(group, [...(byGroup.get(group) ?? []), f]);
  });
  // Utamakan kelompok selain Mad (Mad thabi'i paling sering muncul).
  const groups = shuffle([...byGroup.keys()]).sort((a, b) => (a === 'Mad' ? 1 : 0) - (b === 'Mad' ? 1 : 0));
  const picked: Finding[] = [];
  for (const group of groups) {
    const options = byGroup.get(group)!;
    const preferred = options.filter((f) => f.rule !== "Mad Thabi'i");
    picked.push(shuffle(preferred.length ? preferred : options)[0]);
    if (picked.length >= max) break;
  }
  if (picked.length) {
    return picked.map((f) => ({
      label: RULE_GROUP[f.rule],
      phrase: f.phrase,
      question: f.question,
      options: shuffle([f.rule, ...DISTRACTORS[f.rule]]).map((rule) => ({ text: rule, correct: rule === f.rule })),
      explanation: EXPLANATION[f.rule](f.letter)
    }));
  }

  // Huruf muqatta'ah (mis. الٓمٓ, طه, حمٓ): tidak berharakat pendek sama sekali.
  const texts = words.map((w) => cleanWord(w.arabic));
  if (texts.every((t) => !/[\u064B-\u0650]/.test(t))) {
    const phrase = texts.join(' ');
    const reading = words.map((w) => w.transliteration).join(' ');
    return [{
      label: "Huruf Muqatta'ah",
      phrase,
      question: `Bagaimana cara membaca "${phrase}" di awal surah ini?`,
      options: shuffle([
        { text: `Menyebut nama setiap hurufnya (${reading})`, correct: true },
        { text: 'Dibaca seperti satu kata biasa', correct: false },
        { text: 'Tidak dibaca, hanya ditulis', correct: false }
      ]),
      explanation: "Huruf muqatta'ah di awal surah dibaca dengan menyebut nama hurufnya satu per satu, sebagian dengan mad (panjang) sesuai riwayat Hafs."
    }];
  }

  // Cadangan: hukum waqaf di akhir ayat.
  const lastText = texts[texts.length - 1];
  const lastGlyph = glyphs(lastText).pop();
  const taMarbutah = lastGlyph?.letter === 'ة';
  return [{
    label: 'Waqaf',
    phrase: lastText,
    question: `Saat berhenti (waqaf) di akhir ayat pada "${lastText}", bagaimana huruf terakhirnya dibaca?`,
    options: shuffle([
      { text: taMarbutah ? 'Ta marbutah berubah menjadi ha sukun (h)' : 'Dimatikan (dibaca sukun)', correct: true },
      { text: 'Tetap dibaca dengan harakatnya', correct: false },
      { text: 'Dibaca dengan tanwin', correct: false }
    ]),
    explanation: taMarbutah
      ? 'Ta marbutah (ة) yang diwaqafkan dibaca ha sukun, dan harakat akhirnya tidak dibaca.'
      : 'Huruf terakhir yang diwaqafkan dibaca sukun, harakat akhirnya tidak dibaca.'
  }];
}

/* ------------------------------------------------------------------ */
/* Kata kunci untuk tahap tulis                                        */
/* ------------------------------------------------------------------ */

/** Ayat pendek: semua kata (maks. 6). Ayat panjang: kata pertama tiap potongan. */
export function writingWords(segments: QuranWord[][]): QuranWord[] {
  const all = segments.flat();
  if (segments.length === 1) {
    if (all.length <= 6) return all;
    return [all[0], all[Math.floor(all.length / 2)], all[all.length - 1]];
  }
  return segments.map((segment) => segment[0]);
}

/* ------------------------------------------------------------------ */
/* Progres                                                             */
/* ------------------------------------------------------------------ */

const PROGRESS_KEY = 'raudhah_hafalan_progress_v1';

/** `done`: game yang sudah diselesaikan untuk ayat ini (urutan bebas). `stage`: format lama. */
type ProgressEntry = { done?: StageId[]; stage?: number; updatedAt: string };
type ProgressMap = Record<string, ProgressEntry>;

const STAGE_IDS = new Set<string>(STAGES.map((s) => s.id));

function readProgress(): ProgressMap {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}') as ProgressMap;
  } catch {
    return {};
  }
}

/** Game yang sudah selesai untuk satu ayat. */
export function getCompletedStages(ayahId: string): StageId[] {
  const entry = readProgress()[ayahId];
  if (!entry) return [];
  if (Array.isArray(entry.done)) return entry.done.filter((id) => STAGE_IDS.has(id));
  const stage = Number(entry.stage);
  return Number.isInteger(stage) && stage > 0 ? STAGES.slice(0, Math.min(stage, STAGES.length)).map((s) => s.id) : [];
}

/** Nomor surah yang punya ayat dengan progres game hafalan (minimal satu game selesai). */
export function getSurahsWithHafalanProgress(): Set<number> {
  const surahs = new Set<number>();
  Object.entries(readProgress()).forEach(([ayahId, entry]) => {
    const started = (Array.isArray(entry.done) && entry.done.length > 0) || Number(entry.stage) > 0;
    const surah = Number(ayahId.split(':')[0]);
    if (started && Number.isInteger(surah)) surahs.add(surah);
  });
  return surahs;
}

/**
 * Aktivitas hafalan per surah: ayat yang sudah mulai dilatih (minimal satu game selesai)
 * beserta jumlah game-nya, dan waktu latihan terakhir.
 */
export function getHafalanActivityBySurah(): Map<number, { ayahs: Map<number, number>; lastAt: number }> {
  const activity = new Map<number, { ayahs: Map<number, number>; lastAt: number }>();
  Object.entries(readProgress()).forEach(([ayahId, entry]) => {
    const [surah, ayah] = ayahId.split(':').map(Number);
    if (!Number.isInteger(surah) || !Number.isInteger(ayah)) return;
    const games = getCompletedStages(ayahId).length;
    if (games === 0) return;
    const item = activity.get(surah) ?? { ayahs: new Map<number, number>(), lastAt: 0 };
    item.ayahs.set(ayah, games);
    item.lastAt = Math.max(item.lastAt, Date.parse(entry.updatedAt) || 0);
    activity.set(surah, item);
  });
  return activity;
}

/** Catat satu game selesai; mengembalikan daftar terbaru. */
export function markStageCompleted(ayahId: string, stageId: StageId): StageId[] {
  const done = getCompletedStages(ayahId);
  const next = done.includes(stageId) ? done : [...done, stageId];
  try {
    const progress = readProgress();
    progress[ayahId] = { done: next, updatedAt: new Date().toISOString() };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Progres tetap berjalan di memori bila penyimpanan tidak tersedia.
  }
  return next;
}

/** Kata-kata pengecoh dari ayat lain dalam surah yang sama. */
export function otherWords(ctx: HafalanContext, exclude: string[]): QuranWord[] {
  const seen = new Set(exclude.map(cleanWord));
  const pool: QuranWord[] = [];
  ctx.surah.ayahs.forEach((ayah) => {
    if (ayah.id === ctx.ayah.id) return;
    ayah.words.forEach((word) => {
      const key = cleanWord(word.arabic);
      if (!seen.has(key)) {
        seen.add(key);
        pool.push(word);
      }
    });
  });
  return pool;
}

