import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mohammad Fadaei — Full-Stack Developer",
  description:
    "Senior full-stack developer building web applications with React, Next.js, and TypeScript. Based in the Netherlands.",
};

export default function HomePage() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-8">
      <div className="flex flex-col items-center gap-8 text-center">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-accent" />
          <span className="text-sm tracking-widest text-muted-foreground uppercase">
            Coming Soon
          </span>
        </div>

        <h1 className="font-serif text-display font-normal text-foreground">
          fadaeixlii
        </h1>

        <p className="max-w-md text-lg text-muted-foreground">
          Full-stack developer. React, Next.js, TypeScript.
          <br />
          Building things that work.
        </p>
      </div>
    </section>
  );
}
