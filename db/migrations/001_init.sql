-- Portfolio schema on plain Postgres.
--
-- Carried over from the Supabase migrations, minus the parts that only meant
-- something there:
--
--   * RLS and its policies. They existed because Supabase hands a database
--     connection to the browser. Nothing here does — every query runs in a
--     route handler over a server-only connection — so a policy engine would
--     guard a door that has no other side.
--   * `is_admin()`, which read `auth.jwt()`. There is no Supabase JWT now;
--     the admin session is a signed cookie (src/lib/auth.ts).
--   * grants to `anon` / `authenticated`, roles that do not exist here.
--
-- What is kept is the part that actually enforces a rule: the partial unique
-- index below.

create extension if not exists pgcrypto;

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  ip text,
  status text not null default 'unread'
    check (status in ('unread', 'read', 'replied', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contact_messages_ip_created_idx
  on contact_messages (ip, created_at desc);
create index if not exists contact_messages_email_created_idx
  on contact_messages (email, created_at desc);

create table if not exists bookings (
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
  ip text,
  status text not null default 'confirmed'
    check (status in ('confirmed', 'cancelled', 'orphaned')),
  google_event_id text,
  meet_url text
);

-- The double-booking guarantee, and the reason this is Postgres and not a
-- file-backed database: two visitors submitting the same slot in the same
-- second are arbitrated here, by the index, not by application code that
-- reads-then-writes and loses the race. Cancelled rows are excluded so a
-- freed slot becomes bookable again.
create unique index if not exists bookings_slot_unique
  on bookings (start_at)
  where status <> 'cancelled';

create index if not exists bookings_start_at_idx on bookings (start_at);
create index if not exists bookings_email_created_idx
  on bookings (email, created_at desc);
create index if not exists bookings_ip_created_idx
  on bookings (ip, created_at desc);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists contact_messages_set_updated_at on contact_messages;
create trigger contact_messages_set_updated_at
  before update on contact_messages
  for each row execute function set_updated_at();
