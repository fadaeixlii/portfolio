"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "signal" | "outline" | "ghost";
type Size = "sm" | "md";

const VARIANT: Record<Variant, string> = {
  signal:
    "bg-signal text-signal-ink hover:brightness-110 active:brightness-95",
  outline:
    "border border-hairline text-text hover:border-signal hover:text-signal-text",
  ghost: "text-dim hover:text-text",
};

const SIZE: Record<Size, string> = {
  sm: "h-9 px-4 text-[length:var(--text-sm)]",
  md: "h-11 px-6 text-[length:var(--text-base)]",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    size?: Size;
    loading?: boolean;
    state?: "idle" | "error" | "success";
  }
>(function Button(
  {
    variant = "signal",
    size = "md",
    loading = false,
    state = "idle",
    disabled,
    className,
    children,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      // A loading button must not be clickable twice.
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-state={state}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius-full)]",
        // No two-line clickable text — a wrapped button is a mobile failure.
        "whitespace-nowrap font-medium",
        "transition-[transform,filter,color,border-color] duration-[var(--dur-fast)] ease-[var(--ease-out)]",
        "active:translate-y-px",
        "disabled:pointer-events-none disabled:opacity-45",
        "data-[state=error]:bg-error data-[state=error]:text-paper",
        "data-[state=success]:bg-success data-[state=success]:text-paper",
        VARIANT[variant],
        SIZE[size],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
});
