import { use } from "react";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/contact/ContactForm";
import { PageHead } from "@/components/layout/PageHead";
import { SCHEDULE_CONFIG } from "@/lib/calendar/config";
import { buildMetadata } from "@/lib/seo/metadata";
import type { Locale } from "@/lib/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return buildMetadata({
    title: t("heading"),
    description: t("subheading"),
    path: "/contact",
    locale: locale as Locale,
  });
}

export default function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("contact");

  return (
    <main
      id="main"
      className="min-h-dvh px-[var(--space-6)] pt-[var(--shell-top)] pb-[var(--space-22)]"
    >
      <PageHead line1={t("line1")} line2={t("line2")} sub={t("subheading")} />

      <div className="mt-[var(--space-22)]">
        <ContactForm />
      </div>

      {/* No phone number — the canon forbids publishing it. Label and value
          are separate elements: a joined "Email — address" string is the
          middle-dot meta pattern under another punctuation mark. */}
      <div className="mt-[var(--space-22)] border-t-2 border-hairline pt-[var(--space-6)]">
        <p className="text-[length:var(--text-xs)] font-semibold uppercase tracking-wide text-dim">
          {t("direct.heading")}
        </p>
        <dl className="mt-[var(--space-4)] flex flex-col gap-[var(--space-3)]">
          <div className="flex flex-wrap items-baseline gap-x-[var(--space-4)] gap-y-1">
            <dt className="w-20 shrink-0 text-[length:var(--text-sm)] text-dim">
              {t("direct.email")}
            </dt>
            <dd>
              <a
                href={`mailto:${SCHEDULE_CONFIG.contactEmail}`}
                className="text-[length:var(--text-base)] text-signal-text hover:underline"
              >
                {SCHEDULE_CONFIG.contactEmail}
              </a>
            </dd>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-[var(--space-4)] gap-y-1">
            <dt className="w-20 shrink-0 text-[length:var(--text-sm)] text-dim">
              {t("direct.github")}
            </dt>
            <dd>
              <a
                href="https://github.com/fadaeixlii"
                className="text-[length:var(--text-base)] text-signal-text hover:underline"
              >
                github.com/fadaeixlii
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </main>
  );
}
