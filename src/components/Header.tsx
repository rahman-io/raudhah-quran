import React from 'react';
import { Settings } from 'lucide-react';
import { MenuIcon } from './MenuIcon';

type Tab = 'home' | 'iqro' | 'reader' | 'tajwid' | 'garden' | 'achievements';

interface HeaderProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onOpenSettings: () => void;
}

const navigation = [
  { id: 'home', label: 'Beranda', short: 'Beranda', icon: 'beranda' },
  { id: 'iqro', label: 'Iqro Digital', short: 'Iqro', icon: 'iqro' },
  { id: 'reader', label: 'Baca & Tadabbur', short: 'Baca', icon: 'quran' },
  { id: 'tajwid', label: 'Belajar Tajwid', short: 'Tajwid', icon: 'tajwid' },
  { id: 'garden', label: 'Taman Surga', short: 'Taman', icon: 'taman' },
  { id: 'achievements', label: 'Prestasi', short: 'Prestasi', icon: 'prestasi' }
] as const;

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenSettings }) => {
  return (
    <>
      {/* Header berwarna sama dengan bilah status HP (theme-color #246579), menyatu sebagai satu app bar */}
      <header className="sticky top-0 z-40 bg-[#246579] text-white shadow-[0_6px_24px_rgba(23,59,78,0.18)]">
        {/* Ornamen titik keemasan yang halus */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.12] bg-[radial-gradient(#D3A253_1px,transparent_1px)] [background-size:14px_14px]" aria-hidden="true" />
        <div className="relative mx-auto flex h-[64px] w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-7 xl:h-[72px]">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="flex min-w-0 items-center gap-3 text-left"
            aria-label="Raudhah Qur'an, kembali ke Beranda"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-[#D3A253]/60 font-arabic text-xl text-[#F5D58A] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
              ر
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-base font-extrabold tracking-tight sm:text-lg xl:text-xl">Raudhah Qur'an</span>
              <span className="block truncate text-[10px] font-medium tracking-wide text-[#A7CDD3] sm:text-[11px]">Hafal · Baca · Tadabbur</span>
            </span>
          </button>

          <nav aria-label="Navigasi utama" className="hidden items-center gap-1 xl:flex">
            {navigation.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                aria-current={activeTab === id ? 'page' : undefined}
                className={`whitespace-nowrap rounded-xl px-2.5 py-2 text-xs font-semibold transition-colors ${activeTab === id
                  ? 'bg-white text-[#174C60] shadow-sm'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
              >
                {id === 'iqro' && <span className="mr-1 rounded-md bg-[#D3A253]/30 px-1.5 py-0.5 text-[10px] font-bold text-[#F5D58A]">Nol</span>}
                {label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={onOpenSettings}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/15 transition-colors hover:bg-white/20"
            title="Pengaturan Aplikasi"
            aria-label="Pengaturan Aplikasi"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
        <nav aria-label="Navigasi layar sedang" className="relative hidden justify-center gap-1 border-t border-white/10 bg-[#1F5A6D] px-4 py-2 lg:flex xl:hidden">
          {navigation.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              aria-current={activeTab === id ? 'page' : undefined}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${activeTab === id ? 'bg-white text-[#174C60] shadow-sm' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
            >
              {id === 'iqro' && <span className="mr-1 rounded-md bg-[#D3A253]/30 px-1.5 py-0.5 text-[10px] font-bold text-[#F5D58A]">Nol</span>}
              {label}
            </button>
          ))}
        </nav>
      </header>

      <nav aria-label="Navigasi seluler" className="fixed inset-x-0 bottom-0 z-50 border-t border-[#E8E1D6] bg-white/95 px-1 pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(23,59,78,0.08)] backdrop-blur-md dark:border-slate-700 dark:bg-[#152E38]/95 lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-6 gap-0.5">
          {navigation.map(({ id, short, icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              aria-current={activeTab === id ? 'page' : undefined}
              className={`flex min-h-[52px] min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-0.5 text-[10px] font-semibold transition-colors ${activeTab === id
                ? 'bg-[#EAF2F3] text-[#174C60] dark:bg-[#246579]/35 dark:text-white'
                : 'text-[#667882] hover:bg-[#F8F6F1] dark:text-slate-300'}`}
            >
              <MenuIcon id={icon} place="nav" active={activeTab === id} />
              <span className="w-full truncate text-center">{short}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};
