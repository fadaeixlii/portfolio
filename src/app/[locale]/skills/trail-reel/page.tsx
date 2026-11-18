import { use } from "react";
import type { Metadata } from "next";
import { useFormatter, useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHead } from "@/components/layout/PageHead";
import { Reveal } from "@/components/primitives/Reveal";
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
const ROW = "flex flex-wrap items-baseline justify-between gap-x-[var(--space-4)]";

/** The three real runs: one sentence each, in a fresh Claude Code with only
 *  the skill installed (2026-11-18). Minutes are "about", as measured. */
const RUNS = [
  { world: "world", km: 13631, minutes: 2 },
  { world: "dolomites", km: 78.3, minutes: 10 },
  { world: "rome", km: 3.1, minutes: 3, buildings: 5560 },
] as const;
const LOOKS = ["atlas", "ink"] as const;

/** The skill's signature: a route with a pin on every stop. Each pin is a
 *  zero-length round-capped stroke, so it stays a circle while the line stretches. */
function Trail({ flip = false, className }: { flip?: boolean; className?: string }) {
  const stops = [[14, 52], [330, 30], [660, 36], [986, 20]];
  return (
    <svg aria-hidden viewBox="0 0 1000 70" preserveAspectRatio="none" className={cn("block h-[clamp(40px,6vw,72px)] w-full", flip && "-scale-x-100", className)}>
      <path d="M14 52 Q 140 4 330 30 T 660 36 T 986 20" fill="none" stroke="var(--signal)" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
      {stops.map(([x, y], i) => (
        <g key={x}>
          <path d={`M${x} ${y}h0`} stroke="var(--signal)" strokeWidth="16" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          {i > 0 && i < stops.length - 1 ? (
            <path d={`M${x} ${y}h0`} stroke="var(--paper)" strokeWidth="8" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          ) : null}
        </g>
      ))}
    </svg>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "trailReel" });
  return buildMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/skills/trail-reel",
    locale: locale as Locale,
  });
}

