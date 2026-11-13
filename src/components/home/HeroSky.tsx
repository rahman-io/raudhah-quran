import React, { useEffect, useMemo, useState } from 'react';
import { Play, Square } from 'lucide-react';
import { SkyScene } from './SkyScene';
import { PHASE_LABEL, phaseAt, skyTimes } from '../../services/sky';
import { formatClock, type MethodId, type PrayerKey } from '../../services/prayerTimes';

/** Lama pratinjau 24 jam. */
const PREVIEW_MS = 20000;

/**
 * Latar langit Beranda beserta tombol pratinjau: memutar perjalanan 24 jam dalam ±20 detik
 * agar semua keadaan (Tahajud sampai Isya) bisa dilihat tanpa menunggu.
 */
export const HeroSky: React.FC<{
  lat: number;
  lng: number;
  tz: string;
  now: Date;
  method: MethodId;
  offsets: Record<PrayerKey, number>;
}> = ({ lat, lng, tz, now, method, offsets }) => {
  const [preview, setPreview] = useState<{ start: number; base: number } | null>(null);
  const [simNow, setSimNow] = useState<Date | null>(null);

  useEffect(() => {
    if (!preview) return;
    const timer = window.setInterval(() => {
      const p = (performance.now() - preview.start) / PREVIEW_MS;
      if (p >= 1) {
        setPreview(null);
        setSimNow(null);
      } else setSimNow(new Date(preview.base + p * 86400000));
    }, 50);
    return () => window.clearInterval(timer);
  }, [preview]);

  const sceneNow = simNow ?? now;
  const hourKey = Math.floor(sceneNow.getTime() / 600000);
  const times = useMemo(() => skyTimes(lat, lng, tz, sceneNow, method, offsets), [lat, lng, tz, hourKey, method, offsets]); // eslint-disable-line react-hooks/exhaustive-deps
  const phase = phaseAt(times, sceneNow);

  return (
    <>
      <SkyScene lat={lat} lng={lng} now={sceneNow} smooth={!simNow} />
      <div className="absolute right-3 bottom-[4.6rem] z-10 flex items-center gap-2">
        {simNow && (
          <span className="px-2.5 py-1 rounded-full bg-black/35 backdrop-blur text-[11px] font-semibold text-white tabular-nums">
            {formatClock(simNow, tz)} · {PHASE_LABEL[phase]}
          </span>
        )}
        <button
          type="button"
          onClick={() => (preview ? (setPreview(null), setSimNow(null)) : setPreview({ start: performance.now(), base: now.getTime() }))}
          className="w-8 h-8 rounded-full bg-black/25 hover:bg-black/35 backdrop-blur ring-1 ring-white/20 flex items-center justify-center text-white"
          aria-label={preview ? 'Hentikan pratinjau langit' : 'Pratinjau langit 24 jam'}
          title={preview ? 'Hentikan pratinjau' : 'Pratinjau langit 24 jam'}
        >
          {preview ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
        </button>
      </div>
    </>
  );
};
