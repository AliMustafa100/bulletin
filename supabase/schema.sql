-- =============================================================================
-- Bulletin — Supabase schema
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Extensions
-- -----------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- 2. Enums
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'application_status') then
    create type public.application_status as enum (
      'not_applied',
      'applied',
      'awaiting_response',
      'interview',
      'accepted',
      'rejected'
    );
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- 3. Profiles (optional but useful — extends auth.users)
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'One row per authenticated Bulletin user.';

-- Auto-create profile when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 4. Job applications
-- -----------------------------------------------------------------------------
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  title text not null default '',
  company text not null default '',
  status public.application_status not null default 'not_applied',
  job_description text not null default '',

  -- Matches your app's StoredDocument shape:
  -- Text:  { "type": "text", "content": "..." }
  -- PDF:   { "type": "pdf", "content": "<storage-path>", "fileName": "resume.pdf" }
  tailored_resume jsonb,
  tailored_cv jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint applications_tailored_resume_shape check (
    tailored_resume is null
    or (
      tailored_resume ? 'type'
      and tailored_resume ? 'content'
      and (tailored_resume ->> 'type') in ('text', 'pdf')
    )
  ),

  constraint applications_tailored_cv_shape check (
    tailored_cv is null
    or (
      tailored_cv ? 'type'
      and tailored_cv ? 'content'
      and (tailored_cv ->> 'type') in ('text', 'pdf')
    )
  )
);

comment on table public.applications is 'Job applications tracked in Bulletin.';
comment on column public.applications.tailored_resume is 'JSON: { type, content, fileName? }. PDF content should be a Storage path, not base64.';
comment on column public.applications.tailored_cv is 'JSON: { type, content, fileName? }. PDF content should be a Storage path, not base64.';

create index if not exists applications_user_id_idx
  on public.applications (user_id);

create index if not exists applications_status_idx
  on public.applications (status);

create index if not exists applications_created_at_idx
  on public.applications (created_at desc);

create index if not exists applications_user_created_idx
  on public.applications (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- 5. updated_at trigger
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
  before update on public.applications
  for each row
  execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 6. Row Level Security (RLS)
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.applications enable row level security;

-- Profiles: users can read/update their own profile
drop policy if exists "Profiles: select own" on public.profiles;
create policy "Profiles: select own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Profiles: update own" on public.profiles;
create policy "Profiles: update own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Applications: users can only access their own rows
drop policy if exists "Applications: select own" on public.applications;
create policy "Applications: select own"
  on public.applications
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Applications: insert own" on public.applications;
create policy "Applications: insert own"
  on public.applications
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Applications: update own" on public.applications;
create policy "Applications: update own"
  on public.applications
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Applications: delete own" on public.applications;
create policy "Applications: delete own"
  on public.applications
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 7. Storage bucket for PDF resumes / CVs
-- Path convention: {user_id}/{application_id}/resume.pdf
--                   {user_id}/{application_id}/cv.pdf
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'application-documents',
  'application-documents',
  false,
  4194304, -- 4 MB (matches your app limit)
  array['application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Users can read their own files
drop policy if exists "Docs: select own" on storage.objects;
create policy "Docs: select own"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'application-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can upload into their own folder
drop policy if exists "Docs: insert own" on storage.objects;
create policy "Docs: insert own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'application-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own files
drop policy if exists "Docs: update own" on storage.objects;
create policy "Docs: update own"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'application-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'application-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own files
drop policy if exists "Docs: delete own" on storage.objects;
create policy "Docs: delete own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'application-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- -----------------------------------------------------------------------------
-- 8. Helpful view (optional)
-- -----------------------------------------------------------------------------
create or replace view public.applications_with_labels as
select
  a.*,
  case a.status
    when 'not_applied' then 'Not Applied'
    when 'applied' then 'Applied'
    when 'awaiting_response' then 'Awaiting Response'
    when 'interview' then 'Interview'
    when 'accepted' then 'Accepted'
    when 'rejected' then 'Rejected'
  end as status_label
from public.applications a;

comment on view public.applications_with_labels is 'Applications with human-readable status labels.';

-- Grant access to authenticated users (RLS still applies on underlying table)
grant select on public.applications_with_labels to authenticated;

-- -----------------------------------------------------------------------------
-- Done
-- -----------------------------------------------------------------------------
-- Next steps:
-- 1. Enable Email auth in Supabase → Authentication → Providers
-- 2. Copy your Project URL + anon key into the app
-- 3. When saving PDFs, upload to Storage and store the path in tailored_resume / tailored_cv JSON
