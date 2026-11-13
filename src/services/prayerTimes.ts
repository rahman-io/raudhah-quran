import { CalculationParameters, Coordinates, HighLatitudeRule, Madhab, PrayerTimes, Rounding } from 'adhan';

/**
 * Jadwal sholat dihitung langsung di perangkat (pustaka Adhan, MIT) dengan kriteria Kemenag RI:
 *  - Subuh: matahari −20° di bawah ufuk; Isya: −18°; Ashar: bayangan = panjang benda + bayangan saat Zuhur (Syafi'i).
 *  - Ihtiyath: +2 menit (Subuh, Ashar, Isya), +3 menit Zuhur & Maghrib (+2 ihtiyath dan ±1 menit
 *    koreksi piringan matahari / ketinggian tempat), Terbit −2 menit; dibulatkan ke atas (Terbit ke bawah).
 *  Dicocokkan dengan jadwal Bimas Islam Kemenag (Jakarta & Surabaya, November 2026): selisih ≤ 1 menit.
 * Di lintang tinggi (mis. Eropa saat musim panas) dipakai aturan lintang tinggi yang disarankan Adhan.
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

function params(coordinates: Coordinates, rounding: (typeof Rounding)[keyof typeof Rounding]): CalculationParameters {
  const p = new CalculationParameters('Other', 20, 18);
  p.madhab = Madhab.Shafi;
  p.adjustments = { fajr: 2, sunrise: -2, dhuhr: 3, asr: 2, maghrib: 3, isha: 2 };
  p.rounding = rounding;
  p.highLatitudeRule = HighLatitudeRule.recommended(coordinates);
  return p;
}

/** Jadwal satu hari (tanggal kalender `date` di lokasi tersebut). */
export function prayerTimesFor(lat: number, lng: number, date: Date): DayPrayerTimes {
  const coordinates = new Coordinates(lat, lng);
  const t = new PrayerTimes(coordinates, date, params(coordinates, Rounding.Up));
  // Terbit adalah batas akhir Subuh: dibulatkan ke bawah agar tidak terlambat.
  const raw = new PrayerTimes(coordinates, date, params(coordinates, Rounding.None));
  const terbit = new Date(raw.sunrise);
  terbit.setSeconds(0, 0);
  return { subuh: t.fajr, terbit, dzuhur: t.dhuhr, ashar: t.asr, maghrib: t.maghrib, isya: t.isha };
}

/** Tanggal kalender (tahun, bulan, hari) "sekarang" di zona waktu tertentu, sebagai Date lokal. */
export function calendarDateIn(timeZone: string, now = new Date()): Date {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const [y, m, d] = parts.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Sholat berikutnya (lewati Terbit) dari sekarang; setelah Isya → Subuh besok. */
export function nextPrayer(lat: number, lng: number, timeZone: string, now = new Date()): { key: PrayerKey; at: Date } {
  const today = prayerTimesFor(lat, lng, calendarDateIn(timeZone, now));
  for (const key of PRAYER_ORDER) {
    if (key === 'terbit') continue;
    if (today[key].getTime() > now.getTime()) return { key, at: today[key] };
  }
  const tomorrowDate = calendarDateIn(timeZone, now);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  return { key: 'subuh', at: prayerTimesFor(lat, lng, tomorrowDate).subuh };
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

/** Tanggal Hijriah (kalender Umm al-Qura bawaan browser; bisa berbeda ±1 hari dengan ketetapan Kemenag). */
export function hijriDate(timeZone: string, now = new Date()): string {
  for (const calendar of ['islamic-umalqura', 'islamic']) {
    try {
      const text = new Intl.DateTimeFormat(`id-ID-u-ca-${calendar}`, { timeZone, day: 'numeric', month: 'long', year: 'numeric' }).format(now);
      if (!/\d{4}\s*$/.test(text) || /H$/.test(text)) return text.replace(/\s*H$/, ' H');
      return `${text} H`;
    } catch {
      // kalender tidak didukung: coba yang lain
    }
  }
  return '';
}

export const gregorianDate = (timeZone: string, now = new Date()) =>
  new Intl.DateTimeFormat('id-ID', { timeZone, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now);
