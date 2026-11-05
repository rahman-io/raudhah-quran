import type { IqroItem, IqroPage } from './iqroData';

// Exercise corrections checked against the printed Iqro 2 pages (PDF pages
// 3–32). The keys are book page, printed row, and card from right to left.
const corrections: Record<number, Record<number, Record<number, string>>> = {
  1: { 4: { 0: 'بَتَ', 2: 'تَتَ' } },
  2: {
    6: { 2: 'نَبَاَ', 3: 'نَبَأَ' },
    8: { 3: 'نَوَنَ' },
  },
  3: { 8: { 2: 'سَ يَ' } },
  5: { 8: { 1: 'شَأَ' } },
  6: { 6: { 0: 'غَيَرَ', 1: 'تَغَفَ' } },
  7: { 1: { 0: 'غَأَعَ' } },
  8: { 8: { 2: 'فَرَشَ' } },
  9: { 1: { 0: 'سَأَلَ' }, 7: { 3: 'حَيَثَ' } },
  10: {
    1: { 0: 'كَ تَ بَ = كَتَبَ' },
    2: { 0: 'سَ كَ تَ = سَكَتَ = سَكَتَ' },
    5: { 1: 'حَفَظَ' },
  },
  11: {
    1: { 2: 'أَ' },
    2: { 1: 'لَ أَ = لَأَ = لَاَ' },
    3: { 2: 'لَأَجَلَ' },
    4: { 0: 'لَسَأَلَ', 2: 'لَنَبَأَ' },
    5: { 1: 'لَأَكَلَ' },
    7: { 0: 'سَأَلَكَ', 1: 'لَلَأَمَ' },
  },
  12: {
    2: { 3: 'لَأَخَذَ' },
    3: { 3: 'لَأَسَدَ' },
    4: { 3: 'لَأَمَرَ' },
    5: { 3: 'لَأَقَمَ' },
    6: { 3: 'لَأَذَنَ' },
    7: { 3: 'لَأَلَلَ' },
    8: { 3: 'لَأَكَلَ' },
  },
  13: {
    2: { 0: 'شَ هَ دَ = شَهَدَ' },
    3: { 3: 'لَأَفَ' },
    4: { 3: 'لَأَخَذَ' },
    5: { 3: 'لَأَجَزَ' },
    6: { 3: 'لَأَفَلَ' },
  },
  14: { 6: { 3: 'عَابَدَا' } },
  15: { 6: { 2: 'لَأَهَبَ' } },
  16: { 2: { 0: 'يَشَأَ', 2: 'ظَمَأَ' } },
  17: {
    6: { 0: 'لَأَعَزَ', 1: 'لَأَشَرَ', 2: 'لَأَمَنَ' },
    7: { 0: 'صَدَقَاتَكَ' },
  },
  19: {
    4: { 3: 'تَخَذَا' },
    8: { 0: 'لَأَخَذَ', 2: 'لَأَصَبَا' },
  },
  20: {
    1: { 1: 'لَأَصَبَا', 2: 'وَلَأَلَنَا' },
    3: { 2: 'وَتَمَشَ' },
    5: { 0: 'لَأَخَكَ' },
    7: { 1: 'لَأَغَضَبَ' },
  },
  21: {
    1: { 0: '---َ = ---َا', 1: 'بَ = بَا' },
    7: { 2: 'الَأَفَ', 3: 'مَأَبَ' },
  },
  22: {
    1: { 0: 'سَبَحَا = سَبَحَى' },
    3: { 2: 'لَعَلَى' },
    4: { 2: 'ثَلَثَا' },
    5: { 0: 'خَالَطَا' },
  },
  23: {
    1: { 0: 'رَمَيَ', 2: 'رَامَيَ' },
    7: { 2: 'حَالَوَ' },
    8: { 2: 'قَالَوَ' },
  },
  24: {
    1: { 0: 'لَمَا = لَمَا' },
    3: { 1: 'فَحَفَظَ' },
    6: { 1: 'فَخَفَفَ' },
  },
  26: {
    3: { 1: 'لَأَذَنَ' },
    4: { 2: 'لَأَعَازَا' },
    8: { 1: 'لَأَشَرَ' },
  },
  27: {
    1: { 0: 'لَأَمَعَكَ' },
    2: { 0: 'لَأَصَبَرَ' },
    5: { 0: 'لَأَزَهَقَ' },
    7: { 0: 'لَأَمَرَضَ' },
  },
  28: {
    1: { 0: 'لَأَذَبَ' },
    2: { 1: 'فَحَدَثَ' },
    6: { 0: 'وَأَخَرَ' },
    8: { 1: 'يَظَهَرَ', 2: 'لَأَزَاغَا' },
  },
  29: {
    2: { 0: 'شَأَ', 1: 'أَهَ', 2: 'أَعَ' },
    3: { 2: 'كَاقَ', 3: 'تَاطَ' },
    4: { 3: 'ذَاظَ' },
  },
  30: {
    1: { 2: 'صَالَحَا' },
    2: { 0: 'تَوَابَ' },
    4: { 0: 'غَلَظَ', 3: 'قَالَ بَلَى' },
    5: { 3: 'لَأَطَاعَ' },
    7: { 0: 'مَلَأَ' },
  },
};

