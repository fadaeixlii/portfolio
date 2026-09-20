import { use } from "react";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHead } from "@/components/layout/PageHead";
import { buildMetadata } from "@/lib/seo/metadata";
import type { Locale } from "@/lib/i18n/routing";

// The heaviest component on the site's primary conversion page (react-hook-form
// + zod resolver + motion + its own sub-tree) — split into its own chunk
// instead of the initial /schedule bundle. No `ssr: false`: it's the page's
// main content, so it still needs to render on the server for first paint.
const Booker = dynamic(() =>
  import("@/components/schedule/Booker").then((m) => m.Booker),
);

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
      className="min-h-dvh px-[var(--space-6)] pt-[var(--shell-top)] pb-[var(--space-22)]"
    >
      <PageHead line1={t("line1")} line2={t("line2")} sub={t("subheading")} />

      <div className="mt-[var(--space-12)]">
        <Booker />
      </div>
    </main>
  );
}
