import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Volume2, VolumeX, CheckCircle, Bookmark, Sparkles, BookOpen, Heart, ChevronLeft, ChevronRight, ChevronDown, Search, Loader2, GraduationCap, ScrollText, Share2, ExternalLink, Languages, ListMusic, PlayCircle, Square, AlignJustify, Maximize2, Minimize2, Swords } from 'lucide-react';
import { useQuranGame } from '../../context/QuranGameContext';
import { Ayah } from '../../types/quran';
import {
  loadKemenagLatin, loadKemenagSurah, loadReaderIndex, loadReaderSurah, loadSurahInfo, loadSurahInfoIndex, splitKemenagWords,
  ReaderAyah, ReaderIndex, ReaderSurah, SurahInfoDetail, SurahInfoSummary
} from '../../services/quranReaderData';
import { HafalanSession } from '../hafalan/HafalanSession';
import { SurahChallenge } from '../hafalan/SurahChallenge';
import { SURAH_VIRTUES } from '../../data/surahVirtues';
import { MotivationCarousel } from './MotivationCarousel';
import { useBackHandler } from '../../utils/backNavigation';
import { getCompletedStages, getSurahsWithHafalanProgress, STAGES } from '../hafalan/hafalanPlan';
import { isOpeningPart, useSurahPlayer } from './useSurahPlayer';
import { PlayerDock, PlayerOptions } from './SurahPlayerBar';
import { RecentReadingCard } from './RecentReadingCard';
import { MemorizingCard } from './MemorizingCard';
import { AyahEndMarker } from './AyahEndMarker';
import { HighlightedText, QuranSearch } from './QuranSearch';
import { TafsirModal } from './TafsirModal';
import { ShareAyahModal } from './ShareAyahModal';
import { getRecentReadings, recordReading } from './recentReading';
import { loadView, saveView } from '../../utils/viewState';
import { useIdleVisibility } from '../../utils/useIdleVisibility';
import { MushafView, type AyahRef } from './mushaf/MushafView';
import { MushafAyahSheet } from './mushaf/MushafAyahSheet';
import { firstAyahOnPage, loadMushafLayout, surahsOnPage, type MushafLayout } from '../../services/mushafLayout';

const NO_AYAHS: ReaderAyah[] = [];
/** Mode baca terakhir yang dipilih: per ayat (Tadabbur) atau per halaman (Mushaf). */
const READING_MODE_KEY = 'raudhah_reader_mode_v1';
type ReadingMode = 'tadabbur' | 'mushaf';
/** Jarak bar navigasi surah dari bawah header saat menempel. */
const NAV_GAP = 8;
/** Gulir otomatis berlanjut bila pengguna sudah berhenti menggulir selama ini. */
const FOLLOW_RESUME_MS = 3500;

/** Terjemah dipecah per kata (dengan posisi karakternya) untuk highlight saat dibacakan. */
const translationTokens = (text: string) => {
  const tokens: { word: string; start: number }[] = [];
  const pattern = /\S+/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) tokens.push({ word: match[0], start: match.index });
  return tokens;
};

