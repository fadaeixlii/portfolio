import { cn } from "@/lib/cn";

/**
 * A measured rule. Structural, not decorative — it separates instrument
 * modules, so it is a strong 2px rule and never a gradient.
 */
export function Hairline({
  orientation = "horizontal",
  className,
}: {
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "bg-hairline",
        orientation === "horizontal" ? "h-0.5 w-full" : "w-0.5 self-stretch",
        className,
      )}
    />
  );
}
