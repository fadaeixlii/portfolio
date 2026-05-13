import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected projects and case studies. React, Next.js, TypeScript, and Node.js applications in production.",
  alternates: { canonical: "https://fadaeixlii.com/work" },
};

export default function WorkPage() {
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
          Work
        </h1>
        <p className="max-w-md text-lg text-muted-foreground">
          Case studies and projects are being prepared. Check back soon.
        </p>
      </div>
    </section>
  );
}
