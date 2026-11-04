import React from 'react';
import { Flame, Settings, Sparkles, Volume2, VolumeX, Moon, Sun } from 'lucide-react';
import { useQuranGame } from '../context/QuranGameContext';
import { sounds } from '../utils/soundEffects';

interface HeaderProps {
  activeTab: 'games' | 'iqro' | 'reader' | 'tajwid' | 'garden' | 'achievements';
  setActiveTab: (tab: 'games' | 'iqro' | 'reader' | 'tajwid' | 'garden' | 'achievements') => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings
}) => {
  const { mode, toggleMode, streakDays, xp } = useQuranGame();

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/90 dark:bg-[#1E293B]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element Brand wordmark */}
        <button
          onClick={() => setActiveTab('games')}
          className="text-lg font-bold tracking-tight text-[#1D3557] dark:text-white whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer"
        >
          <span className="w-8 h-8 rounded-xl bg-[#52796F] text-white flex items-center justify-center font-arabic text-base shadow-xs">
            ر
          </span>
          <span>Raudhah Qur'an</span>
        </button>

        {/* Zone 2: Clean single-line navigation links */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-[#52796F] dark:text-[#94A3B8]">
          <button
            onClick={() => setActiveTab('games')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
              activeTab === 'games'
                ? 'text-[#1D3557] dark:text-white border-[#52796F]'
                : 'border-transparent hover:text-[#1D3557] dark:hover:text-white'
            }`}
          >
            Tahfidz Game
          </button>

          <button
            onClick={() => setActiveTab('iqro')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'iqro'
                ? 'text-[#1D3557] dark:text-white border-[#52796F]'
                : 'border-transparent hover:text-[#1D3557] dark:hover:text-white'
            }`}
          >
            <span className="px-1.5 py-0.5 rounded-md bg-[#E9C46A]/30 text-[#8C6D23] dark:text-[#E9C46A] text-[10px] font-bold">
              Nol
            </span>
            <span>Iqro Digital</span>
          </button>

          <button
            onClick={() => setActiveTab('reader')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
              activeTab === 'reader'
                ? 'text-[#1D3557] dark:text-white border-[#52796F]'
                : 'border-transparent hover:text-[#1D3557] dark:hover:text-white'
            }`}
          >
            Baca & Tadabbur
          </button>

          <button
            onClick={() => setActiveTab('tajwid')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
              activeTab === 'tajwid'
                ? 'text-[#1D3557] dark:text-white border-[#52796F]'
                : 'border-transparent hover:text-[#1D3557] dark:hover:text-white'
            }`}
          >
            Belajar Tajwid
          </button>

          <button
            onClick={() => setActiveTab('garden')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
              activeTab === 'garden'
                ? 'text-[#1D3557] dark:text-white border-[#52796F]'
                : 'border-transparent hover:text-[#1D3557] dark:hover:text-white'
            }`}
          >
            Taman Surga
          </button>

          <button
            onClick={() => setActiveTab('achievements')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
              activeTab === 'achievements'
                ? 'text-[#1D3557] dark:text-white border-[#52796F]'
                : 'border-transparent hover:text-[#1D3557] dark:hover:text-white'
            }`}
          >
            Prestasi
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action (Mode Switcher + Quick Settings) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Streak indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#E76F51] font-bold bg-[#E76F51]/10 px-2.5 py-1 rounded-full">
            <Flame className="w-3.5 h-3.5" />
            <span className="tabular-nums">{streakDays} Hari</span>
          </div>

          {/* Mode Switcher Button */}
          <button
            onClick={() => {
              sounds.playWordClick();
              toggleMode();
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 border shadow-xs ${
              mode === 'ceria'
                ? 'bg-[#E9C46A]/20 border-[#E9C46A] text-[#1D3557] dark:text-[#E9C46A]'
                : 'bg-[#52796F]/10 border-[#52796F]/30 text-[#52796F] dark:text-[#A8D5BA]'
            }`}
            title="Ganti Mode Pengguna: Mode Ceria (Anak/Remaja) vs Mode Sakinah (Dewasa/Lansia)"
          >
            <span>{mode === 'ceria' ? '🐣 Ceria' : '🏮 Sakinah'}</span>
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Pengaturan Aplikasi"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex md:hidden border-t border-slate-200/80 dark:border-slate-800 px-3 py-2 justify-around bg-white/80 dark:bg-slate-900/80 text-[11px] font-semibold overflow-x-auto scrollbar-thin">
        <button
          onClick={() => setActiveTab('games')}
          className={`py-1 px-2 rounded-lg whitespace-nowrap shrink-0 ${
            activeTab === 'games'
              ? 'text-[#1D3557] dark:text-white bg-[#52796F]/15 font-bold'
              : 'text-slate-500'
          }`}
        >
          Tahfidz
        </button>
        <button
          onClick={() => setActiveTab('iqro')}
          className={`py-1 px-2 rounded-lg whitespace-nowrap shrink-0 ${
            activeTab === 'iqro'
              ? 'text-[#1D3557] dark:text-white bg-[#52796F]/15 font-bold'
              : 'text-slate-500'
          }`}
        >
          Iqro Digital
        </button>
        <button
          onClick={() => setActiveTab('reader')}
          className={`py-1 px-2 rounded-lg whitespace-nowrap shrink-0 ${
            activeTab === 'reader'
              ? 'text-[#1D3557] dark:text-white bg-[#52796F]/15 font-bold'
              : 'text-slate-500'
          }`}
        >
          Baca
        </button>
        <button
          onClick={() => setActiveTab('tajwid')}
          className={`py-1 px-2 rounded-lg whitespace-nowrap shrink-0 ${
            activeTab === 'tajwid'
              ? 'text-[#1D3557] dark:text-white bg-[#52796F]/15 font-bold'
              : 'text-slate-500'
          }`}
        >
          Tajwid
        </button>
        <button
          onClick={() => setActiveTab('garden')}
          className={`py-1 px-2 rounded-lg whitespace-nowrap shrink-0 ${
            activeTab === 'garden'
              ? 'text-[#1D3557] dark:text-white bg-[#52796F]/15 font-bold'
              : 'text-slate-500'
          }`}
        >
          Taman
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`py-1 px-2 rounded-lg whitespace-nowrap shrink-0 ${
            activeTab === 'achievements'
              ? 'text-[#1D3557] dark:text-white bg-[#52796F]/15 font-bold'
              : 'text-slate-500'
          }`}
        >
          Prestasi
        </button>
      </div>
    </header>
  );
};
