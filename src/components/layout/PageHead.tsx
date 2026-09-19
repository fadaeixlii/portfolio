import { Reveal } from "@/components/primitives/Reveal";

/**
 * The page headline: the design's signature two-tone display pair, solid
 * line over outlined line (`.headline-outline` in globals.css), then one
 * line of subhead. Four routes were carrying the same twelve lines of
 * markup with their own drift.
 */
export function PageHead({
  line1,
  line2,
  sub,
}: {
  line1: string;
  line2: string;
  sub: string;
}) {
  return (
    <Reveal as="header">
      <h1
        dir="auto"
        className="font-display text-[length:var(--text-4xl)] font-extrabold uppercase leading-[var(--leading-display)] tracking-[var(--tracking-display)]"
      >
        <span className="block text-text">{line1}</span>
        <span className="headline-outline block">{line2}</span>
      </h1>
      <p
        dir="auto"
        className="mt-[var(--space-6)] max-w-[var(--measure)] text-[length:var(--text-lg)] text-dim"
      >
        {sub}
      </p>
    </Reveal>
  );
}
