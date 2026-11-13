import SunCalc from 'suncalc';
import { calendarDateIn, prayerTimesFor, type DayPrayerTimes, type MethodId, type PrayerKey } from './prayerTimes';

/**
 * Langit di Beranda: 7 keadaan menurut waktu sholat, posisi matahari & bulan, dan warna langit.
 *
 * - Keadaan (Tahajud, Subuh, Dhuha, Dzuhur, Ashar, Maghrib, Isya) mengikuti jadwal sholat lokasi.
 *   Antara Terbit dan awal Dhuha ditandai "Syuruq" (matahari baru terbit).
 * - Awal Dhuha: matahari setinggi ±4,5° (kira-kira "setinggi tombak", 4–6° menurut kajian falak).
 * - Tahajud: sepertiga malam terakhir; malam dihitung dari Maghrib sampai Subuh (HR. Bukhari no. 1145).
 * - Matahari & bulan dihitung astronomis dengan SunCalc (BSD-2): bulan tampil sesuai posisi dan fasenya.
 */

export type SkyPhase = 'tahajud' | 'subuh' | 'syuruq' | 'dhuha' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya';

export const PHASE_LABEL: Record<SkyPhase, string> = {
  tahajud: 'Waktu Tahajud',
  subuh: 'Waktu Subuh',
  syuruq: 'Matahari terbit',
  dhuha: 'Waktu Dhuha',
  dzuhur: 'Waktu Dzuhur',
  ashar: 'Waktu Ashar',
  maghrib: 'Waktu Maghrib',
  isya: 'Waktu Isya'
};

const DHUHA_ALTITUDE = 4.5;
SunCalc.addTime(DHUHA_ALTITUDE, 'dhuhaStart', 'dhuhaEveningMirror');

const rad = Math.PI / 180;

export interface SkyTimes {
  today: DayPrayerTimes;
  /** Awal waktu Dhuha hari ini. */
  dhuhaStart: Date;
  /** Awal sepertiga malam terakhir yang berlaku (malam ini atau malam sebelumnya). */
  lastThird: Date;
  /** Subuh yang mengakhiri malam tersebut. */
  nightEnd: Date;
}

