import { use } from "react";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { getExperience } from "@/content";
import { Timeline } from "@/components/experience/Timeline";

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
      className="mx-auto min-h-dvh max-w-5xl px-[var(--space-6)] pt-[var(--space-32)] pb-[var(--space-24)]"
    >
      <h1 className="font-display text-[length:var(--text-4xl)] leading-[var(--leading-tight)]">
        {t("heading")}
      </h1>
      <p className="mt-[var(--space-4)] max-w-[var(--measure)] text-dim">
        {t("subheading")}
      </p>

      <div className="mt-[var(--space-16)]">
        <Timeline entries={entries} />
      </div>
    </main>
  );
}
