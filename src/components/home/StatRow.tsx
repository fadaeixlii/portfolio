"use client";

import { useTranslations } from "next-intl";
import { Readout, type ReadoutFormat } from "@/components/primitives/Readout";
import { cn } from "@/lib/cn";
import { useBootStage } from "./BootSequence";

/**
 * Three stats, not the design's four. `10k+ daily sessions billed`,
 * `07+ years` and `06 industries` are all unsourced — see the
 * "What must NOT be implemented" table in MODERNIST-SPEC.
 * Every number here has a source: .scratch/claims.md.
 */
const STATS = (shipped: number): { value: number; format: ReadoutFormat; key: string }[] => [
  { value: 2019, format: "year", key: "since" },
  { value: shipped, format: "int", key: "products" },
  { value: 3, format: "int", key: "providers" },
];

/**
 * `shipped` is passed in rather than imported: this is a client component,
 * and importing the project list here to read `.length` would ship every
 * project's copy and stack to the browser for the sake of one integer. The
 * server page already has the list.
 */
export function StatRow({ shipped }: { shipped: number }) {
  const t = useTranslations("home.stats");
  const stage = useBootStage();
  const counting = stage >= 2;

  return (
    <div className="grid grid-cols-1 border-t-2 border-hairline sm:grid-cols-3">
      {STATS(shipped).map(({ value, format, key }, i) => (
        <div
          key={key}
          className={cn(
            "border-b-2 border-hairline px-[var(--space-4)] py-[var(--space-6)]",
            // Logical, so the rules land between the cells in Farsi too.
            i > 0 && "sm:border-s-2",
          )}
        >
          <Readout
            value={value}
            format={format}
            label={t(key)}
            count={counting}
          />
        </div>
      ))}
    </div>
  );
}
