import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Search, Sparkles, ChevronDown, ChevronUp, Award, ArrowRight, Volume2, Sliders, Mic, Layers, HelpCircle, CheckCircle2 } from 'lucide-react';
import { TAJWID_RULES, TajwidRule } from '../../data/tajwidData';
import { useQuranGame } from '../../context/QuranGameContext';
import { sounds } from '../../utils/soundEffects';
import { LetterAudioModal } from './LetterAudioModal';
import {
  playPronunciation,
  stopPronunciation,
  getLetterPhoneticInfo,
  getSingleLetterAudioUrl,
  LETTER_COMPARISON_GROUPS,
  LetterComparisonGroup,
  QARI_PROFILES,
  QariId,
  setActiveQari,
  getActiveQari,
  getAyahAudioUrl
} from '../../utils/tajwidAudio';

interface BelajarTajwidViewProps {
  onGoToQuiz?: () => void;
}

export const BelajarTajwidView: React.FC<BelajarTajwidViewProps> = ({ onGoToQuiz }) => {
  const { fontSize, mode } = useQuranGame();
  const [activeTab, setActiveTab] = useState<'rules' | 'comparison'>('rules');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(TAJWID_RULES[0].id);
  const [selectedLetterForAudio, setSelectedLetterForAudio] = useState<string | null>(null);
  const [audioSpeed, setAudioSpeed] = useState<number>(0.75);
  const [selectedQari, setSelectedQari] = useState<QariId>(getActiveQari());
  const [playingKey, setPlayingKey] = useState<string | null>(null);

  const handlePlayAudio = (urlOrLetter: string, key: string, speedOverride?: number) => {
    sounds.playWordClick();
    setPlayingKey(key);
    playPronunciation(urlOrLetter, speedOverride || audioSpeed, () => setPlayingKey(null));
  };

  const categories = [
    { id: 'all', label: 'Semua Hukum' },
    { id: 'alif-lam', label: 'Alif Lam (ال)' },
    { id: 'nun-mati', label: 'Nun Sukun & Tanwin' },
    { id: 'qalqalah', label: 'Qalqalah (Pantulan)' },
    { id: 'ghunnah', label: 'Ghunnah Musyaddadah' },
    { id: 'mim-mati', label: 'Mim Sukun' },
    { id: 'mad', label: 'Hukum Mad' }
  ];

  const filteredRules = useMemo(() => {
    return TAJWID_RULES.filter((rule) => {
      const matchCategory = activeCategory === 'all' || rule.category === activeCategory;
      const matchSearch =
        rule.nameLatin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.nameArabic.includes(searchQuery) ||
        rule.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.letters.some((l) => l.includes(searchQuery));
      return matchCategory && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  const toggleExpand = (id: string) => {
    sounds.playWordClick();
    setExpandedRuleId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-[#246579] text-white rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#A7CDD3] uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-[#D3A253]" />
            <span>Madrasah Tajwid & Talaqqi Raudhah</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Belajar Tajwid & Makhraj Huruf Bersuara
          </h2>
          <p className="text-xs sm:text-sm text-[#CBD5E1] max-w-2xl leading-relaxed">
            Dengarkan pelafalan setiap huruf hijaiyah, sifat dengung (*ghunnah*), dan contoh ayat Al-Qur'an dengan pengatur kecepatan tempo talaqqi (0.5x, 0.75x, 1.0x).
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {onGoToQuiz && (
              <button
                onClick={onGoToQuiz}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#D3A253] hover:bg-[#E3B973] text-[#173B4E] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>Uji Kemampuan di Kuis Tajwid</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary Tab Switcher */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#F1EDE6] dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => {
            sounds.playWordClick();
            setActiveTab('rules');
          }}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'rules'
              ? 'bg-[#246579] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-[#246579]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Kaidah Tajwid Lengkap</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playWordClick();
            setActiveTab('comparison');
          }}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'comparison'
              ? 'bg-[#246579] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-[#246579]'
          }`}
        >
          <Volume2 className="w-4 h-4 text-[#D3A253]" />
          <span>Bandingkan Huruf Mirip (Kho, Ha, Ho)</span>
        </button>
      </div>

      {/* Authentic Human Reciter & Sanad Certification Guarantee Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#EAF2F3] to-[#F1EDE6] dark:from-[#162725] dark:to-[#1B322F] border border-[#477F8D]/40 text-xs shadow-xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 bg-[#246579] text-white rounded-xl shrink-0 shadow-2xs">
            <CheckCircle2 className="w-5 h-5 text-[#D3A253]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-sm text-[#173B4E] dark:text-white">
                100% Suara Asli Manusia (Qari Bersanad)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#D3A253]/30 text-[#866421] dark:text-[#D3A253] text-[10px] font-bold border border-[#BE9452]/40">
                Bebas AI / TTS
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5 leading-relaxed">
              Seluruh pelafalan huruf, makhraj, dan contoh ayat direkam langsung oleh <strong>{QARI_PROFILES[selectedQari].name}</strong> ({QARI_PROFILES[selectedQari].sanad}).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <span className="text-[11px] font-semibold text-[#246579] dark:text-[#A7CDD3] whitespace-nowrap">
            Pilih Qari:
          </span>
          <select
            value={selectedQari}
            onChange={(e) => {
              const q = e.target.value as QariId;
              setSelectedQari(q);
              setActiveQari(q);
              sounds.playWordClick();
            }}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs font-bold text-[#173B4E] dark:text-[#D3A253] cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#246579]"
          >
            <option value="alafasy">Syaikh Mishary Rashid Al-Afasy</option>
            <option value="husary">Syaikh Mahmoud Khalil Al-Hushari (Mu'allim)</option>
          </select>
        </div>
      </div>

      {/* Global Audio Talaqqi Speed Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs shadow-2xs">
        <div className="flex items-center gap-2 text-[#246579] dark:text-[#A7CDD3] font-semibold">
          <Sliders className="w-4 h-4 text-[#D3A253]" />
          <span>Kecepatan Audio Talaqqi (Dengar Bunyi):</span>
          <span className="text-slate-400 font-normal hidden sm:inline">(Diterapkan pada seluruh tombol suara huruf & contoh ayat)</span>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {[
            { val: 0.5, label: '0.5x (Sangat Pelan)' },
            { val: 0.75, label: '0.75x (Talaqqi)' },
            { val: 1.0, label: '1.0x (Normal)' },
            { val: 1.25, label: '1.25x (Lancar)' }
          ].map((s) => (
            <button
              key={s.val}
              type="button"
              onClick={() => {
                sounds.playWordClick();
                setAudioSpeed(s.val);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                audioSpeed === s.val
                  ? 'bg-[#246579] text-white shadow-xs'
                  : 'bg-[#F1EDE6] dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: KAIDAH TAJWID */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          {/* Search & Category Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari materi tajwid (misal: Qalqalah, Ikhfa, Alif Lam, Ghunnah)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-[#293640] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#246579]/40 shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {categories.map((cat) => {
                const isSelected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      sounds.playWordClick();
                      setActiveCategory(cat.id);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#246579] text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-[#477F8D]'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rules Accordion List */}
          <div className="space-y-3.5">
            {filteredRules.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">
                  Tidak ditemukan materi tajwid dengan kata kunci "{searchQuery}".
                </p>
              </div>
            ) : (
              filteredRules.map((rule) => {
                const isExpanded = expandedRuleId === rule.id;

                return (
                  <div
                    key={rule.id}
                    className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs transition-all hover:border-[#477F8D]/50"
                  >
                    {/* Accordion Header */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleExpand(rule.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleExpand(rule.id);
                        }
                      }}
                      className="p-5 sm:p-6 cursor-pointer flex items-center justify-between gap-4 select-none"
                    >
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: '#246579' }}
                        >
                          {rule.category === 'alif-lam' ? 'ال' : rule.category === 'qalqalah' ? 'ق' : 'ت'}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#477F8D]">
                              {rule.categoryTitle}
                            </span>
                            {rule.harakatCount && (
                              <span className="text-[10px] font-semibold text-[#866421] dark:text-[#D3A253] bg-[#D3A253]/20 px-2 py-0.5 rounded-md">
                                {rule.harakatCount}
                              </span>
                            )}
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-[#173B4E] dark:text-white mt-0.5">
                            {rule.nameLatin}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {rule.meaning}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="hidden sm:inline font-arabic text-2xl text-[#173B4E] dark:text-[#D3A253] dir-rtl">
                          {rule.nameArabic}
                        </span>
                        <div className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Accordion Expanded Body */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          key={`rule_body_${rule.id}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="border-t border-slate-100 dark:border-slate-700/60 p-5 sm:p-6 space-y-5 bg-[#F8F6F1]/60 dark:bg-slate-900/30"
                        >
                          {/* Letters Section with Direct Play Audio */}
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-[#246579] dark:text-[#94A3B8]">
                              <span className="font-semibold">
                                Huruf-Huruf ({rule.letters.length} Huruf) · <span className="text-[#B87845] font-bold">Klik untuk dengarkan suara satuan:</span>
                              </span>
                              <span className="text-[10px] text-slate-400">
                                (Suara satuan per huruf · Klik 2× untuk info makhraj lengkap)
                              </span>
                            </div>

                            <div
                              dir="rtl"
                              className="flex flex-wrap items-center gap-2.5 p-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700"
                            >
                              {rule.letters.map((letter, i) => {
                                const isThisPlaying = playingKey === `letter_${rule.id}_${letter}`;
                                const info = getLetterPhoneticInfo(letter);
                                const singleAudio = getSingleLetterAudioUrl(letter);

                                return (
                                  <motion.button
                                    key={`rule_letter_${rule.id}_${i}`}
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="button"
                                    onClick={() => handlePlayAudio(singleAudio, `letter_${rule.id}_${letter}`)}
                                    onDoubleClick={() => setSelectedLetterForAudio(letter)}
                                    className={`group relative w-11 h-11 rounded-xl flex flex-col items-center justify-center border shadow-2xs transition-all cursor-pointer ${
                                      isThisPlaying
                                        ? 'bg-[#D3A253] border-[#BE9452] ring-2 ring-[#D3A253]/50'
                                        : 'bg-[#F1EDE6] dark:bg-slate-700 hover:bg-[#D3A253]/20 border-[#477F8D]/30 hover:border-[#D3A253]'
                                    }`}
                                    title={`Klik untuk dengarkan suara satuan huruf "${letter}" (${info.nameLatin}). Klik dua kali untuk makhraj lengkap.`}
                                  >
                                    <span className="font-arabic text-xl font-bold text-[#173B4E] dark:text-[#D3A253]">
                                      {letter}
                                    </span>
                                    <Volume2 className="w-2.5 h-2.5 text-[#477F8D] group-hover:text-[#D3A253] opacity-60 group-hover:opacity-100" />
                                  </motion.button>
                                );
                              })}
                            </div>

                            {rule.mnemonic && (
                              <p className="text-[11px] font-medium text-[#246579] dark:text-[#A7CDD3] italic bg-[#EAF2F3] dark:bg-[#193E4B]/50 p-2.5 rounded-xl border border-[#477F8D]/30">
                                💡 {rule.mnemonic}
                              </p>
                            )}
                          </div>

                          {/* Explanation & Reading Method */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#477F8D] block">
                                Penjelasan Lengkap
                              </span>
                              <p className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                                {rule.description}
                              </p>
                            </div>

                            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#477F8D] block">
                                Cara Melafalkan (Kaifiyah)
                              </span>
                              <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                                {rule.readingMethod}
                              </p>
                            </div>
                          </div>

                          {/* Examples in Quran with Audio Player */}
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#293640] dark:text-white flex items-center gap-1.5">
                                <Volume2 className="w-4 h-4 text-[#B87845]" />
                                <span>Contoh Ayat Al-Qur'an (Suara {QARI_PROFILES[selectedQari].name}):</span>
                              </span>
                              <span className="text-[11px] text-[#246579] dark:text-[#94A3B8]">
                                Kecepatan: <span className="font-bold text-[#173B4E] dark:text-[#D3A253]">{audioSpeed}x</span>
                              </span>
                            </div>

                            <div className="space-y-2.5">
                              {rule.examples.map((ex, idx) => {
                                const isThisPlaying = playingKey === `ex_${rule.id}_${idx}`;
                                const exampleAudio = selectedQari === 'husary'
                                  ? getAyahAudioUrl(ex.surahNumber, ex.ayahNumber, 'husary')
                                  : ex.audioUrl;

                                return (
                                  <div
                                    key={`rule_ex_${rule.id}_${idx}`}
                                    className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-[#477F8D]/60 transition-colors"
                                  >
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-white bg-[#246579] px-2 py-0.5 rounded-md">
                                          QS. {ex.surahName} ({ex.surahAyah})
                                        </span>
                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                          {ex.phraseLatin}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-[#246579] dark:text-[#CBD5E1]">
                                        {ex.explanation}
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                                      <p
                                        dir="rtl"
                                        className="font-arabic text-2xl font-bold text-[#173B4E] dark:text-[#D3A253]"
                                      >
                                        {ex.phraseArabic}
                                      </p>

                                      <button
                                        type="button"
                                        onClick={() => handlePlayAudio(exampleAudio, `ex_${rule.id}_${idx}`)}
                                        className={`p-2.5 px-3 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                                          isThisPlaying
                                            ? 'bg-[#D3A253] text-[#173B4E] border-[#BE9452] shadow-sm'
                                            : 'bg-[#F1EDE6] dark:bg-slate-700 text-[#246579] dark:text-[#E2E8F0] border-slate-200 dark:border-slate-600 hover:bg-[#E8E1D6]'
                                        }`}
                                        title={`Dengarkan contoh ayat ini pada tempo ${audioSpeed}x`}
                                      >
                                        <Volume2 className="w-4 h-4" />
                                        <span>{isThisPlaying ? 'Memutar...' : 'Dengar'}</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: KOMPARASI HURUF MIRIP (KHO, HA, HO, SHAD, SIN, TSA, DSB.) */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-[#EAF2F3] dark:bg-[#1A332E] border border-[#477F8D]/40 text-xs text-[#293640] dark:text-[#E2E8F0] space-y-1">
            <div className="flex items-center gap-2 font-bold text-[#246579] dark:text-[#A7CDD3]">
              <Sparkles className="w-4 h-4 text-[#D3A253]" />
              <span>Mengapa Komparasi Ini Sangat Penting?</span>
            </div>
            <p className="leading-relaxed">
              Huruf-huruf seperti <strong>Kho (خ)</strong>, <strong>Ha pedas (ح)</strong>, dan <strong>Ha dada (هـ)</strong>, atau <strong>Shad (ص)</strong> dan <strong>Sin (س)</strong> memiliki perbedaan makhraj dan sifat yang sangat halus. Dengarkan rangkaian harakat dan contoh katanya secara bergantian untuk melatih kepekaan telinga dan lisan Anda!
            </p>
          </div>

          <div className="space-y-5">
            {LETTER_COMPARISON_GROUPS.map((group) => (
              <div
                key={group.id}
                className="p-5 sm:p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4 hover:border-[#477F8D]/60 transition-all"
              >
                {/* Group Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#B87845] bg-[#B87845]/10 px-2.5 py-0.5 rounded-full">
                      {group.badge}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-[#173B4E] dark:text-white mt-1">
                      {group.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {group.description}
                    </p>
                  </div>
                </div>

                {/* Letters Side-by-Side Comparison Grid */}
                <div className={`grid grid-cols-1 ${group.letters.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-3.5`}>
                  {group.letters.map((item, idx) => {
                    const isPlayingSeries = playingKey === `series_${group.id}_${item.char}`;
                    const isPlayingWord = playingKey === `word_${group.id}_${item.char}`;

                    return (
                      <div
                        key={`comp_item_${group.id}_${item.char}_${idx}`}
                        className="p-4 rounded-2xl bg-[#F8F6F1] dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3 relative hover:shadow-xs transition-shadow"
                      >
                        {/* Letter Header Display */}
                        <div className="text-center pt-1">
                          <p className="font-arabic text-5xl font-bold text-[#173B4E] dark:text-[#D3A253] my-1">
                            {item.char}
                          </p>
                          <h4 className="font-bold text-sm text-[#293640] dark:text-white">
                            {item.nameLatin}
                          </h4>
                          <span className="text-[11px] font-semibold text-[#246579] dark:text-[#A7CDD3] block">
                            {item.transliteration}
                          </span>
                        </div>

                        {/* Makhraj & Characteristics */}
                        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                          <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#477F8D] block">
                              Makhraj:
                            </span>
                            <span className="text-[11px] font-medium leading-tight block">
                              {item.makhraj}
                            </span>
                          </div>

                          <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#477F8D] block">
                              Ciri Khas Bunyi:
                            </span>
                            <span className="text-[11px] font-medium leading-tight block text-[#B87845]">
                              {item.soundFeature}
                            </span>
                          </div>
                        </div>

                        {/* Audio Actions */}
                        <div className="space-y-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                          {(() => {
                            const itemAudio = selectedQari === 'husary' ? item.audioUrlHusary : item.audioUrlAlafasy;
                            const singleAudio = getSingleLetterAudioUrl(item.char);
                            const isPlayingSingle = playingKey === `single_${group.id}_${item.char}`;

                            return (
                              <>
                                {/* Play Single Letter Isolated Sound */}
                                <button
                                  type="button"
                                  onClick={() => handlePlayAudio(singleAudio, `single_${group.id}_${item.char}`)}
                                  className={`w-full py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                    isPlayingSingle
                                      ? 'bg-[#D3A253] text-[#173B4E] ring-2 ring-[#D3A253]/50'
                                      : 'bg-[#EAF2F3] dark:bg-[#193E4B] text-[#173B4E] dark:text-[#A7CDD3] hover:bg-[#D5E5DC] border border-[#477F8D]/40'
                                  }`}
                                  title={`Dengarkan suara satuan huruf ${item.char} (${item.nameLatin})`}
                                >
                                  <Volume2 className="w-3.5 h-3.5 text-[#2D8192]" />
                                  <span>{isPlayingSingle ? 'Memutar Suara Satuan...' : `Dengar Satuan Huruf (${item.nameLatin})`}</span>
                                </button>

                                {/* Play Authentic Verse Recitation */}
                                <button
                                  type="button"
                                  onClick={() => handlePlayAudio(itemAudio, `series_${group.id}_${item.char}`)}
                                  className={`w-full py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                    isPlayingSeries
                                      ? 'bg-[#D3A253] text-[#173B4E] shadow-xs'
                                      : 'bg-[#246579] text-white hover:bg-[#174C60]'
                                  }`}
                                  title={`Dengarkan contoh ayat (${item.surahName}) berhuruf ${item.char} oleh ${QARI_PROFILES[selectedQari].name}`}
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span>{isPlayingSeries ? 'Memutar Ayat...' : `Dengar Ayat (${item.surahName})`}</span>
                                </button>

                                {/* Play Example Word */}
                                <button
                                  type="button"
                                  onClick={() => handlePlayAudio(itemAudio, `word_${group.id}_${item.char}`)}
                                  className={`w-full py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all cursor-pointer ${
                                    isPlayingWord
                                      ? 'bg-[#D3A253]/20 border-[#D3A253] text-[#173B4E] dark:text-[#D3A253]'
                                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="text-left">
                                    <span className="text-[9px] text-slate-400 block">Fokus Huruf:</span>
                                    <span className="font-arabic font-bold text-sm text-[#173B4E] dark:text-[#D3A253]">
                                      {item.targetWord || item.exampleText}
                                    </span>
                                  </div>
                                  <span className="text-[11px] font-medium text-slate-500">
                                    {item.exampleLatin}
                                  </span>
                                </button>
                              </>
                            );
                          })()}

                          {/* Deep Inspector Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedLetterForAudio(item.char)}
                            className="w-full text-center text-[10px] text-[#246579] dark:text-[#A7CDD3] hover:underline font-semibold cursor-pointer pt-0.5"
                          >
                            Buka Detail Makhraj & Sifat →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Differentiation Tips Banner */}
                <div className="p-3 bg-[#F1EDE6] dark:bg-slate-700/50 rounded-2xl border border-[#BE9452]/30 text-xs text-[#293640] dark:text-slate-200 flex items-start gap-2">
                  <span className="font-bold text-[#B87845] shrink-0">💡 Tips Pembeda:</span>
                  <span className="leading-relaxed">{group.differentiationTips}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Letter Makhraj & Audio Inspector Modal */}
      <LetterAudioModal
        letter={selectedLetterForAudio}
        onClose={() => setSelectedLetterForAudio(null)}
      />
    </div>
  );
};
