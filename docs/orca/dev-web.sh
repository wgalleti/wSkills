#!/usr/bin/env bash
# Sobe o frontend do worktree na porta do slot (.orca-ports). No checkout
# principal (sem .orca-ports) cai no padrão :5173 — pode usar sempre.
set -euo pipefail
ROOT=$(git rev-parse --show-toplevel)
# shellcheck disable=SC1091
[ -f "$ROOT/.orca-ports" ] && . "$ROOT/.orca-ports"
cd "$ROOT/web"
if [ -n "${WEB_PORT:-}" ]; then
  exec env WEB_PORT="$WEB_PORT" yarn dev
fi
exec yarn dev
