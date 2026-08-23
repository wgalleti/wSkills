---
name: site-docs
description: "Manter e publicar a documentação do wSkills (site VitePress em site/, GitHub Pages). Use SEMPRE que uma skill for criada, alterada ou removida, quando um guia em docs/ mudar, ou quando pedirem para mexer no site — a doc acompanha toda mudança do projeto no mesmo commit. Gatilhos: 'atualiza a doc', 'publica o site', 'documenta a skill nova', 'ajusta os exemplos da skill X', 'adiciona página no site'."
---

# site-docs — a doc acompanha toda mudança

O site é **gerado da fonte**: `skills/*/SKILL.md`, `docs/*.md` e os snippets de exemplo.
Nunca edite `site/skills/`, `site/orca/` nem `site/guia/{claude-code,novo-projeto}.md` —
são gitignorados e regravados pelo `scripts/site-sync.mjs` a cada build.

```bash
yarn site:dev       # sync + dev server (preview local)
yarn site:build     # sync + build — TEM que passar antes de commitar
```

## O que ajustar em cada tipo de mudança

**Skill nova em `skills/<nome>/`:**

1. `site/.vitepress/snippets/<nome>.md` — exemplos de uso: 2–4 pedidos entre aspas que
   disparam a skill (formato blockquote `>`), mais um bloco de código quando um trecho
   concreto ajudar (fluxo `você:/claude:`, comando, snippet de config). Sem exemplo, a
   página gerada sai sem a seção — não é aceitável para skill nova.
2. `site/.vitepress/config.mjs` — acrescente o nome no grupo certo do sidebar de
   `/skills/` (Começar, Frontend, Protótipos, Processo, Dados — crie grupo novo se
   nenhum servir).
3. `README.md` — linha nova na tabela do catálogo.
4. Se a skill descreve um repositório específico, confira que o SKILL.md tem o bloco
   **"adapte ao instalar"** — a página do site expõe isso ao público.

**Skill alterada:** releia o snippet de exemplos — comando que mudou, gatilho que mudou,
comportamento novo que merece exemplo. A página em si regenera sozinha; o que envelhece é
o exemplo.

**Skill removida/renomeada:** tire do sidebar, do README e apague/renomeie o snippet.
Isso é **major** no versionamento (ver `PUBLISHING.md`).

**Guia novo ou alterado em `docs/`:** decida se vira página do site. Virando: acrescente a
cópia no `scripts/site-sync.mjs` (bloco dos guias), a entrada no sidebar/nav e, se for
material novo de peso, um card na home (`site/index.md`).

**Mudança no CLI (`bin/wskills.mjs`):** atualize as tabelas de comandos/flags em
`site/guia/comecando.md` e no `README.md`.

## Armadilhas do build

- O markdown passa pelo **compilador Vue**: `<coisa>` fora de crase vira "elemento sem
  fechamento" e derruba o build. Todo token entre colchetes angulares vai entre crases —
  no SKILL.md fonte, não no gerado.
- `{{ … }}` fora de crase é interpolação Vue; evite.
- Link morto também derruba o build (`cleanUrls` ligado: linke `/skills/geojson`, sem
  `.md`).
- Título/descrição da página vêm do frontmatter do SKILL.md — description ruim fica feia
  no resultado da busca.

## Publicar

Não há passo manual: **push na `main`** que toque `skills/`, `docs/`, `site/` ou o sync
dispara `.github/workflows/docs.yml`, que roda `yarn site:build` e publica no GitHub
Pages (`https://wgalleti.github.io/wSkills/`). Antes do push:

```bash
yarn validate && yarn smoke && yarn site:build && yarn format:check
```

Falhou o deploy? `gh run list --workflow=docs.yml` e `gh run view <id> --log-failed`.

## Checklist de saída

- [ ] Snippet de exemplos criado/revisado para cada skill tocada.
- [ ] Sidebar e README refletem o catálogo.
- [ ] `yarn site:build` verde local.
- [ ] Nada de nome de cliente/pessoa/caminho de máquina no que vai ao ar (repo público).
