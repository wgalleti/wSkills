<!-- GERADO a partir de 01/02/03 — não edite; regenere com:
     cat 01*.md 02*.md 03*.md > lovable-knowledge.md (mantendo este cabeçalho) -->

# Identidade visual — direção para protótipos

Este produto será integrado a um portal corporativo existente. Use esta identidade desde
o primeiro layout. É direção, não camisa de força: mantenha as cores, a tipografia e a
densidade; a criatividade vai em composição e hierarquia, não em paleta nova.

## Marca em três cores

- **Azul** é o primário — botões de ação, links, foco, seleção. Um único primário por tela.
- **Navy** é estrutura — barra superior, sidebar, fundos de "chrome". Nunca em botão.
- **Dourado** é acento — no máximo **um** destaque dourado por tela (um KPI, um selo, um marco).
- **Verde nunca é ação nem marca** — verde só existe como status "sucesso/aprovado".
- Vermelho só para ação destrutiva real ou status de erro.

## Tokens (cole como CSS variables do projeto)

```css
:root {
  /* ação (primário) */
  --primary: #1f5092; /* azul core */
  --primary-hover: #1c4179;
  --primary-soft: #eef4fb; /* fundos suaves de seleção/realce */
  --primary-fg: #ffffff;

  /* acento (máx. 1 uso por tela) */
  --accent: #d9952f; /* dourado core */
  --accent-soft: #fdf6e7;

  /* estrutura (topbar/sidebar) */
  --shell: #14283d; /* navy */
  --shell-2: #0f1f30;
  --shell-fg: #eaf0f7;
  --shell-fg-muted: #9fb0c6;
  --shell-accent: #e8b85c; /* item ativo na navegação */

  /* status (com fundo suave correspondente) */
  --success: #1e8e54;
  --success-soft: #e3f4ea;
  --warning: #c7861f;
  --warning-soft: #fbefd6;
  --danger: #d24b3b;
  --danger-soft: #fbe6e3;
  --info: #2f7e97;
  --info-soft: #e1f0f4;

  /* séries de gráfico, nesta ordem (não reutilizar success/danger como categoria) */
  --viz-1: #1f5092;
  --viz-2: #d9952f;
  --viz-3: #2f8f9e;
  --viz-4: #b9543f;
  --viz-5: #6b5e8c;
  --viz-6: #2e8b57;

  /* superfícies e texto (modo claro) */
  --bg: #f4f6f9; /* fundo da página */
  --surface: #ffffff; /* cards, tabelas */
  --surface-2: #f8fafc; /* cabeçalho de tabela, faixas */
  --fg: #141a22;
  --fg-muted: #5a6573; /* texto secundário — use bastante */
  --fg-subtle: #8794a3;
  --border: #e2e8f0; /* bordas quase brancas */
  --border-strong: #cdd6e2; /* só em inputs */

  /* forma */
  --radius: 8px; /* controles */
  --radius-lg: 12px; /* cards */
  --radius-full: 999px; /* tags/pills */
  --shadow-sm: 0 1px 2px rgba(16, 30, 24, 0.06), 0 1px 3px rgba(16, 30, 24, 0.08);
  --shadow-md: 0 2px 4px rgba(16, 30, 24, 0.06), 0 4px 8px rgba(16, 30, 24, 0.08);

  /* densidade (app de trabalho: compacto, muita informação) */
  --control-h: 38px; /* altura de input/botão */
  --row-h: 44px; /* linha de tabela */
  --card-pad: 20px;
  --section-gap: 24px;
  --motion: 220ms; /* transições curtas; nada de animação longa */
}
```

## Tipografia

- Fonte: **Satoshi** (Fontshare) se disponível; senão `system-ui`. Não usar serifada
  nem display.
- Escala reduzida — é app denso: texto de UI **14px**, secundário 13px, título de
  seção 17px, título de página 20–24px. Nada acima de 30px dentro do app.
- Peso: regular no corpo, **medium/semibold** no que importa. Evite bold pesado
  espalhado.
- Números em tabela: alinhados à direita com `font-variant-numeric: tabular-nums`.
- Moeda e data sempre em **pt-BR** (`R$ 1.234,56`, `17/08/2026`).

## Modo escuro

Preveja desde o início: defina tudo via variables e troque só os valores (fundo
`#0c1219`, superfície `#131b25`, texto `#e9eef4`, primário clareado `#7eaadd`). A barra
superior/sidebar **continua navy nos dois modos**.

## O que evitar (marcas de protótipo genérico)

- Gradientes em botão ou card; sombras pesadas; glassmorphism.
- Borda colorida grossa na lateral de card ("side-tab").
- Cartões com muita borda — agrupe por **espaço e fundo suave**, não por caixas.
- Roxo/violeta como primário (paleta default de template).
- Emoji como ícone; ícones decorativos sem função.
- Tela "de marketing" dentro do app: hero, frase de impacto, CTA gigante.
- Cor nova inventada para um caso — se falta cor, use as de status.

