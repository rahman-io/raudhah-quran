/**
 * Geometri efek lipatan kertas ("page curl") untuk Mode Mushaf.
 *
 * Titik yang dipegang A (di tepi kiri halaman, sisi yang bebas; punggung mushaf ada di kanan)
 * dibawa jari ke P. Garis lipat adalah garis sumbu A–P: bagian halaman di sisi A terangkat dan
 * tercermin melewati garis lipat (memperlihatkan punggung kertas), sedangkan halaman di bawahnya
 * terlihat di tempat bagian yang terangkat. Semua dihitung 2D (clip-path + matriks cermin),
 * jadi ringan dan mulus di ponsel.
 */

export interface Point {
  x: number;
  y: number;
}

/** Potong poligon dengan setengah-bidang f(X) >= 0 (Sutherland–Hodgman). */
function clipPolygon(points: Point[], f: (p: Point) => number): Point[] {
  const out: Point[] = [];
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const fa = f(a);
    const fb = f(b);
    if (fa >= 0) out.push(a);
    if ((fa >= 0) !== (fb >= 0)) {
      const t = fa / (fa - fb);
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
  }
  return out;
}

const polygonCss = (points: Point[]) =>
  points.length < 3 ? 'polygon(0 0, 0 0, 0 0)' : `polygon(${points.map((p) => `${p.x.toFixed(1)}px ${p.y.toFixed(1)}px`).join(', ')})`;

/** Sudut CSS linear-gradient untuk arah vektor g, dan posisi (px) sebuah titik di garis gradien. */
function gradientFrame(g: Point, width: number, height: number) {
  const angle = (Math.atan2(g.x, -g.y) * 180) / Math.PI;
  const length = Math.abs(width * g.x) + Math.abs(height * g.y);
  const center = { x: width / 2, y: height / 2 };
  const at = (p: Point) => (p.x - center.x) * g.x + (p.y - center.y) * g.y + length / 2;
  return { angle, at };
}

export interface CurlStyles {
  /** clip-path halaman atas (bagian yang belum terangkat). */
  front: string;
  /** clip-path & transform lipatan (punggung kertas), dalam koordinat halaman. */
  flapClip: string;
  flapTransform: string;
  flapBackground: string;
  /** Bayangan lipatan yang jatuh di halaman bawah. */
  underShade: string;
  /** 0–1: seberapa jauh halaman sudah terbuka (untuk bayangan & keputusan selesai). */
  progress: number;
}

export function curlStyles(a: Point, p: Point, width: number, height: number): CurlStyles | null {
  const vx = a.x - p.x;
  const vy = a.y - p.y;
  const len = Math.hypot(vx, vy);
  if (len < 0.5) return null;
  const n = { x: vx / len, y: vy / len }; // normal garis lipat, menunjuk ke sisi A (bagian terangkat)
  const m = { x: (a.x + p.x) / 2, y: (a.y + p.y) / 2 };
  const side = (q: Point) => (q.x - m.x) * n.x + (q.y - m.y) * n.y;
  const rect = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height }
  ];
  const front = clipPolygon(rect, (q) => -side(q));
  const lifted = clipPolygon(rect, side);

  // Cermin terhadap garis lipat: X' = R·X + t, R = I − 2nnᵀ, t = 2(m·n)n.
  const r00 = 1 - 2 * n.x * n.x;
  const r01 = -2 * n.x * n.y;
  const r11 = 1 - 2 * n.y * n.y;
  const d = m.x * n.x + m.y * n.y;
  const tx = 2 * d * n.x;
  const ty = 2 * d * n.y;

  // Jarak terjauh bagian terangkat dari garis lipat (lebar lipatan).
  const depth = Math.max(1, ...lifted.map(side));
  const { angle, at } = gradientFrame(n, width, height);
  const fold = at(m);
  const flapBackground =
    `linear-gradient(${angle.toFixed(1)}deg, ` +
    `rgba(0,0,0,0.22) ${(fold).toFixed(1)}px, ` +
    `rgba(255,255,255,0.35) ${(fold + Math.min(28, depth * 0.25)).toFixed(1)}px, ` +
    `rgba(255,255,255,0.08) ${(fold + depth * 0.6).toFixed(1)}px, ` +
    `rgba(0,0,0,0.12) ${(fold + depth).toFixed(1)}px), ` +
    'linear-gradient(135deg, #FBF6E9, #EFE3C6)';

  const shadowReach = Math.min(70, 18 + depth * 0.35);
  const underShade =
    `linear-gradient(${angle.toFixed(1)}deg, transparent ${(fold - 1).toFixed(1)}px, ` +
    `rgba(15,30,36,0.42) ${fold.toFixed(1)}px, rgba(15,30,36,0) ${(fold + shadowReach).toFixed(1)}px)`;

  const progress = Math.min(1, Math.max(0, (p.x - a.x) / (2 * width)));
  return {
    front: polygonCss(front),
    flapClip: polygonCss(lifted),
    flapTransform: `matrix(${r00}, ${r01}, ${r01}, ${r11}, ${tx}, ${ty})`,
    flapBackground,
    underShade,
    progress
  };
}

/** Titik pegangan: dekat sudut bawah/atas → sudut itu, selain itu tepi kiri setinggi jari. */
export function grabPoint(y: number, height: number): Point {
  if (y > height * 0.72) return { x: 0, y: height };
  if (y < height * 0.18) return { x: 0, y: 0 };
  return { x: 0, y };
}
