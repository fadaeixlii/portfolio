import siteData from "@/content/site.json";
import projectsData from "@/content/projects.json";
import skillsData from "@/content/skills.json";
import experienceData from "@/content/experience.json";

export type SiteContent = typeof siteData;
export type Project = (typeof projectsData)[number];
export type SkillsContent = typeof skillsData;
export type Experience = (typeof experienceData)[number];

export const site = siteData;
export const projects = projectsData;
export const skills = skillsData;
export const experience = experienceData;

export function getFeaturedProjects() {
  return projects.filter((p) => p.featured);
}

export function getProjectBySlug(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export {
  getCaseStudy,
  getAllCaseStudySlugs,
  getAllCaseStudies,
  getAdjacentCaseStudies,
} from "./mdx/case-studies";

export {
  getBlogPost,
  getAllBlogSlugs,
  getAllBlogPosts,
  getAdjacentBlogPosts,
} from "./mdx/blog";

export type { CaseStudyFrontmatter, BlogPostFrontmatter } from "./mdx/types";
