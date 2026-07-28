-- ============================================================
-- WWTP P1 Monitoring — skema database (Fase 1)
--
-- Cara pakai: buka Supabase Dashboard > SQL Editor > New query,
-- paste SEMUA isi file ini, lalu klik Run. Aman dijalankan ulang
-- (pakai "if not exists" / "on conflict do nothing").
-- ============================================================

-- 1) PROFIL USER (nama lengkap + role: operator / lab / atasan)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'operator' check (role in ('operator', 'lab', 'atasan')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Otomatis bikin baris profil setiap kali ada user baru didaftarkan
-- lewat Supabase Auth. Role default "operator" — atasan bisa ubah
-- role user lewat Table Editor > profiles.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: ambil role user yang sedang login. Dipakai di kebijakan
-- keamanan (RLS) di bawah supaya tidak perlu query manual tiap kali.
create or replace function public.current_role()
returns text
language sql
security definer set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- 2) BAKU MUTU
-- ------------------------------------------------------------
-- Tabelnya dibikin di bagian "FASE 3b" di bawah (strukturnya udah
-- dirombak supaya satu parameter bisa punya ambang batas beda per
-- tipe unit STP/WWTP). Sengaja gak dibikin di sini lagi biar gak
-- bentrok pas file ini dijalanin ulang.

-- 3) DATA HARIAN KUALITAS AIR (pengganti sheet "DATA")
-- ------------------------------------------------------------
create table if not exists public.daily_water_quality (
  id bigint generated always as identity primary key,
  tanggal date not null,
  area text not null default 'WWTP 1',
  ph_inlet numeric, ph_outlet numeric,
  temp_inlet numeric, temp_outlet numeric,
  cod_inlet numeric, cod_outlet numeric,
  do_inlet numeric, do_outlet numeric,
  tss_inlet numeric, tss_outlet numeric,
  amoniak_inlet numeric, amoniak_outlet numeric,
  nitrat_inlet numeric, nitrat_outlet numeric,
  nitrit_inlet numeric, nitrit_outlet numeric,
  bod_inlet numeric, bod_outlet numeric,
  catatan text,
  input_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tanggal, area)
);

alter table public.daily_water_quality enable row level security;

drop policy if exists "dwq_select_all" on public.daily_water_quality;
create policy "dwq_select_all"
  on public.daily_water_quality for select
  to authenticated
  using (true);

drop policy if exists "dwq_insert_team" on public.daily_water_quality;
create policy "dwq_insert_team"
  on public.daily_water_quality for insert
  to authenticated
  with check (public.current_role() in ('operator', 'lab', 'atasan'));

drop policy if exists "dwq_update_owner_or_atasan" on public.daily_water_quality;
create policy "dwq_update_owner_or_atasan"
  on public.daily_water_quality for update
  to authenticated
  using (auth.uid() = input_by or public.current_role() = 'atasan')
  with check (auth.uid() = input_by or public.current_role() = 'atasan');

drop policy if exists "dwq_delete_atasan_only" on public.daily_water_quality;
create policy "dwq_delete_atasan_only"
  on public.daily_water_quality for delete
  to authenticated
  using (public.current_role() = 'atasan');

-- ============================================================
-- FASE 2 — Stok bahan kimia (B3) + hasil analisa lab
--
-- File ini AMAN dijalankan ulang dari awal (semua perintah pakai
-- "if not exists" / "on conflict do nothing" / "drop ... if exists").
-- Kalau Fase 1 sudah pernah dijalankan, cukup jalankan ulang SELURUH
-- file ini lagi — data yang sudah ada tidak akan hilang atau dobel.
-- ============================================================

-- 4) BAHAN KIMIA
-- ------------------------------------------------------------
-- Tabelnya dibikin di bagian "FASE 3c" di bawah (strukturnya udah
-- dirombak jadi 14 item + satuan berbeda-beda). Sengaja gak dibikin
-- di sini lagi biar gak bentrok pas file ini dijalanin ulang.

