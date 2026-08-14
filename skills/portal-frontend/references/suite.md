# Contribuir na suite `@wgalleti/primevue-components`

A suite é a **UI base** do app: PrimeVue 4 unstyled + Tailwind passthrough, TypeScript strict,
build Vite em library mode. Ela é um repositório à parte, clonado ao lado do app — ajuste o
caminho abaixo para o do seu ambiente (`$SUITE`).

> Mantenha em `web/COMPONENTS.md` (ou equivalente) a **lista viva do que falta** na suite e por
> isso está sendo improvisado no app. É essa lista que vira backlog de contribuição.

## Quando vai para a suite (e não para o app)

| Situação                                                                | Onde                          |
| ----------------------------------------------------------------------- | ----------------------------- |
| Componente **recorrente entre projetos** que não existe lá              | **suite**                     |
| A mesma combinação de props se repete em várias telas                   | **suite** (vira prop/default) |
| Comportamento base faltando (estado vazio, locale, teclado, formatação) | **suite**                     |
| Regra/visual **específico do seu domínio** (status, relatório, cálculo) | **app**                       |
| Composição de componentes existentes para uma tela                      | **app**                       |

Na dúvida: se outro projeto teria o mesmo problema, é suite.

**Nunca** editar `node_modules/@wgalleti/primevue-components` — nem "só para testar". A
alteração some no próximo install e some do histórico.

## Estrutura da lib

```
src/
├── index.ts            # re-export público (composables + components + types)
├── plugin.ts           # install() do Vue plugin
├── types/              # ColumnDef, FieldDef, RowAction, KpiItem, CrudManagerConfig, api…
├── composables/        # useCrudManager, useApi, useAppToast, useAppConfirm, useApiError,
│                       # useFormatters, useDateInput, useFormKeyboardNav, defineCrudConfig
├── components/
│   ├── crud/           # WCrudView, WCrudFormDialog, WCrudColumnRenderer
│   ├── form/           # WAutoCompleteFK, WFormRenderer, WDatePicker, WDateRange,
│   │                   # WMoneyInput, WTransferList, WFileUpload, WImageCropper
│   └── ui/             # WPageHeader, WSectionHeader, WFormSection, WActionBar, WKpiGrid,
│                       # WKpiCard, WInfoCard, WStatusTag, WEmptyState, WProgressFlow,
│                       # WDetailHeader
└── utils/              # dates.ts, masks.ts
```

Duas fontes de metadata, não confunda:

- **`X.meta.ts` ao lado do componente** — sidecar escrito à mão: `category`, `icon`, `summary`,
  exemplos. Crie/atualize junto com o componente.
- **`src/generated/component-meta.json`** — **gerado** de props/events/slots/defaults e do JSDoc
  do SFC (`yarn meta`, via `vue-component-meta`). Nunca edite à mão; documente escrevendo JSDoc
  nas props. `yarn meta:check` falha se estiver desatualizado.

Os docs em VitePress consomem esse manifest. O diretório `skill/` da lib é a origem da skill
`wpvc` — atualize-o quando mudar a API pública.

## Convenções

- `<script setup lang="ts">`; props/emits tipados (`defineProps<{}>()` / `defineEmits<{}>()`),
  **sem `any`** (use `unknown` + narrowing).
- Componente = prefixo `W` + PascalCase; composable = `useXxx<T>()`; type = PascalCase sem prefixo.
- **Slot para override de qualquer seção visual** e **defaults sensatos** — o componente tem que
  funcionar com configuração mínima.
- Sem estado global no componente: o estado vem do composable, por props.
- Axios **injetado** (`inject('w-axios')`), nunca instanciado dentro.
- Sem `useStyle()` do PrimeVue — estilo é do projeto consumidor (a lib é unstyled).
- Exports nomeados em todo `index.ts` (tree-shaking). Sem wildcard export.
- Resposta paginada esperada: `{ data, page, page_size, rows }`; erro no formato DRF.

## Fluxo de trabalho

```bash
cd "$SUITE"       # repositório da suite, clonado ao lado do app
yarn install
yarn dev          # playground
yarn meta         # regenera src/generated/component-meta.json
yarn test         # vitest run
yarn type-check
yarn build
```

1. Implementar em `src/…`, com JSDoc nas props, `.meta.ts` sidecar e export no `index.ts` da pasta.
2. Teste (Vitest) quando houver lógica — os testes de `useCrudManager`, `useFormatters`,
   `useApiError` e `useDateInput` são o modelo.
3. `yarn meta && yarn type-check && yarn test && yarn build`.
4. Commit (conventional commits — alimentam o CHANGELOG) e bump/tag: `yarn release:patch`
   (bug), `release:minor` (funcionalidade retrocompatível) ou `release:major` (quebra de API).
   Esses scripts usam `commit-and-tag-version`: geram CHANGELOG, commit e tag — **não publicam**.
5. **Quem publica é o mantenedor do pacote** (`yarn release:publish` = `npm publish` +
   `git push --follow-tags`): o npm tem 2FA e o OTP é dele. Um agente não deve tentar publicar.
6. Só depois: `yarn add @wgalleti/primevue-components@X.Y.Z` no app e usar.

`prepublishOnly` roda `type-check → test → build`, então um publish nunca sai de código quebrado.

> ⚠️ Se o `PUBLISHING.md` da suite divergir dos scripts, **o `package.json` manda** — a doc
> costuma descrever um fluxo anterior.

## Desenvolvendo suite e app ao mesmo tempo

Use `yarn link` e mova `@wgalleti/primevue-components` do `optimizeDeps.include` para o
`exclude` no `vite.config.js` do app: no `include`, o esbuild congela o `dist/` da primeira
subida em `node_modules/.vite` e nenhuma correção aparece no `yarn dev` sem limpar o cache.
Continua valendo: **nunca** editar dentro de `node_modules`.
