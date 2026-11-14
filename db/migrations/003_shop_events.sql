-- Visits to a shop page and taps on its WhatsApp button, for the owner's
-- email alerts (src/app/api/shop/event). No IP address is stored: `visitor`
-- is a peppered sha256 of the IP and the UTC date, so it changes every day
-- and only says "the same person, today".
-- ponytail: never pruned, like shop_verify_attempts. Rows are tiny.

create table if not exists shop_events (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('visit', 'whatsapp')),
  product_id text not null,
  visitor text not null,
  -- Host name only (instagram.com), never the full URL.
  referrer text,
  locale text,
  emailed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists shop_events_visitor_created_idx
  on shop_events (visitor, created_at desc);

create index if not exists shop_events_created_idx
  on shop_events (created_at desc);
