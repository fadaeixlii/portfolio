"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";

const ZONES: readonly string[] =
  typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("timeZone")
    : [Intl.DateTimeFormat().resolvedOptions().timeZone];

export function TimezonePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (zone: string) => void;
}) {
  const t = useTranslations("schedule.timezone");
  const [editing, setEditing] = useState(false);
  const id = useId();

  if (!editing) {
    return (
      <p className="text-[length:var(--text-sm)] text-dim">
        {t("shown", { zone: value })}{" "}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-signal-text underline-offset-4 hover:underline"
        >
          {t("change")}
        </button>
      </p>
    );
  }

  return (
    <label
      htmlFor={id}
      className="flex flex-wrap items-center gap-[var(--space-2)] text-[length:var(--text-sm)] text-dim"
    >
      {t("label")}
      <select
        id={id}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setEditing(false);
        }}
        onBlur={() => setEditing(false)}
        autoFocus
        className="rounded-[var(--radius-sm)] border border-hairline bg-transparent px-[var(--space-2)] py-1 text-text"
      >
        {ZONES.map((zone) => (
          <option key={zone} value={zone}>
            {zone}
          </option>
        ))}
      </select>
    </label>
  );
}
