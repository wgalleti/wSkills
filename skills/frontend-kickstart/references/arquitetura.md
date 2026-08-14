# Arquitetura e receitas de tela

## 1. Camadas

```
data/ (dataProvider + endpoints + useResource)   ← única camada que fala com a API
  → composable/ (lógica de domínio)
    → schemas/ (ColumnDef[] / FieldDef[] — dados puros, zero Vue)
      → components/ (domínio) + pages/ (rotas)

stores/ (Pinia) apenas transversal: auth · theme · contexto global
```

- **`data/`** — `dataProvider` é o único lugar que conhece o formato do servidor
  (paginação, envelope da resposta). `endpoints.js` é o mapa único de URLs: **todo módulo
  novo registra suas URLs ali**, e nenhuma tela escreve caminho literal. `useResource`
  cacheia listas de apoio (dropdown, FK) por endpoint.
- **`composable/`** — lógica por domínio. Chama o `dataProvider`, **nunca** axios direto.
  Antes de escrever helper novo, procure o que já existe.
- **`schemas/`** — descrição da entidade: colunas, campos, labels e `transformPayload`.
  Puro JS. O **mesmo** schema alimenta três contextos: a tabela + dialog do CRUD, o form
  standalone e o CRUD inline de um campo FK.
- **`components/`** — só domínio e composição, feitos **de** componentes da suite.
- **`lib/`** — utilitários puros (formatação de número/data, helpers de toast).
- **`pages/`** — views de rota, espelhando a árvore de navegação.

## 2. Proibições de arquitetura

- ❌ `import axios` numa tela ou composable — vem do plugin/dataProvider.
- ❌ Camada `repositories/` paralela ao `dataProvider`.
- ❌ Estado de CRUD em store Pinia — vive no composable da tela.
- ❌ Pasta `components/ui/` genérica dentro do app (shadcn e afins). UI base é a suite.
- ❌ Componente de UI genérico criado no app — vai para a suite (§5).
- ❌ Conhecimento de sistema externo (ERP, gateway) espalhado pelo domínio: isso é uma
  camada de integração dedicada, com um adaptador por sistema.

## 3. Árvore de decisão: tela nova

Responda **nesta ordem**. Não pule para o markup.

```
1. Que padrão de tela é? (design.md §5 — são 7, escolha um)
   └ nenhum encaixa? → o escopo está errado. Quebre em duas telas.
2. Existe schema da entidade em src/schemas/{domínio}/?
   └ não → crie PRIMEIRO: ColumnDef[] + FieldDef[] + labels + transformPayload.
3. Existe componente da suite que resolve?
   ├ sim → use com configuração MÍNIMA; slot só para override pontual.
   └ não → §5. NÃO comece a escrever CSS.
4. Registre: endpoints → schema → composable → page → router → navigation → breadcrumb
```

### 3.1 Receita — Lista / CRUD

Tela completa. **Este é o piso de qualidade: 20-50 linhas.**

```vue
<!-- src/pages/cadastros/fornecedores/index.vue -->
<template>
  <WCrudView
    :crud="crud"
    title="Fornecedores"
    subtitle="Gerencie os fornecedores cadastrados no sistema"
    dialog-width="520px"
    csv-filename="fornecedores.csv"
    show-kpi
    kpi-icon="pi pi-users"
    kpi-label="Fornecedores"
  />
</template>

<script setup>
import { WCrudView } from '@wgalleti/primevue-components'
import { useAppCrud } from '@/composable/useAppCrud'
import {
  fornecedorEndpoint,
  fornecedorColumns,
  fornecedorForm,
  fornecedorLabels,
  transformFornecedorPayload,
} from '@/schemas/cadastros'

const crud = useAppCrud({
  endpoint: fornecedorEndpoint,
  columns: fornecedorColumns,
  form: fornecedorForm,
  labels: fornecedorLabels,
  transformPayload: transformFornecedorPayload,
})
</script>
```

