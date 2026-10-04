# Umra Mandiri

Website statis (HTML, CSS, JavaScript murni) untuk layanan umrah mandiri. Tidak ada build step, tidak ada dependensi, dan siap di-deploy ke GitHub dan Vercel.

Fitur: kalkulator biaya interaktif, paket siap pakai dengan halaman detail, daftar hotel Makkah dan Madinah, layanan tambahan, FAQ, tombol WhatsApp yang mengirim rencana jamaah, dan tampilan responsif untuk HP.

> **Penting:** semua harga, nama hotel, nomor WhatsApp, dan alamat di `data/packages.json` adalah **contoh**. Ganti dengan data asli Anda sebelum website dipublikasikan.

## Struktur proyek

```
umramandiri/
├── index.html            Kerangka halaman
├── assets/
│   ├── css/style.css     Gaya dan warna (token ada di blok :root)
│   ├── js/app.js         Logika kalkulator dan render konten
│   └── favicon.svg       Ikon situs
├── data/
│   └── packages.json     SEMUA konten dan harga yang bisa diedit
├── vercel.json           Konfigurasi Vercel (header keamanan, cache)
├── AI_HANDOFF.md         Konteks proyek untuk melanjutkan di AI lain
└── README.md
```

## Mengubah konten dan harga

Buka `data/packages.json`. Semua yang tampil di website dibaca dari file ini.

| Bagian | Isi |
|---|---|
| `site` | Nama brand, teks hero, nomor WhatsApp, email, alamat, jam layanan, nomor izin, langkah-langkah |
| `hotels` | Daftar hotel. `city` berisi `makkah` atau `madinah`. Harga di `pricePerPersonNight` (per orang per malam) |
| `services` | Layanan tambahan. `unit` berisi `per_person` atau `per_group` |
| `packages` | Paket siap pakai. Mengacu ke `id` hotel dan layanan di atas, harga dihitung otomatis |
| `testimonials` | Ubah `enabled` ke `true` hanya jika sudah ada testimoni asli |
| `faq` | Pertanyaan dan jawaban |

Format nomor WhatsApp: kode negara tanpa tanda plus, contoh `6281234567890`.

Mengganti warna atau font: ubah variabel di blok `:root` pada `assets/css/style.css`.

## Menjalankan di komputer

Website membaca `data/packages.json` lewat `fetch`, jadi tidak bisa dibuka dengan klik dua kali pada `index.html`. Jalankan server lokal:

```bash
# Pilihan 1: Python
python3 -m http.server 8000

# Pilihan 2: Node.js
npx serve .
```

Lalu buka `http://localhost:8000`.

## Deploy ke GitHub

1. Buat repository baru di GitHub (misalnya `umramandiri`), tanpa README awal.
2. Di folder proyek, jalankan:

```bash
git init
git add .
git commit -m "Website Umra Mandiri"
git branch -M main
git remote add origin https://github.com/USERNAME/umramandiri.git
git push -u origin main
```

Ganti `USERNAME` dengan username GitHub Anda.

## Deploy ke Vercel

1. Masuk ke [vercel.com](https://vercel.com) dengan akun GitHub.
2. Klik **Add New → Project**, lalu pilih repository `umramandiri`.
3. Pada pengaturan, biarkan **Framework Preset: Other**. Kosongkan Build Command dan Output Directory.
4. Klik **Deploy**. Setiap `git push` ke branch `main` akan otomatis memperbarui website.

Untuk memakai domain sendiri (misalnya `umramandiri.id`): buka **Project → Settings → Domains**, tambahkan domain, lalu ikuti petunjuk DNS dari Vercel.

## Daftar periksa sebelum tayang

- [ ] Ganti semua harga, nama hotel, dan layanan dengan data asli dari supplier Anda
- [ ] Ganti nomor WhatsApp, email, dan alamat
- [ ] Isi nomor izin penyelenggara di `site.license` bila ada (tampil di footer)
- [ ] Pastikan usaha Anda memenuhi perizinan dan aturan penyelenggaraan umrah yang berlaku di Indonesia
- [ ] Aktifkan testimoni hanya jika berasal dari jamaah sungguhan
- [ ] Uji di HP dan klik tombol WhatsApp
- [ ] Tambahkan foto atau logo asli milik Anda bila diperlukan