export default function TrailReelPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("trailReel");
  const format = useFormatter();
  const whatsapp = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(t("whatsappText"))}`;
  const steps = ["say", "world", "route", "render"] as const;
  const audiences = ["creators", "agencies", "guides", "bloggers"] as const;
  const mono = (chunks: React.ReactNode) => <span className="font-mono tabular-nums">{chunks}</span>;
  const links = {
    maproute: (chunks: React.ReactNode) => (
      <a href="https://github.com/artemnovitckii/claude-animation-skills" className={LINK}>{chunks}</a>
    ),
    osm: (chunks: React.ReactNode) => (
      <a href="https://www.openstreetmap.org/copyright" className={LINK}>{chunks}</a>
    ),
    terrain: (chunks: React.ReactNode) => (
      <a href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md" className={LINK}>{chunks}</a>
    ),
    earth: (chunks: React.ReactNode) => (
      <a href="https://www.naturalearthdata.com" className={LINK}>{chunks}</a>
    ),
  };
  const km = (n: number) => format.number(n, { style: "unit", unit: "kilometer", unitDisplay: "short" });
  const minutes = (n: number) => format.number(n, { style: "unit", unit: "minute", unitDisplay: "long" });

  return (
    <main
      id="main"
      className="min-h-dvh px-[var(--space-6)] pt-[var(--shell-top)] pb-[var(--space-22)]"
    >
      <TrackVisit productId="trail-reel" />
      <div className="min-w-0">
        <PageHead line1={t("line1")} line2={t("line2")} sub={t("sub")} />
        <Reveal className="mt-[var(--space-8)] flex flex-wrap items-center gap-[var(--space-4)]">
          <p className="font-display text-[length:var(--text-2xl)] font-bold text-text">{t("price")}</p>
          <a href="#buy" className={cn(BTN, "bg-signal-fill text-signal-ink hover:brightness-110")}>
            {t("buyCta")}
          </a>
          <WhatsAppLink
            productId="trail-reel"
            href={whatsapp}
            className={cn(BTN, "border border-hairline text-text hover:border-signal hover:text-signal-text")}
          >
            {t("whatsappCta")}
          </WhatsAppLink>
        </Reveal>
      </div>

      {/* ponytail: the look switch is two native radios and CSS :has(), no
          client state. The hidden row is display:none, so its videos stay
          paused (ResultVideo only plays what is on screen). */}
      <div className="group mt-[var(--space-12)] max-w-[60rem]">
        <fieldset className="flex flex-wrap items-center gap-x-[var(--space-4)] gap-y-[var(--space-2)]">
          <legend className="sr-only">{t("looks.legend")}</legend>
          <div className="flex gap-[var(--space-2)]">
            {LOOKS.map((look) => (
              <div key={look} className="relative">
                <input
                  type="radio"
                  id={`look-${look}`}
                  name="look"
                  value={look}
                  defaultChecked={look === "atlas"}
                  className="peer sr-only"
                />
                <label
                  htmlFor={`look-${look}`}
                  className={cn(
                    "flex h-11 cursor-pointer items-center rounded-[var(--radius-full)] border border-hairline px-[var(--space-4)]",
                    "text-[length:var(--text-base)] font-medium text-text",
                    "transition-[color,border-color] duration-[var(--dur-fast)] ease-[var(--ease-out)]",
                    "hover:border-signal peer-checked:border-signal peer-checked:text-signal-text",
                    "peer-focus-visible:outline peer-focus-visible:outline-2",
                    "peer-focus-visible:outline-[var(--focus)] peer-focus-visible:outline-offset-2",
                  )}
                >
                  {t(`looks.${look}`)}
                </label>
              </div>
            ))}
          </div>
          <p dir="auto" className="text-[length:var(--text-sm)] text-dim">{t("looks.note")}</p>
        </fieldset>
        {LOOKS.map((look) => (
          <div
            key={look}
            className={cn(
              "mt-[var(--space-6)] grid-cols-[repeat(3,minmax(0,1fr))] gap-[var(--space-3)] sm:gap-[var(--space-6)]",
              look === "atlas" ? "grid group-has-[#look-ink:checked]:hidden" : "hidden group-has-[#look-ink:checked]:grid",
            )}
          >
            {RUNS.map(({ world }) => (
              <ResultVideo
                key={world}
                name={`${world}-${look}`}
                product="trail-reel"
                label={t(`hero.${world}`)}
                priority={look === "atlas"}
              />
            ))}
          </div>
        ))}
      </div>

      <Trail className="mt-[var(--space-16)]" />

      <section aria-labelledby="runs" className="mt-[var(--space-12)]">
        <h2 id="runs" className={H2}>{t("runs.heading")}</h2>
        <p dir="auto" className={SUB}>{t("runs.sub")}</p>
        <ol className="mt-[var(--space-8)] grid gap-[var(--space-8)] lg:grid-cols-3">
          {RUNS.map((run) => (
            <li key={run.world} className="flex flex-col gap-[var(--space-4)] border border-hairline bg-surface p-[var(--space-6)]">
              <div>
                <h3 dir="auto" className={H3}>{t(`runs.${run.world}.title`)}</h3>
                <p dir="auto" className="mt-[var(--space-2)] text-[length:var(--text-base)] text-dim">{t(`runs.${run.world}.body`)}</p>
              </div>
              <blockquote lang="en" dir="auto" className="border-s-2 border-signal ps-[var(--space-4)] text-[length:var(--text-base)] text-text">
                {t(`runs.${run.world}.prompt`)}
              </blockquote>
              {/* Each row wraps as a unit: a value drops under its label, never breaks inside. */}
              <dl className="mt-auto flex flex-col gap-[var(--space-2)] text-[length:var(--text-base)]">
                <div className={ROW}>
                  <dt className="text-dim">{t("runs.distance")}</dt>
                  <dd className="whitespace-nowrap font-mono tabular-nums text-signal-text">{km(run.km)}</dd>
                </div>
                {"buildings" in run ? (
                  <div className={ROW}>
                    <dt className="text-dim">{t("runs.buildings")}</dt>
                    <dd className="whitespace-nowrap font-mono tabular-nums text-text">{format.number(run.buildings)}</dd>
                  </div>
                ) : null}
                <div className={ROW}>
                  <dt className="text-dim">{t("runs.time")}</dt>
                  <dd className="whitespace-nowrap text-text">{t.rich("runs.about", { value: minutes(run.minutes), n: mono })}</dd>
                </div>
              </dl>
              {run.world === "dolomites" ? (
                <p dir="auto" className="text-[length:var(--text-sm)] text-dim">{t("runs.dolomites.extra")}</p>
              ) : null}
            </li>
          ))}
        </ol>
        {/* TODO(reel): once public/shop/trail-reel/reel.mp4 + reel.jpg exist, add
            <ResultVideo name="reel" product="trail-reel" label={t("runs.reel")} className="mt-[var(--space-8)] max-w-[22rem]" />
            here and a "runs.reel" label in all five message files.
            tests/shop.spec.ts counts the visible videos in <main>: bump it to 4. */}
        <p dir="auto" className="mt-[var(--space-8)] max-w-[var(--measure)] border-s-2 border-signal ps-[var(--space-4)] text-[length:var(--text-lg)] text-text">
          {t("runs.why", { price: format.number(5.99, { style: "currency", currency: "USD" }) })}
        </p>
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
        <section aria-labelledby="needs">
          <h2 id="needs" className={H2}>{t("needs.heading")}</h2>
          <p dir="auto" className={SUB}>{t("needs.body")}</p>
        </section>
        <section aria-labelledby="credits">
          <h2 id="credits" className={H2}>{t("credits.heading")}</h2>
          <p dir="auto" className={SUB}>{t.rich("credits.body", links)}</p>
        </section>
      </div>

      <Trail flip className="mt-[var(--space-22)]" />

      <section id="buy" aria-labelledby="buy-heading" className="mt-[var(--space-12)] grid gap-[var(--space-12)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <h2 id="buy-heading" className={H2}>{t("buy.heading")}</h2>
          <p dir="auto" className={SUB}>{t("buy.sub")}</p>
          <p dir="auto" className={SUB}>{t("buy.licence")}</p>
          <WhatsAppLink
            productId="trail-reel"
            href={whatsapp}
            className={cn(BTN, "mt-[var(--space-6)] border border-hairline text-text hover:border-signal hover:text-signal-text")}
          >
            {t("whatsappCta")}
          </WhatsAppLink>
        </div>
        <div className="border border-hairline bg-surface p-[var(--space-6)]">
          <Checkout productId="trail-reel" />
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
