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
const BTN = "inline-flex h-11 items-center justify-center rounded-[var(--radius-full)] px-6 text-[length:var(--text-base)] font-medium";
const ROW = "flex flex-wrap items-baseline justify-between gap-x-[var(--space-4)]";

/** The test run (2026-11-20): a fresh copy of the skill, a made-up resume (Sam Rivera)
 *  and a real public office coordinator post. From the run's result.json and log. */
const RUN = { minutes: 3, seconds: 48, mustHaves: 13, before: 3, after: 6, marked: 14, invented: 0, questions: 5, readback: 100 } as const;

/** What plain AI wrote into Sam's resume for the same post, next to the post's own line
 *  (runs/run-plain/findings.md). Quoted in English in every locale. */
const PLAIN = [
  ["taking ownership of each issue until it is resolved", "own issues through resolution"],
  ["noticing what needs fixing before anyone asks", "solving problems before being asked"],
  ["Ready and excited to work in person in New York five days per week.", "Able and excited to work from our New York office five days per week"],
  ["balancing competing needs", "anticipate competing needs"],
  ["resetting the space afterward", "rooms that need resetting"],
] as const;

const PARTS = ["count", "marks", "rewrite", "check", "questions", "pdf"] as const;

/** The signature: the fold of the first look. Above the dashed line a reader takes in
 *  everything; below it, only the first three words of each line (the orange stubs). */
function Fold({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 1000 48" preserveAspectRatio="none" className={cn("block h-[clamp(28px,4vw,48px)] w-full", className)}>
      <path d="M0 8 H1000" stroke="var(--hairline)" strokeWidth="2" strokeDasharray="14 10" vectorEffect="non-scaling-stroke" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <path d={`M0 ${22 + i * 10} H${120 + (i % 2) * 30}`} stroke="var(--signal)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          <path d={`M${136 + (i % 2) * 30} ${22 + i * 10} H${720 - i * 140}`} stroke="var(--hairline)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
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
  const t = await getTranslations({ locale, namespace: "firstSkim" });
  return buildMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/skills/first-skim",
    locale: locale as Locale,
  });
}