-- 5) TRANSAKSI MASUK/KELUAR BAHAN KIMIA
-- ------------------------------------------------------------
create table if not exists public.chemical_movements (
  id bigint generated always as identity primary key,
  chemical_key text not null,
  tanggal date not null,
  jenis text not null check (jenis in ('masuk', 'keluar')),
  jumlah numeric not null check (jumlah > 0),
  keterangan text,
  input_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.chemical_movements enable row level security;

drop policy if exists "cm_select_all" on public.chemical_movements;
create policy "cm_select_all"
  on public.chemical_movements for select
  to authenticated
  using (true);

drop policy if exists "cm_insert_team" on public.chemical_movements;
create policy "cm_insert_team"
  on public.chemical_movements for insert
  to authenticated
  with check (public.current_role() in ('operator', 'lab', 'atasan'));

drop policy if exists "cm_update_owner_or_atasan" on public.chemical_movements;
create policy "cm_update_owner_or_atasan"
  on public.chemical_movements for update
  to authenticated
  using (auth.uid() = input_by or public.current_role() = 'atasan')
  with check (auth.uid() = input_by or public.current_role() = 'atasan');

drop policy if exists "cm_delete_atasan_only" on public.chemical_movements;
create policy "cm_delete_atasan_only"
  on public.chemical_movements for delete
  to authenticated
  using (public.current_role() = 'atasan');

-- View "chemical_stock_current" dibikin di bagian "FASE 3c" di bawah
-- (kolomnya udah beda: "satuan" bukan "unit", plus ada estimasi habis).
-- Sengaja gak dibikin di sini lagi biar gak bentrok pas file ini
-- dijalanin ulang.

-- 6) HASIL ANALISA LAB (pengganti sheet "ANALISA")
-- ------------------------------------------------------------
create table if not exists public.lab_analysis (
  id bigint generated always as identity primary key,
  tanggal date not null,
  unit text not null check (unit in ('STP1', 'WWTP1', 'RWTP', 'STP2', 'WWTP2')),
  tahap_proses text not null check (tahap_proses in ('Inlet', 'Equalisasi', 'Aerasi', 'Outlet')),
  parameter text not null,
  nilai numeric,
  input_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (tanggal, unit, tahap_proses, parameter)
);

alter table public.lab_analysis enable row level security;

drop policy if exists "la_select_all" on public.lab_analysis;
create policy "la_select_all"
  on public.lab_analysis for select
  to authenticated
  using (true);

drop policy if exists "la_insert_team" on public.lab_analysis;
create policy "la_insert_team"
  on public.lab_analysis for insert
  to authenticated
  with check (public.current_role() in ('operator', 'lab', 'atasan'));

drop policy if exists "la_update_owner_or_atasan" on public.lab_analysis;
create policy "la_update_owner_or_atasan"
  on public.lab_analysis for update
  to authenticated
  using (auth.uid() = input_by or public.current_role() = 'atasan')
  with check (auth.uid() = input_by or public.current_role() = 'atasan');

drop policy if exists "la_delete_atasan_only" on public.lab_analysis;
create policy "la_delete_atasan_only"
  on public.lab_analysis for delete
  to authenticated
  using (public.current_role() = 'atasan');

-- Selesai Fase 2. Fase berikutnya: flowmeter per jam, logbook sludge,
-- curah hujan, neraca massa, dan export laporan PDF/Excel.

-- ============================================================
-- FASE 3a — Flowmeter & SV30 per jam
--
-- Sama seperti file sebelumnya: AMAN dijalankan ulang dari awal.
-- ============================================================

-- 7) TITIK PEMBACAAN (flowmeter + SV30)
-- ------------------------------------------------------------
create table if not exists public.meters (
  key text primary key,
  label text not null,
  jenis text not null check (jenis in ('flowmeter', 'sv30')),
  unit text not null
);

insert into public.meters (key, label, jenis, unit) values
  ('fm_out_stp', 'Flowmeter Outlet STP', 'flowmeter', 'm3'),
  ('fm_out_wwtp', 'Flowmeter Outlet WWTP', 'flowmeter', 'm3'),
  ('fm_in_rwtp', 'Flowmeter Inlet RWTP', 'flowmeter', 'm3'),
  ('fm_out_rwtp', 'Flowmeter Outlet RWTP', 'flowmeter', 'm3'),
  ('sv30_stp', 'SV30 STP', 'sv30', 'mL/L'),
  ('sv30_wwtp', 'SV30 WWTP', 'sv30', 'mL/L')
on conflict (key) do nothing;

-- Mau nambah titik flowmeter/SV30 lain? Tinggal insert baris baru lewat
-- Table Editor, gak perlu ubah kode aplikasi.

