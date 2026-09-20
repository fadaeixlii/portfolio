import { brandIcon } from "@/lib/brand-icons";
import { readableBrand } from "@/lib/brand-contrast";
import { cn } from "@/lib/cn";

/**
 * One technology, as a bordered chip carrying its brand mark.
 *
 * The brand hex is never painted raw — see `lib/brand-contrast.ts` for why
 * #000000 and #06B6D4 both need solving. Both theme-safe values are emitted
 * as custom properties and CSS picks per theme, so the mark stays correct
 * when the theme is toggled without a re-render.
 *
 * No proficiency bar and no percentage: a bar reading "React 92%" is an
 * invented metric.
 */
export function StackChip({
  name,
  size = "md",
}: {
  name: string;
  /** `sm` is for the work-grid cards, where six chips share a card. */
  size?: "sm" | "md";
}) {
  const icon = brandIcon(name);
  const brand = icon ? readableBrand(icon.hex) : null;

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
        brand
          ? ({
              "--brand-dark": brand.dark,
              "--brand-light": brand.light,
            } as React.CSSProperties)
          : undefined
      }
    >
      {icon ? (
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
          className={cn(
            "stack-chip__mark shrink-0",
            size === "sm" ? "h-3 w-3" : "h-[14px] w-[14px]",
          )}
        >
          <path d={icon.path} fill="currentColor" />
        </svg>
      ) : null}
      {name}
    </span>
  );
}
