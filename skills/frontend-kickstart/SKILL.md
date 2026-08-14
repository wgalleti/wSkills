---
name: frontend-kickstart
description: "Use ao INICIAR um frontend novo (ou padronizar um recém-criado) com o stack de portal operacional deste kit: Vue 3 + Vite + PrimeVue 4 unstyled + Tailwind 4 + Pinia + a suite @wgalleti/primevue-components (W*), telas escritas por configuração (ColumnDef/FieldDef) sobre uma API REST paginada. Traz o passo a passo de bootstrap, a arquitetura em camadas (data → composable → schema → page), o design system em tokens, as regras de usabilidade e o que dá para trazer do projeto de origem depois. Dispare em pedidos como 'começar um projeto novo', 'criar o frontend do sistema X', 'quero a mesma estrutura do portal', 'padronizar esse app novo', 'setup do Vue com a suite W*'."
---

# Kickstart de frontend — stack de portal operacional

Esta skill empacota a estrutura de um portal operacional que já está em produção, para que
**outro projeto comece no mesmo padrão** — sem copiar o repositório e sem redescobrir as
decisões. Ela é autocontida: nada aqui depende do repositório de origem.

**Premissa do produto:** o usuário passa o dia dentro da tela — lança nota, preenche análise,
confere estoque. Por isso o padrão é: **densidade acima de impacto, teclado como primeiro
cidadão, consistência acima de originalidade.** Se o projeto novo é um site de marketing ou
um app com identidade própria forte, este stack é o errado — pare aqui.

## O que este stack entrega

- **Tela de CRUD completa em 20-50 linhas** (tabela paginada, busca, ordenação, cards,
  dialog de create/edit/duplicate, confirm, toast, export CSV, Enter navega o form).
- **UI consistente sem CSS por tela** — tudo em tokens CSS, tema claro/escuro e duas
  densidades funcionando de graça.
- **Uma única camada que conhece a API** — trocar formato de paginação é um arquivo.

## Ordem de leitura

| Momento                                                                                   | Leia                        |
| ----------------------------------------------------------------------------------------- | --------------------------- |
| Bootstrap do projeto (do zero até a primeira tela)                                        | `references/setup.md`       |
| Onde cada arquivo mora, receitas de tela, proibições                                      | `references/arquitetura.md` |
| Tokens, cor, tipografia, densidade, os 7 padrões de tela, usabilidade                     | `references/design.md`      |
| O que dá para trazer do projeto de origem depois (contexto global, PDF, palette, extras…) | `references/evolucoes.md`   |
| Arquivo de tokens pronto para copiar                                                      | `assets/tokens.css`         |

Se o projeto consome a suite `@wgalleti/primevue-components`, a **API dos componentes** está
na skill `wpvc` (ou nos `.d.ts` publicados em `node_modules/@wgalleti/primevue-components/dist/`).
Esta skill nunca copia a API da suite — ela envelhece.

## Decisões que já estão tomadas (não relitigue no projeto novo)

1. **Vue 3 Composition API + `<script setup>`.** Sem Options API, sem TSX.
2. **PrimeVue 4 unstyled + Tailwind 4 via passthrough**, tema por `definePreset` do Aura.
   Ajuste a escala `primary` e a escala `surface` — nunca a cor de um componente isolado.
3. **Tailwind existe para layout** (flex/grid/gap). **Cor, altura, padding e fonte vêm de token.**
4. **Pinia só para estado transversal** (auth, tema, contexto global). Estado de CRUD mora no
   composable da tela, nunca em store.
5. **Nada de `src/components/ui/`** (shadcn e afins) e nada de camada `repositories/`.
   UI base = componentes `W*`; acesso a dados = `data/dataProvider.js`.
6. **pt-BR na interface**, código e commits em inglês convencional (`feat:`, `fix:`…).

## Fluxo ao iniciar o projeto

```
1. Confirme com o dono do produto: é sistema operacional interno? (senão, stack errado)
2. references/setup.md — scaffold, deps, arquivos-base, primeira tela rodando
3. references/design.md §1 — troque a marca (uma escala de cor) e só ela
4. Primeira entidade real: endpoints → schema → page → rota → nav → breadcrumb
5. Escreva o CLAUDE.md do projeto novo (modelo no fim do setup.md)
```

## Regras inegociáveis (valem desde o primeiro commit)

- **Tela se descreve, não se monta.** `ColumnDef[]` / `FieldDef[]` num arquivo de schema puro
  (zero Vue) alimentam tabela, form em dialog e form standalone. Não componha
  `label` + `input` + `small` à mão.
- **Zero hex, zero `text-*-500`, zero px mágico** em código de tela. Exceção única:
  documentos de impressão (§ `design.md`).
- **Toda tela tem empty, loading e error.** Nunca tela em branco, nunca "Nenhum dado".
- **Enter navega o formulário** e submete no último campo — em todo form, sem exceção.
- **Componente genérico não nasce dentro do app.** Se serve a mais de uma tela ou projeto,
  vai para a biblioteca compartilhada.
- **Um primário por contexto**, acento no máximo 1× por tela, verde só como status.
- **Toda view nova registra breadcrumb e item de navegação** — é o item mais esquecido.

## Checklist de PR (copie para o CLAUDE.md do projeto novo)

- [ ] A tela segue **um** dos 7 padrões (`design.md` §5).
- [ ] Tabela e form vêm de schema, não montados à mão.
- [ ] Usa componente da suite onde existe; o que faltou e repete foi para a suite.
- [ ] Zero hex, zero paleta crua do Tailwind, zero px mágico.
- [ ] Funciona em **light e dark**, **compact e balanced**.
- [ ] Listagem tem empty / loading / error.
- [ ] Números à direita com `tabular-nums`; data e moeda em pt-BR.
- [ ] Enter navega o form e submete no último campo.
- [ ] Breadcrumb e item de nav registrados; nenhum par de ações duplicado.
- [ ] `yarn lint:check` e `yarn build` limpos — **sem** formatar o repositório inteiro.
