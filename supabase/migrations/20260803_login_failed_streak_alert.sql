
create table if not exists public.login_attempts (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  success boolean not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_login_attempts_username_time on public.login_attempts (username, created_at desc);

alter table public.login_attempts enable row level security;

-- Insert dibuka untuk anon & authenticated karena percobaan gagal terjadi SEBELUM ada sesi
drop policy if exists "login_attempts_insert_anyone" on public.login_attempts;
create policy "login_attempts_insert_anyone"
  on public.login_attempts for insert
  to anon, authenticated
  with check (true);

-- Hanya master yang boleh melihat log mentah percobaan login (audit)
drop policy if exists "login_attempts_select_master" on public.login_attempts;
create policy "login_attempts_select_master"
  on public.login_attempts for select
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'master')
  );

create table if not exists public.login_alert (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  attempt_count integer not null,
  window_start timestamptz not null,
  window_end timestamptz not null,
  is_read boolean not null default false,
  read_by uuid references public.profiles(id),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_login_alert_is_read on public.login_alert (is_read);

alter table public.login_alert enable row level security;

-- Hanya master yang boleh melihat & menandai alert (operator tidak perlu tahu)
drop policy if exists "login_alert_select_master" on public.login_alert;
create policy "login_alert_select_master"
  on public.login_alert for select
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'master')
  );

drop policy if exists "login_alert_update_master" on public.login_alert;
create policy "login_alert_update_master"
  on public.login_alert for update
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'master')
  );


create or replace function public.detect_failed_login_streak()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count integer;
  recent_all_failed boolean;
  streak_start timestamptz;
  streak_end timestamptz;
  existing_alert_id uuid;
begin
  if new.success = true then
    return new;
  end if;

  -- Ambil 5 percobaan terakhir (apa pun hasilnya) untuk username ini
  select
    count(*),
    bool_and(success = false),
    min(created_at),
    max(created_at)
  into recent_count, recent_all_failed, streak_start, streak_end
  from (
    select success, created_at
    from public.login_attempts
    where username = new.username
    order by created_at desc
    limit 5
  ) last5;

  -- Belum cukup 5 percobaan, atau ada yang berhasil di antaranya → bukan streak
  if recent_count < 5 or not recent_all_failed then
    return new;
  end if;

  -- Rentang waktu 5 percobaan terakhir harus < 30 menit
  if streak_end - streak_start >= interval '30 minutes' then
    return new;
  end if;

  -- Dedupe: kalau sudah ada alert yang window-nya overlap dengan streak ini, jangan bikin lagi
  select id into existing_alert_id
  from public.login_alert
  where username = new.username
    and window_end >= streak_start
  order by created_at desc
  limit 1;

  if existing_alert_id is not null then
    return new;
  end if;

  insert into public.login_alert (username, attempt_count, window_start, window_end)
  values (new.username, recent_count, streak_start, streak_end);

  return new;
end;
$$;

drop trigger if exists trg_detect_failed_login_streak on public.login_attempts;
create trigger trg_detect_failed_login_streak
  after insert on public.login_attempts
  for each row execute function public.detect_failed_login_streak();
