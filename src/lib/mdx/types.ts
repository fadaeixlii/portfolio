export interface CaseStudyFrontmatter {
  title: string;
  slug: string;
  tagline: string;
  role: string;
  year: number;
  status: "draft" | "published";
  tech: string[];
  featured: boolean;
  sort_order: number;
  hero_image: string;
}

export interface BlogPostFrontmatter {
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  tags: string[];
  status: "draft" | "published";
  reading_time: number;
}
