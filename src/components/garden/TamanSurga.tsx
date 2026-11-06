import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Heart, Sparkles, Sprout, Trophy } from 'lucide-react';
import { useQuranGame } from '../../context/QuranGameContext';
import { INITIAL_PLANTS_CATALOG } from '../../data/quranData';
import type { GardenPlant } from '../../types/quran';
import { sounds } from '../../utils/soundEffects';
import './garden.css';

const ASSET_ROOT = `${import.meta.env.BASE_URL}assets/garden/`;
const PLANT_FRAMES: Record<GardenPlant['type'], { column: number; row: number }> = {
  olive_tree: { column: 0, row: 0 },
  date_palm: { column: 1, row: 0 },
  sidr_tree: { column: 2, row: 0 },
  jasmine_flower: { column: 0, row: 1 },
  lotus_flower: { column: 1, row: 1 },
  pomegranate: { column: 2, row: 1 }
};

export const TamanSurga: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { gardenPlants, memorizedAyahIds } = useQuranGame();
  const [selectedPlant, setSelectedPlant] = useState<GardenPlant | null>(null);
  const reduceMotion = useReducedMotion();
  const nextPlant = INITIAL_PLANTS_CATALOG.find((item) => item.requiredAyahs > memorizedAyahIds.length);
  const previousMilestone = INITIAL_PLANTS_CATALOG.filter((item) => item.requiredAyahs <= memorizedAyahIds.length).at(-1)?.requiredAyahs ?? 0;
  const progress = nextPlant
    ? Math.min(100, Math.max(0, (memorizedAyahIds.length - previousMilestone) / (nextPlant.requiredAyahs - previousMilestone) * 100))
    : 100;

  const handlePlantClick = (plant: GardenPlant) => {
    sounds.playWordClick();
    setSelectedPlant(plant);
  };

  return (
    <section className={`relative w-full overflow-hidden rounded-3xl border border-[#D9E4DF] bg-[#F8F6F1] shadow-sm dark:border-[#2D5052] dark:bg-[#152E38] ${compact ? 'p-2.5 sm:p-4' : 'p-3 sm:p-5 lg:p-6'}`} aria-label="Taman Surga Raudhah">
      <div className={`${compact ? 'mb-2 sm:mb-3' : 'mb-4'} flex flex-col justify-between gap-3 sm:flex-row sm:items-center`}>
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E1EEE8] text-[#246579] dark:bg-[#246579]/30 dark:text-[#A7CDD3]">
              <Sprout className="h-5 w-5" />
            </span>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[#A57839] dark:text-[#E9CF99]">Hafalan yang bertumbuh</span>
              <h3 className="text-lg font-bold tracking-tight text-[#173B4E] dark:text-white sm:text-xl">Taman Surga (Raudhah)</h3>
            </div>
          </div>
          <p className={`mt-2 text-xs leading-relaxed text-[#477F8D] dark:text-[#B5D8D8] sm:text-sm ${compact ? 'hidden sm:block' : ''}`}>
            Setiap ayat yang kau pelajari dan hafal menumbuhkan pohon & bunga abadi di tamanmu.
          </p>
        </div>

        <div className="flex w-fit max-w-full flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-[#D8E3DE] bg-white px-3.5 py-2 text-xs shadow-sm dark:border-[#456667] dark:bg-[#1C3B45]">
          <span className="flex items-center gap-1.5 font-semibold text-[#246579] dark:text-[#D0E9E5]">
            <Trophy className="h-4 w-4 text-[#C99547]" /> {gardenPlants.length} Tanaman Mekar
          </span>
          <span className="hidden text-[#A3B5B0] sm:inline">•</span>
          <span className="font-medium text-[#53696C] dark:text-[#CFDCDC]"><strong className="text-[#A8753D] dark:text-[#E9CF99]">{memorizedAyahIds.length}</strong> Ayat Dihafal</span>
        </div>
      </div>

      <div
        className={`garden-scene relative w-full overflow-hidden rounded-2xl border border-[#BACFC4] bg-[#B8D9D0] shadow-inner dark:border-[#476462] ${compact ? 'h-[190px] sm:h-[270px] lg:h-[320px]' : 'h-[350px] sm:h-[420px] lg:h-[480px]'}`}
        style={{ backgroundImage: `url("${ASSET_ROOT}meadow.webp")` }}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-[#174C60]/20 dark:from-[#0C2736]/20 dark:to-[#071E28]/35" />

        <div className={`pointer-events-none absolute left-3 top-3 max-w-[65%] rounded-xl border border-white/70 bg-[#F8F6F1]/85 px-3 py-2 text-[11px] font-medium text-[#174C60] shadow-sm backdrop-blur-sm dark:border-white/15 dark:bg-[#153842]/85 dark:text-[#E0F1ED] sm:left-5 sm:top-5 sm:text-xs ${compact ? 'hidden sm:block' : ''}`}>
          <Sparkles className="mr-1 inline h-3.5 w-3.5 text-[#BE9452]" /> Sentuh tanaman untuk melihat kisah hafalanmu
        </div>

        {[{ left: '18%', top: '25%', delay: '0s' }, { left: '68%', top: '31%', delay: '-3s' }].map((butterfly, index) => (
          <div key={index} className="garden-butterfly-flight pointer-events-none absolute z-[2]" style={{ left: butterfly.left, top: butterfly.top, animationDelay: butterfly.delay }} aria-hidden="true">
            <span className="garden-butterfly block h-14 w-11 sm:h-[72px] sm:w-[54px]" style={{ backgroundImage: `url("${ASSET_ROOT}butterfly.webp")` }} />
          </div>
        ))}

        {gardenPlants.map((plant, index) => {
          const { column, row } = PLANT_FRAMES[plant.type];
          const isFlower = plant.type === 'jasmine_flower' || plant.type === 'lotus_flower';
          return (
            <div
              key={plant.id}
              className="absolute -translate-x-1/2 -translate-y-full"
              style={{ left: `${plant.x}%`, top: `${plant.y}%`, zIndex: Math.round(plant.y) + 5 }}
            >
              <motion.button
                type="button"
                onClick={() => handlePlantClick(plant)}
                title={plant.name}
                aria-label={`Lihat ${plant.name}, tumbuh dari hafalan Surah ${plant.surahName} ayat ${plant.ayahNumber}`}
                initial={reduceMotion ? false : { scale: 0, opacity: 0, y: 12 }}
                animate={{ scale: plant.scale, opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : Math.min(index * 0.08, 0.6), duration: reduceMotion ? 0 : 0.6, type: 'spring' }}
                className="garden-plant group relative block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D3A253]"
              >
                <span
                  aria-hidden="true"
                  className={`garden-plant-sprite block bg-no-repeat drop-shadow-[0_9px_8px_rgba(22,49,35,0.32)] transition-[filter] duration-300 group-hover:brightness-110 ${isFlower
                    ? compact ? 'h-[clamp(60px,8vw,96px)] w-[clamp(60px,8vw,96px)]' : 'h-[clamp(76px,10vw,120px)] w-[clamp(76px,10vw,120px)]'
                    : compact ? 'h-[clamp(78px,12vw,132px)] w-[clamp(78px,12vw,132px)]' : 'h-[clamp(92px,16vw,184px)] w-[clamp(92px,16vw,184px)]'}`}
                  style={{
                    backgroundImage: `url("${ASSET_ROOT}plants.webp")`,
                    backgroundSize: '300% 200%',
                    backgroundPosition: `${column * 50}% ${row * 100}%`,
                    animationDelay: `${-index * 0.7}s`
                  }}
                />
                <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#173B4E]/90 px-2 py-1 text-[10px] font-semibold text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  {plant.name}
                </span>
              </motion.button>
            </div>
          );
        })}

        {[12, 26, 45, 58, 76, 87].map((left, index) => (
          <span key={left} className="garden-firefly pointer-events-none absolute z-[1] h-1.5 w-1.5 rounded-full bg-[#FFE1A0] shadow-[0_0_12px_4px_rgba(255,213,132,0.6)]" style={{ left: `${left}%`, top: `${40 + index % 3 * 12}%`, animationDelay: `${-index * 0.65}s` }} aria-hidden="true" />
        ))}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#174C60]/35 to-transparent" />
      </div>

      <AnimatePresence mode="wait">
        {selectedPlant && (
          <motion.div
            key={selectedPlant.id}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-[#D3A253]/45 bg-white/95 p-3 text-xs shadow-sm dark:bg-[#1C3B45]"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FAF0D9] text-[#B87845] dark:bg-[#4C5340]"><Heart className="h-4 w-4" /></span>
              <div className="min-w-0">
                <p className="font-bold text-[#173B4E] dark:text-white">{selectedPlant.name}</p>
                <p className="text-[11px] text-[#477F8D] dark:text-[#B5D8D8]">Tumbuh dari hafalan Surat {selectedPlant.surahName} ayat {selectedPlant.ayahNumber}</p>
              </div>
            </div>
            <button type="button" onClick={() => setSelectedPlant(null)} className="shrink-0 rounded-lg px-2.5 py-2 font-semibold text-[#246579] hover:bg-[#E1EEE8] dark:text-[#B5D8D8] dark:hover:bg-[#246579]/40">Tutup</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`${compact ? 'mt-2 p-2.5 sm:p-3' : 'mt-4 p-4'} flex flex-col gap-3 rounded-2xl border border-[#E2E5D9] bg-white/85 shadow-sm dark:border-[#456667] dark:bg-[#1C3B45] sm:flex-row sm:items-center sm:justify-between sm:gap-6`}>
        <div className="min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#A57839] dark:text-[#E9CF99]">{nextPlant ? 'Tanaman berikutnya' : 'Tamanmu mekar'}</span>
          <p className="mt-1 text-sm font-semibold text-[#173B4E] dark:text-white">
            {nextPlant ? `${nextPlant.requiredAyahs - memorizedAyahIds.length} ayat lagi untuk ${nextPlant.name}` : 'Seluruh jenis tanaman sudah tumbuh. Terus rawat hafalanmu!'}
          </p>
        </div>
        <div className="w-full shrink-0 sm:w-40">
          <div className="mb-1 flex justify-between text-[10px] font-semibold text-[#477F8D] dark:text-[#B5D8D8]"><span>Hafalan</span><span>{nextPlant ? `${memorizedAyahIds.length} / ${nextPlant.requiredAyahs}` : 'Lengkap'}</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-[#E1EEE8] dark:bg-[#245361]" role="progressbar" aria-label="Kemajuan menuju tanaman berikutnya" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-gradient-to-r from-[#477F8D] to-[#D3A253] transition-[width] duration-700" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
};
