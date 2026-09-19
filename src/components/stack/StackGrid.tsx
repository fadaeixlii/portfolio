import type { StackGroup } from "@/content/schema";
import { Surface } from "@/components/primitives/Surface";
import { Stagger, StaggerItem } from "@/components/primitives/Reveal";

/**
 * Group name plus a bare wrapped word list. No icons, no proficiency bars,
 * no percentage ratings — a bar claiming "React 92%" is an invented metric.
 */
export function StackGrid({ groups }: { groups: StackGroup[] }) {
  return (
    <Stagger className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 md:grid-cols-3">
      {groups.map((group) => (
        <StaggerItem key={group.name}>
          <Surface
            variant="flat"
            className="flex h-full flex-col gap-[var(--space-3)] p-[var(--space-6)]"
          >
            <h2 dir="auto" className="font-display text-[length:var(--text-lg)] text-text">
              {group.name}
            </h2>
            <div dir="auto" className="flex flex-wrap gap-[var(--space-3)] text-[length:var(--text-sm)] text-dim">
              {group.items.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </Surface>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
