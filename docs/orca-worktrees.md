# Orca — worktrees paralelos com portas e banco independentes

Como rodar um monorepo dentro do [Orca](https://www.onorca.dev/) com **API, frontend e banco
próprios por worktree**, sem colidir com o checkout principal nem entre si. Rodar "na mão" no
checkout principal continua exatamente como sempre (portas e banco padrão).

Os scripts prontos estão em [`docs/orca/`](orca/) — copie a pasta para `scripts/orca/` no seu
repositório e ajuste o que a seção 6 indica.

## 0. O contexto assumido

Um **monorepo** com esta forma (ajuste os detalhes à sua realidade):

- `api/` — backend Django gerenciado por **uv** (`uv sync`, `uv run python manage.py …`),
  configurado por um `api/.env` gitignorado com `DATABASE_URL=postgres://…`.
- `web/` — frontend Vite gerenciado por **yarn**, configurado por um `web/.env` gitignorado
  com `VITE_API_URL` e (após o ajuste da seção 6) `WEB_PORT`.
- **Postgres de dev em Docker** (um `docker compose up -d db` no checkout principal, exposto
  em `localhost:5432`). Só o banco vive em container — API e frontend sobem **nativos**, no
  terminal, via os scripts. Os scripts não sabem nem precisam saber que é Docker: basta o
  Postgres responder em `127.0.0.1:5432`.

Outro stack (poetry, npm, MySQL…)? A mecânica de slots/portas/clone é a mesma — troque os
comandos de install e o provisionamento de banco no `setup.sh`.

## 1. O problema

O Orca cria um `git worktree` por tarefa. Sem preparo, todo worktree:

1. **Nasce sem `api/.env` e `web/.env`** — os dois são gitignorados; nada sobe.
2. **Colide nas portas** — `runserver` padrão é `:8000`; o Vite trava em `:5173`
   (com `strictPort: true`, que vale a pena manter de propósito).
3. **Colide no banco** — todos usariam o mesmo banco de dev; migrations de branches
   diferentes corromperiam o schema um do outro.
4. **Colide no banco de teste** — um nome fixo de banco de teste faz dois `pytest`
   paralelos se derrubarem.

## 2. O desenho

Um único **setup script autossuficiente** (`setup.sh`), registrado no Orca em
_Repository settings → Auto-run commands on worktree create_. Ele **não depende de nenhuma
variável de ambiente do Orca**:

1. Detecta se é o **checkout principal** (`git rev-parse --git-common-dir`): se for,
   não faz nada — é isso que garante que "rodar na mão" fica nas portas originais.
2. Aloca um **slot N (1–9)** num registro compartilhado entre worktrees
   (`.git/orca-slots/` do checkout principal — morre junto com o repo). Slots de
   worktrees já removidos são reaproveitados; rodar de novo no mesmo worktree é
   idempotente (mantém o slot).
3. Deriva tudo do slot (exemplo com banco principal chamado `app`):

   | Recurso         | Principal  | Worktree slot N           |
   | --------------- | ---------- | ------------------------- |
   | API (runserver) | `8000`     | `10000 + N` (10001–10009) |
   | Web (vite)      | `5173`     | `5180 + N` (5181–5189)    |
   | Banco dev       | `app`      | `app_wt{N}`               |
   | Banco de teste  | `test_app` | `test_app_wt{N}`          |

   As faixas (`10000+N`, `5180+N`) são escolha — mude no `setup.sh` se a sua máquina já usa
   essas portas. O nome do banco não é configurado em lugar nenhum: sai do parse do
   `DATABASE_URL` do principal.

4. **Gera os envs** do worktree a partir dos do principal, trocando só o que é
   por-worktree:
   - `api/.env` — cópia do principal com `DATABASE_URL` apontando para `app_wt{N}` +
     `TEST_DATABASE_NAME=test_app_wt{N}`.
   - `web/.env` — cópia do principal com `VITE_API_URL=http://localhost:{API_PORT}/api` e
     `WEB_PORT={WEB_PORT}` (o `vite.config` lê e mantém `strictPort`).
   - `.orca-ports` na raiz do worktree (gitignorado) — resumo `API_PORT/WEB_PORT/...`
     que os scripts de dev consomem.
5. **Provisiona o banco** (modo via `ORCA_DB_MODE`, padrão `clone`):
   - `clone` _(padrão)_ — cópia do banco do principal para `app_wt{N}` (na primeira vez;
     `ORCA_DB_REFRESH=1` força re-clonar um que já existe), depois `manage.py migrate` para
     alinhar ao branch. Dados reais de dev, isolados. O clone tenta primeiro
     **`CREATE DATABASE … TEMPLATE app`** — cópia de arquivos dentro do servidor, segundos
     mesmo com banco grande. O Postgres só exige **zero conexões ativas** no banco origem
     nesse instante; como o runserver fecha a conexão a cada request, normalmente passa — se
     houver request em voo, o script **cai sozinho para `pg_dump | psql`** (mais lento,
     sempre funciona). Banco crescendo e o fallback incomodando? Rode o setup num momento de
     API ociosa ou pare o runserver do principal por um instante.
   - `migrate` — banco vazio + `migrate` (mais rápido, sem dados).
   - `shared` — usa o mesmo banco do principal (**sem isolamento** — só para tarefa que não
     mexe em migration).
6. **Instala dependências**: `uv sync` no `api/` (rápido, cache global) e `yarn install` no
   `web/`. Declare `web/node_modules` como _shared directory_ no `orca.yaml` (clone-copy
   APFS) e o install vira quase no-op. Se o principal estiver com algum pacote **linkado**
   (`yarn link`), o script refaz os links no worktree (o `yarn install` desfaz symlink).

### Subir os servidores num worktree

```bash
scripts/orca/dev-api.sh   # runserver 0.0.0.0:$API_PORT (lê .orca-ports)
scripts/orca/dev-web.sh   # vite na $WEB_PORT
scripts/orca/dev.sh       # os dois num terminal só (Ctrl+C derruba ambos)
```

No checkout principal os três caem nos padrões (`8000` / `5173`) — pode usar sempre.
São esses os comandos para configurar como _Quick Commands_ no Orca.

### Desmontar e limpar

```bash
scripts/orca/teardown.sh [--keep-db]   # de dentro do worktree, antes de removê-lo
scripts/orca/clean.sh [--dry-run]      # de qualquer checkout, a qualquer momento
```

O **teardown** libera o slot e **apaga por padrão** `app_wt{N}` e o banco de teste
(`--keep-db` preserva). Esqueceu de rodar antes de deletar o worktree? O **clean** recolhe o
lixo: libera slots cujo worktree sumiu e **dropa** os bancos `app_wt*`/`test_app_wt*` órfãos
(nunca o principal, nunca de worktree vivo). O `setup.sh` chama o clean automaticamente a
cada worktree novo, então o ambiente se mantém sem resíduo mesmo sem intervenção manual.

### MR draft no GitLab — a documentação viva da frente

Opcional (desligue com `ORCA_MR=0`): todo worktree novo já nasce com um **MR draft** para o
branch de integração (o `setup.sh` chama `mr.sh`). O MR é o registro da frente:

1. O branch é publicado (com um commit vazio de abertura, se ainda não divergiu do alvo — o
   GitLab precisa disso para o MR existir) e o draft é criado com o template
   `.gitlab/merge_request_templates/Orca.md` (modelo pronto:
   [`docs/orca/merge_request_template.md`](orca/merge_request_template.md)): **Problema →
   Análise → Solução (checklist vivo) → Validação**, mais o rodapé com slot/portas/banco do
   worktree. Escrito para **gestão não técnica** — efeito na operação primeiro. Padrão
   editorial completo (MR e commits): skill **`mr`** deste pacote.
2. **Manter o MR fiel ao trabalho faz parte da frente**: marque as operações feitas,
   acrescente as que surgirem, registre decisões — pelo GitLab ou por
   `glab mr update <iid> --description ...` / `glab mr note <iid> -m "..."`.
3. Idempotente: rodar `mr.sh` de novo só imprime a URL. Título custom:
   `scripts/orca/mr.sh "Título da frente"`. Alvo custom: `ORCA_MR_TARGET=<branch>`.
   O MR nasce com _remove source branch_ ligado.

Requisitos: `glab` autenticado (`glab auth status`). Sem ele, o setup só avisa e segue —
crie o MR depois com `scripts/orca/mr.sh`. Usa GitHub? Troque `glab` por `gh` no `mr.sh`
(mesma estrutura: `gh pr create --draft …`).

### Serviços auxiliares em Docker (um stack para todos os worktrees)

Serviço compartilhado que precisa chamar de volta o app (gerador de PDF que renderiza uma
rota do frontend, webhook local etc.) não deve subir por worktree. O padrão que funciona:
**um stack só**, e o proxy de dev de cada worktree manda a própria base URL por header
(`host.docker.internal:{porta}`); o serviço monta a URL **por request**. Honre esses headers
**apenas em dev** (uma env explícita no compose de dev) — em produção, aceitar base URL de
header é SSRF.

## 3. Mudanças de código no monorepo (mínimas, sem efeito no fluxo atual)

| Arquivo                                          | Mudança                                                                                   | Efeito no principal                 |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------- | ----------------------------------- |
| `web/vite.config.*`                              | porta vem de `WEB_PORT` (process env ou `web/.env`), default `5173`; `strictPort` mantido | nenhum — sem `WEB_PORT`, tudo igual |
| `api/config/settings.py`                         | nome do banco de teste vem de `TEST_DATABASE_NAME`, com default fixo                      | nenhum                              |
| `.gitignore` (raiz)                              | ignora `.orca-ports`                                                                      | nenhum                              |
| `orca.yaml` (novo)                               | `worktree.sharedDirectories: [web/node_modules]`                                          | só o Orca lê                        |
| `scripts/orca/` (novo)                           | os 8 scripts desta pasta                                                                  | opt-in                              |
| `.gitlab/merge_request_templates/Orca.md` (novo) | template do MR draft por worktree                                                         | só o GitLab/`mr.sh` leem            |

## 4. Configuração no Orca (uma vez)

**Pré-requisito:** este change set commitado no branch de integração — o worktree nasce do
commit do branch, e é de lá que o Orca roda os scripts. Defina a base ref do repositório para
esse branch (`orca repo set-base-ref`).

No app (Repository settings do repo):

1. **Setup script** (auto-run on worktree create): `bash scripts/orca/setup.sh`.
2. **Archive script** (ao arquivar/remover o worktree): `bash scripts/orca/teardown.sh`
   — apaga o banco e libera o slot na hora, sem esperar o clean.
3. **Quick Commands** (escopo do projeto) — os comandos do dia a dia por worktree:

   | Nome sugerido       | Comando                            |
   | ------------------- | ---------------------------------- |
   | Subir API           | `scripts/orca/dev-api.sh`          |
   | Subir front         | `scripts/orca/dev-web.sh`          |
   | Subir tudo          | `scripts/orca/dev.sh`              |
   | Resetar banco       | `scripts/orca/db-reset.sh`         |
   | Resetar banco vazio | `scripts/orca/db-reset.sh --vazio` |

   Quick Command roda num terminal do worktree — e é só disso que os scripts precisam (cwd
   dentro do worktree): eles **não dependem de variável de ambiente do Orca**; portas e banco
   vêm do `.orca-ports`/`api/.env` do próprio worktree. `db-reset.sh` dropa e recria o
   `app_wt{N}` (re-clone do principal por padrão, `--vazio` para só migrations) e **recusa
   rodar no checkout principal**.

`orca.yaml` e `.worktreeinclude` são lidos do próprio repo — nada a configurar.

## 5. Limitações conhecidas

- **Clone por TEMPLATE precisa do banco origem sem conexões** naquele instante — request em
  voo na API do principal derruba para o fallback `pg_dump` (seção 2).
- **9 worktrees simultâneos** (slots 1–9). Acabou slot, o setup falha com mensagem clara —
  remova worktrees velhos ou rode o teardown.
- `ORCA_DB_MODE=clone` copia o banco na criação; o worktree **não** enxerga dados criados
  depois no principal (é o ponto: isolamento). Quer a foto mais recente?
  `ORCA_DB_REFRESH=1 bash scripts/orca/setup.sh` re-clona.
- O Postgres precisa estar de pé em `localhost:5432` (suba o container antes) — o setup
  falha cedo com mensagem se não estiver.

## 6. Checklist de adaptação ao copiar

- [ ] Faixas de porta (`10000+N`, `5180+N`) livres na sua máquina — ajuste no `setup.sh`.
- [ ] `vite.config` lendo `WEB_PORT`; `settings.py` lendo `TEST_DATABASE_NAME`.
- [ ] `.orca-ports` no `.gitignore` da raiz.
- [ ] Comandos de install (`uv sync` / `yarn install`) batem com o seu gerenciador.
- [ ] Alvo do MR (`develop`) e template `.gitlab/merge_request_templates/Orca.md` — ou
      `ORCA_MR=0` se não usa GitLab.
- [ ] Postgres de dev acessível em `localhost:5432` (container do compose de pé).
