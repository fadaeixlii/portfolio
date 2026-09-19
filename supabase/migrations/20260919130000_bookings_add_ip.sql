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
