import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Hairline } from "@/components/primitives/Hairline";

export function SiteFooter() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tHero = useTranslations("home.hero");

  return (
    <footer className="mt-[var(--space-32)] px-[var(--space-6)] pb-[var(--space-12)]">
      <Hairline className="mb-[var(--space-12)]" />
      <div className="mx-auto grid max-w-5xl gap-[var(--space-8)] md:grid-cols-[1.4fr_1fr_1fr]">
        <p
          className="max-w-[20ch] font-display font-extrabold leading-[0.94]"
          style={{ fontSize: "clamp(26px, 3.6vw, 40px)" }}
        >
          {t("statement")}
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/work"
            className="text-[length:12px] font-semibold uppercase tracking-wide text-dim hover:text-text"
          >
            {tNav("work")}
          </Link>
          <Link
            href="/experience"
            className="text-[length:12px] font-semibold uppercase tracking-wide text-dim hover:text-text"
          >
            {tNav("experience")}
          </Link>
          <Link
            href="/stack"
            className="text-[length:12px] font-semibold uppercase tracking-wide text-dim hover:text-text"
          >
            {tNav("stack")}
          </Link>
          <Link
            href="/schedule"
            className="text-[length:12px] font-semibold uppercase tracking-wide text-signal-text hover:underline"
          >
            {t("cta")}
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-[length:var(--text-sm)] text-text">{tHero("name")}</p>
          <p className="text-[length:var(--text-sm)] text-dim">{tHero("location")}</p>
          <p className="text-[length:var(--text-sm)] text-dim">{t("remote")}</p>
          <a
            href="https://github.com/fadaeixlii"
            className="text-[length:12px] font-semibold uppercase tracking-wide text-dim hover:text-text"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/mohammadmkh/"
            className="text-[length:12px] font-semibold uppercase tracking-wide text-dim hover:text-text"
          >
            LinkedIn
          </a>
          <p className="text-[length:12px] text-dim">© 2026</p>
        </div>
      </div>
    </footer>
  );
}