Vem de graça: tabela paginada, busca, ordenação, visão cards, dialog de
create/edit/duplicate, confirm de exclusão, toast, export CSV, ações de linha, menu de
contexto e Enter navegando o form.

**`useAppCrud` é um wrapper fino** do `useCrudManager` da suite, criado no app para ligar
opções que devem valer em **toda** tela (navegação por teclado, defaults de página, toast
padrão). Crie o seu no dia 1 e **sempre use o wrapper, nunca o manager direto** — é assim
que uma decisão nova entra em todas as telas de uma vez.

### 3.2 Receita — Schema

```js
// src/schemas/cadastros/fornecedor.js — dados puros, zero Vue
import { ENDPOINTS } from '@/data'
import { formatDate } from './formatters'

export const fornecedorEndpoint = ENDPOINTS.fornecedores

export const fornecedorColumns = [
  { field: 'nome', header: 'Nome', sortable: true },
  { field: 'email', header: 'Email' },
  { field: 'documento', header: 'Documento' },
  { field: 'ativo', header: 'Ativo', type: 'boolean', align: 'center' },
  { field: 'criado_em', header: 'Criado em', format: formatDate },
]

export const fornecedorForm = [
  {
    field: 'nome',
    label: 'Nome do Fornecedor',
    required: true,
    autofocus: 'create',
    placeholder: 'Ex: João Silva',
    validate: (v) =>
      String(v || '').trim().length < 2 ? 'Nome deve ter pelo menos 2 caracteres' : null,
  },
  {
    field: 'documento',
    label: 'Documento (CPF/CNPJ)',
    type: 'cpf_cnpj',
    required: true,
    colSpan: 0.5,
  },
  { field: 'email', label: 'Email', type: 'email', colSpan: 0.5 },
  { field: 'ativo', label: 'Ativo', type: 'switch', defaultValue: true },
]

export const fornecedorLabels = {
  createTitle: 'Novo Fornecedor',
  editTitle: 'Editar Fornecedor',
  searchPlaceholder: 'Buscar por nome, email ou documento...',
  emptyMessage: 'Nenhum fornecedor cadastrado',
  deleteConfirmMessage: 'Tem certeza que deseja excluir este fornecedor?',
  successCreate: 'Fornecedor criado com sucesso',
  successUpdate: 'Fornecedor atualizado com sucesso',
  successDelete: 'Fornecedor excluído com sucesso',
}

// Normaliza só o que ESTÁ no payload — correto no create (completo) e no PATCH (diff)
export const transformFornecedorPayload = (payload) => {
  const out = { ...payload }
  if ('nome' in out) out.nome = String(out.nome || '').trim()
  if ('email' in out) out.email = out.email || null
  return out
}
```

**Filtro por coluna: decida cedo e valha para o app inteiro.** No portal a filtragem é pela
**busca por query** que o backend resolve — campo de filtro solto acima da tabela duplica a
busca e polui a tela. Precisa restringir por um eixo fixo (unidade, período, FK-pai)? Isso é
`filterParams`, não coluna.

### 3.3 Receita — Editor master-detail

```vue
<template>
  <div :style="{ display: 'flex', flexDirection: 'column', gap: 'var(--section-gap)' }">
    <WPageHeader :title="`NF ${form.numero || 'nova'}`" :subtitle="subtitulo">
      <template #actions>
        <WStatusTag :value="form.status || 'RASCUNHO'" :map="notaFiscalStatusMap" />
      </template>
    </WPageHeader>

    <WFormSection title="Dados da nota" description="Informações básicas">
      <WFormRenderer
        :fields="notaFiscalHeaderForm"
        :form-data="form"
        :is-editing="!isCreating"
        :columns="3"
        @update:field="(f, v) => (form[f] = v)"
      />
    </WFormSection>

    <!-- detail: CRUD escopado ao master -->
    <WCrudView v-if="!isCreating" :crud="itemsCrud" title="Itens da nota" dialog-width="720px" />

    <!-- ÚNICO par de ações da tela -->
    <WActionBar align="between">
      <template #primary
        ><Button label="Cancelar" severity="secondary" outlined @click="cancel"
      /></template>
      <template #secondary
        ><Button label="Salvar" icon="pi pi-save" :disabled="!isValid || loading" @click="save"
      /></template>
    </WActionBar>
  </div>
</template>
```

