import { describe, it, expect } from "vitest";
import { formatReadout } from "@/components/primitives/Readout";

describe("formatReadout", () => {
  it("renders Latin digits for en", () => {
    expect(formatReadout(2019, "int", "en")).toBe("2,019");
  });

  it("renders Persian digits for fa", () => {
    expect(formatReadout(9, "int", "fa")).toBe("۹");
  });

  it("formats seconds with one decimal", () => {
    expect(formatReadout(4.2, "seconds", "en")).toBe("4.2s");
  });

  it("leaves years unseparated", () => {
    expect(formatReadout(2019, "year", "en")).toBe("2019");
  });
});
