#!/usr/bin/env bash
# Cria (ou mostra) o MR draft deste branch no GitLab — a documentação viva da
# frente de trabalho. Idempotente: rodou de novo, só imprime a URL do MR.
#
#   scripts/orca/mr.sh ["Título do MR"]
#
# - alvo: develop (mude com ORCA_MR_TARGET=<branch>)
# - descrição: .gitlab/merge_request_templates/Orca.md com os dados do worktree
# - branch ainda igual ao alvo? faz um commit vazio de abertura (o GitLab
#   precisa do branch publicado para o MR existir)
# O setup.sh chama isto na criação do worktree (desligue com ORCA_MR=0).
set -euo pipefail

log() { printf '[orca-mr] %s\n' "$*"; }
die() { printf '[orca-mr] ERRO: %s\n' "$*" >&2; exit 1; }

command -v glab >/dev/null || die "glab não instalado (brew install glab && glab auth login)."

ROOT=$(git rev-parse --show-toplevel)
BRANCH=$(git rev-parse --abbrev-ref HEAD)
TARGET="${ORCA_MR_TARGET:-develop}"

[ "$BRANCH" != "HEAD" ] || die "worktree em detached HEAD — crie um branch (git switch -c <nome>) e rode de novo."
case "$BRANCH" in
  "$TARGET" | main) die "não crio MR a partir de $BRANCH." ;;
esac

# Já existe MR deste branch? Só mostra.
if URL=$(glab mr view "$BRANCH" 2>/dev/null | grep -m1 -o 'https://gitlab.com/[^ ]*/merge_requests/[0-9]*'); then
  log "MR já existe: $URL"
  exit 0
fi

# Branch precisa divergir do alvo para o MR nascer — commit vazio de abertura.
git fetch -q origin "$TARGET"
if [ "$(git rev-list --count "origin/$TARGET..HEAD")" = "0" ]; then
  git commit --allow-empty -q -m "chore: open work branch $BRANCH"
  log "commit vazio de abertura criado."
fi
git push -q -u origin "$BRANCH"

# Título: argumento ou o nome do branch legível.
TITLE="${1:-}"
[ -n "$TITLE" ] || TITLE=$(printf '%s' "$BRANCH" | tr '_/-' '   ')

# Descrição: template + dados do worktree (quando o setup já rodou).
SLOT="-" API_PORT="-" WEB_PORT="-" ORCA_DB="-"
# shellcheck disable=SC1091
[ -f "$ROOT/.orca-ports" ] && . "$ROOT/.orca-ports"
TEMPLATE="$ROOT/.gitlab/merge_request_templates/Orca.md"
if [ -f "$TEMPLATE" ]; then
  DESC=$(sed -e "s|__WORKTREE__|$(basename "$ROOT")|" \
             -e "s|__SLOT__|${ORCA_SLOT:-$SLOT}|" \
             -e "s|__API_PORT__|$API_PORT|" \
             -e "s|__WEB_PORT__|$WEB_PORT|" \
             -e "s|__DB__|$ORCA_DB|" "$TEMPLATE")
else
  DESC="(template .gitlab/merge_request_templates/Orca.md não encontrado neste branch)"
fi

OUT=$(glab mr create \
  --source-branch "$BRANCH" --target-branch "$TARGET" \
  --title "$TITLE" --description "$DESC" \
  --draft --remove-source-branch --yes)
URL=$(printf '%s\n' "$OUT" | grep -m1 -o 'https://gitlab.com/[^ ]*/merge_requests/[0-9]*' || true)
log "MR draft criado: ${URL:-$OUT}"
log "mantenha a seção 'Operações planejadas' viva — é a documentação da frente."
