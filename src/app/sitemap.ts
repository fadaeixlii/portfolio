import type { MetadataRoute } from "next";
import { routing } from "@/lib/i18n/routing";
import { getProjects } from "@/content";
import { SITE_URL } from "@/lib/seo/metadata";

const STATIC = ["", "/work", "/experience", "/stack", "/schedule", "/contact"];

/** /styleguide, /admin and /auth are deliberately absent — dev tooling and
 *  a private admin tool, neither meant for a search index. robots.ts
 *  disallows all three too. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [...STATIC, ...getProjects().map((p) => `/work/${p.slug}`)];

  return routing.locales.flatMap((locale) =>
    paths.map((path) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${SITE_URL}/${l}${path}`]),
        ),
      },
    })),
  );
}
