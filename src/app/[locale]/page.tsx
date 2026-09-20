import { use } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { getFeaturedProjects, getProjects, getExperience, getStack } from "@/content";
import { SHOTS } from "@/content/shots";
import { BootSequence } from "@/components/home/BootSequence";
import { HeroBento } from "@/components/home/HeroBento";
import { MobilePortrait } from "@/components/home/MobilePortrait";
import { StatRow } from "@/components/home/StatRow";
import { StackTabs } from "@/components/stack/StackTabs";
import { markGroups } from "@/lib/stack-mark";
import { Reveal } from "@/components/primitives/Reveal";
import { Link } from "@/lib/i18n/navigation";

const HEAD =
  "font-display text-[length:var(--text-section)] font-extrabold uppercase leading-[var(--leading-display)] tracking-[var(--tracking-display)]";
const VIEW_ALL =
  "text-[length:12px] font-semibold uppercase tracking-wide text-signal-text hover:underline";

// ThemeToggle and LocaleSwitch live in the global NavPill; identity lives in
// the global SiteAside. Both are mounted by the locale layout.
export default function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);

  // Must run before any next-intl hook, or the route falls back to dynamic.
  setRequestLocale(locale);

  const t = useTranslations("home.sections");
  const tHero = useTranslations("home.hero");
  const tAbout = useTranslations("home.about");
  const featured = getFeaturedProjects();
  const experience = getExperience().slice(0, 3);
  const stack = getStack();

  // The design's numbered index. 01/02 here, 03 on the contact block.
  const cards = [
    { n: "01", text: tHero("capabilities.one") },
    { n: "02", text: tHero("capabilities.two") },
  ];

  return (
    <main
      id="main"
      className="min-h-dvh px-[var(--space-6)] pt-[var(--shell-top)] pb-[var(--space-22)]"
    >
      <MobilePortrait />

      <BootSequence>
        <HeroBento />
      </BootSequence>

      {/* About sits directly under the headline: the hero is two lines, and a
          visitor who wants more than that should not have to scroll past the
          stats to find it. */}
      <Reveal as="section" className="mt-[var(--space-22)] grid gap-[var(--space-6)] border-t-2 border-hairline pt-[var(--space-8)] md:grid-cols-[160px_1fr] md:gap-[var(--space-6)]">
        <h2 className="text-[length:var(--text-xs)] font-semibold uppercase tracking-wide text-dim">
          {tAbout("heading")}
        </h2>
        <div className="flex flex-col items-start gap-[var(--space-6)]">
          <p dir="auto" className="max-w-[var(--measure)] text-[length:var(--text-lg)] text-text">
            {tAbout("body")}
          </p>
          {/* A download is an action, so it looks like the other primary
              action on the page rather than a bordered box of grey text. The
              note sits under it instead of inside it, where it was competing
              with the label. */}
          <div className="flex flex-col gap-[var(--space-2)]">
            <a
              href="/cv/Mohammad-M-Khani-AI-Engineer.pdf"
              download
              className="group inline-flex items-center gap-[var(--space-3)] self-start bg-signal-fill px-[var(--space-6)] py-[var(--space-4)] text-[length:12px] font-semibold uppercase tracking-wide text-signal-ink transition-[filter] duration-[var(--dur-fast)] hover:brightness-110"
            >
              <svg
                viewBox="0 0 16 16"
                aria-hidden
                className="size-4 shrink-0 transition-transform duration-[var(--dur-fast)] group-hover:translate-y-0.5"
              >
                <path
                  d="M8 1v9M4 7l4 4 4-4M2 14h12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="square"
                />
              </svg>
              {tAbout("cv")}
            </a>
            <span dir="auto" className="font-mono text-[length:11px] uppercase tracking-wide text-dim">
              {tAbout("cvNote")}
            </span>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="mt-[var(--space-22)]">
        <StatRow shipped={getProjects().length} />
      </Reveal>

      <Reveal
        as="section"
        className="mt-[var(--space-22)] grid gap-[var(--space-4)] md:grid-cols-2"
      >
        {cards.map(({ n, text }) => (
          <div
            key={n}
            className="flex flex-col gap-[var(--space-4)] border-2 border-hairline p-[var(--space-6)]"
          >
            <span
              aria-hidden
              className="font-mono text-[length:var(--text-sm)] tabular-nums text-signal-text"
            >
              {n}
            </span>
            <p
              dir="auto"
              className="font-display text-[length:var(--text-xl)] font-extrabold uppercase leading-[var(--leading-tight)] tracking-[var(--tracking-display)] text-text"
            >
              {text}
            </p>
          </div>
        ))}
      </Reveal>

      <Reveal as="section" className="mt-[var(--space-22)]">
        <div className="flex flex-wrap items-end justify-between gap-[var(--space-4)]">
          <h2 className={HEAD}>
            <span className="block text-text">{t("work.line1")}</span>
            <span className="headline-outline block">{t("work.line2")}</span>
          </h2>
          <Link href="/work" className={VIEW_ALL}>
            {t("work.viewAll")}
          </Link>
        </div>

        <ul className="mt-[var(--space-8)] border-t-2 border-hairline">
          {featured.map((project) => (
            <li key={project.slug} className="border-b-2 border-hairline">
              <Link
                href={`/work/${project.slug}`}
                className="group flex items-center gap-[var(--space-4)] py-[var(--space-4)]"
              >
                {/* Decorative: the project name is the link text right
                    beside it, so a second announcement is noise. */}
                {SHOTS[project.slug] ? (
                  <Image
                    src={SHOTS[project.slug]!.src}
                    alt=""
                    width={120}
                    height={75}
                    className="hidden h-[75px] w-[120px] shrink-0 object-cover object-top [filter:var(--shot)] sm:block"
                  />
                ) : null}
                <span className="flex min-w-0 flex-col gap-1">
                  <h3
                    dir="auto"
                    className="font-display text-[length:var(--text-xl)] font-extrabold uppercase tracking-[var(--tracking-display)] text-text"
                  >
                    {project.name}
                  </h3>
                  <span className="flex flex-wrap gap-[var(--space-3)] text-[length:var(--text-sm)] text-dim">
                    <span dir="auto">{project.domain}</span>
                    <span>{project.year}</span>
                  </span>
                </span>
                {/* The affordance, not part of the link text. */}
                <span
                  aria-hidden
                  className="ms-auto shrink-0 text-[length:var(--text-xl)] text-dim transition-[color] duration-[var(--dur-fast)] group-hover:text-signal-text rtl:-scale-x-100"
                >
                  ↗
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal as="section" className="mt-[var(--space-22)]">
        <div className="flex flex-wrap items-end justify-between gap-[var(--space-4)]">
          <h2 className={HEAD}>{t("experience.heading")}</h2>
          <Link href="/experience" className={VIEW_ALL}>
            {t("experience.viewAll")}
          </Link>
        </div>

        <ul className="mt-[var(--space-8)] border-t-2 border-hairline">
          {experience.map((entry) => (
            <li
              key={entry.company}
              className="border-b-2 border-hairline py-[var(--space-6)]"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-[var(--space-4)] gap-y-1">
                <h3
                  dir="auto"
                  className="font-display text-[length:var(--text-lg)] font-extrabold uppercase tracking-[var(--tracking-display)] text-text"
                >
                  {entry.company}
                </h3>
                <p dir="auto" className="text-[length:var(--text-sm)] text-dim">
                  {entry.role}
                </p>
                <p dir="auto" className="text-[length:var(--text-sm)] text-dim">
                  {entry.period}
                </p>
              </div>
              {/* The summary, clamped: a company name and a date range say
                  where he was, not what he did. Two lines is enough to decide
                  whether to open the full timeline. */}
              <p
                dir="auto"
                className="mt-[var(--space-3)] line-clamp-2 max-w-[var(--measure)] text-[length:var(--text-sm)] text-dim"
              >
                {entry.summary}
              </p>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal as="section" className="mt-[var(--space-22)]">
        <div className="flex flex-wrap items-end justify-between gap-[var(--space-4)]">
          <h2 className={HEAD}>{t("stack.heading")}</h2>
          <Link href="/stack" className={VIEW_ALL}>
            {t("stack.viewAll")}
          </Link>
        </div>
        <div className="mt-[var(--space-8)]">
          <StackTabs groups={markGroups(stack)} />
        </div>
      </Reveal>

      <Reveal
        as="section"
        className="mt-[var(--space-22)] border-2 border-hairline p-[var(--space-8)]"
      >
        <span
          aria-hidden
          className="font-mono text-[length:var(--text-sm)] tabular-nums text-signal-text"
        >
          03
        </span>
        <h2 className={`mt-[var(--space-4)] ${HEAD}`}>{t("cta.heading")}</h2>
        <Link
          href="/schedule"
          className="mt-[var(--space-8)] inline-block bg-signal-fill px-[var(--space-6)] py-[var(--space-3)] text-[length:12px] font-semibold uppercase tracking-wide text-signal-ink transition-[filter] duration-[var(--dur-fast)] hover:brightness-110"
        >
          {t("cta.action")}
        </Link>
      </Reveal>
    </main>
  );
}