Regras do editor:

- Cabeçalho = componente de cabeçalho + tag de status. **Nunca** `h1` com utilitário de tamanho.
- **Um** par salvar/cancelar, no rodapé. Nunca repetir no topo.
- **Sem breadcrumb local** — quem renderiza a trilha é o layout.
- Detail = CRUD com `filterParams: () => ({ nota_fiscal: id })` e `createDefaults` para a FK-pai.
- Flag "não salvo" visível quando houver mudança pendente no master ou no detail.
- Salvar/excluir no detail recarrega o master (totais).

### 3.4 Receita — Formulário fora de dialog

```vue
<WFormSection title="Dados do lote">
  <WFormRenderer :fields="loteForm" :form-data="form" :is-editing="isEditing" :columns="3"
                 @update:field="(f, v) => (form[f] = v)" />
</WFormSection>
```

Nunca componha `label` + input + `small` à mão. Falta um tipo de campo? Ele vira um tipo
novo **na suite**, não um input avulso na tela.

### 3.5 Navegação por Enter — obrigatório

CRUD ganha de graça pelo wrapper. Form manual usa o composable de navegação:

```js
const { focusFirst, handleKeydown } = useEnterNav(containerRef, { onSubmit: save })
// <div ref="containerRef" @keydown="handleKeydown">  ·  focusFirst() ao abrir
```

Botão auxiliar (cancelar, gatilho de dropdown) leva um marcador de "pular" + `tabindex="-1"`.
**Não reimplemente foco/Enter na mão em cada tela.**

### 3.6 Datas

Componente de data da suite com `v-model` **string `YYYY-MM-DD`** (timezone-safe).
❌ **Proibido** `parseDate` / `toISOString` copiado entre telas — é bug off-by-one garantido
em fuso negativo. Locale pt-BR do dayjs global no `main.js`, com `dayjs` no `resolve.dedupe`.

### 3.7 Breadcrumb — obrigatório em toda view nova

É o item mais esquecido: sem ele a tela abre sem trilha e o usuário perde a noção de onde
está. A trilha é **renderizada pelo layout** — nunca um breadcrumb local na página — mas o
que você edita é um **mapa de rotas** (`components/layout/breadcrumb-map.js`):

```js
// rota simples: chave = path exato
'/rastreio/lotes': { title: 'Rastreio de lotes', parent: 'Estoque' },

// detalhe/editor (rota com :id): indexado pelo NOME da rota
// [grupo, rótulo da lista, path da lista, folha padrão]
'rastreio-lote-timeline': ['Estoque', 'Rastreio de lotes', '/rastreio/lotes', 'Linha do tempo'],
```

**A folha identifica o registro aberto**, não diz "Editar". Informe assim que o dado chegar
(ele chega depois da montagem) e limpe ao sair da tela — um estado global só, num
composable, para a próxima tela nunca herdar o nome da anterior:

```js
const { definirFolha } = useBreadcrumbFolha()
watchEffect(() => definirFolha(lote.value?.codigo))
```

### 3.8 Contexto operacional global (a "baliza")

Se o produto tem um eixo global (unidade, safra, empresa, período) escolhido na topbar:

**Regra inegociável: o contexto global nunca entra direto na request.** Ele só preenche um
controle **visível** da tela; quem manda ao backend é a tela, como faria com qualquer input.
Tela sem filtro daquele eixo **não é filtrada** por ele. Nada de parâmetro oculto — filtro
invisível é a origem clássica do "sumiu meu registro".

