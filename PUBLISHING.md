# Publicando no npm

Pacote: **`@wgalleti/wskills`** — publicado manualmente (sem CI), como a suite
`@wgalleti/primevue-components`.

## Pré-requisitos (uma vez)

1. Conta npm com acesso ao escopo `@wgalleti`.
2. Login local:
   ```bash
   npm login
   ```
3. Confirme quem está logado:
   ```bash
   npm whoami
   ```
4. Dependências de release (`commit-and-tag-version`, `prettier`):
   ```bash
   yarn install
   ```

## Fluxo de release

O bump gera CHANGELOG, commit e tag a partir dos **conventional commits** — mas
**não publica**. A publicação é um segundo comando, explícito.

```bash
# Correção de texto/CLI → 0.1.0 -> 0.1.1
yarn release:patch

# Skill nova ou funcionalidade retrocompatível → 0.1.0 -> 0.2.0
yarn release:minor

# Skill removida/renomeada ou quebra do CLI → 0.1.0 -> 1.0.0
yarn release:major

# Conferir o que sairia, sem escrever nada
yarn release:dry
```

Depois, publique e envie commit + tag:

```bash
yarn release:publish     # npm publish + git push --follow-tags origin main
```

`prepublishOnly` roda `validate` + `smoke` — um publish nunca sai com skill inválida
ou CLI quebrado.

## Verificações antes de publicar

- `package.json` **não** tem `"private": true`.
- `publishConfig.access` está como `"public"` (escopo publica como público).
- Só `bin/`, `skills/` e `scripts/validate.mjs` entram no pacote (campo `files`).
- Confira o conteúdo do tarball:
  ```bash
  npm pack --dry-run
  ```
- Teste a instalação a partir do tarball, num diretório qualquer:
  ```bash
  npm pack
  npx -y ./wgalleti-wskills-0.1.0.tgz list
  ```

## Troubleshooting

### `ENEEDAUTH` apontando para `registry.yarnpkg.com`

Ao rodar `npm publish` **dentro de um script do yarn**, o yarn injeta
`npm_config_registry=https://registry.yarnpkg.com` no ambiente — um proxy somente-leitura,
onde a publicação falha com `ENEEDAUTH`. Por isso o script força o registry correto:

```
npm publish --registry https://registry.npmjs.org/
```

O `package.json` também declara `publishConfig.registry`. Publicando na mão sob o yarn, use
sempre a flag `--registry https://registry.npmjs.org/`.

### O npm pede OTP (2FA)

A conta tem 2FA: o `npm publish` é interativo e pede o código. **Um agente não publica** —
quem tem o OTP roda `yarn release:publish`.

### Re-publicar uma versão cujo publish falhou

Se o `release:*` bumpou a versão e criou a tag, mas o `npm publish` falhou, **não bumpe de
novo**. Republique a versão atual:

```bash
yarn release:publish
```

## Versionamento (SemVer)

| Mudança                                        | Bump  | Exemplo       |
| ---------------------------------------------- | ----- | ------------- |
| Ajuste de texto de uma skill, correção no CLI  | patch | 0.1.0 → 0.1.1 |
| Skill nova, comando novo, seção nova           | minor | 0.1.0 → 0.2.0 |
| Skill removida/renomeada, flag do CLI removida | major | 0.1.0 → 1.0.0 |

> Renomear uma skill quebra quem já instalou (a pasta antiga fica órfã no `.claude/skills`) —
> trate como major e anote no CHANGELOG o que renomeou para quê.
