-- Migration: Create contact_messages table with RLS
-- Created: 2026-05-13
-- Reversible: yes

-- Utility: updated_at trigger function (reusable across tables)
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Utility: admin check function (security definer, locked search_path)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
as $$
  select coalesce(
    (select (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'),
    false
  )
$$;

-- Table
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  status text not null default 'unread'
    check (status in ('unread', 'read', 'replied', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.contact_messages enable row level security;

-- Public can insert (anyone can send a message)
create policy "contact_messages_insert_public" on public.contact_messages
  for insert with check (true);

-- Only admin can read
create policy "contact_messages_select_admin" on public.contact_messages
  for select using ((select public.is_admin()));

-- Only admin can update
create policy "contact_messages_update_admin" on public.contact_messages
  for update using ((select public.is_admin()));

-- Only admin can delete
create policy "contact_messages_delete_admin" on public.contact_messages
  for delete using ((select public.is_admin()));

-- updated_at trigger
create trigger set_updated_at
  before update on public.contact_messages
  for each row execute function public.handle_updated_at();

-- DOWN:
-- drop trigger set_updated_at on public.contact_messages;
-- drop table public.contact_messages;
-- drop function public.is_admin();
-- drop function public.handle_updated_at();
