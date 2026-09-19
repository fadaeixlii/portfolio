import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client for the login form. `@supabase/ssr` persists
 * the resulting session in cookies (not just localStorage), so the next
 * request `createServerClient()` reads already carries it.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
