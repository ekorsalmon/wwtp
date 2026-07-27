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

-- 2) BAKU MUTU (ambang batas parameter, bisa diedit atasan
--    lewat Table Editor tanpa perlu ubah kode aplikasi)
-- ------------------------------------------------------------
create table if not exists public.baku_mutu (
  parameter text primary key,
  label text not null,
  unit text,
  min numeric,
  max numeric
);

insert into public.baku_mutu (parameter, label, unit, min, max) values
  ('ph', 'pH', '', 6, 9),
  ('temp', 'Suhu', 'C', null, 38),
  ('cod', 'COD', 'mg/L', null, 100),
  ('do', 'DO', 'mg/L', 1, 3),
  ('tss', 'TSS', 'mg/L', null, 30),
  ('amoniak', 'Amoniak', 'mg/L', null, null),
  ('nitrat', 'Nitrat', 'mg/L', null, null),
  ('nitrit', 'Nitrit', 'mg/L', null, null),
  ('bod', 'BOD', 'mg/L', null, null)
on conflict (parameter) do nothing;

-- Nilai di atas diambil dari contoh di file Excel lo (baku mutu WWTP).
-- Cek ulang ke dokumen izin lingkungan resmi punya pabrik, lalu
-- sesuaikan lewat Table Editor > baku_mutu kalau ada yang beda.

alter table public.baku_mutu enable row level security;

drop policy if exists "baku_mutu_select_all" on public.baku_mutu;
create policy "baku_mutu_select_all"
  on public.baku_mutu for select
  to authenticated
  using (true);

drop policy if exists "baku_mutu_update_atasan" on public.baku_mutu;
create policy "baku_mutu_update_atasan"
  on public.baku_mutu for update
  to authenticated
  using (public.current_role() = 'atasan')
  with check (public.current_role() = 'atasan');

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

-- 4) BAHAN KIMIA (master daftar B3)
-- ------------------------------------------------------------
create table if not exists public.chemicals (
  key text primary key,
  label text not null,
  unit text not null default 'kg',
  stok_minimum numeric
);

insert into public.chemicals (key, label, unit, stok_minimum) values
  ('pac', 'PAC (Poly Alumunium Carbonate)', 'kg', 20),
  ('naoh', 'NaOH (Caustic Soda)', 'kg', 20),
  ('polymer', 'Polymer', 'kg', 10),
  ('kaporit', 'Kaporit', 'kg', 10),
  ('dca', 'DCA', 'kg', 10)
on conflict (key) do nothing;

-- Mau nambah bahan kimia lain? Tinggal insert baris baru ke tabel
-- ini lewat Table Editor, gak perlu ubah kode aplikasi.

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

-- 5) TRANSAKSI MASUK/KELUAR BAHAN KIMIA
-- ------------------------------------------------------------
create table if not exists public.chemical_movements (
  id bigint generated always as identity primary key,
  chemical_key text not null references public.chemicals(key),
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

-- View: sisa stok terkini tiap bahan kimia (total masuk - total keluar).
-- "security_invoker = true" penting supaya view ini tetap ikut aturan
-- RLS dari user yang login, bukan bypass semuanya.
create or replace view public.chemical_stock_current
with (security_invoker = true) as
select
  c.key,
  c.label,
  c.unit,
  c.stok_minimum,
  coalesce(sum(case when m.jenis = 'masuk' then m.jumlah else -m.jumlah end), 0) as stok
from public.chemicals c
left join public.chemical_movements m on m.chemical_key = c.key
group by c.key, c.label, c.unit, c.stok_minimum;

-- 6) HASIL ANALISA LAB (pengganti sheet "ANALISA")
-- ------------------------------------------------------------
create table if not exists public.lab_analysis (
  id bigint generated always as identity primary key,
  tanggal date not null,
  unit text not null check (unit in ('STP1', 'WWTP1', 'RWTP', 'STP2', 'WWTP2')),
  tahap_proses text not null check (tahap_proses in ('Inlet', 'Equalisasi', 'Aerasi', 'Outlet')),
  parameter text not null references public.baku_mutu(parameter),
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
