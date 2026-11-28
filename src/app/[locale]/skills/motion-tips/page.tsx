import { use } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHead } from "@/components/layout/PageHead";
import { Reveal } from "@/components/primitives/Reveal";
import { FreePdfForm } from "@/components/shop/FreePdfForm";
import { TrackVisit } from "@/components/shop/Track";
import { buildMetadata } from "@/lib/seo/metadata";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n/routing";

const H2 = "font-display text-[length:var(--text-3xl)] font-extrabold leading-[var(--leading-tight)] text-text";
const H3 = "font-display text-[length:var(--text-xl)] font-bold text-text";
const SUB = "mt-[var(--space-3)] max-w-[var(--measure)] text-[length:var(--text-base)] text-dim";
const LINK = "text-signal-text underline underline-offset-2";

const PAGES = [1, 2, 3] as const;
const TIPS = ["reference", "beats", "box", "frames"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "motionTips" });
  return buildMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/skills/motion-tips",
    locale: locale as Locale,
  });
}

/** The first free product: a PDF by email, no price, no checkout. */
export default function MotionTipsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("motionTips");

  return (
    <main
      id="main"
      className="min-h-dvh px-[var(--space-6)] pt-[var(--shell-top)] pb-[var(--space-22)]"
    >
      <TrackVisit productId="motion-tips" />
      <div className="min-w-0">
        <PageHead line1={t("line1")} line2={t("line2")} sub={t("sub")} />
        <Reveal className="mt-[var(--space-8)] flex flex-col gap-[var(--space-4)]">
          <p dir="auto" className="text-[length:var(--text-base)] text-dim">{t("fileNote")}</p>
          <FreePdfForm productId="motion-tips" />
        </Reveal>
      </div>

      {/* The PDF's own pages, so the reader sees what they get before they ask. */}
      <ul className="mt-[var(--space-12)] grid max-w-[60rem] gap-[var(--space-6)] sm:grid-cols-3">
        {PAGES.map((n) => (
          <li key={n}>
            <figure className="flex min-w-0 flex-col gap-[var(--space-3)]">
              <Image
                src={`/shop/motion-tips/page-${n}.webp`}
                alt={t(`pages.alt${n}`)}
                width={1000}
                height={1415}
                sizes="(min-width: 640px) 20rem, 100vw"
                preload={n === 1}
                className="block h-auto w-full border border-hairline"
              />
              <figcaption dir="auto" className="text-[length:var(--text-sm)] text-dim">
                {t(`pages.caption${n}`)}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <section aria-labelledby="inside" className="mt-[var(--space-22)]">
        <h2 id="inside" className={H2}>{t("inside.heading")}</h2>
        <p dir="auto" className={SUB}>{t("inside.sub")}</p>
        <ol className="mt-[var(--space-8)] grid gap-[var(--space-8)] md:grid-cols-2 lg:grid-cols-4">
          {TIPS.map((tip, i) => (
            <li key={tip} className="border-t-2 border-hairline pt-[var(--space-4)]">
              <span aria-hidden className="font-mono text-[length:var(--text-sm)] text-signal-text">{i + 1}</span>
              <h3 dir="auto" className={cn(H3, "mt-[var(--space-2)]")}>{t(`inside.${tip}.title`)}</h3>
              <p dir="auto" className="mt-[var(--space-2)] text-[length:var(--text-base)] text-dim">{t(`inside.${tip}.body`)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="credits" className="mt-[var(--space-22)]">
        <h2 id="credits" className={H2}>{t("credits.heading")}</h2>
        <p dir="auto" className={SUB}>{t.rich("credits.body", {
          movez: (chunks) => <a href="https://x.com/0xMovez/status/2104216919033192746" className={LINK}>{chunks}</a>,
          lukas: (chunks) => <a href="https://youtu.be/747ZnEtsRbg" className={LINK}>{chunks}</a>,
        })}</p>
      </section>

      <section aria-labelledby="get" className="mt-[var(--space-22)] border-t border-hairline pt-[var(--space-12)]">
        <h2 id="get" className={H2}>{t("get.heading")}</h2>
        <p dir="auto" className={SUB}>{t("get.sub")}</p>
        <div className="mt-[var(--space-6)]">
          <FreePdfForm productId="motion-tips" />
        </div>
      </section>
    </main>
  );
}
