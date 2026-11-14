import React, { useId, useMemo } from 'react';
import { assetUrl } from '../../utils/assetUrl';
import { moonState, nightness, skyColors, sunPosition } from '../../services/sky';

/**
 * Pemandangan di belakang jadwal sholat (gaya clay 3D): langit, matahari, bulan (fase & posisi nyata),
 * bintang berkelip, awan, bukit pasir, masjid (siang/malam), dan rombongan unta.
 * Semua posisi dihitung dari `now` dan lokasi pengguna.
 */

const asset = (name: string) => assetUrl(`/assets/scene/${name}.webp`);

/** Jarak cakrawala dari bawah dan jarak puncak lintasan dari atas (px). */
const HORIZON_PX = 118;
const TOP_PX = 34;

interface Star {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  bright: boolean;
}

function makeStars(count: number): Star[] {
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return Array.from({ length: count }, () => {
    const bright = rand() < 0.1;
    return {
      x: rand() * 100,
      y: rand(),
      size: bright ? 9 + rand() * 4 : 1 + rand() * 1.4,
      delay: rand() * 6,
      duration: 2.2 + rand() * 3.5,
      bright
    };
  });
}

const STARS = makeStars(70);

/** Posisi di layar: x dalam persen, y sebagai CSS `top`. y = 0 di cakrawala, 1 di puncak lintasan. */
const placeX = (x: number) => 6 + x * 88;
const placeTop = (y: number) => `calc(${TOP_PX}px + (100% - ${HORIZON_PX + TOP_PX}px) * ${1 - y})`;

/** Bulan clay dengan fase: bagian terang menghadap ke arah matahari, sisanya redup. */
const Moon: React.FC<{ fraction: number; angle: number; size: number; clipId: string; night: number }> = ({ fraction, angle, size, clipId, night }) => {
  const r = 50;
  const rx = r * Math.abs(1 - 2 * fraction);
  const lit = `M 0 ${-r} A ${r} ${r} 0 0 1 0 ${r} A ${rx} ${r} 0 0 ${fraction > 0.5 ? 1 : 0} 0 ${-r} Z`;
  return (
    <svg viewBox="-50 -50 100 100" width={size} height={size} style={{ overflow: 'visible' }} aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <path d={lit} transform={`rotate(${angle})`} />
        </clipPath>
      </defs>
      <image href={asset('moon')} x={-50} y={-50} width={100} height={100} opacity={0.18 * night} />
      <image href={asset('moon')} x={-50} y={-50} width={100} height={100} clipPath={`url(#${clipId})`} />
    </svg>
  );
};

