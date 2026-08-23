#!/usr/bin/env bash
# Sobe API e frontend juntos num terminal só, nas portas do worktree
# (.orca-ports) — ou nas padrões, no checkout principal. Ctrl+C derruba os dois.
set -euo pipefail
ROOT=$(git rev-parse --show-toplevel)

"$ROOT/scripts/orca/dev-api.sh" &
API_PID=$!
trap 'kill "$API_PID" 2>/dev/null || true' EXIT INT TERM

"$ROOT/scripts/orca/dev-web.sh"
