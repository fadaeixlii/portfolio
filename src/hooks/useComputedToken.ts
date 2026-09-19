"use client";

import { useSyncExternalStore } from "react";

/**
 * Resolved value of a CSS custom property on `:root`, right now. Used by the
 * styleguide to print what a token actually computes to — the only way a
 * broken alias (e.g. a circular `var()`) shows up instead of failing silent.
 *
 * `useSyncExternalStore` rather than `useEffect` + `useState`: this is a
 * one-shot-then-reactive read of an external DOM value, the same shape as
 * `useBackdropSvgSupport`, not a derived-state effect body the repo's
 * `react-hooks/set-state-in-effect` rule would flag. The subscription is a
 * `MutationObserver` on `data-theme`, the only thing that changes a token's
 * resolved value after mount.
 */
export function useComputedToken(token: string): string {
  return useSyncExternalStore(
    (onChange) => {
      const observer = new MutationObserver(onChange);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
      return () => observer.disconnect();
    },
    () => getComputedStyle(document.documentElement).getPropertyValue(token).trim(),
    () => "",
  );
}
