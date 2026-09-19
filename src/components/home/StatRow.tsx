"use client";

import { useTranslations } from "next-intl";
import { Readout } from "@/components/primitives/Readout";
import { useBootStage } from "./BootSequence";

export function StatRow() {
  const t = useTranslations("home.stats");
  const stage = useBootStage();
  const counting = stage >= 2;

  return (
    <div className="grid grid-cols-3 gap-[var(--space-6)]">
      {/* Every number here has a source. See .scratch/claims.md. */}
      <Readout value={2019} format="year" label={t("since")} count={counting} />
      <Readout value={9} format="int" label={t("products")} count={counting} />
      <Readout value={3} format="int" label={t("providers")} count={counting} />
    </div>
  );
}
