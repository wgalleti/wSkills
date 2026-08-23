#!/usr/bin/env bash
# Setup de worktree do Orca — ver docs/orca-worktrees.md.
#
# Registrado no Orca em "Auto-run commands on worktree create". Autossuficiente:
# não depende de variável de ambiente do Orca. No checkout PRINCIPAL não faz nada
# (rodar na mão continua nas portas e no banco padrão do projeto).
#
# ORCA_DB_MODE=clone|migrate|shared (padrão: clone — restore do banco do principal)
# ORCA_DB_REFRESH=1 re-clona o banco do principal mesmo que o wt já exista
set -euo pipefail

log() { printf '[orca-setup] %s\n' "$*"; }
die() { printf '[orca-setup] ERRO: %s\n' "$*" >&2; exit 1; }

WT_ROOT=$(git rev-parse --show-toplevel)
GIT_COMMON=$(git rev-parse --path-format=absolute --git-common-dir)
PRIMARY_ROOT=$(dirname "$GIT_COMMON")

if [ "$WT_ROOT" = "$PRIMARY_ROOT" ]; then
  log "checkout principal — nada a fazer (portas e banco originais)."
  exit 0
fi

log "worktree: $WT_ROOT"
log "principal: $PRIMARY_ROOT"

PRIMARY_API_ENV="$PRIMARY_ROOT/api/.env"
PRIMARY_WEB_ENV="$PRIMARY_ROOT/web/.env"
[ -f "$PRIMARY_API_ENV" ] || die "api/.env não existe no checkout principal ($PRIMARY_API_ENV)"
[ -f "$PRIMARY_WEB_ENV" ] || die "web/.env não existe no checkout principal ($PRIMARY_WEB_ENV)"

# --- Banco do principal (parse do DATABASE_URL) --------------------------------
DB_URL=$(grep -E '^DATABASE_URL=' "$PRIMARY_API_ENV" | tail -1 | cut -d= -f2-)
if [[ "$DB_URL" =~ ^postgres(ql)?://([^:]+):([^@]+)@([^:/]+):([0-9]+)/(.+)$ ]]; then
  DB_USER="${BASH_REMATCH[2]}" DB_PASS="${BASH_REMATCH[3]}"
  DB_HOST="${BASH_REMATCH[4]}" DB_PORT="${BASH_REMATCH[5]}" DB_NAME="${BASH_REMATCH[6]}"
else
  die "DATABASE_URL do principal não é postgres:// — não sei provisionar ($DB_URL)"
fi
export PGPASSWORD="$DB_PASS"
psql_admin() { psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -qtAc "$1"; }
pg_isready -h "$DB_HOST" -p "$DB_PORT" >/dev/null 2>&1 \
  || die "Postgres não está de pé em $DB_HOST:$DB_PORT — suba o banco de dev antes."

# --- Alocação de slot (registro compartilhado em .git/orca-slots) --------------
SLOTS_DIR="$GIT_COMMON/orca-slots"
mkdir -p "$SLOTS_DIR"
SLOT="" FREE=""
for i in 1 2 3 4 5 6 7 8 9; do
  f="$SLOTS_DIR/slot-$i"
  if [ -f "$f" ]; then
    owner=$(cat "$f")
    if [ "$owner" = "$WT_ROOT" ]; then SLOT=$i; break; fi
    if [ ! -d "$owner" ]; then
      log "slot $i estava com worktree removido ($owner) — liberado."
      rm -f "$f"; [ -z "$FREE" ] && FREE=$i
    fi
  else
    [ -z "$FREE" ] && FREE=$i
  fi
done
if [ -z "$SLOT" ]; then
  [ -n "$FREE" ] || die "9 slots ocupados — rode scripts/orca/teardown.sh em worktrees velhos."
  SLOT=$FREE
  printf '%s' "$WT_ROOT" > "$SLOTS_DIR/slot-$SLOT"
fi

API_PORT=$((10000 + SLOT))
WEB_PORT=$((5180 + SLOT))
WT_DB="${DB_NAME}_wt${SLOT}"
WT_TEST_DB="test_${DB_NAME}_wt${SLOT}"
log "slot $SLOT → api :$API_PORT · web :$WEB_PORT · banco $WT_DB"

for p in "$API_PORT" "$WEB_PORT"; do
  if nc -z 127.0.0.1 "$p" >/dev/null 2>&1; then
    log "AVISO: porta $p já está em uso — algo alheio ao Orca está nela."
  fi
done

# --- Banco por worktree --------------------------------------------------------
MODE="${ORCA_DB_MODE:-clone}"
case "$MODE" in
  shared)
    WT_DB="$DB_NAME"
    log "modo shared: usando o banco do principal ($DB_NAME) — sem isolamento."
    ;;
  clone|migrate)
    if [ "$(psql_admin "SELECT 1 FROM pg_database WHERE datname='$WT_DB'")" = "1" ]; then
      if [ "${ORCA_DB_REFRESH:-0}" = "1" ]; then
        log "ORCA_DB_REFRESH=1 — descartando $WT_DB para re-clonar do principal."
        psql_admin "DROP DATABASE \"$WT_DB\" WITH (FORCE)" >/dev/null
      else
        log "banco $WT_DB já existe — reutilizando (ORCA_DB_REFRESH=1 para re-clonar)."
      fi
    fi
    if [ "$(psql_admin "SELECT 1 FROM pg_database WHERE datname='$WT_DB'")" != "1" ]; then
      if [ "$MODE" = "clone" ]; then
        # Caminho rápido: clone por TEMPLATE (cópia de arquivos no servidor —
        # escala com o tamanho do banco muito melhor que dump/restore). Exige
        # ZERO conexões no banco origem; request em voo na API do principal
        # faz falhar — aí cai no pg_dump | psql, mais lento porém sempre possível.
        if psql_admin "CREATE DATABASE \"$WT_DB\" OWNER \"$DB_USER\" TEMPLATE \"$DB_NAME\"" >/dev/null 2>&1; then
          log "clone via CREATE DATABASE TEMPLATE ($DB_NAME → $WT_DB)."
        else
          log "template ocupado (conexões ativas no $DB_NAME) — caindo para pg_dump | psql…"
          psql_admin "CREATE DATABASE \"$WT_DB\" OWNER \"$DB_USER\"" >/dev/null
          pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -O -x "$DB_NAME" \
            | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$WT_DB" -q
        fi
      else
        psql_admin "CREATE DATABASE \"$WT_DB\" OWNER \"$DB_USER\"" >/dev/null
        log "banco $WT_DB criado vazio (modo migrate)."
      fi
    fi
    ;;
  *) die "ORCA_DB_MODE inválido: $MODE (use clone, migrate ou shared)" ;;