## Tom geral

Portal sóbrio de operação diária: fundo claro acinzentado, cards brancos de borda
sutil, uma ação primária óbvia por tela, texto secundário abafado (`--fg-muted`),
espaço em branco generoso entre blocos. Riqueza visual vem de hierarquia e ritmo — não
de decoração.

---

# Padrões de frontend — direção para protótipos

O sistema final monta telas a partir de **padrões fixos**. Se o protótipo usar os mesmos
padrões, a conversão é quase mecânica. Antes de desenhar uma tela, escolha **um** dos
sete padrões abaixo; se nenhum servir, provavelmente são duas telas.

## Os 7 padrões de tela

1. **Lista / CRUD** — tabela paginada + busca única + botão "Novo" + formulário em
   dialog. É o padrão da maioria dos cadastros.
2. **Editor master-detail** — cabeçalho do registro (título + status) no topo, seções
   de formulário, e a coleção-filha como tabela CRUD abaixo. Um único par
   Salvar/Cancelar, no rodapé.
3. **Dashboard** — cards de KPI no topo (4–6), gráficos simples abaixo, tudo clicável
   levando às listas filtradas.
4. **Wizard** — importações e processos em passos: barra de progresso, um passo por
   vez, resumo de validação antes de confirmar.
5. **Comparativo** — dois conjuntos lado a lado com diferenças destacadas.
6. **Relatório de impressão** — documento A4 quase monocromático (será PDF): cabeçalho
   com logo, resumo no topo, tabelas com zebra, totais no rodapé. Sem badge colorido.
7. **Detalhe + linha do tempo** — dados do registro + timeline vertical dos eventos
   (quem, quando, o quê).

## Formulários

- **Guiados por schema**: pense cada form como uma lista de campos com tipo — texto,
  número, moeda, data, seleção, chave-estrangeira (busca com autocomplete), switch,
  textarea, CPF/CNPJ. Isso converte direto.
- Rótulo acima do campo; placeholder que **guia** ("Ex: João Silva"), nunca repetindo o
  rótulo.
- Campos com respiro: largura cheia por padrão; lado a lado só quando fizer par natural
  (documento + e-mail).
- Contexto primeiro: os campos que situam o registro (empresa/unidade, período, data)
  vêm antes dos detalhes.
- Observação/anotação é sempre textarea, por último.
- **Enter navega**: Enter avança para o próximo campo e submete no último.
- Validação inline em pt-BR, na hora ("Nome deve ter pelo menos 2 caracteres").
- Datas: seletor de calendário, valor `YYYY-MM-DD` por baixo, exibição `DD/MM/YYYY`.
- Moeda: input com máscara pt-BR preenchendo da direita (digita 1234 → 12,34).

## Tabelas e listas

- **Uma busca só**, acima da tabela, que procura em todos os campos relevantes — sem
  fileira de filtros por coluna.
- Filtro fixo por eixo (unidade, período, status) como controle visível ao lado da
  busca, não escondido.
- Números à direita (`tabular-nums`); moeda formatada; datas curtas.
- Status como **tag/pill** com dupla codificação (cor + rótulo, nunca só cor).
- Linha clicável abre o detalhe; ações por linha num menu discreto no fim da linha.
- Estados obrigatórios: vazio (com texto útil e ação), carregando, erro. Nunca tela em
  branco.
- Paginação servidor-side; resumo/totais do filtro no topo quando fizer sentido.

## Navegação e shell

- **Barra superior navy** fixa: logo, busca global (Ctrl+K), contexto global (ex.:
  unidade e período ativos), tema, menu do usuário.
- **Sidebar única** abaixo da topbar, agrupada por módulo, recolhível; item ativo com
  barra dourada à esquerda. Máximo 2 níveis — o 3º nível é breadcrumb, não menu.
- Breadcrumb em toda tela interna, com o nome do registro aberto na ponta
  ("Financeiro › Borderôs › BOR-20260817-0001").

## Fluxos com aprovação/status

- Todo fluxo de estado tem: tag de status visível no cabeçalho, ações permitidas
  **dependentes do papel do usuário e do status atual**, confirmação com justificativa
  nas ações sensíveis, e a trilha (quem fez o quê, quando) visível na tela.
- Nada de excluir registro de negócio: cancele/estorne com motivo.

## Linguagem

- Interface 100% **pt-BR**, com os nomes que o domínio do cliente realmente usa
  (borderô, título, alçada, safra, talhão…) — não traduzir para "genérico de sistema".
- Texto de botão é verbo: "Aprovar", "Importar retorno" — nunca "OK"/"Enviar" genérico.
- Mensagens de erro dizem o que fazer, não o código do problema.

---

# Padrões de dados e API — direção para protótipos

