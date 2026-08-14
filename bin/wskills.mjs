#!/usr/bin/env node
/**
 * wskills — instala skills de Claude Code a partir deste pacote.
 *
 * Sem dependências de runtime de propósito: `npx @wgalleti/wskills add <skill>` precisa
 * funcionar num repositório recém-clonado, sem install prévio.
 */
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SKILLS_DIR = path.join(PKG_ROOT, 'skills')
const MANIFEST = '.wskills.json'
const PKG = JSON.parse(fs.readFileSync(path.join(PKG_ROOT, 'package.json'), 'utf8'))

/* ---------------------------------------------------------------- utilidades */

const c = process.stdout.isTTY
  ? {
      dim: (s) => `\x1b[2m${s}\x1b[0m`,
      bold: (s) => `\x1b[1m${s}\x1b[0m`,
      green: (s) => `\x1b[32m${s}\x1b[0m`,
      yellow: (s) => `\x1b[33m${s}\x1b[0m`,
      red: (s) => `\x1b[31m${s}\x1b[0m`,
      cyan: (s) => `\x1b[36m${s}\x1b[0m`,
    }
  : new Proxy({}, { get: () => (s) => s })

function die(msg) {
  console.error(`${c.red('erro')} ${msg}`)
  process.exit(1)
}

/** Frontmatter YAML simples: `chave: valor`, com continuação indentada. */
function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) return {}
  const out = {}
  let key = null
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s?(.*)$/)
    if (kv) {
      key = kv[1]
      out[key] = kv[2]
    } else if (key && line.trim()) {
      out[key] += ` ${line.trim()}`
    }
  }
  for (const k of Object.keys(out)) {
    out[k] = out[k].trim().replace(/^["'](.*)["']$/s, '$1')
  }
  return out
}

function listFiles(dir, base = dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...listFiles(full, base))
    else if (entry.name !== MANIFEST) out.push(path.relative(base, full))
  }
  return out.sort()
}

/** Impressão digital do conteúdo de uma pasta de skill (detecta edição local). */
function fingerprint(dir) {
  const h = createHash('sha256')
  for (const rel of listFiles(dir)) {
    h.update(rel)
    h.update(fs.readFileSync(path.join(dir, rel)))
  }
  return h.digest('hex').slice(0, 16)
}

export function catalog() {
  if (!fs.existsSync(SKILLS_DIR)) return []
  return fs
    .readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => {
      const dir = path.join(SKILLS_DIR, e.name)
      const skillFile = path.join(dir, 'SKILL.md')
      const fm = fs.existsSync(skillFile)
        ? parseFrontmatter(fs.readFileSync(skillFile, 'utf8'))
        : {}
      return {
        id: e.name,
        dir,
        name: fm.name ?? e.name,
        description: fm.description ?? '',
        files: fs.existsSync(skillFile) ? listFiles(dir) : [],
      }
    })
    .sort((a, b) => a.id.localeCompare(b.id))
}

function resolveTarget(flags) {
  if (flags.dir) return path.resolve(flags.dir)
  if (flags.global) return path.join(os.homedir(), '.claude', 'skills')
  return path.resolve(process.cwd(), '.claude', 'skills')
}

function readManifest(target) {
  const file = path.join(target, MANIFEST)
  if (!fs.existsSync(file)) return { source: PKG.name, skills: {} }
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'))
    return { source: PKG.name, ...data, skills: data.skills ?? {} }
  } catch {
    return { source: PKG.name, skills: {} }
  }
}

function writeManifest(target, manifest, flags) {
  if (flags['dry-run']) return
  manifest.updatedAt = new Date().toISOString()
  fs.writeFileSync(path.join(target, MANIFEST), `${JSON.stringify(manifest, null, 2)}\n`)
}

function firstSentence(text, max = 110) {
  const s = String(text).split(/(?<=\.)\s/)[0] ?? ''
  return s.length > max ? `${s.slice(0, max - 1)}…` : s
}

/* ------------------------------------------------------------------ comandos */

