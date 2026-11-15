import { use } from "react";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
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
const SUB = "mt-[var(--space-3)] max-w-[var(--measure)] text-[length:var(--text-base)] text-dim";
const LINK = "text-signal-text underline underline-offset-2";
const BTN = "inline-flex h-11 items-center justify-center rounded-[var(--radius-full)] px-6 text-[length:var(--text-base)] font-medium";

/** The skill's signature: the red string the camera rides from clue to clue, pinned at both ends. */
function RedString({ flip = false, className }: { flip?: boolean; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 1000 70" preserveAspectRatio="none" className={cn("block h-[clamp(40px,6vw,72px)] w-full", flip && "-scale-x-100", className)}>
      <path d="M14 14 Q 520 78 986 22" fill="none" stroke="var(--signal)" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
      <circle cx="14" cy="14" r="7" fill="var(--signal)" />
      <circle cx="986" cy="22" r="7" fill="var(--signal)" />
    </svg>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "paperTrail" });
  return buildMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/skills/paper-trail",
    locale: locale as Locale,
  });
}

export default function PaperTrailPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("paperTrail");
  const whatsapp = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(t("whatsappText"))}`;
  const results = ["eiffel", "titanic", "reel"] as const;
  const steps = ["facts", "script", "wall", "film"] as const;
  const inside = ["skill", "wall", "pipeline", "example"] as const;
  const links = {
    huashu: (chunks: React.ReactNode) => (
      <a href="https://github.com/alchaincyf/huashu-art-motion" className={LINK}>{chunks}</a>
    ),
    vox: (chunks: React.ReactNode) => (
      <a href="https://github.com/CK42BB/vox-explainer-skill" className={LINK}>{chunks}</a>
    ),
  };

  return (
    <main
      id="main"
      className="min-h-dvh px-[var(--space-6)] pt-[var(--shell-top)] pb-[var(--space-22)]"
    >
      <TrackVisit productId="paper-trail" />
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-[var(--space-12)] lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="min-w-0">
          <PageHead line1={t("line1")} line2={t("line2")} sub={t("sub")} />
          <Reveal className="mt-[var(--space-8)] flex flex-wrap items-center gap-[var(--space-4)]">
            <p className="font-display text-[length:var(--text-2xl)] font-bold text-text">{t("price")}</p>
            <a href="#buy" className={cn(BTN, "bg-signal-fill text-signal-ink hover:brightness-110")}>
              {t("buyCta")}
            </a>
            <WhatsAppLink
              productId="paper-trail"
              href={whatsapp}
              className={cn(BTN, "border border-hairline text-text hover:border-signal hover:text-signal-text")}
            >
              {t("whatsappCta")}
            </WhatsAppLink>
          </Reveal>
        </div>
        <ResultVideo name="demo" product="paper-trail" label={t("results.demo")} priority className="w-full max-w-[22rem] justify-self-center" />
      </div>

      <RedString className="mt-[var(--space-16)]" />

      <section aria-labelledby="results" className="mt-[var(--space-12)]">
        <h2 id="results" className={H2}>{t("results.heading")}</h2>
        <p dir="auto" className={SUB}>{t("results.sub")}</p>
        <div className="mt-[var(--space-8)] grid grid-cols-[repeat(2,minmax(0,1fr))] gap-[var(--space-6)] sm:grid-cols-[repeat(3,minmax(0,1fr))] lg:grid-cols-[repeat(3,minmax(0,1fr))]">
          {results.map((name) => (
            <ResultVideo key={name} name={name} product="paper-trail" label={t(`results.${name}`)} />
          ))}
        </div>
      </section>

      <section aria-labelledby="how" className="mt-[var(--space-22)]">
        <h2 id="how" className={H2}>{t("how.heading")}</h2>
        <ol className="mt-[var(--space-8)] grid gap-[var(--space-8)] md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step} className="border-t-2 border-hairline pt-[var(--space-4)]">
              <span aria-hidden className="font-mono text-[length:var(--text-sm)] text-signal-text">{i + 1}</span>
              <h3 dir="auto" className="mt-[var(--space-2)] font-display text-[length:var(--text-xl)] font-bold text-text">
                {t(`how.${step}.title`)}
              </h3>
              <p dir="auto" className="mt-[var(--space-2)] text-[length:var(--text-base)] text-dim">
                {t(`how.${step}.body`)}
              </p>
            </li>
          ))}
        </ol>
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

      <RedString flip className="mt-[var(--space-22)]" />

      <section id="buy" aria-labelledby="buy-heading" className="mt-[var(--space-12)] grid gap-[var(--space-12)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <h2 id="buy-heading" className={H2}>{t("buy.heading")}</h2>
          <p dir="auto" className={SUB}>{t("buy.sub")}</p>
          <WhatsAppLink
            productId="paper-trail"
            href={whatsapp}
            className={cn(BTN, "mt-[var(--space-6)] border border-hairline text-text hover:border-signal hover:text-signal-text")}
          >
            {t("whatsappCta")}
          </WhatsAppLink>
        </div>
        <div className="border border-hairline bg-surface p-[var(--space-6)]">
          <Checkout productId="paper-trail" />
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
