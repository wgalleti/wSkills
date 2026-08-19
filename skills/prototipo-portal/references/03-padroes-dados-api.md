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
