import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Articles on React, TypeScript, web architecture, and lessons from six years of full-stack development.",
  alternates: { canonical: "https://fadaeixlii.com/blog" },
};

export default function BlogPage() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-accent" />
          <span className="text-xs tracking-widest text-muted-foreground uppercase">
            Coming Soon
          </span>
        </div>
        <h1 className="font-serif text-4xl font-normal tracking-tight">
          Blog
        </h1>
        <p className="max-w-md text-lg text-muted-foreground">
          Articles on React, TypeScript, and web architecture. Coming soon.
        </p>
      </div>
    </section>
  );
}
