---
description: Self-review an open PR using all reviewer subagents in parallel.
---

PR: $ARGUMENTS (number or URL; default to current branch's open PR)

1. `gh pr view --json title,body,files`
2. `gh pr diff`
3. Invoke in parallel:
   - @agent-design-reviewer
   - @agent-performance-auditor
   - @agent-accessibility-checker
   - @agent-seo-strategist (if public-route changes)
4. Aggregate findings into Critical / Warning / Suggestion buckets with file:line.
5. Recommend: merge, request-changes, or fix-and-recheck.
