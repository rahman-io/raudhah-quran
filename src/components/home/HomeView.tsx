import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import {
  CheckCircle2, ChevronRight, Circle, CloudSun, Flame, Loader2, LocateFixed, MapPin,
  Minus, Moon, MoonStar, Plus, Search, SlidersHorizontal, Sun, Sunrise, Sunset, X
} from 'lucide-react';
import { useQuranGame } from '../../context/QuranGameContext';
import { useBackHandler } from '../../utils/backNavigation';
import { CITIES } from '../../data/cities';
import { cityLocation, requestGpsLocation, setUserLocation, useUserLocation, type UserLocation } from '../../services/userLocation';
import {
  calendarDateIn, formatClock, gregorianDate, hijriDate, METHODS, methodForTimeZone, methodName, nextPrayer, PRAYER_LABELS, PRAYER_ORDER, prayerTimesFor,
  resolveMethod, setPrayerSettings, untilText, usePrayerSettings, type PrayerKey, type PrayerSettings
} from '../../services/prayerTimes';
import { ACTIVITIES, claimDailyBonus, useTodayActivities, type ActivityId } from '../../services/dailyActivity';
import { getRecentReadings } from '../reader/recentReading';
import { TasbihView } from '../tasbih/TasbihView';
import { menuIcon } from '../../utils/menuIcons';
import { QiblaView } from '../qibla/QiblaView';
import { DoaView } from '../doa/DoaView';

/** Tujuan dari Beranda (ditangani App: pindah menu / buka surah). */
export type HomeTarget = 'quran' | 'continue' | 'setor' | 'challenge' | 'hafalan' | 'tajwid' | 'iqro' | 'garden' | 'achievements';

const PRAYER_ICONS: Record<PrayerKey, React.ElementType> = {
  subuh: MoonStar, terbit: Sunrise, dzuhur: Sun, ashar: CloudSun, maghrib: Sunset, isya: Moon
};

/** Ke mana tugas harian dikerjakan. */
const ACTIVITY_TARGET: Record<ActivityId, HomeTarget | 'dzikir'> = {
  baca: 'continue',
  setor: 'setor',
  game: 'hafalan',
  tajwid: 'tajwid',
  murottal: 'continue',
  dzikir: 'dzikir'
};

/** Siluet masjid sederhana (ornamen latar). */
const MosqueSilhouette: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 400 120" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden="true">
    <g fill="currentColor">
      {/* menara kiri */}
      <rect x="40" y="38" width="12" height="82" />
      <path d="M38 40 L46 22 L54 40 Z" />
      <circle cx="46" cy="18" r="3" />
      {/* menara kanan */}
      <rect x="348" y="38" width="12" height="82" />
      <path d="M346 40 L354 22 L362 40 Z" />
      <circle cx="354" cy="18" r="3" />
      {/* kubah kecil */}
      <path d="M92 120 V92 a28 28 0 0 1 56 0 V120 Z" />
      <path d="M252 120 V92 a28 28 0 0 1 56 0 V120 Z" />
      {/* kubah utama */}
      <path d="M140 120 V78 C140 46 170 30 200 18 C230 30 260 46 260 78 V120 Z" />
      <rect x="198" y="4" width="4" height="16" />
      <circle cx="200" cy="4" r="3" />
      <rect x="0" y="112" width="400" height="8" />
    </g>
  </svg>
);

