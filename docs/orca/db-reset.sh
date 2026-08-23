#!/usr/bin/env bash
# Reestrutura o banco DESTE worktree: dropa o <banco>_wtN e recria.
#
#   scripts/orca/db-reset.sh            # re-clona do banco do principal (padrão)
#   scripts/orca/db-reset.sh --vazio    # recria vazio (só migrations)
#
# Nos dois modos roda manage.py migrate no final. Recusa rodar no checkout
# principal — o banco de dev de verdade nunca é tocado.
set -euo pipefail

log() { printf '[orca-db-reset] %s\n' "$*"; }
die() { printf '[orca-db-reset] ERRO: %s\n' "$*" >&2; exit 1; }

VAZIO=false
[ "${1:-}" = "--vazio" ] && VAZIO=true

WT_ROOT=$(git rev-parse --show-toplevel)
GIT_COMMON=$(git rev-parse --path-format=absolute --git-common-dir)
PRIMARY_ROOT=$(dirname "$GIT_COMMON")
[ "$WT_ROOT" != "$PRIMARY_ROOT" ] || die "isto é o checkout principal — reset só em worktree."
[ -f "$WT_ROOT/.orca-ports" ] || die ".orca-ports não existe — rode scripts/orca/setup.sh antes."
# shellcheck disable=SC1091
. "$WT_ROOT/.orca-ports"

DB_URL=$(grep -E '^DATABASE_URL=' "$PRIMARY_ROOT/api/.env" | tail -1 | cut -d= -f2-)
[[ "$DB_URL" =~ ^postgres(ql)?://([^:]+):([^@]+)@([^:/]+):([0-9]+)/(.+)$ ]] \
  || die "DATABASE_URL do principal ilegível ($DB_URL)"
DB_USER="${BASH_REMATCH[2]}" DB_HOST="${BASH_REMATCH[4]}"
DB_PORT="${BASH_REMATCH[5]}" DB_NAME="${BASH_REMATCH[6]}"
export PGPASSWORD="${BASH_REMATCH[3]}"
psql_admin() { psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -qtAc "$1"; }

case "$ORCA_DB" in
  "${DB_NAME}_wt"[1-9]) ;;
  *) die "ORCA_DB=$ORCA_DB não parece banco de worktree — abortando." ;;
esac

log "dropando ${ORCA_DB}…"
psql_admin "DROP DATABASE IF EXISTS \"$ORCA_DB\" WITH (FORCE)" >/dev/null

if $VAZIO; then
  psql_admin "CREATE DATABASE \"$ORCA_DB\" OWNER \"$DB_USER\"" >/dev/null
  log "banco $ORCA_DB recriado vazio."
else
  # Mesmo caminho do setup: TEMPLATE (rápido) com fallback pg_dump se o banco
  # do principal estiver com conexão ativa naquele instante.
  if psql_admin "CREATE DATABASE \"$ORCA_DB\" OWNER \"$DB_USER\" TEMPLATE \"$DB_NAME\"" >/dev/null 2>&1; then
    log "re-clone via CREATE DATABASE TEMPLATE ($DB_NAME → $ORCA_DB)."
  else
    log "template ocupado — caindo para pg_dump | psql…"
    psql_admin "CREATE DATABASE \"$ORCA_DB\" OWNER \"$DB_USER\"" >/dev/null
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -O -x "$DB_NAME" \
      | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$ORCA_DB" -q
  fi
fi

log "manage.py migrate…"
(cd "$WT_ROOT/api" && uv run python manage.py migrate --no-input)
log "pronto — $ORCA_DB reestruturado."
