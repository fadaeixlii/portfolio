---
description: Open a PR with a structured description derived from the branch's commits.
---

1. Verify we're not on main. If we are, refuse.
2. `git log main..HEAD --oneline` for context.
3. Write a PR description:
   ## Summary
   2–3 sentences on what changed and why.
   ## Changes
   Bullet list grouped by area.
   ## Acceptance criteria
   Copy from the ticket if available.
   ## Verification
   Which subagents passed, which manual checks done.
   ## Screenshots / preview
   If visual changes, link to preview URL or attach screenshots.
   ## Out of scope / followups
   Anything intentionally deferred, with TODO comments referenced.
4. `gh pr create --title "<type(scope): subject>" --body "<above>"`
5. Output the PR URL.
