import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
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
  it("reports safe on the server snapshot, so SSR and first-paint markup agree", () => {
    // renderToStaticMarkup runs React's server render path, which resolves
    // useSyncExternalStore against getServerSnapshot (mounted = false) rather
    // than getSnapshot — exactly the path that must read `true` regardless of
    // the visitor's real reduced-motion preference, so hydration never
    // disagrees with the server-rendered `initial`/`transition` props.
    function Probe() {
      const safe = useMotionSafe();
      return createElement("span", null, String(safe));
    }
    const html = renderToStaticMarkup(createElement(Probe));
    expect(html).toContain("true");
  });
});
