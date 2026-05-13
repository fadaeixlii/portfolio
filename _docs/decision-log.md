# Decision Log (ADRs)

> Append-only log of architectural decisions for fadaeixlii.com.

## ADR-001: Cloudflare Pages over Vercel

**Date:** 2026-05-13
**Status:** Accepted
**Context:** Need a hosting platform for a portfolio that solicits client work (commercial use).
**Decision:** Use Cloudflare Pages instead of Vercel.
**Reasoning:**
- Vercel Hobby plan restricts commercial use; portfolio soliciting clients may violate ToS
- Awwwards SOTD traffic spikes could hit Hobby limits
- Cloudflare Pages has generous free tier with no commercial restriction
- Cloudflare Registrar for domain = simpler DNS management
- EU edge network matches target audience (Netherlands-based)
**Consequences:** Need @opennextjs/cloudflare adapter. Some Next.js features may need edge-compatible alternatives.

## ADR-002: Supabase over headless CMS

**Date:** 2026-05-13
**Status:** Accepted
**Context:** Need a backend for projects, blog posts, contact form, and admin CMS.
**Decision:** Use Supabase (Postgres + Auth + Storage) instead of a headless CMS.
**Reasoning:**
- Aligns with "more code, more flexibility" preference
- Free tier sufficient for portfolio scale
- RLS provides row-level security without middleware
- Magic link auth = zero password management
- Avoids $20-100/mo CMS bill
**Consequences:** More custom code for admin UI. Must manage schema migrations manually.
