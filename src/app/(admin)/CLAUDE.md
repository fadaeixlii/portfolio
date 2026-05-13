# Admin CMS context

This route group is auth-gated. Every page here MUST verify admin role at the
server level (`@/lib/supabase/server` + `getUser()` + check `app_metadata.role`).

## Rules
- All admin pages are RSC by default — only opt into 'use client' for forms.
- Forms use React Hook Form + Zod resolver, server actions for mutation.
- After every mutation, call POST /api/revalidate with the relevant tags.
- Image uploads go to admin-uploads (private) first, promote to public bucket on publish.
- Never expose Supabase secret key client-side. Service role only in /api routes.

## Layout
- Sidebar nav: Dashboard, Projects, Case Studies, Blog, Playground, Messages, Settings
- Top bar: theme toggle, signed-in email, sign out
- Mobile: drawer pattern via shadcn Sheet

## Failure modes to handle
- Token expired mid-edit → middleware refreshes; if refresh fails, redirect to /auth/login with returnTo
- Concurrent edit conflict → optimistic locking via updated_at column
- 5MB+ image upload → client-side resize before upload, max 8MB hard cap
