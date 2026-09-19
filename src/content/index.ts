import {
  projectSchema, experienceSchema, stackGroupSchema, caseStudySchema,
  type Project, type ExperienceEntry, type StackGroup, type CaseStudy,
} from "./schema";
import { projects } from "./projects";
import { experience } from "./experience";
import { stack } from "./stack";
import { caseStudies } from "./case-studies";

/** Parse once at module load so bad content fails the build, not a request. */
const PROJECTS: Project[] = projectSchema.array().parse(projects);
const EXPERIENCE: ExperienceEntry[] = experienceSchema.array().parse(experience);
const STACK: StackGroup[] = stackGroupSchema.array().parse(stack);
const CASE_STUDIES: CaseStudy[] = caseStudySchema.array().parse(caseStudies);

export function getProjects(): Project[] {
  return [...PROJECTS].sort((a, b) => b.year - a.year);
}

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return getProjects().filter((p) => p.featured);
}

export function getExperience(): ExperienceEntry[] {
  return [...EXPERIENCE].sort((a, b) => b.startYear - a.startYear);
}

export function getStack(): StackGroup[] {
  return STACK;
}

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((c) => c.slug === slug);
}
