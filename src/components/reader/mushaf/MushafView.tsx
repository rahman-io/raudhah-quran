import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
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

type LineItem = { kind: 'word'; text: string; surah: number; ayah: number } | { kind: 'end'; surah: number; ayah: number };

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
    words.slice(from, to).forEach((text) => items.push({ kind: 'word', text, surah: token.surah, ayah: token.ayah }));
    i = j + 1;
  }
  return items;
}

const itemsEm = (items: LineItem[]) =>
  items.reduce((sum, item) => sum + (item.kind === 'word' ? wordEm(item.text) : MARKER_EM), 0) + WORD_GAP_EM * Math.max(0, items.length - 1);

/** Lebar isi halaman (di dalam bingkai) untuk lebar halaman tertentu. */
const innerWidthOf = (width: number) => Math.max(200, width - 2 * 18 - 22);

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

/* ---------------- Satu halaman ---------------- */
const sameAyah = (a: AyahRef | null, surah: number, ayah: number) => !!a && a.surah === surah && a.ayah === ayah;

interface PageProps {
  page: number;
  layout: MushafLayout;
  texts: TextStore;
  basmalah: string[] | null;
  surahs: ReaderSurahMeta[];
  width: number;
  /** Ukuran huruf halaman ini (dihitung pemanggil; dua halaman berdampingan memakai ukuran yang sama). */
  fontSize: number;
  activeAyah: AyahRef | null;
  markedAyah: AyahRef | null;
  onAyahTap: (surah: number, ayah: number) => void;
}

