import { useEffect, useState } from 'react';
import { assetUrl } from './assetUrl';

/**
 * Tema ikon menu (Beranda dan menu bawah), dipilih di Pengaturan.
 * - Klasik: ikon garis 2D.
 * - Kemilau: ikon 3D emas berkilau (public/assets/menu).
 * - Lembut: ikon 3D clay yang kalem (public/assets/menu/lembut).
 */
export type IconTheme = 'klasik' | 'kemilau' | 'lembut';

export const ICON_THEMES: { id: IconTheme; name: string; detail: string }[] = [
  { id: 'klasik', name: 'Klasik', detail: 'Garis 2D sederhana' },
  { id: 'kemilau', name: 'Kemilau', detail: '3D emas berkilau' },
  { id: 'lembut', name: 'Lembut', detail: '3D clay yang kalem' }
];

const KEY = 'raudhah_icon_theme_v1';
const DEFAULT_THEME: IconTheme = 'lembut';
const listeners = new Set<() => void>();

function read(): IconTheme {
  try {
    const value = localStorage.getItem(KEY);
    if (value === 'klasik' || value === 'kemilau' || value === 'lembut') return value;
  } catch {
    /* penyimpanan tidak tersedia */
  }
  return DEFAULT_THEME;
}

let current = read();

export function setIconTheme(theme: IconTheme) {
  current = theme;
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* abaikan */
  }
  listeners.forEach((fn) => fn());
}

export function useIconTheme(): IconTheme {
  const [value, setValue] = useState(current);
  useEffect(() => {
    const update = () => setValue(current);
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);
  return value;
}

/** Berkas gambar ikon 3D untuk tema Kemilau atau Lembut. */
export const menuIcon = (id: string, theme: Exclude<IconTheme, 'klasik'>) =>
  assetUrl(theme === 'kemilau' ? `/assets/menu/${id}.webp` : `/assets/menu/lembut/${id}.webp`);
