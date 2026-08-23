# Contribuir e publicar

O repositório é [github.com/wgalleti/wSkills](https://github.com/wgalleti/wSkills).
Detalhes completos:
[CONTRIBUTING.md](https://github.com/wgalleti/wSkills/blob/main/CONTRIBUTING.md) e
[PUBLISHING.md](https://github.com/wgalleti/wSkills/blob/main/PUBLISHING.md).

## Estrutura de uma skill

Uma pasta por skill em `skills/`, com `SKILL.md` (frontmatter `name` + `description`) e o
material pesado em `references/` ou `scripts/`. O `name` do frontmatter tem que bater com o
nome da pasta.

## Antes de abrir PR

```bash
yarn validate   # estrutura + vazamento
yarn smoke      # instala o catálogo num tmp e confere o ciclo do CLI
yarn format     # prettier
yarn site:build # a doc do site gera e builda sem erro
```

O validador checa estrutura (frontmatter, `name` batendo com a pasta, referências
existentes) e **vazamento**: caminho absoluto de máquina, token, IP interno, e-mail. Este
repositório é público — nome de cliente e de pessoa não entram nas skills. Nomes próprios
ficam fora do código do validador (escrevê-los seria o próprio vazamento): passe-os por
`WSKILLS_DENYLIST` ou num `.wskills-denylist` local, gitignorado.

## A doc acompanha a mudança

O site é gerado da fonte: `skills/*/SKILL.md`, `docs/*.md` e os exemplos em
`site/.vitepress/snippets/`. **Toda mudança em skill ou doc pede o ajuste correspondente
no site** — no mínimo os exemplos de uso da skill nova/alterada. O fluxo completo está na
skill local `/site-docs` do repositório.

## Release e publicação no npm

Bump por `commit-and-tag-version` a partir dos conventional commits; publicação manual
(a conta npm tem 2FA):

```bash
yarn release:minor     # skill nova ou funcionalidade → 0.x+1.0
yarn release:patch     # correção de texto/CLI
yarn release:publish   # npm publish + git push --follow-tags
```

O site publica sozinho: todo push na `main` que toque skills, docs ou o site dispara o
workflow de deploy no GitHub Pages.
