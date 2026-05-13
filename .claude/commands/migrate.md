---
description: Create a new Supabase migration with our naming convention and RLS scaffold.
---

Description: $ARGUMENTS

1. Generate a timestamp prefix (YYYYMMDDHHMMSS).
2. Slug the description (lowercase, hyphens, ≤50 chars).
3. Create `supabase/migrations/<ts>_<slug>.sql` with header:
   ```
   -- Migration: <description>
   -- Created: <iso date>
   -- Reversible: <yes/no — fill in>
   ```
4. Invoke @agent-supabase-architect to draft the SQL based on the description.
5. After approval: `supabase db reset` locally to test, then `pnpm db:types`.
6. Stage the migration + regenerated types together.
