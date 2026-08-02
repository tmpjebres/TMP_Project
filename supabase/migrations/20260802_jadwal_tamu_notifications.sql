-- =============================================================================
-- Migration: Status Notifikasi Jadwal Tamu (pengingat H-1 & H)
-- Jalankan SETELAH migration jadwal_tamu sebelumnya.
--
-- Catatan desain: notifikasi H-1 dan H TIDAK disimpan sebagai baris konten
-- terpisah. Daftar notifikasi dihitung on-the-fly di aplikasi dari
-- jadwal_tamu (event yang tanggal_mulai = hari ini / besok). Tabel ini hanya
-- menyimpan status "sudah dibaca" per (event, user, tipe pengingat) supaya
-- H-1 dan H dianggap notifikasi yang berbeda untuk event yang sama.
-- =============================================================================

create table if not exists public.jadwal_tamu_notification_status (
  id uuid primary key default gen_random_uuid(),
  jadwal_tamu_id uuid not null references public.jadwal_tamu(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  notif_type text not null check (notif_type in ('h_minus_1', 'h')),
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now(),

  constraint jadwal_tamu_notification_status_unique unique (jadwal_tamu_id, user_id, notif_type)
);

create index if not exists idx_jadwal_tamu_notif_user on public.jadwal_tamu_notification_status (user_id, is_read);

alter table public.jadwal_tamu_notification_status enable row level security;

-- Setiap user (master & operator) hanya boleh baca/ubah status miliknya sendiri
drop policy if exists "jadwal_tamu_notif_select_own" on public.jadwal_tamu_notification_status;
create policy "jadwal_tamu_notif_select_own"
  on public.jadwal_tamu_notification_status for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "jadwal_tamu_notif_insert_own" on public.jadwal_tamu_notification_status;
create policy "jadwal_tamu_notif_insert_own"
  on public.jadwal_tamu_notification_status for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "jadwal_tamu_notif_update_own" on public.jadwal_tamu_notification_status;
create policy "jadwal_tamu_notif_update_own"
  on public.jadwal_tamu_notification_status for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
