import { useTranslations } from "next-intl";
import { getProjects } from "@/content";
import type { Project, CaseStudy } from "@/content/schema";
import { Reveal } from "@/components/primitives/Reveal";
import { Hairline } from "@/components/primitives/Hairline";
import { Link } from "@/lib/i18n/navigation";

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
        <h1 className="font-display text-[length:var(--text-4xl)] leading-[var(--leading-tight)] text-text">
          {project.name}
        </h1>
        <div className="flex flex-wrap gap-[var(--space-4)] text-[length:var(--text-sm)] text-dim">
          <span>{project.role}</span>
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

      {/* Problem — one sentence, large, on --paper, never glass. */}
      <Reveal>
        <p className="max-w-[var(--measure)] text-[length:var(--text-2xl)] font-display leading-[var(--leading-tight)] text-text">
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
              <span className="max-w-[var(--measure)] text-text">{step}</span>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal>
        <h2 className="text-[length:var(--text-sm)] text-dim">
          {t("stack")}
        </h2>
        <div className="mt-[var(--space-3)] flex flex-wrap gap-[var(--space-3)] text-[length:var(--text-sm)] text-text">
          {project.stack.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </Reveal>

      <Reveal>
        <h2 className="text-[length:var(--text-sm)] text-dim">
          {t("outcome")}
        </h2>
        <p className="mt-[var(--space-3)] max-w-[var(--measure)] text-[length:var(--text-lg)] text-text">
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
              <span className="text-[length:var(--text-sm)] text-dim">
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
