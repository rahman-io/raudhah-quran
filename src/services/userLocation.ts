import { useEffect, useState } from 'react';
import { CITIES, type City } from '../data/cities';

/**
 * Lokasi untuk jadwal sholat: dari GPS (dengan izin) atau kota yang dipilih manual.
 * Disimpan di perangkat. Nama lokasi GPS diambil dari kota terdekat di daftar (tanpa layanan luar).
 */

export interface UserLocation {
  lat: number;
  lng: number;
  name: string;
  /** Zona waktu IANA tempat itu. */
  tz: string;
  source: 'gps' | 'manual';
}

const KEY = 'raudhah_location_v1';
const listeners = new Set<() => void>();
/** Cadangan bila penyimpanan perangkat tidak tersedia. */
let memory: UserLocation | null = null;

export function getUserLocation(): UserLocation | null {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || 'null') as UserLocation | null;
    return value && typeof value.lat === 'number' && typeof value.lng === 'number' && value.tz ? value : null;
  } catch {
    return null;
  }
}

export function setUserLocation(location: UserLocation) {
  try {
    localStorage.setItem(KEY, JSON.stringify(location));
  } catch {
    // abaikan: lokasi hanya berlaku sampai app ditutup
  }
  memory = location;
  listeners.forEach((fn) => fn());
}

export function useUserLocation(): UserLocation | null {
  const [value, setValue] = useState<UserLocation | null>(() => getUserLocation() ?? memory);
  useEffect(() => {
    const update = () => setValue(getUserLocation() ?? memory);
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);
  return value;
}

const distanceKm = (aLat: number, aLng: number, bLat: number, bLng: number) => {
  const r = Math.PI / 180;
  const dLat = (bLat - aLat) * r;
  const dLng = (bLng - aLng) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * r) * Math.cos(bLat * r) * Math.sin(dLng / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
};

export function nearestCity(lat: number, lng: number): { city: City; km: number } {
  let best = CITIES[0];
  let bestKm = Infinity;
  CITIES.forEach((city) => {
    const km = distanceKm(lat, lng, city.lat, city.lng);
    if (km < bestKm) {
      best = city;
      bestKm = km;
    }
  });
  return { city: best, km: bestKm };
}

export const deviceTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta';
  } catch {
    return 'Asia/Jakarta';
  }
};

/** Minta lokasi GPS (memunculkan izin lokasi browser). */
export function requestGpsLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('unsupported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        const { city, km } = nearestCity(lat, lng);
        const location: UserLocation = {
          lat,
          lng,
          name: km <= 40 ? city.name : km <= 120 ? `Dekat ${city.name}` : 'Lokasi Anda',
          tz: deviceTimeZone(),
          source: 'gps'
        };
        setUserLocation(location);
        resolve(location);
      },
      (error) => reject(error),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 6 * 3600 * 1000 }
    );
  });
}

export const cityLocation = (city: City): UserLocation => ({ lat: city.lat, lng: city.lng, name: city.name, tz: city.tz, source: 'manual' });
