import createMiddleware from "next-intl/middleware";
import { routing } from "@/lib/i18n/routing";

// Named `proxy` per Next.js 16. A file called middleware.ts is ignored.
export const proxy = createMiddleware(routing);
export default proxy;

export const config = {
  // Everything except API routes, Next internals, admin, auth, and files
  // with an extension. `admin` and `auth` are excluded because both are
  // deliberately unlocalised — running them through this middleware would
  // redirect /auth/login to /en/auth/login, which doesn't exist and breaks
  // the Supabase session cookie's expected path.
  matcher: "/((?!api|_next|_vercel|admin|auth|.*\\..*).*)",
};
