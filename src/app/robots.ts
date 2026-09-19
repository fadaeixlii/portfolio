import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /admin and /auth are true top-level paths (unlocalised — the proxy
      // matcher excludes them). /styleguide lives under every locale
      // (/en/styleguide, /de/styleguide, ...), hence the wildcard.
      disallow: ["/admin", "/auth", "/*/styleguide"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
