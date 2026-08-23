#!/usr/bin/env bash
# Libera o slot deste worktree e APAGA os bancos dele (<banco>_wtN + teste).
# Rode DE DENTRO do worktree, antes de removê-lo no Orca. Use --keep-db para
# preservar o banco. Esqueceu de rodar? Sem problema: scripts/orca/clean.sh
# (chamado pelo setup de todo worktree novo) recolhe o órfão depois.
set -euo pipefail

log() { printf '[orca-teardown] %s\n' "$*"; }
die() { printf '[orca-teardown] ERRO: %s\n' "$*" >&2; exit 1; }

DROP_DB=true
[ "${1:-}" = "--keep-db" ] && DROP_DB=false

WT_ROOT=$(git rev-parse --show-toplevel)
GIT_COMMON=$(git rev-parse --path-format=absolute --git-common-dir)
PRIMARY_ROOT=$(dirname "$GIT_COMMON")
[ "$WT_ROOT" != "$PRIMARY_ROOT" ] || die "isto é o checkout principal — nada a desmontar."
[ -f "$WT_ROOT/.orca-ports" ] || die ".orca-ports não existe — este worktree não passou pelo setup."

# shellcheck disable=SC1091
. "$WT_ROOT/.orca-ports"

if $DROP_DB; then
  ENVF="$WT_ROOT/api/.env"
  DB_URL=$(grep -E '^DATABASE_URL=' "$ENVF" | tail -1 | cut -d= -f2-)
  [[ "$DB_URL" =~ ^postgres(ql)?://([^:]+):([^@]+)@([^:/]+):([0-9]+)/(.+)$ ]] \
    || die "DATABASE_URL ilegível em api/.env"
  export PGPASSWORD="${BASH_REMATCH[3]}"
  for db in "$ORCA_DB" "$ORCA_TEST_DB"; do
    case "$db" in
      *_wt[1-9]) ;;
      *) log "ignorando $db (não parece banco de worktree)"; continue ;;
    esac
    psql -h "${BASH_REMATCH[4]}" -p "${BASH_REMATCH[5]}" -U "${BASH_REMATCH[2]}" -d postgres -qc \
      "DROP DATABASE IF EXISTS \"$db\" WITH (FORCE)" && log "banco $db removido."
  done
fi

rm -f "$GIT_COMMON/orca-slots/slot-$ORCA_SLOT" "$WT_ROOT/.orca-ports"
log "slot $ORCA_SLOT liberado."
$DROP_DB || log "bancos mantidos ($ORCA_DB, $ORCA_TEST_DB) — o clean.sh vai recolhê-los depois."
