# Design system e usabilidade

O sistema visual inteiro vive em **um arquivo de tokens** (`assets/tokens.css` desta skill).
Código de tela consome token; nunca valor literal. É o que faz tema claro/escuro e duas
densidades funcionarem sem esforço por tela.

## 1. Trocar a marca (a única coisa que muda por projeto)

O arquivo de tokens tem quatro camadas. **Você mexe só na primeira.**

1. **Escalas de marca** (`--blue-*`, `--gold-*`, `--navy-*`, `--green-*`) — troque pela
   paleta do projeto novo, mantendo 11 degraus (50…950) por escala.
2. **Semânticos** (`--primary`, `--accent`, `--fg`, `--surface`, `--border`, `--shell*`) —
   apontam para as escalas. Reaponte, não redefina valores.
3. **Escala e ritmo** (tipografia, raio, sombra, espaço, densidade, motion) — deixe como está;
   é o que dá o "ar de produto sério" e não deve variar por projeto.
4. **Bloco `.dark`** — só semânticos. Se você escreveu uma variante `dark:` de cor numa tela,
   é sinal de que usou a cor errada.

Papéis de cor (modelo tri-color, um papel por vez):
**ação/primário** (uma cor) · **estrutura/chrome** (o navy do shell, constante nos dois temas) ·
**acento** (destaque, no máximo 1× por tela).

## 2. Tabela de decisão de estilo

| Precisa de         | Use                                                                  | Nunca                             |
| ------------------ | -------------------------------------------------------------------- | --------------------------------- |
| cor de ação        | `var(--primary)` `--primary-hover` `--primary-soft` `--primary-fg`   | hex, `bg-blue-600`                |
| texto              | `var(--fg)` `--fg-muted` `--fg-subtle`                               | `text-surface-500`, `dark:text-*` |
| fundo              | `var(--surface)` `--surface-2` `--surface-3` `--bg`                  | `bg-white dark:bg-surface-900`    |
| borda              | `var(--border)` · input: `--border-strong`                           | hex                               |
| status             | `--success` `--warning` `--danger` `--info` (+ `-soft`)              | `text-green-600`                  |
| altura de controle | `var(--control-h)`                                                   | `h-10`, `height: 38px`            |
| linha de tabela    | `var(--row-h)` `--cell-py`                                           | px fixo                           |
| padding de card    | `var(--card-pad)`                                                    | `p-6`                             |
| gap entre seções   | `var(--section-gap)`                                                 | `space-y-6`                       |
| fonte da UI        | `var(--ui-font)`                                                     | `text-sm`, `text-base`            |
| raio               | `--radius` (controle) · `--radius-lg` (card) · `--radius-full` (tag) | `rounded-xl`                      |
| transição          | `--motion-fast` `--motion` + `--ease`                                | `duration-200`                    |

**Gotcha do Tailwind v4 com preset PrimeVue:** as classes `primary-50` e `primary-500` podem
não existir (saem transparentes) mesmo com as outras funcionando. Motivo a mais para usar
token, não classe de cor.

### Regras de cor

- **Um** primário por contexto.
- Acento no máximo **1× por tela**.
- **Verde nunca é ação nem marca** — só status aprovado. Botão `severity="success"` é desvio.
- Vermelho só em ação destrutiva real ou erro.
- Série de gráfico: `--viz-1…--viz-6`, nessa ordem. Nunca reusar `--success`/`--danger` como
  categoria — o leitor lê julgamento onde só há categoria.

### Onde CSS pode existir

1. `tokens.css` — definição de token (só o dono do DS mexe).
2. `portal.css` — shell do portal.
3. CSS da **suite** — estilo dos componentes compartilhados.
4. Páginas de impressão (§6).

Fora dessas quatro, CSS novo é sinal de que **falta um componente na suite**. Quando um
componente de domínio precisar mesmo de estilo, escreva em `<style scoped>` com **classes
semânticas** e tokens — não empilhe dezenas de utilitárias no template.

## 3. Tipografia e números

Uma família para a UI, uma monoespaçada para código, ID, lote, versão e números que precisam
alinhar. A escala é **rem-based**: o usuário escolhe o tamanho no `<html>` e tudo escala junto.

