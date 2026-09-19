import { use } from "react";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Reveal } from "@/components/primitives/Reveal";
import { Booker } from "@/components/schedule/Booker";
import { buildMetadata } from "@/lib/seo/metadata";
import type { Locale } from "@/lib/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "schedule" });
  return buildMetadata({
    title: t("heading"),
    description: t("subheading"),
    path: "/schedule",
    locale: locale as Locale,
  });
}

export default function SchedulePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("schedule");

  return (
    <main
      id="main"
      className="mx-auto min-h-dvh max-w-5xl px-[var(--space-6)] pt-[var(--space-32)] pb-[var(--space-24)]"
    >
      <Reveal as="h1" className="font-display text-[length:var(--text-4xl)] leading-[var(--leading-tight)]">
        {t("heading")}
      </Reveal>
      <Reveal as="p" delay={0.05} className="mt-[var(--space-4)] max-w-[var(--measure)] text-dim">
        {t("subheading")}
      </Reveal>

      <div className="mt-[var(--space-12)]">
        <Booker />
      </div>
    </main>
  );
}
