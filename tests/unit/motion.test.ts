import { describe, it, expect } from "vitest";
import { MOTION, EASE } from "@/lib/motion";

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
