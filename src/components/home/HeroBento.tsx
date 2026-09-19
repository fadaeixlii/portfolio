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
 * cards — cells differ in span so the eye reads structure, not a template.
 * `grid-cols-3` already resolves to `repeat(3, minmax(0, 1fr))`, so the
 * image-bearing identity cell gets the required `minmax(0, 1fr)` track for
 * free.
 */
export function HeroBento() {
  const t = useTranslations("home.hero");
  const stage = useBootStage();
  const resolved = stage >= 3;

  return (
    <div className="grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-3 md:grid-rows-4">
      {/* Identity — tall, start column. */}
      <Surface
        className="flex flex-col gap-[var(--space-4)] p-[var(--space-6)] md:col-start-1 md:row-span-4 md:row-start-1"
      >
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
            Mohammad M. Khani
          </span>
          <span className="text-[length:var(--text-sm)] text-dim">
            {t("role")}
          </span>
        </div>
        <div className="mt-auto flex gap-[var(--space-4)] text-[length:var(--text-sm)] text-dim">
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

      {/* Headline — wide, spans two columns. Resolves at boot stage 3. */}
      <Surface
        variant="glass-refracted"
        className="flex flex-col justify-center p-[var(--space-8)] md:col-span-2 md:col-start-2 md:row-start-1"
      >
        <motion.h1
          initial={false}
          animate={
            resolved ? { opacity: 1, y: 0 } : { opacity: 0.35, y: 6 }
          }
          transition={{ duration: MOTION.dur.slow, ease: EASE.out }}
          className="font-display text-[length:var(--text-4xl)] tracking-[var(--tracking-display)] leading-[var(--leading-tight)]"
        >
          <span className="block text-text">{t("headline.line1")}</span>
          <span className="block text-dim">{t("headline.line2")}</span>
        </motion.h1>
      </Surface>

      {/* Stat cell — full width of the right block: three mono readouts
          need room a single narrow column can't give them. */}
      <Surface className="flex items-center p-[var(--space-6)] md:col-span-2 md:col-start-2 md:row-start-2">
        <StatRow />
      </Surface>

      {/* Signal cell — the one amber-filled cell, primary CTA. */}
      <Surface
        as={Link}
        href="/schedule"
        variant="flat"
        className="group flex items-center justify-between gap-[var(--space-4)] bg-signal p-[var(--space-6)] text-signal-ink transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] hover:-translate-y-0.5 md:col-span-2 md:col-start-2 md:row-start-3"
      >
        <span className="font-display text-[length:var(--text-xl)]">
          {t("cta.heading")}
        </span>
        <span className="text-[length:var(--text-sm)]">{t("cta.sub")}</span>
      </Surface>

      {/* Capability cells — one line each, no icons. */}
      <Surface className="flex items-center p-[var(--space-6)] md:col-start-2 md:row-start-4">
        <p className="text-[length:var(--text-base)] text-text">
          {t("capabilities.one")}
        </p>
      </Surface>
      <Surface className="flex items-center p-[var(--space-6)] md:col-start-3 md:row-start-4">
        <p className="text-[length:var(--text-base)] text-text">
          {t("capabilities.two")}
        </p>
      </Surface>
    </div>
  );
}
