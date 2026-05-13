---
name: supabase-nextjs-integration
description: Use this skill when working with Supabase in Next.js — client/server helpers, middleware auth refresh, RLS-aware queries, and type-safe operations.
allowed-tools: Read, Write, Edit, Bash
---

# Supabase + Next.js Integration

IMPORTANT: Use `@supabase/ssr`, NEVER `@supabase/auth-helpers-nextjs`.

## Client creation patterns

### Server Component / Server Action
```tsx
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data } = await supabase.from('projects').select('*')
```

### Client Component
```tsx
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
```

### Middleware (token refresh)
```tsx
import { createServerClient } from '@supabase/ssr'
// Refresh session tokens on every request
```

## RLS-aware queries
- Public data: no auth needed, RLS handles filtering by `status = 'published'`
- Admin mutations: user must be authenticated with admin role
- Always use `.select()` to narrow columns for performance
- Use `.single()` for slug-based lookups

## Type safety
- Types are generated from schema: `pnpm db:types`
- Import from `@/types/database`
- Use `Tables<'projects'>` for row types
