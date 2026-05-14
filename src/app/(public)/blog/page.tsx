import type { Metadata } from "next";
import { FadeIn } from "@/components/shared/FadeIn";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Articles on React, TypeScript, web architecture, and lessons from six years of full-stack development.",
  alternates: { canonical: "https://fadaeixlii.com/blog" },
};

export default function BlogPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-16">
      <FadeIn>
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <h1 className="font-serif text-4xl font-normal tracking-tight">
              Blog
            </h1>
            <p className="text-lg text-muted-foreground">
              Articles on React, TypeScript, and web architecture.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="h-2 w-2 rounded-full bg-accent" />
            <p className="text-muted-foreground">
              First articles are in the works. Check back soon.
            </p>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
