import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Hairline } from "@/components/primitives/Hairline";

export function SiteFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="mt-[var(--space-32)] px-[var(--space-6)] pb-[var(--space-12)]">
      <Hairline className="mb-[var(--space-12)]" />
      <div className="mx-auto flex max-w-5xl flex-col gap-[var(--space-8)] md:flex-row md:items-end md:justify-between">
        <p className="max-w-[20ch] text-[length:var(--text-3xl)] font-display leading-[var(--leading-tight)]">
          {t("statement")}
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/schedule"
            className="text-[length:var(--text-lg)] text-signal hover:underline"
          >
            {t("cta")}
          </Link>
          <a
            href="https://github.com/fadaeixlii"
            className="text-[length:var(--text-sm)] text-dim hover:text-text"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/mohammadmkh/"
            className="text-[length:var(--text-sm)] text-dim hover:text-text"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
