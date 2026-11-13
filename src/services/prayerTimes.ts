import { useEffect, useState } from 'react';
import { CalculationMethod, CalculationParameters, Coordinates, HighLatitudeRule, Madhab, PrayerTimes, Rounding } from 'adhan';

/**
 * Jadwal sholat dihitung langsung di perangkat (pustaka Adhan, MIT).
 *
 * Metode bawaan mengikuti lokasi (Indonesia → Kemenag RI, Eropa → Muslim World League, dst.) dan
 * bisa diganti; tiap waktu juga bisa dikoreksi ± menit agar sama dengan jadwal masjid setempat.
 *
 * Kemenag RI: Subuh −20°, Isya −18°, Ashar Syafi'i; ihtiyath +2 menit (Subuh, Ashar, Isya),
 * +3 menit Zuhur & Maghrib (+2 ihtiyath dan ±1 menit koreksi piringan matahari / ketinggian tempat),
 * Terbit −2 menit; dibulatkan ke atas (Terbit ke bawah). Dicocokkan dengan jadwal Bimas Islam
 * Kemenag (Jakarta & Surabaya, November 2026): selisih ≤ 1 menit.
 * Di lintang tinggi dipakai aturan lintang tinggi yang disarankan Adhan.
 */

export type PrayerKey = 'subuh' | 'terbit' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya';

export const PRAYER_LABELS: Record<PrayerKey, string> = {
  subuh: 'Subuh',
  terbit: 'Terbit',
  dzuhur: 'Dzuhur',
  ashar: 'Ashar',
  maghrib: 'Maghrib',
  isya: 'Isya'
};

export const PRAYER_ORDER: PrayerKey[] = ['subuh', 'terbit', 'dzuhur', 'ashar', 'maghrib', 'isya'];

export type DayPrayerTimes = Record<PrayerKey, Date>;

/* ------------------------------------------------------------------ */
/* Metode perhitungan                                                    */
/* ------------------------------------------------------------------ */

export type MethodId = 'kemenag' | 'mwl' | 'ummalqura' | 'jakim' | 'diyanet' | 'isna' | 'egypt' | 'moonsighting' | 'dubai' | 'qatar';

export const METHODS: { id: MethodId; name: string; detail: string }[] = [
  { id: 'kemenag', name: 'Kemenag RI', detail: 'Indonesia · Subuh 20°, Isya 18°, ihtiyath 2–3 menit' },
  { id: 'mwl', name: 'Muslim World League', detail: 'Eropa & umum · Subuh 18°, Isya 17°' },
  { id: 'ummalqura', name: 'Umm al-Qura', detail: 'Arab Saudi · Subuh 18,5°, Isya 90 menit setelah Maghrib' },
  { id: 'jakim', name: 'JAKIM / MUIS', detail: 'Malaysia & Singapura · Subuh 20°, Isya 18°' },
  { id: 'diyanet', name: 'Diyanet', detail: 'Turki · Subuh 18°, Isya 17°' },
  { id: 'isna', name: 'ISNA', detail: 'Amerika Utara · Subuh 15°, Isya 15°' },
  { id: 'egypt', name: 'Mesir (Egyptian GAS)', detail: 'Mesir & Afrika · Subuh 19,5°, Isya 17,5°' },
  { id: 'moonsighting', name: 'Moonsighting Committee', detail: 'Inggris & lintang tinggi · Subuh 18°, Isya 18° dengan penyesuaian musim' },
  { id: 'dubai', name: 'Dubai', detail: 'Uni Emirat Arab · Subuh 18,2°, Isya 18,2°' },
  { id: 'qatar', name: 'Qatar', detail: 'Qatar · Subuh 18°, Isya 90 menit setelah Maghrib' }
];

export const methodName = (id: MethodId) => METHODS.find((m) => m.id === id)?.name ?? id;

/** Metode yang lazim dipakai di zona waktu tersebut. */
export function methodForTimeZone(timeZone: string): MethodId {
  if (/^Asia\/(Jakarta|Makassar|Jayapura|Pontianak)$/.test(timeZone)) return 'kemenag';
  if (/^Asia\/(Kuala_Lumpur|Kuching|Singapore|Brunei)$/.test(timeZone)) return 'jakim';
  if (timeZone === 'Asia/Riyadh' || timeZone === 'Asia/Aden' || timeZone === 'Asia/Bahrain' || timeZone === 'Asia/Kuwait') return 'ummalqura';
  if (timeZone === 'Asia/Dubai' || timeZone === 'Asia/Muscat') return 'dubai';
  if (timeZone === 'Asia/Qatar') return 'qatar';
  if (timeZone === 'Europe/Istanbul') return 'diyanet';
  if (timeZone === 'Africa/Cairo') return 'egypt';
  if (timeZone === 'Europe/London' || timeZone === 'Europe/Dublin') return 'moonsighting';
  if (timeZone.startsWith('America/')) return 'isna';
  return 'mwl';
}

