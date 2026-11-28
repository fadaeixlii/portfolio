-- Free PDFs by email (src/app/api/shop/lead) and the list that builds: one
-- row per address and product. Everyone who asks joins the list (the form
-- says so beside its button). The unsubscribe link marks every row of that
-- address; asking again clears the mark on all of them.
--
-- The token is stored as is, not hashed like the download tokens in 002:
-- every later email to the list needs it to build its unsubscribe link, and
-- all it can do is take one address off the list.

create table if not exists shop_leads (
  id uuid primary key default gen_random_uuid(),
  -- Trimmed and lowercased by the route.
  email text not null,
  product_id text not null,
  locale text not null,
  created_at timestamptz not null default now(),
  -- When the PDF last went out. Null if the last send failed, so the
  -- visitor may retry at once instead of waiting out the resend window.
  last_sent_at timestamptz,
  unsubscribe_token text not null unique default encode(gen_random_bytes(32), 'hex'),
  unsubscribed_at timestamptz,
  -- Email first, so this is also the index on email.
  unique (email, product_id)
);

-- Each request is also a shop_events row, for the per-visitor limit and the
-- shared daily cap on owner alerts. Widens the kind check from 004; old
-- 'download' rows stay valid.
alter table shop_events drop constraint if exists shop_events_kind_check;

alter table shop_events
  add constraint shop_events_kind_check
  check (kind in ('visit', 'whatsapp', 'download', 'signup'));