const LocationSheet: React.FC<{ current: UserLocation | null; onClose: () => void }> = ({ current, onClose }) => {
  const [query, setQuery] = useState('');
  const [gps, setGps] = useState<'idle' | 'loading' | 'error'>('idle');
  useBackHandler(true, onClose, 10);
  const cities = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? CITIES.filter((c) => `${c.name} ${c.region}`.toLowerCase().includes(q)) : CITIES;
  }, [query]);
  const useGps = () => {
    setGps('loading');
    requestGpsLocation()
      .then(onClose)
      .catch(() => setGps('error'));
  };
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-6" role="dialog" aria-modal="true" aria-label="Lokasi jadwal sholat">
      <motion.div className="absolute inset-0 bg-[#0B1F27]/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative w-full sm:max-w-md max-h-[85vh] flex flex-col bg-[#FBF8F2] dark:bg-[#152E38] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-700">
          <h2 className="flex-1 text-base font-bold text-[#173B4E] dark:text-white">Lokasi jadwal sholat</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-xl text-slate-500 hover:bg-white dark:hover:bg-slate-700" aria-label="Tutup">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-3 border-b border-slate-100 dark:border-slate-700">
          <button
            type="button"
            onClick={useGps}
            disabled={gps === 'loading'}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#246579] hover:bg-[#174C60] text-white text-sm font-semibold disabled:opacity-70"
          >
            {gps === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
            Gunakan lokasi saya (GPS)
          </button>
          {gps === 'error' && (
            <p className="text-xs text-amber-700 dark:text-amber-300">Lokasi belum bisa dibaca. Izinkan akses lokasi di browser, atau pilih kota di bawah.</p>
          )}
          <label className="flex items-center gap-2 px-3 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <Search className="w-4 h-4 text-[#477F8D]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari kota…"
              className="flex-1 bg-transparent text-sm outline-none text-[#293640] dark:text-white"
              aria-label="Cari kota"
            />
          </label>
        </div>
        <ul className="flex-1 overflow-y-auto overscroll-contain divide-y divide-slate-100 dark:divide-slate-700/60">
          {cities.map((city) => {
            const active = current?.source === 'manual' && current.name === city.name;
            return (
              <li key={`${city.name}-${city.region}`}>
                <button
                  type="button"
                  onClick={() => {
                    setUserLocation(cityLocation(city));
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-white dark:hover:bg-slate-800 ${active ? 'bg-[#246579]/5' : ''}`}
                >
                  <MapPin className={`w-4 h-4 shrink-0 ${active ? 'text-[#246579]' : 'text-slate-300'}`} />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-[#173B4E] dark:text-white">{city.name}</span>
                    <span className="block text-[11px] text-[#477F8D]">{city.region}</span>
                  </span>
                </button>
              </li>
            );
          })}
          {cities.length === 0 && <li className="px-5 py-6 text-center text-xs text-slate-500">Kota tidak ditemukan. Gunakan lokasi GPS.</li>}
        </ul>
        <p className="px-5 py-3 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          Metode perhitungan mengikuti lokasi dan bisa diatur di pengaturan jadwal. Lokasi hanya disimpan di perangkat ini.
        </p>
      </motion.div>
    </div>,
    document.body
  );
};

/** Pengaturan jadwal sholat: metode perhitungan & koreksi menit per waktu. */
const PrayerSettingsSheet: React.FC<{ location: UserLocation; onClose: () => void }> = ({ location, onClose }) => {
  const settings = usePrayerSettings();
  useBackHandler(true, onClose, 10);
  const save = (patch: Partial<PrayerSettings>) => setPrayerSettings({ ...settings, ...patch });
  const autoMethod = methodForTimeZone(location.tz);
  const method = resolveMethod(settings, location.tz);
  const times = prayerTimesFor(location.lat, location.lng, calendarDateIn(location.tz), method, settings.offsets);
  const changed = PRAYER_ORDER.some((k) => settings.offsets[k] !== 0);
  const option = (id: PrayerSettings['method'], title: string, detail: string) => {
    const active = settings.method === id;
    return (
      <button
        key={id}
        type="button"
        role="radio"
        aria-checked={active}
        onClick={() => save({ method: id })}
        className={`w-full flex items-start gap-3 px-4 py-3 text-left rounded-2xl border ${
          active ? 'border-[#246579] bg-[#246579]/5' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#477F8D]/50'
        }`}
      >
        <span className={`mt-0.5 w-4 h-4 shrink-0 rounded-full border-2 ${active ? 'border-[#246579] bg-[#246579] shadow-[inset_0_0_0_3px_white]' : 'border-slate-300'}`} />
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-semibold text-[#173B4E] dark:text-white">{title}</span>
          <span className="block text-[11px] text-[#477F8D] dark:text-[#94A3B8]">{detail}</span>
        </span>
      </button>
    );
  };
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-6" role="dialog" aria-modal="true" aria-label="Pengaturan jadwal sholat">
      <motion.div className="absolute inset-0 bg-[#0B1F27]/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative w-full sm:max-w-md max-h-[88vh] flex flex-col bg-[#FBF8F2] dark:bg-[#152E38] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-700">
          <h2 className="flex-1 text-base font-bold text-[#173B4E] dark:text-white">Pengaturan jadwal sholat</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-xl text-slate-500 hover:bg-white dark:hover:bg-slate-700" aria-label="Tutup">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <p className="text-xs leading-relaxed text-[#477F8D] dark:text-[#94A3B8] bg-white/70 dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-200 dark:border-slate-700">
            Untuk ibadah, ikuti jadwal masjid setempat. Pakai <b>koreksi menit</b> di bawah agar jadwal di sini sama persis dengan masjidmu.
          </p>
          <div className="space-y-2" role="radiogroup" aria-label="Metode perhitungan">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#477F8D]">Metode perhitungan</p>
            {option('auto', `Otomatis: ${methodName(autoMethod)}`, `Sesuai lokasi (${location.name})`)}
            {METHODS.map((m) => option(m.id, m.name, m.detail))}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#477F8D]">Koreksi menit</p>
              {changed && (
                <button
                  type="button"
                  onClick={() => save({ offsets: { subuh: 0, terbit: 0, dzuhur: 0, ashar: 0, maghrib: 0, isya: 0 } })}
                  className="text-[11px] font-semibold text-[#246579] dark:text-[#A7CDD3] underline"
                >
                  Atur ulang
                </button>
              )}
            </div>
            <ul className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700/60">
              {PRAYER_ORDER.map((key) => {
                const value = settings.offsets[key];
                const step = (delta: number) =>
                  save({ offsets: { ...settings.offsets, [key]: Math.max(-60, Math.min(60, value + delta)) } });
                return (
                  <li key={key} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold text-[#173B4E] dark:text-white">{PRAYER_LABELS[key]}</span>
                      <span className="block text-[11px] text-[#477F8D] tabular-nums">{formatClock(times[key], location.tz)}</span>
                    </span>
                    <button type="button" onClick={() => step(-1)} className="w-9 h-9 rounded-full bg-[#F1EDE6] dark:bg-slate-700 text-[#246579] dark:text-[#A7CDD3] flex items-center justify-center" aria-label={`${PRAYER_LABELS[key]} 1 menit lebih awal`}>
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className={`w-12 text-center text-sm font-bold tabular-nums ${value ? 'text-[#246579] dark:text-[#A7CDD3]' : 'text-slate-400'}`}>
                      {value > 0 ? `+${value}` : value}
                    </span>
                    <button type="button" onClick={() => step(1)} className="w-9 h-9 rounded-full bg-[#F1EDE6] dark:bg-slate-700 text-[#246579] dark:text-[#A7CDD3] flex items-center justify-center" aria-label={`${PRAYER_LABELS[key]} 1 menit lebih lambat`}>
                      <Plus className="w-4 h-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export const HomeView: React.FC<{ onGo: (target: HomeTarget) => void }> = ({ onGo }) => {
  const { streakDays, addXP } = useQuranGame();
  const location = useUserLocation();
  const activities = useTodayActivities();
  const [now, setNow] = useState(() => new Date());
  const [locationOpen, setLocationOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tasbihOpen, setTasbihOpen] = useState(false);
  const [qiblaOpen, setQiblaOpen] = useState(false);
  const [doaOpen, setDoaOpen] = useState<false | 'menu' | 'dzikir'>(false);
  const prayerSettings = usePrayerSettings();
  const [gpsState, setGpsState] = useState<'idle' | 'loading' | 'error'>('idle');

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const tz = location?.tz ?? (Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta');
  const dayKey = calendarDateIn(tz, now).getTime();
  const method = resolveMethod(prayerSettings, tz);
  const adjusted = PRAYER_ORDER.some((k) => prayerSettings.offsets[k] !== 0);
  const times = useMemo(
    () => (location ? prayerTimesFor(location.lat, location.lng, new Date(dayKey), method, prayerSettings.offsets) : null),
    [location, dayKey, method, prayerSettings]
  );
  const upcoming = location ? nextPrayer(location.lat, location.lng, tz, now, method, prayerSettings.offsets) : null;

  const doneCount = ACTIVITIES.filter((a) => activities[a.id]).length;
  const percent = Math.round((doneCount / ACTIVITIES.length) * 100);
  const nextTask = ACTIVITIES.find((a) => !activities[a.id]);
  // Semua aktivitas hari ini selesai: bonus XP (sekali sehari).
  useEffect(() => {
    if (doneCount === ACTIVITIES.length && claimDailyBonus()) addXP(20, 'Semua aktivitas hari ini selesai');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneCount]);

  const recent = getRecentReadings()[0];
  const BARS = 25;
  const filledBars = Math.round((doneCount / ACTIVITIES.length) * BARS);

  const enableGps = () => {
    setGpsState('loading');
    requestGpsLocation()
      .then(() => setGpsState('idle'))
      .catch(() => {
        setGpsState('error');
        setLocationOpen(true);
      });
  };

  const goActivity = (id: ActivityId) => {
    const target = ACTIVITY_TARGET[id];
    if (target === 'dzikir') setDoaOpen('dzikir');
    else onGo(target);
  };

  const shortcuts: { label: string; icon: string; target: HomeTarget | 'tasbih' | 'qibla' | 'doa'; note?: string }[] = [
    { label: 'Lanjut Baca', icon: 'lanjut', target: 'continue', note: recent ? `${recent.nameLatin} ${recent.ayah}` : undefined },
    { label: "Al-Qur'an", icon: 'quran', target: 'quran' },
    { label: 'Setor Hafalan', icon: 'setor', target: 'setor' },
    { label: 'Tantangan', icon: 'tantangan', target: 'challenge' },
    { label: 'Tajwid', icon: 'tajwid', target: 'tajwid' },
    { label: 'Doa', icon: 'doa', target: 'doa' },
    { label: 'Tasbih', icon: 'tasbih', target: 'tasbih' },
    { label: 'Kiblat', icon: 'kiblat', target: 'qibla' }
  ];

  return (
    <div className="space-y-5">
      {/* Kepala: tanggal, jam, sholat berikutnya, jadwal hari ini */}
      <section className="relative -mx-3 sm:-mx-6 lg:-mx-8 -mt-5 sm:-mt-8 overflow-hidden bg-gradient-to-b from-[#246579] to-[#1C5668] text-white px-5 pt-4 pb-20 sm:rounded-b-[2.5rem]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.10] bg-[radial-gradient(#D3A253_1px,transparent_1px)] [background-size:14px_14px]" aria-hidden="true" />
        <MosqueSilhouette className="pointer-events-none absolute inset-x-0 bottom-14 h-40 w-full text-white/[0.07]" />
        <div className="relative max-w-3xl mx-auto">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setLocationOpen(true)}
              className="flex items-center gap-1.5 min-w-0 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 ring-1 ring-white/15 text-xs font-semibold"
            >
              <MapPin className="w-3.5 h-3.5 shrink-0 text-[#F5D58A]" />
              <span className="truncate">{location ? location.name : 'Atur lokasi'}</span>
            </button>
            <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 ring-1 ring-white/15 text-xs font-semibold" title="Hari berturut-turut">
              <Flame className="w-3.5 h-3.5 text-[#F5D58A]" /> {streakDays} hari
            </span>
          </div>

          <div className="mt-5 text-center">
            <p className="text-sm font-medium text-[#E9CF99]">{hijriDate(tz, now)}</p>
            <p className="text-[11px] text-white/70 mt-0.5">{gregorianDate(tz, now)}</p>
            <p className="mt-2 text-[3.4rem] leading-none font-bold tracking-tight tabular-nums">{formatClock(now, tz)}</p>
            {upcoming ? (
              <p className="mt-2 text-sm text-white/85">
                {PRAYER_LABELS[upcoming.key]} <span className="font-semibold text-[#F5D58A]">{untilText(upcoming.at, now)}</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={enableGps}
                disabled={gpsState === 'loading'}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D3A253] hover:bg-[#E3B973] text-[#173B4E] text-xs font-bold disabled:opacity-70"
              >
                {gpsState === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
                Aktifkan lokasi untuk jadwal sholat
              </button>
            )}
          </div>

          {times && (
            <>
              <div className="mt-5 h-px bg-white/15" />
              <div className="mt-4 grid grid-cols-6 gap-1 text-center">
                {PRAYER_ORDER.map((key) => {
                  const Icon = PRAYER_ICONS[key];
                  const next = upcoming?.key === key && calendarDateIn(tz, upcoming.at).getTime() === dayKey;
                  return (
                    <div key={key} className={`flex flex-col items-center gap-1.5 ${next ? 'text-[#F5D58A]' : 'text-white/90'}`}>
                      <span className="text-[11px] sm:text-xs font-medium">{PRAYER_LABELS[key]}</span>
                      <Icon className="w-5 h-5" strokeWidth={1.7} />
                      <span className="text-xs sm:text-sm font-semibold tabular-nums">{formatClock(times[key], tz)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex justify-center">
                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 ring-1 ring-white/15 text-[11px] font-semibold text-white/85"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#F5D58A]" />
                  {methodName(method)}
                  {adjusted && ' · disesuaikan'}
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Pintasan */}
      <section className="relative -mt-16 max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-[0_10px_30px_rgba(23,59,78,0.10)] px-2 py-4 grid grid-cols-4 gap-y-4" aria-label="Menu pintasan">
        {shortcuts.map(({ label, icon, target, note }) => (
          <button key={label} type="button" onClick={() => (target === 'tasbih' ? setTasbihOpen(true) : target === 'qibla' ? setQiblaOpen(true) : target === 'doa' ? setDoaOpen('menu') : onGo(target))} className="flex flex-col items-center gap-1.5 px-1 rounded-2xl hover:bg-[#F8F6F1] dark:hover:bg-slate-700/40 py-1">
            <img src={menuIcon(icon)} alt="" className="w-12 h-12 drop-shadow-[0_4px_6px_rgba(23,59,78,0.18)]" draggable={false} />
            <span className="text-[12px] font-medium text-[#293640] dark:text-slate-200 text-center leading-tight">{label}</span>
            {note && <span className="text-[9px] text-[#477F8D] leading-none truncate max-w-full">{note}</span>}
          </button>
        ))}
      </section>

      {/* Aktivitas Hari Ini */}
      <section className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-[0_6px_20px_rgba(23,59,78,0.06)] p-5 space-y-4" aria-label="Aktivitas hari ini">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#173B4E] dark:text-white">Aktivitas Hari Ini</h2>
            <p className="text-sm text-[#477F8D] dark:text-[#94A3B8]">Lengkapi checklist harianmu.</p>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-[#246579] text-white text-xs font-bold">{percent}%</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#293640] dark:text-slate-200">{doneCount} dari {ACTIVITIES.length} tugas</p>
          <div className="mt-2 flex gap-[3px]" aria-hidden="true">
            {Array.from({ length: BARS }, (_, i) => (
              <span key={i} className={`flex-1 h-7 rounded-full ${i < filledBars ? 'bg-[#246579]' : 'bg-slate-200 dark:bg-slate-700'}`} />
            ))}
          </div>
        </div>
        <ul className="space-y-1">
          {ACTIVITIES.map((activity) => {
            const done = activities[activity.id];
            return (
              <li key={activity.id}>
                <button
                  type="button"
                  onClick={() => goActivity(activity.id)}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-2xl text-left hover:bg-[#F8F6F1] dark:hover:bg-slate-700/40"
                >
                  {done ? <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" /> : <Circle className="w-5 h-5 shrink-0 text-slate-300" />}
                  <span className="flex-1 min-w-0">
                    <span className={`block text-sm font-semibold ${done ? 'text-slate-400 line-through' : 'text-[#173B4E] dark:text-white'}`}>{activity.title}</span>
                    <span className="block text-[11px] text-[#477F8D] dark:text-[#94A3B8] truncate">{activity.hint}</span>
                  </span>
                  {!done && <ChevronRight className="w-4 h-4 shrink-0 text-slate-400" />}
                </button>
              </li>
            );
          })}
        </ul>
        {nextTask ? (
          <button
            type="button"
            onClick={() => goActivity(nextTask.id)}
            className="w-full py-3 rounded-2xl bg-[#D3A253] hover:bg-[#C8964A] text-white text-sm font-bold shadow-xs"
          >
            Lanjutkan: {nextTask.title}
          </button>
        ) : (
          <p className="text-center text-sm font-semibold text-emerald-700 dark:text-emerald-300 py-2">Masya Allah, semua aktivitas hari ini selesai! +20 XP</p>
        )}
      </section>

      {locationOpen && <LocationSheet current={location} onClose={() => setLocationOpen(false)} />}
      {settingsOpen && location && <PrayerSettingsSheet location={location} onClose={() => setSettingsOpen(false)} />}
      {tasbihOpen && <TasbihView onClose={() => setTasbihOpen(false)} />}
      {doaOpen && <DoaView onClose={() => setDoaOpen(false)} startSet={doaOpen === 'dzikir' ? (new Date().getHours() < 12 ? 'pagi' : 'petang') : undefined} />}
      {qiblaOpen && <QiblaView onClose={() => setQiblaOpen(false)} onChangeLocation={() => setLocationOpen(true)} />}
    </div>
  );
};
