# AI_HANDOFF.md — Konteks proyek Umra Mandiri

Salin seluruh isi file ini ke AI lain (atau sertakan di awal sesi baru) agar bisa melanjutkan pekerjaan tanpa kehilangan konteks.

## Ringkasan proyek

- **Brand:** Umra Mandiri (domain rencana: umramandiri.id)
- **Jenis:** website statis untuk layanan umrah mandiri, berbahasa Indonesia
- **Pemilik:** pengguna berbahasa Indonesia, ingin deploy ke **GitHub + Vercel**
- **Teknologi:** HTML, CSS, JavaScript murni. Tanpa framework, tanpa build step, tanpa dependensi
- **Pilihan pengguna:** versi HTML statis (bukan Next.js). Bisa dimigrasikan ke Next.js nanti bila perlu

## Latar belakang keputusan

Pengguna awalnya meminta menyalin website langkahtemu.id (termasuk data dan harga hotel) lalu mengganti brand. Itu **tidak dilakukan**, karena desain, teks, dan data situs lain dilindungi hak cipta, dan harga hotel/paket yang disalin tidak mencerminkan kontrak supplier pengguna. Disepakati: membuat website **orisinal** dengan fungsi serupa, dengan data harga yang diisi sendiri oleh pengguna.

**Aturan untuk AI yang melanjutkan:** jangan menyalin teks, gambar, kode, atau data harga dari website pihak lain. Semua konten harus orisinal atau berasal dari pengguna.

## Struktur file

```
index.html            Kerangka halaman; konten diisi oleh JS
assets/css/style.css  Gaya; token warna dan font di blok :root
assets/js/app.js      Kalkulator, render paket/hotel/layanan/FAQ, dialog detail paket
assets/favicon.svg
data/packages.json    Sumber tunggal konten dan harga
vercel.json           Header keamanan dan cache
README.md             Panduan edit, jalankan lokal, deploy
```

## Skema data (data/packages.json)

- `site`: brand, tagline, heroTitle, heroText, heroPoints[], whatsapp (format 628xxx tanpa +), email, address, serviceHours, instagram, license, steps[{title,text}], defaultQuotePax
- `hotels[]`: id, city (`makkah`|`madinah`), name, stars, distance, facilities[], pricePerPersonNight
- `services[]`: id, name, description, price, unit (`per_person`|`per_group`), defaultOn
- `packages[]`: id, name, tagline, days, hotelMakkah (id), nightsMakkah, hotelMadinah (id), nightsMadinah, services[] (id), discountPerPerson, popular, highlights[], itinerary[{day,title}], notes
- `testimonials`: enabled (bool), items[{name,city,text}] — default `false`, jangan diaktifkan tanpa testimoni asli
- `faq[]`: q, a

Rumus harga: `hotel = harga/orang/malam × malam × jumlah jamaah`. Layanan `per_person` dikali jumlah jamaah, `per_group` dihitung sekali. Harga paket per orang dihitung dengan asumsi `defaultQuotePax` jamaah, dikurangi `discountPerPerson`.

## Desain

- Palet: kabut pagi `#EEF3F6`, biru tinta `#12263A`, teal `#0B6E7F`, emas `#E2B04A` (hemat), malam `#102A43`
- Font: Bricolage Grotesque (judul) dan Plus Jakarta Sans (isi), dari Google Fonts dengan fallback sistem
- Elemen utama: kalkulator biaya di hero. Elemen lain sengaja dibuat tenang
- Aksesibilitas: fokus keyboard terlihat, `prefers-reduced-motion` dihormati, tab hotel bisa dioperasikan dengan panah kiri/kanan, dialog memakai elemen `<dialog>`
- Konten dirender dengan `textContent`/DOM API (bukan `innerHTML`), jadi aman dari injeksi lewat file data

## Status saat ini

Selesai dan sudah diuji di browser headless (desktop dan mobile): kalkulator, paket + dialog detail (bisa dibuka lewat `#paket-<id>`), tab hotel, layanan, FAQ, kontak WhatsApp, responsif.

Data masih **contoh** dan harus diganti oleh pengguna.

## Yang belum dikerjakan (ide lanjutan)

- Mengganti harga, nama hotel, kontak dengan data asli
- Menambah foto/logo asli milik pengguna
- Halaman tambahan: Syarat & Ketentuan, Kebijakan Privasi
- Meta SEO lebih lengkap (sitemap.xml, robots.txt, gambar og:image)
- Analytics (misalnya Vercel Analytics) dan pelacakan klik WhatsApp
- Form pendaftaran/lead (butuh backend atau layanan form seperti Formspree)
- Versi bahasa Inggris atau Arab
- Migrasi ke Next.js bila dibutuhkan CMS atau banyak halaman

## Contoh prompt untuk melanjutkan di AI lain

> Saya punya proyek website statis "Umra Mandiri" (lihat AI_HANDOFF.md dan README.md terlampir). Semua konten ada di `data/packages.json`. Tolong [tambahkan halaman Syarat & Ketentuan / ubah warna menjadi ... / tambah foto hotel ...]. Jangan menyalin konten dari website lain, dan pertahankan struktur data yang ada.

## Catatan kepatuhan

Usaha penyelenggaraan umrah di Indonesia memiliki persyaratan perizinan dan aturan yang berlaku. Pengguna bertanggung jawab memastikan kepatuhan tersebut. Kolom `site.license` tersedia untuk menampilkan nomor izin di footer.
