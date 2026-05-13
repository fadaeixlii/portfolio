import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Playground",
  description:
    "Interactive experiments, animation demos, and creative coding explorations.",
  alternates: { canonical: "https://fadaeixlii.com/playground" },
};

export default function PlaygroundPage() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-accent" />
          <span className="text-xs tracking-widest text-muted-foreground uppercase">
            Under Construction
          </span>
        </div>
        <h1 className="font-serif text-4xl font-normal tracking-tight">
          Playground
        </h1>
        <p className="max-w-md text-lg text-muted-foreground">
          Experiments and interactive demos. Under construction.
        </p>
      </div>
    </section>
  );
}
