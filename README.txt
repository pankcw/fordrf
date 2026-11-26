GOOD NIGHT, SAYANG - petunjuk singkat

1. LAGU
   Taruh file lagu milikmu (yang sah) dengan nama persis:
   assets/music/separuh-aku.mp3
   Selama file belum ada, website menampilkan keterangan dan tombol play dinonaktifkan.

2. LIRIK
   Buka lyrics-data.js, lalu tempel lirik + timestamp (format
   [mm:ss.xx]Teks  lalu baris <kata:mulai:selesai|...>) di antara tanda backtick.
   Sinkronisasi per baris dan per kata berjalan otomatis mengikuti waktu audio.

3. FOTO
   Taruh 3 foto di assets/photos/ dengan nama foto-1.jpg, foto-2.jpg, foto-3.jpg.
   Ubah teks keterangan di index.html (tag <figcaption>).

4. UJI DI KOMPUTER
   Klik dua kali index.html, atau jalankan:  python3 -m http.server

5. DEPLOY KE GITHUB PAGES
   - Buat repository baru di GitHub, upload semua isi folder ini
     (termasuk folder assets).
   - Settings > Pages > Source: "Deploy from a branch", pilih branch main dan folder /(root).
   - Tunggu 1-2 menit, alamatnya: https://USERNAME.github.io/NAMA-REPO/
