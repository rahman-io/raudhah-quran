/**
 * Deklinasi magnetik (selisih Utara magnetik dan Utara sejati) dengan World Magnetic Model 2025
 * (NOAA NCEI & British Geological Survey, data domain publik), berlaku 2025.0–2030.0.
 *
 * Sensor kompas HP menunjuk Utara magnetik; Utara sejati = Utara magnetik + deklinasi
 * (positif ke timur). Perhitungan di bawah mengikuti algoritma resmi WMM (harmonik bola
 * derajat 12, fungsi Legendre Schmidt semi-normalisasi), cukup untuk komponen horizontal.
 */

const EPOCH = 2025.0;
const N_MAX = 12;

/** g, h, dg/dt, dh/dt (nT, nT/tahun) untuk n = 1..12, m = 0..n. */
// prettier-ignore
const COEFFS = [
  [-29351.8, 0, 12, 0],
  [-1410.8, 4545.4, 9.7, -21.5],
  [-2556.6, 0, -11.6, 0],
  [2951.1, -3133.6, -5.2, -27.7],
  [1649.3, -815.1, -8, -12.1],
  [1361, 0, -1.3, 0],
  [-2404.1, -56.6, -4.2, 4],
  [1243.8, 237.5, 0.4, -0.3],
  [453.6, -549.5, -15.6, -4.1],
  [895, 0, -1.6, 0],
  [799.5, 278.6, -2.4, -1.1],
  [55.7, -133.9, -6, 4.1],
  [-281.1, 212, 5.6, 1.6],
  [12.1, -375.6, -7, -4.4],
  [-233.2, 0, 0.6, 0],
  [368.9, 45.4, 1.4, -0.5],
  [187.2, 220.2, 0, 2.2],
  [-138.7, -122.9, 0.6, 0.4],
  [-142, 43, 2.2, 1.7],
  [20.9, 106.1, 0.9, 1.9],
  [64.4, 0, -0.2, 0],
  [63.8, -18.4, -0.4, 0.3],
  [76.9, 16.8, 0.9, -1.6],
  [-115.7, 48.8, 1.2, -0.4],
  [-40.9, -59.8, -0.9, 0.9],
  [14.9, 10.9, 0.3, 0.7],
  [-60.7, 72.7, 0.9, 0.9],
  [79.5, 0, 0, 0],
  [-77, -48.9, -0.1, 0.6],
  [-8.8, -14.4, -0.1, 0.5],
  [59.3, -1, 0.5, -0.8],
  [15.8, 23.4, -0.1, 0],
  [2.5, -7.4, -0.8, -1],
  [-11.1, -25.1, -0.8, 0.6],
  [14.2, -2.3, 0.8, -0.2],
  [23.2, 0, -0.1, 0],
  [10.8, 7.1, 0.2, -0.2],
  [-17.5, -12.6, 0, 0.5],
  [2, 11.4, 0.5, -0.4],
  [-21.7, -9.7, -0.1, 0.4],
  [16.9, 12.7, 0.3, -0.5],
  [15, 0.7, 0.2, -0.6],
  [-16.8, -5.2, 0, 0.3],
  [0.9, 3.9, 0.2, 0.2],
  [4.6, 0, 0, 0],
  [7.8, -24.8, -0.1, -0.3],
  [3, 12.2, 0.1, 0.3],
  [-0.2, 8.3, 0.3, -0.3],
  [-2.5, -3.3, -0.3, 0.3],
  [-13.1, -5.2, 0, 0.2],
  [2.4, 7.2, 0.3, -0.1],
  [8.6, -0.6, -0.1, -0.2],
  [-8.7, 0.8, 0.1, 0.4],
  [-12.9, 10, -0.1, 0.1],
  [-1.3, 0, 0.1, 0],
  [-6.4, 3.3, 0, 0],
  [0.2, 0, 0.1, 0],
  [2, 2.4, 0.1, -0.2],
  [-1, 5.3, 0, 0.1],
  [-0.6, -9.1, -0.3, -0.1],
  [-0.9, 0.4, 0, 0.1],
  [1.5, -4.2, -0.1, 0],
  [0.9, -3.8, -0.1, -0.1],
  [-2.7, 0.9, 0, 0.2],
  [-3.9, -9.1, 0, 0],
  [2.9, 0, 0, 0],
  [-1.5, 0, 0, 0],
  [-2.5, 2.9, 0, 0.1],
  [2.4, -0.6, 0, 0],
  [-0.6, 0.2, 0, 0.1],
  [-0.1, 0.5, -0.1, 0],
  [-0.6, -0.3, 0, 0],
  [-0.1, -1.2, 0, 0.1],
  [1.1, -1.7, -0.1, 0],
  [-1, -2.9, -0.1, 0],
  [-0.2, -1.8, -0.1, 0],
  [2.6, -2.3, -0.1, 0],
  [-2, 0, 0, 0],
  [-0.2, -1.3, 0, 0],
  [0.3, 0.7, 0, 0],
  [1.2, 1, 0, -0.1],
  [-1.3, -1.4, 0, 0.1],
  [0.6, 0, 0, 0],
  [0.6, 0.6, 0.1, 0],
  [0.5, -0.1, 0, 0],
  [-0.1, 0.8, 0, 0],
  [-0.4, 0.1, 0, 0],
  [-0.2, -1, -0.1, 0],
  [-1.3, 0.1, 0, 0],
  [-0.7, 0.2, -0.1, -0.1]
];

