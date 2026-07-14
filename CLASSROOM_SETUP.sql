-- ============================================================
-- eSHTEMARAN — Classroom feature setup (v2: join approval flow)
-- Run this once in the Supabase Dashboard → SQL Editor.
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE / DROP IF EXISTS.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Unique join-code generator (6 chars, no ambiguous letters)
-- ------------------------------------------------------------
create or replace function public.generate_classroom_code()
returns text
language plpgsql
volatile
as $$
declare
  chars constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_code text;
begin
  loop
    v_code := '';
    for i in 1..6 loop
      v_code := v_code || substr(chars, floor(random() * length(chars))::int + 1, 1);
    end loop;
    exit when not exists (select 1 from public.classrooms where classrooms.code = v_code);
  end loop;
  return v_code;
end;
$$;

-- ------------------------------------------------------------
-- 2. Tables
-- ------------------------------------------------------------
create table if not exists public.classrooms (
  id            uuid primary key default gen_random_uuid(),
  teacher_id    uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  student_limit integer not null default 30 check (student_limit between 1 and 200),
  code          text not null unique default public.generate_classroom_code(),
  created_at    timestamptz not null default now()
);

create table if not exists public.classroom_members (
  id            uuid primary key default gen_random_uuid(),
  classroom_id  uuid not null references public.classrooms(id) on delete cascade,
  student_id    uuid not null references auth.users(id) on delete cascade,
  student_email text,
  student_name  text,
  status        text not null default 'approved' check (status in ('pending', 'approved')),
  joined_at     timestamptz not null default now(),
  unique (classroom_id, student_id)
);

create table if not exists public.teacher_notifications (
  id              uuid primary key default gen_random_uuid(),
  teacher_id      uuid not null references auth.users(id) on delete cascade,
  classroom_id    uuid references public.classrooms(id) on delete cascade,
  classroom_name  text,
  student_id      uuid,
  student_email   text,
  student_name    text,
  type            text not null default 'result' check (type in ('result', 'join_request')),
  member_id       uuid,
  section_name    text,
  questions_count integer,
  answered_count  integer,
  wrongs_count    integer,
  time_spent      text,
  is_read         boolean not null default false,
  created_at      timestamptz not null default now()
);

-- Migration for installs created before v2 (no-ops on fresh installs)
alter table public.classroom_members
  add column if not exists status text not null default 'approved'
  check (status in ('pending', 'approved'));

alter table public.teacher_notifications
  add column if not exists type text not null default 'result'
  check (type in ('result', 'join_request'));

alter table public.teacher_notifications
  add column if not exists member_id uuid;

create index if not exists idx_classroom_members_classroom on public.classroom_members (classroom_id);
create index if not exists idx_classroom_members_student   on public.classroom_members (student_id);
create index if not exists idx_teacher_notifications_teacher on public.teacher_notifications (teacher_id, is_read, created_at desc);

-- ------------------------------------------------------------
-- 3. RLS helper functions (SECURITY DEFINER breaks policy
--    recursion between classrooms <-> classroom_members)
-- ------------------------------------------------------------
create or replace function public.is_classroom_teacher(p_classroom uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from classrooms
    where id = p_classroom and teacher_id = auth.uid()
  );
$$;

-- approved member only (full dashboard visibility)
create or replace function public.is_classroom_member(p_classroom uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from classroom_members
    where classroom_id = p_classroom
      and student_id = auth.uid()
      and status = 'approved'
  );
$$;

