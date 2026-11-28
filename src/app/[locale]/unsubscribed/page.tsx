import { use } from "react";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHead } from "@/components/layout/PageHead";
import { buildMetadata } from "@/lib/seo/metadata";
import type { Locale } from "@/lib/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "unsubscribed" });
  return {
    ...buildMetadata({
      title: t("metaTitle"),
      description: t("metaDescription"),
      path: "/unsubscribed",
      locale: locale as Locale,
    }),
    // Reached only from an email's unsubscribe link; nothing for a search index.
    robots: { index: false },
  };
}

/** Where /api/shop/unsubscribe/<token> lands once the address is off the list. */
export default function UnsubscribedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("unsubscribed");
  return (
    <main
      id="main"
      className="min-h-dvh px-[var(--space-6)] pt-[var(--shell-top)] pb-[var(--space-22)]"
    >
      <PageHead line1={t("line1")} line2={t("line2")} sub={t("sub")} />
    </main>
  );
}
