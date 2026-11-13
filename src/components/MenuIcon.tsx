import React from 'react';
import { Award, BookMarked, BookOpen, Compass, GraduationCap, HandHeart, History, House, MicVocal, Swords, Trees } from 'lucide-react';
import { TasbihIcon } from './tasbih/TasbihView';
import { menuIcon, useIconTheme, type IconTheme } from '../utils/menuIcons';

export type MenuIconId =
  | 'lanjut' | 'quran' | 'setor' | 'tantangan' | 'tajwid' | 'doa' | 'tasbih' | 'kiblat' | 'beranda' | 'iqro' | 'taman' | 'prestasi';

/** Ikon garis 2D untuk tema Klasik. */
const LINE_ICONS: Record<MenuIconId, React.ElementType> = {
  lanjut: History,
  quran: BookOpen,
  setor: MicVocal,
  tantangan: Swords,
  tajwid: GraduationCap,
  doa: HandHeart,
  tasbih: TasbihIcon,
  kiblat: Compass,
  beranda: House,
  iqro: BookMarked,
  taman: Trees,
  prestasi: Award
};

/** Ikon menu sesuai tema yang dipilih di Pengaturan. */
export const MenuIcon: React.FC<{ id: MenuIconId; place: 'home' | 'nav' | 'preview'; active?: boolean; theme?: IconTheme }> = ({ id, place, active, theme }) => {
  const chosen = useIconTheme();
  const look = theme ?? chosen;
  if (look === 'klasik') {
    const Icon = LINE_ICONS[id];
    if (place === 'nav') return <Icon className="h-[19px] w-[19px]" strokeWidth={active ? 2.3 : 1.8} />;
    return <Icon className={place === 'preview' ? 'w-5 h-5 text-[#BE9452]' : 'w-7 h-7 text-[#BE9452]'} strokeWidth={1.6} />;
  }
  const src = menuIcon(id, look);
  if (place === 'nav') {
    return (
      <img
        src={src}
        alt=""
        draggable={false}
        className={`h-7 w-7 transition-[filter,opacity,transform] duration-200 ${active ? 'scale-110 drop-shadow-[0_2px_3px_rgba(23,59,78,0.25)]' : 'opacity-60 grayscale-[70%]'}`}
      />
    );
  }
  if (place === 'preview') return <img src={src} alt="" draggable={false} className="w-[26px] h-[26px]" />;
  return <img src={src} alt="" className="w-12 h-12 drop-shadow-[0_4px_6px_rgba(23,59,78,0.18)]" draggable={false} />;
};
