---
name: content-inbox-processor
description: Use this skill to process raw content from _content-inbox/ — resume PDFs, project notes, screenshots, testimonials — into structured site content.
allowed-tools: Read, Write, Edit, Bash, Glob
---

# Content Inbox Processor

`_content-inbox/` is the staging area for raw content. It's gitignored.
Convert raw inputs into structured outputs ready for Supabase or MDX.

## Expected inbox layout
```
_content-inbox/
  resume.pdf
  projects/
    aim2balance/
      notes.md
      *.png
      links.txt
    roofcast/
    jeofferte/
  testimonials/
    client-name.md
  photo.jpg
```

## Processing pipeline

1. **Resume → about page draft.** Read resume.pdf, extract roles + skills + dates.
   Output to `_docs/resume-extract.md`. Source for about page, not published verbatim.

2. **Project notes → case study draft.** For each `projects/*/notes.md`,
   invoke @agent-case-study-builder with the notes + image list as input.
   Place draft MDX in `_drafts/case-studies/<slug>.mdx`.

3. **Screenshots → optimized gallery.** Produce AVIF + blur placeholders.
   Then upload to Supabase Storage `project-images` bucket.

4. **Testimonials → testimonials table.** Parse frontmatter (name, role, company, linkedin),
   validate, insert via script.

5. **Headshot → about stylization.** Output an AI portrait prompt,
   save to `_docs/portrait-prompt.md`. User runs generation manually.

## Output convention
- Drafts go in `_drafts/` (gitignored except for `.gitkeep`)
- Final content goes in Supabase or `src/content/`
- Never write to `_content-inbox/` (read-only source)
