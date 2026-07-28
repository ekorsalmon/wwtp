# WWTP P1 Monitoring — Fase 1 + Fase 2

Aplikasi web pengganti sheet Excel WWTP P1.

**Fase 1:**
- Login dengan 3 role: **operator**, **lab**, **atasan**
- Form input data harian (pH, suhu, COD, DO, TSS, amoniak, nitrat, nitrit, BOD — inlet/outlet)
- Dashboard: status sesuai/tidak sesuai baku mutu otomatis + grafik tren COD
- Keamanan data lewat login wajib + row level security di database (operator/lab cuma bisa ubah data mereka sendiri, atasan bisa semua, tidak ada yang bisa hapus data kecuali atasan)

**Fase 2 (baru):**
- **Stok bahan kimia** (pengganti panel "Sisa Bahan Kimia" di sheet HOME + logbook B3 PAC/NaOH/Polymer/Kaporit/DCA) — catat transaksi masuk/keluar, sisa stok dihitung otomatis, ada badge "Stok menipis" kalau di bawah ambang batas
- **Hasil analisa lab** (pengganti sheet `ANALISA`) — input per tanggal, unit (STP1/WWTP1/RWTP/STP2/WWTP2), dan tahap proses (Inlet/Equalisasi/Aerasi/Outlet), semua parameter diisi sekaligus dalam satu form
- Dashboard sekarang juga nampilin ringkasan stok bahan kimia

Fase berikutnya: flowmeter per jam, logbook sludge, curah hujan, neraca massa, export laporan PDF/Excel.

## Upgrade dari Fase 1 ke Fase 2

Kalau sebelumnya sudah pernah jalanin `schema.sql` versi Fase 1, tinggal:

1. Buka **Supabase SQL Editor**, paste ulang **seluruh isi** `supabase/schema.sql` yang baru (file ini sudah termasuk Fase 1 + Fase 2), klik **Run**. Aman dijalankan ulang — data yang sudah ada tidak akan hilang atau dobel.
2. Upload semua file yang baru/berubah ke GitHub (folder `app/(main)/stok-kimia`, `app/(main)/analisa-lab`, file `components/StockCard.js`, `components/ChemicalMovementForm.js`, `components/LabAnalysisForm.js`, dan file yang di-update: `components/Navbar.js`, `app/(main)/dashboard/page.js`, `supabase/schema.sql`).
3. Vercel otomatis build ulang begitu ada commit baru — tidak perlu setting environment variable lagi, sudah kepakai dari sebelumnya.

---

## 1. Setup Supabase (database + login)

1. Buka project Supabase yang sudah lo punya.
2. Buka **SQL Editor** > **New query**.
3. Buka file `supabase/schema.sql` di project ini, copy semua isinya, paste ke SQL Editor, lalu klik **Run**.
   Ini bikin 3 tabel: `profiles`, `baku_mutu`, `daily_water_quality`, plus aturan keamanannya.
4. Buka **Project Settings > API**. Catat dua nilai ini, nanti dipakai di langkah 3 dan 4:
   - **Project URL**
   - **anon / public key** (kadang disebut "publishable key")

### Buat user pertama (akun atasan)

1. Buka **Authentication > Users > Add user**. Isi email + password, centang "Auto Confirm User".
2. Buka **Table Editor > profiles**. Cari baris dengan email tadi, ubah kolom `role` dari `operator` jadi `atasan`.
3. Ulangi langkah ini untuk tiap orang (operator, lab, atasan) yang perlu akun. Role default-nya `operator`
   kalau tidak diubah manual.

---

## 2. Upload ke GitHub

1. Buat repository baru di GitHub (kosongan, tanpa README).
2. Di halaman repo, klik **Add file > Upload files**.
3. Drag seluruh isi folder project ini (bukan folder-nya, tapi isinya) ke halaman upload, lalu **Commit changes**.
   > Pastikan file `.env.local` **tidak pernah** diupload — isi kredensial Supabase-nya cukup lewat
   > Environment Variables di Vercel (langkah berikut), bukan lewat file yang ikut ke GitHub.

---

## 3. Deploy ke Vercel

1. Di Vercel, **Add New > Project**, pilih repo GitHub yang barusan dibuat. Framework preset otomatis
   kedetect "Next.js".
2. Sebelum klik Deploy, buka bagian **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL dari Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon/public key dari Supabase
3. Klik **Deploy**. Setelah selesai, buka domain yang diberikan Vercel — harusnya langsung ke halaman login.

Tiap kali lo edit file lewat GitHub web UI dan commit, Vercel otomatis build ulang dan deploy versi terbaru.

---

## 4. Pakai aplikasinya

- Login pakai email + password yang dibuat di langkah 1.
- Operator/lab isi data harian lewat menu **Input data**. Kalau tanggal + area yang sama diisi ulang,
  datanya diperbarui (bukan dobel baris).
- Semua role bisa lihat **Dashboard** — status hijau/merah dihitung otomatis dari tabel `baku_mutu`.
- Atasan bisa ubah ambang batas baku mutu lewat **Table Editor > baku_mutu** di Supabase kapan saja,
  tanpa perlu ubah kode.

---

## Soal keamanan data

- Tidak ada halaman pendaftaran publik — akun cuma dibuat atasan lewat Supabase Dashboard, jadi tidak
  sembarang orang bisa masuk.
- Setiap request ke database dicek lewat *row level security*: operator/lab cuma boleh insert dan
  mengoreksi data yang mereka input sendiri; hapus data cuma bisa oleh role atasan; baca data boleh
  semua role yang sudah login.
- `.env.local` (kredensial) tidak pernah masuk ke GitHub — sudah dimasukkan ke `.gitignore`.

---

## Development lokal (opsional, kalau nanti mau coba di laptop)

Butuh Node.js terpasang, lalu di terminal folder project ini:

```
cp .env.local.example .env.local
# isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di .env.local
npm install
npm run dev
```

Buka `http://localhost:3000`. Ini opsional — kalau langsung deploy lewat GitHub + Vercel seperti
langkah 2-3 di atas, bagian ini bisa dilewati sepenuhnya.
