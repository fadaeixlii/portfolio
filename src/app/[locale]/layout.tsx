import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, isRtl, type Locale } from "@/lib/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import { buildMetadata } from "@/lib/seo/metadata";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { MotionProvider } from "@/components/layout/MotionProvider";
import { GlassFilter } from "@/components/primitives/GlassFilter";
import { SkipLink } from "@/components/layout/SkipLink";
import { NavPill } from "@/components/layout/NavPill";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteAside } from "@/components/layout/SiteAside";
import "@/styles/globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home.hero" });
  // Sitewide fallback — any page that doesn't call buildMetadata itself
  // (there shouldn't be one) inherits this instead of a bare title.
  return buildMetadata({
    title: t("name"),
    description: `${t("role")}, ${t("location")}`,
    path: "",
    locale: locale as Locale,
  });
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      dir={isRtl(locale) ? "rtl" : "ltr"}
      className={fontVariables}
      suppressHydrationWarning
    >
      {/* Grammarly and similar extensions write `data-gr-ext-installed` and
          `data-new-gr-c-s-check-loaded` onto <body> before React hydrates,
          which React reports as a hydration mismatch the app cannot fix.
          Suppressing on <html> alone does not cover it — the attributes land
          on <body>. This suppresses attribute diffs one level deep only, so a
          real mismatch inside the tree still reports. */}
      <body suppressHydrationWarning>
        <GlassFilter />
        <ThemeProvider>
          <NextIntlClientProvider>
            <MotionProvider>
              {/* Skip link — the first tabbable thing on every page. */}
              <SkipLink />
              <NavPill />
              {/* The shell: sticky identity column beside the page.
                  `items-start` is load-bearing — a stretched flex item is
                  already full height and `position: sticky` has nothing to
                  travel through. Neither column carries horizontal padding:
                  each side brings its own, so a page never pays for it twice.
                  Content is first in the DOM and `order` moves the aside to
                  the inline start from `lg` up. */}
              <div className="mx-auto flex max-w-[1180px] flex-wrap items-start">
                <div className="order-1 w-full min-w-0 lg:order-2 lg:w-auto lg:flex-[999_1_480px]">
                  {children}
                </div>
                <SiteAside />
              </div>
              <SiteFooter />
            </MotionProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