export default function FirstSkimPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("firstSkim");
  const format = useFormatter();
  const whatsapp = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(t("whatsappText"))}`;
  const steps = ["give", "marks", "answer", "get"] as const;
  const audiences = ["changers", "applying", "writers", "first"] as const;
  const n = (v: number) => format.number(v);
  const compare = { beforeLabel: t("compare.before"), afterLabel: t("compare.after"), sliderLabel: t("compare.slider") };

  return (
    <main
      id="main"
      className="min-h-dvh px-[var(--space-6)] pt-[var(--shell-top)] pb-[var(--space-22)]"
    >
      <TrackVisit productId="first-skim" />
      <div className="min-w-0">
        <PageHead line1={t("line1")} line2={t("line2")} sub={t("sub")} />
        <Reveal className="mt-[var(--space-8)] flex flex-wrap items-center gap-[var(--space-4)]">
          <p className="font-display text-[length:var(--text-2xl)] font-bold text-text">{t("price")}</p>
          <a href="#buy" className={cn(BTN, "bg-signal-fill text-signal-ink hover:brightness-110")}>
            {t("buyCta")}
          </a>
          <WhatsAppLink
            productId="first-skim"
            href={whatsapp}
            className={cn(BTN, "border border-hairline text-text hover:border-signal hover:text-signal-text")}
          >
            {t("whatsappCta")}
          </WhatsAppLink>
        </Reveal>
      </div>

      <div className="mt-[var(--space-12)] grid max-w-[52rem] items-start gap-[var(--space-6)] sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]">
        <ResultVideo name="reel" product="first-skim" label={t("hero.reel")} priority />
        <BeforeAfter
          {...compare}
          before="/shop/first-skim/before.webp"
          after="/shop/first-skim/after.webp"
          width={1000}
          height={1294}
          beforeAlt={t("compare.beforeAlt")}
          afterAlt={t("compare.afterAlt")}
          caption={t("compare.caption")}
          sizes="(min-width: 640px) 28rem, 100vw"
          eager
        />
      </div>

      <Fold className="mt-[var(--space-16)]" />

      <section id="plain" aria-labelledby="plain-heading" className="mt-[var(--space-12)]">
        <h2 id="plain-heading" className={H2}>{t("plain.heading")}</h2>
        <p dir="auto" className={SUB}>{t("plain.sub")}</p>
        <table className="mt-[var(--space-8)] w-full max-w-[56rem] border-collapse text-[length:var(--text-base)]">
          <caption dir="auto" className="pb-[var(--space-3)] text-start text-[length:var(--text-sm)] text-dim">
            {t("plain.caption")}
          </caption>
          <thead>
            <tr className="border-b border-hairline">
              <th scope="col" dir="auto" className="py-[var(--space-3)] pe-[var(--space-4)] text-start font-medium text-signal-text">{t("plain.ai")}</th>
              <th scope="col" dir="auto" className="py-[var(--space-3)] text-start font-medium text-dim">{t("plain.post")}</th>
            </tr>
          </thead>
          <tbody>
            {PLAIN.map(([ai, post]) => (
              <tr key={ai} className="border-b border-hairline align-top">
                <td lang="en" dir="ltr" className="py-[var(--space-3)] pe-[var(--space-4)] text-text">“{ai}”</td>
                <td lang="en" dir="ltr" className="py-[var(--space-3)] text-dim">“{post}”</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p dir="auto" className="mt-[var(--space-6)] max-w-[var(--measure)] border-s-2 border-signal ps-[var(--space-4)] text-[length:var(--text-lg)] text-text">
          {t("plain.instead", { n: n(RUN.questions) })}
        </p>
      </section>

      <section aria-labelledby="run" className="mt-[var(--space-22)] grid gap-[var(--space-8)] lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div>
          <h2 id="run" className={H2}>{t("run.heading")}</h2>
          <p dir="auto" className={SUB}>{t("run.sub")}</p>
          <p dir="auto" className={SUB}>{t("run.what")}</p>
        </div>
        {/* Each row wraps as a unit: a value drops under its label, never breaks inside. */}
        <dl className="flex flex-col gap-[var(--space-3)] self-start border border-hairline bg-surface p-[var(--space-6)] text-[length:var(--text-base)]">
          <div className={ROW}>
            <dt className="text-dim">{t("run.look")}</dt>
            <dd className="whitespace-nowrap font-mono tabular-nums text-signal-text">{t("run.lookValue", { before: n(RUN.before), after: n(RUN.after), total: n(RUN.mustHaves) })}</dd>
          </div>
          <div className={ROW}>
            <dt className="text-dim">{t("run.marked")}</dt>
            <dd className="whitespace-nowrap font-mono tabular-nums text-text">{n(RUN.marked)}</dd>
          </div>
          <div className={ROW}>
            <dt className="text-dim">{t("run.invented")}</dt>
            <dd className="whitespace-nowrap font-mono tabular-nums text-text">{n(RUN.invented)}</dd>
          </div>
          <div className={ROW}>
            <dt className="text-dim">{t("run.questions")}</dt>
            <dd className="whitespace-nowrap font-mono tabular-nums text-text">{n(RUN.questions)}</dd>
          </div>
          <div className={ROW}>
            <dt className="text-dim">{t("run.readback")}</dt>
            <dd className="whitespace-nowrap font-mono tabular-nums text-text">{format.number(RUN.readback / 100, { style: "percent" })}</dd>
          </div>
          <div className={ROW}>
            <dt className="text-dim">{t("run.time")}</dt>
            <dd className="whitespace-nowrap font-mono tabular-nums text-text">{t("run.timeValue", { m: n(RUN.minutes), s: n(RUN.seconds) })}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="inside" className="mt-[var(--space-22)]">
        <h2 id="inside" className={H2}>{t("inside.heading")}</h2>
        <p dir="auto" className={SUB}>{t("inside.sub")}</p>
        <ul className="mt-[var(--space-8)] grid gap-x-[var(--space-8)] gap-y-[var(--space-6)] md:grid-cols-2">
          {PARTS.map((p) => (
            <li key={p} className="border-t-2 border-hairline pt-[var(--space-4)]">
              <h3 dir="auto" className={H3}>{t(`inside.${p}.title`)}</h3>
              <p dir="auto" className="mt-[var(--space-2)] text-[length:var(--text-base)] text-dim">{t(`inside.${p}.body`)}</p>
            </li>
          ))}
        </ul>
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
          <p dir="auto" className={SUB}>{t("needs.privacy")}</p>
        </section>
        <section aria-labelledby="credits">
          <h2 id="credits" className={H2}>{t("credits.heading")}</h2>
          <p dir="auto" className={SUB}>{t.rich("credits.body", {
            pdfplumber: (chunks) => <a href="https://github.com/jsvine/pdfplumber" className="text-signal-text underline underline-offset-2">{chunks}</a>,
          })}</p>
          <p dir="auto" className={SUB}>{t.rich("credits.study", {
            study: (chunks) => <a href="https://www.hrdive.com/news/eye-tracking-study-shows-recruiters-look-at-resumes-for-7-seconds/541582/" className="text-signal-text underline underline-offset-2">{chunks}</a>,
          })}</p>
        </section>
      </div>

      <Fold className="mt-[var(--space-22)]" />

      <section id="buy" aria-labelledby="buy-heading" className="mt-[var(--space-12)] grid gap-[var(--space-12)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <h2 id="buy-heading" className={H2}>{t("buy.heading")}</h2>
          <p dir="auto" className={SUB}>{t("buy.sub")}</p>
          <p dir="auto" className={SUB}>{t("buy.licence")}</p>
          <WhatsAppLink
            productId="first-skim"
            href={whatsapp}
            className={cn(BTN, "mt-[var(--space-6)] border border-hairline text-text hover:border-signal hover:text-signal-text")}
          >
            {t("whatsappCta")}
          </WhatsAppLink>
        </div>
        <div className="border border-hairline bg-surface p-[var(--space-6)]">
          <Checkout productId="first-skim" />
        </div>
      </section>

      <section aria-labelledby="faq" className="mt-[var(--space-22)] max-w-[var(--measure)]">
        <h2 id="faq" className={H2}>{t("faq.heading")}</h2>
        <div className="mt-[var(--space-6)] flex flex-col">
          {(["1", "2", "3", "4"] as const).map((q) => (
            <details key={q} className="border-b border-hairline py-[var(--space-4)]">
              <summary dir="auto" className="cursor-pointer text-[length:var(--text-lg)] font-medium text-text">
                {t(`faq.q${q}`)}
              </summary>
              <p dir="auto" className="mt-[var(--space-3)] text-[length:var(--text-base)] text-dim">{t(`faq.a${q}`)}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
