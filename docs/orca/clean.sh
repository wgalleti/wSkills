#!/usr/bin/env bash
# Recolhe o lixo dos worktrees do Orca: slots cujo worktree foi removido são
# liberados e os bancos <banco>_wtN / test_<banco>_wtN órfãos são DROPADOS.
# Nunca toca no banco principal nem em slot cujo worktree ainda existe.
#
# Pode rodar de qualquer checkout (principal ou worktree), a qualquer momento.
# O setup.sh chama isto automaticamente a cada worktree novo.
#
#   scripts/orca/clean.sh [--dry-run]
set -euo pipefail

log() { printf '[orca-clean] %s\n' "$*"; }
die() { printf '[orca-clean] ERRO: %s\n' "$*" >&2; exit 1; }

DRY=false
[ "${1:-}" = "--dry-run" ] && DRY=true

GIT_COMMON=$(git rev-parse --path-format=absolute --git-common-dir)
PRIMARY_ROOT=$(dirname "$GIT_COMMON")
SLOTS_DIR="$GIT_COMMON/orca-slots"

PRIMARY_API_ENV="$PRIMARY_ROOT/api/.env"
[ -f "$PRIMARY_API_ENV" ] || die "api/.env não existe no checkout principal ($PRIMARY_API_ENV)"
DB_URL=$(grep -E '^DATABASE_URL=' "$PRIMARY_API_ENV" | tail -1 | cut -d= -f2-)
[[ "$DB_URL" =~ ^postgres(ql)?://([^:]+):([^@]+)@([^:/]+):([0-9]+)/(.+)$ ]] \
  || die "DATABASE_URL do principal não é postgres:// ($DB_URL)"
DB_USER="${BASH_REMATCH[2]}" DB_HOST="${BASH_REMATCH[4]}"
DB_PORT="${BASH_REMATCH[5]}" DB_NAME="${BASH_REMATCH[6]}"
export PGPASSWORD="${BASH_REMATCH[3]}"
psql_admin() { psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -qtAc "$1"; }
pg_isready -h "$DB_HOST" -p "$DB_PORT" >/dev/null 2>&1 \
  || die "Postgres não está de pé em $DB_HOST:$DB_PORT."

drop_db() {
  local db="$1"
  case "$db" in
    "$DB_NAME") die "recusando dropar o banco principal ($db)" ;;
    "${DB_NAME}_wt"[1-9] | "test_${DB_NAME}_wt"[1-9]) ;;
    *) log "ignorando $db (não parece banco de worktree)"; return ;;
  esac
  if [ "$(psql_admin "SELECT 1 FROM pg_database WHERE datname='$db'")" = "1" ]; then
    if $DRY; then
      log "dry-run: droparia $db"
    else
      psql_admin "DROP DATABASE \"$db\" WITH (FORCE)" >/dev/null && log "banco $db removido."
    fi
  fi
}

REMOVED=0

# 1) Slots cujo worktree sumiu → libera o slot e dropa os bancos dele.
mkdir -p "$SLOTS_DIR"
for f in "$SLOTS_DIR"/slot-[1-9]; do
  [ -f "$f" ] || continue
  i="${f##*slot-}"
  owner=$(cat "$f")
  if [ ! -d "$owner" ]; then
    log "slot $i: worktree removido ($owner)"
    $DRY || rm -f "$f"
    drop_db "${DB_NAME}_wt${i}"
    drop_db "test_${DB_NAME}_wt${i}"
    REMOVED=$((REMOVED + 1))
  fi
done

# 2) Bancos wt sem slot registrado (teardown esquecido, slot apagado à mão) → dropa.
while IFS= read -r db; do
  [ -n "$db" ] || continue
  i="${db##*_wt}"
  if [ ! -f "$SLOTS_DIR/slot-$i" ]; then
    log "banco órfão sem slot: $db"
    drop_db "$db"
    REMOVED=$((REMOVED + 1))
  fi
done < <(psql_admin "SELECT datname FROM pg_database
                     WHERE datname SIMILAR TO '(test_)?${DB_NAME}_wt[1-9]'")

if [ "$REMOVED" -eq 0 ]; then
  log "nada a limpar — nenhum banco/slot órfão."
fi
