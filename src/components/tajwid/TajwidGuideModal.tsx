import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Sparkles, CheckCircle2, ChevronRight, Volume2, Sliders } from 'lucide-react';
import { TAJWID_RULES, TajwidRule } from '../../data/tajwidData';
import { sounds } from '../../utils/soundEffects';
import { LetterAudioModal } from './LetterAudioModal';
import { playPronunciation, getLetterPhoneticInfo, getSingleLetterAudioUrl } from '../../utils/tajwidAudio';

interface TajwidGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRuleId?: string;
  initialCategory?: string;
}

export const TajwidGuideModal: React.FC<TajwidGuideModalProps> = ({
  isOpen,
  onClose,
  initialRuleId,
  initialCategory
}) => {
  const [selectedRuleId, setSelectedRuleId] = useState<string>(
    initialRuleId || TAJWID_RULES[0].id
  );
  const [audioSpeed, setAudioSpeed] = useState<number>(0.75);
  const [selectedLetterForAudio, setSelectedLetterForAudio] = useState<string | null>(null);
  const [playingExampleKey, setPlayingExampleKey] = useState<string | null>(null);
  const [playingLetterKey, setPlayingLetterKey] = useState<string | null>(null);

  useEffect(() => {
    if (initialRuleId) {
      setSelectedRuleId(initialRuleId);
    } else if (initialCategory) {
      const match = TAJWID_RULES.find((r) => r.category === initialCategory);
      if (match) setSelectedRuleId(match.id);
    }
  }, [initialRuleId, initialCategory]);

  const currentRule: TajwidRule =
    TAJWID_RULES.find((r) => r.id === selectedRuleId) || TAJWID_RULES[0];

  const handleSelectRule = (id: string) => {
    sounds.playWordClick();
    setSelectedRuleId(id);
  };

  const handlePlayLetterDirect = (letter: string) => {
    sounds.playWordClick();
    setPlayingLetterKey(letter);
    const singleAudio = getSingleLetterAudioUrl(letter);
    playPronunciation(singleAudio, audioSpeed, () => setPlayingLetterKey(null));
  };

  const handlePlayExample = (audioUrlOrText: string, key: string) => {
    sounds.playWordClick();
    setPlayingExampleKey(key);
    playPronunciation(audioUrlOrText, audioSpeed, () => setPlayingExampleKey(null));
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div key="tajwid_guide_backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              key={`tajwid_guide_modal_${currentRule.id}`}
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl max-h-[88vh] bg-[#FDFBF7] dark:bg-[#1E293B] border border-[#84A98C]/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#2F3E46] dark:text-[#E2E8F0]"
            >
              {/* Top Bar Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 bg-white/70 dark:bg-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#52796F]/10 dark:bg-[#52796F]/30 text-[#52796F] dark:text-[#84A98C]">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-[#1D3557] dark:text-white">
                  Panduan Belajar Tajwid Al-Qur'an
                </h3>
                <p className="text-[11px] text-[#52796F] dark:text-[#94A3B8]">
                  Pahami kaidah hukum bacaan agar tartil dan mutqin
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Category / Rule Selector Pills */}
          <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 overflow-x-auto flex items-center gap-2 bg-[#F4EFEA]/60 dark:bg-slate-900/40 scrollbar-thin">
            {TAJWID_RULES.map((rule) => {
              const isSelected = rule.id === currentRule.id;
              return (
                <button
                  key={rule.id}
                  onClick={() => handleSelectRule(rule.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#52796F] text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>{rule.nameLatin}</span>
                </button>
              );
            })}
          </div>

          {/* Speed Selector Toolbar */}
          <div className="px-4 py-2 bg-[#EAF2ED]/60 dark:bg-slate-800/50 border-b border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold text-[#52796F] dark:text-[#A8D5BA] flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-[#E9C46A]" />
              <span>Kecepatan Audio Talaqqi:</span>
            </span>

            <div className="flex items-center gap-1">
              {[0.5, 0.75, 1.0].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    sounds.playWordClick();
                    setAudioSpeed(s);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    audioSpeed === s
                      ? 'bg-[#52796F] text-white shadow-2xs'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                  }`}
                >
                  {s}x {s === 0.5 ? 'Sangat Pelan' : s === 0.75 ? 'Pelan' : 'Normal'}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Rule Hero Title Card */}
            <div className="bg-gradient-to-br from-[#F4EFEA] to-[#EAE3D9] dark:from-[#112428] dark:to-[#162C30] p-5 rounded-2xl border border-[#C5A059]/30 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#52796F] dark:text-[#84A98C]">
                  {currentRule.categoryTitle}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E9C46A]/20 text-[#8C6D23] dark:text-[#E9C46A] border border-[#E9C46A]/40">
                  {currentRule.harakatCount}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-[#1D3557] dark:text-white">
                    {currentRule.nameLatin}
                  </h4>
                  <p className="text-xs text-[#52796F] dark:text-[#CBD5E1] mt-0.5">
                    {currentRule.meaning}
                  </p>
                </div>

                <p className="font-arabic text-2xl sm:text-3xl text-[#1D3557] dark:text-[#E9C46A] dir-rtl text-right sm:text-left">
                  {currentRule.nameArabic}
                </p>
              </div>
            </div>

            {/* Letters Grid with Direct Audio Playback */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#52796F] dark:text-[#94A3B8]">
                <span className="font-semibold">
                  Huruf-Huruf ({currentRule.letters.length} Huruf) · <span className="text-[#E76F51] font-bold">Klik untuk dengarkan suara:</span>
                </span>
              </div>

              <div
                dir="rtl"
                className="flex flex-wrap items-center gap-2 p-3 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700"
              >
                {currentRule.letters.map((letter, idx) => {
                  const isThisPlaying = playingLetterKey === letter;

                  return (
                    <motion.button
                      key={`guide_letter_${currentRule.id}_${idx}`}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => handlePlayLetterDirect(letter)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setSelectedLetterForAudio(letter);
                      }}
                      className={`group relative w-11 h-11 rounded-xl flex flex-col items-center justify-center border transition-all cursor-pointer shadow-2xs ${
                        isThisPlaying
                          ? 'bg-[#E9C46A] border-[#C5A059] ring-2 ring-[#E9C46A]/40'
                          : 'bg-[#F4EFEA] dark:bg-slate-700 border-[#84A98C]/30 hover:border-[#E9C46A]'
                      }`}
                      title={`Klik untuk dengarkan suara huruf ${letter}. Klik kanan atau buka makhraj lengkap.`}
                    >
                      <span className="font-arabic text-xl font-bold text-[#1D3557] dark:text-[#E9C46A]">
                        {letter}
                      </span>
                      <Volume2 className="w-2.5 h-2.5 text-[#84A98C] group-hover:text-[#E9C46A] opacity-60 group-hover:opacity-100" />
                    </motion.button>
                  );
                })}
              </div>

              {currentRule.mnemonic && (
                <p className="text-[11px] font-medium text-[#52796F] dark:text-[#A8D5BA] italic bg-[#EAF2ED] dark:bg-[#1E3A34]/40 p-2.5 rounded-xl border border-[#84A98C]/30">
                  💡 {currentRule.mnemonic}
                </p>
              )}
            </div>

            {/* Description & Cara Membaca */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#84A98C] block">
                  Penjelasan Kaidah
                </span>
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {currentRule.description}
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#84A98C] block">
                  Cara Membaca yang Benar
                </span>
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                  {currentRule.readingMethod}
                </p>
              </div>
            </div>

            {/* Examples in Quran with Audio Player */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2F3E46] dark:text-white">
                  Contoh Bacaan dalam Al-Qur'an (Bisa Didengarkan):
                </span>
                <span className="text-[10px] text-slate-400">
                  Kecepatan: {audioSpeed}x
                </span>
              </div>

              <div className="space-y-2.5">
                {currentRule.examples.map((ex, idx) => {
                  const isThisPlaying = playingExampleKey === `${currentRule.id}_${idx}`;

                  return (
                    <div
                      key={`guide_ex_${currentRule.id}_${idx}`}
                      className="p-3.5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-[#84A98C]/60 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-white bg-[#52796F] px-2 py-0.5 rounded-md">
                            QS. {ex.surahName} ({ex.surahAyah})
                          </span>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {ex.phraseLatin}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#52796F] dark:text-[#CBD5E1]">
                          {ex.explanation}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                        <p
                          dir="rtl"
                          className="font-arabic text-xl sm:text-2xl font-bold text-[#1D3557] dark:text-[#E9C46A]"
                        >
                          {ex.phraseArabic}
                        </p>

                        <button
                          type="button"
                          onClick={() => handlePlayExample(ex.audioUrl, `${currentRule.id}_${idx}`)}
                          className={`p-2 px-3 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                            isThisPlaying
                              ? 'bg-[#E9C46A] text-[#1D3557] border-[#C5A059] shadow-sm'
                              : 'bg-[#F4EFEA] dark:bg-slate-700 text-[#52796F] dark:text-[#E2E8F0] border-slate-200 dark:border-slate-600 hover:bg-[#EAE3D9]'
                          }`}
                          title={`Dengarkan contoh ayat ini pada kecepatan ${audioSpeed}x`}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{isThisPlaying ? 'Memutar...' : 'Dengar'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-[#52796F] dark:text-[#94A3B8]">
              Gunakan panduan ini saat mengerjakan kuis tajwid.
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#52796F] hover:bg-[#354F52] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Saya Paham, Kembali ke Kuis
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>

      {/* Letter Makhraj & Audio Inspector Modal */}
      <LetterAudioModal
        letter={selectedLetterForAudio}
        onClose={() => setSelectedLetterForAudio(null)}
      />
    </>
  );
};

