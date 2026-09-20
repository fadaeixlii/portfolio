import type { StackGroup } from "@/content/schema";
import { Stagger, StaggerItem } from "@/components/primitives/Reveal";
import { StackChip } from "./StackChip";

/**
 * One full-width row per group: label on the inline start, chips wrapping
 * across the rest.
 *
 * This replaced a three-column card grid. At the shell's content width each
 * column was ~260px, which is narrower than two chips, so every group became
 * a near-vertical stack and the columns ended up wildly different heights —
 * "Frontend" finished half a screen above "Backend" with dead space under
 * it. Rows let the chips use the full measure and put the group labels on a
 * single scannable edge.
 *
 * `h3`, not `h2`: the page supplies the `h2` these sit under.
 */
export function StackGrid({ groups }: { groups: StackGroup[] }) {
  return (
    <Stagger className="border-t-2 border-hairline">
      {groups.map((group) => (
        <StaggerItem key={group.name}>
          <div className="grid gap-[var(--space-3)] border-b-2 border-hairline py-[var(--space-6)] md:grid-cols-[160px_1fr] md:gap-[var(--space-6)]">
            <h3
              dir="auto"
              className="font-display text-[length:var(--text-sm)] font-semibold uppercase tracking-wide text-dim md:pt-[2px]"
            >
              {group.name}
            </h3>
            <div className="flex flex-wrap gap-[var(--space-2)]">
              {group.items.map((item) => (
                <StackChip key={item} name={item} />
              ))}
            </div>
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
