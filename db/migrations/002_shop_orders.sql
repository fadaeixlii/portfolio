-- Shop orders for the stablecoin checkout (src/app/api/shop/*).
--
-- One row per "show me where to pay" click. It becomes 'paid' once a
-- transaction hash is verified on chain, and from then on it carries the
-- sha256 of the download token (never the token itself) and a download count.

create table if not exists shop_orders (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  chain text not null check (chain in ('eth', 'tron')),
  token text not null check (token in ('USDT', 'USDC')),
  -- Token base units (6 decimals for USDT/USDC): 6 USDT = 6000000.
  amount bigint not null check (amount > 0),
  address text not null,
  ip text,
  status text not null default 'pending'
    check (status in ('pending', 'paid')),
  -- Normalised lowercase: 0x-prefixed on eth, bare hex on tron.
  tx_hash text,
  download_token_hash text,
  downloads integer not null default 0,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- A transaction pays for one order, ever. Arbitrated here rather than by a
-- read-then-write in the route, so two buyers pasting the same hash in the
-- same second cannot both win.
create unique index if not exists shop_orders_tx_unique
  on shop_orders (chain, tx_hash)
  where tx_hash is not null;

create unique index if not exists shop_orders_download_token_unique
  on shop_orders (download_token_hash)
  where download_token_hash is not null;

create index if not exists shop_orders_ip_created_idx
  on shop_orders (ip, created_at desc);

-- Verify attempts, for the per-IP limiter on /api/shop/verify. Each one may
-- cost three calls to a public node, so they are capped like orders are.
-- ponytail: never pruned. Rows are tiny; add a "delete where created_at <
-- now() - interval '1 day'" job if the table ever gets big.
create table if not exists shop_verify_attempts (
  id bigint generated always as identity primary key,
  ip text not null,
  created_at timestamptz not null default now()
);

create index if not exists shop_verify_attempts_ip_created_idx
  on shop_verify_attempts (ip, created_at desc);