esac

# Recolhe o lixo de worktrees já removidos (bancos wt órfãos + slots stale).
"$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/clean.sh" || log "AVISO: clean.sh falhou (seguindo mesmo assim)."

# --- Envs do worktree ----------------------------------------------------------
WT_DB_URL="postgres://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${WT_DB}"
{
  grep -vE '^(DATABASE_URL|TEST_DATABASE_NAME)=' "$PRIMARY_API_ENV"
  echo "DATABASE_URL=$WT_DB_URL"
  echo "TEST_DATABASE_NAME=$WT_TEST_DB"
} > "$WT_ROOT/api/.env"

{
  grep -vE '^(VITE_API_URL|WEB_PORT)=' "$PRIMARY_WEB_ENV"
  echo "VITE_API_URL=http://localhost:${API_PORT}/api"
  echo "WEB_PORT=$WEB_PORT"
} > "$WT_ROOT/web/.env"

cat > "$WT_ROOT/.orca-ports" <<EOF
# gerado por scripts/orca/setup.sh — não commitar
ORCA_SLOT=$SLOT
API_PORT=$API_PORT
WEB_PORT=$WEB_PORT
ORCA_DB=$WT_DB
ORCA_TEST_DB=$WT_TEST_DB
EOF
log "envs gerados: api/.env · web/.env · .orca-ports"

# --- Dependências --------------------------------------------------------------
log "uv sync (api)…"
(cd "$WT_ROOT/api" && uv sync -q)

log "yarn install (web)…"
(cd "$WT_ROOT/web" && yarn install --silent --non-interactive)
# O yarn install desfaz links locais (yarn link); refaz os que o principal tiver.
if [ -d "$PRIMARY_ROOT/web/node_modules" ]; then
  while IFS= read -r link; do
    pkg=${link#"$PRIMARY_ROOT/web/node_modules/"}
    log "principal usa $pkg linkado — refazendo yarn link no worktree."
    (cd "$WT_ROOT/web" && yarn link "$pkg" >/dev/null 2>&1) \
      || log "AVISO: yarn link $pkg falhou — rode 'yarn link' no pacote antes."
  done < <(find "$PRIMARY_ROOT/web/node_modules" -maxdepth 2 -type l -not -path '*/.bin/*' 2>/dev/null)
fi

# --- Migrations do branch ------------------------------------------------------
if [ "$MODE" != "shared" ]; then
  log "manage.py migrate ($WT_DB)…"
  (cd "$WT_ROOT/api" && uv run python manage.py migrate --no-input)
fi

# --- MR draft no GitLab (documentação viva da frente) --------------------------
if [ "${ORCA_MR:-1}" = "1" ]; then
  bash "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/mr.sh" \
    || log "AVISO: MR não criado agora — rode scripts/orca/mr.sh quando o branch existir."
fi

log "pronto — slot $SLOT · api http://localhost:$API_PORT · web http://localhost:$WEB_PORT"
log "suba com: scripts/orca/dev-api.sh e scripts/orca/dev-web.sh"
