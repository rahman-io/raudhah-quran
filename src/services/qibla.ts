import { useEffect, useRef, useState } from 'react';

/**
 * Arah kiblat dan sensor kompas.
 *
 * Arah dihitung dengan rumus lingkaran besar (great circle) dari lokasi pengguna ke Ka'bah,
 * diukur searah jarum jam dari Utara sejati. Sensor kompas HP memberi arah Utara magnetik,
 * jadi arahnya dikoreksi dengan deklinasi magnetik (lihat geomagnetism.ts).
 */

export const KAABA = { lat: 21.4225, lng: 39.8262 };

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** Normalisasi sudut ke 0..360. */
export const norm360 = (a: number) => ((a % 360) + 360) % 360;
/** Selisih sudut terpendek b − a dalam −180..180. */
export const angleDiff = (a: number, b: number) => ((b - a + 540) % 360) - 180;

/** Arah kiblat (derajat dari Utara sejati, searah jarum jam). */
export function qiblaBearing(lat: number, lng: number): number {
  const phi = rad(lat);
  const phiK = rad(KAABA.lat);
  const dLng = rad(KAABA.lng - lng);
  const y = Math.sin(dLng) * Math.cos(phiK);
  const x = Math.cos(phi) * Math.sin(phiK) - Math.sin(phi) * Math.cos(phiK) * Math.cos(dLng);
  return norm360(deg(Math.atan2(y, x)));
}

/** Jarak lingkaran besar ke Ka'bah dalam km. */
export function distanceToKaaba(lat: number, lng: number): number {
  const R = 6371.0088;
  const dPhi = rad(KAABA.lat - lat);
  const dLng = rad(KAABA.lng - lng);
  const h = Math.sin(dPhi / 2) ** 2 + Math.cos(rad(lat)) * Math.cos(rad(KAABA.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/* ---------- Sensor kompas ---------- */

export type CompassStatus = 'starting' | 'need-permission' | 'active' | 'denied' | 'unavailable';

export interface CompassReading {
  status: CompassStatus;
  /** Arah atas HP terhadap Utara magnetik (0..360), null bila belum ada. */
  heading: number | null;
  /** Akurasi dalam derajat (hanya iPhone/iPad), null bila tidak diketahui. */
  accuracy: number | null;
  /** HP dipegang terlalu tegak sehingga arah kurang akurat. */
  tilted: boolean;
  requestPermission: () => void;
}

type OrientationEventWithCompass = DeviceOrientationEvent & { webkitCompassHeading?: number; webkitCompassAccuracy?: number };
type PermissionApi = { requestPermission?: () => Promise<'granted' | 'denied'> };

const screenAngle = () => {
  const angle = typeof screen !== 'undefined' && screen.orientation ? screen.orientation.angle : (window as unknown as { orientation?: number }).orientation;
  return typeof angle === 'number' ? angle : 0;
};

/**
 * Membaca arah kompas HP.
 * - iPhone/iPad: `webkitCompassHeading` (perlu izin lewat ketukan).
 * - Android: event `deviceorientationabsolute`, arah = 360 − alpha.
 * - Laptop/perangkat tanpa sensor: status `unavailable`.
 */
export function useCompassHeading(): CompassReading {
  const supported = typeof DeviceOrientationEvent !== 'undefined';
  // iPhone/iPad (dan sebagian browser lain) meminta izin sensor lewat ketukan.
  const canAsk = supported && typeof (DeviceOrientationEvent as unknown as PermissionApi).requestPermission === 'function';
  const [status, setStatus] = useState<CompassStatus>(supported ? 'starting' : 'unavailable');
  const [heading, setHeading] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [tilted, setTilted] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const gotReading = useRef(false);

  useEffect(() => {
    if (!supported) return;
    const hasAbsoluteEvent = 'ondeviceorientationabsolute' in window;
    const onAbsolute = (ev: DeviceOrientationEvent) => {
      if (typeof ev.alpha !== 'number') return;
      gotReading.current = true;
      setHeading(norm360(360 - ev.alpha + screenAngle()));
      setAccuracy(null);
      setTilted(typeof ev.beta === 'number' && Math.abs(ev.beta) > 50);
      setStatus('active');
    };
    const onOrientation = (e: Event) => {
      const ev = e as OrientationEventWithCompass;
      if (typeof ev.webkitCompassHeading === 'number' && !Number.isNaN(ev.webkitCompassHeading)) {
        gotReading.current = true;
        setHeading(norm360(ev.webkitCompassHeading));
        setAccuracy(typeof ev.webkitCompassAccuracy === 'number' ? ev.webkitCompassAccuracy : null);
        setTilted(typeof ev.beta === 'number' && Math.abs(ev.beta) > 50);
        setStatus('active');
      } else if (!hasAbsoluteEvent && ev.absolute) {
        onAbsolute(ev);
      }
    };
    const onAbsoluteEvent = (e: Event) => onAbsolute(e as DeviceOrientationEvent);
    window.addEventListener('deviceorientation', onOrientation);
    if (hasAbsoluteEvent) window.addEventListener('deviceorientationabsolute', onAbsoluteEvent);
    const timer = window.setTimeout(() => {
      if (!gotReading.current) setStatus(canAsk && attempt === 0 ? 'need-permission' : 'unavailable');
    }, 2500);
    return () => {
      window.removeEventListener('deviceorientation', onOrientation);
      if (hasAbsoluteEvent) window.removeEventListener('deviceorientationabsolute', onAbsoluteEvent);
      window.clearTimeout(timer);
    };
  }, [supported, canAsk, attempt]);

  const requestPermission = () => {
    const api = DeviceOrientationEvent as unknown as PermissionApi;
    if (!api.requestPermission) return;
    api
      .requestPermission()
      .then((result) => {
        if (result === 'granted') {
          setStatus('starting');
          setAttempt((n) => n + 1);
        } else setStatus('denied');
      })
      .catch(() => setStatus('denied'));
  };

  return { status, heading, accuracy, tilted, requestPermission };
}
