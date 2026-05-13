#!/usr/bin/env bash
set -euo pipefail
cmd=$(jq -r '.tool_input.command // ""')
if echo "$cmd" | grep -Eq '\b(npm|yarn)\s+(install|i|add|run|test|build|exec)\b'; then
  echo "BLOCKED: This project uses pnpm. Replace 'npm' or 'yarn' with 'pnpm' (e.g. 'pnpm install', 'pnpm dlx', 'pnpm run dev')." >&2
  exit 2
fi
exit 0
