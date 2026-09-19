import "server-only";
import { cookies } from "next/headers";
import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";

/**
 * Cookie-backed Supabase client for Server Components — carries the
 * visitor's own auth session (RLS-scoped), never the service-role key.
 * Used only to gate `/admin`: `auth.getUser()` revalidates the session
 * against the auth server instead of trusting the cookie's own claims.
 */
export async function createServerClient() {
  const cookieStore = await cookies();
  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // A Server Component can't set cookies — there's no response to
            // attach them to. Only the login route needs the write side;
            // reads here are unaffected.
          }
        },
      },
    },
  );
}
