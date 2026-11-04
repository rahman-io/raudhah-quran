import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Flame, Award, Sparkles, BookOpen, ShieldCheck, Palmtree, CheckCircle2, Lock } from 'lucide-react';
import { useQuranGame } from '../../context/QuranGameContext';
import { INITIAL_BADGES } from '../../data/quranData';

export const AchievementsView: React.FC = () => {
  const { xp, streakDays, memorizedAyahIds, unlockedBadges, gardenPlants } = useQuranGame();

  // Determine User Level
  const getLevelInfo = (currentXp: number) => {
    if (currentXp < 100) return { title: 'Thalibul \'Ilm', level: 1, nextXp: 100 };
    if (currentXp < 300) return { title: 'Bintang Qur\'an', level: 2, nextXp: 300 };
    if (currentXp < 600) return { title: 'Penjaga Ayat', level: 3, nextXp: 600 };
    if (currentXp < 1000) return { title: 'Hafizh Belia', level: 4, nextXp: 1000 };
    if (currentXp < 2000) return { title: 'Cahaya Raudhah', level: 5, nextXp: 2000 };
    return { title: 'Mahkota Kemuliaan', level: 6, nextXp: 5000 };
  };

  const levelInfo = getLevelInfo(xp);
  const progressPercent = Math.min(Math.round((xp / levelInfo.nextXp) * 100), 100);

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-[#E9C46A]" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-[#E76F51]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-[#2A9D8F]" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-[#457B9D]" />;
      case 'Palmtree':
        return <Palmtree className="w-5 h-5 text-[#52796F]" />;
      default:
        return <Award className="w-5 h-5 text-[#C5A059]" />;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Level & XP Overview Card */}
      <div className="bg-gradient-to-r from-[#2F3E46] via-[#354F52] to-[#52796F] text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-[#A8D5BA] font-semibold">
              Tingkat Hafalan · Level {levelInfo.level}
            </span>
            <h3 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-[#E9C46A]" />
              <span>{levelInfo.title}</span>
            </h3>
            <p className="text-xs text-[#CBD5E1]">
              Terus istiqomah belajar setiap hari untuk meraih Mahkota Kemuliaan di akhirat.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10 shrink-0">
            <div>
              <span className="text-[10px] text-[#CBD5E1] block uppercase tracking-wider">Total XP</span>
              <span className="text-xl font-bold text-[#E9C46A] tabular-nums">{xp} XP</span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <span className="text-[10px] text-[#CBD5E1] block uppercase tracking-wider">Istiqomah</span>
              <span className="text-xl font-bold text-[#F4A261] tabular-nums flex items-center gap-1">
                <Flame className="w-4 h-4" />
                {streakDays} Hari
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar to Next Level */}
        <div className="mt-6 space-y-1.5">
          <div className="flex justify-between text-xs text-[#CBD5E1]">
            <span>Progres Menuju Tingkat Berikutnya</span>
            <span className="tabular-nums font-semibold">{xp} / {levelInfo.nextXp} XP</span>
          </div>
          <div className="w-full h-2.5 bg-black/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[#E9C46A] to-[#84A98C] rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Stats KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#84A98C] block">
            Ayat Dihafal
          </span>
          <span className="text-2xl font-bold text-[#1D3557] dark:text-white tabular-nums">
            {memorizedAyahIds.length}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Ayat Al-Qur'an</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#84A98C] block">
            Hari Istiqomah
          </span>
          <span className="text-2xl font-bold text-[#E76F51] tabular-nums flex items-center justify-center gap-1">
            <Flame className="w-5 h-5" />
            {streakDays}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Hari Berturut-turut</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#84A98C] block">
            Tanaman Raudhah
          </span>
          <span className="text-2xl font-bold text-[#52796F] dark:text-[#84A98C] tabular-nums">
            {gardenPlants.length}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Pohon & Bunga</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#84A98C] block">
            Lencana Diraih
          </span>
          <span className="text-2xl font-bold text-[#C5A059] tabular-nums">
            {unlockedBadges.length} / {INITIAL_BADGES.length}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Prestasi</span>
        </div>
      </div>

      {/* Badges Collection */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[#2F3E46] dark:text-white">
          Daftar Lencana & Prestasi (Badges)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {INITIAL_BADGES.map((badge) => {
            const isUnlocked = unlockedBadges.includes(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isUnlocked
                    ? 'bg-white dark:bg-slate-800 border-[#84A98C]/50 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-3 rounded-2xl shrink-0 ${
                      isUnlocked
                        ? 'bg-[#F4EFEA] dark:bg-slate-700 text-[#1D3557]'
                        : 'bg-slate-200 dark:bg-slate-700/50 text-slate-400'
                    }`}
                  >
                    {isUnlocked ? getBadgeIcon(badge.iconName) : <Lock className="w-5 h-5 text-slate-400" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xs text-[#2F3E46] dark:text-white truncate">
                        {badge.title}
                      </p>
                      {isUnlocked ? (
                        <CheckCircle2 className="w-4 h-4 text-[#84A98C] shrink-0" />
                      ) : (
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">Terkunci</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {badge.description}
                    </p>
                    <span className="inline-block mt-2 text-[10px] font-semibold text-[#C5A059] bg-[#E9C46A]/10 px-2 py-0.5 rounded-full">
                      +{badge.xpReward} XP
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
