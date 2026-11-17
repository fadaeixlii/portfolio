import { use } from "react";
import type { Metadata } from "next";
import { useFormatter, useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHead } from "@/components/layout/PageHead";
import { Reveal } from "@/components/primitives/Reveal";
import { BeforeAfter } from "@/components/shop/BeforeAfter";
import { Checkout } from "@/components/shop/Checkout";
import { ResultVideo } from "@/components/shop/ResultVideo";
import { TrackVisit, WhatsAppLink } from "@/components/shop/Track";
import { buildMetadata } from "@/lib/seo/metadata";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n/routing";

// The shop pages are the only place the site shows a phone number: the owner
// allowed WhatsApp on them (2026-11-14). Everywhere else the canon's no-phone rule holds.
const WHATSAPP = "447828796868";

const H2 = "font-display text-[length:var(--text-3xl)] font-extrabold leading-[var(--leading-tight)] text-text";
const H3 = "font-display text-[length:var(--text-xl)] font-bold text-text";
const SUB = "mt-[var(--space-3)] max-w-[var(--measure)] text-[length:var(--text-base)] text-dim";
const LINK = "text-signal-text underline underline-offset-2";
const BTN = "inline-flex h-11 items-center justify-center rounded-[var(--radius-full)] px-6 text-[length:var(--text-base)] font-medium";

/** Measured on the demo bakery: Lighthouse 12, phone setting (the skill's own run, 2026-11-17). */
const SCORES = [
  { key: "performance", before: 74, after: 99 },
  { key: "accessibility", before: 79, after: 100 },
  { key: "bestPractices", before: 68, after: 100 },
  { key: "seo", before: 91, after: 100 },
  { key: "photo", before: 11.4, after: 2, unit: "second" },
  { key: "weight", before: 1953, after: 289, unit: "kilobyte" },
] as const;

/** The skill's signature: a row of lights, the old site dark, the new one switched on. */
function Lights({ on, className }: { on: number; className?: string }) {
  return (
    <div aria-hidden className={cn("relative flex items-center justify-between", className)}>
      <span className="absolute inset-x-0 top-1/2 h-px bg-hairline" />
      {Array.from({ length: 12 }, (_, i) => (
        <span
          key={i}
          className={cn(
            "relative size-3 rounded-[var(--radius-full)]",
            i < 12 - on ? "border border-hairline bg-paper" : "bg-signal shadow-[0_0_14px_var(--signal)]",
          )}
        />
      ))}
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "lightsOn" });
  return buildMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/skills/lights-on",
    locale: locale as Locale,
  });
}

