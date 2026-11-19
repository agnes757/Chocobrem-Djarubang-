# Chocobrem Djarubang — Website MPA

Buka `index.html` langsung di browser (tanpa server). Semua halaman adalah file HTML terpisah.

- `css/style.css` — design system & seluruh halaman. `css/hero.css` — desain hero asli (hanya di-scope ke `.hero`).
- `js/script.js` — katalog, keranjang (LocalStorage), checkout → WhatsApp, FAQ, lightbox. `js/hero.js` + `js/hero-assets.js` — animasi maskot asli.
- Harga/produk: ubah di array `PRODUCTS` pada `js/script.js` (satu-satunya sumber harga).
- Foto yang belum ada: `assets/box-isi6-tertutup.jpg`, `assets/semua-varian.jpg`, `assets/ulasan-5.jpeg`.
  Setelah ada, ubah `image`/`gallery` kotak hadiah di `PRODUCTS`, lalu tambahkan ulasan di `testimoni.html`.

## Lelehan cokelat (transisi menu)
- Klik menu navigasi → cokelat meleleh turun dari atas (bentuk drip sama dengan `assets/hero-drip.svg`) + suara `assets/lelehan-coklat.mp3`, lalu pindah halaman; di halaman tujuan lelehan mencair hilang.
- File: `js/melt.js`, bagian "LELEHAN COKELAT" di akhir `css/style.css`, markup `.melt` di tiap HTML. Otomatis nonaktif jika perangkat memakai "reduce motion".
- Maskot berjalan (`assets/djarubang-jalan.png`, hanya maskotnya tanpa latar) muncul setelah lelehan menutup layar dan berjalan dari kanan ke kiri; pindah halaman terjadi setelah maskot lewat (±2,65 detik, atur di `js/melt.js` dan `.melt-go .melt-walker` di CSS).
