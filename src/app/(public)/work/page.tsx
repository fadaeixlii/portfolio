import type { Metadata } from "next";
import { projects } from "@/lib/content";
import { ProjectCard } from "@/components/marketing/ProjectCard";
import { FadeIn } from "@/components/shared/FadeIn";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected projects and case studies. React, Next.js, TypeScript, and Node.js applications in production.",
  alternates: { canonical: "https://fadaeixlii.com/work" },
};

export default function WorkPage() {
  const published = projects.filter((p) => p.status === "published");

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="flex flex-col gap-8 sm:gap-12">
        <FadeIn>
          <div className="flex flex-col gap-4">
            <h1 className="font-serif text-4xl font-normal tracking-tight">
              Work
            </h1>
            <p className="text-lg text-muted-foreground">
              Selected projects and case studies from six years of full-stack
              development.
            </p>
          </div>
        </FadeIn>

        <div className="flex flex-col gap-6">
          {published.map((project, i) => (
            <FadeIn key={project.slug} delay={0.08 * i}>
              <ProjectCard project={project} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