const normalizeSearch = (text: string) => text.toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]/g, '');
// Kerangka konsonan agar ejaan berbeda tetap cocok, mis. "baqoroh" → Al-Baqarah.
const consonantSkeleton = (text: string) => normalizeSearch(text).replace(/[aiueo'h]/g, '').replace(/(.)\1+/g, '$1');

// Bintang segi delapan (outline) untuk nomor surah di daftar.
const STAR_POINTS = Array.from({ length: 16 }, (_, i) => {
  const angle = (Math.PI / 8) * i - Math.PI / 2;
  const radius = i % 2 === 0 ? 20 : 20 * Math.cos(Math.PI / 4) / Math.cos(Math.PI / 8);
  return `${(22 + radius * Math.cos(angle)).toFixed(2)},${(22 + radius * Math.sin(angle)).toFixed(2)}`;
}).join(' ');

const SurahNumberBadge: React.FC<{ number: number }> = ({ number }) => (
  <span className="relative w-11 h-11 shrink-0 flex items-center justify-center text-[#246579] dark:text-[#A7CDD3]">
    <svg viewBox="0 0 44 44" className="absolute inset-0 w-full h-full" fill="none" aria-hidden="true">
      <polygon points={STAR_POINTS} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
    <span className="relative text-xs font-semibold text-[#173B4E] dark:text-white">{number}</span>
  </span>
);

export const MushafReader: React.FC = () => {
  const {
    activeSurah,
    fontSize,
    inspectWord,
    playMurottal,
    pauseMurottal,
    isPlayingAudio,
    currentPlayingAyahId,
    memorizedAyahIds,
    markAyahMemorized,
    unmarkAyahMemorized,
    mode,
    reciterId,
    reciterSpeed,
    latinFontSize,
    translationFontSize
  } = useQuranGame();

  // Posisi sebelum halaman di-refresh: surah yang terbuka, ayat, dan mode Hafalkan.
  const [restored] = useState(() => {
    const reader = loadView().reader;
    const open = !!reader?.open;
    const recent = getRecentReadings()[0];
    // Dari tautan ayat yang dibagikan: dipakai sekali saja.
    const linkAyah = open ? reader?.linkAyah : undefined;
    if (linkAyah) saveView({ reader: { linkAyah: undefined } });
    return {
      surah: reader?.surah ?? activeSurah.number,
      open,
      hafalanAyah: open ? reader?.hafalanAyah ?? null : null,
      ayah: linkAyah ? linkAyah : open && recent?.number === reader?.surah && recent.ayah > 1 ? recent.ayah : null,
      listTopSurah: !open ? reader?.listTopSurah ?? 0 : 0,
      linkAyah
    };
  });

  const [surahIndex, setSurahIndex] = useState<ReaderIndex | null>(null);
  const [surahNumber, setSurahNumber] = useState<number>(restored.surah);
  const [loadedSurah, setLoadedSurah] = useState<ReaderSurah | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const topRef = useRef<HTMLDivElement>(null);
  const [hafalanAyahIndex, setHafalanAyahIndex] = useState<number | null>(restored.hafalanAyah);
  const [showList, setShowList] = useState(!restored.open);
  /** Ayat yang dituju saat membuka surah dari "Terakhir Dibaca" (atau setelah refresh). */
  const [pendingAyah, setPendingAyah] = useState<number | null>(restored.ayah);
  /** Kata kunci pencarian di Daftar Surah; tetap ada saat kembali dari surah. */
  const [listQuery, setListQuery] = useState('');
  /** Kata yang disorot di terjemahan ayat yang dibuka dari pencarian arti. */
  const [searchMark, setSearchMark] = useState<{ surah: number; ayah: number; terms: string[] } | null>(null);
  /** Posisi Daftar Surah sebelum membuka surah, untuk dipulihkan saat kembali. */
  const listPositionRef = useRef<{ y: number; anchor?: string; offset: number } | null>(null);
  /** Nomor ayat yang tafsirnya sedang dibuka. */
  const [tafsirAyah, setTafsirAyah] = useState<number | null>(null);
  /** Nomor ayat yang sedang dibagikan (jendela "Bagikan Ayat"). */
  const [shareAyah, setShareAyah] = useState<number | null>(null);
  /** Ayat yang disorot sebentar setelah dibuka dari hasil pencarian. */
  const [flashAyah, setFlashAyah] = useState<{ surah: number; ayah: number } | null>(
    restored.linkAyah ? { surah: restored.surah, ayah: restored.linkAyah } : null
  );
  /** Mode Hafalkan yang dibuka setelah surah selesai dimuat (dari kartu "Sedang Dihafal"). */
  const [pendingHafalan, setPendingHafalan] = useState<number | null>(null);
  const [infoIndex, setInfoIndex] = useState<Map<number, SurahInfoSummary>>(new Map());
  const [surahInfo, setSurahInfo] = useState<SurahInfoDetail | null>(null);
  const [infoExpanded, setInfoExpanded] = useState(false);
  // Teks Arab Mushaf Standar Indonesia (Kemenag) untuk surah yang sedang dibuka.
  const [kemenagText, setKemenagText] = useState<{ surah: number; ayahs: Map<number, string> } | null>(null);
  // Transliterasi latin versi Kemenag (mis. "Bismillāhir-raḥmānir-raḥīm(i).").
  const [kemenagLatin, setKemenagLatin] = useState<{ surah: number; ayahs: Map<number, string> } | null>(null);

  /* ---------- Mode baca: Tadabbur (per ayat) atau Mushaf (per halaman) ---------- */
  const [readingMode, setReadingModeState] = useState<ReadingMode>(() => {
    try {
      return localStorage.getItem(READING_MODE_KEY) === 'mushaf' ? 'mushaf' : 'tadabbur';
    } catch {
      return 'tadabbur';
    }
  });
  const [mushafLayout, setMushafLayout] = useState<MushafLayout | null>(null);
  const [mushafPage, setMushafPage] = useState<number>(() => loadView().reader?.mushafPage ?? 1);
  /** Surah/ayat yang dituju di Mode Mushaf; halamannya dihitung setelah data halaman dimuat. */
  const [mushafTarget, setMushafTarget] = useState<{ surah: number; ayah?: number } | null>(() =>
    restored.open && (restored.linkAyah || !loadView().reader?.mushafPage)
      ? { surah: restored.surah, ayah: restored.linkAyah ?? restored.ayah ?? undefined }
      : null
  );
  /** Ayat yang diketuk di Mode Mushaf (lembar aksi). */
  const [mushafSelected, setMushafSelected] = useState<AyahRef | null>(null);
  /** Aksi untuk ayat dari surah lain di halaman yang sama: dijalankan setelah surahnya dimuat. */
  const [pendingAction, setPendingAction] = useState<{ type: 'play' | 'tafsir' | 'share'; surah: number; ayah: number } | null>(null);

  useEffect(() => {
    if (readingMode !== 'mushaf' || mushafLayout) return;
    loadMushafLayout().then(setMushafLayout).catch(() => undefined);
  }, [readingMode, mushafLayout]);

  useEffect(() => {
    if (!mushafLayout || !mushafTarget) return;
    const page = mushafTarget.ayah
      ? mushafLayout.ayahPage.get(`${mushafTarget.surah}:${mushafTarget.ayah}`)
      : mushafLayout.surahPage[mushafTarget.surah];
    if (page) setMushafPage(page);
    setMushafTarget(null);
  }, [mushafLayout, mushafTarget]);

  useEffect(() => {
    loadReaderIndex().then(setSurahIndex);
    loadSurahInfoIndex().then(setInfoIndex);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setSurahInfo(null);
    setInfoExpanded(false);
    loadSurahInfo(surahNumber).then((info) => {
      if (!cancelled) setSurahInfo(info);
    });
    return () => {
      cancelled = true;
    };
  }, [surahNumber]);

  useEffect(() => {
    let cancelled = false;
    loadKemenagSurah(surahNumber).then((ayahs) => {
      if (!cancelled) setKemenagText(ayahs ? { surah: surahNumber, ayahs } : null);
    });
    loadKemenagLatin(surahNumber).then((ayahs) => {
      if (!cancelled) setKemenagLatin(ayahs ? { surah: surahNumber, ayahs } : null);
    });
    return () => {
      cancelled = true;
    };
  }, [surahNumber]);

  useEffect(() => {
    let cancelled = false;
    setLoadError(false);
    loadReaderSurah(surahNumber)
      .then((surah) => {
        if (!cancelled) setLoadedSurah(surah);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [surahNumber, reloadKey]);

  const surahList = surahIndex?.surahs ?? [];

  // Simpan posisi tampilan agar refresh kembali ke tempat yang sama.
  useEffect(() => {
    saveView({ reader: { surah: surahNumber, open: !showList, hafalanAyah: hafalanAyahIndex } });
  }, [surahNumber, showList, hafalanAyahIndex]);
  useEffect(() => {
    if (readingMode === 'mushaf') saveView({ reader: { mushafPage } });
  }, [readingMode, mushafPage]);

  // Posisi gulir Daftar Surah: dicatat sebagai surah paling atas yang terlihat
  // (tetap tepat walau tinggi kartu berubah saat ringkasan surah dimuat), dipulihkan sekali.
  const listScrollRestored = useRef(false);
  useEffect(() => {
    if (!showList) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const items = document.querySelectorAll<HTMLElement>('[data-surah-item]');
        const top = [...items].find((el) => el.getBoundingClientRect().bottom > 110);
        saveView({ reader: { listTopSurah: window.scrollY < 200 || !top ? 0 : Number(top.dataset.surahItem) } });
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, [showList]);
  useEffect(() => {
    if (listScrollRestored.current || !showList || surahList.length === 0) return;
    listScrollRestored.current = true;
    if (!restored.listTopSurah) return;
    requestAnimationFrame(() => {
      document.querySelector(`[data-surah-item="${restored.listTopSurah}"]`)?.scrollIntoView({ block: 'start' });
    });
  }, [showList, surahList.length, restored.listTopSurah]);

  const surahPosition = surahList.findIndex((s) => s.number === surahNumber);
  const previousSurah = surahPosition > 0 ? surahList[surahPosition - 1] : null;
  const nextSurah = surahPosition >= 0 && surahPosition < surahList.length - 1 ? surahList[surahPosition + 1] : null;
  const isLoading = !loadError && loadedSurah?.number !== surahNumber;
  const currentMeta = surahList.find((s) => s.number === surahNumber) ?? loadedSurah;

  const filteredSurahs = useMemo(() => {
    const query = normalizeSearch(searchQuery);
    if (!query) return surahList;
    const skeleton = query.length >= 3 ? consonantSkeleton(query) : '';
    return surahList.filter((s) =>
      String(s.number) === query ||
      normalizeSearch(s.nameLatin).includes(query) ||
      normalizeSearch(s.translationLatin).includes(query) ||
      normalizeSearch(s.nameArabic).includes(query) ||
      (skeleton.length >= 2 && consonantSkeleton(s.nameLatin).includes(skeleton))
    );
  }, [surahList, searchQuery]);

  const openSurah = (number: number, ayah?: number) => {
    if (isPlayingAudio) pauseMurottal();
    if (showList) {
      // Ingat posisi daftar (dan item yang diketuk) agar tombol kembali tidak melompat ke atas.
      // Safari iPhone tidak memfokuskan tombol saat diketuk, jadi pakai elemen yang terakhir diketuk;
      // bila tidak ada, pakai item surah teratas yang terlihat.
      const tapped = lastTapRef.current?.closest<HTMLElement>('[data-surah-item],[data-search-key]');
      const item =
        (tapped?.isConnected ? tapped : null) ??
        Array.from(document.querySelectorAll<HTMLElement>('[data-surah-item]')).find((el) => el.getBoundingClientRect().top >= 0);
      const anchor = item?.dataset.surahItem
        ? `[data-surah-item="${item.dataset.surahItem}"]`
        : item?.dataset.searchKey ? `[data-search-key="${item.dataset.searchKey}"]` : undefined;
      listPositionRef.current = { y: window.scrollY, anchor, offset: item?.getBoundingClientRect().top ?? 0 };
    }
    if (number !== searchMark?.surah) setSearchMark(null);
    setPendingAyah(ayah && ayah > 1 ? ayah : null);
    if (readingMode === 'mushaf') setMushafTarget({ surah: number, ayah });
    setSurahNumber(number);
    setShowList(false);
    setIsPickerOpen(false);
    setSearchQuery('');
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleTogglePlay = (ayah: ReaderAyah) => {
    if (playerRunning) {
      // Pemutar berurutan sedang aktif: lompat ke ayat ini.
      const index = loadedSurah?.ayahs.findIndex((a) => a.id === ayah.id) ?? -1;
      if (index >= 0) {
        resumeFollow();
        player.playFrom(index);
      }
      return;
    }
    if (playerActive) player.stop();
    if (isPlayingAudio && currentPlayingAyahId === ayah.id) {
      pauseMurottal();
    } else {
      playMurottal(ayah as Ayah);
    }
  };

  const backToList = () => {
    if (isPlayingAudio) pauseMurottal();
    setShowList(true);
    setIsPickerOpen(false);
    setSearchMark(null);
    // Posisi daftar dipulihkan oleh efek di bawah setelah daftar tampil lagi.
    if (!listPositionRef.current) topRef.current?.scrollIntoView({ block: 'start' });
  };

  // Elemen yang terakhir diketuk di Daftar Surah, sebagai patokan posisi saat kembali.
  const lastTapRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!showList) return;
    const remember = (event: Event) => {
      lastTapRef.current = event.target instanceof HTMLElement ? event.target : null;
    };
    document.addEventListener('click', remember, true);
    return () => document.removeEventListener('click', remember, true);
  }, [showList]);

  // Kembali ke Daftar Surah: pulihkan posisi gulir terakhir (item yang diketuk tetap di tempatnya).
  useEffect(() => {
    if (!showList || !listPositionRef.current) return;
    const saved = listPositionRef.current;
    listPositionRef.current = null;
    const restore = () => {
      const el = saved.anchor ? document.querySelector<HTMLElement>(saved.anchor) : null;
      const y = el ? window.scrollY + el.getBoundingClientRect().top - saved.offset : saved.y;
      window.scrollTo(0, Math.max(0, y));
    };
    const frame = requestAnimationFrame(restore);
    // Hasil pencarian arti muncul sedikit lebih lambat (indeks dimuat): pulihkan sekali lagi.
    const timer = setTimeout(restore, 450);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [showList]);

  // Tombol back HP: tutup mode Hafalkan dulu, lalu kembali dari surah ke Daftar Surah.
  useBackHandler(!showList, backToList, 1);
  useBackHandler(hafalanAyahIndex !== null, () => setHafalanAyahIndex(null), 2);

  /* ---------- Pemutar surah berurutan + suara arti ---------- */
  const player = useSurahPlayer(loadedSurah?.ayahs ?? NO_AYAHS, reciterId, reciterSpeed);
  const { state: playerState, active: playerActive } = player;
  /** Pemutar berurutan sedang berjalan atau dijeda (bukan sekadar baca arti satu ayat). */
  const playerRunning = playerActive && !playerState.single && playerState.status !== 'done';
  const ayahRefs = useRef<(HTMLDivElement | null)[]>([]);
  /** Waktu terakhir pengguna menggulir sendiri; gulir otomatis menunggu sampai ia berhenti. */
  const lastUserScrollRef = useRef(0);
  const [activeOffscreen, setActiveOffscreen] = useState(false);
  const resumeFollow = () => {
    lastUserScrollRef.current = 0;
  };

  const scrollToAyah = (index: number) => {
    const el = ayahRefs.current[index];
    if (!el) return;
    const tall = el.getBoundingClientRect().height > window.innerHeight * 0.6;
    el.scrollIntoView({ behavior: 'smooth', block: tall ? 'start' : 'center' });
  };

  const startPlayer = (index: number) => {
    if (isPlayingAudio) pauseMurottal();
    resumeFollow();
    player.playFrom(index);
  };

  const startArti = (index: number) => {
    if (isPlayingAudio) pauseMurottal();
    if (playerState.single && playerState.index === index && playerState.status === 'playing') {
      player.stop();
      return;
    }
    player.speakArti(index);
  };

  // Gulir otomatis mengikuti ayat yang sedang dibaca. Bila pengguna baru saja menggulir
  // sendiri, tunggu sampai ia berhenti; gulir otomatis lanjut lagi di ayat berikutnya
  // (pilihan gulir otomatis tidak pernah mati karena sentuhan).
  const openingPart = playerActive && playerState.status !== 'done' && isOpeningPart(playerState.part) ? playerState.part : null;
  const headerRef = useRef<HTMLDivElement>(null);
  // Sasaran gulir: kepala surah selama pembuka (ta'awudz & basmalah), lalu kartu ayat.
  const scrollTarget = openingPart ? 'opening' : playerState.index;
  useEffect(() => {
    if (playerState.status !== 'playing' || playerState.single) return;
    if (Date.now() - lastUserScrollRef.current < FOLLOW_RESUME_MS) return;
    if (scrollTarget === 'opening') headerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else scrollToAyah(playerState.index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollTarget, playerState.status]);

  // Catat guliran oleh pengguna (bukan guliran otomatis); sentuhan di pemutar tidak dihitung.
  useEffect(() => {
    if (!playerActive || playerState.single) return;
    const fromDock = (event: Event) => (event.target as Element | null)?.closest?.('[data-surah-player]');
    const userScrolled = (event: Event) => {
      if (!fromDock(event)) lastUserScrollRef.current = Date.now();
    };
    const onKey = (event: KeyboardEvent) => {
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) userScrolled(event);
    };
    window.addEventListener('wheel', userScrolled, { passive: true });
    window.addEventListener('touchmove', userScrolled, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', userScrolled);
      window.removeEventListener('touchmove', userScrolled);
      window.removeEventListener('keydown', onKey);
    };
  }, [playerActive, playerState.single]);

  // Apakah ayat yang sedang dibaca terlihat di layar? (untuk tombol "Ke ayat dibaca")
  useEffect(() => {
    const el = ayahRefs.current[playerState.index];
    if (!playerActive || playerState.single || !el || typeof IntersectionObserver === 'undefined') {
      setActiveOffscreen(false);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setActiveOffscreen(!entry.isIntersecting),
      { rootMargin: '-90px 0px -140px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [playerActive, playerState.single, playerState.index]);

  /* ---------- Terakhir dibaca: dicatat otomatis ---------- */
  const surahReady = !showList && !isLoading && !loadError && loadedSurah?.number === surahNumber;

  // Dibuka dari "Lanjutkan" / pencarian: langsung ke ayat yang dituju. Diperiksa sekali lagi
  // setelah teks Kemenag, info surah, dan font selesai dimuat (tinggi halaman bisa berubah).
  // Tanpa animasi: guliran halus yang panjang bisa meleset saat tinggi halaman berubah.
  useEffect(() => {
    if (!surahReady || !pendingAyah) return;
    const target = () => ayahRefs.current[pendingAyah - 1];
    const first = setTimeout(() => target()?.scrollIntoView({ block: 'start' }), 120);
    const settle = setTimeout(() => {
      const top = target()?.getBoundingClientRect().top;
      if (top !== undefined && (top < 0 || top > 200)) target()?.scrollIntoView({ block: 'start' });
      setPendingAyah(null);
    }, 1300);
    return () => {
      clearTimeout(first);
      clearTimeout(settle);
    };
  }, [surahReady, pendingAyah]);

  // Dari "Sedang Dihafal": buka mode Hafalkan begitu surahnya siap.
  useEffect(() => {
    if (!surahReady || pendingHafalan === null) return;
    setHafalanAyahIndex(pendingHafalan);
    setPendingHafalan(null);
  }, [surahReady, pendingHafalan]);

  // Dari pencarian: buka surah (dan ayatnya), lalu sorot ayat itu sebentar.
  const openFromSearch = (surah: number, ayah?: number, terms?: string[]) => {
    openSurah(surah, ayah);
    setFlashAyah(ayah ? { surah, ayah } : null);
    setSearchMark(ayah && terms?.length ? { surah, ayah, terms } : null);
  };
  useEffect(() => {
    if (!flashAyah || !surahReady) return;
    const timer = setTimeout(() => setFlashAyah(null), 3500);
    return () => clearTimeout(timer);
  }, [flashAyah, surahReady]);
  // Ayat panjang: bila kata yang dicari belum terlihat setelah ayatnya dituju, gulir sampai kata itu tampak.
  useEffect(() => {
    if (!searchMark || !surahReady || searchMark.surah !== surahNumber) return;
    const timer = setTimeout(() => {
      const mark = ayahRefs.current[searchMark.ayah - 1]?.querySelector('mark');
      if (!mark) return;
      const { top, bottom } = mark.getBoundingClientRect();
      if (top < 80 || bottom > window.innerHeight - 140) mark.scrollIntoView({ block: 'center' });
    }, 1400);
    return () => clearTimeout(timer);
  }, [searchMark, surahReady, surahNumber]);

  const continueHafalan = (surah: number, ayah: number) => {
    openSurah(surah, ayah);
    setPendingHafalan(ayah - 1);
  };

  /* ---------- Mode Mushaf: halaman, ayat yang diketuk, murottal ---------- */
  const setReadingMode = (next: ReadingMode) => {
    if (next === readingMode) return;
    try {
      localStorage.setItem(READING_MODE_KEY, next);
    } catch {
      // abaikan
    }
    if (next === 'mushaf') {
      // Buka halaman tempat ayat yang terakhir dibaca di surah ini.
      const recent = getRecentReadings()[0];
      setMushafTarget({ surah: surahNumber, ayah: recent?.number === surahNumber ? recent.ayah : undefined });
    } else if (mushafLayout) {
      const first = firstAyahOnPage(mushafLayout, mushafPage);
      if (first && first.surah === surahNumber) setPendingAyah(first.ayah > 1 ? first.ayah : null);
    }
    setMushafSelected(null);
    setReadingModeState(next);
    topRef.current?.scrollIntoView({ block: 'start' });
  };

  const handleMushafPage = (page: number) => {
    setMushafPage(page);
    setMushafSelected(null);
    if (!mushafLayout) return;
    const first = firstAyahOnPage(mushafLayout, page);
    const onPage = surahsOnPage(mushafLayout, page);
    // Surah di bar navigasi mengikuti halaman (kecuali sedang memutar murottal surah ini).
    if (!playerRunning && onPage.length && !onPage.includes(surahNumber)) setSurahNumber(first?.surah ?? onPage[0]);
    const meta = first && surahList.find((m) => m.number === first.surah);
    if (first && meta) recordReading({ number: meta.number, nameLatin: meta.nameLatin, ayah: first.ayah, totalAyahs: meta.numberOfAyahs });
  };

  // Ayat yang sedang dibacakan murottal (untuk disorot di halaman mushaf).
  const mushafActive: AyahRef | null =
    playerActive && playerState.status !== 'done' && !openingPart && loadedSurah
      ? { surah: loadedSurah.number, ayah: playerState.index + 1 }
      : null;
  // Halaman ikut berpindah ke ayat yang sedang dibacakan.
  useEffect(() => {
    if (readingMode !== 'mushaf' || !mushafActive || !mushafLayout) return;
    const page = mushafLayout.ayahPage.get(`${mushafActive.surah}:${mushafActive.ayah}`);
    if (page && page !== mushafPage) setMushafPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readingMode, mushafActive?.surah, mushafActive?.ayah, mushafLayout]);

  const runAyahAction = (type: 'play' | 'tafsir' | 'share', surah: number, ayah: number) => {
    setMushafSelected(null);
    if (loadedSurah?.number === surah && surahReady) {
      if (type === 'play') startPlayer(ayah - 1);
      else if (type === 'tafsir') setTafsirAyah(ayah);
      else setShareAyah(ayah);
      return;
    }
    if (isPlayingAudio) pauseMurottal();
    setPendingAction({ type, surah, ayah });
    setSurahNumber(surah);
  };
  useEffect(() => {
    if (!pendingAction || !surahReady || loadedSurah?.number !== pendingAction.surah) return;
    const { type, ayah } = pendingAction;
    setPendingAction(null);
    if (type === 'play') startPlayer(ayah - 1);
    else if (type === 'tafsir') setTafsirAyah(ayah);
    else setShareAyah(ayah);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAction, surahReady, loadedSurah]);

  const playMushafPage = () => {
    if (playerRunning) return player.stop();
    const first = mushafLayout && firstAyahOnPage(mushafLayout, mushafPage);
    if (first) runAyahAction('play', first.surah, first.ayah);
  };

  /* ---------- Tantangan Surah: baca sambung beberapa ayat tanpa melihat ---------- */
  const [surahChallengeOpen, setSurahChallengeOpen] = useState(false);
  useEffect(() => {
    if (showList) setSurahChallengeOpen(false);
  }, [showList]);

  /* ---------- Mode Mushaf layar penuh: hanya halaman mushaf & pemutar ---------- */
  const [mushafFull, setMushafFull] = useState(false);
  const fullActive = mushafFull && readingMode === 'mushaf' && !showList;
  const exitMushafFull = () => setMushafFull(false);
  useBackHandler(fullActive, exitMushafFull, 6);
  // Tombol keluar & navigasi halaman: muncul saat layar disentuh, hilang sendiri.
  const fullControls = useIdleVisibility(fullActive, { delay: 3000 });
  useEffect(() => {
    if (!fullActive) return;
    const root = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void };
    const doc = document as Document & { webkitFullscreenElement?: Element | null; webkitExitFullscreen?: () => void };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Sembunyikan juga bilah browser & status HP bila didukung (iPhone tidak mendukung: cukup tampilan penuh).
    let entered = false;
    try {
      if (root.requestFullscreen) {
        root.requestFullscreen({ navigationUI: 'hide' }).then(() => (entered = true)).catch(() => undefined);
      } else if (root.webkitRequestFullscreen) {
        root.webkitRequestFullscreen();
        entered = true;
      }
    } catch {
      // tidak didukung
    }
    // Keluar dari layar penuh browser (mis. tombol back / gerakan sistem): keluar juga dari mode ini.
    const onChange = () => {
      if (!(document.fullscreenElement ?? doc.webkitFullscreenElement)) {
        if (entered) setMushafFull(false);
      } else {
        entered = true;
      }
    };
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
      try {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
        else if (doc.webkitFullscreenElement) doc.webkitExitFullscreen?.();
      } catch {
        // abaikan
      }
    };
  }, [fullActive]);
  useEffect(() => {
    if (mushafFull && (readingMode !== 'mushaf' || showList)) setMushafFull(false);
  }, [mushafFull, readingMode, showList]);

  // Catat surah yang dibuka dan ayat teratas yang sedang terlihat di layar.
  useEffect(() => {
    if (!surahReady || !loadedSurah || readingMode === 'mushaf') return;
    const surah = loadedSurah;
    const save = (ayah: number) =>
      recordReading({ number: surah.number, nameLatin: surah.nameLatin, ayah, totalAyahs: surah.ayahs.length });
    save(pendingAyah ?? 1);
    if (typeof IntersectionObserver === 'undefined') return;
    const visible = new Set<number>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const index = ayahRefs.current.indexOf(entry.target as HTMLDivElement);
        if (index < 0) return;
        if (entry.isIntersecting) visible.add(index);
        else visible.delete(index);
      });
      if (visible.size) save(Math.min(...visible) + 1);
    }, { rootMargin: '-96px 0px -45% 0px' });
    ayahRefs.current.slice(0, surah.ayahs.length).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surahReady, loadedSurah, readingMode]);

  // Murottal satu ayat (tombol "Putar" biasa) dimulai: hentikan pemutar berurutan.
  useEffect(() => {
    if (isPlayingAudio && playerActive) player.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlayingAudio]);

  // Pindah ke Daftar Surah atau membuka mode Hafalkan: hentikan suara.
  useEffect(() => {
    if (showList || hafalanAyahIndex !== null) player.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showList, hafalanAyahIndex]);

  /* ---------- Bar navigasi surah: menempel di bawah header, sembunyi otomatis ---------- */
  const navRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(64);
  const headerHeightRef = useRef(headerHeight);
  headerHeightRef.current = headerHeight;
  const [navHeld, setNavHeld] = useState(false);
  useEffect(() => {
    const header = document.querySelector('header');
    if (!header) return;
    const update = () => setHeaderHeight(Math.round(header.getBoundingClientRect().height));
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);
  // Hanya disembunyikan saat sedang menempel (sudah digulir), bukan di posisi aslinya.
  const navIsStuck = () => {
    const el = navRef.current;
    return !!el && el.getBoundingClientRect().top <= headerHeightRef.current + NAV_GAP + 2 && window.scrollY > 40;
  };
  const navVisible = useIdleVisibility(!showList, { hold: isPickerOpen || navHeld, canHide: navIsStuck });

  // Halaman awal menu Baca: daftar lengkap 114 surah.
  if (showList) {
    // Progres hafalan per surah: jumlah ayat yang sudah ditandai hafal.
    const memorizedPerSurah = new Map<number, number>();
    new Set(memorizedAyahIds).forEach((id) => {
      const surah = Number(id.split(':')[0]);
      memorizedPerSurah.set(surah, (memorizedPerSurah.get(surah) ?? 0) + 1);
    });
    const inProgress = getSurahsWithHafalanProgress();

    return (
      <div ref={topRef} className="w-full space-y-4 scroll-mt-24">
        <MotivationCarousel />

        <RecentReadingCard onOpen={openSurah} />

        <MemorizingCard surahs={surahList} memorizedAyahIds={memorizedAyahIds} onContinue={continueHafalan} onOpen={openSurah} />

        <div className="flex items-baseline justify-between px-1">
          <h2 className="text-lg font-bold text-[#173B4E] dark:text-white">Daftar Surah</h2>
          {surahList.length > 0 && <span className="text-xs text-[#477F8D] dark:text-[#94A3B8]">{surahList.length} surah</span>}
        </div>

        <QuranSearch surahs={surahList} query={listQuery} onQueryChange={setListQuery} onOpen={openFromSearch}>
        {surahList.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-[#246579] dark:text-[#A7CDD3]">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Memuat daftar surah…</span>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden divide-y divide-slate-100 dark:divide-slate-700/60">
            {surahList.map((s) => (
              <button
                key={`surah_list_${s.number}`}
                data-surah-item={s.number}
                onClick={() => openSurah(s.number)}
                className="scroll-mt-24 w-full flex items-center gap-4 px-4 sm:px-6 py-4 text-left hover:bg-[#F8F6F1] dark:hover:bg-slate-700/40 transition-colors"
              >
                <SurahNumberBadge number={s.number} />
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="text-[15px] font-semibold text-[#173B4E] dark:text-white truncate">{s.nameLatin}</span>
                    {SURAH_VIRTUES[s.number] && (
                      <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#D3A253]/15 text-[#9A7035] dark:text-[#E9CF99] text-[10px] font-semibold" title="Memiliki keutamaan dari hadits sahih/hasan">
                        <Sparkles className="w-3 h-3" />
                        Keutamaan
                      </span>
                    )}
                  </span>
                  <span className="block mt-0.5 text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {s.revelationType}<span className="mx-1.5">•</span>{s.numberOfAyahs} Ayat
                  </span>
                  {infoIndex.get(s.number)?.summary && (
                    <span className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
                      {infoIndex.get(s.number)!.summary}
                    </span>
                  )}
                  {(() => {
                    const memorized = Math.min(memorizedPerSurah.get(s.number) ?? 0, s.numberOfAyahs);
                    const percent = Math.round((memorized / s.numberOfAyahs) * 100);
                    const status = memorized >= s.numberOfAyahs ? 'done' : memorized > 0 || inProgress.has(s.number) ? 'progress' : 'none';
                    const badge = {
                      none: { label: 'Belum dihafal', cls: 'bg-slate-100 text-slate-500 dark:bg-slate-700/60 dark:text-slate-300' },
                      progress: { label: 'Sedang dihafal', cls: 'bg-[#D3A253]/15 text-[#9A7035] dark:bg-[#D3A253]/20 dark:text-[#E9CF99]' },
                      done: { label: 'Sudah dihafal', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' }
                    }[status];
                    const bar = status === 'done' ? 'bg-emerald-500' : 'bg-[#D3A253]';
                    return (
                      <span className="mt-2 flex items-center gap-2">
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold ${badge.cls}`}>{badge.label}</span>
                        <span className="w-16 sm:w-28 shrink-0 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden" aria-hidden="true">
                          <span className={`block h-full rounded-full ${bar}`} style={{ width: `${percent}%` }} />
                        </span>
                        <span className="shrink-0 text-[10px] font-semibold text-slate-500 dark:text-slate-400" title={`${memorized} dari ${s.numberOfAyahs} ayat`}>
                          {percent}%
                        </span>
                      </span>
                    );
                  })()}
                </span>
                <span dir="rtl" className="font-arabic text-xl sm:text-2xl text-[#246579] dark:text-[#A7CDD3] shrink-0">{s.nameArabic}</span>
              </button>
            ))}
          </div>
        )}
        </QuranSearch>
      </div>
    );
  }

  return (
    <div ref={topRef} className="w-full space-y-6 scroll-mt-24">
      {/* Bar navigasi surah: kembali ke daftar, surah sebelumnya/berikutnya, dan pilih surah.
          Menempel di bawah header saat digulir dan sembunyi otomatis bila layar tidak disentuh. */}
      <div
        ref={navRef}
        className={`sticky z-30 transition-[transform,opacity] duration-300 ease-out ${
          navVisible ? 'translate-y-0 opacity-100' : '-translate-y-[140%] opacity-0 pointer-events-none'
        }`}
        style={{ top: headerHeight + NAV_GAP }}
        aria-hidden={!navVisible}
        onPointerEnter={(event) => event.pointerType === 'mouse' && setNavHeld(true)}
        onPointerLeave={(event) => event.pointerType === 'mouse' && setNavHeld(false)}
        onFocus={(event) => setNavHeld((event.target as HTMLElement).matches?.(':focus-visible') ?? false)}
        onBlur={() => setNavHeld(false)}
      >
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-700 shadow-[0_8px_24px_rgba(23,59,78,0.10)]">
          <div className="flex items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2">
            <button
              onClick={backToList}
              className="shrink-0 h-11 flex items-center gap-0.5 pl-2 pr-3 rounded-2xl bg-[#246579]/10 dark:bg-[#246579]/30 text-[#246579] dark:text-[#A7CDD3] hover:bg-[#246579]/15 text-xs font-semibold transition-colors"
              aria-label="Kembali ke Daftar Surah"
              title="Kembali ke Daftar Surah"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Daftar</span>
            </button>

            <span className="w-px h-7 shrink-0 bg-slate-200 dark:bg-slate-700 mx-0.5" aria-hidden="true" />

            <button
              onClick={() => previousSurah && openSurah(previousSurah.number)}
              disabled={!previousSurah}
              className="shrink-0 w-9 h-11 flex items-center justify-center rounded-2xl text-[#246579] dark:text-[#A7CDD3] hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              aria-label={previousSurah ? `Surah sebelumnya: ${previousSurah.nameLatin}` : 'Tidak ada surah sebelumnya'}
              title={previousSurah ? `Surah sebelumnya: ${previousSurah.nameLatin}` : 'Tidak ada surah sebelumnya'}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsPickerOpen((open) => !open)}
              className={`flex-1 min-w-0 h-11 flex items-center gap-2 px-2 rounded-2xl transition-colors ${
                isPickerOpen ? 'bg-[#D3A253]/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/60'
              }`}
              aria-expanded={isPickerOpen}
              aria-label="Pilih surah"
            >
              <span className="w-8 h-8 shrink-0 rounded-full bg-[#246579] text-white flex items-center justify-center font-bold text-[11px]">
                {surahNumber}
              </span>
              <span className="flex-1 min-w-0 text-left leading-tight">
                <span className="block truncate text-sm font-bold text-[#173B4E] dark:text-white">
                  {currentMeta ? currentMeta.nameLatin : 'Memuat…'}
                </span>
                <span className="block truncate text-[10px] text-[#477F8D] dark:text-[#94A3B8]">
                  {currentMeta ? `${currentMeta.translationLatin} · ${currentMeta.numberOfAyahs} ayat` : ''}
                </span>
              </span>
              <ChevronDown className={`w-4 h-4 shrink-0 text-[#477F8D] transition-transform ${isPickerOpen ? 'rotate-180' : ''}`} />
            </button>

            <button
              onClick={() => nextSurah && openSurah(nextSurah.number)}
              disabled={!nextSurah}
              className="shrink-0 w-9 h-11 flex items-center justify-center rounded-2xl text-[#246579] dark:text-[#A7CDD3] hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              aria-label={nextSurah ? `Surah berikutnya: ${nextSurah.nameLatin}` : 'Tidak ada surah berikutnya'}
              title={nextSurah ? `Surah berikutnya: ${nextSurah.nameLatin}` : 'Tidak ada surah berikutnya'}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

        {isPickerOpen && (
          <div className="border-t border-slate-100 dark:border-slate-700/60 p-3 sm:p-4 space-y-3">
            <label className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#F8F6F1] dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
              <Search className="w-4 h-4 text-[#477F8D] shrink-0" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Cari nama surah, arti, atau nomor…"
                className="w-full bg-transparent text-sm text-[#293640] dark:text-white placeholder:text-slate-400 outline-none"
              />
            </label>

            <div className="max-h-80 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pr-1">
              {filteredSurahs.map((s) => (
                <button
                  key={`reader_pick_${s.number}`}
                  onClick={() => openSurah(s.number)}
                  className={`flex items-center gap-3 p-2.5 rounded-2xl border text-left transition-colors ${
                    s.number === surahNumber
                      ? 'border-[#D3A253] bg-[#D3A253]/10'
                      : 'border-slate-200 dark:border-slate-700 hover:border-[#477F8D]/50 hover:bg-slate-50 dark:hover:bg-slate-700/40'
                  }`}
                >
                  <span className="w-8 h-8 shrink-0 rounded-full bg-[#246579]/10 dark:bg-[#246579]/30 text-[#246579] dark:text-[#A7CDD3] flex items-center justify-center font-bold text-[11px]">
                    {s.number}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-[#173B4E] dark:text-white truncate">{s.nameLatin}</span>
                    <span className="block text-[11px] text-[#477F8D] dark:text-[#94A3B8] truncate">
                      {s.translationLatin} · {s.numberOfAyahs} Ayat
                    </span>
                  </span>
                  <span className="font-arabic text-lg text-[#BE9452] shrink-0">{s.nameArabic}</span>
                </button>
              ))}
              {filteredSurahs.length === 0 && (
                <p className="col-span-full text-center text-xs text-slate-500 py-6">Surah tidak ditemukan.</p>
              )}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Pilihan mode baca */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="inline-grid grid-cols-2 gap-1 p-1 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs" role="tablist" aria-label="Mode baca">
          {([
            { id: 'tadabbur', label: 'Tadabbur', hint: 'per ayat', Icon: AlignJustify },
            { id: 'mushaf', label: 'Mushaf', hint: 'per halaman', Icon: BookOpen }
          ] as const).map(({ id, label, hint, Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={readingMode === id}
              onClick={() => setReadingMode(id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                readingMode === id ? 'bg-[#246579] text-white shadow-xs' : 'text-[#246579] dark:text-[#A7CDD3] hover:bg-[#246579]/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              <span className={`hidden sm:inline font-medium ${readingMode === id ? 'text-white/75' : 'text-[#477F8D]'}`}>· {hint}</span>
            </button>
          ))}
        </div>
        {readingMode === 'mushaf' && (
          <button
            type="button"
            onClick={playMushafPage}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#D3A253]/15 hover:bg-[#D3A253]/25 text-[#8A6420] dark:text-[#E9CF99] text-xs font-semibold"
            aria-label={playerRunning ? 'Hentikan murottal' : 'Putar murottal dari halaman ini'}
          >
            {playerRunning ? <Square className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
            {playerRunning ? 'Hentikan' : 'Putar'}
          </button>
        )}
        {readingMode === 'mushaf' && (
          <button
            type="button"
            onClick={() => setMushafFull(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#246579] dark:text-[#A7CDD3] text-xs font-semibold hover:bg-[#246579]/5"
            aria-label="Layar penuh"
            title="Layar penuh"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="hidden sm:inline">Layar penuh</span>
          </button>
        )}
        {loadedSurah && (
          <button
            type="button"
            onClick={() => {
              if (playerActive) player.stop();
              setSurahChallengeOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#246579]/10 dark:bg-[#246579]/30 hover:bg-[#246579]/15 text-[#246579] dark:text-[#A7CDD3] text-xs font-semibold"
            title="Tantangan Surah: baca sambung beberapa ayat tanpa melihat"
          >
            <Swords className="w-4 h-4" />
            Tantangan Surah
          </button>
        )}
      </div>

      {readingMode === 'mushaf' ? (
        <div
          className={`space-y-6 ${fullActive ? 'fixed inset-0 z-[55] overflow-y-auto overscroll-contain bg-[#F7F4EF] dark:bg-[#0D202A] px-1.5 sm:px-4 pt-[max(0.5rem,env(safe-area-inset-top))]' : ''}`}
          role={fullActive ? 'dialog' : undefined}
          aria-modal={fullActive || undefined}
          aria-label={fullActive ? 'Mushaf layar penuh' : undefined}
        >
          {fullActive && (
            <div
              className={`fixed top-[max(0.75rem,env(safe-area-inset-top))] right-3 z-30 flex items-center gap-1.5 transition-[transform,opacity] duration-300 ${
                fullControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
              }`}
              aria-hidden={!fullControls}
            >
              <button
                type="button"
                onClick={playMushafPage}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/95 dark:bg-slate-800/95 shadow-md border border-slate-200 dark:border-slate-700 text-[#8A6420] dark:text-[#E9CF99] text-xs font-semibold"
                aria-label={playerRunning ? 'Hentikan murottal' : 'Putar murottal dari halaman ini'}
              >
                {playerRunning ? <Square className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                {playerRunning ? 'Hentikan' : 'Putar'}
              </button>
              <button
                type="button"
                onClick={exitMushafFull}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#246579] text-white shadow-md text-xs font-semibold"
                aria-label="Keluar dari layar penuh"
              >
                <Minimize2 className="w-4 h-4" />
                Keluar
              </button>
            </div>
          )}
          <MushafView
            page={mushafPage}
            onPageChange={handleMushafPage}
            surahs={surahList}
            activeAyah={mushafActive}
            markedAyah={mushafSelected ?? flashAyah}
            onAyahTap={(surah, ayah) => setMushafSelected({ surah, ayah })}
            immersive={fullActive}
            controlsVisible={fullControls}
          />
          {playerActive && <div className="h-28 lg:h-20" aria-hidden="true" />}
          {loadedSurah && (
            <PlayerDock
              state={playerState}
              total={loadedSurah.ayahs.length}
              surahName={loadedSurah.nameLatin}
              following
              onFollow={() => undefined}
              onToggle={() => (playerState.status === 'playing' ? player.pause() : player.resume())}
              onPrevious={player.previous}
              onNext={player.next}
              onStop={player.stop}
              prefs={player.prefs}
              setPrefs={player.setPrefs}
              canSpeak={player.canSpeak}
            />
          )}
        </div>
      ) : (
      <>
      {loadError && (
        <div className="bg-white dark:bg-slate-800/80 rounded-3xl p-6 text-center border border-slate-200 dark:border-slate-700 space-y-3">
          <p className="text-sm text-[#293640] dark:text-[#CBD5E1]">Surah ini belum bisa dimuat. Periksa koneksi internet Anda.</p>
          <button
            onClick={() => setReloadKey((key) => key + 1)}
            className="px-4 py-2 bg-[#246579] hover:bg-[#174C60] text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-[#246579] dark:text-[#A7CDD3]">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Memuat surah…</span>
        </div>
      )}

      {loadedSurah && !isLoading && !loadError && (() => {
        const activeSurah = loadedSurah;
        return (
      <>
      {/* Surah Header Banner */}
      <div ref={headerRef} className="relative overflow-hidden bg-[#246579] text-white rounded-3xl p-6 sm:p-8 text-center shadow-sm scroll-mt-24">
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D3A253_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 space-y-2">
          <p className="font-arabic text-3xl sm:text-4xl text-[#D3A253] tracking-wide mb-1">
            سُورَةُ {activeSurah.nameArabic}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Surah {activeSurah.nameLatin}
          </h2>
          <p className="text-xs text-[#A7CDD3] font-medium">
            {activeSurah.translationLatin} · {activeSurah.numberOfAyahs} Ayat · {activeSurah.revelationType}
          </p>
        </div>

        {/* Ta'awudz: tampil saat pembuka bacaan surah sedang diputar */}
        {openingPart && (
          <div className="relative z-10 mt-6 pt-4 border-t border-white/20">
            <p
              className={`font-arabic text-xl sm:text-2xl transition-all duration-500 ${
                openingPart === 'taawudz' ? 'text-[#F5D58A] scale-105 drop-shadow-[0_0_14px_rgba(211,162,83,0.75)]' : 'text-white/55'
              }`}
            >
              أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ
            </p>
            <p className="mt-1 text-[11px] text-[#A7CDD3]">A'ūdzu billāhi minasy-syaiṭānir-rajīm</p>
          </div>
        )}

        {/* Bismillah Banner if not At-Taubah */}
        {activeSurah.bismillahPre && (
          <div className="mt-6 pt-4 border-t border-white/20">
            <p
              className={`font-arabic text-2xl sm:text-3xl transition-all duration-500 ${
                openingPart === 'basmalah' ? 'text-[#F5D58A] scale-105 drop-shadow-[0_0_14px_rgba(211,162,83,0.75)]' : 'text-[#F8F6F1]'
              }`}
            >
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </div>
        )}
      </div>

      {/* Tentang surah: latar belakang turun, makna nama, dan tema (Quran.com Chapter Info) */}
      {surahInfo && (
        <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2 text-[#246579] dark:text-[#A7CDD3]">
            <ScrollText className="w-4 h-4 text-[#D3A253]" />
            <h3 className="text-sm font-bold">Tentang Surah {activeSurah.nameLatin}</h3>
          </div>
          {infoExpanded ? (
            <div
              className="text-sm leading-relaxed text-[#293640] dark:text-[#CBD5E1] [&_h4]:mt-4 [&_h4]:mb-1 [&_h4]:font-bold [&_h4]:text-[#173B4E] dark:[&_h4]:text-white [&_p]:mt-2 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:mt-2 [&_blockquote]:pl-3 [&_blockquote]:border-l-2 [&_blockquote]:border-[#D3A253]"
              dangerouslySetInnerHTML={{ __html: surahInfo.html }}
            />
          ) : (
            <p className="text-sm leading-relaxed text-[#293640] dark:text-[#CBD5E1]">{surahInfo.summary}</p>
          )}
          <div className="flex items-center justify-end pt-1">
            <button
              onClick={() => setInfoExpanded(!infoExpanded)}
              className="text-xs font-semibold text-[#246579] dark:text-[#A7CDD3] hover:underline"
            >
              {infoExpanded ? 'Tutup' : 'Baca selengkapnya'}
            </button>
          </div>
        </div>
      )}

      {/* Keutamaan surah: hanya dari hadits sahih/hasan yang sudah diverifikasi */}
      {SURAH_VIRTUES[activeSurah.number] && (
        <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-[#D3A253]/40 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-[#246579] dark:text-[#A7CDD3]">
            <Sparkles className="w-4 h-4 text-[#D3A253]" />
            <h3 className="text-sm font-bold">Keutamaan Surah {activeSurah.nameLatin}</h3>
          </div>
          <ul className="space-y-3">
            {SURAH_VIRTUES[activeSurah.number].map((virtue) => (
              <li key={virtue.reference + virtue.label} className="pl-3 border-l-2 border-[#D3A253]">
                <p className="text-sm font-semibold text-[#173B4E] dark:text-white">{virtue.label}</p>
                <p className="text-sm leading-relaxed text-[#293640] dark:text-[#CBD5E1] mt-0.5">{virtue.text}</p>
                <a
                  href={virtue.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-[#246579] dark:text-[#A7CDD3] hover:underline"
                >
                  {virtue.reference} · {virtue.grade}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Reader Guidance Tip */}
      <div className="flex items-center justify-between text-xs text-[#246579] dark:text-[#94A3B8] px-2">
        <span className="flex items-center gap-1.5 font-medium">
          <BookOpen className="w-4 h-4 text-[#D3A253]" />
          <span>Klik pada sembarang kata Arab untuk membuka arti per kata & akar kata.</span>
        </span>
        <span className="text-[11px] opacity-75">
          Font: {fontSize}px
        </span>
      </div>

      {/* Putar surah berurutan */}
      <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <button
          type="button"
          onClick={() => (playerRunning ? player.stop() : startPlayer(0))}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold shadow-xs transition-colors ${
            playerRunning
              ? 'bg-[#D3A253] text-[#173B4E] hover:bg-[#C99543]'
              : 'bg-[#246579] hover:bg-[#174C60] text-white'
          }`}
        >
          {playerRunning ? <Square className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
          <span>{playerRunning ? 'Hentikan' : 'Putar Surah'}</span>
        </button>
        <div className="flex-1 min-w-0 space-y-1">
          <PlayerOptions prefs={player.prefs} setPrefs={player.setPrefs} canSpeak={player.canSpeak} />
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Diputar terus ke ayat berikutnya dan layar ikut bergulir.
            {player.canSpeak ? ' Arti dibacakan oleh suara pembaca teks bawaan perangkat.' : ' Perangkat ini belum mendukung suara pembaca teks untuk arti.'}
          </p>
        </div>
      </div>

      {/* Ayahs List */}
      <div className="space-y-4">
        {activeSurah.ayahs.map((ayah, ayahIndex) => {
          const isPlayingThis = isPlayingAudio && currentPlayingAyahId === ayah.id;
          const isMemorized = memorizedAyahIds.includes(ayah.id);
          const gamesDone = getCompletedStages(ayah.id).length;
          const msiText = kemenagText?.surah === ayah.surahNumber ? kemenagText.ayahs.get(ayah.ayahNumber) : undefined;
          const msiWords = msiText ? splitKemenagWords(msiText) : null;
          const msiWordsMatch = msiWords?.length === ayah.words.length;
          const isPlayerHere = playerActive && playerState.index === ayahIndex && playerState.status !== 'done' && !openingPart;
          const readingArab = isPlayerHere && playerState.part === 'arab';
          const readingArti = isPlayerHere && playerState.part === 'arti';
          const artiSpeaking = readingArti && playerState.status === 'playing';
          const tokens = readingArti ? translationTokens(ayah.translationId) : [];
          let activeToken = -1;
          if (readingArti && playerState.wordChar !== null) {
            tokens.forEach((token, i) => {
              if (token.start <= (playerState.wordChar as number)) activeToken = i;
            });
          }

          return (
            <div
              key={ayah.id}
              ref={(el) => {
                ayahRefs.current[ayahIndex] = el;
              }}
              className={`relative bg-white dark:bg-slate-800/80 rounded-3xl p-5 sm:p-7 border transition-all duration-500 scroll-mt-24 ${
                isPlayerHere
                  ? 'border-[#D3A253] reader-now-playing'
                  : flashAyah?.surah === ayah.surahNumber && flashAyah.ayah === ayah.ayahNumber
                    ? 'border-[#D3A253] ring-4 ring-[#D3A253]/40 shadow-lg'
                  : isPlayingThis
                    ? 'border-[#D3A253] ring-2 ring-[#D3A253]/20 shadow-md'
                    : 'border-slate-200 dark:border-slate-700 hover:border-[#477F8D]/50 shadow-xs'
              }`}
            >
              {/* Ayah Top Meta & Audio Bar */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-700/60">
                {/* Ayah Number Badge */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#246579]/10 dark:bg-[#246579]/30 text-[#246579] dark:text-[#477F8D] flex items-center justify-center font-bold text-xs">
                    {ayah.ayahNumber}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold text-[#246579] dark:text-[#94A3B8]">
                    Ayat {ayah.ayahNumber}
                  </span>
                </div>

                {/* Audio and Memorized buttons */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => startPlayer(ayahIndex)}
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
                    title="Putar berurutan mulai dari ayat ini"
                    aria-label={`Putar berurutan mulai dari ayat ${ayah.ayahNumber}`}
                  >
                    <ListMusic className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Dari sini</span>
                  </button>

                  {player.canSpeak && (
                    <button
                      onClick={() => startArti(ayahIndex)}
                      className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                        artiSpeaking
                          ? 'bg-[#D3A253] text-[#173B4E]'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                      }`}
                      title={artiSpeaking ? 'Hentikan bacaan arti' : 'Bacakan arti ayat ini'}
                      aria-label={artiSpeaking ? 'Hentikan bacaan arti' : `Bacakan arti ayat ${ayah.ayahNumber}`}
                    >
                      <Languages className="w-3.5 h-3.5" />
                      <span>Arti</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleTogglePlay(ayah)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                      isPlayingThis
                        ? 'bg-[#D3A253] text-[#173B4E]'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                    }`}
                    title={isPlayingThis ? 'Jeda Audio' : 'Putar Murottal'}
                  >
                    {isPlayingThis ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isPlayingThis ? 'Jeda' : 'Putar'}</span>
                  </button>

                  <button
                    onClick={() => (isMemorized ? unmarkAyahMemorized(ayah.id) : markAyahMemorized(ayah.id))}
                    aria-pressed={isMemorized}
                    className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                      isMemorized
                        ? 'bg-[#477F8D] text-white'
                        : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                    title={isMemorized ? 'Sudah dihafal. Ketuk lagi untuk membatalkan' : 'Tandai Sudah Dihafal'}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{isMemorized ? 'Sudah Dihafal' : 'Tandai Hafal'}</span>
                    <span className="sm:hidden">Hafal</span>
                  </button>
                </div>
              </div>

              {/* Arabic Verse with Word Clickability */}
              <div
                dir="rtl"
                className={`py-3 text-right leading-loose select-text rounded-2xl transition-colors duration-500 ${
                  readingArab ? 'bg-[#D3A253]/10 dark:bg-[#D3A253]/10 -mx-2 px-2' : ''
                }`}
              >
                {msiWords ? (
                  // Teks Mushaf Standar Indonesia (Kemenag). Arti per kata hanya dipasang
                  // bila pembagian katanya sama dengan data per kata, agar artinya tidak tertukar.
                  msiWords.map((msiWord, wordIdx) => {
                    const word = msiWordsMatch ? ayah.words[wordIdx] : undefined;
                    return word ? (
                      <button
                        key={`reader_msi_${ayah.id}_${wordIdx}`}
                        onClick={() => inspectWord({ ...word, arabic: msiWord })}
                        className="inline-block px-1.5 py-0.5 rounded-lg hover:bg-[#D3A253]/20 dark:hover:bg-[#D3A253]/20 cursor-pointer transition-colors text-[#173B4E] dark:text-[#F1F5F9] font-mushaf-id"
                        style={{ fontSize: `${fontSize}px` }}
                        title={`Klik untuk arti: "${word.translation}"`}
                      >
                        {msiWord}
                      </button>
                    ) : (
                      <span
                        key={`reader_msi_${ayah.id}_${wordIdx}`}
                        className="inline-block px-1.5 py-0.5 text-[#173B4E] dark:text-[#F1F5F9] font-mushaf-id"
                        style={{ fontSize: `${fontSize}px` }}
                      >
                        {msiWord}
                      </span>
                    );
                  })
                ) : ayah.words.map((word, wordIdx) => (
                  <button
                    key={`reader_${ayah.id}_${word.id}_${wordIdx}`}
                    onClick={() => inspectWord(word)}
                    className="inline-block px-1.5 py-0.5 rounded-lg hover:bg-[#D3A253]/20 dark:hover:bg-[#D3A253]/20 cursor-pointer transition-colors text-[#173B4E] dark:text-[#F1F5F9] font-arabic"
                    style={{ fontSize: `${fontSize}px` }}
                    title={`Klik untuk arti: "${word.translation}"`}
                  >
                    {word.arabic}
                  </button>
                ))}
                {/* Tanda akhir ayat: nomor ayat (angka Arab) di dalam bingkai berornamen */}
                <AyahEndMarker number={ayah.ayahNumber} fontSize={fontSize} />
              </div>

              {/* Transliteration */}
              <p
                className="text-[#246579] dark:text-[#A7CDD3] font-medium italic mt-2 leading-relaxed"
                style={{ fontSize: `${latinFontSize}px` }}
              >
                {(kemenagLatin?.surah === ayah.surahNumber && kemenagLatin.ayahs.get(ayah.ayahNumber)) || ayah.transliteration}
              </p>

              {/* Translation */}
              <p
                className={`text-[#293640] dark:text-[#CBD5E1] leading-relaxed mt-1.5 font-normal rounded-xl transition-colors duration-500 ${
                  readingArti ? 'bg-[#246579]/[0.06] dark:bg-[#246579]/25 -mx-2 px-2 py-1.5' : ''
                }`}
                style={{ fontSize: `${translationFontSize}px` }}
              >
                {readingArti ? (
                  <>
                    "
                    {tokens.map((token, i) => (
                      <React.Fragment key={i}>
                        <span
                          className={`rounded px-0.5 -mx-0.5 transition-colors duration-200 ${
                            i === activeToken
                              ? 'bg-[#D3A253]/45 text-[#173B4E] dark:text-white'
                              : activeToken === -1 && artiSpeaking
                                ? 'bg-[#D3A253]/15'
                                : i < activeToken
                                  ? 'text-[#246579] dark:text-[#A7CDD3]'
                                  : ''
                          }`}
                        >
                          {token.word}
                        </span>{i < tokens.length - 1 && ' '}
                      </React.Fragment>
                    ))}
                    "
                  </>
                ) : (
                  searchMark?.surah === ayah.surahNumber && searchMark.ayah === ayah.ayahNumber ? (
                    <>"<HighlightedText text={ayah.translationId} terms={searchMark.terms} />"</>
                  ) : (
                    <>"{ayah.translationId}"</>
                  )
                )}
              </p>

              {/* Tadabbur Wisdom Card */}
              {ayah.tadabbur && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 bg-[#F8F6F1] dark:bg-[#152E38]/70 p-3 rounded-2xl border border-[#477F8D]/20">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#246579] dark:text-[#477F8D] mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#D3A253]" />
                    <span>Tadabbur: {ayah.tadabbur.title}</span>
                  </div>
                  <p className="text-[11px] text-[#174C60] dark:text-[#CBD5E1] leading-relaxed">
                    {ayah.tadabbur.hikmah}
                  </p>
                  <p className="text-[11px] font-semibold text-[#B87845] mt-1.5 flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    <span>Amal Hari Ini: {ayah.tadabbur.amal}</span>
                  </p>
                </div>
              )}

              {/* Tafsir Kemenag & Mode Hafalkan (8 game penguat hafalan) untuk ayat ini */}
              <div className="mt-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTafsirAyah(ayah.ayahNumber)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-full border border-[#246579]/30 text-[#246579] dark:text-[#A7CDD3] hover:bg-[#246579]/5 transition-colors"
                    title="Baca Tafsir Kemenag untuk ayat ini"
                  >
                    <ScrollText className="w-4 h-4" />
                    <span>Tafsir</span>
                  </button>
                  <button
                    onClick={() => setShareAyah(ayah.ayahNumber)}
                    className="flex items-center justify-center w-9 h-9 shrink-0 rounded-full border border-[#246579]/30 text-[#246579] dark:text-[#A7CDD3] hover:bg-[#246579]/5 transition-colors"
                    aria-label={`Bagikan ayat ${ayah.ayahNumber}`}
                    title="Bagikan ayat ini (gambar atau teks)"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => {
                    if (isPlayingAudio) pauseMurottal();
                    setHafalanAyahIndex(ayahIndex);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full bg-[#246579] hover:bg-[#174C60] text-white shadow-xs transition-colors"
                  title={`Latih ayat ini dengan ${STAGES.length} game penguat hafalan, bebas pilih`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>
                    {gamesDone > 0 && gamesDone < STAGES.length
                      ? `Lanjutkan Hafalan (${gamesDone}/${STAGES.length} game)`
                      : isMemorized ? `Muraja'ah dengan ${STAGES.length} Game` : 'Hafalkan Ayat Ini'}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ruang agar ayat terakhir tidak tertutup pemutar */}
      {playerActive && <div className="h-36 lg:h-24" aria-hidden="true" />}
      <PlayerDock
        state={playerState}
        total={activeSurah.ayahs.length}
        surahName={activeSurah.nameLatin}
        following={!activeOffscreen}
        onFollow={() => {
          resumeFollow();
          scrollToAyah(playerState.index);
        }}
        onToggle={() => (playerState.status === 'playing' ? player.pause() : player.resume())}
        onPrevious={() => {
          resumeFollow();
          player.previous();
        }}
        onNext={() => {
          resumeFollow();
          player.next();
        }}
        onStop={player.stop}
        prefs={player.prefs}
        setPrefs={player.setPrefs}
        canSpeak={player.canSpeak}
      />
      <style>{'@keyframes reader-glow { 0%, 100% { box-shadow: 0 0 0 3px rgba(211,162,83,0.30), 0 6px 18px rgba(211,162,83,0.12); } 50% { box-shadow: 0 0 0 4px rgba(211,162,83,0.40), 0 10px 36px rgba(211,162,83,0.32); } } .reader-now-playing { box-shadow: 0 0 0 3px rgba(211,162,83,0.30); animation: reader-glow 2.4s ease-in-out infinite; } @media (prefers-reduced-motion: reduce) { .reader-now-playing { animation: none; } }'}</style>
      </>
        );
      })()}
      </>
      )}

      {mushafSelected && readingMode === 'mushaf' && !showList && (() => {
        const { surah, ayah } = mushafSelected;
        const id = `${surah}:${ayah}`;
        const memorized = memorizedAyahIds.includes(id);
        return (
          <MushafAyahSheet
            surah={surah}
            ayah={ayah}
            surahName={surahList.find((m) => m.number === surah)?.nameLatin ?? `Surah ${surah}`}
            memorized={memorized}
            onClose={() => setMushafSelected(null)}
            onPlay={() => runAyahAction('play', surah, ayah)}
            onTafsir={() => runAyahAction('tafsir', surah, ayah)}
            onShare={() => runAyahAction('share', surah, ayah)}
            onToggleMemorized={() => (memorized ? unmarkAyahMemorized(id) : markAyahMemorized(id))}
            onOpenTadabbur={() => {
              setMushafSelected(null);
              try {
                localStorage.setItem(READING_MODE_KEY, 'tadabbur');
              } catch {
                // abaikan
              }
              setReadingModeState('tadabbur');
              openSurah(surah, ayah);
              setFlashAyah({ surah, ayah });
            }}
          />
        );
      })()}

      {tafsirAyah !== null && loadedSurah && !showList && (() => {
        const ayah = loadedSurah.ayahs[tafsirAyah - 1];
        if (!ayah) return null;
        const msi = kemenagText?.surah === loadedSurah.number ? kemenagText.ayahs.get(tafsirAyah) : undefined;
        return (
          <TafsirModal
            surahNumber={loadedSurah.number}
            surahName={loadedSurah.nameLatin}
            totalAyahs={loadedSurah.ayahs.length}
            ayahNumber={tafsirAyah}
            arabic={msi ?? ayah.arabicText}
            msi={!!msi}
            textSize={Math.max(14, translationFontSize)}
            arabicSize={fontSize}
            onChangeAyah={(n) => setTafsirAyah(Math.min(Math.max(1, n), loadedSurah.ayahs.length))}
            onClose={() => setTafsirAyah(null)}
          />
        );
      })()}

      {shareAyah !== null && loadedSurah && !showList && (() => {
        const ayah = loadedSurah.ayahs[shareAyah - 1];
        if (!ayah) return null;
        const msi = kemenagText?.surah === loadedSurah.number ? kemenagText.ayahs.get(shareAyah) : undefined;
        const latin = (kemenagLatin?.surah === loadedSurah.number && kemenagLatin.ayahs.get(shareAyah)) || ayah.transliteration;
        return (
          <ShareAyahModal
            surahNumber={loadedSurah.number}
            surahName={loadedSurah.nameLatin}
            ayahNumber={shareAyah}
            arabic={msi ?? ayah.arabicText}
            msi={!!msi}
            latin={latin ?? ''}
            translation={ayah.translationId}
            onClose={() => setShareAyah(null)}
          />
        );
      })()}

      {surahChallengeOpen && loadedSurah && !showList && (
        <SurahChallenge
          key={loadedSurah.number}
          surah={loadedSurah}
          suggestedStart={getRecentReadings().find((r) => r.number === loadedSurah.number)?.ayah}
          onClose={() => setSurahChallengeOpen(false)}
          onTrainAyah={(index) => setHafalanAyahIndex(index)}
        />
      )}

      {hafalanAyahIndex !== null && loadedSurah && loadedSurah.ayahs[hafalanAyahIndex] && (
        <HafalanSession
          key={loadedSurah.ayahs[hafalanAyahIndex].id}
          surah={loadedSurah}
          ayahIndex={hafalanAyahIndex}
          onClose={() => setHafalanAyahIndex(null)}
          onNextAyah={hafalanAyahIndex < loadedSurah.ayahs.length - 1 ? () => setHafalanAyahIndex(hafalanAyahIndex + 1) : undefined}
        />
      )}
    </div>
  );
};
