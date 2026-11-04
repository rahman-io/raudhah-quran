import type { IqroItem, IqroPage } from './iqroData';

// The source book's exercise groups, read right-to-left within each printed row.
// The original interactive card, recorded audio, and completion controls use
// these items in exactly the same way as the other Iqro levels.
const LETTER_NAMES: Record<string, string> = {
  'أ': 'A', 'ء': 'A', 'ب': 'BA', 'ت': 'TA', 'ث': 'TSA',
  'ج': 'JA', 'ح': 'HA', 'خ': 'KHO', 'د': 'DA', 'ذ': 'DZA',
  'ر': 'RO', 'ز': 'ZA', 'س': 'SA', 'ش': 'SYA', 'ص': 'SO',
  'ض': 'DHO', 'ط': 'TO', 'ظ': 'ZHO', 'ع': "'A", 'غ': 'GHO',
  'ف': 'FA', 'ق': 'QO', 'ك': 'KA', 'ل': 'LA', 'م': 'MA',
  'ن': 'NA', 'و': 'WA', 'ه': 'HA', 'ي': 'YA',
};

function exercise(value: string, id: string): IqroItem {
  const letters = value.split(' ');
  if (letters.some((letter) => !LETTER_NAMES[letter])) {
    throw new Error(`Unknown Iqro 1 letter in ${value}`);
  }
  return {
    id,
    arabic: letters.map((letter) => `${letter}َ`).join('  '),
    latin: letters.map((letter) => LETTER_NAMES[letter]).join(' - '),
  };
}

const openingExercises: Record<number, string[][]> = {
  1: [
    ['أ', 'ب'],
    ['ب أ ب', 'أ ب أ'],
    ['ب أ أ', 'أ أ ب'],
    ['ب ب أ', 'أ ب ب'],
    ['ب أ ب', 'أ ب أ'],
    ['أ أ أ', 'ب ب ب'],
    ['أ ب', 'أ ب', 'أ ب'],
  ],
  2: [
    ['ب', 'ت'],
    ['أ ت ب', 'ت ب أ'],
    ['ت أ ب', 'أ ب ت'],
    ['ب ت أ', 'أ ت ب'],
    ['ت أ ت', 'ب أ ت'],
    ['أ ت ب', 'ت ت أ'],
    ['أ ب ت', 'أ ب ت'],
  ],
  3: [
    ['ب', 'ت', 'ث'],
    ['ث أ ب', 'ث ب ت'],
    ['ب ت ت', 'ب أ ث'],
    ['أ ت ب', 'ث ب ث'],
    ['ت ب ت', 'أ ث ث'],
    ['ت ت أ', 'ب ث ث'],
    ['ث ب ت', 'ب ت ث'],
    ['أ ب ت ث', 'أ ب ت ث'],
  ],
};

const openingLetters: Record<number, string[]> = {
  4: ['ج'], 5: ['ج', 'ح'], 6: ['ج', 'ح', 'خ'],
  7: ['د'], 8: ['د', 'ذ'], 9: ['ر'], 10: ['ر', 'ز'],
  11: ['س'], 12: ['س', 'ش'], 13: ['ص'], 14: ['ص', 'ض'],
  15: ['ط'], 16: ['ط', 'ظ'], 17: ['ع'], 18: ['ع', 'غ'],
  19: ['ف'], 20: ['ف', 'ق'], 21: ['ك'], 22: ['ل'],
  23: ['م'], 24: ['ن'], 25: ['و'], 26: ['ه'], 27: ['ي'],
};

// Corrections found while checking the existing transcription against the
// printed glyphs: page -> [printed row (1-based), card (0-based), reading].
const correctedReadings: Record<number, [number, number, string][]> = {
  6: [[1, 0, 'ح أ خ'], [4, 0, 'ج أ ح']],
  7: [[2, 1, 'ج ح د']],
  12: [[2, 0, 'ش ذ ت']],
};

const finalExercises = [
  ['أ ب ت ث ج ح خ د ذ ر ز'],
  ['س ش ص ض ط ظ ع غ'],
  ['ف ق ك ل م ن و ه ء ي'],
  ['ي ء ه و ن م ل ك ق ف'],
  ['غ ع ظ ط ض ص ش س'],
  ['ز ر ذ د خ ح ج ث ت ب أ'],
];

function printedRows(pageNumber: number, rows: string[][], intro = false): IqroPage['rows'] {
  return rows.map((items, index) => ({
    id: `book_p${pageNumber}_${intro ? 'intro' : index + 1}`,
    items: items.map((item, itemIndex) => exercise(item, `${index}_${itemIndex}`)),
  }));
}

export function iqro1PagesFromBook(existingPages: IqroPage[]): IqroPage[] {
  const pages = existingPages.map((page) => {
    const number = page.pageNumber;
    if (openingExercises[number]) {
      return { ...page, rows: printedRows(number, openingExercises[number]) };
    }
    if (openingLetters[number]) {
      const corrected = (correctedReadings[number] || []).reduce((rows, [rowIndex, itemIndex, value]) => {
        const index = rowIndex - 1;
        rows[index] = { ...rows[index], items: rows[index].items.map((item, i) =>
          i === itemIndex ? { ...exercise(value, item.id) } : item
        ) };
        return rows;
      }, page.rows.slice());
      return { ...page, rows: [
        ...printedRows(number, [openingLetters[number]], true),
        ...corrected,
      ] };
    }
    return page;
  });
  pages.push({
    pageNumber: 31,
    title: 'Halaman 31: Latihan Akhir Iqro 1',
    subtitle: 'Membaca seluruh huruf sesuai urutan dalam buku',
    teacherNote: '',
    rows: printedRows(31, finalExercises),
    quizQuestions: existingPages[existingPages.length - 1].quizQuestions,
  });
  return pages;
}