- Form: injete como `defaultValue`, avaliado só na **abertura**; a escolha do usuário prevalece.
- ❌ Não use `createDefaults` para campo editável — ele é reaplicado no save e sobrescreve o
  que o usuário escolheu. `createDefaults` é para FK-pai **oculta**.

### 3.9 Totais do filtro numa listagem

Resumo no topo de uma lista deve refletir o **conjunto filtrado inteiro**, não a página. O
jeito certo é o backend devolver um bloco `extras` junto da página (opt-in por query param):
**um único request**, e o resumo nunca diverge do filtro. No front, peça no `filterParams` e
renderize num grid de KPI acima da tabela.

## 4. Shell e navegação

- **Topbar full-width** em cor de estrutura (igual nos dois temas): logo, atalho de busca
  discreto, contexto operacional global, toggle de tema, menu do usuário. A sidebar começa
  **abaixo** dela.
- **Busca global = command palette** (modal, `Ctrl+K` ou `/`; `↑/↓` navega, `↵` abre,
  `Esc` fecha). **Não** existe busca dentro da sidebar — decisão fechada, evita dois lugares
  de busca competindo.
- **Sidebar única** agrupada por módulo, com **favoritos** no topo, recolhível, drawer no
  mobile. Item sempre com ícone; ativo marcado com `aria-current` + barra de acento.
- **Profundidade máx. 2 níveis** (módulo › tela). Terceiro nível é breadcrumb, não sidebar.
- **Preferências** no popover do avatar: tema, densidade, tamanho e família de fonte —
  aplicadas pré-paint e persistidas.
- **A11y:** skip link, `:focus-visible` com anel de foco, popover com `aria-expanded` +
  `Esc` + clique-fora, `aria-label` em botão só-ícone, contraste AA nos dois temas.

### Checklist de módulo novo

`ENDPOINTS` → schema → composable → page → rota → item de navegação (com ícone) →
**breadcrumb**.

## 5. Quando não existe componente da suite

É aqui que o padrão costuma quebrar. Siga exatamente:

1. **Confirme que não existe** — leia os `.d.ts` publicados da suite, não a memória.
2. **A necessidade é recorrente entre telas ou projetos?**
   - **Sim** → o componente nasce **na suite**, com props tipados, defaults sensatos e slots
     de override; estilo consumindo tokens com fallback. **Nunca editar `node_modules/`.**
     Publicação da suite é fluxo próprio (commit + bump + tag + `npm publish` com 2FA); só
     depois instale a versão nova no app.
   - **Não** (é genuinamente de uma tela) → componente de domínio em
     `src/components/{domínio}/`, **composto de componentes da suite** e estilizado só com
     tokens. Sem paleta nova, sem escala nova.
3. **Nunca** resolva com utilitário Tailwind de cor/tamanho na tela — é por aí que a paleta
   do framework vaza e a tela passa a destoar.

> **Desenvolvendo a suite junto com o app?** Use `yarn link` e mova a suite do
> `optimizeDeps.include` para o `exclude`: no `include`, o esbuild congela o `dist/` da
> primeira subida e nenhuma correção aparece no `yarn dev` sem limpar o cache. E **nunca**
> edite direto dentro de `node_modules`.

## 6. Convenções de nome

| Item                  | Padrão                              | Exemplo                                               |
| --------------------- | ----------------------------------- | ----------------------------------------------------- |
| Componente da suite   | `W` + PascalCase                    | `WCrudView`                                           |
| Componente de domínio | `{domínio}/PascalCase.vue`          | `nota_fiscal/NotaFiscalTimeline.vue`                  |
| Composable            | `useCamelCase`                      | `useNotasFiscais.js`                                  |
| Schema                | `{entidade}{Columns\|Form\|Labels}` | `notaFiscalColumns`                                   |
| Rota (path e name)    | kebab-case                          | `/lancamentos/notas-fiscais` · `notas-fiscais-editor` |
| Item de nav           | `id` curto + `label` + `icon`       | `{ id: 'sem-nf', … }`                                 |
