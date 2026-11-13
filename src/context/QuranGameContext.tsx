import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Ayah, GardenPlant, QuranWord, Surah, UserMode, UserStats } from '../types/quran';
import { INITIAL_BADGES, INITIAL_PLANTS_CATALOG, SURAHS_DATA } from '../data/quranData';
import { sounds } from '../utils/soundEffects';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { firebaseAuth, firebaseConfigured, firestore, signInWithGoogle, signOutFromFirebase } from '../services/firebaseClient';
import { useFirebaseCollection } from '../services/firebaseContent';
import { DEFAULT_RECITER_ID, reciterAudioUrl } from '../data/reciters';

/** Ukuran bawaan teks latin & terjemahan di menu Baca (sama dengan tampilan sebelumnya). */
const DEFAULT_TEXT_SIZE = 12;

interface QuranGameContextType {
  surahs: Surah[];
  firebaseUser: User | null;
  firebaseConfigured: boolean;
  syncStatus: 'local' | 'connecting' | 'synced' | 'error';
  signIn: typeof signInWithGoogle;
  signOut: typeof signOutFromFirebase;
  resetProgress: () => Promise<void>;
  mode: UserMode;
  setMode: (mode: UserMode) => void;
  toggleMode: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  latinFontSize: number;
  setLatinFontSize: (size: number) => void;
  translationFontSize: number;
  setTranslationFontSize: (size: number) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  reciterSpeed: number;
  setReciterSpeed: (speed: number) => void;
  reciterId: string;
  setReciterId: (id: string) => void;

  // Stats
  xp: number;
  addXP: (amount: number, reason?: string) => void;
  streakDays: number;
  memorizedAyahIds: string[];
  markAyahMemorized: (ayahId: string) => void;
  /** Batalkan tanda "sudah hafal" (mis. salah pencet): XP dan tanaman dari tanda itu ikut ditarik. */
  unmarkAyahMemorized: (ayahId: string) => void;
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
const OWNER_KEY = 'raudhah_progress_owner_uid';

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
  reciterId: DEFAULT_RECITER_ID,
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

  const surahs = useFirebaseCollection<Surah>('surahs', SURAHS_DATA, (s) =>
    Number.isInteger(s.number) && Array.isArray(s.ayahs) && s.ayahs.every((a) => a.id && a.audioUrl && Array.isArray(a.words))
  );
  const badges = useFirebaseCollection('badges', INITIAL_BADGES, (badge) => Boolean(badge.id && badge.title));
  const plants = useFirebaseCollection('plants', INITIAL_PLANTS_CATALOG, (plant) =>
    Boolean(plant.type && Number.isInteger(plant.requiredAyahs)));
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState<'local' | 'connecting' | 'synced' | 'error'>('local');
  const [syncReady, setSyncReady] = useState(false);
  const remoteStats = useRef('');
  const pendingStatsWrite = useRef(false);
  const [activeSurahNumber, setActiveSurahNumber] = useState<number>(114); // Start with An-Naas
  const activeSurah = surahs.find((s) => s.number === activeSurahNumber) || surahs[0];

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

  useEffect(() => {
    if (!firebaseAuth) return;
    return onAuthStateChanged(firebaseAuth, (user) => {
      setSyncReady(false);
      pendingStatsWrite.current = false;
      setFirebaseUser(user);
      setSyncStatus(user ? 'connecting' : 'local');
    });
  }, []);

  useEffect(() => {
    if (!firebaseUser || !firestore) return;
    const uid = firebaseUser.uid;
    const owner = localStorage.getItem(OWNER_KEY);
    const reference = doc(firestore, 'users', uid);
    let initialized = false;
    const unsubscribe = onSnapshot(reference, (snapshot) => {
      if (snapshot.metadata.hasPendingWrites || snapshot.metadata.fromCache) return;
      const incoming = snapshot.data()?.stats as UserStats | undefined;
      if (!initialized) {
        initialized = true;
        setStats((local) => {
          const merged = incoming
            ? owner && owner !== uid ? { ...defaultStats, ...incoming } : {
                ...local, ...incoming,
                xp: Math.max(local.xp, incoming.xp || 0),
                reviewedCount: Math.max(local.reviewedCount, incoming.reviewedCount || 0),
                memorizedAyahIds: [...new Set([...(incoming.memorizedAyahIds || []), ...local.memorizedAyahIds])],
                unlockedBadges: [...new Set([...(incoming.unlockedBadges || []), ...local.unlockedBadges])],
                gardenPlants: [...new Map([...local.gardenPlants, ...(incoming.gardenPlants || [])].map((plant) => [plant.id, plant])).values()]
              }
            : owner && owner !== uid ? { ...defaultStats } : local;
          remoteStats.current = JSON.stringify(incoming || {});
          return merged;
        });
        localStorage.setItem(OWNER_KEY, uid);
        setSyncReady(true);
        setSyncStatus('synced');
      } else if (incoming && !pendingStatsWrite.current && JSON.stringify(incoming) !== remoteStats.current) {
        remoteStats.current = JSON.stringify(incoming);
        setStats({ ...defaultStats, ...incoming });
      }
    }, (error) => {
      console.warn('Sinkronisasi progres gagal:', error);
      setSyncStatus('error');
    });
    return () => {
      initialized = false;
      unsubscribe();
    };
  }, [firebaseUser]);

