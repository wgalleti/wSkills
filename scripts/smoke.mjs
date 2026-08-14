#!/usr/bin/env node
/**
 * Smoke test do CLI — instala o catálogo inteiro numa pasta temporária e confere o
 * ciclo add → status → edição local → update → remove. Sem framework de teste: roda no
 * CI e no `prepublishOnly`, então precisa funcionar sem `node_modules`.
 */
import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CLI = path.join(ROOT, 'bin', 'wskills.mjs')
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wskills-smoke-'))
const target = path.join(tmp, '.claude', 'skills')

let failures = 0
const check = (label, cond) => {
  console.log(`  ${cond ? '✓' : '✖'} ${label}`)
  if (!cond) failures++
}
/** Roda o CLI e devolve stdout+stderr — avisos como "pulei ..." saem em stderr. */
const run = (...args) => {
  const r = spawnSync(process.execPath, [CLI, ...args, '--dir', target], { encoding: 'utf8' })
  if (r.status !== 0) throw new Error(`CLI falhou (${args.join(' ')}): ${r.stderr}`)
  return `${r.stdout}${r.stderr}`
}

try {
  console.log(`smoke em ${tmp}\n`)

  const ids = JSON.parse(
    execFileSync(process.execPath, [CLI, 'list', '--json'], { encoding: 'utf8' })
  ).map((s) => s.id)
  check(`catálogo com skills (${ids.length})`, ids.length > 0)

  run('add', '--all')
  check(
    'todas as pastas instaladas',
    ids.every((id) => fs.existsSync(path.join(target, id, 'SKILL.md')))
  )
  check('manifesto criado', fs.existsSync(path.join(target, '.wskills.json')))

  const manifest = JSON.parse(fs.readFileSync(path.join(target, '.wskills.json'), 'utf8'))
  check('manifesto registra todas as skills', Object.keys(manifest.skills).length === ids.length)

  const status = JSON.parse(run('status', '--json'))
  check(
    'status limpo depois de instalar',
    status.skills.length === ids.length && status.skills.every((s) => s.state === 'ok')
  )

  const again = run('add', ids[0])
  check('reinstalar sem mudança é no-op', again.includes('igual'))

  // Edição local precisa ser detectada e preservada sem --force.
  const edited = path.join(target, ids[0], 'SKILL.md')
  fs.appendFileSync(edited, '\n<!-- edição local -->\n')
  const refused = run('add', ids[0])
  check('add recusa sobrescrever skill editada', refused.includes('editado localmente'))
  check(
    'edição local preservada',
    fs.readFileSync(edited, 'utf8').includes('<!-- edição local -->')
  )
  check(
    'status acusa edição local',
    JSON.parse(run('status', '--json')).skills.find((s) => s.id === ids[0])?.state ===
      'editada localmente'
  )

  run('update', ids[0])
  check(
    'update sobrescreve a edição local',
    !fs.readFileSync(edited, 'utf8').includes('<!-- edição local -->')
  )

  run('remove', ids[0])
  check('remove apaga a pasta', !fs.existsSync(path.join(target, ids[0])))
  check(
    'remove atualiza o manifesto',
    !JSON.parse(fs.readFileSync(path.join(target, '.wskills.json'), 'utf8')).skills[ids[0]]
  )

  const dry = run('add', ids[0], '--dry-run')
  check('dry-run não escreve', dry.includes('dry-run') && !fs.existsSync(path.join(target, ids[0])))
} finally {
  fs.rmSync(tmp, { recursive: true, force: true })
}

if (failures) {
  console.error(`\n${failures} verificação(ões) falharam`)
  process.exit(1)
}
console.log('\nok — CLI funcionando de ponta a ponta')
