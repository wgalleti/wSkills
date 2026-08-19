#!/usr/bin/env node
// Servidor de protótipo — skill prototipo-api (wSkills).
// Zero dependências, Node >= 20. Rode:  node server.mjs [caminho/do/db.json]
//
// Fala o mesmo contrato do portal de destino (Django/DRF + dataProvider do
// frontend-kickstart): envelope { data, total, extras? }, params take/skip/
// ordering/search, trailing slash, erros no formato DRF em pt-BR.
// NÃO tem segurança real — é para protótipo local, nunca para produção.

import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const DB_PATH = path.resolve(process.argv[2] || 'db.json')
const PORT = Number(process.env.PORT || 8000)
const BASE = '/api'

if (!fs.existsSync(DB_PATH)) {
  console.error(`db não encontrado: ${DB_PATH}\nUse: node server.mjs caminho/do/db.json`)
  process.exit(1)
}

const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))
const schema = db._schema || {}

let saveTimer = null
function save() {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2) + '\n')
  }, 300)
}

// ---------------------------------------------------------------- respostas

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization,Content-Type',
}

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...CORS })
  res.end(body === undefined ? '' : JSON.stringify(body))
}

const naoEncontrado = (res) => json(res, 404, { detail: 'Não encontrado.' })

// ---------------------------------------------------------------- validação

// tipos aceitos no _schema: texto, decimal, inteiro, booleano, data, datahora,
// enum (opcoes), arquivo (guarda só o nome), referencia (entidade)
function validarCampo(def, valor, dados) {
  if (valor === null || valor === undefined || valor === '') return null
  switch (def.tipo) {
    case 'decimal':
    case 'inteiro':
      if (typeof valor !== 'number' || Number.isNaN(valor)) return 'Informe um número.'
      if (def.tipo === 'inteiro' && !Number.isInteger(valor)) return 'Informe um número inteiro.'
      return null
    case 'booleano':
      return typeof valor === 'boolean' ? null : 'Informe verdadeiro ou falso.'
    case 'data':
      return /^\d{4}-\d{2}-\d{2}$/.test(valor) ? null : 'Data inválida. Use o formato AAAA-MM-DD.'
    case 'datahora':
      return !Number.isNaN(Date.parse(valor)) ? null : 'Data e hora inválidas. Use o formato ISO.'
    case 'enum':
      return (def.opcoes || []).includes(valor)
        ? null
        : `Valor inválido. Opções: ${(def.opcoes || []).join(', ')}.`
    case 'referencia': {
      const alvo = db[def.entidade] || []
      return alvo.some((r) => r.id === valor) ? null : `Registro não encontrado em ${def.entidade}.`
    }
    default:
      return typeof valor === 'string' ? null : 'Informe um texto.'
  }
}

function validar(entidade, payload, { parcial = false } = {}) {
  const campos = schema[entidade]?.campos || {}
  const erros = {}
  const limpo = {}
  for (const [nome, def] of Object.entries(campos)) {
    const presente = Object.prototype.hasOwnProperty.call(payload, nome)
    const valor = payload[nome]
    const vazio = valor === null || valor === undefined || valor === ''
    if (!parcial && def.obrigatorio && vazio && def.padrao === undefined) {
      erros[nome] = ['Este campo é obrigatório.']
      continue
    }
    if (!presente) {
      if (!parcial && def.padrao !== undefined) limpo[nome] = def.padrao
      continue
    }
    const erro = validarCampo(def, valor, payload)
    if (erro) erros[nome] = [erro]
    else limpo[nome] = vazio && def.padrao !== undefined && !parcial ? def.padrao : valor
  }
  return { erros: Object.keys(erros).length ? erros : null, limpo }
}

// ---------------------------------------------------------------- listagem

function aplicarBusca(itens, entidade, termo) {
  const campos = schema[entidade]?.searchFields || []
  if (!termo || !campos.length) return itens
  const t = String(termo).toLowerCase()
  return itens.filter((r) =>
    campos.some((c) =>
      String(r[c] ?? '')
        .toLowerCase()
        .includes(t)
    )
  )
}

function aplicarFiltros(itens, entidade, params) {
  const campos = schema[entidade]?.campos || {}
  const reservados = new Set(['take', 'skip', 'ordering', 'search', 'extras'])
  let out = itens
  for (const [chave, bruto] of params.entries()) {
    if (reservados.has(chave) || !campos[chave]) continue
    let valor = bruto
    if (['decimal', 'inteiro'].includes(campos[chave].tipo)) valor = Number(bruto)
    if (campos[chave].tipo === 'booleano') valor = bruto === 'true'
    out = out.filter((r) => r[chave] === valor)
  }
  return out
}

