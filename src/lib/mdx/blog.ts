import fs from "node:fs";
import path from "node:path";
import { compileMDX } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx/mdx-components";
import type { BlogPostFrontmatter } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "src/content/blog");

export function getAllBlogSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export async function getBlogPost(slug: string) {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const source = fs.readFileSync(filePath, "utf-8");

  const { content, frontmatter } = await compileMDX<BlogPostFrontmatter>({
    source,
    options: { parseFrontmatter: true },
    components: mdxComponents,
  });

  if (frontmatter.status === "draft") return null;

  return { content, frontmatter };
}

export async function getAllBlogPosts(): Promise<BlogPostFrontmatter[]> {
  const slugs = getAllBlogSlugs();
  const posts: BlogPostFrontmatter[] = [];

  for (const slug of slugs) {
    const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
    const source = fs.readFileSync(filePath, "utf-8");

    const match = source.match(/^---\n([\s\S]*?)\n---/);
    if (!match) continue;

    const lines = match[1].split("\n");
    const fm: Record<string, unknown> = {};
    for (const line of lines) {
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) continue;
      const key = line.slice(0, colonIdx).trim();
      let val: unknown = line.slice(colonIdx + 1).trim();
      if (typeof val === "string" && val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      if (typeof val === "string" && val.startsWith("[")) {
        try {
          val = JSON.parse(val);
        } catch {
          // keep as string
        }
      }
      if (val === "true") val = true;
      else if (val === "false") val = false;
      else if (typeof val === "string" && /^\d+$/.test(val)) val = Number(val);
      fm[key] = val;
    }

    if (fm.status === "draft") continue;
    posts.push(fm as unknown as BlogPostFrontmatter);
  }

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getAdjacentBlogPosts(slug: string) {
  const all = await getAllBlogPosts();
  const idx = all.findIndex((p) => p.slug === slug);

  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}
