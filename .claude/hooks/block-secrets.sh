#!/usr/bin/env bash
set -euo pipefail
content=$(jq -r '.tool_input.content // .tool_input.new_str // ""')
path=$(jq -r '.tool_input.file_path // .tool_input.path // ""')
# Allow .env.example and template files
if echo "$path" | grep -Eq '\.example$|template'; then exit 0; fi
patterns=(
  'sb_secret_[A-Za-z0-9_-]+'
  'SUPABASE_SERVICE_ROLE_KEY\s*=\s*[^"]*ey[A-Za-z0-9_-]+'
  'sk-[A-Za-z0-9]{32,}'
  'ghp_[A-Za-z0-9]{36}'
  '-----BEGIN.*PRIVATE KEY-----'
)
for pat in "${patterns[@]}"; do
  if echo "$content" | grep -Eq "$pat"; then
    echo "BLOCKED: write contains what looks like a secret matching '$pat'. Move to .env.local and reference via process.env." >&2
    exit 2
  fi
done
exit 0
