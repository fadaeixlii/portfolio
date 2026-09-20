import { StackChip } from "./StackChip";
import type { StackMark } from "@/lib/stack-mark";
import { Stagger, StaggerItem } from "@/components/primitives/Reveal";

type MarkedGroup = { name: string; items: { name: string; mark: StackMark }[] };

/**
 * One full-width row per group: label on the inline start, chips wrapping
 * across the rest.
 *
 * This replaced a tab strip, which hid five of six groups behind a click —
 * a stack page whose whole job is to show the range should not make someone
 * hunt for it. Rows show everything at once and still scan, because the
 * labels sit on one edge.
 *
 * `h3`, not `h2`: the page supplies the `h2` these sit under.
 */
export function StackRows({ groups }: { groups: MarkedGroup[] }) {
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
                <StackChip key={item.name} name={item.name} mark={item.mark} />
              ))}
            </div>
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
