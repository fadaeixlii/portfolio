import { use } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHead } from "@/components/layout/PageHead";
import { Reveal } from "@/components/primitives/Reveal";
import { FreePdfForm } from "@/components/shop/FreePdfForm";
import { TrackVisit } from "@/components/shop/Track";
import { SHOP_PRODUCTS } from "@/content/shop";
import { buildMetadata } from "@/lib/seo/metadata";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n/routing";

const H2 = "font-display text-[length:var(--text-3xl)] font-extrabold leading-[var(--leading-tight)] text-text";
const H3 = "font-display text-[length:var(--text-xl)] font-bold text-text";
const SUB = "mt-[var(--space-3)] max-w-[var(--measure)] text-[length:var(--text-base)] text-dim";
const BODY = "mt-[var(--space-2)] text-[length:var(--text-base)] text-dim";

/** The PDF's page 2. Licences exactly as each project publishes them; only
 *  Kinetograph's is not open source, so only it carries its terms. */
const TOOLS = [
  { id: "kinetograph", name: "Kinetograph", licence: "PolyForm Small Business 1.0.0", smallBusiness: true },
  { id: "ffmpeg", name: "FFmpeg", licence: "LGPL/GPL" },
  { id: "whisper", name: "faster-whisper", licence: "MIT" },
  { id: "autoEditor", name: "Auto-Editor", licence: "Unlicense" },
  { id: "ytDlp", name: "yt-dlp", licence: "Unlicense" },
] as const;
const PROMPTS = ["install", "taste", "edit"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "aiVideoEditor" });
  return buildMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/skills/ai-video-editor",
    locale: locale as Locale,
  });
}

/** The second free product: a PDF by email, no price, no checkout. */
export default function AiVideoEditorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("aiVideoEditor");

  return (
    <main
      id="main"
      className="min-h-dvh px-[var(--space-6)] pt-[var(--shell-top)] pb-[var(--space-22)]"
    >
      <TrackVisit productId="ai-video-editor" />
      <div className="min-w-0">
        <PageHead line1={t("line1")} line2={t("line2")} sub={t("sub")} />
        <Reveal className="mt-[var(--space-8)] flex flex-col gap-[var(--space-4)]">
          <p dir="auto" className="text-[length:var(--text-base)] text-dim">{t("fileNote")}</p>
          <FreePdfForm productId="ai-video-editor" />
        </Reveal>
      </div>

      <Image
        src={SHOP_PRODUCTS["ai-video-editor"].poster}
        alt={t("coverAlt")}
        width={900}
        height={1600}
        sizes="20rem"
        preload
        className="mt-[var(--space-12)] block h-auto w-full max-w-[20rem] border border-hairline"
      />

      <section aria-labelledby="workspace" className="mt-[var(--space-22)]">
        <h2 id="workspace" className={H2}>{t("workspace.title")}</h2>
        <p dir="auto" className={SUB}>{t("workspace.body")}</p>
      </section>

      <section id="tools" aria-labelledby="tools-heading" className="mt-[var(--space-22)]">
        <h2 id="tools-heading" className={H2}>{t("tools.title")}</h2>
        <p dir="auto" className={SUB}>{t("tools.sub")}</p>
        <ul className="mt-[var(--space-8)] grid gap-[var(--space-8)] md:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => (
            <li key={tool.id} className="border-t-2 border-hairline pt-[var(--space-4)]">
              {/* Inherits the page direction: a Latin name reads the same, and lines up with its Persian body. */}
              <h3 className={H3}>{tool.name}</h3>
              <p dir="auto" className={BODY}>{t(`tools.${tool.id}`)}</p>
              <p dir="auto" className="mt-[var(--space-2)] text-[length:var(--text-sm)] text-dim">
                {t("smallBusiness" in tool ? "tools.licenceSmallBusiness" : "tools.licence", { licence: tool.licence })}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section id="prompts" aria-labelledby="prompts-heading" className="mt-[var(--space-22)]">
        <h2 id="prompts-heading" className={H2}>{t("prompts.title")}</h2>
        <p dir="auto" className={SUB}>{t("prompts.sub")}</p>
        <ol className="mt-[var(--space-8)] grid gap-[var(--space-8)] lg:grid-cols-3">
          {PROMPTS.map((prompt, i) => (
            <li key={prompt} className="border-t-2 border-hairline pt-[var(--space-4)]">
              <span aria-hidden className="font-mono text-[length:var(--text-sm)] text-signal-text">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 dir="auto" className={cn(H3, "mt-[var(--space-2)]")}>{t(`prompts.${prompt}.title`)}</h3>
              <p dir="auto" className={BODY}>{t(`prompts.${prompt}.body`)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="get" className="mt-[var(--space-22)] border-t border-hairline pt-[var(--space-12)]">
        <h2 id="get" className={H2}>{t("get.heading")}</h2>
        <p dir="auto" className={SUB}>{t("get.sub")}</p>
        <div className="mt-[var(--space-6)]">
          <FreePdfForm productId="ai-video-editor" />
        </div>
      </section>
    </main>
  );
}
