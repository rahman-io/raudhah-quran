import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Ayah, GardenPlant, QuranWord, Surah, UserMode, UserStats } from '../types/quran';
import { INITIAL_BADGES, INITIAL_PLANTS_CATALOG, SURAHS_DATA } from '../data/quranData';
import { sounds } from '../utils/soundEffects';

interface QuranGameContextType {
  mode: UserMode;
  setMode: (mode: UserMode) => void;
  toggleMode: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  reciterSpeed: number;
  setReciterSpeed: (speed: number) => void;

  // Stats
  xp: number;
  addXP: (amount: number, reason?: string) => void;
  streakDays: number;
  memorizedAyahIds: string[];
  markAyahMemorized: (ayahId: string) => void;
  gardenPlants: GardenPlant[];
  unlockedBadges: string[];
  recentAchievement: string | null;
  clearRecentAchievement: () => void;

  // Selection & Navigation
  activeSurah: Surah;
  setActiveSurahNumber: (num: number) => void;
  selectedAyah: Ayah;
  setSelectedAyah: (ayah: Ayah) => void;

  // Tadabbur Modal
  selectedWordForTadabbur: QuranWord | null;
  setSelectedWordForTadabbur: (word: QuranWord | null) => void;
  inspectWord: (word: QuranWord) => void;

  // Audio Playback
  currentPlayingAyahId: string | null;
  isPlayingAudio: boolean;
  playMurottal: (ayah: Ayah, onEnd?: () => void) => void;
  pauseMurottal: () => void;

  // Visual celebration
  celebrateSuccess: () => void;
}

const STORAGE_KEY = 'raudhah_quran_user_v1';

const defaultStats: UserStats = {
  xp: 0,
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  memorizedAyahIds: [],
  reviewedCount: 0,
  unlockedBadges: [],
  gardenPlants: [
    {
      id: 'initial_plant_1',
      type: 'olive_tree',
      name: 'Tunas Zaitun Awal',
      surahName: 'Al-Fatihah',
      ayahNumber: 1,
      unlockedAt: new Date().toISOString(),
      x: 35,
      y: 65,
      scale: 0.95
    }
  ],
  soundEnabled: true,
  fontSize: 32,
  reciterSpeed: 1.0,
  mode: 'ceria'
};

const QuranGameContext = createContext<QuranGameContextType | undefined>(undefined);

