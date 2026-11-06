import type { IqroPage } from './iqroData';

type QuizQuestion = NonNullable<IqroPage['quizQuestions']>[number];

// Each group contains four readings that can be used as distinct answer choices.
// HA appears twice because ح and ه share the existing Iqro 1 Latin label.
const LETTER_GROUPS = [
  [['أ', 'A'], ['ب', 'BA'], ['ت', 'TA'], ['ث', 'TSA']],
  [['ج', 'JA'], ['ح', 'HA'], ['خ', 'KHO'], ['د', 'DA']],
  [['ذ', 'DZA'], ['ر', 'RO'], ['ز', 'ZA'], ['س', 'SA']],
  [['ش', 'SYA'], ['ص', 'SO'], ['ض', 'DHO'], ['ط', 'TO']],
  [['ظ', 'ZHO'], ['ع', "'A"], ['غ', 'GHO'], ['ف', 'FA']],
  [['ق', 'QO'], ['ك', 'KA'], ['ل', 'LA'], ['م', 'MA']],
  [['ن', 'NA'], ['و', 'WA'], ['ه', 'HA'], ['ي', 'YA']]
] as const;

const READINGS = Object.fromEntries(LETTER_GROUPS.flat().map(([letter, reading]) => [letter, reading])) as Record<string, string>;
const HARD_PAGES = [4, 6, 8, 10, 12, 14, 16, 18, 20, 21, 22, 23, 24, 27, 29];

function withChoices(id: string, arabic: string, text: string, correct: string, distractors: string[], index: number): QuizQuestion {
  const correctIndex = index % 4;
  const options = distractors.slice(0, 3);
  options.splice(correctIndex, 0, correct);
  return { id, questionArabic: arabic, questionText: text, options, correctIndex };
}

export function createIqro1Quiz(pages: IqroPage[]): QuizQuestion[] {
  const letterQuestions = LETTER_GROUPS.flat().map(([letter, reading], index) => {
    const sourcePage = pages.find((page) => page.rows.some((row) => row.items.some((item) =>
      item.arabic === `${letter}َ` && item.latin === reading
    )));
    if (!sourcePage) throw new Error(`Huruf ${letter} belum ditemukan pada latihan Iqro 1`);
    const group = LETTER_GROUPS.find((choices) => choices.some(([candidate]) => candidate === letter))!;
    return withChoices(
      `iqro1_letter_${letter}`,
      `${letter}َ`,
      `Bagaimana membaca huruf berfathah ini dengan pendek? (Halaman ${sourcePage.pageNumber})`,
      reading,
      group.map(([, label]) => label).filter((label) => label !== reading),
      index
    );
  });

  const sequencePages = [2, 3, ...HARD_PAGES];
  const sequenceQuestions = sequencePages.map((pageNumber, index) => {
    const page = pages.find((candidate) => candidate.pageNumber === pageNumber);
    const item = page?.rows.flatMap((row) => row.items).find((candidate) => {
      const letters = candidate.arabic.replace(/[\u064B-\u065F\u0670]/g, '').trim().split(/\s+/);
      const readings = candidate.latin.split(' - ');
      return letters.length === 3 && readings.length === 3
        && new Set(readings).size === 3
        && letters.every((letter, position) => READINGS[letter] === readings[position]);
    });
    if (!item) throw new Error(`Latihan tiga huruf yang valid tidak ditemukan pada halaman ${pageNumber}`);

    const [first, second, third] = item.latin.split(' - ');
    return withChoices(
      `iqro1_sequence_${pageNumber}`,
      item.arabic,
      `Baca tiga huruf ini berurutan, pendek satu per satu. (Halaman ${pageNumber})`,
      item.latin,
      [`${second} - ${first} - ${third}`, `${first} - ${third} - ${second}`, `${third} - ${second} - ${first}`],
      letterQuestions.length + index
    );
  });

  return [
    ...letterQuestions.slice(0, 15),
    ...letterQuestions.slice(15),
    ...sequenceQuestions.slice(0, 2),
    ...sequenceQuestions.slice(2)
  ];
}
