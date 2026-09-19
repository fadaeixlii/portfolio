import { use } from "react";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getStack } from "@/content";
import { StackGrid } from "@/components/stack/StackGrid";
import { PageHead } from "@/components/layout/PageHead";
import { buildMetadata } from "@/lib/seo/metadata";
import type { Locale } from "@/lib/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "stack" });
  return buildMetadata({
    title: t("heading"),
    description: t("subheading"),
    path: "/stack",
    locale: locale as Locale,
  });
}

export default function StackPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("stack");
  const groups = getStack();

  return (
    <main
      id="main"
      className="min-h-dvh px-[var(--space-6)] pt-[var(--space-24)] pb-[var(--space-22)]"
    >
      <PageHead line1={t("line1")} line2={t("line2")} sub={t("subheading")} />

      <div className="mt-[var(--space-22)]">
        <StackGrid groups={groups} />
      </div>
    </main>
  );
}