export const QuranGameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultStats, ...parsed };
      }
    } catch {
      // Fallback
    }
    return defaultStats;
  });

  const [activeSurahNumber, setActiveSurahNumber] = useState<number>(114); // Start with An-Naas
  const activeSurah = SURAHS_DATA.find((s) => s.number === activeSurahNumber) || SURAHS_DATA[0];

  const [selectedAyah, setSelectedAyah] = useState<Ayah>(() => activeSurah.ayahs[0]);
  const [selectedWordForTadabbur, setSelectedWordForTadabbur] = useState<QuranWord | null>(null);
  const [recentAchievement, setRecentAchievement] = useState<string | null>(null);

  // Audio player ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentPlayingAyahId, setCurrentPlayingAyahId] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const onAudioEndCallbackRef = useRef<(() => void) | undefined>(undefined);

  // Sync sounds singleton with stats
  useEffect(() => {
    sounds.enabled = stats.soundEnabled;
  }, [stats.soundEnabled]);

  // Persist stats to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
      console.error('Error saving stats:', e);
    }
  }, [stats]);

  // Streak verification on mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const last = stats.lastActiveDate;

    if (last !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = stats.streakDays;
      if (last === yesterdayStr) {
        newStreak += 1;
      } else if (last < yesterdayStr) {
        newStreak = 1; // Reset if missed more than 1 day
      }

      setStats((prev) => ({
        ...prev,
        lastActiveDate: today,
        streakDays: newStreak
      }));
    }
  }, [stats.lastActiveDate, stats.streakDays]);

  // Switch selected ayah if active surah changes
  useEffect(() => {
    setSelectedAyah(activeSurah.ayahs[0]);
  }, [activeSurah]);

  const setMode = useCallback((mode: UserMode) => {
    setStats((prev) => ({ ...prev, mode }));
  }, []);

  const toggleMode = useCallback(() => {
    setStats((prev) => {
      const nextMode = prev.mode === 'ceria' ? 'sakinah' : 'ceria';
      return { ...prev, mode: nextMode };
    });
  }, []);

  const setFontSize = useCallback((fontSize: number) => {
    setStats((prev) => ({ ...prev, fontSize }));
  }, []);

  const toggleSound = useCallback(() => {
    setStats((prev) => {
      const next = !prev.soundEnabled;
      sounds.enabled = next;
      return { ...prev, soundEnabled: next };
    });
  }, []);

  const setReciterSpeed = useCallback((reciterSpeed: number) => {
    setStats((prev) => ({ ...prev, reciterSpeed }));
    if (audioRef.current) {
      audioRef.current.playbackRate = reciterSpeed;
    }
  }, []);

  const checkBadgeUnlocks = useCallback((memorizedCount: number, streak: number, unlockedBadges: string[]) => {
    const newUnlocked = [...unlockedBadges];
    let badgeEarned: string | null = null;

    INITIAL_BADGES.forEach((badge) => {
      if (!newUnlocked.includes(badge.id)) {
        let qualifies = false;
        if (badge.id === 'first_ayah' && memorizedCount >= 1) qualifies = true;
        if (badge.id === 'streak_3' && streak >= 3) qualifies = true;
        if (badge.id === 'garden_oasis' && stats.gardenPlants.length >= 3) qualifies = true;
        if (badge.id === 'surah_naas') {
          const naasAyahIds = ['114:1', '114:2', '114:3', '114:4', '114:5', '114:6'];
          const hasAll = naasAyahIds.every((id) => stats.memorizedAyahIds.includes(id));
          if (hasAll) qualifies = true;
        }

        if (qualifies) {
          newUnlocked.push(badge.id);
          badgeEarned = badge.title;
        }
      }
    });

    return { newUnlocked, badgeEarned };
  }, [stats.gardenPlants.length, stats.memorizedAyahIds]);

  const addXP = useCallback((amount: number) => {
    setStats((prev) => {
      const newXp = prev.xp + amount;
      return { ...prev, xp: newXp };
    });
  }, []);

  const celebrateSuccess = useCallback(() => {
    sounds.playCorrectDing();
    if (typeof window !== 'undefined') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#E9C46A', '#84A98C', '#52796F', '#2A9D8F']
        });
      } catch {
        // ignore
      }
    }
  }, []);

  const markAyahMemorized = useCallback((ayahId: string) => {
    let earnedTitle: string | null = null;
    let didBloomGarden = false;

    setStats((prev) => {
      if (prev.memorizedAyahIds.includes(ayahId)) {
        return prev;
      }

      const updatedMemorized = [...prev.memorizedAyahIds, ayahId];
      const newXp = prev.xp + 100;

      // Check if new plant can be unlocked for the garden
      const plantCatalogItem = INITIAL_PLANTS_CATALOG.find(
        (p) => p.requiredAyahs === updatedMemorized.length
      );

      let updatedPlants = [...prev.gardenPlants];
      if (plantCatalogItem) {
        didBloomGarden = true;
        // Random placement coordinates on garden hills
        const plantPositions = [
          { x: 18, y: 70 },
          { x: 52, y: 62 },
          { x: 78, y: 68 },
          { x: 30, y: 55 },
          { x: 68, y: 56 },
          { x: 88, y: 72 }
        ];
        const pos = plantPositions[updatedPlants.length % plantPositions.length];

        const [sNum, aNum] = ayahId.split(':');
        const surahObj = SURAHS_DATA.find((s) => s.number === Number(sNum));

        updatedPlants.push({
          id: `plant_${Date.now()}`,
          type: plantCatalogItem.type,
          name: plantCatalogItem.name,
          surahName: surahObj ? surahObj.nameLatin : 'Al-Qur\'an',
          ayahNumber: Number(aNum),
          unlockedAt: new Date().toISOString(),
          x: pos.x,
          y: pos.y,
          scale: 0.9 + Math.random() * 0.2
        });
      }

      const { newUnlocked, badgeEarned } = checkBadgeUnlocks(updatedMemorized.length, prev.streakDays, prev.unlockedBadges);
      earnedTitle = badgeEarned;

      return {
        ...prev,
        xp: newXp,
        memorizedAyahIds: updatedMemorized,
        gardenPlants: updatedPlants,
        unlockedBadges: newUnlocked
      };
    });

    if (didBloomGarden) {
      sounds.playGardenBloom();
    } else {
      sounds.playAyahComplete();
    }

    if (earnedTitle) {
      setRecentAchievement(earnedTitle);
    }

    celebrateSuccess();
  }, [celebrateSuccess, checkBadgeUnlocks]);

  const inspectWord = useCallback((word: QuranWord) => {
    setSelectedWordForTadabbur(word);
    sounds.playWordClick();

    let earnedBadge = false;
    setStats((prev) => {
      const newReviewed = prev.reviewedCount + 1;
      let newBadges = [...prev.unlockedBadges];
      if (newReviewed >= 10 && !newBadges.includes('word_master')) {
        newBadges.push('word_master');
        earnedBadge = true;
      }
      return { ...prev, reviewedCount: newReviewed, unlockedBadges: newBadges };
    });

    if (earnedBadge) {
      setRecentAchievement('Penyelam Tadabbur');
      sounds.playAyahComplete();
    }
  }, []);

  // Audio Playback
  const pauseMurottal = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlayingAudio(false);
    setCurrentPlayingAyahId(null);
  }, []);

  const playMurottal = useCallback((ayah: Ayah, onEnd?: () => void) => {
    onAudioEndCallbackRef.current = onEnd;

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;
    audio.pause();
    audio.src = ayah.audioUrl;
    audio.playbackRate = stats.reciterSpeed;

    audio.onended = () => {
      setIsPlayingAudio(false);
      setCurrentPlayingAyahId(null);
      if (onAudioEndCallbackRef.current) {
        onAudioEndCallbackRef.current();
      }
    };

    audio.onerror = () => {
      setIsPlayingAudio(false);
      setCurrentPlayingAyahId(null);
    };

    audio.play().then(() => {
      setIsPlayingAudio(true);
      setCurrentPlayingAyahId(ayah.id);
    }).catch(() => {
      setIsPlayingAudio(false);
      setCurrentPlayingAyahId(null);
    });
  }, [stats.reciterSpeed]);

  return (
    <QuranGameContext.Provider
      value={{
        mode: stats.mode,
        setMode,
        toggleMode,
        fontSize: stats.fontSize,
        setFontSize,
        soundEnabled: stats.soundEnabled,
        toggleSound,
        reciterSpeed: stats.reciterSpeed,
        setReciterSpeed,
        xp: stats.xp,
        addXP,
        streakDays: stats.streakDays,
        memorizedAyahIds: stats.memorizedAyahIds,
        markAyahMemorized,
        gardenPlants: stats.gardenPlants,
        unlockedBadges: stats.unlockedBadges,
        recentAchievement,
        clearRecentAchievement: () => setRecentAchievement(null),
        activeSurah,
        setActiveSurahNumber,
        selectedAyah,
        setSelectedAyah,
        selectedWordForTadabbur,
        setSelectedWordForTadabbur,
        inspectWord,
        currentPlayingAyahId,
        isPlayingAudio,
        playMurottal,
        pauseMurottal,
        celebrateSuccess
      }}
    >
      {children}
    </QuranGameContext.Provider>
  );
};

export const useQuranGame = (): QuranGameContextType => {
  const context = useContext(QuranGameContext);
  if (!context) {
    throw new Error('useQuranGame must be used within a QuranGameProvider');
  }
  return context;
};
