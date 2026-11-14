import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Info,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  ANATOMY_PROFILES,
  QUICK_PRESETS,
  type MakhrajAnatomyProfile,
  type AirflowType
} from '../../data/makhrajAnatomyData';
import { playPronunciation, getSingleLetterAudioUrl } from '../../utils/tajwidAudio';
import { sounds } from '../../utils/soundEffects';

export const Makhraj3DVisualizer: React.FC = () => {
  const [activeId, setActiveId] = useState<string>('د'); // Default to 'Da'
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [pulseKey, setPulseKey] = useState<number>(0);

  const profile: MakhrajAnatomyProfile = ANATOMY_PROFILES[activeId] || ANATOMY_PROFILES['د'];

  const handleSelectLetter = (id: string) => {
    sounds.playWordClick();
    setActiveId(id);
    setPulseKey((prev) => prev + 1);

    if (soundEnabled) {
      triggerAudio(id);
    }
  };

  const triggerAudio = (id: string) => {
    const prof = ANATOMY_PROFILES[id];
    if (!prof) return;

    setIsPlayingAudio(true);
    const audioKey = prof.letter.trim();
    const url = getSingleLetterAudioUrl(audioKey);

    playPronunciation(url || audioKey, 0.9, () => {
      setIsPlayingAudio(false);
    });
  };

  // Replay current audio
  const handleReplay = () => {
    sounds.playWordClick();
    setPulseKey((prev) => prev + 1);
    triggerAudio(activeId);
  };

  // Build SVG path for dynamic tongue
  // Base floor of mouth starts at (170, 220), curves through tip, blade, dorsum, and root down to (275, 250)
  const tonguePath = `
    M 175 220
    Q ${profile.tongueTip.x} ${profile.tongueTip.y + 15}, ${profile.tongueTip.x} ${profile.tongueTip.y}
    C ${profile.tongueBlade.x} ${profile.tongueBlade.y}, ${profile.tongueDorsum.x} ${profile.tongueDorsum.y}, ${profile.tongueRoot.x} ${profile.tongueRoot.y}
    L 280 250
    L 220 240
    Z
  `;

  // Dynamic Lip shapes
  const upperLipY = profile.lips === 'closed' ? 180 : profile.lips === 'rounded' ? 172 : 168;
  const lowerLipY = profile.lips === 'closed' ? 184 : profile.lips === 'labiodental' ? 174 : 196;
  const lipOpeningX = profile.lips === 'rounded' ? 130 : 142;

  // Velum (Soft Palate) position: raised = closes nasal cavity; lowered = opens nasal cavity
  const velumY = profile.velum === 'lowered' ? 135 : 118;

  // Epiglottis position
  const epiglottisX = profile.epiglottis === 'retracted' ? 282 : 272;

  return (
    <div className="space-y-6">
      {/* Top Banner Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#173B4E] to-[#246579] p-6 sm:p-8 text-white shadow-sm border border-[#246579]/40">
        <div className="absolute -right-10 -bottom-10 opacity-10 font-arabic text-[180px] pointer-events-none select-none">
          صوت
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#D3A253] text-[#173B4E] text-xs font-black uppercase tracking-wider shadow-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulator 3D Anatomi Suara</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold border border-white/30 backdrop-blur-xs">
              Visualisasi Posisi Lidah, Bibir & Aliran Nafas
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Simulator Makhraj Interaktif
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
            Tekan huruf atau vokal di bawah ini untuk melihat <strong>secara langsung di mana titik asal suara keluar</strong>, bagaimana pergerakan lidah/bibir, serta ke mana arah aliran udara berhembus.
          </p>

          {/* Quick Presets Bar (A, I, U, Da, Dza, Ja, Za) */}
          <div className="pt-2 space-y-2">
            <span className="text-[11px] font-bold text-[#D3A253] uppercase tracking-wider block">
              Pilihan Cepat (Vokal & Huruf Sering Tertukar):
            </span>
            <div className="flex flex-wrap gap-2">
              {QUICK_PRESETS.map((p) => {
                const isSelected = activeId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectLetter(p.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                      isSelected
                        ? 'bg-[#D3A253] text-[#173B4E] ring-2 ring-white scale-105 shadow-md'
                        : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
                    }`}
                  >
                    <span>{p.label}</span>
                    <span className="text-[10px] opacity-75 font-normal">({p.description})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage: Anatomy Visualizer + Live Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: The 3D Sagittal Cross-Section Stage */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          {/* Stage Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-sm font-bold text-[#173B4E] dark:text-white">
                Irisan Anatomi Rongga Mulut (Sagittal View)
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  soundEnabled
                    ? 'bg-[#246579]/15 text-[#246579] dark:text-[#A7CDD3]'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                }`}
                title={soundEnabled ? 'Suara Aktif' : 'Suara Dimatikan'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={handleReplay}
                className="px-3 py-1.5 rounded-xl bg-[#246579] hover:bg-[#1a4f5f] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-spin' : ''}`} />
                <span>Ulangi Suara</span>
              </button>
            </div>
          </div>

          {/* Canvas SVG Container */}
          <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-gradient-to-b from-[#F5F1EB] to-[#E9DFD3] dark:from-slate-900 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center select-none shadow-inner">
            <svg
              viewBox="0 0 420 320"
              className="w-full h-full max-h-[420px]"
              aria-label="Model Anatomi Rongga Mulut dan Titik Makhraj"
            >
              <defs>
                {/* Glow Filter for Target Spot */}
                <filter id="glow-target" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Gradients */}
                <linearGradient id="tongueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E26D75" />
                  <stop offset="60%" stopColor="#C94D58" />
                  <stop offset="100%" stopColor="#A83540" />
                </linearGradient>

                <linearGradient id="palateGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F5D3A9" />
                  <stop offset="60%" stopColor="#D9AA75" />
                  <stop offset="100%" stopColor="#B6804A" />
                </linearGradient>

                <linearGradient id="nasalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#BEE3F8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#63B3ED" stopOpacity="0.1" />
                </linearGradient>
              </defs>

              {/* 1. Head & Profile Background Silhouette */}
              <path
                d="M 120 40 C 180 20, 290 20, 340 70 C 370 100, 380 180, 360 260 L 320 310 L 250 310 C 260 270, 250 240, 240 220"
                fill="none"
                stroke="#D3C1AD"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                className="opacity-40"
              />

              {/* Nasal Cavity (Al-Khaisyum) Backing */}
              <path
                d="M 175 60 C 220 50, 260 65, 280 110 C 260 115, 230 110, 185 105 Z"
                fill="url(#nasalGrad)"
                stroke="#90CDF4"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <text x="210" y="85" fontSize="10" fill="#2B6CB0" fontWeight="bold" textAnchor="middle" className="dark:fill-sky-300">
                Al-Khaisyum (Rongga Hidung)
              </text>

              {/* 2. Hard Palate & Upper Jaw Bone */}
              <path
                d="M 152 145 C 160 120, 205 108, 255 116 L 255 125 C 210 118, 170 128, 160 148 Z"
                fill="url(#palateGrad)"
                stroke="#8C5E30"
                strokeWidth="1.5"
              />

              {/* Upper Incisor Teeth */}
              <rect x="150" y="146" width="10" height="15" rx="3" fill="#FFFFFF" stroke="#8C5E30" strokeWidth="1.5" />
              <text x="135" y="142" fontSize="9" fill="#718096" fontWeight="bold">Gigi Atas</text>

              {/* 3. Soft Palate (Velum & Uvula) - Dynamic Movement */}
              <path
                d={`M 255 120 Q 275 ${velumY - 5}, 275 ${velumY} Q 268 ${velumY + 12}, 255 125 Z`}
                fill="#D98282"
                stroke="#A84C4C"
                strokeWidth="1.5"
                className="transition-all duration-300"
              />
              <text x="290" y={velumY} fontSize="9" fill="#8C5E30" fontWeight="semibold" className="dark:fill-amber-200">
                Anak Tekak (Uvula)
              </text>

              {/* 4. Posterior Pharynx Wall (Dinding Belakang Tenggorokan) */}
              <path
                d="M 285 110 C 285 150, 290 200, 288 280"
                fill="none"
                stroke="#C48484"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <text x="320" y="215" fontSize="9" fill="#C48484" fontWeight="bold">Dinding Faring</text>

              {/* 5. Epiglottis - Dynamic Movement (Retracts for Ain & Haa) */}
              <path
                d={`M 270 230 Q ${epiglottisX} 245, 275 255`}
                fill="none"
                stroke="#C53030"
                strokeWidth="5"
                strokeLinecap="round"
                className="transition-all duration-300"
              />
              <text x="305" y="245" fontSize="8" fill="#C53030" fontWeight="bold">Katup Epiglotis</text>

              {/* 6. Vocal Folds / Larynx (Pita Suara di Pangkal Tenggorokan) */}
              <g transform="translate(270, 265)">
                <ellipse cx="12" cy="5" rx="8" ry="4" fill="#E53E3E" opacity="0.6" />
                <path d="M 4 5 L 20 5" stroke="#FFF" strokeWidth="2" strokeDasharray={profile.vocalCords === 'vibrating' ? '2 2' : 'none'} />
                {profile.vocalCords === 'vibrating' && (
                  <circle cx="12" cy="5" r="9" fill="none" stroke="#E53E3E" strokeWidth="1" className="animate-ping" />
                )}
              </g>
              <text x="295" y="278" fontSize="9" fill="#E53E3E" fontWeight="bold">Pita Suara</text>

              {/* 7. Lower Incisor Teeth */}
              <rect x="156" y="172" width="9" height="14" rx="2" fill="#FFFFFF" stroke="#8C5E30" strokeWidth="1.5" />
              <text x="135" y="205" fontSize="9" fill="#718096" fontWeight="bold">Gigi Bawah</text>

              {/* 8. Upper & Lower Lips (Dynamic Morphing) */}
              {/* Upper Lip */}
              <path
                d={`M 148 140 C 135 150, ${lipOpeningX} ${upperLipY - 5}, ${lipOpeningX} ${upperLipY} Q 146 ${upperLipY + 3}, 150 150 Z`}
                fill="#E26D75"
                stroke="#A83540"
                strokeWidth="1.5"
                className="transition-all duration-300"
              />
              {/* Lower Lip */}
              <path
                d={`M 152 185 C 145 ${lowerLipY}, ${lipOpeningX} ${lowerLipY + 4}, ${lipOpeningX + 4} ${lowerLipY + 12} C 142 205, 150 210, 158 200 Z`}
                fill="#E26D75"
                stroke="#A83540"
                strokeWidth="1.5"
                className="transition-all duration-300"
              />

              {/* 9. The Animated Tongue Mass */}
              <path
                d={tonguePath}
                fill="url(#tongueGrad)"
                stroke="#8A1C25"
                strokeWidth="2"
                className="transition-all duration-300 drop-shadow-sm"
              />
              {/* Tongue Muscle Striation details */}
              <path
                d={`M ${profile.tongueTip.x + 15} ${profile.tongueTip.y + 10} Q ${profile.tongueBlade.x} ${profile.tongueBlade.y + 12}, ${profile.tongueDorsum.x} ${profile.tongueDorsum.y + 15}`}
                fill="none"
                stroke="#FFF"
                strokeWidth="1"
                opacity="0.3"
                className="transition-all duration-300"
              />

              {/* 10. Dynamic Airflow Particles & Breath Arrows */}
              {profile.airflowType === 'nasal' ? (
                // Nasal resonance flow (Nun & Mim)
                <g key={`nasal-${pulseKey}`}>
                  <path
                    d="M 270 260 C 275 190, 260 120, 220 85 C 190 70, 160 85, 130 95"
                    fill="none"
                    stroke="#3182CE"
                    strokeWidth="3.5"
                    strokeDasharray="6 4"
                    strokeLinecap="round"
                    className="animate-[dash_1s_linear_infinite]"
                  />
                  <polygon points="126,95 136,90 134,100" fill="#3182CE" />
                </g>
              ) : (
                // Oral airflow out of the mouth
                <g key={`oral-${pulseKey}`}>
                  <path
                    d="M 275 260 C 275 200, 250 165, 200 165 C 160 165, 140 175, 105 175"
                    fill="none"
                    stroke={profile.airflowType === 'whistle' ? '#D69E2E' : profile.airflowType === 'oral-burst' ? '#E53E3E' : '#319795'}
                    strokeWidth="3"
                    strokeDasharray="6 4"
                    strokeLinecap="round"
                  />
                  <polygon points="100,175 110,170 108,180" fill={profile.airflowType === 'whistle' ? '#D69E2E' : '#319795'} />
                </g>
              )}

              {/* 11. Glow Target Spot (Where the sound originates!) */}
              <g transform={`translate(${profile.targetSpot.x}, ${profile.targetSpot.y})`} key={`target-${pulseKey}`}>
                {/* Outer radar pulse rings */}
                <circle cx="0" cy="0" r="16" fill="none" stroke="#D3A253" strokeWidth="2" opacity="0.4" className="animate-ping" />
                <circle cx="0" cy="0" r="10" fill="#D3A253" opacity="0.3" />
                <circle cx="0" cy="0" r="6" fill="#D3A253" stroke="#FFF" strokeWidth="2" filter="url(#glow-target)" />

                {/* Callout Indicator Pin */}
                <line x1="0" y1="0" x2="-25" y2="-25" stroke="#D3A253" strokeWidth="1.5" />
                <circle cx="-25" cy="-25" r="3" fill="#D3A253" />
              </g>

              {/* Pin Callout Badge Box */}
              <foreignObject x={Math.max(10, profile.targetSpot.x - 130)} y={Math.max(15, profile.targetSpot.y - 45)} width="160" height="30">
                <div className="bg-[#173B4E]/90 dark:bg-black/90 backdrop-blur-md px-2 py-0.5 rounded-lg border border-[#D3A253] text-[9px] font-bold text-white shadow-md text-center line-clamp-1">
                  🎯 {profile.targetSpot.label}
                </div>
              </foreignObject>
            </svg>
          </div>

          {/* Legend / Quick Guide */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-500 dark:text-slate-400 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E26D75] shrink-0" />
              <span>Lidah & Bibir</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D3A253] shrink-0" />
              <span>Titik Sentuh (Makhraj)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3182CE] shrink-0" />
              <span>Dengung Hidung (Ghunnah)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E53E3E] shrink-0" />
              <span>Getaran Pita Suara</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Phonetic Inspector & Action Card */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Card Details */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-700/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#173B4E] to-[#246579] text-[#D3A253] flex items-center justify-center font-arabic text-4xl font-bold shadow-md border border-[#D3A253]/30">
                  {profile.letter}
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-md bg-[#246579]/15 dark:bg-[#246579]/40 text-[#246579] dark:text-[#A7CDD3] text-[10px] font-bold">
                    {profile.category}
                  </span>
                  <h3 className="text-lg font-extrabold text-[#173B4E] dark:text-white mt-1">
                    {profile.letterName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {profile.transliteration}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReplay}
                className="p-3 rounded-2xl bg-[#D3A253] hover:bg-[#c49244] text-[#173B4E] shadow-sm cursor-pointer transition-all hover:scale-105 active:scale-95"
                title="Dengarkan Suara Pelafalan"
              >
                <Play className="w-5 h-5 fill-current" />
              </button>
            </div>

            {/* Organ Contact Explanation */}
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#F8F5F0] dark:bg-slate-750 border border-slate-200/80 dark:border-slate-700 space-y-1">
                <span className="text-[11px] font-bold text-[#246579] dark:text-[#A7CDD3] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Titik Sentuh Kontak Organ:</span>
                </span>
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  {profile.organContact}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-semibold block text-[11px]">Sifat Karakteristik:</span>
                <p className="text-slate-700 dark:text-slate-200 font-medium">
                  {profile.sifatSummary}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200 space-y-1">
                <span className="font-bold flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Peringatan Kesalahan Umum:</span>
                </span>
                <p className="leading-relaxed">
                  {profile.mistakeWarning}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Interactive Keyboard Matrix (All Main Makhraj Letters) */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#173B4E] dark:text-white border-b border-slate-100 dark:border-slate-700/60 pb-3">
          <Layers className="w-4 h-4 text-[#246579]" />
          <span>Pilih Huruf untuk Mensimulasikan Makhrajnya:</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
          {Object.values(ANATOMY_PROFILES).map((item) => {
            const isSelected = activeId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectLetter(item.id)}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 relative ${
                  isSelected
                    ? 'bg-[#173B4E] text-white border-[#173B4E] ring-2 ring-[#D3A253] shadow-md scale-102'
                    : 'bg-[#FAF8F5] dark:bg-slate-750 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-[#246579] hover:bg-white'
                }`}
              >
                <span className="font-arabic text-2xl font-bold text-[#D3A253]">
                  {item.letter}
                </span>
                <span className="text-[11px] font-bold line-clamp-1">
                  {item.letterName}
                </span>
                <span className={`text-[9px] line-clamp-1 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                  {item.subCategory.split('&')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
