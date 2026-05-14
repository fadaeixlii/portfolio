import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroAnimation, HeroItem } from "@/components/marketing/HeroAnimation";
import { HeroScene } from "@/components/marketing/HeroScene";
import { ProjectCard } from "@/components/marketing/ProjectCard";
import { BlurText } from "@/components/shared/BlurText";
import { CountUp } from "@/components/shared/CountUp";
import { Magnet } from "@/components/shared/Magnet";
import { ClickSpark } from "@/components/shared/ClickSpark";
import { FadeIn } from "@/components/shared/FadeIn";
import { site, skills, getFeaturedProjects } from "@/lib/content";

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
  return { target: num, suffix };
}

export default function HomePage() {
  const featured = getFeaturedProjects();

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative flex min-h-[85vh] flex-col justify-center overflow-hidden px-6">
        <HeroScene />
        <div className="relative mx-auto w-full max-w-5xl">
          <HeroAnimation>
            {/* Availability */}
            <HeroItem className="mb-8">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-sm text-muted-foreground">
                  {site.availability.message}
                </span>
              </div>
            </HeroItem>

            {/* Name */}
            <HeroItem>
              <h1 className="font-serif text-5xl font-normal tracking-tight sm:text-6xl lg:text-8xl">
                {site.name.split(" ")[0]}
                <br />
                <span className="text-accent">
                  {site.name.split(" ").slice(1).join(" ")}
                </span>
              </h1>
            </HeroItem>
          </HeroAnimation>

          {/* Tagline — BlurText with independent word-by-word blur reveal */}
          <div className="mt-6">
            <BlurText
              text={site.hero.subtitle}
              className="max-w-lg text-lg leading-relaxed text-muted-foreground lg:text-xl"
              delay={0.5}
              duration={0.5}
            />
          </div>

          {/* Social links */}
          <HeroAnimation>
            <HeroItem className="mt-8">
              <div className="flex items-center gap-5">
                {site.social.github && (
                  <Magnet strength={0.4}>
                    <a
                      href={site.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="GitHub"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <svg
                        className="size-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
                      </svg>
                    </a>
                  </Magnet>
                )}
                {site.social.linkedin && (
                  <Magnet strength={0.4}>
                    <a
                      href={site.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <svg
                        className="size-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
                      </svg>
                    </a>
                  </Magnet>
                )}
                <Magnet strength={0.4}>
                  <a
                    href={`mailto:${site.email}`}
                    aria-label="Email"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <svg
                      className="size-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </a>
                </Magnet>
              </div>
            </HeroItem>
          </HeroAnimation>
        </div>
      </section>

      {/* ── About ── */}
      <section className="border-t border-border px-6 py-24">
        <FadeIn>
          <div className="mx-auto w-full max-w-5xl">
            <h2 className="mb-8 font-serif text-3xl font-normal tracking-tight">
              about
            </h2>
            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {site.about.intro}
            </p>

            <div className="mt-12 grid max-w-sm grid-cols-3 gap-8">
              {site.stats.map((stat) => {
                const { target, suffix } = parseStat(stat.value);
                return (
                  <div key={stat.label} className="flex flex-col gap-1">
                    <span className="font-serif text-3xl font-normal text-foreground">
                      <CountUp target={target} suffix={suffix} />
                    </span>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">
                      {stat.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <Link
              href="/about"
              className="mt-8 inline-flex items-center gap-1.5 text-sm text-accent transition-colors hover:text-foreground"
            >
              More about me
              <svg
                className="size-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* ── Selected Work ── */}
      {featured.length > 0 && (
        <section className="border-t border-border px-6 py-24">
          <FadeIn>
            <div className="mx-auto w-full max-w-5xl">
              <div className="mb-12 flex items-baseline justify-between">
                <h2 className="font-serif text-3xl font-normal tracking-tight">
                  selected work
                </h2>
                <Link
                  href="/work"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  View all
                </Link>
              </div>
              <div className="flex flex-col gap-6">
                {featured.map((project) => (
                  <ProjectCard key={project.slug} project={project} />
                ))}
              </div>
            </div>
          </FadeIn>
        </section>
      )}

      {/* ── Tech Stack ── */}
      <section className="border-t border-border px-6 py-24">
        <FadeIn>
          <div className="mx-auto w-full max-w-5xl">
            <h2 className="mb-12 font-serif text-3xl font-normal tracking-tight">
              tech stack
            </h2>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {skills.categories.map((cat) => (
                <div key={cat.name} className="flex flex-col gap-3">
                  <span className="font-mono text-xs uppercase tracking-widest text-accent">
                    {cat.name}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {cat.skills.map((s) => (
                      <span
                        key={s}
                        className="rounded-md border border-border px-3 py-1 text-sm text-foreground transition-colors hover:border-accent/40"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── Contact CTA ── */}
      <section className="border-t border-border px-6 py-24">
        <FadeIn>
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 text-center">
            <h2 className="font-serif text-3xl font-normal tracking-tight">
              let&apos;s work together
            </h2>
            <p className="max-w-md text-muted-foreground">
              {site.contact.description}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <ClickSpark>
                <Magnet strength={0.15}>
                  <Button render={<Link href="/contact" />} size="lg">
                    Get in touch
                  </Button>
                </Magnet>
              </ClickSpark>
              <span className="text-sm text-muted-foreground">or</span>
              <a
                href={`mailto:${site.email}`}
                className="text-sm text-accent transition-colors hover:text-foreground"
              >
                {site.email}
              </a>
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
