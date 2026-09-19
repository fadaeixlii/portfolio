import { use } from "react";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { getFeaturedProjects, getExperience, getStack } from "@/content";
import { BootSequence } from "@/components/home/BootSequence";
import { HeroBento } from "@/components/home/HeroBento";
import { ProjectCard } from "@/components/work/ProjectCard";
import { Reveal, Stagger, StaggerItem } from "@/components/primitives/Reveal";
import { Link } from "@/lib/i18n/navigation";

// ThemeToggle and LocaleSwitch now live in the global NavPill (mounted in
// the locale layout) — a second pair here duplicated them on every page and
// broke strict-mode role queries in the test suite.
export default function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);

  // Must run before any next-intl hook, or the route falls back to dynamic.
  setRequestLocale(locale);

  const t = useTranslations("home.sections");
  const featured = getFeaturedProjects();
  const experience = getExperience().slice(0, 3);
  const stack = getStack();

  return (
    <main id="main" className="min-h-dvh px-[var(--space-6)] pt-[var(--space-32)]">
      <BootSequence>
        <HeroBento />
      </BootSequence>

      <Reveal as="section" className="mx-auto mt-[var(--space-32)] max-w-5xl">
        <div className="flex items-end justify-between gap-[var(--space-4)]">
          <h2 className="font-display text-[length:var(--text-3xl)]">
            {t("work.heading")}
          </h2>
          <Link
            href="/work"
            className="text-[length:var(--text-sm)] text-signal hover:underline"
          >
            {t("work.viewAll")}
          </Link>
        </div>
        <Stagger className="mt-[var(--space-8)] grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-3">
          {featured.map((project) => (
            <StaggerItem key={project.slug}>
              <ProjectCard project={project} />
            </StaggerItem>
          ))}
        </Stagger>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-[var(--space-24)] max-w-5xl">
        <div className="flex items-end justify-between gap-[var(--space-4)]">
          <h2 className="font-display text-[length:var(--text-3xl)]">
            {t("experience.heading")}
          </h2>
          <Link
            href="/experience"
            className="text-[length:var(--text-sm)] text-signal hover:underline"
          >
            {t("experience.viewAll")}
          </Link>
        </div>
        <div className="mt-[var(--space-8)] flex flex-col gap-[var(--space-6)]">
          {experience.map((entry) => (
            <div
              key={entry.company}
              className="flex flex-col gap-1 border-b border-hairline pb-[var(--space-6)] last:border-b-0"
            >
              <div className="flex flex-wrap items-baseline gap-[var(--space-3)]">
                <span className="font-display text-[length:var(--text-lg)] text-text">
                  {entry.company}
                </span>
                <span className="text-[length:var(--text-sm)] text-dim">
                  {entry.period}
                </span>
              </div>
              <p className="text-[length:var(--text-sm)] text-dim">
                {entry.role}
              </p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-[var(--space-24)] max-w-5xl">
        <h2 className="font-display text-[length:var(--text-3xl)]">
          {t("stack.heading")}
        </h2>
        <div className="mt-[var(--space-8)] grid grid-cols-2 gap-[var(--space-6)] md:grid-cols-3">
          {stack.map((group) => (
            <div key={group.name} className="flex flex-col gap-[var(--space-2)]">
              <span className="text-[length:var(--text-sm)] text-dim">
                {group.name}
              </span>
              <div className="flex flex-wrap gap-[var(--space-2)] text-[length:var(--text-sm)] text-text">
                {group.items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal
        as="section"
        className="mx-auto my-[var(--space-32)] max-w-5xl text-center"
      >
        <h2 className="font-display text-[length:var(--text-4xl)] leading-[var(--leading-tight)]">
          {t("cta.heading")}
        </h2>
        <Link
          href="/schedule"
          className="mt-[var(--space-8)] inline-flex h-11 items-center justify-center rounded-[var(--radius-full)] bg-signal px-6 text-[length:var(--text-base)] font-medium text-signal-ink transition-[filter] duration-[var(--dur-fast)] hover:brightness-110"
        >
          {t("cta.action")}
        </Link>
      </Reveal>
    </main>
  );
}
