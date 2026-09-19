import createMiddleware from "next-intl/middleware";
import { routing } from "@/lib/i18n/routing";

// Named `proxy` per Next.js 16. A file called middleware.ts is ignored.
export const proxy = createMiddleware(routing);
export default proxy;

export const config = {
  // Everything except API routes, Next internals, admin, and files with an
  // extension. `admin` is excluded because it is deliberately unlocalised.
  matcher: "/((?!api|_next|_vercel|admin|.*\\..*).*)",
};
