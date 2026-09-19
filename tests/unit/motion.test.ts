import { describe, it, expect, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

// The distinguishing case for the SSR hydration fix is "reduced motion is
// on AND we are pre-hydration" — only there do the old and new
// implementations disagree. Mock the OS preference to "on" so the test can
// actually tell them apart; without this, useReducedMotion() already
// returns null server-side and both implementations read `true`.
vi.mock("motion/react", () => ({
  useReducedMotion: () => true,
}));

import { MOTION, EASE, useMotionSafe } from "@/lib/motion";

describe("motion config", () => {
  it("caps reveal distance so nothing animates layout", () => {
    expect(MOTION.reveal.distance).toBeLessThanOrEqual(24);
  });

  it("caps stagger children so long grids do not crawl", () => {
    expect(MOTION.stagger.max).toBeLessThanOrEqual(8);
  });

  it("exposes a single global switch for reveals", () => {
    expect(typeof MOTION.reveal.enabled).toBe("boolean");
  });

  it("uses cubic-bezier tuples, not named browser easings", () => {
    for (const value of Object.values(EASE)) {
      expect(value).toHaveLength(4);
      expect(value.every((n) => typeof n === "number")).toBe(true);
    }
  });
});

describe("useMotionSafe", () => {
  it("returns true during SSR even when the OS prefers reduced motion", () => {
    // useReducedMotion() is mocked to `true` above (the OS-level
    // preference). renderToStaticMarkup forces React's server-render path,
    // where useSyncExternalStore resolves against getServerSnapshot
    // (mounted = false). Old code (`!useReducedMotion()`) would read
    // `!true` = false here — a hydration mismatch once the client re-reads
    // the same preference after mount. New code short-circuits on
    // `!mounted` and must still read `true`.
    function Probe() {
      const safe = useMotionSafe();
      return createElement("span", null, String(safe));
    }
    const html = renderToStaticMarkup(createElement(Probe));
    expect(html).toContain("true");
  });
});
