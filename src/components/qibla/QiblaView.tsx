import React, { useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Compass, Info, MapPin, Smartphone } from 'lucide-react';
import { useBackHandler } from '../../utils/backNavigation';
import { assetUrl } from '../../utils/assetUrl';
import { useUserLocation } from '../../services/userLocation';
import { magneticDeclination } from '../../services/geomagnetism';
import { angleDiff, distanceToKaaba, norm360, qiblaBearing, useCompassHeading } from '../../services/qibla';

/** Toleransi "sudah menghadap kiblat" (derajat), dengan sedikit histeresis agar tidak berkedip. */
const ALIGN_IN = 3;
const ALIGN_OUT = 5;
/** Jari-jari lingkaran tempat ikon Ka'bah kecil berputar (persen lebar kompas). */
const MARKER_RADIUS = 42.5;

const fmt = (n: number, digits = 1) => n.toLocaleString('id-ID', { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** Piringan kompas: garis derajat, angka, dan huruf arah (berputar mengikuti HP). */
const Dial: React.FC = () => {
  const ticks = [];
  for (let a = 0; a < 360; a += 5) {
    const long = a % 30 === 0;
    ticks.push(
      <line key={a} x1="0" y1={long ? -69 : -72.5} x2="0" y2="-77" stroke={long ? '#246579' : '#9FB7BE'} strokeWidth={long ? 1.6 : 0.9} strokeLinecap="round" transform={`rotate(${a})`} />
    );
  }
  const labels: [number, string][] = [
    [0, 'U'],
    [90, 'T'],
    [180, 'S'],
    [270, 'B']
  ];
  return (
    <svg viewBox="-100 -100 200 200" className="absolute inset-0 w-full h-full" aria-hidden="true">
      {ticks}
      {labels.map(([a, t]) => (
        <text
          key={t}
          x="0"
          y="-56"
          transform={`rotate(${a})`}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="13"
          fontWeight="800"
          fill={t === 'U' ? '#B4462F' : '#173B4E'}
          fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
        >
          {t}
        </text>
      ))}
      {[30, 60, 120, 150, 210, 240, 300, 330].map((a) => (
        <text key={a} x="0" y="-60" transform={`rotate(${a})`} textAnchor="middle" dominantBaseline="middle" fontSize="6.5" fontWeight="600" fill="#477F8D" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif">
          {a}
        </text>
      ))}
    </svg>
  );
};

export const QiblaView: React.FC<{ onClose: () => void; onChangeLocation: () => void }> = ({ onClose, onChangeLocation }) => {
  useBackHandler(true, onClose, 10);
  const location = useUserLocation();
  const compass = useCompassHeading();

  const bearing = location ? qiblaBearing(location.lat, location.lng) : null;
  const distance = location ? distanceToKaaba(location.lat, location.lng) : null;
  const declination = useMemo(() => (location ? magneticDeclination(location.lat, location.lng) : 0), [location]);

  const live = compass.status === 'active' && compass.heading !== null;
  // Arah atas HP terhadap Utara sejati. Tanpa sensor: kompas diam, Utara di atas.
  const trueHeading = live ? norm360(compass.heading! + declination) : 0;
  const offset = bearing !== null ? angleDiff(trueHeading, bearing) : 0;

  const alignedRef = useRef(false);
  if (live && bearing !== null) {
    if (!alignedRef.current && Math.abs(offset) <= ALIGN_IN) alignedRef.current = true;
    else if (alignedRef.current && Math.abs(offset) > ALIGN_OUT) alignedRef.current = false;
  } else alignedRef.current = false;
  const aligned = alignedRef.current;

  useEffect(() => {
    if (aligned) {
      try {
        navigator.vibrate?.([40, 50, 90]);
      } catch {
        /* abaikan */
      }
    }
  }, [aligned]);

  // Animasi halus: piringan, jarum, dan ikon Ka'bah kecil diperbarui tiap frame tanpa render ulang.
  const dialRef = useRef<HTMLDivElement>(null);
  const needleRef = useRef<HTMLImageElement>(null);
  const markerRef = useRef<HTMLImageElement>(null);
  const target = useRef({ heading: trueHeading, bearing: bearing ?? 0 });
  target.current = { heading: trueHeading, bearing: bearing ?? 0 };
  useEffect(() => {
    let current = target.current.heading;
    let frame = 0;
    const step = () => {
      const { heading, bearing: b } = target.current;
      current = norm360(current + angleDiff(current, heading) * 0.18);
      const rel = b - current;
      if (dialRef.current) dialRef.current.style.transform = `rotate(${-current}deg)`;
      if (needleRef.current) needleRef.current.style.transform = `translate(-50%, -50%) rotate(${rel}deg)`;
      if (markerRef.current) {
        const r = (rel * Math.PI) / 180;
        markerRef.current.style.left = `${50 + MARKER_RADIUS * Math.sin(r)}%`;
        markerRef.current.style.top = `${50 - MARKER_RADIUS * Math.cos(r)}%`;
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);

  const accuracyInfo = (() => {
    if (compass.accuracy === null) return null;
    if (compass.accuracy < 0 || compass.accuracy > 30) return { color: 'bg-red-500', text: 'Akurasi sensor rendah. Kalibrasi dulu agar arah tepat.' };
    if (compass.accuracy > 15) return { color: 'bg-amber-400', text: `Akurasi sensor cukup (±${Math.round(compass.accuracy)}°).` };
    return { color: 'bg-emerald-500', text: `Akurasi sensor baik (±${Math.round(compass.accuracy)}°).` };
  })();

  const turnHint = (() => {
    if (!live || bearing === null) return null;
    if (aligned) return null;
    const deg = Math.round(Math.abs(offset));
    return offset > 0 ? `Putar ke kanan ${deg}°` : `Putar ke kiri ${deg}°`;
  })();

  return createPortal(
    <div
      className="fixed inset-0 z-[65] flex flex-col bg-[#F7F4EF] dark:bg-[#0D202A] text-[#293640] dark:text-[#E2E8F0]"
      role="dialog"
      aria-modal="true"
      aria-label="Arah kiblat"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(245,213,138,0.28),transparent_60%)]" aria-hidden="true" />
      <header className="relative shrink-0 flex items-center gap-2 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 max-w-xl w-full mx-auto">
        <button type="button" onClick={onClose} className="p-2 rounded-xl text-[#246579] dark:text-[#A7CDD3] hover:bg-white/70 dark:hover:bg-slate-800" aria-label="Kembali">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="flex-1 text-lg font-bold text-[#173B4E] dark:text-white">Arah Kiblat</h1>
      </header>

      <main className="relative flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="max-w-xl mx-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={onChangeLocation}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-sm text-[#173B4E] dark:text-white"
          >
            <MapPin className="w-4 h-4 text-[#BE9452]" />
            {location ? <span className="font-semibold">{location.name}</span> : <span className="font-semibold">Atur lokasi dulu</span>}
            <span className="text-[11px] text-[#246579] dark:text-[#A7CDD3] underline">Ubah</span>
          </button>

          {/* Ka'bah besar */}
          <div className="relative h-16 flex items-end justify-center">
            <motion.div
              className="absolute inset-x-[-18px] bottom-[-6px] h-10 rounded-full bg-[#F5D58A] blur-xl"
              animate={{ opacity: aligned ? 0.85 : 0 }}
              transition={{ duration: 0.3 }}
              aria-hidden="true"
            />
            <img src={assetUrl('/assets/qibla/kaaba.webp')} alt="Ka'bah" className="relative h-16 w-auto drop-shadow-[0_8px_10px_rgba(0,0,0,0.25)]" draggable={false} />
          </div>

          {/* Kompas */}
          <div className="relative" style={{ width: 'min(84vw, 340px, calc(100dvh - 380px))', minWidth: 230 }}>
            {/* Penanda arah HP (tetap di atas) */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-3 z-10" aria-hidden="true">
              <svg width="22" height="16" viewBox="0 0 22 16">
                <path d="M11 16 L1 1 H21 Z" fill={aligned ? '#16A34A' : '#C9A24A'} stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="relative w-full aspect-square drop-shadow-[0_22px_28px_rgba(23,59,78,0.28)]">
              <img src={assetUrl('/assets/qibla/housing.webp')} alt="" className="absolute inset-0 w-full h-full" draggable={false} />
              <div ref={dialRef} className="absolute inset-0 will-change-transform">
                <Dial />
              </div>
              {bearing !== null && (
                <>
                  <img
                    ref={markerRef}
                    src={assetUrl('/assets/qibla/kaaba.webp')}
                    alt=""
                    className="absolute w-[9%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)]"
                    style={{ left: '50%', top: `${50 - MARKER_RADIUS}%` }}
                    draggable={false}
                  />
                  <img
                    ref={needleRef}
                    src={assetUrl('/assets/qibla/needle.webp')}
                    alt=""
                    className="absolute left-1/2 top-1/2 h-[63%] w-auto will-change-transform drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
                    style={{ transform: 'translate(-50%, -50%)' }}
                    draggable={false}
                  />
                </>
              )}
              <img src={assetUrl('/assets/qibla/cap.webp')} alt="" className="absolute left-1/2 top-1/2 w-[11%] -translate-x-1/2 -translate-y-1/2" draggable={false} />
            </div>
          </div>

          {/* Keterangan */}
          {bearing !== null && distance !== null ? (
            <div className="w-full text-center space-y-1">
              <AnimatePresence mode="wait">
                {aligned ? (
                  <motion.p key="ok" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    Anda sudah menghadap kiblat
                  </motion.p>
                ) : (
                  <motion.p key="turn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-lg font-bold text-[#173B4E] dark:text-white">
                    {turnHint ?? `Kiblat ${fmt(bearing)}° dari Utara`}
                  </motion.p>
                )}
              </AnimatePresence>
              <p className="text-sm text-[#477F8D] dark:text-[#94A3B8]">
                Arah kiblat <b className="text-[#173B4E] dark:text-white tabular-nums">{fmt(bearing)}°</b> dari Utara (searah jarum jam), jarak ke Ka'bah ±
                <b className="text-[#173B4E] dark:text-white tabular-nums">{Math.round(distance).toLocaleString('id-ID')} km</b>.
              </p>
            </div>
          ) : (
            <p className="text-sm text-center text-[#477F8D]">Atur lokasi dulu agar arah kiblat bisa dihitung.</p>
          )}

          {/* Status sensor */}
          <section className="w-full rounded-3xl bg-white/95 dark:bg-slate-800/95 border border-slate-100 dark:border-slate-700 shadow-[0_10px_30px_rgba(23,59,78,0.08)] p-4 space-y-3 text-sm">
            {compass.status === 'need-permission' && (
              <div className="text-center space-y-2">
                <p className="text-[#477F8D] dark:text-[#94A3B8]">Izinkan akses sensor gerak agar kompas bisa mengikuti arah HP.</p>
                <button type="button" onClick={compass.requestPermission} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F5D58A] text-[#173B4E] font-bold">
                  <Compass className="w-4 h-4" /> Aktifkan kompas
                </button>
              </div>
            )}
            {compass.status === 'denied' && (
              <p className="text-[#477F8D] dark:text-[#94A3B8]">
                Akses sensor ditolak. Buka Pengaturan Safari → izinkan "Gerak & Orientasi", lalu buka lagi halaman ini.
              </p>
            )}
            {compass.status === 'starting' && <p className="text-[#477F8D] dark:text-[#94A3B8]">Menyiapkan kompas…</p>}
            {compass.status === 'unavailable' && bearing !== null && (
              <p className="text-[#477F8D] dark:text-[#94A3B8]">
                Perangkat ini tidak punya sensor kompas. Hadapkan badan ke arah Utara, lalu putar searah jarum jam sebesar{' '}
                <b className="text-[#173B4E] dark:text-white">{fmt(bearing)}°</b>. Jarum emas di atas menunjukkan arahnya bila Utara di atas.
              </p>
            )}
            {live && (
              <>
                {accuracyInfo && (
                  <p className="flex items-start gap-2 text-[#293640] dark:text-slate-200">
                    <span className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${accuracyInfo.color}`} />
                    {accuracyInfo.text}
                  </p>
                )}
                {compass.tilted && (
                  <p className="flex items-start gap-2 text-amber-700 dark:text-amber-300">
                    <Smartphone className="w-4 h-4 mt-0.5 shrink-0" /> Pegang HP mendatar (layar menghadap ke atas) agar arah lebih tepat.
                  </p>
                )}
                <p className="text-xs leading-relaxed text-[#477F8D] dark:text-[#94A3B8]">
                  Jika jarum melompat-lompat atau tampak salah, kalibrasi dengan menggerakkan HP membentuk angka 8 beberapa kali, dan jauhkan dari magnet, logam, atau
                  casing bermagnet.
                </p>
              </>
            )}
            {location && (
              <p className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-3">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                Arah diukur dari Utara sejati. Kompas HP menunjuk Utara magnetik, jadi sudah dikoreksi deklinasi {declination >= 0 ? '+' : '−'}
                {fmt(Math.abs(declination))}° untuk {location.name} (World Magnetic Model 2025).
              </p>
            )}
          </section>
        </div>
      </main>
    </div>,
    document.body
  );
};