function aplicarOrdenacao(itens, ordering) {
  if (!ordering) return itens
  const desc = ordering.startsWith('-')
  const campo = desc ? ordering.slice(1) : ordering
  return [...itens].sort((a, b) => {
    const va = a[campo]
    const vb = b[campo]
    const cmp =
      typeof va === 'number' && typeof vb === 'number'
        ? va - vb
        : String(va ?? '').localeCompare(String(vb ?? ''), 'pt-BR')
    return desc ? -cmp : cmp
  })
}

function calcularExtras(itens, entidade) {
  const defs = schema[entidade]?.extras || {}
  const out = {}
  for (const [nome, def] of Object.entries(defs)) {
    let base = itens
    for (const [campo, valor] of Object.entries(def.quando || {})) {
      base = base.filter((r) => r[campo] === valor)
    }
    out[nome] =
      def.op === 'sum' ? base.reduce((s, r) => s + (Number(r[def.campo]) || 0), 0) : base.length
  }
  return out
}

// ---------------------------------------------------------------- roteamento

function lerCorpo(req) {
  return new Promise((resolve) => {
    let corpo = ''
    req.on('data', (c) => (corpo += c))
    req.on('end', () => {
      try {
        resolve(corpo ? JSON.parse(corpo) : {})
      } catch {
        resolve(null)
      }
    })
  })
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204)

  const url = new URL(req.url, `http://localhost:${PORT}`)
  if (!url.pathname.startsWith(BASE + '/')) return naoEncontrado(res)
  const partes = url.pathname
    .slice(BASE.length + 1)
    .split('/')
    .filter(Boolean)

  // POST /api/auth/login/ — auth de mentira: aceita qualquer credencial
  if (partes[0] === 'auth' && partes[1] === 'login' && req.method === 'POST') {
    return json(res, 200, { token: `prototipo-${crypto.randomUUID()}` })
  }

  const [entidade, sub] = partes
  if (!schema[entidade]) return naoEncontrado(res)
  if (!url.pathname.endsWith('/') && req.method !== 'POST') {
    return json(res, 404, { detail: 'Não encontrado. As URLs terminam com "/".' })
  }
  db[entidade] ||= []
  const registros = db[entidade]
  const campos = schema[entidade].campos || {}

  // GET /api/<recurso>/<campo-enum>/ — opções do enum
  if (req.method === 'GET' && sub && campos[sub]?.tipo === 'enum') {
    return json(
      res,
      200,
      (campos[sub].opcoes || []).map((v) => ({ value: v, label: v }))
    )
  }

  // coleção
  if (!sub) {
    if (req.method === 'GET') {
      let itens = aplicarFiltros(registros, entidade, url.searchParams)
      itens = aplicarBusca(itens, entidade, url.searchParams.get('search'))
      itens = aplicarOrdenacao(itens, url.searchParams.get('ordering'))
      const total = itens.length
      const skip = Number(url.searchParams.get('skip') || 0)
      const take = Number(url.searchParams.get('take') || 0)
      const pagina = take > 0 ? itens.slice(skip, skip + take) : itens.slice(skip)
      const corpo = { data: pagina, total }
      if (url.searchParams.has('extras')) corpo.extras = calcularExtras(itens, entidade)
      return json(res, 200, corpo)
    }
    if (req.method === 'POST') {
      const payload = await lerCorpo(req)
      if (!payload) return json(res, 400, { detail: 'JSON inválido.' })
      const { erros, limpo } = validar(entidade, payload)
      if (erros) return json(res, 400, erros)
      const agora = new Date().toISOString()
      const novo = { id: crypto.randomUUID(), ...limpo, criado_em: agora, atualizado_em: agora }
      registros.push(novo)
      save()
      return json(res, 201, novo)
    }
    return json(res, 405, { detail: 'Método não permitido.' })
  }

  // item
  const idx = registros.findIndex((r) => r.id === sub)
  if (idx === -1) return naoEncontrado(res)
  if (req.method === 'GET') return json(res, 200, registros[idx])
  if (req.method === 'PATCH' || req.method === 'PUT') {
    const payload = await lerCorpo(req)
    if (!payload) return json(res, 400, { detail: 'JSON inválido.' })
    const { erros, limpo } = validar(entidade, payload, { parcial: req.method === 'PATCH' })
    if (erros) return json(res, 400, erros)
    registros[idx] = { ...registros[idx], ...limpo, atualizado_em: new Date().toISOString() }
    save()
    return json(res, 200, registros[idx])
  }
  if (req.method === 'DELETE') {
    registros.splice(idx, 1)
    save()
    return json(res, 204)
  }
  return json(res, 405, { detail: 'Método não permitido.' })
})

server.listen(PORT, () => {
  const recursos = Object.keys(schema).map((e) => `${BASE}/${e}/`)
  console.log(`API de protótipo em http://localhost:${PORT}${BASE}`)
  console.log(`db: ${DB_PATH}`)
  for (const r of recursos) console.log(`  ${r}`)
})