alter table public.meters enable row level security;

drop policy if exists "meters_select_all" on public.meters;
create policy "meters_select_all"
  on public.meters for select
  to authenticated
  using (true);

drop policy if exists "meters_write_atasan" on public.meters;
create policy "meters_write_atasan"
  on public.meters for all
  to authenticated
  using (public.current_role() = 'atasan')
  with check (public.current_role() = 'atasan');

-- 8) PEMBACAAN PER JAM (pengganti sheet FM OUT STP/WWTP, FM IN/OUT RWTP, SV30)
-- ------------------------------------------------------------
create table if not exists public.hourly_readings (
  id bigint generated always as identity primary key,
  tanggal date not null,
  meter_key text not null references public.meters(key),
  jam smallint not null check (jam between 0 and 23),
  nilai numeric,
  input_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (tanggal, meter_key, jam)
);

alter table public.hourly_readings enable row level security;

drop policy if exists "hr_select_all" on public.hourly_readings;
create policy "hr_select_all"
  on public.hourly_readings for select
  to authenticated
  using (true);

drop policy if exists "hr_insert_team" on public.hourly_readings;
create policy "hr_insert_team"
  on public.hourly_readings for insert
  to authenticated
  with check (public.current_role() in ('operator', 'lab', 'atasan'));

drop policy if exists "hr_update_owner_or_atasan" on public.hourly_readings;
create policy "hr_update_owner_or_atasan"
  on public.hourly_readings for update
  to authenticated
  using (auth.uid() = input_by or public.current_role() = 'atasan')
  with check (auth.uid() = input_by or public.current_role() = 'atasan');

drop policy if exists "hr_delete_atasan_only" on public.hourly_readings;
create policy "hr_delete_atasan_only"
  on public.hourly_readings for delete
  to authenticated
  using (public.current_role() = 'atasan');

-- Selesai Fase 3a. Menyusul: logbook sludge/limbah B3, curah hujan,
-- neraca massa.

-- ============================================================
-- FASE 3b — Koreksi flowmeter/SV30/analisa + logbook sludge & curah hujan
--
-- Sama seperti sebelumnya: AMAN dijalankan ulang dari awal.
-- CATATAN: bagian baku_mutu di bawah akan RESET nilai ambang batas ke
-- default baru (dipisah per tipe unit STP/WWTP). Kalau atasan sempat
-- mengubah manual ambang batas lewat Table Editor sebelum ini, nilai
-- itu akan tertimpa balik ke default.
-- ============================================================

-- 7b) KOREKSI FLOWMETER: hitung debit (Q) otomatis dari selisih
-- pembacaan kumulatif meteran, sesuai cara kerja Excel aslinya
-- (Q jam ini = FM jam ini - FM jam sebelumnya). Untuk titik SV30,
-- "debit" tidak relevan sehingga bernilai kosong.
-- ------------------------------------------------------------
create or replace view public.hourly_readings_detail
with (security_invoker = true) as
select
  hr.id,
  hr.tanggal,
  hr.meter_key,
  hr.jam,
  hr.nilai,
  hr.input_by,
  hr.created_at,
  m.label,
  m.jenis,
  m.unit,
  case
    when m.jenis = 'flowmeter' then
      hr.nilai - lag(hr.nilai) over (partition by hr.meter_key order by hr.tanggal, hr.jam)
    else null
  end as debit
from public.hourly_readings hr
join public.meters m on m.key = hr.meter_key;

-- 8b) PARAMETERS — daftar parameter uji dipisah dari baku_mutu, supaya satu
-- parameter (misal TSS) bisa punya lebih dari satu ambang batas tergantung
-- tipe unit (STP vs WWTP).
-- ------------------------------------------------------------
create table if not exists public.parameters (
  key text primary key,
  label text not null,
  satuan text
);

insert into public.parameters (key, label, satuan) values
  ('ph', 'pH', ''),
  ('temp', 'Suhu', 'C'),
  ('cod', 'COD', 'mg/L'),
  ('do', 'DO', 'mg/L'),
  ('tss', 'TSS', 'mg/L'),
  ('amoniak', 'Amoniak', 'mg/L'),
  ('nitrat', 'Nitrat', 'mg/L'),
  ('nitrit', 'Nitrit', 'mg/L'),
  ('bod', 'BOD', 'mg/L')
on conflict (key) do nothing;

