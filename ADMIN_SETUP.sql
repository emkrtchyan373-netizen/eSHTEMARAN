-- ============================================================
-- eSHTEMARAN — Admin panel + teacher account approval
-- Run this once in the Supabase Dashboard → SQL Editor
-- (AFTER CLASSROOM_SETUP.sql).
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE / DROP IF EXISTS.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Admins — accounts allowed to open the admin panel.
--    ⚠️ Փոխեք էլ. փոստը, եթե ադմինը այլ հասցե ունի:
-- ------------------------------------------------------------
create table if not exists public.admin_emails (
  email text primary key
);

insert into public.admin_emails (email)
values
  ('vahagngasparyan5@gmail.com'),
  ('emktrchyan373@gmail.com')
on conflict do nothing;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from admin_emails
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- ------------------------------------------------------------
-- 2. Teacher approval requests
-- ------------------------------------------------------------
create table if not exists public.teacher_approvals (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text,
  status     text not null default 'pending' check (status in ('pending', 'approved', 'denied')),
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create index if not exists idx_teacher_approvals_status on public.teacher_approvals (status, created_at desc);

-- Existing teacher accounts are approved automatically,
-- so this change does not lock anyone out.
insert into public.teacher_approvals (user_id, email, full_name, status, decided_at)
select id, email,
       coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email),
       'approved', now()
from auth.users
where raw_user_meta_data->>'role' = 'teacher'
on conflict (user_id) do nothing;

-- ------------------------------------------------------------
-- 3. RLS
-- ------------------------------------------------------------
alter table public.admin_emails      enable row level security;
alter table public.teacher_approvals enable row level security;

-- admin_emails: nobody reads or writes it from the client;
-- only the security-definer is_admin() touches it.

drop policy if exists "admin views teacher requests" on public.teacher_approvals;
drop policy if exists "teacher views own request"    on public.teacher_approvals;

create policy "admin views teacher requests"
  on public.teacher_approvals for select to authenticated
  using (public.is_admin());

create policy "teacher views own request"
  on public.teacher_approvals for select to authenticated
  using (user_id = auth.uid());

-- ------------------------------------------------------------
-- 4. Trigger — every new teacher signup becomes a pending
--    request in the admin panel.
-- ------------------------------------------------------------
create or replace function public.handle_new_teacher_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.raw_user_meta_data->>'role' = 'teacher' then
    insert into teacher_approvals (user_id, email, full_name, status)
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
      'pending'
    )
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_teacher_approval_on_signup on auth.users;
create trigger trg_teacher_approval_on_signup
  after insert on auth.users
  for each row
  execute function public.handle_new_teacher_signup();

-- ------------------------------------------------------------
-- 5. Admin decision RPC
-- ------------------------------------------------------------
create or replace function public.decide_teacher_request(p_user_id uuid, p_approve boolean)
returns json
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    return json_build_object('success', false, 'code', 'not_allowed');
  end if;

  update teacher_approvals
  set status = case when p_approve then 'approved' else 'denied' end,
      decided_at = now()
  where user_id = p_user_id;

  if not found then
    return json_build_object('success', false, 'code', 'not_found');
  end if;

  return json_build_object('success', true,
                           'code', case when p_approve then 'approved' else 'denied' end);
end;
$$;

grant execute on function public.decide_teacher_request(uuid, boolean) to authenticated;

-- ------------------------------------------------------------
-- 6. Approved-teacher check + gate classroom creation
-- ------------------------------------------------------------
create or replace function public.is_approved_teacher()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from teacher_approvals
    where user_id = auth.uid() and status = 'approved'
  );
$$;

grant execute on function public.is_approved_teacher() to authenticated;

-- Unapproved teachers cannot create or modify classrooms.
-- (Backfill above approved every existing teacher, so nothing breaks.)
drop policy if exists "teacher manages own classrooms" on public.classrooms;
create policy "teacher manages own classrooms"
  on public.classrooms for all to authenticated
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid() and public.is_approved_teacher());

-- ------------------------------------------------------------
-- 7. Realtime so the admin panel updates live
-- ------------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.teacher_approvals;
exception
  when duplicate_object then null; -- already added
end;
$$;
