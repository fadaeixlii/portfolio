#!/usr/bin/env bash
set -euo pipefail
# Only typecheck if there are recently modified .ts/.tsx files
if find src -name '*.ts' -o -name '*.tsx' -newer .claude/.last-typecheck -print 2>/dev/null | grep -q .; then
  if ! pnpm exec tsc --noEmit 2>&1 | head -50; then
    echo "Typecheck failed. Fix before declaring done." >&2
  fi
  touch .claude/.last-typecheck
fi
exit 0
