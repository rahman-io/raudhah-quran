import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import { useBackHandler } from '../../../utils/backNavigation';
import { loadKemenagSurah, loadReaderSurah, splitKemenagWords, type ReaderSurahMeta } from '../../../services/quranReaderData';
import {
  firstPageOfJuz,
  juzOfPage,
  loadMushafLayout,
  TOTAL_PAGES,
  type MushafLayout,
  type MushafLine
} from '../../../services/mushafLayout';
import { AyahEndMarker } from '../AyahEndMarker';
import { HeaderPill, MushafFrame, SurahTitleCard } from './MushafOrnaments';
import { curlStyles, grabPoint, type Point } from './pageCurl';
import { MushafHifzBar, useMushafHifz, hifzKey, type HifzWordState, type PageWord } from './useMushafHifz';
import { loadTajwidSurah, type TajwidMark } from '../../../services/tajwidData';
import { ColoredWord } from '../../tajwid/TajwidWord';

/**
 * Mode Mushaf: satu halaman (atau dua halaman berdampingan di layar lebar) seperti mushaf cetak.
 * Isinya teks Mushaf Standar Indonesia (font LPMQ), disusun per baris menurut data 604 halaman.
 * Setiap ayat bisa diketuk dan disorot saat murottal diputar. Geser layar untuk membalik halaman
 * (arah mushaf: halaman berikutnya di sebelah kiri, jadi geser ke kanan).
 */

export interface AyahRef {
  surah: number;
  ayah: number;
}

interface Props {
  page: number;
  onPageChange: (page: number) => void;
  surahs: ReaderSurahMeta[];
  /** Ayat yang sedang dibacakan murottal. */
  activeAyah: AyahRef | null;
  /** Ayat yang dipilih / dituju (disorot lembut). */
  markedAyah: AyahRef | null;
  onAyahTap: (surah: number, ayah: number) => void;
  /** Layar penuh: halaman setinggi layar, tombol halaman melayang di bawah. */
  immersive?: boolean;
  /** Layar penuh: tombol halaman tampil (muncul saat layar disentuh, hilang sendiri). */
  controlsVisible?: boolean;
  /** Setor Hafalan: teks disembunyikan, kata muncul saat dibaca. */
  hifz?: {
    active: boolean;
    /** Jendela lain (Mode Hafalkan) sedang terbuka di atas Setor Hafalan. */
    paused?: boolean;
    /** Dari hasil setoran: latih satu ayat di Mode Hafalkan. */
    onTrainAyah: (surah: number, ayah: number) => void;
  };
}

const ARABIC_FONT = '"LPMQ Isep Misbah"';
const WORD_GAP_EM = 0.3;
const MARKER_EM = 1.15 + 0.6;
const LINE_HEIGHT = 1.92;
const MAX_FONT = 34;

/* ---------------- Pengukuran lebar kata (untuk ukuran huruf per halaman) ---------------- */
let measureCtx: CanvasRenderingContext2D | null = null;
const widthCache = new Map<string, number>();
function wordEm(word: string): number {
  const cached = widthCache.get(word);
  if (cached !== undefined) return cached;
  measureCtx ??= document.createElement('canvas').getContext('2d');
  if (!measureCtx) return word.length * 0.5;
  measureCtx.font = `100px ${ARABIC_FONT}, Amiri, serif`;
  measureCtx.direction = 'rtl';
  const em = measureCtx.measureText(word).width / 100;
  widthCache.set(word, em);
  return em;
}

/* ---------------- Teks ayat (Kemenag), dipetakan ke susunan baris ---------------- */
type AyahWords = Map<number, string[]>; // ayat → kata-kata MSI
type TextStore = Map<number, AyahWords>; // surah → ayat

type LineItem = { kind: 'word'; text: string; surah: number; ayah: number; index: number } | { kind: 'end'; surah: number; ayah: number };

/** Batas kata: posisi ke-k menurut data baris → posisi di teks MSI (jumlah kata bisa beda ±1). */
const mapBoundary = (k: number, layoutCount: number, textCount: number) =>
  layoutCount === textCount ? k : Math.round((k * textCount) / layoutCount);

function lineItems(line: Extract<MushafLine, { kind: 'text' }>, layout: MushafLayout, texts: TextStore): LineItem[] | null {
  const items: LineItem[] = [];
  let i = 0;
  const tokens = line.tokens;
  while (i < tokens.length) {
    const token = tokens[i];
    if (token.end) {
      items.push({ kind: 'end', surah: token.surah, ayah: token.ayah });
      i += 1;
      continue;
    }
    // Rangkaian kata dari ayat yang sama di baris ini.
    let j = i;
    while (j + 1 < tokens.length && !tokens[j + 1].end && tokens[j + 1].surah === token.surah && tokens[j + 1].ayah === token.ayah) j += 1;
    const words = texts.get(token.surah)?.get(token.ayah);
    if (!words) return null;
    const layoutCount = layout.words[token.surah - 1][token.ayah - 1];
    const from = mapBoundary(tokens[i].word - 1, layoutCount, words.length);
    const to = mapBoundary(tokens[j].word, layoutCount, words.length);
    words.slice(from, to).forEach((text, k) => items.push({ kind: 'word', text, surah: token.surah, ayah: token.ayah, index: from + k }));
    i = j + 1;
  }
  return items;
}

const itemsEm = (items: LineItem[]) =>
  items.reduce((sum, item) => sum + (item.kind === 'word' ? wordEm(item.text) : MARKER_EM), 0) + WORD_GAP_EM * Math.max(0, items.length - 1);

/** Lebar isi halaman (di dalam bingkai) untuk lebar halaman tertentu. */
const innerWidthOf = (width: number) => Math.max(200, width - 2 * 12 - 22);

/** Ukuran huruf alami satu halaman: baris terpanjangnya pas selebar halaman. null bila teks belum dimuat. */
function naturalFontSize(page: number, layout: MushafLayout, texts: TextStore, width: number): number | null {
  let maxEm = 10;
  for (const line of layout.pages[page - 1]) {
    if (line.kind !== 'text') continue;
    const items = lineItems(line, layout, texts);
    if (!items) return null;
    maxEm = Math.max(maxEm, itemsEm(items));
  }
  if (page <= 2) maxEm *= 1.25; // Al-Fatihah & awal Al-Baqarah: baris di tengah, lebih lapang
  return innerWidthOf(width) / maxEm;
}

