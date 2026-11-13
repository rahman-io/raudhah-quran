/**
 * Kota untuk jadwal sholat bila lokasi dipilih manual (atau untuk memberi nama lokasi GPS
 * terdekat). Koordinat pusat kota (derajat), zona waktu IANA.
 */

export interface City {
  name: string;
  region: string;
  lat: number;
  lng: number;
  tz: string;
}

const WIB = 'Asia/Jakarta';
const WITA = 'Asia/Makassar';
const WIT = 'Asia/Jayapura';

export const CITIES: City[] = [
  // Sumatera
  { name: 'Banda Aceh', region: 'Aceh', lat: 5.548, lng: 95.323, tz: WIB },
  { name: 'Lhokseumawe', region: 'Aceh', lat: 5.181, lng: 97.141, tz: WIB },
  { name: 'Medan', region: 'Sumatera Utara', lat: 3.595, lng: 98.672, tz: WIB },
  { name: 'Pematangsiantar', region: 'Sumatera Utara', lat: 2.960, lng: 99.068, tz: WIB },
  { name: 'Padang', region: 'Sumatera Barat', lat: -0.947, lng: 100.417, tz: WIB },
  { name: 'Bukittinggi', region: 'Sumatera Barat', lat: -0.305, lng: 100.369, tz: WIB },
  { name: 'Pekanbaru', region: 'Riau', lat: 0.507, lng: 101.448, tz: WIB },
  { name: 'Batam', region: 'Kepulauan Riau', lat: 1.130, lng: 104.053, tz: WIB },
  { name: 'Tanjung Pinang', region: 'Kepulauan Riau', lat: 0.918, lng: 104.446, tz: WIB },
  { name: 'Jambi', region: 'Jambi', lat: -1.610, lng: 103.613, tz: WIB },
  { name: 'Palembang', region: 'Sumatera Selatan', lat: -2.976, lng: 104.775, tz: WIB },
  { name: 'Pangkalpinang', region: 'Bangka Belitung', lat: -2.129, lng: 106.110, tz: WIB },
  { name: 'Bengkulu', region: 'Bengkulu', lat: -3.800, lng: 102.266, tz: WIB },
  { name: 'Bandar Lampung', region: 'Lampung', lat: -5.397, lng: 105.266, tz: WIB },
  // Jawa
  { name: 'Serang', region: 'Banten', lat: -6.120, lng: 106.150, tz: WIB },
  { name: 'Tangerang', region: 'Banten', lat: -6.178, lng: 106.630, tz: WIB },
  { name: 'Jakarta', region: 'DKI Jakarta', lat: -6.175, lng: 106.827, tz: WIB },
  { name: 'Bekasi', region: 'Jawa Barat', lat: -6.238, lng: 106.976, tz: WIB },
  { name: 'Depok', region: 'Jawa Barat', lat: -6.402, lng: 106.794, tz: WIB },
  { name: 'Bogor', region: 'Jawa Barat', lat: -6.595, lng: 106.816, tz: WIB },
  { name: 'Sukabumi', region: 'Jawa Barat', lat: -6.921, lng: 106.927, tz: WIB },
  { name: 'Bandung', region: 'Jawa Barat', lat: -6.917, lng: 107.619, tz: WIB },
  { name: 'Cirebon', region: 'Jawa Barat', lat: -6.706, lng: 108.557, tz: WIB },
  { name: 'Tasikmalaya', region: 'Jawa Barat', lat: -7.327, lng: 108.220, tz: WIB },
  { name: 'Tegal', region: 'Jawa Tengah', lat: -6.869, lng: 109.140, tz: WIB },
  { name: 'Purwokerto', region: 'Jawa Tengah', lat: -7.424, lng: 109.239, tz: WIB },
  { name: 'Semarang', region: 'Jawa Tengah', lat: -6.967, lng: 110.417, tz: WIB },
  { name: 'Magelang', region: 'Jawa Tengah', lat: -7.470, lng: 110.218, tz: WIB },
  { name: 'Surakarta (Solo)', region: 'Jawa Tengah', lat: -7.566, lng: 110.817, tz: WIB },
  { name: 'Yogyakarta', region: 'DI Yogyakarta', lat: -7.797, lng: 110.370, tz: WIB },
  { name: 'Madiun', region: 'Jawa Timur', lat: -7.630, lng: 111.523, tz: WIB },
  { name: 'Kediri', region: 'Jawa Timur', lat: -7.817, lng: 112.012, tz: WIB },
  { name: 'Malang', region: 'Jawa Timur', lat: -7.983, lng: 112.630, tz: WIB },
  { name: 'Surabaya', region: 'Jawa Timur', lat: -7.258, lng: 112.752, tz: WIB },
  { name: 'Jember', region: 'Jawa Timur', lat: -8.172, lng: 113.700, tz: WIB },
  { name: 'Banyuwangi', region: 'Jawa Timur', lat: -8.219, lng: 114.369, tz: WIB },
  // Bali & Nusa Tenggara
  { name: 'Denpasar', region: 'Bali', lat: -8.650, lng: 115.217, tz: WITA },
  { name: 'Mataram', region: 'Nusa Tenggara Barat', lat: -8.583, lng: 116.117, tz: WITA },
  { name: 'Bima', region: 'Nusa Tenggara Barat', lat: -8.460, lng: 118.727, tz: WITA },
  { name: 'Kupang', region: 'Nusa Tenggara Timur', lat: -10.178, lng: 123.607, tz: WITA },
  // Kalimantan
  { name: 'Pontianak', region: 'Kalimantan Barat', lat: -0.026, lng: 109.342, tz: WIB },
  { name: 'Palangka Raya', region: 'Kalimantan Tengah', lat: -2.210, lng: 113.920, tz: WIB },
  { name: 'Banjarmasin', region: 'Kalimantan Selatan', lat: -3.317, lng: 114.590, tz: WITA },
  { name: 'Balikpapan', region: 'Kalimantan Timur', lat: -1.265, lng: 116.831, tz: WITA },
  { name: 'Samarinda', region: 'Kalimantan Timur', lat: -0.502, lng: 117.154, tz: WITA },
  { name: 'Tarakan', region: 'Kalimantan Utara', lat: 3.300, lng: 117.633, tz: WITA },
  // Sulawesi
  { name: 'Manado', region: 'Sulawesi Utara', lat: 1.474, lng: 124.842, tz: WITA },
  { name: 'Gorontalo', region: 'Gorontalo', lat: 0.543, lng: 123.057, tz: WITA },
  { name: 'Palu', region: 'Sulawesi Tengah', lat: -0.895, lng: 119.859, tz: WITA },
  { name: 'Mamuju', region: 'Sulawesi Barat', lat: -2.677, lng: 118.886, tz: WITA },
  { name: 'Makassar', region: 'Sulawesi Selatan', lat: -5.147, lng: 119.432, tz: WITA },
  { name: 'Parepare', region: 'Sulawesi Selatan', lat: -4.013, lng: 119.624, tz: WITA },
  { name: 'Kendari', region: 'Sulawesi Tenggara', lat: -3.972, lng: 122.515, tz: WITA },
  // Maluku & Papua
  { name: 'Ambon', region: 'Maluku', lat: -3.696, lng: 128.181, tz: WIT },
  { name: 'Ternate', region: 'Maluku Utara', lat: 0.789, lng: 127.384, tz: WIT },
  { name: 'Sorong', region: 'Papua Barat Daya', lat: -0.877, lng: 131.255, tz: WIT },
  { name: 'Manokwari', region: 'Papua Barat', lat: -0.861, lng: 134.062, tz: WIT },
  { name: 'Nabire', region: 'Papua Tengah', lat: -3.367, lng: 135.483, tz: WIT },
  { name: 'Jayapura', region: 'Papua', lat: -2.533, lng: 140.717, tz: WIT },
  { name: 'Merauke', region: 'Papua Selatan', lat: -8.493, lng: 140.401, tz: WIT },
  // Luar negeri
  { name: 'Makkah', region: 'Arab Saudi', lat: 21.4225, lng: 39.8262, tz: 'Asia/Riyadh' },
  { name: 'Madinah', region: 'Arab Saudi', lat: 24.4672, lng: 39.6111, tz: 'Asia/Riyadh' },
  { name: 'Kuala Lumpur', region: 'Malaysia', lat: 3.139, lng: 101.687, tz: 'Asia/Kuala_Lumpur' },
  { name: 'Singapura', region: 'Singapura', lat: 1.290, lng: 103.852, tz: 'Asia/Singapore' },
  { name: 'Bandar Seri Begawan', region: 'Brunei', lat: 4.903, lng: 114.940, tz: 'Asia/Brunei' },
  { name: 'Kairo', region: 'Mesir', lat: 30.044, lng: 31.236, tz: 'Africa/Cairo' },
  { name: 'Istanbul', region: 'Turki', lat: 41.008, lng: 28.978, tz: 'Europe/Istanbul' },
  { name: 'Dubai', region: 'Uni Emirat Arab', lat: 25.205, lng: 55.271, tz: 'Asia/Dubai' },
  { name: 'Doha', region: 'Qatar', lat: 25.286, lng: 51.531, tz: 'Asia/Qatar' },
  { name: 'Tokyo', region: 'Jepang', lat: 35.676, lng: 139.650, tz: 'Asia/Tokyo' },
  { name: 'Seoul', region: 'Korea Selatan', lat: 37.566, lng: 126.978, tz: 'Asia/Seoul' },
  { name: 'Hong Kong', region: 'Hong Kong', lat: 22.320, lng: 114.169, tz: 'Asia/Hong_Kong' },
  { name: 'Taipei', region: 'Taiwan', lat: 25.033, lng: 121.565, tz: 'Asia/Taipei' },
  { name: 'Sydney', region: 'Australia', lat: -33.869, lng: 151.209, tz: 'Australia/Sydney' },
  { name: 'Melbourne', region: 'Australia', lat: -37.814, lng: 144.963, tz: 'Australia/Melbourne' },
  { name: 'London', region: 'Inggris', lat: 51.507, lng: -0.128, tz: 'Europe/London' },
  { name: 'Amsterdam', region: 'Belanda', lat: 52.368, lng: 4.904, tz: 'Europe/Amsterdam' },
  { name: 'Berlin', region: 'Jerman', lat: 52.520, lng: 13.405, tz: 'Europe/Berlin' },
  { name: 'Paris', region: 'Prancis', lat: 48.857, lng: 2.352, tz: 'Europe/Paris' },
  { name: 'Warsawa', region: 'Polandia', lat: 52.230, lng: 21.011, tz: 'Europe/Warsaw' },
  { name: 'New York', region: 'Amerika Serikat', lat: 40.713, lng: -74.006, tz: 'America/New_York' },
  { name: 'Los Angeles', region: 'Amerika Serikat', lat: 34.052, lng: -118.244, tz: 'America/Los_Angeles' }
];
