import Image from "next/image";
import { useTranslations } from "next-intl";
import { getProjects } from "@/content";
import { SHOTS } from "@/content/shots";
import type { Project, CaseStudy } from "@/content/schema";
import { Reveal } from "@/components/primitives/Reveal";
import { Link } from "@/lib/i18n/navigation";

const META_LABEL =
  "text-[length:var(--text-xs)] font-semibold uppercase tracking-wide text-dim";

/**
 * The meta block the design puts in a sidebar. It is a strip here: the case
 * study already renders inside the shell's sticky identity column, and a
 * third column at this width leaves the body under 400px. Role, year, stack
 * and the live link are every field the content schema actually holds —
 * client, team and duration are not recorded anywhere, and a case study is
 * not the place to start guessing them.
 */
function Meta({ project, live }: { project: Project; live: string }) {
  const t = useTranslations("work.caseStudy");

  return (
    <dl className="grid grid-cols-2 gap-x-[var(--space-4)] border-t-2 border-hairline md:grid-cols-4">
      <div className="flex flex-col gap-1 border-b-2 border-hairline py-[var(--space-4)]">
        <dt className={META_LABEL}>{t("role")}</dt>
        <dd dir="auto" className="text-[length:var(--text-sm)] text-text">
          {project.role}
        </dd>
      </div>
      <div className="flex flex-col gap-1 border-b-2 border-hairline py-[var(--space-4)]">
        <dt className={META_LABEL}>{t("year")}</dt>
        <dd className="font-mono text-[length:var(--text-sm)] tabular-nums text-text">
          {project.year}
        </dd>
      </div>
      <div className="flex flex-col gap-1 border-b-2 border-hairline py-[var(--space-4)]">
        <dt className={META_LABEL}>{t("stack")}</dt>
        <dd
          dir="auto"
          className="flex flex-wrap gap-x-[var(--space-3)] gap-y-1 text-[length:var(--text-sm)] text-text"
        >
          {project.stack.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </dd>
      </div>
      {project.href ? (
        <div className="flex flex-col gap-1 border-b-2 border-hairline py-[var(--space-4)]">
          <dt className={META_LABEL}>{live}</dt>
          <dd>
            <a
              href={project.href}
              className="text-[length:var(--text-sm)] text-signal-text hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              {project.href.replace(/^https?:\/\//, "")}
            </a>
          </dd>
        </div>
      ) : null}
    </dl>
  );
}

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
  const shot = SHOTS[project.slug];

  return (
    <div className="flex flex-col gap-[var(--space-22)] px-[var(--space-6)] pt-[var(--space-24)] pb-[var(--space-22)]">
      <Reveal as="header" className="flex flex-col gap-[var(--space-8)]">
        <h1
          dir="auto"
          className="font-display text-[length:var(--text-4xl)] font-extrabold uppercase leading-[var(--leading-display)] tracking-[var(--tracking-display)] text-text"
        >
          {project.name}
        </h1>
        <Meta project={project} live={t("liveLink")} />
      </Reveal>

      {shot ? (
        <Reveal>
          <div className="relative overflow-hidden border-2 border-hairline">
            <Image
              src={shot.src}
              alt={shot.alt}
              width={shot.width}
              height={shot.height}
              sizes="(min-width: 1024px) 64rem, 100vw"
              className="h-auto w-full [filter:var(--shot)]"
            />
          </div>
        </Reveal>
      ) : null}

      {/* Problem — one sentence, large, on --paper, never glass. */}
      <Reveal>
        <p
          dir="auto"
          className="max-w-[var(--measure)] font-display text-[length:var(--text-2xl)] leading-[var(--leading-tight)] text-text"
        >
          {caseStudy.problem}
        </p>
      </Reveal>

      {/* Approach — the one place sequential numbering is legitimate. */}
      <Reveal>
        <h2 className={META_LABEL}>{t("approach")}</h2>
        <ol className="mt-[var(--space-6)] border-t-2 border-hairline">
          {caseStudy.approach.map((step, index) => (
            <li
              key={step}
              className="flex gap-[var(--space-4)] border-b-2 border-hairline py-[var(--space-4)]"
            >
              <span className="font-mono text-[length:var(--text-sm)] tabular-nums text-signal-text">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span dir="auto" className="max-w-[var(--measure)] text-text">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal>
        <h2 className={META_LABEL}>{t("outcome")}</h2>
        <p
          dir="auto"
          className="mt-[var(--space-4)] max-w-[var(--measure)] text-[length:var(--text-lg)] text-text"
        >
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
              <span className="font-mono text-[length:var(--text-3xl)] tabular-nums text-signal-text">
                {figure.value}
              </span>
              <span dir="auto" className="text-[length:var(--text-sm)] text-dim">
                {figure.label}
              </span>
            </div>
          ))}
        </Reveal>
      ) : null}

      {/* Both ways out, each label its own element — a "Next project — Name"
          string is the banned middle-dot pattern wearing a dash. */}
      <Reveal
        as="footer"
        className="flex flex-wrap items-end justify-between gap-[var(--space-6)] border-t-2 border-hairline pt-[var(--space-8)]"
      >
        <Link
          href="/work"
          className="text-[length:12px] font-semibold uppercase tracking-wide text-dim transition-[color] duration-[var(--dur-fast)] hover:text-text"
        >
          {t("back")}
        </Link>
        <Link
          href={`/work/${next.slug}`}
          className="group flex flex-col gap-1 text-end"
        >
          <span className={META_LABEL}>{t("next")}</span>
          <span
            dir="auto"
            className="font-display text-[length:var(--text-xl)] font-extrabold uppercase tracking-[var(--tracking-display)] text-text transition-[color] duration-[var(--dur-fast)] group-hover:text-signal-text"
          >
            {next.name}
          </span>
        </Link>
      </Reveal>
    </div>
  );
}