const MushafPage: React.FC<PageProps> = React.memo(({ page, layout, texts, basmalah, surahs, width, fontSize, activeAyah, markedAyah, onAyahTap }) => {
  const lines = layout.pages[page - 1];
  const rendered = useMemo(
    () => lines.map((line) => (line.kind === 'text' ? lineItems(line, layout, texts) : null)),
    [lines, layout, texts]
  );
  const ready = rendered.every((items, i) => lines[i].kind !== 'text' || items);

  const innerWidth = innerWidthOf(width);
  const special = page <= 2; // Al-Fatihah & awal Al-Baqarah: baris lebih sedikit dan di tengah
  const lineEms = rendered.map((items) => (items ? itemsEm(items) : 0));
  const lineHeight = fontSize * LINE_HEIGHT;
  const surahMeta = (n: number) => surahs.find((s) => s.number === n);
  const firstSurah = lines.map((l) => (l.kind === 'text' ? l.tokens[0].surah : l.surah)).find(Boolean) ?? 1;
  const meta = surahMeta(firstSurah);
  const odd = page % 2 === 1;

  return (
    <MushafFrame className="w-full">
      <div className="px-[18px] pt-2.5 pb-3" style={{ minHeight: special ? undefined : lineHeight * 15 + 44 }}>
        {/* Kepala halaman: nama surah, nomor halaman, juz (bergantian sisi seperti mushaf) */}
        <div className={`flex items-center justify-between gap-2 mb-1.5 ${odd ? 'flex-row-reverse' : ''}`}>
          <HeaderPill className="min-w-[30%]">{meta ? `${meta.number}. ${meta.nameLatin}` : ''}</HeaderPill>
          <HeaderPill>{page}</HeaderPill>
          <HeaderPill className="min-w-[30%]">JUZ {juzOfPage(page)}</HeaderPill>
        </div>

        {!ready ? (
          <div className="flex items-center justify-center gap-2 text-sm text-[#246579]" style={{ height: lineHeight * 15 }}>
            <Loader2 className="w-5 h-5 animate-spin" /> Memuat halaman…
          </div>
        ) : (
          <div className={special ? 'py-6 flex flex-col justify-center' : ''} dir="rtl">
            {lines.map((line, index) => {
              if (line.kind === 'header') {
                const m = surahMeta(line.surah);
                return (
                  <div key={`h${index}`} className="py-1" style={{ height: lineHeight }}>
                    <SurahTitleCard nameArabic={m?.nameArabic ?? ''} revelationType={m?.revelationType} ayahCount={m?.numberOfAyahs} fontSize={fontSize} />
                  </div>
                );
              }
              if (line.kind === 'basmalah') {
                return (
                  <div
                    key={`b${index}`}
                    className="flex items-center justify-center font-mushaf-id text-[#173B4E] dark:text-[#EEF4F5] border-b border-[#D3A253]/35"
                    style={{ height: lineHeight, fontSize: fontSize * 0.95, lineHeight: 1 }}
                  >
                    {basmalah?.join(' ') ?? 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ'}
                  </div>
                );
              }
              const items = rendered[index]!;
              const centered = special || lineEms[index] * fontSize < innerWidth * 0.72;
              // Jarak antarkata dijadikan padding kata, agar sorotan satu ayat menyambung tanpa celah.
              const spare = centered ? (WORD_GAP_EM * fontSize) / 2 : Math.max(0, (innerWidth - lineEms[index] * fontSize) / Math.max(1, items.length - 1) / 2) * 0.9;
              return (
                <div
                  key={`t${index}`}
                  className={`flex items-center border-b border-[#D3A253]/35 last:border-b-0 font-mushaf-id text-[#173B4E] dark:text-[#EEF4F5] ${
                    centered ? 'justify-center' : 'justify-between'
                  }`}
                  style={{ height: lineHeight, fontSize, lineHeight: 1, marginInline: centered ? 0 : -spare }}
                >
                  {items.map((item, i) => {
                    const active = sameAyah(activeAyah, item.surah, item.ayah);
                    const marked = !active && sameAyah(markedAyah, item.surah, item.ayah);
                    const tone = active
                      ? 'bg-[#D3A253]/35 dark:bg-[#D3A253]/30'
                      : marked
                        ? 'bg-[#246579]/12 dark:bg-[#5FA8B8]/20'
                        : '';
                    const prev = items[i - 1];
                    const nextItem = items[i + 1];
                    const startsSegment = !prev || prev.surah !== item.surah || prev.ayah !== item.ayah;
                    const endsSegment = !nextItem || nextItem.surah !== item.surah || nextItem.ayah !== item.ayah;
                    const rounding = `${startsSegment ? 'rounded-s-lg' : ''} ${endsSegment ? 'rounded-e-lg' : ''}`;
                    return (
                      <span
                        key={i}
                        data-ayah={`${item.surah}:${item.ayah}`}
                        onClick={() => onAyahTap(item.surah, item.ayah)}
                        className={`inline-flex items-center self-stretch cursor-pointer transition-colors whitespace-nowrap ${rounding} ${tone}`}
                        style={{ paddingInline: spare }}
                      >
                        {item.kind === 'end' ? <AyahEndMarker number={item.ayah} fontSize={fontSize} /> : item.text}
                      </span>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MushafFrame>
  );
});
MushafPage.displayName = 'MushafPage';

/* ---------------- Pengatur halaman + efek balik lembar ---------------- */
interface Turn {
  /** Halaman tujuan. */
  to: number;
  /** +1 = halaman berikutnya, -1 = sebelumnya. */
  dir: 1 | -1;
  /** Sudut lembar yang sedang dibalik (0 = rata, 90 = tegak lurus/hilang). */
  angle: number;
}

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const MushafView: React.FC<Props> = ({ page, onPageChange, surahs, activeAyah, markedAyah, onAyahTap }) => {
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
      // Halaman setinggi layar (rasio mushaf ±0,64), tidak lebih lebar dari wadahnya.
      const byHeight = Math.max(320, (window.innerHeight - 170) * 0.64);
      setSpread(wide);
      setWidth(Math.floor(Math.min(wide ? (w - 16) / 2 : Math.min(w, 620), wide ? byHeight : Math.max(byHeight, Math.min(w, 420)))));
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
  }, [layout]);

  // Halaman yang tampil: satu halaman, atau pasangan (ganjil di kanan, genap di kiri).
  const spreadOf = (p: number) => (p % 2 === 1 ? [p, Math.min(TOTAL_PAGES, p + 1)] : [p - 1, p]);
  const visiblePages = useMemo(() => {
    const base = spread ? spreadOf(shown) : [shown];
    const around = new Set<number>();
    base.forEach((p) => [p - 1, p, p + 1, p + 2].forEach((x) => x >= 1 && x <= TOTAL_PAGES && around.add(x)));
    if (turn) around.add(turn.to);
    return { base, around: [...around] };
  }, [shown, spread, turn]);

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

  /* ----- Membalik halaman ----- */
  const animRef = useRef<number | null>(null);
  const animateTo = useCallback(
    (from: Turn, target: number, done: () => void) => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (prefersReducedMotion()) return done();
      const start = performance.now();
      const startAngle = from.angle;
      const duration = 380 * (Math.abs(target - startAngle) / 90 || 0.3);
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / Math.max(120, duration));
        const eased = 1 - (1 - t) ** 3;
        setTurn({ ...from, angle: startAngle + (target - startAngle) * eased });
        if (t < 1) animRef.current = requestAnimationFrame(step);
        else {
          animRef.current = null;
          done();
        }
      };
      animRef.current = requestAnimationFrame(step);
    },
    []
  );

  const stepSize = spread ? 2 : 1;
  const goTo = useCallback(
    (target: number, animate = true) => {
      const to = Math.min(TOTAL_PAGES, Math.max(1, target));
      if (to === shown) return;
      const dir: 1 | -1 = to > shown ? 1 : -1;
      const near = Math.abs(to - shown) <= stepSize;
      if (!animate || !near || spread) {
        setTurn(null);
        setShown(to);
        if (to !== page) onPageChange(to);
        return;
      }
      const startTurn: Turn = { to, dir, angle: dir === 1 ? 0 : 90 };
      setTurn(startTurn);
      animateTo(startTurn, dir === 1 ? 90 : 0, () => {
        setTurn(null);
        setShown(to);
        if (to !== page) onPageChange(to);
      });
    },
    [shown, page, onPageChange, animateTo, stepSize, spread]
  );

  // Halaman diganti dari luar (lompat ke surah, murottal pindah halaman).
  useEffect(() => {
    if (page === shown || turn) return;
    const inSpread = spread && spreadOf(shown).includes(page);
    if (inSpread) return;
    goTo(page, Math.abs(page - shown) <= stepSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const next = () => goTo(spread ? spreadOf(shown)[0] + 2 : shown + 1);
  const previous = () => goTo(spread ? spreadOf(shown)[0] - 2 : shown - 1);

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

  // Geser untuk membalik: geser ke kanan = halaman berikutnya.
  const drag = useRef<{ x: number; y: number; id: number; active: boolean; dir: 1 | -1 | 0 } | null>(null);
  const suppressTap = useRef(false);
  const onPointerDown = (event: React.PointerEvent) => {
    if (turn || (event.pointerType === 'mouse' && event.button !== 0)) return;
    drag.current = { x: event.clientX, y: event.clientY, id: event.pointerId, active: false, dir: 0 };
    suppressTap.current = false;
  };
  const onPointerMove = (event: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== event.pointerId) return;
    const dx = event.clientX - d.x;
    const dy = event.clientY - d.y;
    if (!d.active) {
      if (Math.abs(dx) < 12 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      const dir: 1 | -1 = dx > 0 ? 1 : -1;
      const target = dir === 1 ? shown + stepSize : shown - stepSize;
      if (target < 1 || target > TOTAL_PAGES) return;
      d.active = true;
      d.dir = dir;
      suppressTap.current = true;
      (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
      if (spread) return;
    }
    if (spread || !d.dir) return;
    const progress = Math.min(1, Math.abs(dx) / Math.max(160, width * 0.8));
    const to = d.dir === 1 ? shown + 1 : shown - 1;
    setTurn({ to, dir: d.dir, angle: d.dir === 1 ? progress * 90 : 90 - progress * 90 });
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
    const current = turn;
    if (!current) return;
    const committed = Math.abs(dx) > Math.min(90, width * 0.22);
    const finish = committed ? (current.dir === 1 ? 90 : 0) : current.dir === 1 ? 0 : 90;
    animateTo(current, finish, () => {
      setTurn(null);
      if (committed) {
        setShown(current.to);
        onPageChange(current.to);
      }
    });
  };

  const tap = useCallback(
    (surah: number, ayah: number) => {
      if (suppressTap.current) {
        suppressTap.current = false;
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

  // Ukuran huruf: baris terpanjang pas selebar halaman, tidak melebihi tinggi layar;
  // dua halaman berdampingan memakai ukuran yang sama.
  const heightCap = Math.max(18, (viewportHeight - 230) / (15 * LINE_HEIGHT));
  const fontFor = (pages: number[]) => {
    const sizes = layout ? pages.map((p) => naturalFontSize(p, layout, texts, width) ?? MAX_FONT) : [MAX_FONT];
    return Math.min(MAX_FONT, heightCap, ...sizes);
  };
  const pageProps = (p: number) => ({
    page: p,
    layout: layout!,
    texts,
    basmalah,
    surahs,
    width,
    fontSize: fontFor(spread ? spreadOf(p) : [p]),
    activeAyah,
    markedAyah,
    onAyahTap: tap
  });

  // Lapisan balik lembar: lembar atas berputar pada tepi kanan (punggung mushaf).
  const top = turn ? (turn.dir === 1 ? shown : turn.to) : shown;
  const under = turn ? (turn.dir === 1 ? turn.to : shown) : null;
  const angle = turn?.angle ?? 0;

  const rangeLabel = spread ? `${spreadOf(shown)[0]}–${spreadOf(shown)[1]}` : String(shown);

  return (
    <div className="space-y-3" ref={containerRef}>
      {!layout || !fontsReady || width === 0 ? (
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-[#246579] dark:text-[#A7CDD3]">
          <Loader2 className="w-5 h-5 animate-spin" /> Menyiapkan mushaf…
        </div>
      ) : (
        <div
          className="relative mx-auto select-none touch-pan-y"
          style={{ width: spread ? undefined : width, perspective: 2200 }}
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
                <div className="absolute inset-0">
                  <MushafPage {...pageProps(under)} />
                </div>
              )}
              <div
                className="relative"
                style={{
                  transformOrigin: 'right center',
                  transform: `rotateY(${angle}deg)`,
                  backfaceVisibility: 'hidden',
                  willChange: turn ? 'transform' : undefined
                }}
              >
                <MushafPage {...pageProps(top)} />
                {turn && (
                  <div
                    className="pointer-events-none absolute inset-0 rounded-[18px]"
                    style={{ background: `linear-gradient(to left, rgba(0,0,0,${(angle / 90) * 0.28}), rgba(0,0,0,0) 60%)` }}
                  />
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Navigasi halaman: arah mushaf (berikutnya di kiri) */}
      <div className="relative flex items-center justify-between gap-2 max-w-[620px] mx-auto">
        <button
          type="button"
          onClick={next}
          disabled={shown >= TOTAL_PAGES}
          className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#246579] dark:text-[#A7CDD3] disabled:opacity-40"
          aria-label="Halaman berikutnya"
        >
          <ChevronLeft className="w-4 h-4" /> Berikutnya
        </button>
        <button
          type="button"
          onClick={() => setJumpOpen((open) => !open)}
          className="px-3 py-2 rounded-2xl text-xs font-semibold text-[#173B4E] dark:text-white hover:bg-white/70 dark:hover:bg-slate-800"
          aria-expanded={jumpOpen}
        >
          Hal. {rangeLabel} · Juz {juzOfPage(shown)}
        </button>
        <button
          type="button"
          onClick={previous}
          disabled={shown <= 1}
          className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#246579] dark:text-[#A7CDD3] disabled:opacity-40"
          aria-label="Halaman sebelumnya"
        >
          Sebelumnya <ChevronRight className="w-4 h-4" />
        </button>

        {jumpOpen && (
          <PageJump
            current={shown}
            onClose={() => setJumpOpen(false)}
            onJump={(p) => {
              setJumpOpen(false);
              goTo(p, false);
            }}
          />
        )}
      </div>
    </div>
  );
};

/** Lompat ke halaman atau juz. */
const PageJump: React.FC<{ current: number; onJump: (page: number) => void; onClose: () => void }> = ({ current, onJump, onClose }) => {
  const [value, setValue] = useState(String(current));
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const n = Number(value);
    if (Number.isInteger(n) && n >= 1 && n <= TOTAL_PAGES) onJump(n);
  };
  return (
    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-20 w-[min(92vw,360px)] rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-4 space-y-3">
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
  );
};
