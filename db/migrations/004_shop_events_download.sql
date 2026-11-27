-- A tap on a free product's download button is counted like a visit or a
-- WhatsApp tap (src/app/api/shop/event). Widens the kind check from 003;
-- `shop_events_kind_check` is the name Postgres gave that inline check.

alter table shop_events drop constraint if exists shop_events_kind_check;

alter table shop_events
  add constraint shop_events_kind_check
  check (kind in ('visit', 'whatsapp', 'download'));