export default function LightsOnPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("lightsOn");
  const format = useFormatter();
  const whatsapp = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(t("whatsappText"))}`;
  const fixes = ["phone", "weight", "tap"] as const;
  const steps = ["capture", "facts", "build", "pitch"] as const;
  const audiences = ["freelancers", "owners"] as const;
  const inside = ["skill", "scripts", "design", "example"] as const;
  const compare = {
    beforeLabel: t("compare.before"),
    afterLabel: t("compare.after"),
    sliderLabel: t("compare.slider"),
  };
  const links = {
    playwright: (chunks: React.ReactNode) => (
      <a href="https://github.com/microsoft/playwright" className={LINK}>{chunks}</a>
    ),
    lighthouse: (chunks: React.ReactNode) => (
      <a href="https://github.com/GoogleChrome/lighthouse" className={LINK}>{chunks}</a>
    ),
    ffmpeg: (chunks: React.ReactNode) => (
      <a href="https://github.com/eugeneware/ffmpeg-static" className={LINK}>{chunks}</a>
    ),
  };
  const value = (n: number, unit?: string) =>
    unit
      ? format.number(n, { style: "unit", unit, unitDisplay: "short", minimumFractionDigits: unit === "second" ? 1 : 0 })
      : format.number(n);

  return (
    <main
      id="main"
      className="min-h-dvh px-[var(--space-6)] pt-[var(--shell-top)] pb-[var(--space-22)]"
    >
      <TrackVisit productId="lights-on" />
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-[var(--space-12)] lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="min-w-0">
          <PageHead line1={t("line1")} line2={t("line2")} sub={t("sub")} />
          <Reveal className="mt-[var(--space-8)] flex flex-wrap items-center gap-[var(--space-4)]">
            <p className="font-display text-[length:var(--text-2xl)] font-bold text-text">{t("price")}</p>
            <a href="#buy" className={cn(BTN, "bg-signal-fill text-signal-ink hover:brightness-110")}>
              {t("buyCta")}
            </a>
            <WhatsAppLink
              productId="lights-on"
              href={whatsapp}
              className={cn(BTN, "border border-hairline text-text hover:border-signal hover:text-signal-text")}
            >
              {t("whatsappCta")}
            </WhatsAppLink>
          </Reveal>
        </div>
        <BeforeAfter
          {...compare}
          before="/shop/lights-on/before-phone.webp"
          after="/shop/lights-on/after-phone.webp"
          width={720}
          height={1558}
          beforeAlt={t("compare.phoneBeforeAlt")}
          afterAlt={t("compare.phoneAfterAlt")}
          caption={t("compare.phoneCaption")}
          sizes="352px"
          eager
          className="w-full max-w-[22rem] justify-self-center"
        />
      </div>

      <Lights on={6} className="mt-[var(--space-16)]" />

      <section aria-labelledby="results" className="mt-[var(--space-12)]">
        <h2 id="results" className={H2}>{t("results.heading")}</h2>
        <p dir="auto" className={SUB}>{t("results.sub")}</p>
        <div className="mt-[var(--space-8)] grid items-start gap-[var(--space-8)] lg:grid-cols-2">
          <BeforeAfter
            {...compare}
            before="/shop/lights-on/before-desktop.webp"
            after="/shop/lights-on/after-desktop.webp"
            width={1200}
            height={892}
            beforeAlt={t("compare.desktopBeforeAlt")}
            afterAlt={t("compare.desktopAfterAlt")}
            caption={t("compare.desktopCaption")}
            sizes="(min-width: 1024px) 45vw, 100vw"
          />
          <ResultVideo name="pitch" product="lights-on" label={t("results.pitch")} wide />
          {/* TODO(reel): once public/shop/lights-on/reel.mp4 + reel.jpg exist, add
              <ResultVideo name="reel" product="lights-on" label={t("results.reel")} />
              here and a "results.reel" label in all five message files. */}
        </div>

        <table className="mt-[var(--space-12)] w-full max-w-[var(--measure)] border-collapse text-[length:var(--text-base)]">
          <caption dir="auto" className="pb-[var(--space-3)] text-start text-[length:var(--text-sm)] text-dim">
            {t("scores.caption")}
          </caption>
          <thead>
            <tr className="border-b border-hairline">
              <th scope="col" className="py-[var(--space-2)] text-start font-medium text-dim">{t("scores.metric")}</th>
              <th scope="col" className="py-[var(--space-2)] ps-[var(--space-4)] text-end font-medium text-dim">{t("scores.before")}</th>
              <th scope="col" className="py-[var(--space-2)] ps-[var(--space-4)] text-end font-medium text-dim">{t("scores.after")}</th>
            </tr>
          </thead>
          <tbody>
            {SCORES.map((row) => (
              <tr key={row.key} className="border-b border-hairline">
                <th scope="row" dir="auto" className="py-[var(--space-3)] text-start font-normal text-text">
                  {t(`scores.${row.key}`)}
                </th>
                <td className="whitespace-nowrap py-[var(--space-3)] ps-[var(--space-4)] text-end font-mono tabular-nums text-dim">
                  {value(row.before, "unit" in row ? row.unit : undefined)}
                </td>
                <td className="whitespace-nowrap py-[var(--space-3)] ps-[var(--space-4)] text-end font-mono font-bold tabular-nums text-signal-text">
                  {value(row.after, "unit" in row ? row.unit : undefined)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p dir="auto" className="mt-[var(--space-4)] max-w-[var(--measure)] border-s-2 border-signal ps-[var(--space-4)] text-[length:var(--text-base)] text-text">
          {t("scores.facts")}
        </p>
      </section>

      <section aria-labelledby="fixes" className="mt-[var(--space-22)]">
        <h2 id="fixes" className={H2}>{t("fixes.heading")}</h2>
        <p dir="auto" className={SUB}>{t("fixes.sub")}</p>
        <ol className="mt-[var(--space-8)] grid gap-[var(--space-8)] md:grid-cols-3">
          {fixes.map((fix, i) => (
            <li key={fix} className="border-t-2 border-signal pt-[var(--space-4)]">
              <span aria-hidden className="font-mono text-[length:var(--text-sm)] text-signal-text">{i + 1}</span>
              <h3 dir="auto" className={cn(H3, "mt-[var(--space-2)]")}>{t(`fixes.${fix}.title`)}</h3>
              <p dir="auto" className="mt-[var(--space-2)] text-[length:var(--text-base)] text-dim">{t(`fixes.${fix}.body`)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="how" className="mt-[var(--space-22)]">
        <h2 id="how" className={H2}>{t("how.heading")}</h2>
        <ol className="mt-[var(--space-8)] grid gap-[var(--space-8)] md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step} className="border-t-2 border-hairline pt-[var(--space-4)]">
              <span aria-hidden className="font-mono text-[length:var(--text-sm)] text-signal-text">{i + 1}</span>
              <h3 dir="auto" className={cn(H3, "mt-[var(--space-2)]")}>{t(`how.${step}.title`)}</h3>
              <p dir="auto" className="mt-[var(--space-2)] text-[length:var(--text-base)] text-dim">{t(`how.${step}.body`)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="who" className="mt-[var(--space-22)]">
        <h2 id="who" className={H2}>{t("who.heading")}</h2>
        <div className="mt-[var(--space-8)] grid gap-[var(--space-8)] md:grid-cols-2">
          {audiences.map((who) => (
            <div key={who} className="border border-hairline bg-surface p-[var(--space-6)]">
              <h3 dir="auto" className={H3}>{t(`who.${who}.title`)}</h3>
              <p dir="auto" className="mt-[var(--space-2)] text-[length:var(--text-base)] text-dim">{t(`who.${who}.body`)}</p>
            </div>
          ))}
        </div>
        <p dir="auto" className="mt-[var(--space-8)] max-w-[var(--measure)] border-s-2 border-signal ps-[var(--space-4)] text-[length:var(--text-lg)] text-text">
          {t("who.rule")}
        </p>
      </section>

      <div className="mt-[var(--space-22)] grid gap-[var(--space-12)] md:grid-cols-2">
        <section aria-labelledby="inside">
          <h2 id="inside" className={H2}>{t("inside.heading")}</h2>
          <ul className="mt-[var(--space-6)] flex flex-col gap-[var(--space-3)]">
            {inside.map((item) => (
              <li key={item} dir="auto" className="border-s-2 border-signal ps-[var(--space-4)] text-[length:var(--text-base)] text-text">
                {t(`inside.${item}`)}
              </li>
            ))}
          </ul>
        </section>
        <div className="flex flex-col gap-[var(--space-12)]">
          <section aria-labelledby="needs">
            <h2 id="needs" className={H2}>{t("needs.heading")}</h2>
            <p dir="auto" className={SUB}>{t("needs.body")}</p>
          </section>
          <section aria-labelledby="credits">
            <h2 id="credits" className={H2}>{t("credits.heading")}</h2>
            <p dir="auto" className={SUB}>{t.rich("credits.body", links)}</p>
          </section>
        </div>
      </div>

      <Lights on={12} className="mt-[var(--space-22)]" />

      <section id="buy" aria-labelledby="buy-heading" className="mt-[var(--space-12)] grid gap-[var(--space-12)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <h2 id="buy-heading" className={H2}>{t("buy.heading")}</h2>
          <p dir="auto" className={SUB}>{t("buy.sub")}</p>
          <WhatsAppLink
            productId="lights-on"
            href={whatsapp}
            className={cn(BTN, "mt-[var(--space-6)] border border-hairline text-text hover:border-signal hover:text-signal-text")}
          >
            {t("whatsappCta")}
          </WhatsAppLink>
        </div>
        <div className="border border-hairline bg-surface p-[var(--space-6)]">
          <Checkout productId="lights-on" />
        </div>
      </section>

      <section aria-labelledby="faq" className="mt-[var(--space-22)] max-w-[var(--measure)]">
        <h2 id="faq" className={H2}>{t("faq.heading")}</h2>
        <div className="mt-[var(--space-6)] flex flex-col">
          {(["1", "2", "3"] as const).map((n) => (
            <details key={n} className="border-b border-hairline py-[var(--space-4)]">
              <summary dir="auto" className="cursor-pointer text-[length:var(--text-lg)] font-medium text-text">
                {t(`faq.q${n}`)}
              </summary>
              <p dir="auto" className="mt-[var(--space-3)] text-[length:var(--text-base)] text-dim">{t(`faq.a${n}`)}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
