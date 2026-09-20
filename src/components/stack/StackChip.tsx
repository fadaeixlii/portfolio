import type { StackMark } from "@/lib/stack-mark";
import { cn } from "@/lib/cn";

/**
 * One technology, as a bordered chip carrying its brand mark.
 *
 * Presentational only — it takes the resolved mark rather than looking one
 * up, so a client component can render it. Resolution needs `node:fs` (the
 * contrast solver reads the paper colours out of tokens.css) and the whole
 * simple-icons package, neither of which belongs in a browser bundle. See
 * `lib/stack-mark.ts`.
 *
 * Both theme-safe colours ship as custom properties and CSS picks per theme,
 * so toggling the theme needs no re-render.
 *
 * No proficiency bar and no percentage: a bar reading "React 92%" is an
 * invented metric.
 */
export function StackChip({
  name,
  mark,
  size = "md",
}: {
  name: string;
  mark?: StackMark;
  /** `sm` is for the work-grid cards, where six chips share a card. */
  size?: "sm" | "md";
}) {
  return (
    <span
      dir="auto"
      className={cn(
        "stack-chip inline-flex items-center border-2 border-hairline font-semibold uppercase tracking-wide text-text",
        size === "sm"
          ? "gap-[6px] px-[var(--space-2)] py-[2px] text-[length:11px]"
          : "gap-[var(--space-2)] px-[var(--space-3)] py-[var(--space-1)] text-[length:var(--text-xs)]",
      )}
      style={
        mark
          ? ({
              "--brand-dark": mark.dark,
              "--brand-light": mark.light,
            } as React.CSSProperties)
          : undefined
      }
    >
      {mark ? (
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
          className={cn(
            "stack-chip__mark shrink-0",
            size === "sm" ? "h-3 w-3" : "h-[14px] w-[14px]",
          )}
        >
          {mark.stroke ? (
            <path
              d={mark.path}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
          ) : (
            <path d={mark.path} fill="currentColor" />
          )}
        </svg>
      ) : null}
      {name}
    </span>
  );
}
