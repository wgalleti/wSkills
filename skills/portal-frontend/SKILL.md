---
name: portal-frontend
description: "Regras de trabalho no frontend de um portal operacional Vue 3 + PrimeVue 4 + suite @wgalleti/primevue-components (W*). Use ao criar ou revisar QUALQUER tela, componente, composable, schema, rota, filtro, relatório de impressão ou ajuste visual no app — e ao decidir o que fica no app e o que vai para a suite. Gatilhos: 'nova tela', 'listagem', 'CRUD', 'formulário', 'dashboard', 'painel', 'card', 'KPI', 'filtro', 'breadcrumb', 'relatório/PDF', 'ajustar o visual', 'criar componente'."
---

# Frontend do portal (app que consome a suite `W*`)

Portal Vue 3 de sistema operacional interno: o usuário passa o dia aqui — lança documento,
preenche análise, confere saldo. Por isso: **densidade importa mais que impacto, teclado é
primeiro cidadão, consistência vence originalidade.** Telas se escrevem por **configuração**
(schemas) sobre a suite `W*` — não por composição manual de HTML/inputs.

> **Adapte ao instalar.** Esta skill é o esqueleto de regra que funciona num portal já em
> produção. Ajuste os caminhos da tabela abaixo, o nome da paleta e os gotchas para a
> realidade do seu repositório — e apague o que não se aplica. Começando um frontend do
> zero? Use antes a skill **`frontend-kickstart`**, que monta a estrutura que esta skill
> pressupõe.

## Onde está a verdade (não duplique aqui)

| Preciso de                                                                 | Arquivo (ajuste ao seu repo)                             |
| -------------------------------------------------------------------------- | -------------------------------------------------------- |
| Identidade, tokens, tipografia, densidade, shell, **os 7 padrões de tela** | `DESIGN.md`                                              |
| Regra acionável: camadas, receitas de tela, proibições, checklist de PR    | `web/CLAUDE.md`                                          |
| Qual `W*` usar, props que importam, o que **não** existe na suite          | `web/COMPONENTS.md`                                      |
| Valores exatos (cor, espaço, raio, densidade)                              | `web/src/assets/css/tokens.css`                          |
| API real da suite                                                          | `node_modules/@wgalleti/primevue-components/dist/*.d.ts` |
| Desvios abertos e prioridade de correção                                   | `docs/AUDIT.md`                                          |
| Implementar/publicar **na suite**                                          | `references/suite.md` (aqui)                             |
| API da suite com exemplos                                                  | skill **`wpvc`**                                         |

Se um número aparecer numa doc e no código, **o código ganha**. Esta skill é índice + regra —
nunca cópia de conteúdo.

## Regras inegociáveis

1. **Suite primeiro.** Existe `W*`? Use. Falta e é recorrente entre projetos? Implemente **na
   suite** (`references/suite.md`). Nunca editar `node_modules/`.
2. **Nada montado à mão.** Tabela/form/dialog → `useAppCrud` + `WCrudView` / `WFormRenderer`.
   Métricas → `WKpiGrid` + `WKpiCard` (enriqueça pelos slots `icon`/`value`/`hint`/`footer` com
   SVG inline). **Card em `<div>` com CSS próprio é desvio.**
3. **Escolha o padrão de tela ANTES do markup** (`DESIGN.md`, 7 opções). Nenhum encaixa → o
   escopo está errado, quebre em duas telas.
4. **Schema primeiro.** `ColumnDef[]`/`FieldDef[]` em `src/schemas/` é o primeiro arquivo do
   módulo — antes da page.
5. **CRUD sempre pelo wrapper do app** (`useAppCrud`), nunca `useCrudManager` direto — é o que
   garante o Enter-navega em toda tela. Form fora de CRUD → `useEnterNav`.
6. **Datas = `WDatePicker`** (string `YYYY-MM-DD`); período = `WDateRange`. Proibido
   `parseDate`/`toISOString` copiado.
7. **Token, nunca hex/px.** Cor, altura, padding, raio, transição — tudo CSS var. Exceção única:
   as páginas de impressão (`pages/relatorios/**`, `pages/print/**`).
8. **Verde nunca é ação nem marca** — só `--success` (status). `severity="success"` num botão é
   desvio. Um primário por contexto; acento no máx. 1× por tela.
9. **HTTP só pelo `dataProvider`**, URL registrada em `ENDPOINTS`. Nunca importar axios na tela.
10. **Breadcrumb registrado no mapa do layout** — e **nenhum breadcrumb local** na página. É o
    item mais esquecido do checklist.
11. **Light + dark, compact + balanced.** Escreveu `dark:` de cor? Usou a cor errada.
12. **Não rodar `yarn format`/`quality:fix`** — reescrevem o repo inteiro (churn enorme, risco
    de quebrar SFC). Valide com `yarn lint:check` + `yarn build`; formate só o que tocou.

## Árvore de decisão

```
1. Que padrão de tela é? → DESIGN.md (7 opções)
2. Existe schema em src/schemas/{domínio}/? → não: crie PRIMEIRO
3. Existe W* que resolve? → COMPONENTS.md
   ├ sim → configuração mínima; slot só para override pontual
   └ não → recorrente entre projetos? SIM: nasce na suite (references/suite.md)
                                        NÃO: componente de domínio composto de W*
        ⚠️ em nenhum caso comece a escrever CSS de layout/paleta
4. Registre: endpoints → schema → composable → page → router → navigation → breadcrumb
```

## Gotchas que já custaram tempo

Confira contra a versão da suite que você usa — alguns já podem ter sido corrigidos.

- **`WDetailHeader` pode estourar** se o build da suite não marcar `vue-router` como `external`:
  o bundle embute uma cópia do router, o `useRouter()` interno injeta outro `Symbol(router)` e o
  botão voltar quebra (`Cannot read properties of undefined (reading 'push')`). `resolve.dedupe`
  **não** resolve — o código está embutido, não importado. Contorno: `WPageHeader` + botão próprio.
- **O cabeçalho do `tokens.css` pode mentir** sobre qual escala é a primária. O que vale é o
  token `--primary`, não o comentário.
- **A suite pode resolver status pela paleta do Aura** (`--p-green-500`) em vez dos tokens do DS,
  e **ignorar a densidade** (tamanhos literais no CSS dela). Não "conserte" isso na tela — a
  correção é na suite, com `var(--success, var(--p-green-500))` e afins.
- **`primary-50` e `primary-500` podem não existir** como classe Tailwind (saem transparentes)
  mesmo com as outras funcionando — use os tokens.
- **Contexto global (unidade/safra/empresa) nunca entra na request**: só preenche controle
  visível da tela. Filtro invisível é a origem clássica do "sumiu meu registro".
- **`#before-table` do `WCrudView` substitui** o bloco de KPIs padrão — reponha a margem inferior.
- **Totais de uma listagem** vêm do bloco `extras` da API (um request só, calculado sobre o
  filtro inteiro), não de uma segunda chamada.
