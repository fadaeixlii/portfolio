#!/usr/bin/env bash
set -euo pipefail
cmd=$(jq -r '.tool_input.command // ""')
patterns=(
  'rm\s+-rf\s+/'
  'rm\s+-rf\s+~'
  'git\s+push\s+(-f|--force)'
  'git\s+reset\s+--hard\s+origin'
  'supabase\s+db\s+reset\s+--linked'
  ':\(\)\{\s*:\|:&\s*\};:'
  '>\s*/dev/sd'
  'dd\s+if=.*of=/dev/'
)
for pat in "${patterns[@]}"; do
  if echo "$cmd" | grep -Eiq "$pat"; then
    echo "BLOCKED: command matches dangerous pattern '$pat'. Use a safer alternative or explain intent." >&2
    exit 2
  fi
done
exit 0
