import { z } from "zod";

export const projectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  /** One line an eight-year-old could follow. Hard cap keeps the grid honest. */
  summary: z.string().max(140),
  domain: z.string(),
  year: z.number().int().min(2018).max(2030),
  role: z.string(),
  stack: z.array(z.string()).min(1).max(8),
  href: z.string().url().optional(),
  featured: z.boolean().default(false),
});

export const experienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  startYear: z.number().int(),
  period: z.string(),
  location: z.string(),
  /** Two sentences maximum. The timeline is scanned, not read. */
  summary: z.string().max(260),
  products: z.array(z.string()).default([]),
  stack: z.array(z.string()).min(1).max(10),
});

export const stackGroupSchema = z.object({
  name: z.string(),
  items: z.array(z.string()).min(1),
});

export const caseStudySchema = z.object({
  slug: z.string(),
  problem: z.string(),
  approach: z.array(z.string()).min(2).max(6),
  outcome: z.string(),
  /** Only numbers with a source. Empty is acceptable and often correct. */
  figures: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .max(3)
    .default([]),
});

export type Project = z.infer<typeof projectSchema>;
export type ExperienceEntry = z.infer<typeof experienceSchema>;
export type StackGroup = z.infer<typeof stackGroupSchema>;
export type CaseStudy = z.infer<typeof caseStudySchema>;
