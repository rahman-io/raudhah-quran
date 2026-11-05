import React from 'react';
import { Award, BookMarked, BookOpen, Flame, GraduationCap, Puzzle, Settings, Trees } from 'lucide-react';
import { useQuranGame } from '../context/QuranGameContext';
import { sounds } from '../utils/soundEffects';

type Tab = 'games' | 'iqro' | 'reader' | 'tajwid' | 'garden' | 'achievements';

interface HeaderProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onOpenSettings: () => void;
}

const navigation = [
  { id: 'games', label: 'Tahfidz Game', short: 'Tahfidz', icon: Puzzle },
  { id: 'iqro', label: 'Iqro Digital', short: 'Iqro', icon: BookMarked },
  { id: 'reader', label: 'Baca & Tadabbur', short: 'Baca', icon: BookOpen },
  { id: 'tajwid', label: 'Belajar Tajwid', short: 'Tajwid', icon: GraduationCap },
  { id: 'garden', label: 'Taman Surga', short: 'Taman', icon: Trees },
  { id: 'achievements', label: 'Prestasi', short: 'Prestasi', icon: Award }
] as const;

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenSettings }) => {
  const { mode, toggleMode, streakDays } = useQuranGame();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#E8E1D6] bg-[#F8F6F1]/95 backdrop-blur-md dark:border-slate-700 dark:bg-[#152E38]/95">
        <div className="mx-auto flex h-[68px] w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-7 xl:h-[76px]">
          <button
            type="button"
            onClick={() => setActiveTab('games')}
            className="flex min-w-0 items-center gap-2.5 text-left text-[#173B4E] dark:text-white"
            aria-label="Raudhah Qur'an, kembali ke Tahfidz"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#246579] font-arabic text-xl text-white shadow-sm">ر</span>
            <span className="truncate text-sm font-extrabold tracking-tight sm:text-lg xl:text-xl">Raudhah Qur'an</span>
          </button>

          <nav aria-label="Navigasi utama" className="hidden items-center gap-1 xl:flex">
            {navigation.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                aria-current={activeTab === id ? 'page' : undefined}
                className={`whitespace-nowrap rounded-xl px-2.5 py-2 text-xs font-semibold transition-colors ${activeTab === id
                  ? 'bg-white text-[#174C60] shadow-sm dark:bg-[#246579] dark:text-white'
                  : 'text-[#55707A] hover:bg-white/70 hover:text-[#174C60] dark:text-slate-300 dark:hover:bg-[#246579]/30'}`}
              >
                {id === 'iqro' && <span className="mr-1 rounded-md bg-[#D3A253]/25 px-1.5 py-0.5 text-[10px] font-bold text-[#946A2B]">Nol</span>}
                {label}
              </button>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <span className="hidden items-center gap-1 rounded-full bg-[#D3A253]/15 px-3 py-2 text-xs font-bold text-[#946A2B] sm:inline-flex">
              <Flame className="h-4 w-4" /> {streakDays} Hari
            </span>
            <button
              type="button"
              onClick={() => { sounds.playWordClick(); toggleMode(); }}
              className="inline-flex min-h-10 items-center rounded-xl border border-[#D3A253]/70 bg-[#D3A253]/10 px-2.5 text-[11px] font-semibold text-[#173B4E] shadow-sm transition-colors hover:bg-[#D3A253]/25 dark:text-[#E9CF99] sm:px-3 sm:text-xs"
              title="Ganti Mode Pengguna: Mode Ceria (Anak/Remaja) vs Mode Sakinah (Dewasa/Lansia)"
            >
              {mode === 'ceria' ? '🐣 Ceria' : '🏮 Sakinah'}
            </button>
            <button
              type="button"
              onClick={onOpenSettings}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#55707A] transition-colors hover:bg-white hover:text-[#174C60] dark:text-slate-300 dark:hover:bg-[#246579]/30"
              title="Pengaturan Aplikasi"
              aria-label="Pengaturan Aplikasi"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
        <nav aria-label="Navigasi layar sedang" className="hidden justify-center gap-1 border-t border-[#E8E1D6] bg-white/70 px-4 py-2 dark:border-slate-700 dark:bg-[#152E38]/80 lg:flex xl:hidden">
          {navigation.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              aria-current={activeTab === id ? 'page' : undefined}
              className={`rounded-xl px-3 py-2 text-xs font-semibold ${activeTab === id ? 'bg-[#EAF2F3] text-[#174C60] dark:bg-[#246579] dark:text-white' : 'text-[#55707A] hover:bg-[#F8F6F1] dark:text-slate-300'}`}
            >
              {id === 'iqro' && <span className="mr-1 rounded-md bg-[#D3A253]/25 px-1.5 py-0.5 text-[10px] font-bold text-[#946A2B]">Nol</span>}
              {label}
            </button>
          ))}
        </nav>
      </header>

      <nav aria-label="Navigasi seluler" className="fixed inset-x-0 bottom-0 z-50 border-t border-[#E8E1D6] bg-white/95 px-1 pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(23,59,78,0.08)] backdrop-blur-md dark:border-slate-700 dark:bg-[#152E38]/95 lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-6 gap-0.5">
          {navigation.map(({ id, short, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              aria-current={activeTab === id ? 'page' : undefined}
              className={`flex min-h-[52px] min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-0.5 text-[10px] font-semibold transition-colors ${activeTab === id
                ? 'bg-[#EAF2F3] text-[#174C60] dark:bg-[#246579]/35 dark:text-white'
                : 'text-[#667882] hover:bg-[#F8F6F1] dark:text-slate-300'}`}
            >
              <Icon className="h-[19px] w-[19px]" strokeWidth={activeTab === id ? 2.3 : 1.8} />
              <span className="w-full truncate text-center">{short}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};
