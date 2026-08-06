
create table if not exists public.jadwal_tamu (
  id uuid primary key default gen_random_uuid(),

  -- Detail acara
  nama_kegiatan text not null,
  instansi text not null,
  nama_ketua text not null,
  jumlah_rombongan integer not null check (jumlah_rombongan > 0),

  -- Waktu: mulai wajib, selesai opsional (checkbox "punya rentang waktu")
  tanggal_mulai date not null,
  jam_mulai time not null,
  punya_waktu_selesai boolean not null default false,
  tanggal_selesai date,
  jam_selesai time,

  -- Attachment surat: pdf/image (Supabase Storage) atau link Drive
  attachment_type text check (attachment_type in ('pdf', 'image', 'link')),
  attachment_url text,
  attachment_filename text,

  -- Audit ringkas (untuk tampilan cepat "terakhir diubah oleh")
  created_by uuid references public.profiles(id),
  created_by_username text,
  updated_by uuid references public.profiles(id),
  updated_by_username text,

  -- Soft delete, agar histori delete tetap tercatat di audit log
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  deleted_by_username text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint jadwal_tamu_rentang_valid check (
    punya_waktu_selesai = false
    or (
      tanggal_selesai is not null and jam_selesai is not null
      and (tanggal_selesai, jam_selesai) >= (tanggal_mulai, jam_mulai)
    )
  )
);

create index if not exists idx_jadwal_tamu_tanggal_mulai on public.jadwal_tamu (tanggal_mulai) where deleted_at is null;
create index if not exists idx_jadwal_tamu_not_deleted on public.jadwal_tamu (deleted_at);

create table if not exists public.jadwal_tamu_audit_log (
  id uuid primary key default gen_random_uuid(),
  jadwal_tamu_id uuid not null,
  action text not null check (action in ('create', 'update', 'delete')),
  actor_id uuid references public.profiles(id),
  actor_username text not null,
  snapshot jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_jadwal_tamu_audit_log_jadwal_id on public.jadwal_tamu_audit_log (jadwal_tamu_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_jadwal_tamu_updated_at on public.jadwal_tamu;
create trigger trg_jadwal_tamu_updated_at
  before update on public.jadwal_tamu
  for each row execute function public.set_updated_at();

alter table public.jadwal_tamu enable row level security;
alter table public.jadwal_tamu_audit_log enable row level security;

-- Semua user (master & operator) yang sudah login boleh SELECT
drop policy if exists "jadwal_tamu_select_all" on public.jadwal_tamu;
create policy "jadwal_tamu_select_all"
  on public.jadwal_tamu for select
  to authenticated
  using (true);

-- Hanya master yang boleh INSERT
drop policy if exists "jadwal_tamu_insert_master" on public.jadwal_tamu;
create policy "jadwal_tamu_insert_master"
  on public.jadwal_tamu for insert
  to authenticated
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'master')
  );

-- Hanya master yang boleh UPDATE (termasuk soft delete)
drop policy if exists "jadwal_tamu_update_master" on public.jadwal_tamu;
create policy "jadwal_tamu_update_master"
  on public.jadwal_tamu for update
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'master')
  );

-- Hard delete tidak dipakai (kita soft delete via update), tapi tetap dikunci untuk master saja
drop policy if exists "jadwal_tamu_delete_master" on public.jadwal_tamu;
create policy "jadwal_tamu_delete_master"
  on public.jadwal_tamu for delete
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'master')
  );

-- Audit log: semua user login boleh baca, hanya master yang boleh insert (via aplikasi)
drop policy if exists "jadwal_tamu_audit_select_all" on public.jadwal_tamu_audit_log;
create policy "jadwal_tamu_audit_select_all"
  on public.jadwal_tamu_audit_log for select
  to authenticated
  using (true);

drop policy if exists "jadwal_tamu_audit_insert_master" on public.jadwal_tamu_audit_log;
create policy "jadwal_tamu_audit_insert_master"
  on public.jadwal_tamu_audit_log for insert
  to authenticated
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'master')
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'jadwal-tamu-attachment',
  'jadwal-tamu-attachment',
  false,
  1048576, -- 1 MB
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "jadwal_tamu_attachment_select_authenticated" on storage.objects;
create policy "jadwal_tamu_attachment_select_authenticated"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'jadwal-tamu-attachment');

drop policy if exists "jadwal_tamu_attachment_insert_master" on storage.objects;
create policy "jadwal_tamu_attachment_insert_master"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'jadwal-tamu-attachment'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'master')
  );

drop policy if exists "jadwal_tamu_attachment_update_master" on storage.objects;
create policy "jadwal_tamu_attachment_update_master"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'jadwal-tamu-attachment'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'master')
  );

drop policy if exists "jadwal_tamu_attachment_delete_master" on storage.objects;
create policy "jadwal_tamu_attachment_delete_master"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'jadwal-tamu-attachment'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'master')
  );