/** Urutan kata (urutan baca) di halaman-halaman ini; kosong bila teksnya belum dimuat. */
function pageWords(pages: number[], layout: MushafLayout, texts: TextStore): PageWord[] {
  const list: PageWord[] = [];
  for (const page of pages) {
    for (const line of layout.pages[page - 1]) {
      if (line.kind !== 'text') continue;
      const items = lineItems(line, layout, texts);
      if (!items) return [];
      items.forEach((item) => item.kind === 'word' && list.push({ surah: item.surah, ayah: item.ayah, index: item.index, text: item.text }));
    }
  }
  return list;
}

/** Tampilan kata di Mode Hafalan (diteruskan ke setiap halaman). */
interface HifzRender {
  stateOf: (surah: number, ayah: number, index: number) => HifzWordState;
  showMistakes: boolean;
  /** Tanda tajwid per surah → ayat (null = warna tajwid mati). */
  tajwid: Map<number, Map<number, TajwidMark[]>> | null;
}

/* ---------------- Satu halaman ---------------- */
const sameAyah = (a: AyahRef | null, surah: number, ayah: number) => !!a && a.surah === surah && a.ayah === ayah;

interface PageProps {
  page: number;
  layout: MushafLayout;
  texts: TextStore;
  basmalah: string[] | null;
  surahs: ReaderSurahMeta[];
  width: number;
  /** Ukuran huruf dasar halaman ini (pas selebar halaman; dua halaman berdampingan memakai ukuran yang sama). */
  fontSize: number;
  /** Perbesaran huruf pilihan pengguna (1 = pas selebar halaman). */
  scale: number;
  /** Tinggi minimum halaman agar memenuhi layar. */
  minHeight: number;
  activeAyah: AyahRef | null;
  markedAyah: AyahRef | null;
  onAyahTap: (surah: number, ayah: number) => void;
  hifz?: HifzRender;
}

