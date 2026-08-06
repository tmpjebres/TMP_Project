
create table if not exists public.jadwal_tamu_tipe_kegiatan (
  id uuid primary key default gen_random_uuid(),
  nama text not null unique,
  is_default boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

insert into public.jadwal_tamu_tipe_kegiatan (nama, is_default)
values
  ('Upacara', true),
  ('Ziarah Makam', true),
  ('Peminjaman Tempat', true)
on conflict (nama) do nothing;

alter table public.jadwal_tamu_tipe_kegiatan enable row level security;

drop policy if exists "jadwal_tamu_tipe_kegiatan_select_all" on public.jadwal_tamu_tipe_kegiatan;
create policy "jadwal_tamu_tipe_kegiatan_select_all"
  on public.jadwal_tamu_tipe_kegiatan for select
  to authenticated
  using (true);

-- Hanya master yang boleh menambah tipe kegiatan baru (operator read-only)
drop policy if exists "jadwal_tamu_tipe_kegiatan_insert_master" on public.jadwal_tamu_tipe_kegiatan;
create policy "jadwal_tamu_tipe_kegiatan_insert_master"
  on public.jadwal_tamu_tipe_kegiatan for insert
  to authenticated
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'master')
  );

alter table public.jadwal_tamu
  add column if not exists tipe_kegiatan text not null default 'Upacara';

comment on column public.jadwal_tamu.tipe_kegiatan is
  'Referensi longgar ke jadwal_tamu_tipe_kegiatan.nama (tidak pakai FK ketat agar tipe lama tetap tampil walau namanya diubah/dihapus dari daftar).';