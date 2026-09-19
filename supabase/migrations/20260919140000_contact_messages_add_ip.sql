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
