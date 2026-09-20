import { use } from "react";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getExperience } from "@/content";
import { Timeline } from "@/components/experience/Timeline";
import { PageHead } from "@/components/layout/PageHead";
import { buildMetadata } from "@/lib/seo/metadata";
import type { Locale } from "@/lib/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "experience" });
  return buildMetadata({
    title: t("heading"),
    description: t("subheading"),
    path: "/experience",
    locale: locale as Locale,
  });
}

export default function ExperiencePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("experience");
  const entries = getExperience();

  return (
    <main
      id="main"
      className="min-h-dvh px-[var(--space-6)] pt-[var(--shell-top)] pb-[var(--space-22)]"
    >
      <PageHead line1={t("line1")} line2={t("line2")} sub={t("subheading")} />

      <div className="mt-[var(--space-22)]">
        <Timeline entries={entries} />
      </div>
    </main>
  );
}