const MushafPage: React.FC<PageProps> = React.memo(
  ({ page, layout, texts, basmalah, surahs, width, fontSize: baseFont, scale, minHeight, activeAyah, markedAyah, onAyahTap, hifz }) => {
    const lines = layout.pages[page - 1];
    const rendered = useMemo(
      () => lines.map((line) => (line.kind === 'text' ? lineItems(line, layout, texts) : null)),
      [lines, layout, texts]
    );
    const ready = rendered.every((items, i) => lines[i].kind !== 'text' || items);

    const innerWidth = innerWidthOf(width);
    const special = page <= 2; // Al-Fatihah & awal Al-Baqarah: baris lebih sedikit dan di tengah
    const fontSize = baseFont * scale;
    // Huruf diperbesar melebihi lebar baris: teks mengalir (isi halaman tetap sama, baris menyesuaikan).
    const reflow = scale > 1.01;
    const lineEms = rendered.map((items) => (items ? itemsEm(items) : 0));
    const lineHeight = fontSize * LINE_HEIGHT;
    const surahMeta = (n: number) => surahs.find((s) => s.number === n);
    const firstSurah = lines.map((l) => (l.kind === 'text' ? l.tokens[0].surah : l.surah)).find(Boolean) ?? 1;
    const meta = surahMeta(firstSurah);
    const odd = page % 2 === 1;

    /** Kata di Mode Hafalan: tersembunyi (tetap memakan tempat), muncul saat terbaca, oranye bila salah. */
    const wordNode = (item: Extract<LineItem, { kind: 'word' }>) => {
      if (!hifz) return item.text;
      const state = hifz.stateOf(item.surah, item.ayah, item.index);
      const key = hifzKey(item.surah, item.ayah, item.index);
      if (state === 'hidden' || state === 'current') {
        return (
          <span data-hifz-word={key} className={`text-transparent select-none ${state === 'current' ? 'border-b-2 border-[#D3A253]' : ''}`} aria-hidden="true">
            {item.text}
          </span>
        );
      }
      if (state === 'hint') {
        return (
          <span data-hifz-word={key} className="hifz-reveal text-[#7A8C96] dark:text-slate-400">
            {item.text}
          </span>
        );
      }
      if (state === 'missed' && hifz.showMistakes) {
        return (
          <span data-hifz-word={key} className="hifz-reveal rounded text-[#C2410C] dark:text-[#FDBA74] bg-amber-100/80 dark:bg-amber-900/30">
            {item.text}
          </span>
        );
      }
      const marks = hifz.tajwid?.get(item.surah)?.get(item.ayah)?.filter((m) => m.word === item.index);
      return (
        <span data-hifz-word={key} className={state === 'shown' ? 'opacity-60' : 'hifz-reveal'}>
          {marks?.length ? <ColoredWord text={item.text} marks={marks} /> : item.text}
        </span>
      );
    };

    const toneOf = (surah: number, ayah: number) =>
      hifz
        ? ''
        : sameAyah(activeAyah, surah, ayah)
        ? 'bg-[#D3A253]/35 dark:bg-[#D3A253]/30'
        : sameAyah(markedAyah, surah, ayah)
          ? 'bg-[#246579]/12 dark:bg-[#5FA8B8]/20'
          : '';

    const header = (line: Extract<MushafLine, { kind: 'header' }>, key: string) => {
      const m = surahMeta(line.surah);
      return (
        <div key={key} className="py-1 shrink-0" style={{ height: Math.max(lineHeight, 44) }}>
          <SurahTitleCard nameArabic={m?.nameArabic ?? ''} revelationType={m?.revelationType} ayahCount={m?.numberOfAyahs} fontSize={Math.max(fontSize, 22)} />
        </div>
      );
    };
    const basmalahLine = (key: string) => (
      <div
        key={key}
        className="flex items-center justify-center font-mushaf-id text-[#173B4E] dark:text-[#EEF4F5] border-b border-[#D3A253]/35 shrink-0"
        style={{ minHeight: lineHeight, fontSize: fontSize * 0.95, lineHeight: 1 }}
      >
        {basmalah?.join(' ') ?? 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ'}
      </div>
    );

    /** Satu baris mushaf: rata kiri-kanan; jarak antarkata jadi padding agar sorotan ayat menyambung. */
    const fixedLine = (items: LineItem[], index: number) => {
      const centered = special || lineEms[index] * fontSize < innerWidth * 0.72;
      const spare = centered
        ? (WORD_GAP_EM * fontSize) / 2
        : Math.max(0, (innerWidth - lineEms[index] * fontSize) / Math.max(1, items.length - 1) / 2) * 0.9;
      return (
        <div
          key={`t${index}`}
          className={`flex items-center border-b border-[#D3A253]/35 last:border-b-0 font-mushaf-id text-[#173B4E] dark:text-[#EEF4F5] ${
            centered ? 'justify-center' : 'justify-between'
          }`}
          style={{ flex: '1 0 auto', minHeight: lineHeight, fontSize, lineHeight: 1, marginInline: centered ? 0 : -spare }}
        >
          {items.map((item, i) => {
            const prev = items[i - 1];
            const next = items[i + 1];
            const startsSegment = !prev || prev.surah !== item.surah || prev.ayah !== item.ayah;
            const endsSegment = !next || next.surah !== item.surah || next.ayah !== item.ayah;
            return (
              <span
                key={i}
                data-ayah={`${item.surah}:${item.ayah}`}
                onClick={() => onAyahTap(item.surah, item.ayah)}
                className={`inline-flex items-center self-stretch cursor-pointer transition-colors whitespace-nowrap ${startsSegment ? 'rounded-s-lg' : ''} ${
                  endsSegment ? 'rounded-e-lg' : ''
                } ${toneOf(item.surah, item.ayah)}`}
                style={{ paddingInline: spare }}
              >
                {item.kind === 'end' ? <AyahEndMarker number={item.ayah} fontSize={fontSize} /> : wordNode(item)}
              </span>
            );
          })}
        </div>
      );
    };

    /** Paragraf berakhir di ayat terakhir surah: baris terakhirnya di tengah, selain itu rata penuh. */
    const endsSurah = (items: LineItem[]) => {
      const last = items[items.length - 1];
      return !!last && last.kind === 'end' && last.ayah === (surahMeta(last.surah)?.numberOfAyahs ?? -1);
    };
    /** Mode huruf besar: baris-baris berurutan dialirkan jadi satu paragraf rata kiri-kanan. */
    const flowBlock = (items: LineItem[], key: string) => (
      <p
        key={key}
        className={`font-mushaf-id text-[#173B4E] dark:text-[#EEF4F5] text-justify ${endsSurah(items) ? '[text-align-last:center]' : '[text-align-last:justify]'}`}
        style={{
          fontSize,
          lineHeight: `${lineHeight}px`,
          backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${lineHeight - 1}px, rgba(211,162,83,0.35) ${lineHeight - 1}px, rgba(211,162,83,0.35) ${lineHeight}px)`
        }}
      >
        {items.map((item, i) => (
          <span
            key={i}
            data-ayah={`${item.surah}:${item.ayah}`}
            onClick={() => onAyahTap(item.surah, item.ayah)}
            className={`cursor-pointer rounded-md transition-colors [box-decoration-break:clone] ${toneOf(item.surah, item.ayah)}`}
          >
            {item.kind === 'end' ? (
              <span className="inline-flex align-middle mx-0.5">
                <AyahEndMarker number={item.ayah} fontSize={fontSize} />
              </span>
            ) : (
              wordNode(item)
            )}{' '}
          </span>
        ))}
      </p>
    );

    const body = () => {
      if (!reflow) {
        return lines.map((line, index) =>
          line.kind === 'header' ? header(line, `h${index}`) : line.kind === 'basmalah' ? basmalahLine(`b${index}`) : fixedLine(rendered[index]!, index)
        );
      }
      // Gabungkan baris teks yang berurutan menjadi paragraf; judul & basmalah tetap barisnya sendiri.
      const blocks: React.ReactNode[] = [];
      let run: LineItem[] = [];
      const flush = (key: string) => {
        if (run.length) blocks.push(flowBlock(run, key));
        run = [];
      };
      lines.forEach((line, index) => {
        if (line.kind === 'text') run.push(...rendered[index]!);
        else {
          flush(`f${index}`);
          blocks.push(line.kind === 'header' ? header(line, `h${index}`) : basmalahLine(`b${index}`));
        }
      });
      flush('f-end');
      return blocks;
    };

    return (
      <MushafFrame className="w-full">
        <div className="px-3 pt-2.5 pb-3 flex flex-col" style={{ minHeight }}>
          {/* Kepala halaman: nama surah, nomor halaman, juz (bergantian sisi seperti mushaf) */}
          <div className={`flex items-center justify-between gap-2 mb-1.5 shrink-0 ${odd ? 'flex-row-reverse' : ''}`}>
            <HeaderPill className="min-w-[30%]">{meta ? `${meta.number}. ${meta.nameLatin}` : ''}</HeaderPill>
            <HeaderPill>{page}</HeaderPill>
            <HeaderPill className="min-w-[30%]">JUZ {juzOfPage(page)}</HeaderPill>
          </div>

          {!ready ? (
            <div className="flex-1 flex items-center justify-center gap-2 text-sm text-[#246579]" style={{ minHeight: lineHeight * 8 }}>
              <Loader2 className="w-5 h-5 animate-spin" /> Memuat halaman…
            </div>
          ) : (
            <div className={`flex-1 flex flex-col ${special ? 'justify-center py-4' : reflow ? 'justify-start' : ''}`} dir="rtl">
              {body()}
            </div>
          )}
        </div>
      </MushafFrame>
    );
  }
);
MushafPage.displayName = 'MushafPage';

/* ---------------- Pengatur halaman + efek balik lembar ---------------- */
interface Turn {
  /** Halaman tujuan. */
  to: number;
  /** +1 = halaman berikutnya (lembar sekarang dilipat), -1 = sebelumnya (lembar sebelumnya kembali menutup). */
  dir: 1 | -1;
}

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * Ukuran huruf Mode Mushaf (px, disimpan per perangkat; kosong = otomatis).
 * Bila ukuran ≤ ukuran yang pas dengan lebar baris, halaman tampil persis per baris seperti mushaf;
 * bila lebih besar, teks halaman itu mengalir menyesuaikan layar (isi halamannya tetap sama).
 */
const FONT_KEY = 'raudhah_mushaf_font_v1';
const MIN_FONT_PX = 12;
const MAX_FONT_PX = 44;
/** Ukuran otomatis di layar sempit agar nyaman dibaca. */
const AUTO_FONT_PX = 22;
const clampFont = (value: number) => Math.round(Math.min(MAX_FONT_PX, Math.max(MIN_FONT_PX, value)));
const readFontPref = (): number | null => {
  try {
    const value = Number(localStorage.getItem(FONT_KEY));
    return value ? clampFont(value) : null;
  } catch {
    return null;
  }
};

export const MushafView: React.FC<Props> = ({ page, onPageChange, surahs, activeAyah, markedAyah, onAyahTap, immersive = false, controlsVisible = true, hifz }) => {
  const [layout, setLayout] = useState<MushafLayout | null>(null);
  const [layoutError, setLayoutError] = useState(false);
  const [texts, setTexts] = useState<TextStore>(new Map());
  const [basmalah, setBasmalah] = useState<string[] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [spread, setSpread] = useState(false);
  const [shown, setShown] = useState(page);
  const [turn, setTurn] = useState<Turn | null>(null);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(() => (typeof window !== 'undefined' ? window.innerHeight : 800));
  const [fontPref, setFontPrefState] = useState<number | null>(readFontPref);
  const setFontPref = useCallback((value: number) => {
    const next = clampFont(value);
    setFontPrefState(next);
    try {
      localStorage.setItem(FONT_KEY, String(next));
    } catch {
      // abaikan
    }
  }, []);

  const loadLayout = useCallback(() => {
    setLayoutError(false);
    loadMushafLayout().then(setLayout).catch(() => setLayoutError(true));
  }, []);
  useEffect(loadLayout, [loadLayout]);

  useEffect(() => {
    if (!document.fonts?.load) return setFontsReady(true);
    document.fonts.load(`40px ${ARABIC_FONT}`, 'بِسْمِ').finally(() => {
      widthCache.clear();
      setFontsReady(true);
    });
  }, []);

  // Lebar wadah & tampilan dua halaman (layar lebar mendatar).
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      const wide = w >= 880 && window.innerWidth > window.innerHeight;
      // Ponsel/tablet tegak: halaman selebar layar. Dua halaman berdampingan: setinggi layar.
      const byHeight = Math.max(320, (window.innerHeight - (immersive ? 40 : 170)) * 0.64);
      setSpread(wide);
      setWidth(Math.floor(wide ? Math.min((w - 16) / 2, byHeight) : Math.min(w, 680)));
      setViewportHeight(window.innerHeight);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [layout, immersive]);

  // Halaman yang tampil: satu halaman, atau pasangan (ganjil di kanan, genap di kiri).
  const spreadOf = (p: number) => (p % 2 === 1 ? [p, Math.min(TOTAL_PAGES, p + 1)] : [p - 1, p]);
  const visiblePages = useMemo(() => {
    const base = spread ? spreadOf(shown) : [shown];
    const around = new Set<number>();
    base.forEach((p) => [p - 1, p, p + 1, p + 2].forEach((x) => x >= 1 && x <= TOTAL_PAGES && around.add(x)));
    if (turn) around.add(turn.to);
    return { base, around: [...around] };
  }, [shown, spread, turn]);

  /* ----- Mode Hafalan: teks disembunyikan, kata muncul saat dibaca ----- */
  const hifzActive = !!hifz?.active;
  const hifzWords = useMemo(
    () => (hifzActive && layout ? pageWords(spread ? spreadOf(shown) : [shown], layout, texts) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hifzActive, layout, texts, shown, spread]
  );
  const nextPageRef = useRef<() => void>(() => undefined);
  const hifzState = useMushafHifz({
    active: hifzActive,
    paused: !!hifz?.paused,
    words: hifzWords,
    onPageDone: () => nextPageRef.current(),
    ayahWordCount: (surah, ayah) => texts.get(surah)?.get(ayah)?.length ?? 0
  });
  const [tajwidMarks, setTajwidMarks] = useState<Map<number, Map<number, TajwidMark[]>>>(new Map());
  useEffect(() => {
    if (!hifzActive || !hifzState.prefs.tajwid) return;
    new Set(hifzWords.map((w) => w.surah)).forEach((surah) => {
      if (tajwidMarks.has(surah)) return;
      loadTajwidSurah(surah)
        .then((map) => map && setTajwidMarks((prev) => (prev.has(surah) ? prev : new Map(prev).set(surah, map))))
        .catch(() => undefined);
    });
  }, [hifzActive, hifzState.prefs.tajwid, hifzWords, tajwidMarks]);
  // Setor ulang dari ayat tertentu: bila ayatnya di halaman lain, buka halamannya dulu.
  const pendingStartRef = useRef<AyahRef | null>(null);
  const restartHifzFrom = (surah: number, ayah: number) => {
    hifzState.closeReport();
    if (hifzWords.some((w) => w.surah === surah && w.ayah === ayah)) {
      hifzState.startAt(surah, ayah);
      return;
    }
    const target = layout?.ayahPage.get(`${surah}:${ayah}`);
    if (!target) return;
    pendingStartRef.current = { surah, ayah };
    goToRef.current(target);
  };
  useEffect(() => {
    const pending = pendingStartRef.current;
    if (!pending || !hifzWords.some((w) => w.surah === pending.surah && w.ayah === pending.ayah)) return;
    pendingStartRef.current = null;
    hifzState.startAt(pending.surah, pending.ayah);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hifzWords]);
  const goToRef = useRef<(page: number) => void>(() => undefined);
  const hifzTapRef = useRef<((surah: number, ayah: number) => void) | null>(null);
  hifzTapRef.current = hifzActive ? hifzState.startAt : null;
  const hifzRender: HifzRender | undefined = hifzActive
    ? { stateOf: hifzState.stateOf, showMistakes: hifzState.prefs.showMistakes, tajwid: hifzState.prefs.tajwid ? tajwidMarks : null }
    : undefined;
  // Ikuti posisi baca: kata berikutnya tetap terlihat di atas bilah Mode Hafalan.
  useEffect(() => {
    if (!hifzActive || !hifzState.frontierKey) return;
    const el = containerRef.current?.querySelector(`[data-hifz-word="${hifzState.frontierKey}"]`);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.bottom > window.innerHeight - 170 || rect.top < 60) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [hifzActive, hifzState.frontierKey]);

  // Muat teks surah-surah yang tampil di halaman ini dan sekitarnya.
  useEffect(() => {
    if (!layout) return;
    const needed = new Set<number>();
    visiblePages.around.forEach((p) =>
      layout.pages[p - 1].forEach((line) => {
        if (line.kind === 'text') line.tokens.forEach((t) => needed.add(t.surah));
      })
    );
    needed.forEach((surah) => {
      if (texts.has(surah)) return;
      loadKemenagSurah(surah)
        .then(async (map) => {
          const words: AyahWords = new Map();
          if (map) map.forEach((text, ayah) => words.set(ayah, splitKemenagWords(text)));
          else {
            // Cadangan: teks Utsmani dari data per kata bila teks Kemenag belum diimpor.
            const reader = await loadReaderSurah(surah);
            reader.ayahs.forEach((a) => words.set(a.ayahNumber, a.words.map((w) => w.arabic)));
          }
          setTexts((prev) => (prev.has(surah) ? prev : new Map(prev).set(surah, words)));
        })
        .catch(() => undefined);
    });
  }, [layout, visiblePages, texts]);

  useEffect(() => {
    loadKemenagSurah(1).then((map) => {
      const text = map?.get(1);
      if (text) setBasmalah(splitKemenagWords(text).filter((w) => /[ء-يٱ-ۓ]/.test(w)));
    });
  }, []);

  /* ----- Membalik halaman: efek lipatan kertas ----- */
  // Lapisan: halaman atas (dilipat), halaman bawah, punggung lipatan, dan bayangannya.
  const frontRef = useRef<HTMLDivElement>(null);
  const flapRef = useRef<HTMLDivElement>(null);
  const underShadeRef = useRef<HTMLDivElement>(null);
  const curl = useRef<{ a: Point; p: Point; w: number; h: number } | null>(null);
  const animRef = useRef<number | null>(null);

  /** Terapkan lipatan dengan titik jari P (langsung ke DOM, tanpa render ulang React). */
  const applyCurl = useCallback((p: Point) => {
    const c = curl.current;
    if (!c) return;
    c.p = p;
    const styles = curlStyles(c.a, p, c.w, c.h);
    const front = frontRef.current;
    const flap = flapRef.current;
    const shade = underShadeRef.current;
    if (!front) return;
    if (!styles) {
      front.style.clipPath = '';
      if (flap) flap.style.visibility = 'hidden';
      return;
    }
    front.style.clipPath = styles.front;
    if (flap) {
      flap.style.visibility = 'visible';
      flap.style.clipPath = styles.flapClip;
      flap.style.transform = styles.flapTransform;
      flap.style.background = styles.flapBackground;
    }
    if (shade) shade.style.background = styles.underShade;
  }, []);

  /** Gerakkan titik lipatan dari posisinya sekarang ke `target` (lengkung sedikit ke atas seperti tangan). */
  const animateCurl = useCallback(
    (target: Point, done: () => void, lift = 0) => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      const c = curl.current;
      if (!c) return done();
      const from = { ...c.p };
      const distance = Math.hypot(target.x - from.x, target.y - from.y);
      const duration = Math.max(160, Math.min(prefersReducedMotion() ? 260 : 720, (distance / (2 * c.w)) * 760));
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const e = easeInOut(t);
        applyCurl({ x: from.x + (target.x - from.x) * e, y: from.y + (target.y - from.y) * e - Math.sin(Math.PI * e) * lift });
        if (t < 1) animRef.current = requestAnimationFrame(step);
        else {
          animRef.current = null;
          done();
        }
      };
      animRef.current = requestAnimationFrame(step);
    },
    [applyCurl]
  );

  /** Mulai lipatan: ukur halaman atas, letakkan titik pegangan & titik awal jari. */
  const pendingStart = useRef<{ a: Point; p: Point; then?: () => void } | null>(null);
  const beginTurn = (next: Turn, grabY: number | null, then?: () => void) => {
    const rect = frontRef.current?.getBoundingClientRect();
    const w = rect?.width ?? width;
    const h = rect?.height ?? width * 1.5;
    const a = grabPoint(grabY ?? h * 0.94, h);
    // Halaman berikutnya: lembar sekarang mulai rata (P = A). Sebelumnya: lembar datang terlipat penuh.
    const p = next.dir === 1 ? { ...a } : { x: 2 * w + 40, y: a.y };
    curl.current = { a, p, w, h };
    pendingStart.current = { a, p, then };
    setTurn(next);
  };
  // Setelah lapisan lipatan dirender, terapkan posisi awal lalu jalankan animasi (bila ada).
  useLayoutEffect(() => {
    const start = pendingStart.current;
    if (!turn || !start) return;
    pendingStart.current = null;
    applyCurl(start.p);
    start.then?.();
  }, [turn, applyCurl]);

  const finishTurn = (committed: boolean, to: number) => {
    curl.current = null;
    if (frontRef.current) frontRef.current.style.clipPath = '';
    setTurn(null);
    if (committed) {
      setShown(to);
      if (to !== page) onPageChange(to);
    }
  };

  const stepSize = spread ? 2 : 1;
  const goTo = useCallback(
    (target: number, animate = true) => {
      const to = Math.min(TOTAL_PAGES, Math.max(1, target));
      if (to === shown || turn) return;
      const dir: 1 | -1 = to > shown ? 1 : -1;
      const near = Math.abs(to - shown) <= stepSize;
      if (!animate || !near || spread) {
        setTurn(null);
        setShown(to);
        if (to !== page) onPageChange(to);
        return;
      }
      // Tombol: lipat otomatis dari sudut bawah, seperti membalik lembar dengan tangan.
      beginTurn({ to, dir }, null, () => {
        const c = curl.current!;
        const target = dir === 1 ? { x: 2 * c.w + 40, y: c.a.y } : { ...c.a };
        animateCurl(target, () => finishTurn(true, to), c.h * 0.18);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shown, page, onPageChange, animateCurl, stepSize, spread, turn, width]
  );

  // Halaman diganti dari luar (lompat ke surah, murottal pindah halaman).
  useEffect(() => {
    if (page === shown || turn) return;
    const inSpread = spread && spreadOf(shown).includes(page);
    if (inSpread) return;
    goTo(page, Math.abs(page - shown) <= stepSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Setelah berganti halaman, mulai baca dari atas halaman bila sudah tergulir ke bawah.
  const firstShown = useRef(true);
  useEffect(() => {
    if (firstShown.current) {
      firstShown.current = false;
      return;
    }
    const top = containerRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) window.scrollTo({ top: window.scrollY + top - 96 });
  }, [shown]);

  const next = () => goTo(spread ? spreadOf(shown)[0] + 2 : shown + 1);
  const previous = () => goTo(spread ? spreadOf(shown)[0] - 2 : shown - 1);
  nextPageRef.current = next;
  goToRef.current = (target: number) => goTo(target, false);

  // Keyboard: panah kiri = berikutnya (arah mushaf), panah kanan = sebelumnya.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;
      if (event.key === 'ArrowLeft') next();
      else if (event.key === 'ArrowRight') previous();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Geser untuk membalik: tarik tepi kiri ke kanan = halaman berikutnya (lipatan mengikuti jari);
  // tarik ke kiri = lembar sebelumnya kembali menutup.
  const drag = useRef<{ x: number; y: number; id: number; active: boolean; dir: 1 | -1 | 0; grabY: number } | null>(null);
  const suppressTap = useRef(false);
  const onPointerDown = (event: React.PointerEvent) => {
    if (turn || (event.pointerType === 'mouse' && event.button !== 0)) return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    drag.current = { x: event.clientX, y: event.clientY, id: event.pointerId, active: false, dir: 0, grabY: event.clientY - rect.top };
    suppressTap.current = false;
  };
  const fingerPoint = (d: NonNullable<typeof drag.current>, event: React.PointerEvent): Point | null => {
    const c = curl.current;
    if (!c) return null;
    const dx = event.clientX - d.x;
    const dy = event.clientY - d.y;
    // Lipatan bergerak setengah dari titik pegangan, jadi titik pegangan dibawa dua kali jarak jari.
    return d.dir === 1
      ? { x: Math.max(0, c.a.x + 2 * dx), y: c.a.y + dy * 0.8 }
      : { x: Math.max(0, 2 * c.w + 40 + 2 * dx), y: c.a.y + dy * 0.8 };
  };
  const onPointerMove = (event: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== event.pointerId) return;
    const dx = event.clientX - d.x;
    const dy = event.clientY - d.y;
    if (!d.active) {
      if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      const dir: 1 | -1 = dx > 0 ? 1 : -1;
      const target = dir === 1 ? shown + stepSize : shown - stepSize;
      if (target < 1 || target > TOTAL_PAGES) return;
      d.active = true;
      d.dir = dir;
      // Mulai dari posisi jari sekarang agar lipatan tidak melompat.
      d.x = event.clientX - (dir === 1 ? 4 : -4);
      d.y = event.clientY;
      suppressTap.current = true;
      (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
      if (spread) return;
      beginTurn({ to: target, dir }, d.grabY);
      return;
    }
    if (spread || !d.dir) return;
    const p = fingerPoint(d, event);
    if (p) applyCurl(p);
  };
  const onPointerUp = (event: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d || !d.active) return;
    const dx = event.clientX - d.x;
    if (spread) {
      if (Math.abs(dx) > 50) (d.dir === 1 ? next : previous)();
      return;
    }
    const c = curl.current;
    const current = turn;
    if (!c || !current) return;
    // Selesai bila lipatan sudah lewat ±35% (berikutnya) atau sudah tertutup ±35% (sebelumnya).
    const opened = (c.p.x - c.a.x) / (2 * c.w + 40);
    const committed = current.dir === 1 ? opened > 0.35 || dx > 140 : opened < 0.65 || dx < -140;
    const flat = { ...c.a };
    const away = { x: 2 * c.w + 40, y: c.a.y };
    const target = current.dir === 1 ? (committed ? away : flat) : committed ? flat : away;
    animateCurl(target, () => finishTurn(committed, current.to));
  };

  // Tarikan miring (mis. dari sudut halaman) jangan sampai diambil alih gulir layar: begitu gerakan
  // awal lebih mendatar, gulir bawaan dicegah agar lipatan tetap mengikuti jari.
  const pageAreaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = pageAreaRef.current;
    if (!el) return;
    let start: { x: number; y: number } | null = null;
    let claimed = false;
    const onStart = (event: TouchEvent) => {
      claimed = false;
      start = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
    };
    const onMove = (event: TouchEvent) => {
      if (!start || event.touches.length !== 1) return;
      const dx = event.touches[0].clientX - start.x;
      const dy = event.touches[0].clientY - start.y;
      if (!claimed && Math.abs(dx) > 4 && Math.abs(dx) >= Math.abs(dy) * 0.9) claimed = true;
      if (claimed && event.cancelable) event.preventDefault();
    };
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
    };
  });

  // Cubit dua jari untuk memperbesar/memperkecil huruf.
  const pinch = useRef<{ distance: number; font: number } | null>(null);
  const touchDistance = (touches: React.TouchList) => Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
  const onTouchStart = (event: React.TouchEvent) => {
    if (event.touches.length !== 2) return;
    pinch.current = { distance: touchDistance(event.touches), font: currentFont };
    drag.current = null;
    if (turn) finishTurn(false, shown);
  };
  const onTouchMove = (event: React.TouchEvent) => {
    if (!pinch.current || event.touches.length !== 2) return;
    const ratio = touchDistance(event.touches) / pinch.current.distance;
    const next = clampFont(pinch.current.font * ratio);
    if (next !== currentFont) setFontPref(next);
  };
  const onTouchEnd = (event: React.TouchEvent) => {
    if (event.touches.length < 2) pinch.current = null;
  };

  const tap = useCallback(
    (surah: number, ayah: number) => {
      if (suppressTap.current) {
        suppressTap.current = false;
        return;
      }
      // Mode Hafalan: ketuk ayat = mulai membaca dari ayat itu.
      if (hifzTapRef.current) {
        hifzTapRef.current(surah, ayah);
        return;
      }
      onAyahTap(surah, ayah);
    },
    [onAyahTap]
  );

  if (layoutError) {
    return (
      <div className="bg-white dark:bg-slate-800/80 rounded-3xl p-6 text-center border border-slate-200 dark:border-slate-700 space-y-3">
        <p className="text-sm text-[#293640] dark:text-[#CBD5E1]">Data halaman mushaf belum bisa dimuat. Periksa koneksi internet Anda.</p>
        <button onClick={loadLayout} className="px-4 py-2 bg-[#246579] hover:bg-[#174C60] text-white text-xs font-semibold rounded-xl">
          Coba Lagi
        </button>
      </div>
    );
  }

  // Ukuran huruf dasar: baris terpanjang pas selebar halaman (dua halaman berdampingan: juga
  // tidak melebihi tinggi layar, dan keduanya memakai ukuran yang sama). Lalu dikali perbesaran.
  const heightCap = spread ? Math.max(16, (viewportHeight - 230) / (15 * LINE_HEIGHT)) : MAX_FONT;
  const fontFor = (pages: number[]) => {
    const sizes = layout ? pages.map((p) => naturalFontSize(p, layout, texts, width) ?? MAX_FONT) : [MAX_FONT];
    return Math.min(MAX_FONT, heightCap, ...sizes);
  };
  // Ukuran huruf yang dipakai: pilihan pengguna, atau otomatis (pas baris di layar lebar, 22px di ponsel).
  const baseOfShown = layout ? fontFor(spread ? spreadOf(shown) : [shown]) : AUTO_FONT_PX;
  const currentFont = fontPref ?? (baseOfShown >= 19 ? Math.round(baseOfShown) : AUTO_FONT_PX);
  const scaleFor = (base: number) => {
    const target = fontPref ?? (base >= 19 ? base : AUTO_FONT_PX);
    return target <= base + 0.5 ? 1 : target / base;
  };
  // Halaman memenuhi layar: tinggi minimum = layar dikurangi kepala app, menu bawah, dan tombol halaman.
  // Layar penuh: hanya dikurangi jarak tepi (tombol halaman melayang).
  const minHeight = Math.max(420, viewportHeight - (immersive ? 24 : spread ? 190 : 250));
  const pageProps = (p: number) => {
    const base = fontFor(spread ? spreadOf(p) : [p]);
    return {
    page: p,
    layout: layout!,
    texts,
    basmalah,
    surahs,
    width,
    fontSize: base,
    scale: scaleFor(base),
    minHeight,
    activeAyah,
    markedAyah,
    onAyahTap: tap,
    hifz: hifzRender
    };
  };

  // Lapisan balik lembar: halaman atas (dilipat) dan halaman di bawahnya.
  const top = turn ? (turn.dir === 1 ? shown : turn.to) : shown;
  const under = turn ? (turn.dir === 1 ? turn.to : shown) : null;

  const rangeLabel = spread ? `${spreadOf(shown)[0]}–${spreadOf(shown)[1]}` : String(shown);

  return (
    <div className="space-y-3 [overflow-x:clip]" ref={containerRef}>
      {!layout || !fontsReady || width === 0 ? (
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-[#246579] dark:text-[#A7CDD3]">
          <Loader2 className="w-5 h-5 animate-spin" /> Menyiapkan mushaf…
        </div>
      ) : (
        <div
          ref={pageAreaRef}
          className="relative mx-auto select-none touch-pan-y"
          style={{ width: spread ? undefined : width }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          aria-roledescription="halaman mushaf"
          aria-label={`Halaman ${rangeLabel} dari ${TOTAL_PAGES}`}
        >
          {spread ? (
            <div className="flex gap-4 justify-center" dir="rtl">
              {spreadOf(shown).map((p) => (
                <div key={p} style={{ width }}>
                  <MushafPage {...pageProps(p)} />
                </div>
              ))}
            </div>
          ) : (
            <>
              {under !== null && (
                <div className="absolute inset-0 overflow-hidden rounded-[18px]">
                  <MushafPage {...pageProps(under)} />
                  {/* Bayangan lipatan yang jatuh di halaman bawah */}
                  <div ref={underShadeRef} className="pointer-events-none absolute inset-0" />
                </div>
              )}
              <div ref={frontRef} className="relative" style={{ zIndex: 1 }}>
                <MushafPage {...pageProps(top)} />
              </div>
              {/* Punggung lembar yang terlipat (kertas bagian belakang), dengan bayangan di tepinya */}
              {turn && (
                <div className="pointer-events-none absolute inset-0" style={{ zIndex: 2, filter: 'drop-shadow(0 4px 10px rgba(15,30,36,0.35))' }}>
                  <div
                    ref={flapRef}
                    className="absolute inset-0 rounded-[18px]"
                    style={{ transformOrigin: '0 0', visibility: 'hidden', boxShadow: 'inset 0 0 0 1px rgba(211,162,83,0.55)' }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Navigasi halaman: arah mushaf (berikutnya di kiri). Layar penuh: melayang di bawah, sembunyi sendiri. */}
      <div
        className={
          immersive
            ? `fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 flex items-center justify-between gap-2 max-w-[620px] mx-auto transition-[transform,opacity] duration-300 ${
                controlsVisible && !hifzActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
              }`
            : 'relative flex items-center justify-between gap-2 max-w-[620px] mx-auto'
        }
        aria-hidden={immersive && (!controlsVisible || hifzActive)}
      >
        <button
          type="button"
          onClick={next}
          disabled={shown >= TOTAL_PAGES}
          className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#246579] dark:text-[#A7CDD3] disabled:opacity-40"
          aria-label="Halaman berikutnya"
        >
          <ChevronLeft className="w-4 h-4" /> <span className="hidden min-[400px]:inline">Berikutnya</span>
        </button>
        <button
          type="button"
          onClick={() => setJumpOpen((open) => !open)}
          className="px-3 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap text-[#173B4E] dark:text-white bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800"
          aria-expanded={jumpOpen}
          aria-label="Buka halaman, juz, dan ukuran huruf"
        >
          Hal. {rangeLabel} · Juz {juzOfPage(shown)} · <span className="font-bold">Aa</span>
        </button>
        <button
          type="button"
          onClick={previous}
          disabled={shown <= 1}
          className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#246579] dark:text-[#A7CDD3] disabled:opacity-40"
          aria-label="Halaman sebelumnya"
        >
          <span className="hidden min-[400px]:inline">Sebelumnya</span> <ChevronRight className="w-4 h-4" />
        </button>

        {jumpOpen &&
          createPortal(
          <PageJump
            current={shown}
            font={currentFont}
            fitFont={Math.floor(baseOfShown)}
            onFont={setFontPref}
            onClose={() => setJumpOpen(false)}
            onJump={(p) => {
              setJumpOpen(false);
              goTo(p, false);
            }}
          />,
            document.body
          )}
      </div>

      {hifzActive && hifz && (
        <>
          {/* Ruang agar baris terakhir tidak tertutup bilah Mode Hafalan */}
          <div className="h-28" aria-hidden="true" />
          <MushafHifzBar
            hifz={hifzState}
            immersive={immersive}
            surahName={(n) => surahs.find((m) => m.number === n)?.nameLatin ?? `Surah ${n}`}
            onTrain={hifz.onTrainAyah}
            onRestartFrom={restartHifzFrom}
          />
          <style>{'.hifz-reveal{animation:hifz-in .35s ease-out}@keyframes hifz-in{from{opacity:0;filter:blur(2px)}to{opacity:1;filter:none}}@media (prefers-reduced-motion:reduce){.hifz-reveal{animation:none}}'}</style>
        </>
      )}
    </div>
  );
};

/** Lompat ke halaman atau juz. */
const PageJump: React.FC<{
  current: number;
  font: number;
  /** Ukuran huruf terbesar yang masih pas per baris mushaf. */
  fitFont: number;
  onFont: (px: number) => void;
  onJump: (page: number) => void;
  onClose: () => void;
}> = ({ current, font, fitFont, onFont, onJump, onClose }) => {
  const [value, setValue] = useState(String(current));
  useBackHandler(true, onClose, 10);
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const n = Number(value);
    if (Number.isInteger(n) && n >= 1 && n <= TOTAL_PAGES) onJump(n);
  };
  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-6" role="dialog" aria-modal="true" aria-label="Halaman dan ukuran huruf">
    <div className="absolute inset-0 bg-[#0B1F27]/40" onClick={onClose} />
    <div className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-[#173B4E] dark:text-white">Buka halaman</p>
        <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Tutup">
          <X className="w-4 h-4" />
        </button>
      </div>
      <form onSubmit={submit} className="flex gap-2">
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={TOTAL_PAGES}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F8F6F1] dark:bg-slate-900/60 text-base text-[#173B4E] dark:text-white outline-none focus:border-[#246579]"
          aria-label={`Nomor halaman (1–${TOTAL_PAGES})`}
        />
        <button type="submit" className="px-4 rounded-xl bg-[#246579] text-white text-xs font-semibold">
          Buka
        </button>
      </form>
      <div>
        <p className="mb-1.5 text-[11px] font-semibold text-[#477F8D]">Ukuran huruf</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onFont(font - 2)}
            disabled={font <= MIN_FONT_PX}
            className="w-10 h-9 rounded-xl bg-[#246579]/[0.07] text-[#246579] dark:text-[#A7CDD3] font-bold disabled:opacity-40"
            aria-label="Perkecil huruf"
          >
            A−
          </button>
          <input
            type="range"
            min={MIN_FONT_PX}
            max={MAX_FONT_PX}
            step={1}
            value={font}
            onChange={(event) => onFont(Number(event.target.value))}
            className="flex-1 accent-[#246579]"
            aria-label="Ukuran huruf mushaf"
          />
          <button
            type="button"
            onClick={() => onFont(font + 2)}
            disabled={font >= MAX_FONT_PX}
            className="w-10 h-9 rounded-xl bg-[#246579]/[0.07] text-[#246579] dark:text-[#A7CDD3] font-bold text-lg disabled:opacity-40"
            aria-label="Perbesar huruf"
          >
            A+
          </button>
        </div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            {font}px · bisa juga dicubit dua jari. Isi setiap halaman tetap sama dengan mushaf.
          </p>
          <button
            type="button"
            onClick={() => onFont(fitFont)}
            className={`shrink-0 px-2 py-1 rounded-lg text-[10px] font-semibold ${
              font <= fitFont ? 'bg-[#246579] text-white' : 'bg-[#246579]/[0.07] text-[#246579] dark:text-[#A7CDD3]'
            }`}
          >
            Baris asli
          </button>
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-[11px] font-semibold text-[#477F8D]">Juz</p>
        <div className="grid grid-cols-6 gap-1.5">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
            <button
              key={juz}
              type="button"
              onClick={() => onJump(firstPageOfJuz(juz))}
              className={`h-8 rounded-lg text-xs font-semibold ${
                juz === juzOfPage(current) ? 'bg-[#246579] text-white' : 'bg-[#246579]/[0.07] text-[#246579] dark:text-[#A7CDD3] hover:bg-[#246579]/15'
              }`}
            >
              {juz}
            </button>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
};
