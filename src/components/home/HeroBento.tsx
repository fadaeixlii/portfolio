"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Surface } from "@/components/primitives/Surface";
import { EASE, MOTION } from "@/lib/motion";
import { Link } from "@/lib/i18n/navigation";
import { useBootStage } from "./BootSequence";
import { StatRow } from "./StatRow";

/**
 * The home hero. A CSS grid of instrument modules, not a row of identical
 * cards — cells differ in size because each sizes to its own content, not
 * because a template forces them level. Identity lives in column 1 as one
 * grid item; the headline/stats/CTA/capabilities stack lives in a nested
 * flex column filling columns 2-3 as the *other* grid item, so the two
 * columns size independently instead of sharing row tracks (the mechanism
 * that used to stretch every short cell to the tall identity column's
 * height). `items-start` stops either column stretching to match the taller
 * one.
 */
export function HeroBento() {
  const t = useTranslations("home.hero");
  const stage = useBootStage();
  const resolved = stage >= 3;

  return (
    <div className="grid grid-cols-1 items-start gap-[var(--space-4)] md:grid-cols-3">
      {/* Identity — sized to its own content, not to the rest of the grid. */}
      <Surface className="flex flex-col gap-[var(--space-4)] p-[var(--space-6)] md:col-start-1">
        <div className="relative aspect-square w-full overflow-hidden rounded-[var(--radius-md)]">
          <Image
            src="/images/portrait.jpg"
            alt=""
            fill
            sizes="(min-width: 768px) 25vw, 90vw"
            className="object-cover"
            priority
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-display text-[length:var(--text-xl)] text-text">
            {t("name")}
          </span>
          <span className="text-[length:var(--text-sm)] text-dim">
            {t("role")}
          </span>
          <span className="text-[length:var(--text-sm)] text-dim">
            {t("location")}
          </span>
        </div>
        <div className="flex gap-[var(--space-4)] text-[length:var(--text-sm)] text-dim">
          <a
            href="https://github.com/fadaeixlii"
            className="transition-[color] duration-[var(--dur-fast)] hover:text-text"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/mohammadmkh/"
            className="transition-[color] duration-[var(--dur-fast)] hover:text-text"
          >
            LinkedIn
          </a>
        </div>
      </Surface>

      <div className="flex flex-col gap-[var(--space-4)] md:col-span-2 md:col-start-2">
        {/* Headline — resolves at boot stage 3. `flat`, not glass: this cell
            holds the LCP text and is the largest backdrop-filter area on the
            page, which delays first paint. The nav pill stays glass because
            it's small. */}
        <Surface
          variant="flat"
          className="flex flex-col justify-center p-[var(--space-8)]"
        >
          <motion.h1
            initial={false}
            animate={
              resolved ? { opacity: 1, y: 0 } : { opacity: 0.35, y: 6 }
            }
            transition={{ duration: MOTION.dur.slow, ease: EASE.out }}
            className="font-display text-[length:var(--text-display)] tracking-[var(--tracking-display)] leading-[var(--leading-display)]"
          >
            <span className="block text-text">{t("headline.line1")}</span>
            <span className="block text-dim">{t("headline.line2")}</span>
          </motion.h1>
        </Surface>

        {/* Stat cell — three mono readouts need room a narrow column can't give. */}
        <Surface className="flex items-center p-[var(--space-6)]">
          <StatRow />
        </Surface>

        {/* Signal cell — the one amber-filled cell, primary CTA. Hugs its
            own one line of copy instead of stretching into a slab. */}
        <Surface
          as={Link}
          href="/schedule"
          variant="flat"
          className="group flex items-center justify-between gap-[var(--space-4)] bg-signal p-[var(--space-6)] text-signal-ink transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] hover:-translate-y-0.5"
        >
          <span className="font-display text-[length:var(--text-xl)]">
            {t("cta.heading")}
          </span>
          <span className="text-[length:var(--text-sm)]">{t("cta.sub")}</span>
        </Surface>

        {/* Capability cells — one line each, no icons. Prose, so `flat`:
            glass is for chrome, headings and single-line labels only. */}
        <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2">
          <Surface variant="flat" className="flex items-center p-[var(--space-6)]">
            <p className="text-[length:var(--text-base)] text-text">
              {t("capabilities.one")}
            </p>
          </Surface>
          <Surface variant="flat" className="flex items-center p-[var(--space-6)]">
            <p className="text-[length:var(--text-base)] text-text">
              {t("capabilities.two")}
            </p>
          </Surface>
        </div>
      </div>
    </div>
  );
}
