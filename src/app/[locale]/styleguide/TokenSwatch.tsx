"use client";

import { useComputedToken } from "@/hooks/useComputedToken";

/** One Layer 2 token: swatch, name and its live-resolved value. */
export function TokenSwatch({ name, varName }: { name: string; varName: string }) {
  const value = useComputedToken(varName);

  return (
    <div className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-hairline p-[var(--space-3)]">
      <div
        className="h-16 rounded-[var(--radius-sm)] border border-hairline"
        style={{ backgroundColor: `var(${varName})` }}
      />
      <span className="font-mono text-[length:var(--text-xs)] text-text">{name}</span>
      <span className="font-mono text-[length:var(--text-xs)] text-dim">
        {value || "…"}
      </span>
    </div>
  );
}
