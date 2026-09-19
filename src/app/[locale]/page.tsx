import { use } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { getFeaturedProjects, getExperience, getStack } from "@/content";
import { SHOTS } from "@/content/shots";
import { BootSequence } from "@/components/home/BootSequence";
import { HeroBento } from "@/components/home/HeroBento";
import { StatRow } from "@/components/home/StatRow";
import { StackGrid } from "@/components/stack/StackGrid";
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
      className="min-h-dvh px-[var(--space-6)] pt-[var(--space-32)] pb-[var(--space-22)]"
    >
      <BootSequence>
        <HeroBento />
      </BootSequence>

      <Reveal as="section" className="mt-[var(--space-22)]">
        <StatRow />
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
              className="flex flex-wrap items-baseline justify-between gap-x-[var(--space-4)] gap-y-1 border-b-2 border-hairline py-[var(--space-4)]"
            >
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
          <StackGrid groups={stack} />
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
          className="mt-[var(--space-8)] inline-block bg-signal px-[var(--space-6)] py-[var(--space-3)] text-[length:12px] font-semibold uppercase tracking-wide text-signal-ink transition-[filter] duration-[var(--dur-fast)] hover:brightness-110"
        >
          {t("cta.action")}
        </Link>
      </Reveal>
    </main>
  );
}
