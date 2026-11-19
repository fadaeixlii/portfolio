import { use } from "react";
import type { Metadata } from "next";
import { useFormatter, useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHead } from "@/components/layout/PageHead";
import { Reveal } from "@/components/primitives/Reveal";
import { Checkout } from "@/components/shop/Checkout";
import { ResultVideo } from "@/components/shop/ResultVideo";
import { TrackVisit, WhatsAppLink } from "@/components/shop/Track";
import { Link } from "@/lib/i18n/navigation";
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

/** The test run (2026-11-19): a fresh copy of the folder, a made-up coffee page,
 *  one idea, Claude taking the recommended option at each gate. From the run's log. */
const RUN = { minutes: 48, seconds: 53, gates: 6, photos: 7 } as const;

/** The eight skills in the folder, in the order a video uses them. */
const SKILLS = ["setup", "trends", "idea", "analyze", "script", "voice", "video", "check"] as const;

/** The folder's signature: eight tabs, one per skill, like the edge of a file folder. */
function Tabs({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 1000 60" preserveAspectRatio="none" className={cn("block h-[clamp(32px,5vw,56px)] w-full", className)}>
      <path d="M0 58 H1000" stroke="var(--hairline)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      {SKILLS.map((s, i) => (
        <path
          key={s}
          d={`M${8 + i * 124} 58 V14 Q${8 + i * 124} 6 ${16 + i * 124} 6 H${110 + i * 124} Q${118 + i * 124} 6 ${118 + i * 124} 14 V58`}
          fill={i === 4 ? "var(--signal)" : "none"}
          stroke={i === 4 ? "var(--signal)" : "var(--hairline)"}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
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
  const t = await getTranslations({ locale, namespace: "oneFolderStudio" });
  return buildMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/skills/one-folder-studio",
    locale: locale as Locale,
  });
}