function dayOffset(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

/** Waktu-waktu yang dibutuhkan langit untuk saat `now` di lokasi tersebut. */
export function skyTimes(lat: number, lng: number, tz: string, now: Date, method: MethodId, offsets: Record<PrayerKey, number>): SkyTimes {
  const date = calendarDateIn(tz, now);
  const today = prayerTimesFor(lat, lng, date, method, offsets);
  // Malam yang sedang berjalan: sebelum Subuh → malam kemarin; setelah Isya → malam ini.
  let nightStart: Date;
  let nightEnd: Date;
  if (now.getTime() < today.subuh.getTime()) {
    nightStart = prayerTimesFor(lat, lng, dayOffset(date, -1), method, offsets).maghrib;
    nightEnd = today.subuh;
  } else {
    nightStart = today.maghrib;
    nightEnd = prayerTimesFor(lat, lng, dayOffset(date, 1), method, offsets).subuh;
  }
  const lastThird = new Date(nightEnd.getTime() - (nightEnd.getTime() - nightStart.getTime()) / 3);
  const noon = new Date(today.dzuhur);
  const dhuhaRaw = (SunCalc.getTimes(noon, lat, lng) as unknown as Record<string, Date>).dhuhaStart;
  const dhuhaStart = dhuhaRaw && !Number.isNaN(dhuhaRaw.getTime()) ? dhuhaRaw : new Date(today.terbit.getTime() + 15 * 60000);
  return { today, dhuhaStart, lastThird, nightEnd };
}

export function phaseAt(t: SkyTimes, now: Date): SkyPhase {
  const n = now.getTime();
  const { today } = t;
  if (n < today.subuh.getTime()) return n >= t.lastThird.getTime() ? 'tahajud' : 'isya';
  if (n < today.terbit.getTime()) return 'subuh';
  if (n < t.dhuhaStart.getTime()) return 'syuruq';
  if (n < today.dzuhur.getTime()) return 'dhuha';
  if (n < today.ashar.getTime()) return 'dzuhur';
  if (n < today.maghrib.getTime()) return 'ashar';
  if (n < today.isya.getTime()) return 'maghrib';
  return n >= t.lastThird.getTime() ? 'tahajud' : 'isya';
}

/* ---------- Matahari & bulan ---------- */

export interface BodyPosition {
  /** 0..1 dari kiri ke kanan. */
  x: number;
  /** 0 = cakrawala, 1 = puncak lengkung; negatif = di bawah cakrawala. */
  y: number;
  altitude: number;
}

/** Matahari: terbit di kiri bawah, puncak tepat tengah hari (Dzuhur), terbenam di kanan bawah. */
export function sunPosition(lat: number, lng: number, now: Date): BodyPosition {
  const times = SunCalc.getTimes(now, lat, lng);
  const altitude = SunCalc.getPosition(now, lat, lng).altitude / rad;
  const noonAlt = Math.max(1, SunCalc.getPosition(times.solarNoon, lat, lng).altitude / rad);
  const rise = times.sunrise?.getTime();
  const set = times.sunset?.getTime();
  let x = 0.5;
  if (rise && set && !Number.isNaN(rise) && !Number.isNaN(set)) {
    x = (now.getTime() - rise) / (set - rise);
  } else {
    // Lintang sangat tinggi (tanpa terbit/terbenam): ikuti jam matahari.
    x = 0.5 + (now.getTime() - times.solarNoon.getTime()) / 86400000;
  }
  return { x, y: altitude / noonAlt, altitude };
}

export interface MoonState extends BodyPosition {
  visible: boolean;
  /** Bagian yang terang, 0..1. */
  fraction: number;
}

/** Bulan realistis: hanya tampil saat di atas cakrawala; lintasan dari terbit sampai terbenamnya. */
export function moonState(lat: number, lng: number, now: Date): MoonState {
  const altAt = (t: number) => SunCalc.getMoonPosition(new Date(t), lat, lng).altitude / rad;
  const n = now.getTime();
  const altitude = altAt(n);
  const fraction = SunCalc.getMoonIllumination(now).fraction;
  if (altitude <= -1) return { visible: false, x: 0, y: altitude / 60, altitude, fraction };
  const step = 10 * 60000;
  let rise = n;
  while (rise > n - 20 * 3600000 && altAt(rise - step) > -1) rise -= step;
  let set = n;
  while (set < n + 20 * 3600000 && altAt(set + step) > -1) set += step;
  let peak = altitude;
  for (let t = rise; t <= set; t += step) peak = Math.max(peak, altAt(t));
  const x = set > rise ? (n - rise) / (set - rise) : 0.5;
  return { visible: true, x, y: altitude / Math.max(5, peak), altitude, fraction };
}

/* ---------- Warna langit menurut ketinggian matahari ---------- */

type RGB = [number, number, number];
const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
interface Stop {
  alt: number;
  morning: [string, string, string];
  evening: [string, string, string];
}
// Atas, tengah, cakrawala.
const STOPS: Stop[] = [
  { alt: -18, morning: ['#040A18', '#0A1730', '#102544'], evening: ['#040A18', '#0A1730', '#102544'] },
  { alt: -12, morning: ['#06112A', '#13284C', '#1F3B63'], evening: ['#070F28', '#16224A', '#2A3563'] },
  { alt: -6, morning: ['#152B57', '#41588A', '#B9857A'], evening: ['#1A2150', '#4C3F7C', '#D27D68'] },
  { alt: -2, morning: ['#2F5089', '#8199C2', '#F0AE86'], evening: ['#33356F', '#A3678A', '#F39360'] },
  { alt: 2, morning: ['#4F82B8', '#A2BFDB', '#F5CC9B'], evening: ['#4C5F9C', '#D69586', '#F6A867'] },
  { alt: 8, morning: ['#4E92C8', '#94C3E4', '#EADFC4'], evening: ['#4F86BF', '#A8BED6', '#F2C58C'] },
  { alt: 20, morning: ['#3787C6', '#76B5E2', '#C9E2F0'], evening: ['#3A83C2', '#80B5DD', '#DCE3DA'] },
  { alt: 50, morning: ['#2C7FC2', '#66ADE0', '#B8DCF0'], evening: ['#2C7FC2', '#66ADE0', '#B8DCF0'] }
];

const mix = (a: RGB, b: RGB, t: number): string =>
  `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)}, ${Math.round(a[1] + (b[1] - a[1]) * t)}, ${Math.round(a[2] + (b[2] - a[2]) * t)})`;

export function skyColors(sunAltitude: number, morning: boolean): [string, string, string] {
  const alt = Math.max(STOPS[0].alt, Math.min(STOPS[STOPS.length - 1].alt, sunAltitude));
  let i = 0;
  while (i < STOPS.length - 2 && alt > STOPS[i + 1].alt) i += 1;
  const a = STOPS[i];
  const b = STOPS[i + 1];
  const t = (alt - a.alt) / (b.alt - a.alt);
  const pa = morning ? a.morning : a.evening;
  const pb = morning ? b.morning : b.evening;
  return [0, 1, 2].map((k) => mix(hex(pa[k]), hex(pb[k]), t)) as [string, string, string];
}

/** 0 (siang) .. 1 (malam gelap): untuk bintang, lampu masjid, dan versi malam pemandangan. */
export const nightness = (sunAltitude: number) => Math.max(0, Math.min(1, (-sunAltitude - 1) / 11));
