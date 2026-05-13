# Supabase RLS Patterns

> Row Level Security policy reference for fadaeixlii.com.

## is_admin() function

```sql
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
as $$
  select coalesce(
    (select (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'),
    false
  )
$$;
```

## Standard policy pattern

```sql
-- Enable RLS
alter table public.<table_name> enable row level security;

-- Public read (published only)
create policy "<table>_select_published" on public.<table_name>
  for select using (status = 'published');

-- Admin full access (always wrap is_admin in subquery for initPlan caching)
create policy "<table>_insert_admin" on public.<table_name>
  for insert with check ((select public.is_admin()));

create policy "<table>_update_admin" on public.<table_name>
  for update using ((select public.is_admin()));

create policy "<table>_delete_admin" on public.<table_name>
  for delete using ((select public.is_admin()));
```

## updated_at trigger

```sql
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at
  before update on public.<table_name>
  for each row execute function public.handle_updated_at();
```

<!-- TODO: Add table-specific policies as schema evolves -->
