#!/usr/bin/env node
/**
 * Gera as páginas do site (VitePress) a partir da fonte de verdade:
 *
 *   skills/<nome>/SKILL.md  →  site/skills/<nome>.md   (+ índice do catálogo)
 *   docs/claude-code.md     →  site/guia/claude-code.md
 *   docs/novo-projeto.md    →  site/guia/novo-projeto.md
 *   docs/orca-worktrees.md  →  site/orca/index.md      (links locais → GitHub)
 *
 * Exemplos de uso por skill vivem em site/.vitepress/snippets/<nome>.md e são
 * injetados na página gerada. Roda no `yarn site:dev` e no `yarn site:build` —
 * as pastas geradas são gitignoradas; edite sempre a fonte, nunca o gerado.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SKILLS_DIR = path.join(ROOT, 'skills')
const SITE = path.join(ROOT, 'site')
const SNIPPETS = path.join(SITE, '.vitepress', 'snippets')
const REPO_URL = 'https://github.com/wgalleti/wSkills'

const read = (f) => fs.readFileSync(f, 'utf8')
const write = (f, text) => {
  fs.mkdirSync(path.dirname(f), { recursive: true })
  fs.writeFileSync(f, text)
}

function frontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!m) return { data: {}, body: text }
  const data = {}
  let key = null
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s?(.*)$/)
    if (kv) data[(key = kv[1])] = kv[2]
    else if (key && line.trim()) data[key] += ` ${line.trim()}`
  }
  for (const k of Object.keys(data))
    data[k] = data[k]
      .trim()
      .replace(/^["'>](.*)["']?$/s, '$1')
      .trim()
  return { data, body: text.slice(m[0].length) }
}

/* ------------------------------------------------------------------ skills */

const skills = fs
  .readdirSync(SKILLS_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort()

const catalog = []

for (const id of skills) {
  const { data, body } = frontmatter(read(path.join(SKILLS_DIR, id, 'SKILL.md')))
  const desc = (data.description || '').replace(/\s+/g, ' ')
  catalog.push({ id, desc })

  const snippetFile = path.join(SNIPPETS, `${id}.md`)
  const exemplos = fs.existsSync(snippetFile) ? read(snippetFile).trim() : ''

  const lines = body.split('\n')
  const h1 = lines.findIndex((l) => /^# /.test(l))
  const head = lines.slice(0, h1 + 1).join('\n')
  const rest = lines
    .slice(h1 + 1)
    .join('\n')
    .trim()

  const extras = fs
    .readdirSync(path.join(SKILLS_DIR, id), { recursive: true })
    .filter((f) => f !== 'SKILL.md' && !f.endsWith('.DS_Store'))
    .filter((f) => fs.statSync(path.join(SKILLS_DIR, id, f)).isFile())

  const page = [
    '---',
    `title: ${id}`,
    `description: "${desc.slice(0, 157).replaceAll('"', "'")}${desc.length > 157 ? '…' : ''}"`,
    'outline: [2, 3]',
    '---',
    '',
    '<!-- GERADO por scripts/site-sync.mjs a partir de skills/' +
      id +
      '/SKILL.md — não edite aqui. -->',
    '',
    head,
    '',
    '::: tip Instalar',
    '```bash',
    `npx @wgalleti/wskills add ${id}`,
    '```',
    extras.length
      ? `A skill instala também: ${extras.map((f) => '`' + f + '`').join(', ')}.`
      : 'A skill é um arquivo só (`SKILL.md`).',
    ':::',
    '',
    exemplos ? `## Exemplos de uso {#exemplos}\n\n${exemplos}\n` : '',
    '## A skill por dentro {#conteudo}',
    '',
    'O texto abaixo é o `SKILL.md` que o agente carrega — a regra, na íntegra.',
    '',
    rest,
    '',
    `---`,
    '',
    `Fonte: [\`skills/${id}/SKILL.md\`](${REPO_URL}/blob/main/skills/${id}/SKILL.md)`,
    '',
  ].join('\n')

  write(path.join(SITE, 'skills', `${id}.md`), page)
}

/* índice do catálogo */
write(
  path.join(SITE, 'skills', 'index.md'),
  [
    '---',
    'title: Catálogo de skills',
    'description: Todas as skills do pacote @wgalleti/wskills, com instalação e exemplos de uso.',
    '---',
    '',
    '<!-- GERADO por scripts/site-sync.mjs — não edite aqui. -->',
    '',
    '# Catálogo',
    '',
    'Instale qualquer skill com `npx @wgalleti/wskills add <nome>` (ou `--all` para todas).',
    'Cada página traz a instalação, exemplos de pedidos que disparam a skill e o conteúdo',
    'integral que o agente carrega.',
    '',
    ...catalog.map(
      ({ id, desc }) => `- **[\`${id}\`](./${id})** — ${desc.split('. ')[0].replace(/\.$/, '')}.`
    ),
    '',
  ].join('\n')
)

/* ------------------------------------------------------------------- guias */

for (const [src, dest] of [
  ['docs/claude-code.md', 'site/guia/claude-code.md'],
  ['docs/novo-projeto.md', 'site/guia/novo-projeto.md'],
]) {
  const text = read(path.join(ROOT, src))
  write(
    path.join(ROOT, dest),
    `---\noutline: [2, 3]\n---\n\n<!-- GERADO a partir de ${src} — edite lá. -->\n\n${text}`
  )
}

/* Orca: links locais para a pasta de scripts viram links do GitHub. */
{
  const text = read(path.join(ROOT, 'docs/orca-worktrees.md'))
    .replaceAll('](orca/)', `](${REPO_URL}/tree/main/docs/orca)`)
    .replaceAll(
      '](orca/merge_request_template.md)',
      `](${REPO_URL}/blob/main/docs/orca/merge_request_template.md)`
    )
  write(
    path.join(ROOT, 'site/orca/index.md'),
    `---\ntitle: Worktrees com Orca\noutline: [2, 3]\n---\n\n<!-- GERADO a partir de docs/orca-worktrees.md — edite lá. -->\n\n${text}`
  )
}

console.log(`site-sync: ${skills.length} skills + guias + orca gerados em site/`)