export default function OneFolderStudioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("oneFolderStudio");
  const format = useFormatter();
  const whatsapp = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(t("whatsappText"))}`;
  const steps = ["setup", "pick", "make", "post"] as const;
  const audiences = ["creators", "business", "freelancers", "camera"] as const;
  const links = {
    humanizer: (chunks: React.ReactNode) => <a href="https://github.com/blader/humanizer" className={LINK}>{chunks}</a>,
    stopslop: (chunks: React.ReactNode) => <a href="https://github.com/hardikpandya/stop-slop" className={LINK}>{chunks}</a>,
    kinetograph: (chunks: React.ReactNode) => <a href="https://github.com/0xS4N4TG/kinetograph" className={LINK}>{chunks}</a>,
    doodles: (chunks: React.ReactNode) => <a href="https://www.opendoodles.com" className={LINK}>{chunks}</a>,
    ink: (chunks: React.ReactNode) => <Link href="/skills/ink-motion" className={LINK}>{chunks}</Link>,
  };
  const unit = (n: number, u: "minute" | "second") => format.number(n, { style: "unit", unit: u, unitDisplay: "long" });

  return (
    <main
      id="main"
      className="min-h-dvh px-[var(--space-6)] pt-[var(--shell-top)] pb-[var(--space-22)]"
    >
      <TrackVisit productId="one-folder-studio" />
      <div className="min-w-0">
        <PageHead line1={t("line1")} line2={t("line2")} sub={t("sub")} />
        <Reveal className="mt-[var(--space-8)] flex flex-wrap items-center gap-[var(--space-4)]">
          <p className="font-display text-[length:var(--text-2xl)] font-bold text-text">{t("price")}</p>
          <a href="#buy" className={cn(BTN, "bg-signal-fill text-signal-ink hover:brightness-110")}>
            {t("buyCta")}
          </a>
          <WhatsAppLink
            productId="one-folder-studio"
            href={whatsapp}
            className={cn(BTN, "border border-hairline text-text hover:border-signal hover:text-signal-text")}
          >
            {t("whatsappCta")}
          </WhatsAppLink>
        </Reveal>
      </div>

      <div className="mt-[var(--space-12)] grid max-w-[44rem] grid-cols-[repeat(2,minmax(0,1fr))] gap-[var(--space-3)] sm:gap-[var(--space-6)]">
        <ResultVideo name="coffee" product="one-folder-studio" label={t("hero.coffee")} priority />
        <ResultVideo name="reel" product="one-folder-studio" label={t("hero.reel")} />
      </div>

      <Tabs className="mt-[var(--space-16)]" />

      <section aria-labelledby="run" className="mt-[var(--space-12)] grid gap-[var(--space-8)] lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div>
          <h2 id="run" className={H2}>{t("run.heading")}</h2>
          <p dir="auto" className={SUB}>{t("run.sub")}</p>
          <blockquote lang="en" dir="auto" className="mt-[var(--space-6)] max-w-[var(--measure)] border-s-2 border-signal ps-[var(--space-4)] text-[length:var(--text-lg)] text-text">
            {t("run.prompt")}
          </blockquote>
          <p dir="auto" className={SUB}>{t("run.what")}</p>
        </div>
        {/* Each row wraps as a unit: a value drops under its label, never breaks inside. */}
        <dl className="flex flex-col gap-[var(--space-3)] self-start border border-hairline bg-surface p-[var(--space-6)] text-[length:var(--text-base)]">
          <div className={ROW}>
            <dt className="text-dim">{t("run.time")}</dt>
            <dd className="whitespace-nowrap font-mono tabular-nums text-signal-text">{unit(RUN.minutes, "minute")}</dd>
          </div>
          <div className={ROW}>
            <dt className="text-dim">{t("run.length")}</dt>
            <dd className="whitespace-nowrap font-mono tabular-nums text-text">{unit(RUN.seconds, "second")}</dd>
          </div>
          <div className={ROW}>
            <dt className="text-dim">{t("run.gates")}</dt>
            <dd className="whitespace-nowrap font-mono tabular-nums text-text">{t("run.gatesValue", { n: format.number(RUN.gates) })}</dd>
          </div>
          <div className={ROW}>
            <dt className="text-dim">{t("run.photos")}</dt>
            <dd className="whitespace-nowrap font-mono tabular-nums text-text">{format.number(RUN.photos)}</dd>
          </div>
          <div className={ROW}>
            <dt className="text-dim">{t("run.facts")}</dt>
            <dd className="text-text">{t("run.factsValue")}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="inside" className="mt-[var(--space-22)]">
        <h2 id="inside" className={H2}>{t("inside.heading")}</h2>
        <p dir="auto" className={SUB}>{t("inside.sub")}</p>
        <ol className="mt-[var(--space-8)] grid gap-x-[var(--space-8)] gap-y-[var(--space-6)] md:grid-cols-2">
          {SKILLS.map((s) => (
            <li key={s} className="border-t-2 border-hairline pt-[var(--space-4)]">
              <h3 dir="auto" className={H3}>
                <span lang="en" className="font-mono text-[length:var(--text-base)] text-signal-text">{t(`inside.${s}.name`)}</span>
              </h3>
              <p dir="auto" className="mt-[var(--space-2)] text-[length:var(--text-base)] text-dim">{t(`inside.${s}.body`)}</p>
            </li>
          ))}
        </ol>
        <p dir="auto" className="mt-[var(--space-8)] max-w-[var(--measure)] border-s-2 border-signal ps-[var(--space-4)] text-[length:var(--text-lg)] text-text">
          {t("inside.plus")}
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
      </section>

      <div className="mt-[var(--space-22)] grid gap-[var(--space-12)] md:grid-cols-2">
        <section aria-labelledby="needs">
          <h2 id="needs" className={H2}>{t("needs.heading")}</h2>
          <p dir="auto" className={SUB}>{t("needs.body")}</p>
          <p dir="auto" className={SUB}>{t("needs.voice")}</p>
        </section>
        <section aria-labelledby="credits">
          <h2 id="credits" className={H2}>{t("credits.heading")}</h2>
          <p dir="auto" className={SUB}>{t.rich("credits.body", links)}</p>
          <p dir="auto" className={SUB}>{t.rich("credits.ink", links)}</p>
        </section>
      </div>

      <Tabs className="mt-[var(--space-22)]" />

      <section id="buy" aria-labelledby="buy-heading" className="mt-[var(--space-12)] grid gap-[var(--space-12)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <h2 id="buy-heading" className={H2}>{t("buy.heading")}</h2>
          <p dir="auto" className={SUB}>{t("buy.sub")}</p>
          <p dir="auto" className={SUB}>{t("buy.licence")}</p>
          <WhatsAppLink
            productId="one-folder-studio"
            href={whatsapp}
            className={cn(BTN, "mt-[var(--space-6)] border border-hairline text-text hover:border-signal hover:text-signal-text")}
          >
            {t("whatsappCta")}
          </WhatsAppLink>
        </div>
        <div className="border border-hairline bg-surface p-[var(--space-6)]">
          <Checkout productId="one-folder-studio" />
        </div>
      </section>

      <section aria-labelledby="faq" className="mt-[var(--space-22)] max-w-[var(--measure)]">
        <h2 id="faq" className={H2}>{t("faq.heading")}</h2>
        <div className="mt-[var(--space-6)] flex flex-col">
          {(["1", "2", "3", "4"] as const).map((n) => (
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
