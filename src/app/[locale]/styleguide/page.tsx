import { use } from "react";
import { setRequestLocale } from "next-intl/server";
import { Reveal, Stagger, StaggerItem } from "@/components/primitives/Reveal";
import { Surface } from "@/components/primitives/Surface";
import { Readout } from "@/components/primitives/Readout";
import { Button } from "@/components/primitives/Button";
import { Field } from "@/components/primitives/Field";
import { cn } from "@/lib/cn";
import { TokenSwatch } from "./TokenSwatch";

const COLOR_TOKENS = [
  { name: "paper", varName: "--paper" },
  { name: "surface", varName: "--surface" },
  { name: "surface-raised", varName: "--surface-raised" },
  { name: "ink", varName: "--ink" },
  { name: "ink-dim", varName: "--ink-dim" },
  { name: "hairline", varName: "--hairline" },
  { name: "signal", varName: "--signal" },
  { name: "signal-ink", varName: "--signal-ink" },
  { name: "focus", varName: "--focus" },
  { name: "error", varName: "--error" },
  { name: "success", varName: "--success" },
] as const;

const TYPE_SCALE = [
  "--text-display",
  "--text-4xl",
  "--text-3xl",
  "--text-2xl",
  "--text-xl",
  "--text-lg",
  "--text-base",
  "--text-sm",
  "--text-xs",
] as const;

const MEASURE_PARAGRAPH =
  "Measure keeps a line at a readable width no matter the viewport, so body copy never stretches into a scan-defeating span. This paragraph exists only to prove the sixty-eight character clamp holds at this weight and size.";

type Variant = "signal" | "outline" | "ghost";
type Size = "sm" | "md";

const VARIANTS: readonly Variant[] = ["signal", "outline", "ghost"];
const SIZES: readonly Size[] = ["sm", "md"];

type ButtonStateDemo = {
  key: string;
  force?: string;
  disabled?: boolean;
  loading?: boolean;
  state?: "idle" | "error" | "success";
};

const BUTTON_STATES: ButtonStateDemo[] = [
  { key: "idle" },
  { key: "hover", force: "is-hover" },
  { key: "focus", force: "is-focus" },
  { key: "active", force: "is-active" },
  { key: "disabled", disabled: true },
  { key: "loading", loading: true },
  { key: "error", state: "error" },
  { key: "success", state: "success" },
];

const READOUTS: Array<{
  format: "int" | "year" | "seconds" | "plus";
  value: number;
  label: string;
}> = [
  { format: "int", value: 9, label: "int" },
  { format: "year", value: 2019, label: "year" },
  { format: "seconds", value: 2.9, label: "seconds" },
  { format: "plus", value: 5000, label: "plus" },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-[length:var(--text-2xl)] leading-[var(--leading-tight)]">
      {children}
    </h2>
  );
}

