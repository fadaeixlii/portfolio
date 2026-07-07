import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroAnimation, HeroItem } from "@/components/marketing/HeroAnimation";
import { HeroScene } from "@/components/marketing/HeroScene";
import { ProjectCard } from "@/components/marketing/ProjectCard";
import { ExperienceTimeline } from "@/components/marketing/ExperienceTimeline";
import { CountUp } from "@/components/shared/CountUp";
import { Magnet } from "@/components/shared/Magnet";
import { ClickSpark } from "@/components/shared/ClickSpark";
import { FadeIn } from "@/components/shared/FadeIn";
import { NLClock } from "@/components/shared/NLClock";
import { TechGrid } from "@/components/marketing/TechGrid";
import { site, skills, experience, getFeaturedProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: `${site.name} — ${site.role}`,
  description: site.hero.subtitle,
  openGraph: {
    type: "website",
    url: site.siteUrl,
    title: `${site.name} — ${site.role}`,
    description: site.hero.subtitle,
  },
  twitter: { card: "summary_large_image" },
};

function parseStat(value: string) {
  const num = parseInt(value, 10);
  const suffix = value.replace(/^\d+/, "");
  return { target: num, suffix, isNumeric: !isNaN(num) };
}

const sectionNav = [
  ["I", "Selected work", "#work"],
  ["II", "Experience", "#experience"],
  ["III", "About", "#about"],
  ["IV", "Contact", "#contact"],
] as const;