function methodParams(id: MethodId): CalculationParameters {
  switch (id) {
    case 'kemenag': {
      const p = new CalculationParameters('Other', 20, 18);
      p.adjustments = { fajr: 2, sunrise: -2, dhuhr: 3, asr: 2, maghrib: 3, isha: 2 };
      p.rounding = Rounding.Up;
      return p;
    }
    case 'mwl':
      return CalculationMethod.MuslimWorldLeague();
    case 'ummalqura':
      return CalculationMethod.UmmAlQura();
    case 'jakim':
      return CalculationMethod.Singapore();
    case 'diyanet':
      return CalculationMethod.Turkey();
    case 'isna':
      return CalculationMethod.NorthAmerica();
    case 'egypt':
      return CalculationMethod.Egyptian();
    case 'moonsighting':
      return CalculationMethod.MoonsightingCommittee();
    case 'dubai':
      return CalculationMethod.Dubai();
    case 'qatar':
      return CalculationMethod.Qatar();
  }
}

/* ------------------------------------------------------------------ */
/* Pengaturan pengguna: metode & koreksi menit                         */
/* ------------------------------------------------------------------ */

export interface PrayerSettings {
  /** 'auto' = mengikuti lokasi. */
  method: 'auto' | MethodId;
  /** Koreksi per waktu (menit), mis. agar sama dengan jadwal masjid. */
  offsets: Record<PrayerKey, number>;
}

const SETTINGS_KEY = 'raudhah_prayer_settings_v1';
const NO_OFFSETS: Record<PrayerKey, number> = { subuh: 0, terbit: 0, dzuhur: 0, ashar: 0, maghrib: 0, isya: 0 };
const listeners = new Set<() => void>();

export function getPrayerSettings(): PrayerSettings {
  try {
    const value = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null') as Partial<PrayerSettings> | null;
    const method = value?.method && (value.method === 'auto' || METHODS.some((m) => m.id === value.method)) ? value.method : 'auto';
    const offsets = { ...NO_OFFSETS };
    PRAYER_ORDER.forEach((k) => {
      const v = Number(value?.offsets?.[k]);
      if (Number.isFinite(v)) offsets[k] = Math.max(-60, Math.min(60, Math.round(v)));
    });
    return { method, offsets };
  } catch {
    return { method: 'auto', offsets: { ...NO_OFFSETS } };
  }
}

export function setPrayerSettings(settings: PrayerSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // abaikan
  }
  listeners.forEach((fn) => fn());
}

