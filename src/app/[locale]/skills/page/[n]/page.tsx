import { use } from "react";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PAGES, SkillsList } from "@/components/shop/SkillsList";
import { buildMetadata } from "@/lib/seo/metadata";
import type { Locale } from "@/lib/i18n/routing";

// Page 1 lives at /skills; /skills/page/2 onward is prerendered, anything else 404s.
export const dynamicParams = false;
export function generateStaticParams() {
  return Array.from({ length: PAGES - 1 }, (_, i) => ({ n: String(i + 2) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; n: string }>;
}): Promise<Metadata> {
  const { locale, n } = await params;
  const t = await getTranslations({ locale, namespace: "skills" });
  return buildMetadata({
    title: `${t("metaTitle")} (${t("page", { n })})`,
    description: t("metaDescription"),
    path: `/skills/page/${n}`,
    locale: locale as Locale,
  });
}

export default function SkillsPageN({
  params,
}: {
  params: Promise<{ locale: string; n: string }>;
}) {
  const { locale, n } = use(params);
  setRequestLocale(locale);
  return <SkillsList page={Number(n)} />;
}