  useEffect(() => {
    if (!syncReady || !firebaseUser || !firestore) return;
    const serialized = JSON.stringify(stats);
    if (serialized === remoteStats.current) return;
    pendingStatsWrite.current = true;
    const reference = doc(firestore, 'users', firebaseUser.uid);
    const timer = setTimeout(() => {
      remoteStats.current = serialized;
      setDoc(reference, { stats, updatedAt: new Date().toISOString() })
        .then(() => {
          pendingStatsWrite.current = false;
          setSyncStatus('synced');
        })
        .catch((error) => {
          console.warn('Progres belum tersimpan di Firebase:', error);
          remoteStats.current = '';
          setSyncStatus('error');
        });
    }, 500);
    return () => clearTimeout(timer);
  }, [stats, firebaseUser, syncReady]);

  const resetProgress = useCallback(async () => {
    const reset = { ...defaultStats, lastActiveDate: new Date().toISOString().split('T')[0] };
    if (firebaseUser && firestore) {
      await setDoc(doc(firestore, 'users', firebaseUser.uid), { stats: reset, updatedAt: new Date().toISOString() });
      remoteStats.current = JSON.stringify(reset);
    }
    setStats(reset);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reset));
  }, [firebaseUser]);

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
    setSelectedAyah((previous) => activeSurah.ayahs.find((ayah) => ayah.id === previous.id) || activeSurah.ayahs[0]);
  }, [activeSurahNumber, activeSurah]);

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

  const setLatinFontSize = useCallback((latinFontSize: number) => {
    setStats((prev) => ({ ...prev, latinFontSize }));
  }, []);

  const setTranslationFontSize = useCallback((translationFontSize: number) => {
    setStats((prev) => ({ ...prev, translationFontSize }));
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

  const setReciterId = useCallback((reciterId: string) => {
    setStats((prev) => ({ ...prev, reciterId }));
  }, []);

  const checkBadgeUnlocks = useCallback((memorizedCount: number, streak: number, unlockedBadges: string[]) => {
    const newUnlocked = [...unlockedBadges];
    let badgeEarned: string | null = null;

    badges.forEach((badge) => {
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
  }, [stats.gardenPlants.length, stats.memorizedAyahIds, badges]);

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
      const plantCatalogItem = plants.find(
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
        const surahObj = surahs.find((s) => s.number === Number(sNum));

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
  }, [celebrateSuccess, checkBadgeUnlocks, surahs, plants]);

  const unmarkAyahMemorized = useCallback((ayahId: string) => {
    setStats((prev) => {
      if (!prev.memorizedAyahIds.includes(ayahId)) return prev;
      // Tanaman yang tumbuh tepat saat jumlah hafalan mencapai angka ini ikut dicabut,
      // agar menandai-membatalkan berulang tidak menumbuhkan tanaman ganda.
      const plantCatalogItem = plants.find((p) => p.requiredAyahs === prev.memorizedAyahIds.length);
      let gardenPlants = prev.gardenPlants;
      if (plantCatalogItem) {
        const index = gardenPlants.map((plant) => plant.type).lastIndexOf(plantCatalogItem.type);
        if (index !== -1) gardenPlants = gardenPlants.filter((_, i) => i !== index);
      }
      return {
        ...prev,
        xp: Math.max(0, prev.xp - 100),
        memorizedAyahIds: prev.memorizedAyahIds.filter((id) => id !== ayahId),
        gardenPlants
      };
    });
  }, [plants]);

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
    // Suara qari pilihan pengguna; bila gagal dimuat, kembali ke audio bawaan ayat.
    const reciterUrl = reciterAudioUrl(stats.reciterId, ayah);
    audio.src = reciterUrl || ayah.audioUrl;
    audio.playbackRate = stats.reciterSpeed;

    audio.onended = () => {
      setIsPlayingAudio(false);
      setCurrentPlayingAyahId(null);
      if (onAudioEndCallbackRef.current) {
        onAudioEndCallbackRef.current();
      }
    };

    const start = () => audio.play().then(() => {
      setIsPlayingAudio(true);
      setCurrentPlayingAyahId(ayah.id);
    }).catch(() => {
      setIsPlayingAudio(false);
      setCurrentPlayingAyahId(null);
    });

    audio.onerror = () => {
      if (ayah.audioUrl && audio.src !== ayah.audioUrl) {
        audio.src = ayah.audioUrl;
        audio.playbackRate = stats.reciterSpeed;
        start();
        return;
      }
      setIsPlayingAudio(false);
      setCurrentPlayingAyahId(null);
    };

    start();
  }, [stats.reciterSpeed, stats.reciterId]);

  return (
    <QuranGameContext.Provider
      value={{
        surahs,
        firebaseUser,
        firebaseConfigured,
        syncStatus,
        signIn: signInWithGoogle,
        signOut: signOutFromFirebase,
        resetProgress,
        mode: stats.mode,
        setMode,
        toggleMode,
        fontSize: stats.fontSize,
        setFontSize,
        latinFontSize: stats.latinFontSize ?? DEFAULT_TEXT_SIZE,
        setLatinFontSize,
        translationFontSize: stats.translationFontSize ?? DEFAULT_TEXT_SIZE,
        setTranslationFontSize,
        soundEnabled: stats.soundEnabled,
        toggleSound,
        reciterSpeed: stats.reciterSpeed,
        setReciterSpeed,
        reciterId: stats.reciterId ?? DEFAULT_RECITER_ID,
        setReciterId,
        xp: stats.xp,
        addXP,
        streakDays: stats.streakDays,
        memorizedAyahIds: stats.memorizedAyahIds,
        markAyahMemorized,
        unmarkAyahMemorized,
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
