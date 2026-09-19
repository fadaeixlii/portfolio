import { describe, it, expect } from "vitest";
import { getProjects, getExperience, getStack } from "@/content";

const BANNED = [
  "10,000", "10k+", "sub-second", "100% deployment", "five critical",
  "40%", "14 to 5", "10-15%", "+44", "Greece & Iran", "Athens & Mashhad",
  "seven years", "7+ years", "co-founder",
];

describe("content", () => {
  it("loads projects with required fields", () => {
    const projects = getProjects();
    expect(projects.length).toBeGreaterThan(0);
    for (const p of projects) {
      expect(p.slug).toMatch(/^[a-z0-9-]+$/);
      expect(p.summary.length).toBeLessThanOrEqual(140);
    }
  });

  it("carries no banned claim anywhere in the content tree", () => {
    const blob = JSON.stringify([getProjects(), getExperience(), getStack()]);
    for (const phrase of BANNED) {
      expect(blob.toLowerCase()).not.toContain(phrase.toLowerCase());
    }
  });

  it("orders experience newest first", () => {
    const years = getExperience().map((e) => e.startYear);
    expect([...years].sort((a, b) => b - a)).toEqual(years);
  });
});
