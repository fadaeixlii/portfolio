import type { Metadata } from "next";
import { routing, type Locale } from "@/lib/i18n/routing";

const SITE_NAME = "Mohammad M. Khani";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mohammadmkh.dev";

/**
 * Every page calls this — no page hand-rolls its own `<meta>`. `path` is
 * locale-free (`""`, `"/work"`, `"/work/some-slug"`); every URL below is
 * built by prefixing it with a locale.
 */
export function buildMetadata({
  title,
  description,
  path,
  locale,
}: {
  title: string;
  description: string;
  path: string;
  locale: Locale;
}): Metadata {
  const url = `${SITE_URL}/${locale}${path}`;
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = `${SITE_URL}/${l}${path}`;
  }
  languages["x-default"] = `${SITE_URL}/en${path}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: `${title} — ${SITE_NAME}`,
    description,
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale,
      type: "website",
      // No `images` here: the co-located opengraph-image.tsx file convention
      // supplies it automatically for this route segment.
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