O protótipo pode usar qualquer backend (Supabase, mock, server functions). O que importa
é a **forma** dos dados e das operações: se seguir os padrões abaixo, cada tabela vira um
modelo do sistema final quase sem tradução.

## Modelagem de dados

- **Id**: UUID em toda tabela (nunca inteiro sequencial como chave).
- **Carimbo padrão em toda tabela**: `criado_em`, `atualizado_em`, `criado_por`
  (referência ao usuário).
- **Nomes em pt-BR, curtos e sem redundância**: numa tabela `pedido`, o campo é `data`,
  não `data_pedido`; `valor`, não `valor_do_pedido`.
- **Status como enum de strings** com vocabulário fechado (`rascunho`, `pendente`,
  `aprovado`, `rejeitado`, `cancelado`) — nunca booleano `aprovado: true/false` quando
  há mais de dois estados possíveis, e nunca texto livre.
- **Documento único**: pessoa física e jurídica convivem no mesmo cadastro com um campo
  `documento` (CPF ou CNPJ, só dígitos) — não separar em duas colunas/tabelas.
- **Cadastro central × ficha do módulo**: cadastros compartilháveis (empresa,
  fornecedor, pessoa) ficam enxutos e centrais; o que só um módulo usa vai numa tabela
  complementar 1-para-1, não em colunas novas no cadastro central.
- **Histórico é imutável (ledger)**: movimentações, aprovações e eventos financeiros
  são _append-only_ — corrigir = lançar o movimento contrário com justificativa, nunca
  editar nem apagar. Saldos e totais são **calculados** das linhas, não digitados.
- **Trilha de decisão**: toda aprovação/rejeição gera um registro próprio (quem, papel,
  ação, quando, observação) em tabela de trilha — não só um campo `aprovado_por` no
  registro.
- **Numeração de negócio** (`L-2026-0001`) é um campo próprio, separado do id, gerado
  no servidor.
- **Sem exclusão física** de registro de negócio: use status `cancelado` ou flag de
  exclusão lógica com motivo.
- **Escopo organizacional explícito**: registro operacional aponta para a
  empresa/unidade dona (`empresa_id`/`unidade_id`) — o sistema final filtra tudo por
  esse eixo.
- **Dados sensíveis sinalizados**: CPF/CNPJ, dados bancários (agência, conta,
  convênio), código de barras. No protótipo basta mascarar na exibição
  (`**.***.***/0001-**`); no sistema final essas colunas são criptografadas — quanto
  mais isoladas estiverem (colunas próprias, nunca dentro de JSON), melhor.
- Valores monetários: **decimal com 2 casas** (nunca float).

## Papéis e permissões

- Papéis como **grupos nomeados** (operador, gerente, diretor, auditoria), não flags
  soltas no usuário. Um usuário pode ter mais de um papel.
- Autorização sempre no servidor: o papel decide o que cada ação aceita; o frontend só
  esconde o que não pode. "Auditoria" é um papel somente-leitura.
- Nunca criar usuários de teste com senha fixa embutidos na tela de login.

## Forma da API

- Recursos REST em kebab-case no plural: `/contas-bancarias/`, `/pagamentos-avulsos/`.
- **Ação de negócio é um POST nomeado no recurso**, não um update de campo:
  `POST /lotes/{id}/aprovar`, `POST /lotes/{id}/rejeitar` (com `motivo` no corpo) —
  nunca `PATCH { status: 'aprovado' }` direto do cliente.
- Listagens paginadas no servidor, devolvendo `{ data: [...], total: n }`; filtros por
  query string; um endpoint pode devolver um bloco `extras` com totais do conjunto
  filtrado (para o resumo no topo da lista).
- Enums/status têm endpoint próprio de opções (`/lotes/status/`) — o frontend nunca
  hardcoda a lista.
- Erros com mensagem em pt-BR pronta para exibir: `{ "detail": "..." }` ou
  `{ "campo": ["mensagem"] }`.
- Datas em `YYYY-MM-DD`; horários com fuso explícito — regras de horário-limite usam o
  fuso onde o cliente opera (ex.: `America/Cuiaba`), não o do servidor.
- Arquivos (anexos, comprovantes) referenciados por caminho/URL servida pelo backend,
  com o arquivo original preservado imutável (valor probatório).

## Rotinas e integrações

- Tarefa periódica (ex.: liberação automática por horário) como **função nomeada e
  idempotente** — rodar duas vezes não pode duplicar efeito; toda execução automática
  registra na trilha com ator "sistema".
- Integração com IA sempre com **fallback determinístico**: se a IA falhar, uma regra
  simples assume e o fluxo não trava. A resposta da IA é JSON com contrato fixo.
- Nada específico de ERP no modelo de dados (campos de um ERP concreto) — integração é
  camada à parte no sistema final; se precisar referenciar, use um `codigo_externo`
  genérico.
