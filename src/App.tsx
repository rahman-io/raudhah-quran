/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Sparkles, X, Heart } from 'lucide-react';
import { QuranGameProvider, useQuranGame } from './context/QuranGameContext';
import { Header } from './components/Header';
import { GameHub } from './components/games/GameHub';
import { MushafReader } from './components/reader/MushafReader';
import { TamanSurga } from './components/garden/TamanSurga';
import { AchievementsView } from './components/achievements/AchievementsView';
import { WordExplorerModal } from './components/tadabbur/WordExplorerModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { InstallAppPrompt } from './components/InstallAppPrompt';
import { BelajarTajwidView } from './components/tajwid/BelajarTajwidView';
import { IqroDigitalView } from './components/iqro/IqroDigitalView';
import { useBackHandler, useExitPrompt } from './utils/backNavigation';
import { loadView, saveView } from './utils/viewState';

type Tab = 'games' | 'iqro' | 'reader' | 'tajwid' | 'garden' | 'achievements';
const TABS: Tab[] = ['games', 'iqro', 'reader', 'tajwid', 'garden', 'achievements'];

function MainApp() {
  // Menu terakhir dipulihkan setelah halaman di-refresh.
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const saved = loadView().tab as Tab | undefined;
    return saved && TABS.includes(saved) ? saved : 'games';
  });
  useEffect(() => {
    saveView({ tab: activeTab });
  }, [activeTab]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { recentAchievement, clearRecentAchievement, mode, selectedWordForTadabbur, setSelectedWordForTadabbur } = useQuranGame();
  const [showExitHint, setShowExitHint] = useState(false);

  // Tombol back HP: tutup jendela yang terbuka, lalu kembali ke menu depan,
  // dan di menu depan minta tekan sekali lagi sebelum keluar.
  useExitPrompt(setShowExitHint);
  useBackHandler(activeTab !== 'games', () => setActiveTab('games'), 0);
  useBackHandler(isSettingsOpen, () => setIsSettingsOpen(false), 10);
  useBackHandler(!!selectedWordForTadabbur, () => setSelectedWordForTadabbur(null), 10);

  return (
    <div className={`raudhah-ui min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      mode === 'sakinah'
        ? 'bg-[#F7F4EF] dark:bg-[#0F172A] text-[#293640] dark:text-[#F8FAFC]'
        : 'bg-[#F7F4EF] dark:bg-[#0D202A] text-[#293640] dark:text-[#E2E8F0]'
    }`}>
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-5 sm:pt-8 pb-28 lg:pb-10 space-y-7 sm:space-y-8">
        {/* Achievement Toast */}
        <AnimatePresence>
          {recentAchievement && (
            <motion.div
              key="achievement_toast_notification"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="p-4 bg-gradient-to-r from-[#D3A253] to-[#E3B973] text-[#173B4E] rounded-2xl shadow-lg flex items-center justify-between gap-4 font-bold border border-white/40"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5 text-[#173B4E]" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider block opacity-80">
                    Lencana Baru Diraih!
                  </span>
                  <p className="text-sm font-extrabold">{recentAchievement}</p>
                </div>
              </div>
              <button
                onClick={clearRecentAchievement}
                className="p-1 rounded-full hover:bg-black/10 transition-colors"
                title="Tutup pemberitahuan"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View Router */}
        {activeTab === 'games' && (
          <div className="space-y-5 sm:space-y-6">
            <TamanSurga compact />
            <GameHub />
          </div>
        )}

        {activeTab === 'iqro' && (
          <IqroDigitalView onGoToQuiz={() => setActiveTab('games')} />
        )}

        {activeTab === 'reader' && <MushafReader />}

        {activeTab === 'tajwid' && (
          <BelajarTajwidView onGoToQuiz={() => setActiveTab('games')} />
        )}

        {activeTab === 'garden' && (
          <div className="space-y-6">
            <TamanSurga />
            <div className="p-6 bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="font-bold text-sm text-[#293640] dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D3A253]" />
                <span>Tentang Filosofi Taman Surga (Raudhah)</span>
              </h4>
              <p className="text-xs text-[#246579] dark:text-[#94A3B8] leading-relaxed">
                Rasulullah ﷺ bersabda: <em>"Jika kalian melewati taman-taman surga, maka singgahlah dan nikmatilah."</em> Para sahabat bertanya, <em>"Wahai Rasulullah, apakah taman-taman surga itu?"</em> Beliau menjawab: <em>"Majelis-majelis dzikir dan ilmu."</em> (HR. Tirmidzi).
              </p>
              <p className="text-xs text-[#246579] dark:text-[#94A3B8] leading-relaxed">
                Setiap kali Anda menuntaskan satu ayat Al-Qur'an melalui game atau muraja'ah, pohon atau bunga baru akan bersemi di taman ini sebagai simbol pahala dan keistiqomahan Anda.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && <AchievementsView />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#E8E1D6] dark:border-slate-800/80 pt-7 pb-28 lg:pb-8 px-4 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
        <p className="font-medium text-[#246579] dark:text-[#477F8D] flex items-center justify-center gap-1.5">
          <span>Raudhah Qur'an</span>
          <span>·</span>
          <span>Menghafal, Membaca & Memahami Al-Qur'an dengan Damai</span>
        </p>
      </footer>

      {/* Pesan sebelum keluar aplikasi lewat tombol back */}
      <AnimatePresence>
        {showExitHint && (
          <motion.div
            key="exit_hint"
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed left-1/2 -translate-x-1/2 bottom-28 lg:bottom-10 z-[80] px-4 py-2.5 rounded-full bg-[#173B4E]/95 text-white text-xs font-semibold shadow-lg whitespace-nowrap"
          >
            Tekan sekali lagi untuk keluar
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ajakan memasang app (PWA) agar terbuka layar penuh tanpa bilah browser */}
      <InstallAppPrompt />

      {/* Modals */}
      <WordExplorerModal />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <QuranGameProvider>
      <MainApp />
    </QuranGameProvider>
  );
}
