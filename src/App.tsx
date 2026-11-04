/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
import { BelajarTajwidView } from './components/tajwid/BelajarTajwidView';
import { IqroDigitalView } from './components/iqro/IqroDigitalView';

function MainApp() {
  const [activeTab, setActiveTab] = useState<'games' | 'iqro' | 'reader' | 'tajwid' | 'garden' | 'achievements'>('games');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { recentAchievement, clearRecentAchievement, mode } = useQuranGame();

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      mode === 'sakinah'
        ? 'bg-[#F9F6F0] dark:bg-[#0F172A] text-[#1E293B] dark:text-[#F8FAFC]'
        : 'bg-[#FDFBF7] dark:bg-[#0B1319] text-[#2F3E46] dark:text-[#E2E8F0]'
    }`}>
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Achievement Toast */}
        <AnimatePresence>
          {recentAchievement && (
            <motion.div
              key="achievement_toast_notification"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="p-4 bg-gradient-to-r from-[#E9C46A] to-[#F4A261] text-[#1D3557] rounded-2xl shadow-lg flex items-center justify-between gap-4 font-bold border border-white/40"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5 text-[#1D3557]" />
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
          <div className="space-y-8">
            <GameHub />
            <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800">
              <TamanSurga />
            </div>
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
              <h4 className="font-bold text-sm text-[#2F3E46] dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E9C46A]" />
                <span>Tentang Filosofi Taman Surga (Raudhah)</span>
              </h4>
              <p className="text-xs text-[#52796F] dark:text-[#94A3B8] leading-relaxed">
                Rasulullah ﷺ bersabda: <em>"Jika kalian melewati taman-taman surga, maka singgahlah dan nikmatilah."</em> Para sahabat bertanya, <em>"Wahai Rasulullah, apakah taman-taman surga itu?"</em> Beliau menjawab: <em>"Majelis-majelis dzikir dan ilmu."</em> (HR. Tirmidzi).
              </p>
              <p className="text-xs text-[#52796F] dark:text-[#94A3B8] leading-relaxed">
                Setiap kali Anda menuntaskan satu ayat Al-Qur'an melalui game atau muraja'ah, pohon atau bunga baru akan bersemi di taman ini sebagai simbol pahala dan keistiqomahan Anda.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && <AchievementsView />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/70 dark:border-slate-800/80 py-8 px-4 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
        <p className="font-medium text-[#52796F] dark:text-[#84A98C] flex items-center justify-center gap-1.5">
          <span>Raudhah Qur'an</span>
          <span>·</span>
          <span>Menghafal, Membaca & Memahami Al-Qur'an dengan Damai</span>
        </p>
        <p className="text-[11px] opacity-75">
          Data offline Juz 30 · Audio Murottal Syaikh Misyari Rasyid Al-Afasy · Siap Deploy ke Cloudflare Pages
        </p>
      </footer>

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
