"use client";

import { m } from "motion/react";
import { useTranslations } from "next-intl";
import { EASE, MOTION } from "@/lib/motion";
import { Link } from "@/lib/i18n/navigation";
import { useBootStage } from "./BootSequence";

/**
 * The home hero. Two display lines — the first solid, the second outlined
 * (see `.headline-outline` in globals.css) — then the bio and the two ways
 * in. Identity moved out to the sticky aside in the locale layout; it was
 * duplicated here and in the footer.
 */
export function HeroBento() {
  const t = useTranslations("home.hero");
  const tSections = useTranslations("home.sections");
  const stage = useBootStage();
  const resolved = stage >= 3;

  return (
    <div className="flex flex-col gap-[var(--space-8)]">
      <m.h1
        initial={false}
        animate={resolved ? { opacity: 1, y: 0 } : { opacity: 0.35, y: 6 }}
        transition={{ duration: MOTION.dur.slow, ease: EASE.out }}
        dir="auto"
        className="font-display text-[length:var(--text-display)] font-extrabold uppercase tracking-[var(--tracking-display)] leading-[var(--leading-display)]"
      >
        <span className="block text-text">{t("headline.line1")}</span>
        <span className="headline-outline block">{t("headline.line2")}</span>
      </m.h1>

      <p
        dir="auto"
        className="max-w-[46ch] text-[length:var(--text-lg)] text-dim"
      >
        {t("bio")}
      </p>

      <div className="flex flex-wrap items-center gap-[var(--space-4)]">
        <Link
          href="/schedule"
          className="bg-signal px-[var(--space-6)] py-[var(--space-3)] text-[length:12px] font-semibold uppercase tracking-wide text-signal-ink transition-[filter] duration-[var(--dur-fast)] hover:brightness-110"
        >
          {t("cta.heading")}
        </Link>
        <Link
          href="/work"
          className="border-2 border-hairline px-[var(--space-6)] py-[var(--space-3)] text-[length:12px] font-semibold uppercase tracking-wide text-text transition-[border-color] duration-[var(--dur-fast)] hover:border-signal"
        >
          {tSections("work.viewAll")}
        </Link>
        <span className="text-[length:var(--text-sm)] text-dim" dir="auto">
          {t("cta.sub")}
        </span>
      </div>
    </div>
  );
}