export default function StyleguidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);

  // Must run before any next-intl hook, or the route falls back to dynamic.
  setRequestLocale(locale);

  return (
    <main id="main" className="mx-auto flex max-w-5xl flex-col gap-[var(--space-24)] p-8">
      <h1 className="mt-[var(--space-16)] font-display text-[length:var(--text-4xl)] leading-[var(--leading-tight)]">
        Styleguide
      </h1>

      {/* 1. Colour */}
      <Reveal as="section" className="flex flex-col gap-[var(--space-6)]">
        <SectionHeading>Colour</SectionHeading>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {COLOR_TOKENS.map((token) => (
            <TokenSwatch key={token.varName} name={token.name} varName={token.varName} />
          ))}
        </div>
      </Reveal>

      {/* 2. Type */}
      <Reveal as="section" className="flex flex-col gap-[var(--space-6)]">
        <SectionHeading>Type</SectionHeading>
        <div className="flex flex-col gap-6">
          {TYPE_SCALE.map((token) => (
            <div key={token} className="flex items-baseline gap-4">
              <span className="w-32 shrink-0 font-mono text-[length:var(--text-xs)] text-dim">
                {token}
              </span>
              <span className="font-display" style={{ fontSize: `var(${token})` }}>
                Aa Bb Cc
              </span>
            </div>
          ))}
        </div>
        <p className="text-dim" style={{ maxWidth: "var(--measure)" }}>
          {MEASURE_PARAGRAPH}
        </p>
      </Reveal>

      {/* 3. Surfaces */}
      <Reveal as="section" className="flex flex-col gap-[var(--space-6)]">
        <SectionHeading>Surfaces</SectionHeading>
        <div
          className="rounded-[var(--radius-lg)] p-[var(--space-8)]"
          style={{
            backgroundImage:
              "linear-gradient(135deg, var(--signal), var(--surface) 40%, var(--paper) 70%, var(--hairline))",
          }}
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <Surface variant="glass" className="p-[var(--space-6)]">
              <span className="font-display text-[length:var(--text-lg)]">Glass</span>
            </Surface>
            <Surface variant="glass-refracted" className="p-[var(--space-6)]">
              <span className="font-display text-[length:var(--text-lg)]">
                Glass refracted
              </span>
            </Surface>
            <Surface variant="flat" className="p-[var(--space-6)]">
              <span className="font-display text-[length:var(--text-lg)]">Flat</span>
            </Surface>
          </div>
        </div>
      </Reveal>

      {/* 4. Buttons — all three variants × both sizes × all eight states. */}
      <Reveal as="section" className="flex flex-col gap-[var(--space-6)]">
        <SectionHeading>Buttons</SectionHeading>
        <div className="flex flex-col gap-4">
          {VARIANTS.flatMap((variant) =>
            SIZES.map((size) => (
              <div key={`${variant}-${size}`} className="flex flex-wrap items-center gap-3">
                <span className="w-24 shrink-0 font-mono text-[length:var(--text-xs)] text-dim">
                  {variant} · {size}
                </span>
                {BUTTON_STATES.map((s) => (
                  <Button
                    key={s.key}
                    variant={variant}
                    size={size}
                    disabled={s.disabled}
                    loading={s.loading}
                    state={s.state}
                    className={cn("btn", `btn-${variant}`, s.force)}
                  >
                    {s.key}
                  </Button>
                ))}
              </div>
            )),
          )}
        </div>
      </Reveal>

      {/* 5. Fields */}
      <Reveal as="section" className="flex flex-col gap-[var(--space-6)]">
        <SectionHeading>Fields</SectionHeading>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field label="Default" name="default" placeholder="Value" />
          <Field label="With hint" name="hint" hint="We never share this." />
          <Field label="With error" name="error" error="This field is required." />
          <Field label="Disabled" name="disabled" disabled defaultValue="Locked" />
        </div>
      </Reveal>

      {/* 6. Readouts */}
      <Reveal as="section" className="flex flex-col gap-[var(--space-6)]">
        <SectionHeading>Readouts</SectionHeading>
        <div className="flex flex-col gap-8">
          <div>
            <span className="font-mono text-[length:var(--text-xs)] text-dim">count=off</span>
            <div className="mt-3 grid grid-cols-2 gap-8 sm:grid-cols-4">
              {READOUTS.map((r) => (
                <Readout key={r.format} value={r.value} format={r.format} label={r.label} />
              ))}
            </div>
          </div>
          <div>
            <span className="font-mono text-[length:var(--text-xs)] text-dim">count=on</span>
            <div className="mt-3 grid grid-cols-2 gap-8 sm:grid-cols-4">
              {READOUTS.map((r) => (
                <Readout
                  key={r.format}
                  value={r.value}
                  format={r.format}
                  label={r.label}
                  count
                />
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* 7. Motion */}
      <Reveal as="section" className="flex flex-col gap-[var(--space-6)]">
        <SectionHeading>Motion</SectionHeading>
        <Stagger className="grid grid-cols-3 gap-4 sm:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <StaggerItem
              key={i}
              className="flex h-16 items-center justify-center rounded-[var(--radius-md)] border border-hairline font-mono text-[length:var(--text-xs)] text-dim"
            >
              {i + 1}
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal className="rounded-[var(--radius-md)] border border-hairline p-[var(--space-6)]">
          <span className="text-dim">
            Standalone reveal — a single element crossfading and sliding into view.
          </span>
        </Reveal>
        <p className="text-[length:var(--text-sm)] text-dim">
          With prefers-reduced-motion: reduce, nothing above translates — every tile
          and the panel fade in place instead, and the Readouts above show their
          final value immediately instead of counting up.
        </p>
      </Reveal>
    </main>
  );
}
