# Firebase untuk Raudhah Quran

Integrasi ini siap dihubungkan ke proyek Firebase. Tanpa konfigurasi, aplikasi tetap memakai materi dan progres lokal seperti sebelumnya. Materi dari Firestore diperbarui langsung ketika ada perubahan; progres ditautkan ke akun Google setelah pengguna masuk lewat Pengaturan.

## 1. Buat proyek dan layanan

1. Buka [Firebase Console](https://console.firebase.google.com/), buat proyek dan tambahkan aplikasi **Web**.
2. Aktifkan **Authentication → Sign-in method → Google**. Tambahkan `rahman-io.github.io` ke **Authorized domains** untuk GitHub Pages dan `localhost` untuk pengembangan lokal. Untuk browser yang membatasi popup/redirect lintas domain, gunakan domain kustom dengan Firebase Auth yang sesuai.
3. Buat **Cloud Firestore** dalam mode production. Terapkan `firestore.rules`: `npx firebase-tools deploy --only firestore:rules --project ID_PROYEK`.
4. Jika ingin menyalin audio/gambar ke **Cloud Storage**, buat bucket Storage dan terapkan `storage.rules`: `npx firebase-tools deploy --only storage --project ID_PROYEK`. Firebase Storage saat ini memerlukan paket **Blaze** (ada kemungkinan biaya). Penggunaan Firestore tidak mengharuskan menyalin semua media.

## 2. Sambungkan aplikasi web

Salin `.env.example` menjadi `.env.local`, lalu isi `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`, dan opsional `VITE_FIREBASE_STORAGE_BUCKET` dari **Project settings → Your apps → SDK setup and configuration**. Variabel `VITE_` adalah konfigurasi aplikasi web yang terlihat di browser; keamanan data dijaga oleh Authentication dan Rules. **Jangan masukkan Gemini API key, service account JSON, atau kredensial admin ke variabel `VITE_` maupun repository.**

Untuk GitHub Pages, isi nama variabel yang sama dalam **Settings → Secrets and variables → Actions → Variables**, kemudian jalankan ulang workflow Pages. File workflow sudah meneruskan variabel tersebut ke build. Daftarkan domain yang dipakai di Firebase Authentication.

## 3. Periksa dan impor materi

Jalankan `npm install`, kemudian `npm run firebase:export:dry` untuk melihat jumlah dokumen, aset dan batas ukuran dokumen **tanpa menulis ke Firebase**. Impor materi dengan Google Application Default Credentials, misalnya setelah `gcloud auth application-default login` pada perangkat pribadi, kemudian:

```sh
FIREBASE_PROJECT_ID=ID_PROYEK npm run firebase:export
```

Perintah tersebut mengisi `surahs`, `iqroLevels/{level}/pages`, `tajwidRules`, `badges`, `plants` dan katalog `media`. Untuk **mengunggah salinan media lokal** juga, siapkan bucket Storage dan jalankan:

```sh
FIREBASE_PROJECT_ID=ID_PROYEK FIREBASE_STORAGE_BUCKET=NAMA_BUCKET npm run firebase:export -- --with-media
```

Impor hanya membaca aset audio/gambar dari folder `public/`; dataset mentah `hijaiyah_letter/`, PDF dan berkas pribadi lain tidak diunggah. Referensi audio murattal eksternal tetap berupa URL asalnya. Aplikasi menyertakan berkas lokal untuk pemakaian offline; katalog dan salinan Storage tidak menggantikan URL tersebut secara otomatis.

## Struktur dan akses

| Lokasi | Isi | Aturan akses |
| --- | --- | --- |
| `surahs/{nomor}` | Surah, ayat, kata, terjemahan, URL audio | Baca publik, tulis admin |
| `iqroLevels/{jilid}/pages/{halaman}` | Kartu dan urutan latihan | Baca publik, tulis admin |
| `tajwidRules/{id}` | Materi tajwid | Baca publik, tulis admin |
| `badges`, `plants`, `media` | Katalog pencapaian, tanaman, aset | Baca publik, tulis admin |
| `users/{uid}` | Statistik hafalan dan pengaturan | Hanya pemilik akun |
| `users/{uid}/iqroProgress/state` | Kartu dan jilid selesai | Hanya pemilik akun |
| Storage `public/**` | Salinan aset yang dipilih | Baca publik, tulis admin |

Perangkat yang belum masuk memakai localStorage. Saat pertama kali masuk, progres lama perangkat digabung dengan akun (kartu/hafalan yang sudah selesai dipertahankan); bila perangkat sebelumnya dipakai akun lain, progresnya dipisahkan. Sinkronisasi berikutnya memerlukan koneksi internet; cache Firestore membantu saat jaringan terputus.