-- any membership row, pending included (lets a pending student
-- still see the classroom's name in their list)
create or replace function public.has_classroom_membership(p_classroom uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from classroom_members
    where classroom_id = p_classroom
      and student_id = auth.uid()
  );
$$;

-- ------------------------------------------------------------
-- 4. Row Level Security
-- ------------------------------------------------------------
alter table public.classrooms            enable row level security;
alter table public.classroom_members     enable row level security;
alter table public.teacher_notifications enable row level security;

-- classrooms
drop policy if exists "teacher manages own classrooms"  on public.classrooms;
drop policy if exists "students view joined classrooms" on public.classrooms;

create policy "teacher manages own classrooms"
  on public.classrooms for all to authenticated
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

create policy "students view joined classrooms"
  on public.classrooms for select to authenticated
  using (public.has_classroom_membership(id));

-- classroom_members
drop policy if exists "teacher views members"           on public.classroom_members;
drop policy if exists "teacher removes members"         on public.classroom_members;
drop policy if exists "student views own membership"    on public.classroom_members;
drop policy if exists "student leaves classroom"        on public.classroom_members;
drop policy if exists "members view classroom roster"   on public.classroom_members;

create policy "teacher views members"
  on public.classroom_members for select to authenticated
  using (public.is_classroom_teacher(classroom_id));

create policy "teacher removes members"
  on public.classroom_members for delete to authenticated
  using (public.is_classroom_teacher(classroom_id));

create policy "student views own membership"
  on public.classroom_members for select to authenticated
  using (student_id = auth.uid());

create policy "student leaves classroom"
  on public.classroom_members for delete to authenticated
  using (student_id = auth.uid());

-- approved students can see their classmates (read-only dashboard)
create policy "members view classroom roster"
  on public.classroom_members for select to authenticated
  using (public.is_classroom_member(classroom_id));

-- teacher_notifications
drop policy if exists "teacher reads own notifications"   on public.teacher_notifications;
drop policy if exists "teacher updates own notifications" on public.teacher_notifications;

create policy "teacher reads own notifications"
  on public.teacher_notifications for select to authenticated
  using (teacher_id = auth.uid());

create policy "teacher updates own notifications"
  on public.teacher_notifications for update to authenticated
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

-- quiz_results: teachers read their classroom students' results;
-- approved students read their classmates' results (read-only dashboard).
-- (Inert while RLS is disabled on quiz_results; active the moment you enable it.)
drop policy if exists "teacher views classroom results"    on public.quiz_results;
drop policy if exists "students view classmates results"   on public.quiz_results;

create policy "teacher views classroom results"
  on public.quiz_results for select to authenticated
  using (
    exists (
      select 1
      from public.classroom_members cm
      join public.classrooms c on c.id = cm.classroom_id
      where cm.student_id = quiz_results.user_id
        and cm.status = 'approved'
        and c.teacher_id = auth.uid()
    )
  );

create policy "students view classmates results"
  on public.quiz_results for select to authenticated
  using (
    exists (
      select 1
      from public.classroom_members me
      join public.classroom_members them on them.classroom_id = me.classroom_id
      where me.student_id = auth.uid()
        and me.status = 'approved'
        and them.student_id = quiz_results.user_id
        and them.status = 'approved'
    )
  );

-- ------------------------------------------------------------
-- 5. join_classroom RPC — creates a PENDING join request.
--    The teacher must approve it before the student becomes
--    a member of the classroom.
-- ------------------------------------------------------------
create or replace function public.join_classroom(p_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_classroom classrooms%rowtype;
  v_status    text;
  v_count     integer;
  v_user      uuid := auth.uid();
  v_email     text;
  v_name      text;
begin
  if v_user is null then
    return json_build_object('success', false, 'code', 'not_authenticated');
  end if;

  select * into v_classroom
  from classrooms
  where upper(classrooms.code) = upper(trim(p_code))
  for update; -- lock the row so two students can't race past the limit

  if not found then
    return json_build_object('success', false, 'code', 'not_found');
  end if;

  if v_classroom.teacher_id = v_user then
    return json_build_object('success', false, 'code', 'own_classroom');
  end if;

  select status into v_status
  from classroom_members
  where classroom_id = v_classroom.id and student_id = v_user;

  if found then
    if v_status = 'approved' then
      return json_build_object('success', false, 'code', 'already_member',
                               'classroom_name', v_classroom.name);
    else
      return json_build_object('success', false, 'code', 'already_pending',
                               'classroom_name', v_classroom.name);
    end if;
  end if;

  select count(*) into v_count
  from classroom_members
  where classroom_id = v_classroom.id and status = 'approved';

  if v_count >= v_classroom.student_limit then
    return json_build_object('success', false, 'code', 'full',
                             'classroom_name', v_classroom.name);
  end if;

  select email,
         coalesce(raw_user_meta_data->>'full_name',
                  raw_user_meta_data->>'name',
                  email)
    into v_email, v_name
  from auth.users
  where id = v_user;

  insert into classroom_members (classroom_id, student_id, student_email, student_name, status)
  values (v_classroom.id, v_user, lower(v_email), v_name, 'pending');

  return json_build_object('success', true, 'code', 'request_sent',
                           'classroom_name', v_classroom.name);
end;
$$;

grant execute on function public.join_classroom(text) to authenticated;

-- ------------------------------------------------------------
-- 6. approve_join_request RPC — teacher approves a pending
--    student. Re-checks capacity atomically.
-- ------------------------------------------------------------
create or replace function public.approve_join_request(p_member_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member    classroom_members%rowtype;
  v_classroom classrooms%rowtype;
  v_count     integer;
begin
  select * into v_member from classroom_members where id = p_member_id;
  if not found then
    return json_build_object('success', false, 'code', 'not_found');
  end if;

  select * into v_classroom
  from classrooms
  where id = v_member.classroom_id
  for update;

  if v_classroom.teacher_id is distinct from auth.uid() then
    return json_build_object('success', false, 'code', 'not_allowed');
  end if;

  if v_member.status = 'approved' then
    return json_build_object('success', false, 'code', 'already_approved');
  end if;

  select count(*) into v_count
  from classroom_members
  where classroom_id = v_classroom.id and status = 'approved';

  if v_count >= v_classroom.student_limit then
    return json_build_object('success', false, 'code', 'full');
  end if;

  update classroom_members set status = 'approved' where id = p_member_id;

  return json_build_object('success', true, 'code', 'approved',
                           'student_name', v_member.student_name);
end;
$$;

grant execute on function public.approve_join_request(uuid) to authenticated;

-- ------------------------------------------------------------
-- 7. Triggers
-- ------------------------------------------------------------

-- 7a. Notify the teacher when a student requests to join
create or replace function public.notify_teacher_on_join_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'pending' then
    insert into teacher_notifications (
      teacher_id, classroom_id, classroom_name,
      student_id, student_email, student_name,
      type, member_id
    )
    select c.teacher_id, c.id, c.name,
           new.student_id, new.student_email, new.student_name,
           'join_request', new.id
    from classrooms c
    where c.id = new.classroom_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_notify_join_request on public.classroom_members;
create trigger trg_notify_join_request
  after insert on public.classroom_members
  for each row
  execute function public.notify_teacher_on_join_request();

-- 7b. Notify teachers when an APPROVED classroom student saves a result
create or replace function public.notify_teachers_on_result()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into teacher_notifications (
    teacher_id, classroom_id, classroom_name,
    student_id, student_email, student_name,
    type, section_name, questions_count, answered_count, wrongs_count, time_spent
  )
  select c.teacher_id, c.id, c.name,
         new.user_id, new.student_email, cm.student_name,
         'result', new.section_name, new.questions_count, new.answered_count,
         new.wrongs_count, new.time_spent
  from classroom_members cm
  join classrooms c on c.id = cm.classroom_id
  where cm.student_id = new.user_id
    and cm.status = 'approved';

  return new;
end;
$$;

drop trigger if exists trg_notify_teachers_on_result on public.quiz_results;
create trigger trg_notify_teachers_on_result
  after insert on public.quiz_results
  for each row
  execute function public.notify_teachers_on_result();

-- ------------------------------------------------------------
-- 8. Realtime for the notification bell
-- ------------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.teacher_notifications;
exception
  when duplicate_object then null; -- already added
end;
$$;