export function usePrayerSettings(): PrayerSettings {
  const [value, setValue] = useState(getPrayerSettings);
  useEffect(() => {
    const update = () => setValue(getPrayerSettings());
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);
  return value;
}

export const resolveMethod = (settings: PrayerSettings, timeZone: string): MethodId =>
  settings.method === 'auto' ? methodForTimeZone(timeZone) : settings.method;

/* ------------------------------------------------------------------ */
/* Perhitungan                                                          */
/* ------------------------------------------------------------------ */

const addMinutes = (date: Date, minutes: number) => (minutes ? new Date(date.getTime() + minutes * 60000) : date);

/** Jadwal satu hari (tanggal kalender `date` di lokasi tersebut). */
export function prayerTimesFor(lat: number, lng: number, date: Date, method: MethodId = 'kemenag', offsets: Record<PrayerKey, number> = NO_OFFSETS): DayPrayerTimes {
  const coordinates = new Coordinates(lat, lng);
  const p = methodParams(method);
  p.madhab = Madhab.Shafi;
  p.highLatitudeRule = HighLatitudeRule.recommended(coordinates);
  const t = new PrayerTimes(coordinates, date, p);
  let terbit = t.sunrise;
  if (method === 'kemenag') {
    // Terbit adalah batas akhir Subuh: dibulatkan ke bawah agar tidak terlambat.
    p.rounding = Rounding.None;
    terbit = new Date(new PrayerTimes(coordinates, date, p).sunrise);
    terbit.setSeconds(0, 0);
  }
  return {
    subuh: addMinutes(t.fajr, offsets.subuh),
    terbit: addMinutes(terbit, offsets.terbit),
    dzuhur: addMinutes(t.dhuhr, offsets.dzuhur),
    ashar: addMinutes(t.asr, offsets.ashar),
    maghrib: addMinutes(t.maghrib, offsets.maghrib),
    isya: addMinutes(t.isha, offsets.isya)
  };
}

/** Tanggal kalender (tahun, bulan, hari) "sekarang" di zona waktu tertentu, sebagai Date lokal. */
export function calendarDateIn(timeZone: string, now = new Date()): Date {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const [y, m, d] = parts.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Sholat berikutnya (lewati Terbit) dari sekarang; setelah Isya → Subuh besok. */
export function nextPrayer(
  lat: number,
  lng: number,
  timeZone: string,
  now = new Date(),
  method: MethodId = 'kemenag',
  offsets: Record<PrayerKey, number> = NO_OFFSETS
): { key: PrayerKey; at: Date } {
  const today = prayerTimesFor(lat, lng, calendarDateIn(timeZone, now), method, offsets);
  for (const key of PRAYER_ORDER) {
    if (key === 'terbit') continue;
    if (today[key].getTime() > now.getTime()) return { key, at: today[key] };
  }
  const tomorrowDate = calendarDateIn(timeZone, now);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  return { key: 'subuh', at: prayerTimesFor(lat, lng, tomorrowDate, method, offsets).subuh };
}

export const formatClock = (date: Date, timeZone: string) =>
  new Intl.DateTimeFormat('id-ID', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false }).format(date).replace('.', ':');

/** "27 menit lagi", "1 jam 12 menit lagi". */
export function untilText(at: Date, now = new Date()): string {
  const minutes = Math.max(0, Math.ceil((at.getTime() - now.getTime()) / 60000));
  if (minutes < 1) return 'sebentar lagi';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h ? `${h} jam ` : ''}${m ? `${m} menit ` : ''}lagi`.replace(/\s+lagi$/, ' lagi');
}

/* ------------------------------------------------------------------ */
/* Tanggal Hijriah                                                      */
/* ------------------------------------------------------------------ */

/** Nama bulan Hijriah (ejaan KBBI / Kemenag). Tidak bergantung pada data bahasa browser. */
export const HIJRI_MONTHS = ['Muharam', 'Safar', 'Rabiulawal', 'Rabiulakhir', 'Jumadilawal', 'Jumadilakhir', 'Rajab', 'Syakban', 'Ramadan', 'Syawal', 'Zulkaidah', 'Zulhijah'];

/** Kalender Hijriah tabular (cadangan bila browser tidak punya kalender Hijriah). */
function tabularHijri(date: Date): { day: number; month: number; year: number } {
  const jd = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000) + 2440588;
  const l0 = jd - 1948440 + 10632;
  const n = Math.floor((l0 - 1) / 10631);
  const l1 = l0 - 10631 * n + 354;
  const j = Math.floor((10985 - l1) / 5316) * Math.floor((50 * l1) / 17719) + Math.floor(l1 / 5670) * Math.floor((43 * l1) / 15238);
  const l2 = l1 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l2) / 709);
  const day = l2 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { day, month, year };
}

/**
 * Tanggal Hijriah: hari/bulan/tahun dari kalender Umm al-Qura bawaan browser (angka saja), nama bulan
 * dari daftar sendiri. Bisa berbeda ±1 hari dengan ketetapan Kemenag.
 */
export function hijriDate(timeZone: string, now = new Date()): string {
  for (const calendar of ['islamic-umalqura', 'islamic', 'islamic-civil']) {
    try {
      const parts = new Intl.DateTimeFormat(`en-US-u-ca-${calendar}-nu-latn`, { timeZone, day: 'numeric', month: 'numeric', year: 'numeric' }).formatToParts(now);
      const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
      const day = get('day');
      const month = get('month');
      const year = get('year');
      // Browser tanpa kalender Hijriah mengembalikan tanggal Masehi: abaikan.
      if (day >= 1 && day <= 30 && month >= 1 && month <= 12 && year > 1300 && year < 1700) {
        return `${day} ${HIJRI_MONTHS[month - 1]} ${year} H`;
      }
    } catch {
      // kalender tidak didukung: coba berikutnya
    }
  }
  const { day, month, year } = tabularHijri(calendarDateIn(timeZone, now));
  return `${day} ${HIJRI_MONTHS[month - 1]} ${year} H`;
}

export const gregorianDate = (timeZone: string, now = new Date()) =>
  new Intl.DateTimeFormat('id-ID', { timeZone, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now);
