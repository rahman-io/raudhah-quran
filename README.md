# 🌿 Raudhah Qur'an - Gamifikasi Tahfidz & Tadabbur 2D

Aplikasi web interaktif, modern, indah, dan menenangkan (**Cozy Aesthetic**) yang dirancang untuk membantu anak-anak, remaja, dewasa, hingga lansia agar mudah, nyaman, dan istiqomah menghafal, membaca, dan memahami Al-Qur'an.

Dibuat menggunakan **React + TypeScript + Vite + Tailwind CSS**, siap langsung di-deploy ke **Cloudflare Pages** melalui GitHub.

---

## ✨ Fitur-Fitur Unggulan

### 1. 🐣 Sistem Mode Pengguna Adaptif (Adaptive Age Modes)
- **Mode Ceria (Untuk Anak & Remaja):**
  - Maskot 2D burung **Hud-hud** (animasi interaktif dengan mahkota bergerak, kepakan sayap, dan dialog motivasi).
  - Sistem poin XP, kenaikan Level (*Thalibul 'Ilm*, *Bintang Qur'an*, *Penjaga Ayat*, hingga *Mahkota Kemuliaan*).
  - Efek konfeti gembira dan reward lencana (*Badges*).
- **Mode Sakinah (Untuk Dewasa & Lansia):**
  - Antarmuka minimalis, bebas distraksi dengan palet sage green, warm cream, dan deep teal yang menyejukkan mata.
  - Teks Arab ekstra besar yang dapat diatur ukurannya (*Resizable Typography* 24px - 44px).
  - Visual **Lentera Cahaya** (*Lentera Sakinah*) yang berpendar tenang dengan renungan ayat harian.

### 2. 🎮 Enam Game Interaktif Menghafal & Tadabbur
- **Game 1: Susun Ayat (Word Puzzle):** Ayat dipecah menjadi kepingan kata acak. Pengguna mengklik kata Arab sesuai urutan ayat yang tepat dari kanan ke kiri. Dilengkapi tombol petunjuk (*hint*) dan pembatalan (*undo*).
- **Game 2: Tebak Lanjutan (Blank Fill):** Murottal diputar dan ditampilkan ayat dengan kekosongan `[ ... ? ... ]`. Pengguna memilih satu dari 3 pilihan kata yang tepat dengan bantuan petunjuk arti.
- **Game 3: Ayat Menghilang (The Vanishing Ayah):** Latihan hafalan 3 tahap (100% tampak -> 50% tersamar -> 0% mandiri) dengan tombol intip/verifikasi (*reveal*) dan evaluasi mandiri (*Mutqin*).
- **Game 4: Sambung Ayat dari Audio (Audio Next Ayah):** Mendengarkan potongan lantunan ayat pembuka, lalu memilih ayat sambungan yang tepat dengan verifikasi audio.
- **Game 5: Kartu Pasangan Tadabbur (Memory Match):** Membuka kartu 2D dan mencocokkan pasangan kata Arab dengan terjemahan bahasa Indonesianya.
- **Game 6: Kuis Tajwid & Harakat:** Menguji pemahaman hukum bacaan tajwid (*Al-Qamariyah/Syamsiyah*, *Qalqalah*, *Ghunnah*, *Ikhfa*, dll.) dengan tombol cepat belajar materi tajwid langsung di dalam kuis.

### 3. 📚 Modul Lengkap Belajar Tajwid Al-Qur'an
- **Kamus & Kurikulum Tajwid Interaktif:**
  - **Hukum Alif Lam (ال):** *Alif Lam Qamariyah* (14 huruf) & *Alif Lam Syamsiyah* (14 huruf).
  - **Hukum Nun Sukun (نْ) & Tanwin:** *Izhar Halqi*, *Idgham Bighunnah*, *Idgham Bilaghunnah*, *Iqlab*, dan *Ikhfa Haqiqi*.
  - **Hukum Qalqalah:** *Qalqalah Sughra* (ringan) & *Qalqalah Kubra* (kuat di akhir waqaf).
  - **Hukum Ghunnah Musyaddadah:** Dengung 2-3 harakat pada Nun (نّ) dan Mim (مّ) bertasydid.
  - **Hukum Mim Sukun (مْ):** *Ikhfa Syafawi*, *Idgham Mimi*, dan *Izhar Syafawi*.
  - **Hukum Mad Dasar & Cabang:** *Mad Thabi'i*, *Mad Wajib Muttashil*, *Mad Jaiz Munfashil*, dan *Mad 'Aridh Lissukun*.
