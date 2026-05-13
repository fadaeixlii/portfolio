---
description: Execute a scoped ticket using verification-then-execution. Assumes /ticket has been run and approved.
---

Implement: $ARGUMENTS

Sequence (do NOT skip steps):

1. **Verification phase**: read the affected files. Confirm the scope matches
   the ticket. Identify any new risks not covered. Pause and report findings.

2. **Implementation phase** (after user "go"): make the changes. Follow
   CLAUDE.md conventions. Use semantic tokens. Honor motion budget.

3. **Review phase**: in parallel invoke @agent-design-reviewer,
   @agent-performance-auditor, @agent-accessibility-checker. For DB changes,
   also @agent-supabase-architect. For motion, also @agent-animation-architect.

4. **Fix phase**: apply all critical findings. Re-run reviewers if substantive.

5. **Report**: summarize what changed, what passed, what's deferred, with file:line refs.