| Token         | px  | Uso                                                                  |
| ------------- | --- | -------------------------------------------------------------------- |
| `--text-2xl`  | 24  | título de página                                                     |
| `--text-xl`   | 20  | **título de tela — o padrão real**                                   |
| `--text-lg`   | 17  | título de seção                                                      |
| `--text-base` | 14  | corpo da UI (`--ui-font` em `balanced`)                              |
| `--text-sm`   | 13  | tabela, label (`--ui-font` em `compact`)                             |
| `--text-xs`   | 12  | hint, erro, meta                                                     |
| `--text-2xs`  | 11  | overline, cabeçalho de coluna (caixa-alta + `letter-spacing: .05em`) |

Pesos: 400 corpo · 500 label/nav/ação · 700 título/KPI. **Sem bold espalhado** — semibold só
no essencial; texto de apoio em `--fg-muted`.

**Números:** toda coluna numérica alinha à direita com `tabular-nums`. Data e moeda sempre em
pt-BR — pelo formatador da suite, nunca `toLocaleString` copiado.

## 4. Densidade — toda tela precisa funcionar nas duas

| Token           | `balanced` | `compact` |
| --------------- | ---------- | --------- |
| `--control-h`   | 38px       | 32px      |
| `--row-h`       | 44px       | 36px      |
| `--cell-py`     | 11px       | 7px       |
| `--card-pad`    | 20px       | 16px      |
| `--section-gap` | 24px       | 18px      |
| `--ui-font`     | 14px       | 13px      |

Consequência prática: **nenhuma altura, padding ou font-size literal em código de tela.**
E **não redimensione componente avulso** (`size="small"` numa instância) — densidade é
uniforme e vem do token; compactar é mexer no token, não na tela.

Motion: `--motion-fast` 140ms (hover, foco) · `--motion` 220ms (overlay) · `--motion-slow`
380ms (dialog). `prefers-reduced-motion: reduce` desliga tudo.

## 5. Os 7 padrões de tela

Toda tela encaixa em um destes. Escolha **antes** de escrever markup. Se nenhum encaixa, o
escopo está errado — quebre em duas.

1. **Lista / CRUD** — o piso de qualidade (20-50 linhas). Toolbar com título e contagem à
   esquerda, busca à esquerda da barra, exportar/visão à direita. Filtros como chips
   removíveis. Empty/loading/error obrigatórios. Totais do filtro (não da página) num grid
   de KPI acima da tabela.
2. **Editor master-detail** — cabeçalho de registro + status · seções de form para o master ·
   CRUD escopado para o detail · **um único** par de ações no rodapé · flag "não salvo".
3. **Dashboard** — grid de KPI + gráficos com `--viz-*`. Seletor de período no canto superior
   direito. Uma série destacada, no máximo.
4. **Wizard / Stepper** — uma etapa por vez, sem scroll infinito. Erro = borda de perigo **+**
   mensagem, sempre os dois. Enter avança; no último campo, submete a etapa.
5. **Comparativo** — colunas espelhadas com as **mesmas linhas na mesma ordem**. Divergência
   marcada **nos dois lados**, mais um resumo com contagem e delta.
6. **Relatório / Pivot** — tabela densa: zebra separa linhas (sem grade), números à direita,
   totais em `tfoot` com régua de acento, exceção em `--warning`. Export sempre visível.
7. **Detalhe + timeline** — cabeçalho de registro (ícone + código + status) · fatos em cards
   de informação · cronologia vertical, cada evento com data/hora e autor.

## 6. Anatomia de componentes

**Campo** = label + controle + hint. Erro = borda de perigo **e** texto (nunca só a cor).
Obrigatório com `*`. Readonly em `--surface-3` + `--fg-muted`.

**Botão** — altura `--control-h`, raio `--radius`, peso 500. Primário sólido, secundário
outlined, terciário text. **Uma** ação primária por bloco. Sem gradiente, sem sombra colorida.

