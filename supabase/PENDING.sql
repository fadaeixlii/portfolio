-- Pending migrations, concatenated for the Supabase SQL editor.
-- The contact_messages migrations are already applied on the project;
-- these three are not. Verified 2026-09-20 against the live REST API:
--   /rest/v1/contact_messages -> []           (exists)
--   /rest/v1/bookings          -> PGRST205    (missing)
--
-- Paste the whole file into Supabase > SQL Editor > New query and run.
-- Safe to re-run: every statement is either guarded with IF NOT EXISTS /
-- OR REPLACE, or naturally idempotent (ENABLE ROW LEVEL SECURITY on a table
-- that already has it is a no-op, not an error).

-- ======================================================================
-- 20260919120000_create_bookings.sql
-- ======================================================================
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  start_at timestamptz not null,
  end_at timestamptz not null,
  name text not null,
  email text not null,
  topic text,
  notes text,
  locale text not null default 'en',
  visitor_tz text not null,
  status text not null default 'confirmed'
    check (status in ('confirmed', 'cancelled', 'orphaned')),
  google_event_id text,
  meet_url text
);

-- The double-booking guarantee. Cancelled rows are excluded so a freed slot
-- becomes bookable again. Application code never arbitrates this race.
create unique index if not exists bookings_slot_unique
  on public.bookings (start_at)
  where status <> 'cancelled';

create index if not exists bookings_start_at_idx on public.bookings (start_at);
create index if not exists bookings_email_created_idx
  on public.bookings (email, created_at desc);

alter table public.bookings enable row level security;
-- No policies: every read and write goes through the service key in a route
-- handler. An anon client must never see who booked what.

-- ======================================================================
-- 20260919130000_bookings_add_ip.sql
-- ======================================================================
-- Migration: add client IP to bookings, for IP-keyed rate limiting
-- Created: 2026-09-19
-- Reversible: yes
--
-- Email is attacker-chosen (spec §3.5), so the per-email cap alone lets a
-- script that varies the address fill the calendar. IP is the primary key
-- for the rate limit; the email cap stays as a second, additive check.

alter table public.bookings add column if not exists ip text;

create index if not exists bookings_ip_created_idx
  on public.bookings (ip, created_at desc);

-- DOWN:
-- drop index if exists public.bookings_ip_created_idx;
-- alter table public.bookings drop column if exists ip;

-- ======================================================================
-- 20260919140000_contact_messages_add_ip.sql
-- ======================================================================
-- Migration: add client IP to contact_messages, for IP-keyed rate limiting
-- Created: 2026-09-19
-- Reversible: yes
--
-- Mirrors 20260919130000_bookings_add_ip.sql: IP is not attacker-chosen the
-- way the email field is, so it is the primary rate-limit key for
-- /api/contact too.

alter table public.contact_messages add column if not exists ip text;

create index if not exists contact_messages_ip_created_idx
  on public.contact_messages (ip, created_at desc);

-- DOWN:
-- drop index if exists public.contact_messages_ip_created_idx;
-- alter table public.contact_messages drop column if exists ip;