function cmdList(_args, flags) {
  const items = catalog()
  if (flags.json)
    return console.log(
      JSON.stringify(
        items.map(({ dir, ...r }) => r),
        null,
        2
      )
    )
  console.log(`\n${c.bold(`${PKG.name}@${PKG.version}`)} — ${items.length} skills\n`)
  for (const s of items) {
    console.log(`  ${c.cyan(s.id.padEnd(20))} ${c.dim(firstSentence(s.description))}`)
  }
  console.log(
    `\n${c.dim('instalar:')} npx ${PKG.name} add <skill>   ${c.dim('· detalhes:')} npx ${PKG.name} info <skill>\n`
  )
}

function cmdInfo(args) {
  const id = args[0] || die('informe a skill: wskills info <skill>')
  const skill = catalog().find((s) => s.id === id) || die(`skill desconhecida: ${id}`)
  console.log(`\n${c.bold(skill.id)}  ${c.dim(`(${skill.files.length} arquivos)`)}\n`)
  console.log(`${skill.description}\n`)
  for (const f of skill.files) console.log(`  ${c.dim('·')} ${f}`)
  console.log()
}

function cmdAdd(args, flags) {
  const items = catalog()
  const ids = flags.all ? items.map((s) => s.id) : args
  if (!ids.length) die('informe ao menos uma skill (ou use --all). Veja: wskills list')

  const target = resolveTarget(flags)
  const manifest = readManifest(target)
  let changed = false

  for (const id of ids) {
    const skill = items.find((s) => s.id === id)
    if (!skill) {
      console.error(`${c.yellow('pulei')} ${id} — skill desconhecida`)
      continue
    }
    const dest = path.join(target, id)
    if (fs.existsSync(dest) && !flags.force) {
      const local = fingerprint(dest)
      const known = manifest.skills[id]?.checksum
      if (local === fingerprint(skill.dir)) {
        console.log(`${c.dim('igual')} ${id} — já está na versão deste pacote`)
        continue
      }
      if (known && known !== local) {
        console.error(
          `${c.yellow('pulei')} ${id} — existe e foi ${c.bold('editado localmente')}. ` +
            `Use --force para sobrescrever.`
        )
        continue
      }
      if (!known) {
        console.error(
          `${c.yellow('pulei')} ${id} — já existe e não foi instalado por aqui. Use --force.`
        )
        continue
      }
    }

    if (flags['dry-run']) {
      console.log(
        `${c.dim('dry-run')} instalaria ${id} → ${path.relative(process.cwd(), dest) || dest}`
      )
      continue
    }

    fs.mkdirSync(target, { recursive: true })
    fs.rmSync(dest, { recursive: true, force: true })
    fs.cpSync(skill.dir, dest, { recursive: true })
    manifest.skills[id] = {
      version: PKG.version,
      checksum: fingerprint(dest),
      installedAt: new Date().toISOString(),
    }
    changed = true
    console.log(`${c.green('ok')} ${id} → ${path.relative(process.cwd(), dest) || dest}`)
  }

  if (changed) {
    manifest.version = PKG.version
    writeManifest(target, manifest, flags)
    console.log(
      `\n${c.dim('Reinicie a sessão do Claude Code (ou rode /skills) para as skills aparecerem.')}\n`
    )
  }
}

function cmdUpdate(args, flags) {
  const target = resolveTarget(flags)
  const manifest = readManifest(target)
  const ids = args.length ? args : Object.keys(manifest.skills)
  if (!ids.length) die(`nada instalado em ${target}`)
  cmdAdd(ids, { ...flags, force: flags.force ?? true })
}

function cmdRemove(args, flags) {
  if (!args.length) die('informe ao menos uma skill')
  const target = resolveTarget(flags)
  const manifest = readManifest(target)
  for (const id of args) {
    const dest = path.join(target, id)
    if (!fs.existsSync(dest)) {
      console.error(`${c.yellow('pulei')} ${id} — não está instalada`)
      continue
    }
    if (flags['dry-run']) {
      console.log(`${c.dim('dry-run')} removeria ${dest}`)
      continue
    }
    fs.rmSync(dest, { recursive: true, force: true })
    delete manifest.skills[id]
    console.log(`${c.green('ok')} removida ${id}`)
  }
  writeManifest(target, manifest, flags)
}