export const SkyScene: React.FC<{ lat: number; lng: number; now: Date; smooth?: boolean; showCamels?: boolean }> = ({
  lat,
  lng,
  now,
  smooth = true,
  showCamels = false
}) => {
  const ids = useId().replace(/:/g, '');
  const minuteKey = smooth ? Math.floor(now.getTime() / 60000) : now.getTime();
  const sun = useMemo(() => sunPosition(lat, lng, now), [lat, lng, minuteKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const moon = useMemo(() => moonState(lat, lng, now), [lat, lng, minuteKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const night = nightness(sun.altitude);
  const [top, mid, bottom] = skyColors(sun.altitude, sun.x < 0.5);
  const sunX = placeX(sun.x);
  const moonX = placeX(moon.x);
  const transition = smooth ? 'left 1s linear, top 1s linear, opacity 1s linear' : 'none';
  // Arah bagian terang bulan menuju matahari (perkiraan posisi layar; tinggi lintasan ±200 px).
  const moonAngle = (Math.atan2(-(sun.y - moon.y) * 200, (sun.x - moon.x) * 360) * 180) / Math.PI;
  const glowStrength = sun.altitude > -10 && sun.altitude < 14 ? Math.max(0, 1 - Math.abs(sun.altitude - 1) / 13) : 0;
  const sunWarm = Math.max(0, Math.min(1, (14 - sun.altitude) / 14));

  // Warna cahaya untuk pemandangan: siang netral, senja hangat, malam biru gelap.
  const tint = {
    r: 1 - 0.62 * night + 0.06 * glowStrength,
    g: 1 - 0.58 * night - 0.08 * glowStrength,
    b: 1 - 0.38 * night - 0.16 * glowStrength
  };
  const landFilter = `url(#${ids}-tint)`;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg width="0" height="0" className="absolute">
        <filter id={`${ids}-tint`} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={`${tint.r} 0 0 0 0  0 ${tint.g} 0 0 0  0 0 ${tint.b} 0 0  0 0 0 1 0`} />
        </filter>
      </svg>

      {/* Langit */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, ${top} 0%, ${mid} 50%, ${bottom} calc(100% - ${HORIZON_PX - 20}px), ${bottom} 100%)`
        }}
      />

      {/* Bintang */}
      <div className="absolute inset-x-0 top-0" style={{ bottom: HORIZON_PX + 10, opacity: night, transition }}>
        {STARS.map((s, i) =>
          s.bright ? (
            <img
              key={i}
              src={asset('star')}
              alt=""
              className="sky-star absolute"
              style={{
                left: `${s.x}%`,
                top: `${s.y * 100}%`,
                width: s.size,
                height: s.size,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.duration}s`,
                filter: 'drop-shadow(0 0 4px rgba(255,230,170,0.9))'
              }}
            />
          ) : (
            <span
              key={i}
              className="sky-star absolute rounded-full bg-white"
              style={{
                left: `${s.x}%`,
                top: `${s.y * 100}%`,
                width: s.size,
                height: s.size,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.duration}s`,
                boxShadow: '0 0 3px rgba(255,255,255,0.6)'
              }}
            />
          )
        )}
      </div>

      {/* Cahaya cakrawala di dekat matahari saat terbit / terbenam */}
      {glowStrength > 0 && (
        <div
          className="absolute"
          style={{
            left: `${sunX}%`,
            top: `calc(100% - ${HORIZON_PX}px)`,
            width: '130%',
            height: 260,
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(ellipse at center, rgba(255,170,90,${0.6 * glowStrength}) 0%, rgba(255,140,90,${0.22 * glowStrength}) 35%, transparent 65%)`,
            transition
          }}
        />
      )}

      {/* Awan */}
      <img
        src={asset('cloud-1')}
        alt=""
        className="sky-cloud-a absolute w-28"
        style={{ left: '4%', top: 74, opacity: 0.9 - 0.45 * night, filter: landFilter }}
      />
      <img
        src={asset('cloud-2')}
        alt=""
        className="sky-cloud-b absolute w-20"
        style={{ right: '6%', top: 128, opacity: 0.8 - 0.45 * night, filter: landFilter }}
      />

      {/* Bulan */}
      {moon.visible && (
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${moonX}%`, top: placeTop(moon.y), opacity: 0.45 + 0.55 * night, transition }}
        >
          <div
            className="absolute inset-[-80%] rounded-full"
            style={{ background: `radial-gradient(circle, rgba(240,236,214,${0.4 * night * moon.fraction + 0.05}) 0%, transparent 65%)` }}
          />
          <Moon fraction={moon.fraction} angle={moonAngle} size={38} clipId={`${ids}-moon`} night={night} />
        </div>
      )}

      {/* Matahari */}
      {sun.altitude > -3 && (
        <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${sunX}%`, top: placeTop(sun.y), transition }}>
          <div
            className="absolute inset-[-130%] rounded-full sky-sun-glow"
            style={{
              background: `radial-gradient(circle, rgba(255,${Math.round(225 - 60 * sunWarm)},${Math.round(150 - 70 * sunWarm)},0.6) 0%, rgba(255,200,120,0.18) 40%, transparent 70%)`
            }}
          />
          <img
            src={asset('sun')}
            alt=""
            className="relative w-12 h-12"
            style={{ filter: `saturate(${1 + 0.4 * sunWarm}) hue-rotate(${-12 * sunWarm}deg) drop-shadow(0 0 10px rgba(255,200,110,0.7))` }}
          />
        </div>
      )}

      {/* Bukit pasir jauh */}
      <div
        className="absolute inset-x-0 sky-dunes-far"
        style={{ bottom: 78, height: 48, backgroundImage: `url(${asset('dunes-far')})`, backgroundSize: 'auto 100%', backgroundRepeat: 'repeat-x', filter: landFilter }}
      />

      {/* Masjid: versi siang dan malam dipudarkan bergantian */}
      <div className="absolute" style={{ right: '7%', bottom: 66, width: 112 }}>
        <img src={asset('mosque-day')} alt="" className="block w-full" style={{ filter: landFilter }} />
        <img src={asset('mosque-night')} alt="" className="absolute inset-0 w-full" style={{ opacity: night, transition: smooth ? 'opacity 1s linear' : undefined }} />
      </div>

      {/* Bukit pasir dekat */}
      <div
        className="absolute inset-x-0"
        style={{ bottom: 22, height: 84, backgroundImage: `url(${asset('dunes-near')})`, backgroundSize: 'auto 100%', backgroundRepeat: 'repeat-x', backgroundPosition: 'center bottom', filter: landFilter }}
      />

      {/* Rombongan unta berjalan pelan ke kanan (disembunyikan sementara) */}
      {showCamels && (
        <div className="sky-caravan absolute flex items-end gap-2" style={{ bottom: 64, filter: landFilter }}>
          <img src={asset('camel-3')} alt="" className="sky-camel h-[22px]" style={{ animationDelay: '0.3s' }} />
          <img src={asset('camel-2')} alt="" className="sky-camel h-[30px]" style={{ animationDelay: '0.15s' }} />
          <img src={asset('camel-1')} alt="" className="sky-camel h-9" />
        </div>
      )}

      {/* Peneduh agar teks tetap terbaca */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, rgba(10,28,40,${0.2 + 0.3 * (1 - night)}) 0%, rgba(10,28,40,${0.1 + 0.22 * (1 - night)}) 55%, transparent calc(100% - ${HORIZON_PX - 10}px))`
        }}
      />
    </div>
  );
};
