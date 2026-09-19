import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, isRtl, type Locale } from "@/lib/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import { buildMetadata } from "@/lib/seo/metadata";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { GlassFilter } from "@/components/primitives/GlassFilter";
import { SkipLink } from "@/components/layout/SkipLink";
import { NavPill } from "@/components/layout/NavPill";
import { SiteFooter } from "@/components/layout/SiteFooter";
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
    description: `${t("role")} — ${t("location")}`,
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
      <body>
        <GlassFilter />
        <ThemeProvider>
          <NextIntlClientProvider>
            {/* Skip link — the first tabbable thing on every page. */}
            <SkipLink />
            <NavPill />
            {children}
            <SiteFooter />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