- **Pencarian & Filter Cepat:** Temukan hukum bacaan berdasarkan nama hukum atau huruf hijaiyah.
- **Contoh Ayat dari Juz 30:** Setiap kaidah disertai contoh nyata ayat berserta penjelasan makhraj dan cara melafalkannya.

### 4. 📖 Tadabbur & Paham Kata (Word-by-Word Meaning)
- Klik pada kata Arab mana pun untuk memunculkan modal pop-up:
  - Pelafalan & transliterasi latin.
  - Terjemahan bahasa Indonesia perkata.
  - Klasifikasi tata bahasa Arab (Isim / Fi'il / Harf).
  - Akar kata (*jadzr al-kalimah*).
  - Hikmah & amalan praktis harian.

### 4. 🌸 Gamifikasi & Habit Building
- **Penghitung Hari Istiqomah (Daily Streak):** Melacak kehadiran muraja'ah secara otomatis di LocalStorage.
- **Visualizer Taman Surga (Raudhah):** Kanvas 2D yang menumbuhkan pohon kurma, tunas zaitun berkah, bunga melati telaga, dan delima surga seiring bertambahnya hafalan.
- **Audio Chime Alami:** Efek suara mikro menenangkan menggunakan Web Audio API murni (tanpa ketergantungan file eksternal) dan murottal per ayat oleh Syaikh Misyari Rasyid Al-Afasy.

---

## 🛠️ Tech Stack
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 (Cozy Sage, Cream, Deep Teal, Soft Gold)
- **Animasi:** Motion (Framer Motion) & Canvas Confetti
- **Typography:** Google Fonts *Amiri*, *Scheherazade New*, dan *Plus Jakarta Sans*
- **Icons:** Lucide React
- **Storage:** LocalStorage (Persistensi instan tanpa butuh database di awal)
- **Deployment:** Cloudflare Pages (dengan routing SPA `_redirects`)

---

## 🚀 Panduan Instalasi Lokal

### 1. Clone Repositori
```bash
git clone https://github.com/username-anda/raudhah-quran.git
cd raudhah-quran
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Jalankan Development Server
```bash
npm run dev
```
Buka browser pada `http://localhost:3000` (atau port yang ditampilkan di terminal).

### 4. Build untuk Production
```bash
npm run build
```
File hasil kompilasi statis akan berada di dalam folder `dist/`.

---

## ☁️ Panduan Deploy ke Cloudflare Pages (1 Klik)

Aplikasi ini sudah dilengkapi dengan file `public/_redirects` (`/* /index.html 200`) untuk mencegah error 404 saat pengguna me-refresh halaman di Cloudflare Pages.

### Langkah-langkah Deploy:
1. **Push ke GitHub**:
   ```bash
   git add .
   git commit -m "feat: initial commit Raudhah Quran"
   git branch -M main
   git remote add origin https://github.com/username-anda/raudhah-quran.git
   git push -u origin main
   ```

2. **Buka Dashboard Cloudflare**:
   - Masuk ke [Cloudflare Dashboard](https://dash.cloudflare.com/).
   - Pilih menu **Workers & Pages** -> **Create application** -> Tab **Pages** -> **Connect to Git**.
   - Pilih repositori GitHub Anda.

3. **Konfigurasi Build Settings**:
   - **Framework preset:** `Vite` (atau `None`)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** *(biarkan kosong atau `/`)*

4. **Klik "Save and Deploy"**:
   Cloudflare Pages akan melakukan build dan mempublikasikan web app Anda secara global dalam hitungan detik dengan SSL otomatis!

---

## 📜 Lisensi
Aplikasi ini bersifat sumber terbuka di bawah lisensi Apache-2.0. Semoga menjadi amal jariyah bagi para pengembang dan seluruh kaum muslimin yang memanfaatkannya.
