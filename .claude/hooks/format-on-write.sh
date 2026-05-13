#!/usr/bin/env bash
set -euo pipefail
path=$(jq -r '.tool_input.file_path // .tool_input.path // ""')
[ -z "$path" ] && exit 0
case "$path" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.md|*.mdx|*.css)
    pnpm exec prettier --write "$path" 2>/dev/null || true
    ;;
esac
exit 0