**Trigger de dropdown = só ícone.** O indicador de abrir um dropdown (chevron, lupa, calendário,
limpar) é um ícone **dentro do campo**, sem moldura de botão. Um botão ao lado do input rouba
peso visual e quebra o alinhamento.

**Tabela** — cabeçalho em caixa-alta pequena e `--fg-muted`; linha alterna `--surface`/
`--surface-2`; seleção com `--primary-soft` + barra à esquerda.

**Tag / status** — sempre pelo componente de status com um `map` de valores. Nunca escreva a
tag à mão.

**Card / KPI** — pelos componentes da suite. Card montado em `<div>` com CSS próprio é desvio;
para enriquecer, use os slots com SVG inline herdando `currentColor`.

**Estado vazio** — ícone em caixa tonal, título e **uma frase que diz o que fazer**. Nunca
"Nenhum dado".

### Bordas e agrupamento

Poucas bordas. Agrupe por **espaço e tint de fundo**, não por caixas empilhadas. Borda fica
para input; rodapé se separa por espaço, não por linha. Bordas quase brancas.

## 7. Usabilidade — o que diferencia este padrão

- **Teclado primeiro.** Enter navega e submete; `Ctrl+K` abre a busca global; `Esc` fecha
  overlay. Quem digita o dia inteiro não larga o teclado para clicar em "Salvar".
- **Form autoexplicativo.** Sem legenda e sem treinamento: contexto (unidade, período) vem
  primeiro, campos com respiro, observação em textarea, placeholders que **guiam com exemplo**
  (`Ex: João Silva`), não que repetem o label.
- **Padrão CRUD acima de tela solta.** Ação sobre item = ação de linha na lista; não invente
  um formulário avulso paralelo ao CRUD.
- **Use a área disponível.** Rolagem interna é último recurso; bloco alto demais vira
  colapsável, não rolável.
- **Feedback sempre.** Toast em toda mutação, confirm em toda exclusão, estado de loading em
  todo botão que dispara request.
- **Ninguém vê tela em branco.** Empty, loading e error são parte da tela, não polimento.
- **Riqueza vem de hierarquia e ritmo**, não de customização por tela. Onde investir, na
  ordem: (1) uma ação primária óbvia; (2) espaço em branco generoso entre blocos;
  (3) **um** destaque cromático; (4) estado vazio com texto útil; (5) micro-transições curtas;
  (6) SVG inline nos slots dos componentes.
- **O que não é riqueza — não faça:** card em `<div>` com CSS próprio, gradiente, sombra
  pesada, borda colorida à esquerda, ícone decorativo sem função, cor inventada para uma tela,
  tipografia fora da escala, animação longa em elemento de trabalho.

## 8. Documentos de impressão (a exceção)

Páginas de relatório/PDF são **documentos standalone** (rotas públicas, layout limpo,
renderizadas por um serviço à parte). São a **única** exceção à regra de tokens: usam CSS
próprio com valores literais, seguindo a mesma paleta. É papel — quase monocromático, sem
badge colorido.

Obrigatório em todo relatório:

- Cabeçalho com marca (logo + título + empresa), meta à direita, régua de acento abaixo.
- Resumo no topo quando fizer sentido (previsto × realizado, com as diferenças).
- Tabelas com zebra, cabeçalho leve sem grade por linha, números à direita com `tabular-nums`,
  totais em `tfoot`.
- **`print-color-adjust: exact` (e o prefixo `-webkit-`)** — sem isso o Chromium descarta os
  fundos e a zebra some no PDF mesmo aparecendo no HTML.
- Cabeçalho/rodapé repetidos em todas as páginas: envolva o conteúdo numa tabela com `thead`
  (`display: table-header-group`) e `tfoot` (`table-footer-group`).
- `break-inside: avoid` em blocos pequenos e em `tr`; `break-after: avoid` em títulos;
  `@page { size: A4; margin: 10mm }`.
- Sinalize o fim do render (`window.__REPORT_READY__ = true`) para o gerador esperar; trate
  loading e erro.

Um detector de estilo vai apontar cor e tamanho literais nesses arquivos — **é esperado** para
o meio de impressão. Alinhe à paleta, não "tokenize".
