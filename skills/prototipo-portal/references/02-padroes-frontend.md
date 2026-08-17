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
