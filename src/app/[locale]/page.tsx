import { use } from "react";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

// ThemeToggle and LocaleSwitch now live in the global NavPill (mounted in
// the locale layout) — a second pair here duplicated them on every page and
// broke strict-mode role queries in the test suite.
export default function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);

  // Must run before any next-intl hook, or the route falls back to dynamic.
  setRequestLocale(locale);

  const t = useTranslations("nav");

  return (
    <main id="main" className="min-h-dvh p-8">
      <h1 className="mt-24 text-[length:var(--text-display)] tracking-[var(--tracking-display)] leading-[var(--leading-display)]">
        {t("home")}
      </h1>
    </main>
  );
}