alter table public.parameters enable row level security;

drop policy if exists "parameters_select_all" on public.parameters;
create policy "parameters_select_all"
  on public.parameters for select
  to authenticated
  using (true);

drop policy if exists "parameters_write_atasan" on public.parameters;
create policy "parameters_write_atasan"
  on public.parameters for all
  to authenticated
  using (public.current_role() = 'atasan')
  with check (public.current_role() = 'atasan');

-- Pindahkan referensi lab_analysis.parameter dari baku_mutu ke parameters
alter table public.lab_analysis drop constraint if exists lab_analysis_parameter_fkey;
alter table public.lab_analysis add constraint lab_analysis_parameter_fkey
  foreign key (parameter) references public.parameters(key);

-- Tambah kolom shift (opsional, gak wajib diisi tiap entri)
alter table public.lab_analysis add column if not exists shift smallint check (shift between 1 and 3);

-- Tambah tahap proses "R.A.S/Clarifier" yang kelewat di Fase 2
alter table public.lab_analysis drop constraint if exists lab_analysis_tahap_proses_check;
alter table public.lab_analysis add constraint lab_analysis_tahap_proses_check
  check (tahap_proses in ('Inlet', 'Equalisasi', 'Aerasi', 'R.A.S/Clarifier', 'Outlet'));

-- Rombak baku_mutu: sekarang satu parameter bisa punya ambang beda per tipe unit
drop table if exists public.baku_mutu cascade;

create table public.baku_mutu (
  parameter text not null references public.parameters(key),
  unit_tipe text not null default 'ALL' check (unit_tipe in ('ALL', 'STP', 'WWTP')),
  min numeric,
  max numeric,
  primary key (parameter, unit_tipe)
);

insert into public.baku_mutu (parameter, unit_tipe, min, max) values
  ('ph', 'ALL', 6, 9),
  ('temp', 'ALL', null, 38),
  ('cod', 'ALL', null, 100),
  ('do', 'ALL', 1, 3),
  ('tss', 'STP', null, 30),
  ('tss', 'WWTP', null, 200),
  ('amoniak', 'STP', null, 30),
  ('amoniak', 'WWTP', null, 50),
  ('nitrat', 'STP', null, 10),
  ('nitrat', 'WWTP', null, 20),
  ('nitrit', 'ALL', null, 1),
  ('bod', 'STP', null, 30),
  ('bod', 'WWTP', null, 50);

alter table public.baku_mutu enable row level security;

drop policy if exists "baku_mutu_select_all" on public.baku_mutu;
create policy "baku_mutu_select_all"
  on public.baku_mutu for select
  to authenticated
  using (true);

drop policy if exists "baku_mutu_write_atasan" on public.baku_mutu;
create policy "baku_mutu_write_atasan"
  on public.baku_mutu for all
  to authenticated
  using (public.current_role() = 'atasan')
  with check (public.current_role() = 'atasan');