/** Deklinasi magnetik dalam derajat (positif = timur) di permukaan bumi. */
export function magneticDeclination(latDeg: number, lonDeg: number, date: Date = new Date()): number {
  const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 1);
  const yearLength = Date.UTC(date.getUTCFullYear() + 1, 0, 1) - startOfYear;
  const year = date.getUTCFullYear() + (date.getTime() - startOfYear) / yearLength;
  const dt = Math.min(5, Math.max(0, year - EPOCH));

  // Koordinat geodetik (WGS84) ke geosentris bola, ketinggian 0 km.
  const a = 6378.137;
  const b = 6356.7523142;
  const re = 6371.2;
  const a2 = a * a;
  const b2 = b * b;
  const c2 = a2 - b2;
  const a4 = a2 * a2;
  const b4 = b2 * b2;
  const c4 = a4 - b4;
  const rlat = (Math.max(-89.999, Math.min(89.999, latDeg)) * Math.PI) / 180;
  const rlon = (lonDeg * Math.PI) / 180;
  const srlat = Math.sin(rlat);
  const crlat = Math.cos(rlat);
  const srlat2 = srlat * srlat;
  const crlat2 = crlat * crlat;
  const q = Math.sqrt(a2 - c2 * srlat2);
  const q2 = (a2 / b2) ** 2;
  const ct = srlat / Math.sqrt(q2 * crlat2 + srlat2);
  const st = Math.sqrt(1 - ct * ct);
  const r = Math.sqrt((a4 - c4 * srlat2) / (q * q));
  const d = Math.sqrt(a2 * crlat2 + b2 * srlat2);
  const ca = d / r;
  const sa = (c2 * crlat * srlat) / (r * d);

  const sp: number[] = [0, Math.sin(rlon)];
  const cp: number[] = [1, Math.cos(rlon)];
  for (let m = 2; m <= N_MAX; m += 1) {
    sp[m] = sp[1] * cp[m - 1] + cp[1] * sp[m - 1];
    cp[m] = cp[1] * cp[m - 1] - sp[1] * sp[m - 1];
  }

  // Fungsi Legendre (tidak dinormalisasi) dan turunannya terhadap colatitude, lalu faktor Schmidt.
  const size = N_MAX + 1;
  const p = Array.from({ length: size }, () => new Array<number>(size).fill(0));
  const dp = Array.from({ length: size }, () => new Array<number>(size).fill(0));
  const snorm = Array.from({ length: size }, () => new Array<number>(size).fill(0));
  p[0][0] = 1;
  snorm[0][0] = 1;
  let bt = 0;
  let br = 0;
  let bp = 0;
  let bpp = 0;
  const ar = re / r;
  let arn = ar * ar;
  let k = 0;
  for (let n = 1; n <= N_MAX; n += 1) {
    arn *= ar;
    snorm[n][0] = (snorm[n - 1][0] * (2 * n - 1)) / n;
    for (let m = 0; m <= n; m += 1) {
      if (m > 0) snorm[n][m] = snorm[n][m - 1] * Math.sqrt(((n - m + 1) * (m === 1 ? 2 : 1)) / (n + m));
      if (n === m) {
        p[n][m] = st * p[n - 1][m - 1];
        dp[n][m] = st * dp[n - 1][m - 1] + ct * p[n - 1][m - 1];
      } else if (n === 1) {
        p[n][m] = ct * p[n - 1][m];
        dp[n][m] = ct * dp[n - 1][m] - st * p[n - 1][m];
      } else {
        const kk = ((n - 1) * (n - 1) - m * m) / ((2 * n - 1) * (2 * n - 3));
        const p2 = m > n - 2 ? 0 : p[n - 2][m];
        const dp2 = m > n - 2 ? 0 : dp[n - 2][m];
        p[n][m] = ct * p[n - 1][m] - kk * p2;
        dp[n][m] = ct * dp[n - 1][m] - st * p[n - 1][m] - kk * dp2;
      }
      const [g0, h0, dg, dh] = COEFFS[k];
      k += 1;
      const g = (g0 + dt * dg) * snorm[n][m];
      const h = (h0 + dt * dh) * snorm[n][m];
      const t1 = g * cp[m] + h * sp[m];
      const t2 = g * sp[m] - h * cp[m];
      bt -= arn * t1 * dp[n][m];
      br += (n + 1) * t1 * arn * p[n][m];
      bp += m * t2 * arn * p[n][m];
      // Dekat kutub (st ≈ 0): pakai bentuk khusus.
      if (st === 0 && m === 1) bpp += arn * t2;
    }
  }
  if (st !== 0) bp /= st;
  else bp = bpp;
  // Komponen geosentris ke geodetik: hanya X (utara) dan Y (timur) yang dibutuhkan.
  const bx = -bt * ca - br * sa;
  const by = bp;
  return (Math.atan2(by, bx) * 180) / Math.PI;
}
