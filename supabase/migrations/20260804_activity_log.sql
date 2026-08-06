
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  actor_username text,
  action text not null,
  entity_type text not null,
  entity_label text,
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_log_actor_id on public.activity_log (actor_id);
create index if not exists idx_activity_log_created_at on public.activity_log (created_at desc);

alter table public.activity_log enable row level security;

-- Hanya master yang boleh melihat log aktivitas user lain
drop policy if exists "activity_log_select_master" on public.activity_log;
create policy "activity_log_select_master"
  on public.activity_log for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'master')
  );

-- User hanya boleh insert log untuk dirinya sendiri
drop policy if exists "activity_log_insert_own" on public.activity_log;
create policy "activity_log_insert_own"
  on public.activity_log for insert
  with check (actor_id = auth.uid());