function cmdStatus(_args, flags) {
  const target = resolveTarget(flags)
  const manifest = readManifest(target)
  const items = catalog()
  const rows = Object.entries(manifest.skills).map(([id, meta]) => {
    const dest = path.join(target, id)
    const source = items.find((s) => s.id === id)
    let state = 'ok'
    if (!fs.existsSync(dest)) state = 'ausente'
    else if (fingerprint(dest) !== meta.checksum) state = 'editada localmente'
    else if (source && fingerprint(source.dir) !== meta.checksum) state = 'desatualizada'
    return { id, version: meta.version, state }
  })

  if (flags.json) return console.log(JSON.stringify({ target, skills: rows }, null, 2))
  console.log(`\n${c.bold(target)}`)
  if (!rows.length) return console.log(`${c.dim('  nenhuma skill instalada por aqui')}\n`)
  for (const r of rows) {
    const paint = { ok: c.green, desatualizada: c.yellow }[r.state] ?? c.red
    console.log(
      `  ${c.cyan(r.id.padEnd(20))} ${c.dim(`v${r.version}`.padEnd(10))} ${paint(r.state)}`
    )
  }
  console.log(`\n${c.dim(`pacote local: ${PKG.name}@${PKG.version}`)}\n`)
}

function cmdHelp() {
  console.log(`
${c.bold(`${PKG.name}@${PKG.version}`)} — skills de Claude Code, instaláveis

${c.bold('uso')}
  npx ${PKG.name} <comando> [skills...] [flags]

${c.bold('comandos')}
  list                      lista as skills disponíveis
  info <skill>              descrição completa e arquivos da skill
  add <skill...>            instala em ./.claude/skills
  update [skill...]         reinstala (sobrescreve) as skills registradas
  remove <skill...>         remove skills instaladas
  status                    o que está instalado, versão e divergências

${c.bold('flags')}
  -g, --global              instala em ~/.claude/skills (vale em todos os projetos)
      --dir <caminho>       diretório alvo (default: ./.claude/skills)
      --all                 todas as skills do catálogo
  -f, --force               sobrescreve skill existente (inclusive editada)
      --dry-run             mostra o que faria, sem escrever
      --json                saída JSON (list, status)
  -v, --version             versão do pacote
  -h, --help                esta ajuda

${c.bold('exemplos')}
  npx ${PKG.name} list
  npx ${PKG.name} add frontend-kickstart
  npx ${PKG.name} add mr wpvc --global
  npx ${PKG.name} update
`)
}

/* --------------------------------------------------------------------- parse */

function parseArgv(argv) {
  const args = []
  const flags = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--dir') flags.dir = argv[++i]
    else if (a.startsWith('--')) flags[a.slice(2)] = true
    else if (a.startsWith('-') && a.length > 1) {
      for (const ch of a.slice(1)) {
        flags[{ g: 'global', f: 'force', h: 'help', v: 'version' }[ch] ?? ch] = true
      }
    } else args.push(a)
  }
  return { args, flags }
}

const { args, flags } = parseArgv(process.argv.slice(2))
const [command = 'help', ...rest] = args

if (flags.version) console.log(PKG.version)
else if (flags.help || command === 'help') cmdHelp()
else {
  const commands = {
    list: cmdList,
    ls: cmdList,
    info: cmdInfo,
    show: cmdInfo,
    add: cmdAdd,
    install: cmdAdd,
    update: cmdUpdate,
    upgrade: cmdUpdate,
    remove: cmdRemove,
    rm: cmdRemove,
    uninstall: cmdRemove,
    status: cmdStatus,
  }
  const fn = commands[command]
  if (!fn) die(`comando desconhecido: ${command} (use --help)`)
  fn(rest, flags)
}
