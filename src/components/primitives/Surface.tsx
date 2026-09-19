"use client";

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useBackdropSvgSupport } from "@/hooks/useBackdropSvgSupport";

export type SurfaceVariant = "glass" | "glass-refracted" | "flat";

type SurfaceOwnProps<T extends ElementType> = {
  children: ReactNode;
  variant?: SurfaceVariant;
  as?: T;
  className?: string;
};

/**
 * Polymorphic: `rest` is typed as the real prop set of whichever element
 * `as` resolves to (defaulting to `div`), so spreading it stays type-safe
 * under `strict` instead of widening to `Record<string, unknown>`.
 */
type SurfaceProps<T extends ElementType> = SurfaceOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof SurfaceOwnProps<T>>;

/**
 * The site's surface. `glass` is the default and runs in every current
 * browser: blur + saturate, a tint floor so text keeps a contrast floor
 * regardless of the backdrop, a gradient overlay, a 1px top highlight and a
 * soft shadow. `glass-refracted` adds SVG displacement where it truly renders.
 *
 * Never put paragraph copy on a glass surface — chrome, headings and
 * single-line labels only.
 */
export function Surface<T extends ElementType = "div">({
  children,
  variant = "glass",
  as,
  className,
  ...rest
}: SurfaceProps<T>) {
  const Component = (as ?? "div") as ElementType;
  const refractionWorks = useBackdropSvgSupport();
  const refracted = variant === "glass-refracted" && refractionWorks;
  const glassy = variant !== "flat";

  return (
    <Component
      data-surface={variant}
      className={cn(
        "relative isolate rounded-[var(--radius-lg)] border border-hairline",
        glassy && [
          "bg-[var(--glass-fill)]",
          "[backdrop-filter:blur(var(--glass-blur))_saturate(var(--glass-saturate))]",
          "[-webkit-backdrop-filter:blur(var(--glass-blur))_saturate(var(--glass-saturate))]",
          "shadow-[var(--glass-shadow)]",
          // Gradient overlay — the 'tinted and layered' tier. Pure paint.
          "before:pointer-events-none before:absolute before:inset-0 before:-z-10",
          "before:rounded-[inherit] before:bg-gradient-to-b",
          "before:from-[var(--glass-tint-top)] before:to-[var(--glass-tint-bottom)]",
          // 1px inner highlight along the top edge, where a real lens catches light.
          "after:pointer-events-none after:absolute after:inset-x-0 after:top-0",
          "after:h-px after:rounded-t-[inherit] after:bg-[var(--glass-highlight)]",
        ],
        !glassy && "bg-surface",
        refracted && "[backdrop-filter:url(#glass-refraction)_blur(var(--glass-blur))]",
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}
