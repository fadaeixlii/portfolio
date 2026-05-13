---
description: Stage and commit work with a Conventional Commits message derived from the diff.
---

Run `git status` and `git diff --cached` (and `git diff` if nothing staged).

If nothing is staged: stage all tracked modified files (skip new files unless
explicitly requested).

Write a Conventional Commits message:
- type: feat | fix | refactor | perf | docs | chore | test | style
- scope: the area (hero, work, blog, admin, db, motion, seo, etc.)
- subject: imperative, ≤72 chars, lowercase
- body: bullet list of substantive changes (≤5 bullets), one blank line between subject and body
- footer: `Co-authored-by: Claude <noreply@anthropic.com>` if AI authored substantive logic

Show the message, ask for approval, then commit.
