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

-- Selesai. Tabel berikutnya (flowmeter per jam, stok B3, sludge, dst)
-- menyusul di fase berikutnya sesuai rencana bertahap.
