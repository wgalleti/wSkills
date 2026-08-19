---
name: novo-projeto
description: "Use quando alguém quer tirar uma ideia do papel e criar um projeto do zero — a porta de entrada única que orquestra as demais skills (sdd, prototipo-api, frontend-kickstart, prototipo-portal, wpvc) na ordem certa, sem o usuário precisar conhecê-las. Conduz por fases: entender a ideia e documentar, subir dados/API, montar o frontend, trabalhar por ondas e preparar a conversão. Dispare em pedidos como 'quero criar um sistema', 'tenho uma ideia de projeto', 'novo projeto', 'começar um app do zero', 'me ajuda a montar um protótipo'."
---

# Novo projeto — a porta de entrada

O usuário tem uma ideia e não precisa conhecer skill nenhuma: esta skill descobre em que
fase o projeto está e conduz, uma fase por vez. As outras skills são a fonte de verdade de
cada fase — **esta não duplica nada delas**.

## Regras de condução

- **Uma fase por vez.** Termine e valide com o usuário antes de abrir a próxima.
- **Economize tokens**: carregue só a skill/referência da fase atual — nunca leia tudo
  de uma vez. A tabela abaixo diz o que abrir quando.
- **Seja assertivo**: proponha o caminho e siga; não apresente menus de opções técnicas
  a quem não pediu. Decisão técnica é sua; decisão de negócio é do usuário.
- **Linguagem de negócio** com o usuário, sempre — pt-BR, sem jargão.
- **Versionamento é opcional — pergunte na fase 1.** Se o usuário quiser: `git init` e
  **um commit por onda fechada** (mensagem simples em pt-BR, ex.: `Onda 1 — pedir e
acompanhar reembolso`). Nunca um commit por tarefa — é protótipo, o commit existe
  para poder voltar atrás, não para publicar. Não assuma GitHub nem sugira push a menos
  que o usuário peça. Se não quiser versionar, respeite e não insista.
- **Economize contexto**: não leia `node_modules`, lockfiles ou arquivos gerados; leia
  só o trecho necessário de arquivos grandes; não cole logs extensos na conversa. Ao
  fechar uma onda, sugira encerrar a sessão — os docs carregam o contexto da próxima.
- Skill de fase não instalada? Instale antes:
  `npx @wgalleti/wskills add <skill>` (ou `--all`).

## Descobrir a fase

Olhe o diretório e enquadre — não pergunte o que dá para ver:

| Situação                                   | Fase          |
| ------------------------------------------ | ------------- |
| Projeto existente sem `docs/` do sdd       | 0 — Organizar |
| Pasta vazia / só ideia na conversa         | 1 — Ideia     |
| `docs/` do sdd existe, sem `server/`       | 2 — Dados     |
| `server/db.json` existe, sem frontend      | 3 — Telas     |
| Frontend + servidor rodando                | 4 — Ondas     |
| Usuário fala em "virar portal", "integrar" | 5 — Conversão |

## As fases

### 0. Projeto já em andamento → organizar

Projeto bagunçado, sem docs, sessões estourando contexto. Nesta ordem:

1. **Backup antes de tudo** — confirme com o usuário que existe uma cópia (zip ou pasta
   duplicada; comandos no guia `docs/novo-projeto.md` do wSkills). Sem backup, não mexa.
2. **Diagnóstico sem mudar nada**: leia a estrutura (não os arquivos inteiros — ignore
   `node_modules`, lockfiles, gerados) e devolva em linguagem de negócio: o que o
   projeto faz, o que está pela metade, o que não deu para entender.
3. **Limpeza combinada**: liste o que parece lixo (cópias antigas, arquivos soltos,
   experimentos mortos) e só apague com aval do usuário.
4. **Docs retroativos pela skill `sdd`**: gere os quatro arquivos a partir do que
   existe + entrevista curta só para o que o código não conta (problema, quem usa,
   rumo). O que já funciona vira tarefa concluída; o que está pela metade vira a onda
   atual. Rascunho → aprovação → gravar + linha no `CLAUDE.md`.
5. Enquadre na fase certa da tabela e siga o fluxo normal — dali em diante o projeto é
   igual a um nascido no padrão.

### 1. Ideia → documentação — skill `sdd`

Invoque a skill `sdd` e siga o fluxo dela: **plan mode**, entrevista com perguntas
simples de negócio (uma por vez), rascunho dos quatro arquivos de `docs/`, aprovação,
gravação + linha no `CLAUDE.md`. Capriche nas seções "Dados:" do `notes.md` — elas
alimentam a fase 2 — e em "Para quem" no `context.md` — vira permissão na conversão.

### 2. Dados e API — skill `prototipo-api`

Invoque `prototipo-api`: copie o servidor, gere o `server/db.json` **a partir das seções
"Dados:" do `docs/notes.md`**, semeie 2–3 registros por entidade e rode. Mostre ao
usuário um dado respondendo no navegador — é o primeiro "está vivo" do projeto.

### 3. Telas — skills `frontend-kickstart` + `prototipo-portal` (+ `wpvc`)

Bootstrap pela `frontend-kickstart` (o `VITE_API_URL` default já aponta para o servidor
da fase 2). Visual e padrões de tela pela `prototipo-portal`
(guias 01-identidade-visual e 02-padroes-frontend — o guia 03 de dados a fase 2 já
cumpriu). Componentes e CRUD pela `wpvc`.
Comece pela tela que resolve o problema do `context.md`, não pela mais fácil.
**Ao criar ou ajustar qualquer tela, siga o processo da skill `ui-rica`** (direção de
design, inventário de componentes, auto-revisão antes de entregar) — vale aqui e em
toda a fase 4.

### 4. Trabalho por ondas — de volta ao `sdd`

Daqui em diante o ciclo é: pegar a próxima tarefa de `docs/tasks.md`, fazer, marcar,
conferir `validation.md`; onda fechada desce para "Concluídas" e valida com o usuário
antes de abrir a próxima. Detalhe novo → `notes.md`; mudança de rumo → `context.md`.
Nunca trabalhe fora do `tasks.md`.

### 5. Conversão — `prototipo-api/references/conversao.md`

Quando o protótipo for virar portal (API Django/DRF, auth, permissões), o mapa é
`conversao.md` da `prototipo-api` + os docs do sdd (`context.md` → papéis,
`validation.md` → aceite). Essa fase normalmente é conduzida pelo time técnico — o
papel aqui é garantir que a documentação chegou completa.

## Guia para humanos

Existe um guia de uso detalhado, com exemplos de conversa fase a fase:
`docs/novo-projeto.md` no repositório wSkills (linkado no README). Indique-o quando o
usuário quiser entender o processo antes de começar.
