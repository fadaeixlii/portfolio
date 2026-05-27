import type { Metadata } from "next";
import Image from "next/image";
import { site, skills, experience } from "@/lib/content";
import { FadeIn } from "@/components/shared/FadeIn";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { ExperienceTimeline } from "@/components/marketing/ExperienceTimeline";

export const metadata: Metadata = {
  title: "About",
  description: site.about.intro,
  alternates: { canonical: "https://fadaeixlii.com/about" },
};

export default function AboutPage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-16 md:px-12 lg:px-16">
      <div className="flex flex-col gap-12 sm:gap-20">
        {/* Intro with profile image */}
        <FadeIn>
          <div className="flex flex-col gap-8">
            <div className="flex flex-col items-start gap-8 sm:flex-row">
              <div className="relative mx-auto w-40 shrink-0 overflow-hidden rounded-lg border border-border sm:mx-0 sm:w-56 md:w-70">
                <Image
                  src="/images/profile-dark.png"
                  alt="Mohammad M Khani — pixel art illustration"
                  width={280}
                  height={280}
                  className="hidden w-full object-cover dark:block"
                  style={{ height: "auto" }}
                  priority
                />
                <Image
                  src="/images/profile-light.png"
                  alt="Mohammad M Khani — pixel art illustration"
                  width={280}
                  height={280}
                  className="block w-full object-cover dark:hidden"
                  style={{ height: "auto" }}
                  priority
                />
              </div>
              <div className="flex flex-col gap-4">
                <h1 className="font-serif text-4xl font-normal tracking-tight sm:text-5xl">
                  about
                </h1>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {site.about.intro}
                </p>
              </div>
            </div>
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
            <SectionLabel index="I" label="experience" />
            <h2 className="text-2xl font-medium tracking-tight">
              Experience
            </h2>
            <ExperienceTimeline entries={experience} />
          </div>
        </FadeIn>

        {/* Skills */}
        <FadeIn delay={0.15}>
          <div className="flex flex-col gap-8">
            <SectionLabel index="II" label="skills" />
            <h2 className="text-2xl font-medium tracking-tight">Skills</h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
