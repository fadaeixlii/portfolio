import { use } from "react";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHead } from "@/components/layout/PageHead";
import { buildMetadata } from "@/lib/seo/metadata";
import type { Locale } from "@/lib/i18n/routing";

const PRIVACY_EMAIL = "mo@fadaeixlii.dev";

const H2 = "font-display text-[length:var(--text-xl)] font-bold text-text";
const P = "mt-[var(--space-3)] max-w-[var(--measure)] text-[length:var(--text-base)] text-text";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  return buildMetadata({
    title: t("heading"),
    description: t("subheading"),
    path: "/privacy",
    locale: locale as Locale,
  });
}

export default function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("privacy");
  const mail = {
    email: PRIVACY_EMAIL,
    link: (chunks: React.ReactNode) => (
      // Underlined at rest: inside a sentence, colour alone fails axe's
      // link-in-text-block.
      <a href={`mailto:${PRIVACY_EMAIL}`} className="text-signal-text underline underline-offset-2">
        {chunks}
      </a>
    ),
  };

  // Every claim in the `privacy` messages describes code: src/app/api/{contact,
  // book,booking}, src/lib/email, src/lib/calendar, db/migrations, proxy.ts.
  // Change what that code collects or who it sends to, change this copy.
  return (
    <main
      id="main"
      className="min-h-dvh px-[var(--space-6)] pt-[var(--shell-top)] pb-[var(--space-22)]"
    >
      <PageHead line1={t("line1")} line2={t("line2")} sub={t("subheading")} />

      <p dir="auto" className="mt-[var(--space-6)] text-[length:var(--text-sm)] text-dim">
        {t.rich("updated", {
          date: (chunks) => <time dateTime="2026-10-06">{chunks}</time>,
        })}
      </p>

      <div className="mt-[var(--space-16)] flex flex-col gap-[var(--space-12)]">
        <section>
          <h2 dir="auto" className={H2}>{t("who.title")}</h2>
          <p dir="auto" className={P}>{t.rich("who.body", mail)}</p>
        </section>

        <section>
          <h2 dir="auto" className={H2}>{t("browsing.title")}</h2>
          <p dir="auto" className={P}>{t("browsing.body")}</p>
          <p dir="auto" className={P}>{t("browsing.cloudflare")}</p>
        </section>

        <section>
          <h2 dir="auto" className={H2}>{t("device.title")}</h2>
          <ul className="mt-[var(--space-3)] flex max-w-[var(--measure)] list-disc flex-col gap-[var(--space-2)] ps-[var(--space-6)] text-[length:var(--text-base)] text-text">
            <li dir="auto">{t("device.theme")}</li>
            <li dir="auto">{t("device.intro")}</li>
            <li dir="auto">{t("device.locale")}</li>
          </ul>
          <p dir="auto" className={P}>{t("device.note")}</p>
        </section>

        <section>
          <h2 dir="auto" className={H2}>{t("contact.title")}</h2>
          <p dir="auto" className={P}>{t("contact.body")}</p>
        </section>

        <section>
          <h2 dir="auto" className={H2}>{t("booking.title")}</h2>
          <p dir="auto" className={P}>{t("booking.stored")}</p>
          <p dir="auto" className={P}>{t("booking.calendar")}</p>
          <p dir="auto" className={P}>{t("booking.email")}</p>
        </section>

        <section>
          <h2 dir="auto" className={H2}>{t("retention.title")}</h2>
          <p dir="auto" className={P}>{t("retention.body")}</p>
        </section>

        <section>
          <h2 dir="auto" className={H2}>{t("rights.title")}</h2>
          <p dir="auto" className={P}>{t.rich("rights.body", mail)}</p>
        </section>
      </div>
    </main>
  );
}