-- 9) LOGBOOK SLUDGE / LIMBAH B3 (pengganti sheet "DATA SLUDGE")
-- ------------------------------------------------------------
create table if not exists public.sludge_movements (
  id bigint generated always as identity primary key,
  tanggal date not null,
  jenis text not null check (jenis in ('masuk', 'keluar')),
  jumlah_kg numeric not null check (jumlah_kg > 0),
  -- kolom khusus saat MASUK
  sumber text,
  tanggal_kadaluarsa date generated always as (
    case when jenis = 'masuk' then tanggal + 90 else null end
  ) stored,
  -- kolom khusus saat KELUAR (diangkut keluar site)
  perusahaan_pengangkut text,
  nopol_kendaraan text,
  tujuan_penyerahan text,
  bukti_dokumen text,
  keterangan text,
  input_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- Batas maksimal penyimpanan limbah B3 = 90 hari sejak tanggal masuk,
-- sesuai aturan pengelolaan limbah B3 di Indonesia. Dihitung otomatis
-- lewat kolom generated di atas, gak perlu diisi manual.

alter table public.sludge_movements enable row level security;

drop policy if exists "sm_select_all" on public.sludge_movements;
create policy "sm_select_all"
  on public.sludge_movements for select
  to authenticated
  using (true);

drop policy if exists "sm_insert_team" on public.sludge_movements;
create policy "sm_insert_team"
  on public.sludge_movements for insert
  to authenticated
  with check (public.current_role() in ('operator', 'lab', 'atasan'));

drop policy if exists "sm_update_owner_or_atasan" on public.sludge_movements;
create policy "sm_update_owner_or_atasan"
  on public.sludge_movements for update
  to authenticated
  using (auth.uid() = input_by or public.current_role() = 'atasan')
  with check (auth.uid() = input_by or public.current_role() = 'atasan');

drop policy if exists "sm_delete_atasan_only" on public.sludge_movements;
create policy "sm_delete_atasan_only"
  on public.sludge_movements for delete
  to authenticated
  using (public.current_role() = 'atasan');

create or replace view public.sludge_balance_current
with (security_invoker = true) as
select
  coalesce(sum(case when jenis = 'masuk' then jumlah_kg else -jumlah_kg end), 0) as sisa_kg
from public.sludge_movements;

-- 10) CURAH HUJAN (pengganti sheet "CURAH HUJAN")
-- ------------------------------------------------------------
create table if not exists public.rainfall (
  id bigint generated always as identity primary key,
  tanggal date not null unique,
  curah_hujan_mm numeric,
  libur boolean not null default false,
  keterangan text,
  input_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.rainfall enable row level security;

drop policy if exists "rf_select_all" on public.rainfall;
create policy "rf_select_all"
  on public.rainfall for select
  to authenticated
  using (true);

drop policy if exists "rf_insert_team" on public.rainfall;
create policy "rf_insert_team"
  on public.rainfall for insert
  to authenticated
  with check (public.current_role() in ('operator', 'lab', 'atasan'));

drop policy if exists "rf_update_owner_or_atasan" on public.rainfall;
create policy "rf_update_owner_or_atasan"
  on public.rainfall for update
  to authenticated
  using (auth.uid() = input_by or public.current_role() = 'atasan')
  with check (auth.uid() = input_by or public.current_role() = 'atasan');

drop policy if exists "rf_delete_atasan_only" on public.rainfall;
create policy "rf_delete_atasan_only"
  on public.rainfall for delete
  to authenticated
  using (public.current_role() = 'atasan');

-- Selesai Fase 3b. Menyusul: neraca massa, export laporan PDF/Excel,
-- alur verifikasi laporan berjenjang (Dibuat/Diketahui/Disetujui).

-- ============================================================
-- FASE 3c — Rombak stok kimia: 14 item (bukan 5), pemakaian per-unit,
-- dan "estimasi habis" berdasar standar pemakaian mingguan (bukan
-- ambang batas tetap) — sesuai cara kerja Excel aslinya.
--
-- CATATAN: transaksi yang udah kesimpan di chemical_movements TETAP
-- AMAN, gak kehapus. Yang di-reset cuma daftar master bahan kimianya.
-- ============================================================

drop view if exists public.chemical_stock_current;
drop view if exists public.chemical_neraca_bulanan;
alter table public.chemical_movements drop constraint if exists chemical_movements_chemical_key_fkey;

drop table if exists public.chemicals;

create table public.chemicals (
  key text primary key,
  label text not null,
  satuan text not null default 'kg',
  standar_pemakaian_mingguan numeric
);

insert into public.chemicals (key, label, satuan, standar_pemakaian_mingguan) values
  ('pac', 'PAC (Poly Alumunium Carbonate)', 'kg', null),
  ('naoh', 'NaOH (Caustic Soda)', 'kg', null),
  ('polymer', 'Polymer', 'kg', null),
  ('kaporit', 'Kaporit', 'kg', null),
  ('dca', 'DCA', 'kg', null),
  ('ammonium_salycilate', 'Ammonium Salycilate', 'pcs', 20),
  ('ammonium_cyanurate', 'Ammonium Cyanurate', 'pcs', null),
  ('nitriver_3', 'Nitriver 3', 'pcs', null),
  ('nitraver_5', 'Nitraver 5', 'pcs', null),
  ('chlorine', 'Chlorine', 'pcs', null),
  ('lithium_hydroxide', 'Lithium Hydroxide', 'pcs', null),
  ('cod_lr', 'COD LR', 'pcs', 20),
  ('cod_hr', 'COD HR', 'pcs', null),
  ('aquadest', 'Aquadest', 'pcs', null);

-- Standar pemakaian mingguan yang masih "null" di atas belum gua tau
-- angka pastinya dari Excel — isi lewat Table Editor > chemicals kalau
-- mau estimasi habisnya muncul buat item itu.

alter table public.chemicals enable row level security;

drop policy if exists "chemicals_select_all" on public.chemicals;
create policy "chemicals_select_all"
  on public.chemicals for select
  to authenticated
  using (true);

drop policy if exists "chemicals_write_atasan" on public.chemicals;
create policy "chemicals_write_atasan"
  on public.chemicals for all
  to authenticated
  using (public.current_role() = 'atasan')
  with check (public.current_role() = 'atasan');

alter table public.chemical_movements add constraint chemical_movements_chemical_key_fkey
  foreign key (chemical_key) references public.chemicals(key);

-- Kolom baru: unit pemakai (WWTP1/WWTP2/RWTP/dst) — terutama diisi
-- saat jenis = 'keluar', karena satu bahan bisa dipakai beberapa unit
-- sekaligus di hari yang sama (dicatat sebagai baris terpisah).
alter table public.chemical_movements add column if not exists unit text;

create or replace view public.chemical_stock_current
with (security_invoker = true) as
select
  c.key,
  c.label,
  c.satuan,
  c.standar_pemakaian_mingguan,
  coalesce(sum(case when m.jenis = 'masuk' then m.jumlah else -m.jumlah end), 0) as stok,
  case
    when c.standar_pemakaian_mingguan is not null and c.standar_pemakaian_mingguan > 0 then
      round(
        coalesce(sum(case when m.jenis = 'masuk' then m.jumlah else -m.jumlah end), 0)
        / c.standar_pemakaian_mingguan,
        1
      )
    else null
  end as estimasi_minggu
from public.chemicals c
left join public.chemical_movements m on m.chemical_key = c.key
group by c.key, c.label, c.satuan, c.standar_pemakaian_mingguan;

-- Selesai Fase 3c. Menyusul: titik meteran tambahan (ABT, MESS, Pos
-- Security, F1&F4), lalu Fase 4 (approval berjenjang + log aktivitas).

-- ============================================================
-- FASE 3d — Titik meteran tambahan (ABT, MESS, Pos Security, F1&F4)
--
-- Beda dari flowmeter WWTP: titik-titik ini dibaca HARIAN, bukan tiap
-- jam. Dipakai jenis baru 'flowmeter_harian' supaya form-nya otomatis
-- gak nanya jam, tapi tetap pakai logic hitung debit yang sama persis.
-- ============================================================

alter table public.meters drop constraint if exists meters_jenis_check;
alter table public.meters add constraint meters_jenis_check
  check (jenis in ('flowmeter', 'flowmeter_harian', 'sv30'));

insert into public.meters (key, label, jenis, unit) values
  ('abt1', 'ABT 1', 'flowmeter_harian', 'm3'),
  ('abt2', 'ABT 2', 'flowmeter_harian', 'm3'),
  ('abt4', 'ABT 4', 'flowmeter_harian', 'm3'),
  ('mess1', 'MESS 1', 'flowmeter_harian', 'm3'),
  ('mess2', 'MESS 2', 'flowmeter_harian', 'm3'),
  ('pos_security', 'Pos Security', 'flowmeter_harian', 'm3'),
  ('f4_toilet1', 'F4 - Toilet 1', 'flowmeter_harian', 'm3'),
  ('f4_toilet2', 'F4 - Toilet 2', 'flowmeter_harian', 'm3'),
  ('f4_air_minum', 'F4 - Air Minum', 'flowmeter_harian', 'm3'),
  ('f4_cuci_sikat', 'F4 - Cuci Sikat', 'flowmeter_harian', 'm3'),
  ('p1_air_minum', 'P1 - Air Minum', 'flowmeter_harian', 'm3'),
  ('p1_toilet', 'P1 - Toilet', 'flowmeter_harian', 'm3'),
  ('p1_cuci_sikat', 'P1 - Cuci Sikat', 'flowmeter_harian', 'm3'),
  ('p1_kantin1', 'P1 - Kantin 1', 'flowmeter_harian', 'm3'),
  ('p1_kantin5', 'P1 - Kantin 5', 'flowmeter_harian', 'm3')
on conflict (key) do nothing;

-- Perluas view debit supaya berlaku juga buat titik harian
create or replace view public.hourly_readings_detail
with (security_invoker = true) as
select
  hr.id,
  hr.tanggal,
  hr.meter_key,
  hr.jam,
  hr.nilai,
  hr.input_by,
  hr.created_at,
  m.label,
  m.jenis,
  m.unit,
  case
    when m.jenis in ('flowmeter', 'flowmeter_harian') then
      hr.nilai - lag(hr.nilai) over (partition by hr.meter_key order by hr.tanggal, hr.jam)
    else null
  end as debit
from public.hourly_readings hr
join public.meters m on m.key = hr.meter_key;

-- Selesai Fase 3d. Menyusul: Fase 4 (approval berjenjang + log
-- aktivitas operator).

-- ============================================================
-- FASE 3e — Logbook (versi sementara)
--
-- Placeholder catatan bebas per tanggal — belum sesuai struktur asli
-- karena isi sheet "LOGBOOK" di Excel belum pernah dilihat. Sesuaikan
-- lagi setelah ada referensinya.
-- ============================================================
create table if not exists public.logbook_entries (
  id bigint generated always as identity primary key,
  tanggal date not null,
  catatan text not null,
  input_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.logbook_entries enable row level security;

drop policy if exists "logbook_select_all" on public.logbook_entries;
create policy "logbook_select_all"
  on public.logbook_entries for select
  to authenticated
  using (true);

drop policy if exists "logbook_insert_team" on public.logbook_entries;
create policy "logbook_insert_team"
  on public.logbook_entries for insert
  to authenticated
  with check (public.current_role() in ('operator', 'lab', 'atasan'));

drop policy if exists "logbook_update_owner_or_atasan" on public.logbook_entries;
create policy "logbook_update_owner_or_atasan"
  on public.logbook_entries for update
  to authenticated
  using (auth.uid() = input_by or public.current_role() = 'atasan')
  with check (auth.uid() = input_by or public.current_role() = 'atasan');

drop policy if exists "logbook_delete_atasan_only" on public.logbook_entries;
create policy "logbook_delete_atasan_only"
  on public.logbook_entries for delete
  to authenticated
  using (public.current_role() = 'atasan');

-- ============================================================
-- FASE 3f — Isi standar pemakaian mingguan yang udah kekonfirmasi
-- dari Excel asli (reagen lab, satuan pcs). 6 bahan dosing (PAC, NaOH,
-- Polymer, Kaporit, DCA, Aquadest) sengaja belum diisi karena
-- angkanya di Excel gak konsisten (ada yang nulis "per minggu" tapi
-- label estimasinya "per hari") — isi manual kalau udah pasti.
-- ============================================================
update public.chemicals set standar_pemakaian_mingguan = 20 where key = 'ammonium_cyanurate';
update public.chemicals set standar_pemakaian_mingguan = 20 where key = 'nitraver_5';
update public.chemicals set standar_pemakaian_mingguan = 20 where key = 'cod_hr';
update public.chemicals set standar_pemakaian_mingguan = 6 where key = 'lithium_hydroxide';
-- ammonium_salycilate, nitriver_3, cod_lr udah keisi 20 dari Fase 3c.

-- ============================================================
-- FASE 3g — Halaman NERACA (rekap bulanan semua bahan kimia)
--
-- Tombol "LOGBOOK" di HOME ternyata bukan sheet terpisah — nyambung
-- ke halaman rekap ini (bukan catatan bebas kayak yang sempat dibikin
-- sebelumnya, itu sudah dihapus).
-- ============================================================
create or replace view public.chemical_neraca_bulanan
with (security_invoker = true) as
select
  key, label, satuan, standar_pemakaian_mingguan,
  stok_bulan_lalu, penambahan, pemakaian,
  stok_bulan_lalu + penambahan - pemakaian as sisa
from (
  select
    c.key,
    c.label,
    c.satuan,
    c.standar_pemakaian_mingguan,
    coalesce(sum(
      case
        when m.tanggal < date_trunc('month', current_date)::date
          then (case when m.jenis = 'masuk' then m.jumlah else -m.jumlah end)
        else 0
      end
    ), 0) as stok_bulan_lalu,
    coalesce(sum(
      case
        when m.tanggal >= date_trunc('month', current_date)::date and m.jenis = 'masuk' then m.jumlah
        else 0
      end
    ), 0) as penambahan,
    coalesce(sum(
      case
        when m.tanggal >= date_trunc('month', current_date)::date and m.jenis = 'keluar' then m.jumlah
        else 0
      end
    ), 0) as pemakaian
  from public.chemicals c
  left join public.chemical_movements m on m.chemical_key = c.key
  group by c.key, c.label, c.satuan, c.standar_pemakaian_mingguan
) t;

-- ============================================================
-- FASE 4a — Profile: laporan aktivitas kerja per operator + shift
-- ============================================================

-- Info tambahan buat header laporan (opsional, defaultnya generik)
alter table public.profiles add column if not exists nama_pekerjaan text default 'Operator WWTP';
alter table public.profiles add column if not exists divisi text default 'SMP';
alter table public.profiles add column if not exists dept text default 'ES (WWTP)';
alter table public.profiles add column if not exists unit_kerja text default 'WWTP';

-- SHIFT — siapa masuk pagi/malam per tanggal
create table if not exists public.shifts (
  id bigint generated always as identity primary key,
  tanggal date not null,
  user_id uuid not null references auth.users(id),
  shift text not null check (shift in ('pagi', 'malam')),
  input_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (tanggal, user_id)
);

alter table public.shifts enable row level security;

drop policy if exists "shifts_select_all" on public.shifts;
create policy "shifts_select_all"
  on public.shifts for select
  to authenticated
  using (true);

drop policy if exists "shifts_write_atasan" on public.shifts;
create policy "shifts_write_atasan"
  on public.shifts for all
  to authenticated
  using (public.current_role() = 'atasan')
  with check (public.current_role() = 'atasan');

-- AKTIVITAS KERJA — log aktivitas rutin & tambahan digabung jadi satu
create table if not exists public.work_activities (
  id bigint generated always as identity primary key,
  tanggal date not null,
  user_id uuid not null references auth.users(id),
  aktivitas text not null,
  rutinitas text check (rutinitas in ('H', 'M', 'B', 'S', 'T')),
  alat_kerja text,
  rekan_kerja text,
  lokasi_kerja text,
  hasil text,
  status text not null default 'selesai' check (status in ('selesai', 'proses')),
  input_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.work_activities enable row level security;

drop policy if exists "wa_select_all" on public.work_activities;
create policy "wa_select_all"
  on public.work_activities for select
  to authenticated
  using (true);

drop policy if exists "wa_insert_own_or_atasan" on public.work_activities;
create policy "wa_insert_own_or_atasan"
  on public.work_activities for insert
  to authenticated
  with check (auth.uid() = user_id or public.current_role() = 'atasan');

drop policy if exists "wa_update_owner_or_atasan" on public.work_activities;
create policy "wa_update_owner_or_atasan"
  on public.work_activities for update
  to authenticated
  using (auth.uid() = user_id or public.current_role() = 'atasan')
  with check (auth.uid() = user_id or public.current_role() = 'atasan');

drop policy if exists "wa_delete_owner_or_atasan" on public.work_activities;
create policy "wa_delete_owner_or_atasan"
  on public.work_activities for delete
  to authenticated
  using (auth.uid() = user_id or public.current_role() = 'atasan');

-- KENDALA — masalah/hambatan per operator
create table if not exists public.work_issues (
  id bigint generated always as identity primary key,
  tanggal date not null,
  user_id uuid not null references auth.users(id),
  deskripsi text not null,
  status text not null default 'open' check (status in ('open', 'selesai')),
  input_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.work_issues enable row level security;

drop policy if exists "wi_select_all" on public.work_issues;
create policy "wi_select_all"
  on public.work_issues for select
  to authenticated
  using (true);

drop policy if exists "wi_insert_own_or_atasan" on public.work_issues;
create policy "wi_insert_own_or_atasan"
  on public.work_issues for insert
  to authenticated
  with check (auth.uid() = user_id or public.current_role() = 'atasan');

drop policy if exists "wi_update_owner_or_atasan" on public.work_issues;
create policy "wi_update_owner_or_atasan"
  on public.work_issues for update
  to authenticated
  using (auth.uid() = user_id or public.current_role() = 'atasan')
  with check (auth.uid() = user_id or public.current_role() = 'atasan');

drop policy if exists "wi_delete_owner_or_atasan" on public.work_issues;
create policy "wi_delete_owner_or_atasan"
  on public.work_issues for delete
  to authenticated
  using (auth.uid() = user_id or public.current_role() = 'atasan');
