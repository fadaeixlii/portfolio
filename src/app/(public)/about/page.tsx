import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Six years shipping React applications to production. Teams led, memory leaks debugged, codebases refactored.",
  alternates: { canonical: "https://fadaeixlii.com/about" },
};

export default function AboutPage() {
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
          About
        </h1>
        <p className="max-w-md text-lg text-muted-foreground">
          The full story is being written. In the meantime, check out my work.
        </p>
      </div>
    </section>
  );
}
