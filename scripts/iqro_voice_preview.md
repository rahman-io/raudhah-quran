# Penilaian suara Iqro (lokal)

Generator menyiapkan **168 kandidat**: 28 huruf sesuai urutan Iqro 1, tiga
harakat (nomor 1 = Fathah, 2 = Kasrah, 3 = Dammah), masing-masing pendek
(1 harakat) dan panjang (2 harakat dengan huruf mad). Ini termasuk beberapa
kombinasi yang jarang dipakai sebagai suku kata berdiri sendiri; semua hasil
harus didengar sebelum dipilih untuk kartu yang sesuai. Model yang digunakan
adalah `gemini-3.8-flash-lite-tts` dengan suara Orus.

1. Buat kunci di [Google AI Studio](https://aistudio.google.com/apikey). Pastikan
   **proyek kunci berada di free tier** dan cek kuota yang aktif di AI Studio.
   Skrip tidak bisa memaksa kunci proyek berbayar menjadi gratis.
2. Di Terminal **zsh**, pada folder proyek, jalankan:

   ```zsh
   read -s "GEMINI_API_KEY?Kunci Gemini API: "
   echo
   export GEMINI_API_KEY
   npm run iqro:voice-preview
   unset GEMINI_API_KEY
   ```

   Sekali jalan hanya membuat **maksimal 12** audio baru. Ulangi perintah
   `npm run iqro:voice-preview` sebelum menjalankan `unset GEMINI_API_KEY`
   sampai lengkap, atau masukkan kunci lagi pada sesi Terminal berikutnya.
   Untuk membuat hingga 24 per jalan: `npm run iqro:voice-preview -- --limit 24`.
   Jika kuota habis, tunggu kuota pulih; jalankan lagi untuk melanjutkan.
   Audio lama dilewati dan tidak ditimpa.
3. Buka `preview/iqro-ai/index.html` di browser untuk memutar dan menilai
   tiap suara; gunakan filter harakat/panjang. Klik **Unduh hasil penilaian CSV**
   sebelum menutup atau memuat ulang halaman karena penilaian tidak disimpan
   otomatis. `preview/iqro-ai/manifest.json` memetakan 168 nama file ke huruf
   Arab, harakat, dan panjangnya. Kedua file dapat dibuat tanpa kunci melalui
   `npm run iqro:voice-preview -- --index-only`.

Hasil disimpan hanya di `preview/iqro-ai/`, folder yang diabaikan Git. Kunci
tetap di komputer, tidak berada di halaman penilaian atau GitHub Pages; jangan
kirim kunci kepada siapa pun. Free tier mempunyai kuota, dan proyek berbayar
bisa terkena biaya. AI tidak menjamin makhraj atau durasi yang tepat: periksa
semua audio dengan pengajar sebelum ada yang diterapkan ke Iqro.
