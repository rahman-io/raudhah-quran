import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Volume2, Sparkles, Sliders, CheckCircle2, ExternalLink, ShieldCheck, BookOpen } from 'lucide-react';
import {
  LetterPhoneticInfo,
  getLetterPhoneticInfo,
  getSingleLetterAudioUrl,
  playHumanQariAudio,
  stopPronunciation,
  QARI_PROFILES,
  QariId,
  getActiveQari,
  setActiveQari
} from '../../utils/tajwidAudio';
import { sounds } from '../../utils/soundEffects';
import { assetUrl } from '../../utils/assetUrl';

interface LetterAudioModalProps {
  letter: string | null;
  onClose: () => void;
}

export const LetterAudioModal: React.FC<LetterAudioModalProps> = ({ letter, onClose }) => {
  const [speed, setSpeed] = useState<number>(0.75); // Talaqqi speed
  const [selectedQari, setSelectedQari] = useState<QariId>(getActiveQari());
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playingItemLabel, setPlayingItemLabel] = useState<string | null>(null);

  const letterInfo: LetterPhoneticInfo = letter
    ? getLetterPhoneticInfo(letter)
    : {
        letter: '',
        nameLatin: '',
        transliteration: '',
        makhraj: '',
        sifat: '',
        tips: '',
        singleLetterAudioUrl: '/audio/letters/alif.mp3',
        surahNumber: 1,
        ayahNumber: 1,
        surahName: 'Al-Fatihah',
        targetWordArabic: '',
        exampleVerseArabic: '',
        exampleVerseLatin: '',
        audioUrlAlafasy: 'https://everyayah.com/data/Alafasy_128kbps/001001.mp3',
        audioUrlHusary: 'https://everyayah.com/data/Husary_Muallim_128kbps/001001.mp3',
        qariSanad: 'Sanad Riwayat Hafsh \'an \'Ashim'
      };

  const currentAudioUrl = selectedQari === 'husary' ? letterInfo.audioUrlHusary : letterInfo.audioUrlAlafasy;
  const singleLetterUrl = getSingleLetterAudioUrl(letterInfo.letter);

  const handlePlaySingleLetter = () => {
    sounds.playWordClick();
    setIsPlaying(true);
    setPlayingItemLabel(`Suara Satuan: ${letterInfo.nameLatin}`);
    playHumanQariAudio(singleLetterUrl, speed, () => {
      setIsPlaying(false);
      setPlayingItemLabel(null);
    });
  };

  const handlePlayAyahProof = () => {
    sounds.playWordClick();
    setIsPlaying(true);
    setPlayingItemLabel(`Ayat Pembuktian Huruf (QS. ${letterInfo.surahName})`);
    playHumanQariAudio(currentAudioUrl, speed, () => {
      setIsPlaying(false);
      setPlayingItemLabel(null);
    });
  };

  return (
    <AnimatePresence>
      {letter && (
        <div key="letter_audio_overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            key={`letter_audio_dialog_${letter}`}
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg bg-[#F8F6F1] dark:bg-[#1E293B] border border-[#477F8D]/40 rounded-3xl p-6 shadow-2xl text-[#293640] dark:text-[#E2E8F0] space-y-4 max-h-[92vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#246579]/10 dark:bg-[#246579]/30 text-[#246579] dark:text-[#477F8D]">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#173B4E] dark:text-white flex items-center gap-1.5">
                    <span>Makhraj & Suara Qari Asli</span>
                    <span className="text-[10px] font-bold bg-[#D3A253]/20 text-[#866421] dark:text-[#D3A253] px-2 py-0.5 rounded-full">
                      Bebas AI
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#246579] dark:text-[#94A3B8]">
                    Dengarkan pelafalan otentik manusia dengan pengatur tempo talaqqi
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  stopPronunciation();
                  onClose();
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Letter Presentation Display */}
            <div className="bg-gradient-to-b from-[#F1EDE6] to-[#E8E1D6] dark:from-[#102731] dark:to-[#152E38] rounded-2xl p-5 text-center border border-[#BE9452]/40 shadow-inner relative overflow-hidden">
              {/* Visual Wave animation when playing */}
              {isPlaying && (
                <div className="absolute inset-x-0 bottom-1 flex justify-center items-center gap-1 opacity-70">
                  {[...Array(7)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ scaleY: [0.3, 1.6, 0.3] }}
                      transition={{ repeat: Infinity, duration: 0.5 + i * 0.1, ease: 'easeInOut' }}
                      className="w-1.5 h-6 bg-[#246579] dark:bg-[#D3A253] rounded-full"
                    />
                  ))}
                </div>
              )}

              <p className="font-arabic text-6xl text-[#173B4E] dark:text-[#D3A253] my-1 font-bold">
                {letterInfo.letter}
              </p>

              <h4 className="text-base font-bold text-[#293640] dark:text-white mt-1">
                {letterInfo.nameLatin}
              </h4>
              <p className="text-xs text-[#246579] dark:text-[#A7CDD3] font-medium">
                {letterInfo.transliteration}
              </p>

              {playingItemLabel && (
                <p className="text-[11px] font-semibold text-[#B87845] mt-2 animate-pulse flex items-center justify-center gap-1">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Sedang Diputar: {playingItemLabel}</span>
                </p>
              )}
            </div>

            {/* Authentic Quranic Proof Verse Box */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#246579] dark:text-[#A7CDD3] flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#D3A253]" />
                  <span>Ayat Pembuktian Talaqqi:</span>
                </span>
                <span className="font-semibold text-[11px] bg-[#246579] text-white px-2 py-0.5 rounded-md">
                  QS. {letterInfo.surahName} ({letterInfo.surahNumber}:{letterInfo.ayahNumber})
                </span>
              </div>

              <p dir="rtl" className="font-arabic text-2xl font-bold text-[#173B4E] dark:text-[#D3A253] text-center my-2 leading-loose">
                {letterInfo.exampleVerseArabic}
              </p>

              <p className="text-center text-xs text-slate-600 dark:text-slate-300 italic">
                "{letterInfo.exampleVerseLatin}"
              </p>

              {letterInfo.targetWordArabic && (
                <div className="text-center pt-1 border-t border-slate-100 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400">
                  Fokus Makhraj Huruf {letterInfo.letter} pada kata:{' '}
                  <span className="font-arabic font-bold text-sm text-[#B87845]">
                    {letterInfo.targetWordArabic}
                  </span>
                </div>
              )}
            </div>

            {/* Qari Selection and Sanad Certificate */}
            <div className="p-3 bg-[#EAF2F3] dark:bg-[#152B28] rounded-2xl border border-[#477F8D]/30 text-xs space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-bold text-[#173B4E] dark:text-white">
                  <ShieldCheck className="w-4 h-4 text-[#2D8192]" />
                  <span>Qari Rekaman Asli:</span>
                </div>

                <div className="flex items-center gap-1">
                  {(['alafasy', 'husary'] as QariId[]).map((qId) => (
                    <button
                      key={qId}
                      type="button"
                      onClick={() => {
                        sounds.playWordClick();
                        setSelectedQari(qId);
                        setActiveQari(qId);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                        selectedQari === qId
                          ? 'bg-[#246579] text-white shadow-2xs'
                          : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      {qId === 'alafasy' ? 'Syaikh Al-Afasy' : 'Syaikh Al-Hushari'}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-tight">
                <strong>{QARI_PROFILES[selectedQari].name}</strong> — {QARI_PROFILES[selectedQari].sanad}.
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-1 border-t border-[#477F8D]/20 text-[10px] gap-1">
                <span className="text-slate-500">Tautan File MP3 Asli:</span>
                <div className="flex items-center gap-3">
                  <a
                    href={assetUrl(singleLetterUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#2D8192] hover:underline font-semibold"
                  >
                    <span>MP3 Satuan Huruf</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <a
                    href={currentAudioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#2D8192] hover:underline font-semibold"
                  >
                    <span>MP3 Ayat ({letterInfo.surahName})</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Speed Selector (0.5x, 0.75x, 1.0x, 1.25x) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#246579] dark:text-[#94A3B8] flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Kecepatan Audio Talaqqi:</span>
                </span>
                <span className="font-bold text-[#173B4E] dark:text-[#D3A253] tabular-nums">
                  {speed === 0.5 ? '0.5x (Sangat Pelan)' : speed === 0.75 ? '0.75x (Pelan)' : speed === 1.0 ? '1.0x (Normal)' : '1.25x (Lancar)'}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {[0.5, 0.75, 1.0, 1.25].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSpeed(s)}
                    className={`py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      speed === s
                        ? 'bg-[#246579] text-white border-[#174C60] shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {s}x {s === 0.5 ? 'Talaqqi' : s === 0.75 ? 'Pelan' : s === 1.0 ? 'Normal' : 'Lancar'}
                  </button>
                ))}
              </div>
            </div>

            {/* Play Trigger Buttons: Single Letter vs Full Ayah */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handlePlaySingleLetter}
                className={`py-3 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                  isPlaying && playingItemLabel?.startsWith('Suara Satuan')
                    ? 'bg-[#D3A253] text-[#173B4E] ring-2 ring-[#D3A253]/50'
                    : 'bg-[#2D8192] hover:bg-[#236E80] text-white'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>Dengar Satuan ("{letterInfo.nameLatin}")</span>
              </button>

              <button
                type="button"
                onClick={handlePlayAyahProof}
                className={`py-3 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                  isPlaying && !playingItemLabel?.startsWith('Suara Satuan')
                    ? 'bg-[#D3A253] text-[#173B4E] ring-2 ring-[#D3A253]/50'
                    : 'bg-[#246579] hover:bg-[#174C60] text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Dengar Contoh Ayat Talaqqi</span>
              </button>
            </div>

            {/* Makhraj & Sifat Details */}
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#477F8D] block mb-0.5">
                  Makhraj (Tempat Keluarnya Suara)
                </span>
                <p className="font-semibold text-[#173B4E] dark:text-white leading-relaxed">
                  {letterInfo.makhraj}
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#477F8D] block mb-0.5">
                  Sifat Khusus Huruf
                </span>
                <p className="font-medium text-slate-700 dark:text-slate-200">
                  {letterInfo.sifat}
                </p>
              </div>

              <div className="p-3 bg-[#EAF2F3] dark:bg-[#193E4B]/50 rounded-xl border border-[#477F8D]/30 text-[#174C60] dark:text-[#CBD5E1]">
                <span className="font-bold block text-[11px] mb-0.5 text-[#293640] dark:text-white">
                  💡 Tips Pembeda Makhraj:
                </span>
                <p className="text-[11px] leading-relaxed">
                  {letterInfo.tips}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
