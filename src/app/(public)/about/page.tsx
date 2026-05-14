import type { Metadata } from "next";
import { site, skills, experience } from "@/lib/content";
import { FadeIn } from "@/components/shared/FadeIn";

export const metadata: Metadata = {
  title: "About",
  description: site.about.intro,
  alternates: { canonical: "https://fadaeixlii.com/about" },
};

export default function AboutPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="flex flex-col gap-16">
        {/* Intro */}
        <FadeIn>
          <div className="flex flex-col gap-6">
            <h1 className="font-serif text-4xl font-normal tracking-tight">
              About
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {site.about.intro}
            </p>
            {site.about.paragraphs.map((p, i) => (
              <p key={i} className="leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}
          </div>
        </FadeIn>

        {/* Experience */}
        <FadeIn delay={0.1}>
          <div className="flex flex-col gap-8">
            <h2 className="text-2xl font-medium tracking-tight">Experience</h2>
            <div className="flex flex-col gap-8">
              {experience.map((job, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-2 border-l-2 border-accent/30 pl-6"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <h3 className="font-medium">{job.role}</h3>
                    <span className="text-sm text-muted-foreground">
                      {job.period}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {job.company} · {job.location}
                  </p>
                  <p className="leading-relaxed text-muted-foreground">
                    {job.description}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {job.tech.map((t) => (
                      <span
                        key={t}
                        className="rounded-sm bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Skills */}
        <FadeIn delay={0.15}>
          <div className="flex flex-col gap-8">
            <h2 className="text-2xl font-medium tracking-tight">Skills</h2>
            <div className="grid gap-8 sm:grid-cols-2">
              {skills.categories.map((cat) => (
                <div key={cat.name} className="flex flex-col gap-3">
                  <h3 className="text-sm font-medium uppercase tracking-widest text-accent">
                    {cat.name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {cat.skills.map((s) => (
                      <span
                        key={s}
                        className="rounded-sm bg-muted px-2 py-1 text-sm text-foreground"
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
      </div>
    </section>
  );
}
