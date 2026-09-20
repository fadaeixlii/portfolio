import Image from "next/image";
import { useTranslations } from "next-intl";
import { getProjects } from "@/content";
import { SHOTS, GALLERIES } from "@/content/shots";
import { StackChip } from "@/components/stack/StackChip";
import { FigureReadout } from "./FigureReadout";
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
      {project.href || project.links.length > 0 ? (
        <div className="flex flex-col gap-1 border-b-2 border-hairline py-[var(--space-4)]">
          <dt className={META_LABEL}>{live}</dt>
          <dd className="flex flex-col gap-1">
            {project.href ? (
              <a
                href={project.href}
                className="text-[length:var(--text-sm)] text-signal-text hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                {project.href.replace(/^https?:\/\//, "")}
              </a>
            ) : null}
            {project.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[length:var(--text-sm)] text-signal-text hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                {link.label}
              </a>
            ))}
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
  const gallery = GALLERIES[project.slug] ?? [];

  return (
    <div className="flex flex-col gap-[var(--space-22)] px-[var(--space-6)] pt-[var(--shell-top)] pb-[var(--space-22)]">
      <Reveal as="header" className="flex flex-col gap-[var(--space-8)]">
        <h1
          dir="auto"
          className="font-display text-[length:var(--text-4xl)] font-extrabold uppercase leading-[var(--leading-display)] tracking-[var(--tracking-display)] text-text"
        >
          {project.name}
        </h1>
        <Meta project={project} live={t("liveLink")} />

        {/* Stack on its own full-width row rather than crammed into a quarter
            of the meta strip — eight chips in a 200px cell wrapped to six
            lines and pushed the other three fields out of alignment. */}
        <div className="grid gap-[var(--space-3)] border-b-2 border-hairline pb-[var(--space-6)] md:grid-cols-[160px_1fr] md:gap-[var(--space-6)]">
          <h2 className={META_LABEL}>{t("stack")}</h2>
          <div className="flex flex-wrap gap-[var(--space-2)]">
            {project.stack.map((item) => (
              <StackChip key={item} name={item} />
            ))}
          </div>
        </div>
      </Reveal>

      {shot ? (
        <Reveal>
          <div
            className={
              shot.fit === "contain"
                ? "flex justify-center overflow-hidden border-2 border-hairline bg-surface py-[var(--space-8)]"
                : "relative overflow-hidden border-2 border-hairline"
            }
          >
            <Image
              src={shot.src}
              alt={shot.alt}
              width={shot.width}
              height={shot.height}
              sizes={shot.fit === "contain" ? "378px" : "(min-width: 1024px) 64rem, 100vw"}
              className={
                shot.fit === "contain"
                  ? "h-auto w-[378px] max-w-full border-2 border-hairline [filter:var(--shot)]"
                  : "h-auto w-full [filter:var(--shot)]"
              }
            />
          </div>
        </Reveal>
      ) : null}

      {gallery.length > 0 ? (
        <Reveal>
          <h2 className={META_LABEL}>{t("gallery")}</h2>
          {/* The publisher's own store assets, already composed and already
              public. Scrolls on a phone rather than shrinking four portrait
              screenshots into unreadable slivers. */}
          {/* tabIndex on the scroller, not on each item: a horizontally
              scrolling region whose children are plain images has no
              focusable content, so a keyboard user cannot reach the shots
              that are off-screen. axe flags this as
              `scrollable-region-focusable`. It needs a name too, or the focus
              stop is announced as nothing — but as `aria-label` on the <ul>,
              not `role="group"`, which overrides the implicit list role and
              orphans every <li> inside it. */}
          <ul
            tabIndex={0}
            aria-label={t("gallery")}
            className="mt-[var(--space-6)] flex snap-x snap-mandatory gap-[var(--space-4)] overflow-x-auto pb-[var(--space-3)]"
          >
            {gallery.map((item) => (
              <li
                key={item.src}
                // Fixed 9:16 box, not intrinsic height: the iOS assets are
                // 230x498 and the Android ones 720x1280, so at a shared width
                // they render 80px apart and the row bottoms out ragged.
                className="relative aspect-[9/16] w-[210px] shrink-0 snap-start overflow-hidden border-2 border-hairline bg-surface sm:w-[240px]"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="240px"
                  className="object-cover object-top"
                />
              </li>
            ))}
          </ul>
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
          {/* Not the home page's <Readout>, which takes a number: these are
              composed strings, so FigureReadout interpolates the number
              inside them and leaves the units and the arrow alone. */}
          {caseStudy.figures.map((figure) => (
            <div key={figure.label} className="flex flex-col gap-1">
              <FigureReadout
                value={figure.value}
                className="font-mono text-[length:var(--text-3xl)] tabular-nums text-signal-text"
              />
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
