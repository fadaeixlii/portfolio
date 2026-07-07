-- Migration: Add contact_rate_limited() controlled read path for anon rate limiting
-- Created: 2026-07-07
-- Reversible: yes

-- Anon-callable rate check (security definer, locked search_path).
-- Lets the anon role check "has this email exceeded 3 messages/hour"
-- without granting SELECT on contact_messages (contents stay admin-only).
create or replace function public.contact_rate_limited(p_email text)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select count(*) >= 3
  from public.contact_messages
  where email = p_email
    and created_at >= now() - interval '1 hour'
$$;

grant execute on function public.contact_rate_limited(text) to anon, authenticated;

-- DOWN:
-- revoke execute on function public.contact_rate_limited(text) from anon, authenticated;
-- drop function public.contact_rate_limited(text);
