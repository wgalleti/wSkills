#!/usr/bin/env node
/**
 * Valida o catálogo de skills antes de publicar.
 *
 * Roda no CI e no `prepublishOnly`. Duas famílias de checagem:
 *   1. Estrutura   — frontmatter, nome batendo com a pasta, referências existentes.
 *   2. Vazamento   — caminho absoluto de máquina, segredo, IP interno, e-mail.
 *
 * Nomes próprios (cliente, pessoa) NÃO ficam listados aqui: escrever o nome que se quer
 * esconder num repositório público é o próprio vazamento. Passe-os por fora:
 *   WSKILLS_DENYLIST="acme,fulano" node scripts/validate.mjs
 * ou num arquivo `.wskills-denylist` (uma expressão por linha, ignorado pelo git).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SKILLS_DIR = path.join(ROOT, 'skills')

const problems = []
const warnings = []
const fail = (file, msg) => problems.push(`${file}: ${msg}`)
const warn = (file, msg) => warnings.push(`${file}: ${msg}`)

/* ------------------------------------------------------------------ padrões */

const LEAKS = [
  [/\/Users\/[A-Za-z0-9._-]+/g, 'caminho absoluto de máquina (/Users/...)'],
  [/\/home\/[A-Za-z0-9._-]+/g, 'caminho absoluto de máquina (/home/...)'],
  [/[A-Z]:\\Users\\[A-Za-z0-9._-]+/g, 'caminho absoluto de máquina (C:\\Users\\...)'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/g, 'chave privada'],
  [/\b(gh[pousr]|github_pat)_[A-Za-z0-9_]{20,}/g, 'token do GitHub'],
  [/\bglpat-[A-Za-z0-9_-]{16,}/g, 'token do GitLab'],
  [/\bxox[abprs]-[A-Za-z0-9-]{10,}/g, 'token do Slack'],
  [/\bsk-[A-Za-z0-9]{24,}/g, 'chave de API'],
  [/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g, 'chave da AWS'],
  [
    /(?:senha|password|passwd|secret|token|api[_-]?key)\s*[:=]\s*["'][^"'\s]{6,}["']/gi,
    'credencial literal',
  ],
  [
    /\b(?:10|127)\.\d{1,3}\.\d{1,3}\.\d{1,3}\b|\b192\.168\.\d{1,3}\.\d{1,3}\b|\b172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}\b/g,
    'IP interno',
  ],
  [/[A-Za-z0-9._%+-]+@(?!example\.)[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, 'endereço de e-mail'],
]

function denylist() {
  const out = []
  const raw = process.env.WSKILLS_DENYLIST
  if (raw)
    out.push(
      ...raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    )
  const file = path.join(ROOT, '.wskills-denylist')
  if (fs.existsSync(file)) {
    out.push(
      ...fs
        .readFileSync(file, 'utf8')
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#'))
    )
  }
  return out
}

/* ----------------------------------------------------------------- helpers */

function walk(dir) {
  const out = []
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

function frontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) return null
  const out = {}
  let key = null
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s?(.*)$/)
    if (kv) out[(key = kv[1])] = kv[2]
    else if (key && line.trim()) out[key] += ` ${line.trim()}`
  }
  for (const k of Object.keys(out)) out[k] = out[k].trim().replace(/^["'](.*)["']$/s, '$1')
  return out
}

/* ------------------------------------------------------------------ checagens */

if (!fs.existsSync(SKILLS_DIR)) {
  console.error('erro: pasta skills/ não encontrada')
  process.exit(1)
}

const skills = fs
  .readdirSync(SKILLS_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)

if (!skills.length) {
  console.error('erro: nenhuma skill em skills/')
  process.exit(1)
}

const names = new Set()

for (const id of skills) {
  const dir = path.join(SKILLS_DIR, id)
  const rel = (f) => path.relative(ROOT, f)
  const skillFile = path.join(dir, 'SKILL.md')

  if (!fs.existsSync(skillFile)) {
    fail(`skills/${id}`, 'sem SKILL.md')
    continue
  }

  const text = fs.readFileSync(skillFile, 'utf8')
  const fm = frontmatter(text)

  if (!fm) fail(rel(skillFile), 'sem frontmatter YAML (--- name / description ---)')
  else {
    if (!fm.name) fail(rel(skillFile), 'frontmatter sem `name`')
    else if (fm.name !== id) fail(rel(skillFile), `name "${fm.name}" ≠ pasta "${id}"`)
    else if (names.has(fm.name)) fail(rel(skillFile), `name duplicado: ${fm.name}`)
    else names.add(fm.name)

    if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) fail(`skills/${id}`, 'nome de pasta fora do kebab-case')

    if (!fm.description) fail(rel(skillFile), 'frontmatter sem `description`')
    else {
      if (fm.description.length < 40)
        fail(rel(skillFile), 'description curta demais para o agente escolher a skill')
      if (fm.description.length > 1024)
        fail(rel(skillFile), `description com ${fm.description.length} caracteres (máx. 1024)`)
    }
  }

  // Referências locais citadas no SKILL.md precisam existir.
  for (const m of text.matchAll(/`((?:references|assets|scripts)\/[^`\s]+)`/g)) {
    if (!fs.existsSync(path.join(dir, m[1])))
      fail(rel(skillFile), `referência inexistente: ${m[1]}`)
  }

  // Arquivo de referência que ninguém cita é peso morto (aviso, não erro).
  for (const file of walk(dir)) {
    const r = path.relative(dir, file)
    if (r === 'SKILL.md') continue
    if (!text.includes(r)) warn(rel(file), 'não é citado no SKILL.md')
  }
}

const deny = denylist()
for (const file of walk(SKILLS_DIR)) {
  const text = fs.readFileSync(file, 'utf8')
  const rel = path.relative(ROOT, file)
  for (const [re, label] of LEAKS) {
    for (const m of text.matchAll(re)) {
      const line = text.slice(0, m.index).split('\n').length
      fail(`${rel}:${line}`, `${label} — "${m[0].slice(0, 48)}"`)
    }
  }
  for (const term of deny) {
    const re = new RegExp(term, 'gi')
    for (const m of text.matchAll(re)) {
      const line = text.slice(0, m.index).split('\n').length
      fail(`${rel}:${line}`, `termo da denylist — "${m[0]}"`)
    }
  }
}

/* -------------------------------------------------------------------- saída */

for (const w of warnings) console.warn(`aviso  ${w}`)

if (problems.length) {
  console.error(`\n${problems.length} problema(s):\n`)
  for (const p of problems) console.error(`  ✖ ${p}`)
  console.error('')
  process.exit(1)
}

console.log(
  `ok — ${skills.length} skills válidas (${skills.join(', ')})` +
    (deny.length ? ` · denylist com ${deny.length} termo(s)` : ' · denylist vazia')
)