const letterNames: Record<string, string> = {
  'ا': 'A', 'أ': 'A', 'إ': 'I', 'ء': 'A', 'آ': 'AA', 'ى': 'AA',
  'ب': 'BA', 'ت': 'TA', 'ث': 'TSA', 'ج': 'JA', 'ح': 'HA', 'خ': 'KHO',
  'د': 'DA', 'ذ': 'DZA', 'ر': 'RO', 'ز': 'ZA', 'س': 'SA', 'ش': 'SYA',
  'ص': 'SO', 'ض': 'DHO', 'ط': 'TO', 'ظ': 'ZHO', 'ع': "'A", 'غ': 'GHO',
  'ف': 'FA', 'ق': 'QO', 'ك': 'KA', 'ل': 'LA', 'م': 'MA', 'ن': 'NA',
  'و': 'WA', 'ه': 'HA', 'ي': 'YA',
};

function phonetic(arabic: string): string {
  return arabic.replace(/[ا-يآأإءى][َُِّْ]*[اى](?![َُِّْ])/gu, (syllable) => {
    const letter = Array.from(syllable)[0];
    return `${letterNames[letter] || letter}A`;
  }).replace(/[ا-يآأإءى][َُِّْ]*/gu, (syllable) => {
    const letter = Array.from(syllable)[0];
    return letterNames[letter] || letter;
  }).replace(/ {2,}/gu, ' ');
}

function correctedItem(item: IqroItem, printed: string): IqroItem {
  if (printed === item.arabic) return item;
  const syllables = printed.match(/[ء-ي]َ/gu) || [];
  const letters = Array.from('ابتثجحخدذرزسشصضطظعغفقكلمنوهي');
  const audioUrls = !printed.includes(' ') && syllables.length > 1
    && syllables.join('') === printed
    ? syllables.map((syllable) => {
      const letter = Array.from(syllable)[0];
      const index = letters.indexOf(letter) + 1;
      return index && index !== 25 && syllable.endsWith('َ')
        ? `/audio/iqro/verified/${index}-1.wav` : null;
    }) : null;
  return {
    ...item, arabic: printed, latin: phonetic(printed),
    ...(audioUrls?.every((url): url is string => url !== null) ? { audioUrls } : {}),
  };
}

export function iqro2PagesFromBook(existingPages: IqroPage[]): IqroPage[] {
  return existingPages.map((page) => {
    const number = page.pageNumber;
    let rows = page.rows.map((row, index) => ({
      ...row,
      items: row.items.map((item, itemIndex) => {
        const source = corrections[number]?.[index + 1]?.[itemIndex]
          // The first printed page introduces connected letters; they must
          // also look connected on the interactive cards.
          || (number === 1 && index >= 2 && index <= 4
            ? item.arabic.replace(/\s+/gu, '') : item.arabic);
        const printed = number >= 3
          ? source.replace(/(^|[\s=]|[وف]َ)اَ/gu, '$1أَ') : source;
        return correctedItem(item, printed);
      }),
    }));

    if (number === 16) {
      // The warning in the centre divides these examples into two rows.
      const [first, second, third, fourth] = rows[3].items;
      rows = [
        ...rows.slice(0, 3),
        { ...rows[3], items: [
          correctedItem(first, 'لَأَمَنَعَ'),
          correctedItem(third, 'لَأَثَرَ'),
        ] },
        { id: 'j2_p16_r4b', items: [
          correctedItem(second, 'لَأَخَكَ'),
          correctedItem(fourth, 'فَهَمَنَ'),
        ] },
        ...rows.slice(4),
      ];
    }

    if (number === 17) {
      const glyphs = ['ثَ', 'شَ', 'أَ', 'عَ', 'أَ', 'حَ', 'هَ', 'قَ', 'خَ', 'غَ', 'ذَ', 'ظَ', 'ضَ'];
      rows[0] = {
        ...rows[0],
        items: glyphs.map((glyph, index) => ({
          id: `printed_letter_${index}`, arabic: glyph, latin: phonetic(glyph),
        })),
      };
    }

    if (number === 22) {
      // The explanation about ى is prose in the source, not an exercise.
      rows[0] = { ...rows[0], items: rows[0].items.slice(0, 1) };
    }

    if (number === 29) {
      const glyphs = ['أَ', 'عَا', 'هَا', 'حَا', 'خَا', 'قَا', 'غَا', '---غَى'];
      rows[5] = {
        ...rows[5],
        items: glyphs.map((glyph, index) => ({
          id: `printed_letter_${index}`, arabic: glyph,
          latin: index === 7 ? 'GHAA' : phonetic(glyph),
        })),
      };
    }

    // Apply after the replacement rows too: their original durations may
    // describe a different printed word or a lesson that has not taught mad.
    rows = rows.map((row) => ({ ...row, items: row.items.map((item) => {
      const isLong = number >= 14 && (/[ب-يءَأإ]َ[اى]/u.test(item.arabic)
        || /لاَ|آ/u.test(item.arabic));
      return item.isLong === isLong ? item : { ...item, isLong };
    }) }));

    return number === 24
      ? { ...page, title: 'Halaman 24: Bentuk Sambung Lam dan Alif',
          teacherNote: 'Perhatikan bentuk huruf lam dan alif saat disambung.', rows }
      : { ...page, rows };
  });
}
