# Database context

## Migration rules
- Filename: YYYYMMDDHHMMSS_short_description.sql
- Always reversible (include DOWN comments even though Supabase doesn't auto-run them)
- Test locally via `supabase db reset` before pushing
- Regenerate types after every successful migration: `pnpm db:types`

## RLS pattern (every public-schema table)
- `alter table enable row level security`
- Separate policies for select/insert/update/delete (never `for all`)
- Public reads = `status = 'published'`
- Admin writes = `(select public.is_admin())` — ALWAYS wrap in subquery for initPlan caching
- `is_admin()` is `security definer` with locked `search_path`

## Naming
- Tables: plural snake_case (projects, blog_posts)
- Columns: snake_case
- Slugs: citext unique
- IDs: uuid primary key default gen_random_uuid()
- Timestamps: timestamptz not null default now() + updated_at trigger
