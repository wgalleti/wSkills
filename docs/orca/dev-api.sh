#!/usr/bin/env bash
# Sobe a API do worktree na porta do slot (.orca-ports). No checkout principal
# (sem .orca-ports) cai no padrão :8000 — pode usar sempre.
set -euo pipefail
ROOT=$(git rev-parse --show-toplevel)
# shellcheck disable=SC1091
[ -f "$ROOT/.orca-ports" ] && . "$ROOT/.orca-ports"
cd "$ROOT/api"
exec uv run python manage.py runserver "0.0.0.0:${API_PORT:-8000}"
