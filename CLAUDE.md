# CLAUDE.md — wSkills

Catálogo público de skills de Claude Code (`@wgalleti/wskills`) + site de documentação
(VitePress em `site/`, publicado no GitHub Pages). **Repositório público**: nome de
cliente, nome de pessoa, caminho absoluto de máquina, IP interno e segredo não entram em
lugar nenhum — o `yarn validate` barra em `skills/`, e a mesma régua vale para `docs/` e
`site/`.

## Estrutura

- `skills/<nome>/SKILL.md` — a fonte de verdade de cada skill (frontmatter `name` +
  `description`; material pesado em `references/` ou `scripts/`).
- `docs/` — guias longos (claude-code, novo-projeto, orca-worktrees) e os scripts do kit
  Orca (`docs/orca/`). Não entram no pacote npm; são lidos no GitHub e viram páginas do
  site.
- `site/` — o site VitePress. Páginas em `site/skills/`, `site/orca/` e
  `site/guia/{claude-code,novo-projeto}.md` são **geradas** pelo
  `scripts/site-sync.mjs` (gitignoradas) — edite sempre a fonte, nunca o gerado.
  Exemplos de uso por skill: `site/.vitepress/snippets/<nome>.md`.
- `bin/wskills.mjs` — o CLI. `scripts/validate.mjs` — validador de estrutura + vazamento.

## A doc acompanha toda mudança (regra inegociável)

Mexeu no projeto → ajusta a doc no MESMO commit/PR. Use a skill **`/site-docs`**
(`.claude/skills/site-docs/SKILL.md`), que detalha o fluxo. Resumo:

- **Skill nova** → snippet de exemplos em `site/.vitepress/snippets/<nome>.md`, entrada no
  grupo certo do sidebar (`site/.vitepress/config.mjs`), linha no catálogo do `README.md`.
- **Skill alterada** → confira se os exemplos do snippet ainda batem com o comportamento;
  descreva o ajuste no texto quando mudar o uso.
- **Doc nova em `docs/`** → decida se vira página do site (acrescente no `site-sync.mjs` e
  no sidebar) ou só link.
- **Sempre** feche com `yarn site:build` verde — o build quebra com link morto e com
  `<coisa>` fora de crase (o markdown passa pelo compilador Vue).

O deploy é automático: push na `main` que toque skills/docs/site dispara
`.github/workflows/docs.yml` → GitHub Pages.

## Verificações antes de commitar

```bash
yarn validate     # estrutura + vazamento (denylist local em .wskills-denylist)
yarn smoke        # ciclo do CLI
yarn site:build   # site gera e builda
yarn format:check # prettier
```

## Convenções

- Idioma: conteúdo em **pt-BR**; commits em inglês convencional (`feat:`, `fix:`, `docs:`).
- Release: `yarn release:minor|patch` (bump+changelog+tag); publicação no npm é manual
  (2FA) — `yarn release:publish`. Ver `PUBLISHING.md`.
- Skills novas aqui costumam nascer num projeto privado e ser portadas: ao portar,
  anonimize (nada de nome de cliente/pessoa/caminho) e acrescente um bloco
  **"adapte ao instalar"** quando a skill descrever um repositório específico.
