import { cn } from "@/lib/cn";

/**
 * A measured rule. Structural, not decorative — it separates instrument
 * modules, so it is 1px and never a gradient.
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
        orientation === "horizontal" ? "h-px w-full" : "w-px self-stretch",
        className,
      )}
    />
  );
}
