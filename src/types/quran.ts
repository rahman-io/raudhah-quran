export type UserMode = 'ceria' | 'sakinah';

export interface QuranWord {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  rootWord?: string;
  grammarType?: 'Isim (Kata Benda/Nama)' | 'Fi\'il (Kata Kerja)' | 'Harf (Kata Sambung/Huruf)';
  explanation?: string;
}

export interface Ayah {
  id: string; // e.g. "114:1"
  surahNumber: number;
  ayahNumber: number;
  globalAyahNumber: number; // for audio CDN (1..6236)
  arabicText: string;
  transliteration: string;
  translationId: string;
  words: QuranWord[];
  audioUrl: string;
  tadabbur: {
    title: string;
    hikmah: string;
    amal: string;
  };
}

export interface Surah {
  number: number;
  nameArabic: string;
  nameLatin: string;
  translationLatin: string;
  numberOfAyahs: number;
  revelationType: 'Makkiyah' | 'Madaniyah';
  bismillahPre: boolean;
  themeColor: string;
  ayahs: Ayah[];
}

export type GameType =
  | 'word-puzzle'
  | 'blank-fill'
  | 'vanishing-ayah'
  | 'audio-sambung'
  | 'memory-match'
  | 'tajwid-quiz';

export interface GardenPlant {
  id: string;
  type: 'olive_tree' | 'date_palm' | 'sidr_tree' | 'jasmine_flower' | 'lotus_flower' | 'pomegranate';
  name: string;
  surahName: string;
  ayahNumber: number;
  unlockedAt: string;
  x: number; // percentage
  y: number; // percentage
  scale: number;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
  xpReward: number;
}

export interface UserStats {
  xp: number;
  streakDays: number;
  lastActiveDate: string;
  memorizedAyahIds: string[];
  reviewedCount: number;
  unlockedBadges: string[];
  gardenPlants: GardenPlant[];
  soundEnabled: boolean;
  fontSize: number; // 24 to 48px
  reciterSpeed: number; // 0.8 or 1.0
  mode: UserMode;
}