export default function HomePage() {
  const featured = getFeaturedProjects();

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-4 pb-20 pt-14 sm:px-6 md:px-12 lg:px-16">
        <HeroScene />
        <div className="relative mx-auto w-full max-w-7xl">
          <HeroAnimation>
            {/* Meta row — 4 columns */}
            <HeroItem className="mb-14">
              <div className="grid grid-cols-2 gap-4 border-b border-border pb-6 sm:grid-cols-4 sm:gap-6">
                <div>
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Index № {site.hero.indexNo} — Portfolio
                  </div>
                  <div className="font-mono text-xs text-foreground">
                    Vol. {site.hero.volume} · {site.hero.edition} Edition
                  </div>
                </div>
                <div>
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Currently
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75 motion-safe:animate-ping" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald" />
                    </span>
                    {site.availability.message}
                  </div>
                </div>
                <div>
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {site.hero.city}
                  </div>
                  <NLClock />
                </div>
                <div className="text-right">
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Coordinates
                  </div>
                  <div className="font-mono text-xs">{site.hero.coordinates}</div>
                </div>
              </div>
            </HeroItem>
          </HeroAnimation>

          {/* Name + sphere area — two-column on desktop */}
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_220px]">
            {/* Left: name + tagline */}
            <div>
              <HeroAnimation>
                {/* Role label */}
                <HeroItem>
                  <div className="mb-6 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    ✶ &nbsp; Full-stack developer · AI &amp; Web3 · est. {site.hero.established}
                  </div>
                </HeroItem>

                {/* Name treatment */}
                <HeroItem>
                  <h1 className="font-serif font-normal tracking-[-0.03em] leading-[0.95] text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl">
                    Mohammad
                    <span className="mt-1 block pl-0 italic text-accent sm:pl-8 md:pl-12 lg:pl-16">
                      M. Khani
                    </span>
                  </h1>
                </HeroItem>
              </HeroAnimation>

              {/* Tagline */}
              <div className="relative z-10 mt-12 max-w-lg border-t border-border pt-6">
                <p className="font-serif text-xl leading-[1.35]">
                  I build web applications that handle{" "}
                  <em className="italic text-accent">real users</em> and{" "}
                  <em className="italic text-accent">real money</em>.
                </p>

                {/* CTA row */}
                <div className="mt-6 flex flex-wrap items-center gap-6">
                  <ClickSpark>
                    <Magnet strength={0.15}>
                      <Button render={<Link href={site.hero.cta.href} />} size="lg">
                        {site.hero.cta.label} <span className="ml-2">→</span>
                      </Button>
                    </Magnet>
                  </ClickSpark>
                  <a
                    href={`mailto:${site.email}`}
                    className="border-b border-border-strong pb-0.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    or — {site.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Right: section nav (desktop only) — no longer overlapping */}
            <nav className="hidden pt-8 lg:block" aria-label="Page sections">
              <ul className="flex list-none flex-col gap-3.5 p-0">
                {sectionNav.map(([roman, label, anchor]) => (
                  <li key={roman}>
                    <a
                      href={anchor}
                      className="grid grid-cols-[32px_1fr_16px] items-center border-b border-dashed border-border pb-2.5 font-mono text-xs text-muted-foreground transition-colors hover:text-accent"
                    >
                      <span className="text-accent">{roman}.</span>
                      <span className="lowercase text-foreground">{label}</span>
                      <span className="text-right">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <TechGrid categories={skills.categories} />

      {/* ── Selected Work ── */}
      {featured.length > 0 && (
        <section id="work" className="border-t border-border px-4 py-16 sm:px-6 sm:py-24 md:px-12 lg:px-16">
          <FadeIn>
            <div className="mx-auto w-full max-w-7xl">
              {/* Section header */}
              <div className="mb-14 grid gap-6 sm:grid-cols-[200px_1fr] sm:gap-16">
                <div aria-hidden="true" className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
                  § I — Selected
                </div>
                <div>
                  <h2 className="font-serif text-3xl font-normal lowercase tracking-tight sm:text-[40px] sm:leading-tight">
                    {site.numbers.selectedWorkCount} projects,{" "}
                    <em className="italic text-muted-foreground">
                      picked over {site.numbers.totalProjects}.
                    </em>
                  </h2>
                  <p className="mt-6 max-w-xl text-muted-foreground">
                    Each shipped to production. Each running today. Each with a paying
                    customer who didn&apos;t ask for their money back.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-8">
                {featured.map((project, i) => (
                  <ProjectCard
                    key={project.slug}
                    project={project}
                    index={i}
                    total={featured.length}
                  />
                ))}
              </div>

              {/* Archive link */}
              <div className="mt-10 flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  {featured.length} of {site.numbers.totalProjects} · curated by year
                </span>
                <Link
                  href="/work"
                  className="inline-flex items-center gap-2 text-sm lowercase text-accent transition-colors hover:text-foreground"
                >
                  view full archive <span>→</span>
                </Link>
              </div>
            </div>
          </FadeIn>
        </section>
      )}

      {/* ── Experience ── */}
      <section id="experience" className="border-t border-border px-4 py-16 sm:px-6 sm:py-24 md:px-12 lg:px-16">
        <FadeIn>
          <div className="mx-auto w-full max-w-7xl">
            {/* Section header */}
            <div className="mb-16 grid gap-6 sm:grid-cols-[200px_1fr] sm:gap-16">
              <div aria-hidden="true" className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
                § II — Experience
              </div>
              <div>
                <h2 className="font-serif text-3xl font-normal lowercase tracking-tight sm:text-[40px] sm:leading-tight">
                  Where I&apos;ve{" "}
                  <em className="italic text-muted-foreground">
                    spent {site.numbers.experienceYears} years
                  </em>{" "}
                  learning the hard way.
                </h2>
                <p className="mt-5 max-w-xl text-muted-foreground">
                  {site.numbers.experienceChapters} chapters. Each taught a different
                  lesson about shipping software that other people depend on.
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="grid sm:grid-cols-[200px_1fr] sm:gap-16">
              <div />
              <ExperienceTimeline entries={experience} />
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── About Strip ── */}
      <section id="about" className="border-t border-border px-4 py-16 sm:px-6 sm:py-24 md:px-12 lg:px-16">
        <FadeIn>
          <div className="mx-auto w-full max-w-7xl">
            <div className="grid gap-8 sm:grid-cols-[200px_1fr_1fr] sm:gap-16">
              <div aria-hidden="true" className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
                § III — About
              </div>
              <p className="font-serif text-xl leading-[1.35] tracking-[-0.005em] sm:text-[22px]">
                {site.about.intro}
              </p>
              <div className="flex flex-col gap-7">
                {site.stats.map((stat) => {
                  const { target, suffix, isNumeric } = parseStat(stat.value);
                  return (
                    <div
                      key={stat.label}
                      className="grid grid-cols-[120px_1fr] items-baseline gap-4 border-b border-border pb-4"
                    >
                      <span className="font-serif text-3xl leading-none text-foreground">
                        {isNumeric ? (
                          <CountUp target={target} suffix={suffix} />
                        ) : (
                          stat.value
                        )}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        {stat.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── Contact CTA ── */}
      <section id="contact" className="border-t border-border px-4 py-16 sm:px-6 sm:py-24 md:px-12 lg:px-16">
        <FadeIn>
          <div className="mx-auto w-full max-w-7xl">
            <div className="grid items-end gap-8 sm:grid-cols-[200px_1fr_240px] sm:gap-16">
              <div aria-hidden="true" className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
                § IV — Contact
              </div>
              <h2 className="font-serif text-3xl font-normal lowercase tracking-tight sm:text-4xl md:text-[56px] md:leading-[1.05]">
                {site.contact.description.split("?")[0]}?{" "}
                <em className="italic text-accent">
                  {site.contact.description.split("?")[1]?.trim() ?? "Send it."}
                </em>
              </h2>
              <div className="text-right">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Reply within
                </div>
                <div className="font-serif text-4xl">
                  {site.contact.responseTime} {site.contact.responseUnit}
                </div>
              </div>
            </div>

            <div className="mt-14 flex flex-wrap items-center gap-8">
              <a
                href={`mailto:${site.email}`}
                className="border-b border-accent pb-1.5 font-mono text-base lowercase text-accent transition-colors hover:text-foreground"
              >
                {site.email}
              </a>
              {site.phone && (
                <a
                  href={`tel:${site.phone.replace(/\s/g, "")}`}
                  className="border-b border-accent pb-1.5 font-mono text-base text-accent transition-colors hover:text-foreground"
                >
                  {site.phone}
                </a>
              )}
              <span className="font-mono text-xs text-muted-foreground">or</span>
              {site.social.github && (
                <a
                  href={site.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm lowercase transition-colors hover:text-accent"
                >
                  github <span aria-hidden="true" className="text-muted-foreground">↗</span>
                </a>
              )}
              {site.social.linkedin && (
                <a
                  href={site.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm lowercase transition-colors hover:text-accent"
                >
                  linkedin <span aria-hidden="true" className="text-muted-foreground">↗</span>
                </a>
              )}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── JSON-LD ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: site.name,
            url: site.siteUrl,
            jobTitle: site.role,
            knowsAbout: ["React", "Next.js", "TypeScript", "Node.js"],
            sameAs: Object.values(site.social).filter(Boolean),
          }),
        }}
      />
    </>
  );
}
