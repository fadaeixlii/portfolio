import Image from "next/image";
import { useTranslations } from "next-intl";
import { getProjects } from "@/content";
import type { Project, CaseStudy } from "@/content/schema";
import { Reveal } from "@/components/primitives/Reveal";
import { Hairline } from "@/components/primitives/Hairline";
import { Link } from "@/lib/i18n/navigation";

/**
 * Best existing screenshot per project, from the 47 already shot into
 * `public/images/projects/`. A project with no suitable shot is simply
 * absent here — no placeholder graphic, no fake browser chrome.
 */
const SCREENSHOTS: Partial<
  Record<string, { src: string; width: number; height: number; alt: string }>
> = {
  aim2balance: {
    // Was platform-desktop.png — a real logged-in session (wallet balance,
    // account name, chat titles, usage stats). This is the public marketing
    // page instead; see docs/decisions.md.
    src: "/images/projects/aim2balance/landing.png",
    width: 1920,
    height: 1080,
    alt: "aim2balance marketing landing page",
  },
  jeofferte: {
    src: "/images/projects/jeofferte/landing.png",
    width: 1920,
    height: 1080,
    alt: "Jeofferte marketplace landing page",
  },
  roofcast: {
    src: "/images/projects/roofcast/landing.png",
    width: 1920,
    height: 1080,
    alt: "Roofcast property prediction market trading screen",
  },
  meshi: {
    src: "/images/projects/meshi/landing.png",
    width: 1920,
    height: 1080,
    alt: "Meshi food-ordering landing page",
  },
  exmodules: {
    src: "/images/projects/dapp-solutions/login.png",
    width: 1920,
    height: 868,
    alt: "Exmodules property DApp wallet login screen",
  },
  "intex-exchange": {
    src: "/images/projects/intex-exchange/hero.png",
    width: 1920,
    height: 1080,
    alt: "Intex exchange trading dashboard with live charts",
  },
  "panikar-assessment": {
    src: "/images/projects/panikar-assessment/hero.png",
    width: 1920,
    height: 1080,
    alt: "Panikar assessment test interface",
  },
  "3gaam": {
    src: "/images/projects/3gaam/hero.png",
    width: 1920,
    height: 1080,
    alt: "3gaam study-resource platform interface",
  },
};

export function CaseStudyLayout({
  project,
  caseStudy,
}: {
  project: Project;
  caseStudy: CaseStudy;
}) {
  const t = useTranslations("work.caseStudy");
  const projects = getProjects();
  const currentIndex = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(currentIndex + 1) % projects.length];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-[var(--space-16)] px-[var(--space-6)] py-[var(--space-24)]">
      <Reveal as="header" className="flex flex-col gap-[var(--space-4)]">
        <h1 dir="auto" className="font-display text-[length:var(--text-4xl)] leading-[var(--leading-tight)] text-text">
          {project.name}
        </h1>
        <div className="flex flex-wrap gap-[var(--space-4)] text-[length:var(--text-sm)] text-dim">
          <span dir="auto">{project.role}</span>
          <span>{project.year}</span>
          {project.href ? (
            <a
              href={project.href}
              className="text-signal hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              {t("liveLink")}
            </a>
          ) : null}
        </div>
      </Reveal>

      {SCREENSHOTS[project.slug] ? (
        <Reveal>
          <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-hairline">
            <Image
              src={SCREENSHOTS[project.slug]!.src}
              alt={SCREENSHOTS[project.slug]!.alt}
              width={SCREENSHOTS[project.slug]!.width}
              height={SCREENSHOTS[project.slug]!.height}
              sizes="(min-width: 1024px) 64rem, 100vw"
              className="h-auto w-full"
            />
          </div>
        </Reveal>
      ) : null}

      {/* Problem — one sentence, large, on --paper, never glass. */}
      <Reveal>
        <p dir="auto" className="max-w-[var(--measure)] text-[length:var(--text-2xl)] font-display leading-[var(--leading-tight)] text-text">
          {caseStudy.problem}
        </p>
      </Reveal>

      {/* Approach — the one place sequential numbering is legitimate. */}
      <Reveal>
        <h2 className="text-[length:var(--text-sm)] text-dim">
          {t("approach")}
        </h2>
        <ol className="mt-[var(--space-4)] flex flex-col gap-[var(--space-4)]">
          {caseStudy.approach.map((step, index) => (
            <li key={step} className="flex gap-[var(--space-4)]">
              <span className="font-mono text-[length:var(--text-sm)] text-signal">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span dir="auto" className="max-w-[var(--measure)] text-text">{step}</span>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal>
        <h2 className="text-[length:var(--text-sm)] text-dim">
          {t("stack")}
        </h2>
        <div dir="auto" className="mt-[var(--space-3)] flex flex-wrap gap-[var(--space-3)] text-[length:var(--text-sm)] text-text">
          {project.stack.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </Reveal>

      <Reveal>
        <h2 className="text-[length:var(--text-sm)] text-dim">
          {t("outcome")}
        </h2>
        <p dir="auto" className="mt-[var(--space-3)] max-w-[var(--measure)] text-[length:var(--text-lg)] text-text">
          {caseStudy.outcome}
        </p>
      </Reveal>

      {caseStudy.figures.length > 0 ? (
        <Reveal className="flex flex-wrap gap-[var(--space-8)]">
          {/* Readout-styled, not the animated <Readout>: figures here are
              already-resolved strings ("4.2s → 2.9s"), not a single number
              to count up to. */}
          {caseStudy.figures.map((figure) => (
            <div key={figure.label} className="flex flex-col gap-1">
              <span className="font-mono text-[length:var(--text-3xl)] tabular-nums text-signal">
                {figure.value}
              </span>
              <span dir="auto" className="text-[length:var(--text-sm)] text-dim">
                {figure.label}
              </span>
            </div>
          ))}
        </Reveal>
      ) : null}

      <Reveal as="footer">
        <Hairline className="mb-[var(--space-8)]" />
        <Link
          href={`/work/${next.slug}`}
          className="font-display text-[length:var(--text-xl)] text-text transition-[color] duration-[var(--dur-fast)] hover:text-signal"
        >
          {t("next")} — {next.name}
        </Link>
      </Reveal>
    </div>
  );
}
