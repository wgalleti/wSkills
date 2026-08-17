# Claude Code — boas práticas de uso

Guia para quem está começando a usar o [Claude Code](https://claude.com/claude-code) no
dia a dia, **especialmente no plano Pro**, onde o limite de uso renova em janelas de
5 horas e cada token conta. A regra geral por trás de tudo: **o Claude reenvia a
conversa inteira a cada mensagem** — contexto enxuto não é frescura, é o que faz o
plano render o dia inteiro.

## 1. Sessões: limpe cedo, limpe sempre

- **Uma tarefa por sessão.** Terminou a tarefa (ou mudou de assunto), rode `/clear`.
  Continuar "na mesma conversa" arrasta todo o histórico anterior para dentro de cada
  novo prompt — você paga por ele a cada mensagem, sem ganhar nada.
- Sessão ficou longa no meio de uma tarefa que ainda não acabou? `/compact` resume o
  histórico e libera espaço. Use quando o Claude começar a "esquecer" o começo ou
  quando a sessão passar de dezenas de mensagens.
- Precisa parar hoje e retomar amanhã? Peça antes de sair: *"resuma o estado desta
  frente num arquivo `NOTAS.md`"* — amanhã, sessão nova + `@NOTAS.md` custa uma fração
  de reabrir a conversa gigante.
- Errou o rumo? **ESC interrompe** a geração na hora. Interromper cedo é a maior
  economia que existe — não deixe o agente completar 10 minutos de caminho errado para
  só então corrigir.

## 2. CLAUDE.md: a memória barata do projeto

O `CLAUDE.md` é lido **em toda sessão** do projeto. É onde mora o que você não quer
repetir nunca mais ("aqui usamos yarn, não npm"; "commits em inglês, conventional").

- **Regra, não prosa.** Frases curtas e imperativas. "Não rode `yarn format` repo-wide"
  vale ouro; três parágrafos sobre a história do projeto valem tokens jogados fora —
  porque **cada linha do CLAUDE.md entra em todo prompt**.
- O que colocar: comandos do projeto (build, teste, lint), convenções que o código não
  mostra sozinho, proibições que já custaram tempo, apontadores para docs maiores.
- O que **não** colocar: nada que o Claude descobre lendo o código, listas de arquivos,
  documentação longa (esta vai num doc separado, referenciado pelo caminho).
- Hierarquia: `~/.claude/CLAUDE.md` (suas preferências pessoais, valem em todo projeto)
  → `CLAUDE.md` na raiz do repo (regras do time, versionado) → `CLAUDE.md` por pasta
  (regras daquele app). Cada regra no nível mais específico possível.
- Manutenção: quando você corrigir o Claude pela segunda vez sobre a mesma coisa, isso
  é uma linha nova do CLAUDE.md. Peça: *"adicione essa regra ao CLAUDE.md"*.

## 3. Prompts e tarefas enxutas

- **Um objetivo por prompt.** "Corrige o filtro de data da listagem de pedidos" rende;
  "dá uma geral no módulo de pedidos" queima tokens explorando sem direção.
- **Aponte, não cole.** Referencie arquivos com `@caminho/arquivo` ou cite o caminho —
  o Claude lê o que precisar. Colar arquivos e logs gigantes no prompt é o desperdício
  mais comum; log grande → salve num arquivo e aponte.
- Dê o critério de aceite junto: *"...o teste X tem que passar"* / *"...a tela deve
  continuar funcionando no dark"*. Poupa a rodada de "não era isso".
- Tarefa grande ou arriscada? Entre no **plan mode** (Shift+Tab) — o Claude propõe o
  plano antes de tocar em arquivo, e você corrige a rota **antes** de gastar a execução.
- Responda perguntas do Claude direto e curto. Ele perguntou "A ou B?" — responda "A",
  não um parágrafo.
- Tarefas repetitivas do time viram **skill** (é para isso que este pacote existe):
  instrução escrita uma vez, carregada só quando o assunto aparece — mais barato que
  repetir no prompt e mais confiável que memória de conversa.

## 4. Markdowns de contexto (planos, notas, estado)

Para frentes que atravessam dias, mantenha o estado **em arquivo**, não na conversa:

- `PLANO.md` / `NOTAS.md` da frente: o que foi decidido, o que falta, gotchas
  descobertos. A sessão nova começa com `@PLANO.md` e está situada em segundos.
- Peça ao próprio Claude para manter: *"marque este item como feito no PLANO.md"*.
- Documento de análise/decisão grande fica em `docs/` e é **referenciado** quando
  relevante — nunca colado no CLAUDE.md nem repetido em prompt.

## 5. rtk — comandos de terminal sem inchaço

O rtk (Rust Token Killer) é um proxy de CLI que filtra a saída dos comandos de
desenvolvimento (git, testes, builds) antes de ela entrar na conversa — economia típica
de **60–90% dos tokens** dessas saídas, que são das maiores da sessão.

- Com o hook configurado, é transparente: o Claude roda `git status` e o hook reescreve
  para `rtk git status`. Você não faz nada.
- `rtk gain` mostra quanto já foi economizado; `rtk discover` analisa seu histórico e
  aponta oportunidades perdidas.
- Saída estranha/faltando algo? `rtk proxy <cmd>` roda o comando cru, sem filtro.

## 6. graphify — perguntar ao grafo antes de vasculhar

O graphify mantém um **grafo de conhecimento do repositório** (`graphify-out/`). Para
perguntas de arquitetura e navegação, ele devolve um subgrafo pequeno — muito mais
barato do que deixar o agente grepear e ler dezenas de arquivos.

- Pergunta sobre o código? `graphify query "onde nasce o saldo de estoque?"` antes de
  qualquer grep/leitura ampla.
- Relação entre duas coisas: `graphify path "A" "B"`. Conceito focado:
  `graphify explain "conceito"`.
- **Depois de mexer no código**, `graphify update .` (só AST, sem custo de API) — grafo
  desatualizado gera resposta errada, e resposta errada custa uma rodada inteira.

## 7. Miscelânea que economiza

- **Permissões**: aprove em allowlist os comandos seguros e frequentes do projeto
  (testes, lint, git de leitura) — cada prompt de permissão interrompe o fluxo e induz
  rodadas extras.
- **Imagem vale por mil tokens**: bug visual? Cole o print (Ctrl+V) em vez de
  descrever a tela em texto.
- `/skills` lista as skills carregáveis; skill que nunca dispara tem descrição ruim —
  ajuste a descrição, não desista da skill.
- Não peça formatação/refactor repo-wide "aproveitando" — churn gigante, revisão
  impossível e tokens queimados. Formate só o que a tarefa tocou.
- Fim da janela de 5h chegando? Priorize fechar a tarefa em andamento e deixe as
  exploratórias para a próxima janela — tarefa pela metade é o pior gasto.
- Reserve o começo da janela para o trabalho pesado (implementação); revisão de texto e
  perguntas conceituais custam pouco e cabem em qualquer sobra.

---

**Resumo de bolso:** sessão limpa por tarefa · CLAUDE.md curto e imperativo · um
objetivo por prompt · aponte arquivos em vez de colar · estado da frente em markdown ·
rtk filtra a saída · graphify responde antes do grep · ESC cedo, sempre.
