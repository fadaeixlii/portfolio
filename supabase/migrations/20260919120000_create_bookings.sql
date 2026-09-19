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
