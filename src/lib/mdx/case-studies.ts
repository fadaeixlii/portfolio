import fs from "node:fs";
import path from "node:path";
import { compileMDX } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx/mdx-components";
import type { CaseStudyFrontmatter } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "src/content/case-studies");

export function getAllCaseStudySlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export async function getCaseStudy(slug: string) {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const source = fs.readFileSync(filePath, "utf-8");

  const { content, frontmatter } = await compileMDX<CaseStudyFrontmatter>({
    source,
    options: { parseFrontmatter: true },
    components: mdxComponents,
  });

  if (frontmatter.status === "draft") return null;

  return { content, frontmatter };
}

export async function getAllCaseStudies(): Promise<CaseStudyFrontmatter[]> {
  const slugs = getAllCaseStudySlugs();
  const studies: CaseStudyFrontmatter[] = [];

  for (const slug of slugs) {
    const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
    const source = fs.readFileSync(filePath, "utf-8");

    // Extract frontmatter without full compilation
    const match = source.match(/^---\n([\s\S]*?)\n---/);
    if (!match) continue;

    const lines = match[1].split("\n");
    const fm: Record<string, unknown> = {};
    for (const line of lines) {
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) continue;
      const key = line.slice(0, colonIdx).trim();
      let val: unknown = line.slice(colonIdx + 1).trim();
      // Remove quotes
      if (typeof val === "string" && val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      // Parse arrays
      if (typeof val === "string" && val.startsWith("[")) {
        try {
          val = JSON.parse(val);
        } catch {
          // keep as string
        }
      }
      // Parse booleans and numbers
      if (val === "true") val = true;
      else if (val === "false") val = false;
      else if (typeof val === "string" && /^\d+$/.test(val)) val = Number(val);
      fm[key] = val;
    }

    if (fm.status === "draft") continue;
    studies.push(fm as unknown as CaseStudyFrontmatter);
  }

  return studies.sort(
    (a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99)
  );
}

export async function getAdjacentCaseStudies(slug: string) {
  const all = await getAllCaseStudies();
  const idx = all.findIndex((s) => s.slug === slug);

  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}
