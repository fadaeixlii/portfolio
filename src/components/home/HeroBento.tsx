"use client";

import { m } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { EASE, MOTION } from "@/lib/motion";
import { Link } from "@/lib/i18n/navigation";
import { useBootStage } from "./BootSequence";
import { isRtl } from "@/lib/i18n/routing";

/**
 * One headline line, resolving a character at a time.
 *
 * Splitting is LTR-only and that is not a nicety: Arabic script shapes each
 * letter from its neighbours, and wrapping every character in its own span
 * severs the joins, so Farsi would render as disconnected letterforms. RTL
 * keeps the whole line and fades it as a block.
 *
 * The characters are `aria-hidden` and the real text is on the parent's
 * `aria-label`, or a screen reader would announce the line letter by letter.
 * `-webkit-text-stroke` inherits, so the outlined line stays outlined.
 */
function SplitLine({
  text,
  className,
  play,
  delay = 0,
}: {
  text: string;
  className: string;
  play: boolean;
  delay?: number;
}) {
  return (
    <span className={className} aria-hidden>
      {Array.from(text).map((char, i) => (
        <m.span
          key={`${char}-${i}`}
          initial={false}
          animate={play ? { opacity: 1, y: 0 } : { opacity: 0, y: "0.12em" }}
          transition={{
            duration: MOTION.dur.base,
            ease: EASE.out,
            delay: play ? delay + i * 0.022 : 0,
          }}
          // inline-block so y actually moves it; a plain span would not shift.
          // The non-breaking space keeps word gaps from collapsing.
          className="inline-block whitespace-pre"
        >
          {char === " " ? " " : char}
        </m.span>
      ))}
    </span>
  );
}

/**
 * The home hero. Two display lines — the first solid, the second outlined
 * (see `.headline-outline` in globals.css) — then the bio and the two ways
 * in. Identity moved out to the sticky aside in the locale layout; it was
 * duplicated here and in the footer.
 */
export function HeroBento() {
  const t = useTranslations("home.hero");
  const tSections = useTranslations("home.sections");
  const locale = useLocale();
  const rtl = isRtl(locale);
  const stage = useBootStage();
  const resolved = stage >= 3;

  return (
    <div className="flex flex-col gap-[var(--space-8)]">
      <m.h1
        initial={false}
        animate={resolved ? { opacity: 1, y: 0 } : { opacity: 0.35, y: 6 }}
        transition={{ duration: MOTION.dur.slow, ease: EASE.out }}
        dir="auto"
        aria-label={`${t("headline.line1")} ${t("headline.line2")} ${t("headline.line3")}`}
        className="font-display text-[length:var(--text-4xl)] font-extrabold uppercase tracking-[var(--tracking-display)] leading-[var(--leading-display)] [overflow-wrap:normal]"
      >
        {rtl ? (
          <>
            <span className="block text-text">{t("headline.line1")}</span>
            <span className="block text-text">{t("headline.line2")}</span>
            <span className="headline-outline block">{t("headline.line3")}</span>
          </>
        ) : (
          <>
            <SplitLine text={t("headline.line1")} className="block text-text" play={resolved} />
            <SplitLine
              text={t("headline.line2")}
              className="block text-text"
              play={resolved}
              delay={0.12}
            />
            <SplitLine
              text={t("headline.line3")}
              className="headline-outline block"
              play={resolved}
              // The outlined line trails the solid ones rather than racing them.
              delay={0.24}
            />
          </>
        )}
      </m.h1>

      {/* No box: the words are the claim and the arrow carries it. A
          bordered chip made it read as a button. */}
      <p className="flex items-center gap-[var(--space-3)] text-[length:var(--text-sm)] font-semibold uppercase tracking-[0.14em]">
        <span dir="auto" className="text-dim">{t("zeroWord")}</span>
        <svg
          viewBox="0 0 28 12"
          aria-hidden
          className="h-3 w-7 shrink-0 text-signal-text rtl:-scale-x-100"
        >
          <path
            d="M0 6h24M19 1l5 5-5 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
          />
        </svg>
        <span dir="auto" className="text-text">{t("oneWord")}</span>
      </p>

      <p
        dir="auto"
        className="max-w-[46ch] text-[length:var(--text-lg)] text-dim"
      >
        {t("bio")}
      </p>

      <div className="flex flex-wrap items-center gap-[var(--space-4)]">
        <Link
          href="/schedule"
          className="bg-signal-fill px-[var(--space-6)] py-[var(--space-3)] text-[length:12px] font-semibold uppercase tracking-wide text-signal-ink transition-[filter] duration-[var(--dur-fast)] hover:brightness-110"
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
