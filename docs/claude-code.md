# Claude Code — guia completo: do zero a produtivo

O [Claude Code](https://claude.com/claude-code) é um agente de programação que roda no
seu terminal: você descreve o que quer em português e ele lê o projeto, edita os
arquivos, roda testes e cria commits. Este guia pega quem nunca abriu um terminal e
leva até o uso produtivo do dia a dia — instalação, skills, CLAUDE.md, ferramentas de
economia de token e os hábitos que fazem o plano Pro durar o dia inteiro.

A regra de ouro que explica quase tudo aqui: **o Claude reenvia a conversa inteira a
cada mensagem**. Sessão limpa, prompt direto e contexto enxuto não são frescura — são o
que faz o plano render.

Só a instalação do Claude Code é manual. **Todo o resto você pede para o próprio
Claude fazer** — os prompts prontos estão marcados assim ao longo do guia:

> 💬 _prompt pronto — copie, cole na sessão do Claude e dê Enter_

---

## Parte 1 — Instalar o Claude Code

### 1.1 O que você precisa

- **Conta Claude com plano Pro** (ou superior) — crie em [claude.ai](https://claude.ai).
  Plano gratuito não roda o Claude Code.
- **Windows 10 (1809+), macOS 13+ ou Ubuntu 20.04+**, 4 GB de RAM e internet.
- **Nada de Python, nada de Node** para instalar: o Claude Code é um programa nativo
  que se instala com um único comando e **se atualiza sozinho**.

### 1.2 Abrir o terminal

**Windows:** aperte a tecla **Windows**, digite `powershell` e dê **Enter**. Abre uma
janela azul/preta com um cursor piscando — é ali que você digita os comandos.

**macOS:** aperte **Cmd + Espaço**, digite `terminal` e dê **Enter**.

**Linux:** **Ctrl + Alt + T** na maioria das distribuições.

### 1.3 Rodar o instalador

Copie o comando do seu sistema, cole no terminal (no Windows: botão direito cola) e dê
**Enter**:

**Windows (PowerShell):**

```powershell
irm https://claude.ai/install.ps1 | iex
```

**macOS / Linux:**

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

O instalador baixa e configura tudo — leva menos de um minuto. Ao final ele mostra uma
mensagem de sucesso com a versão instalada.

### 1.4 Conferir

**Feche o terminal e abra um novo** (isso é obrigatório — o terminal antigo não conhece
o comando novo). Depois:

```powershell
claude --version
```

Apareceu um número de versão? Instalado. Algo estranho? `claude doctor` roda um
diagnóstico completo e diz o que corrigir.

| Problema                                         | Solução                                                                    |
| ------------------------------------------------ | -------------------------------------------------------------------------- |
| `claude: comando não encontrado`                 | Feche e abra o terminal de novo (de verdade — janela nova)                 |
| Instalação bloqueada por antivírus/política      | Rode o PowerShell como administrador só para instalar                      |
| Projeto em pasta com acento ou espaço no caminho | Mova para um caminho simples (`C:\projetos\meu-app`) — evita dor de cabeça |

### 1.5 Diferenças entre sistemas (o que muda na prática)

|                        | Windows                                                                                                      | macOS / Linux |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ | ------------- |
| Shell que o Claude usa | Git Bash (se instalado) ou PowerShell                                                                        | bash/zsh      |
| Caminhos               | `C:\...` funciona; `~` = sua pasta de usuário                                                                | `~` normal    |
| WSL                    | Opcional — só se o projeto for Linux-first (Docker etc.); nesse caso instale o Claude Code **dentro** do WSL | —             |

**Windows:** instale também o [Git for Windows](https://git-scm.com/downloads/win)
(baixe, next-next-finish serve). Com ele o Claude Code passa a usar o Git Bash como
shell e os comandos se comportam igual aos exemplos da internet, que são quase todos em
bash. E o Git em si você vai precisar de qualquer forma.

## Parte 2 — Logar e rodar a primeira sessão

Entre na pasta de um projeto e inicie:

```powershell
cd C:\projetos\meu-app
claude
```

Na primeira vez o navegador abre — faça login com a sua conta Claude (Pro). A
credencial fica salva; você não loga de novo. Para trocar de conta depois: `/login`
dentro da sessão.

Agora converse. Primeira sessão sugerida, para sentir o fluxo:

> 💬 `o que faz este projeto? me explique em 5 linhas`

> 💬 `adicione validação de e-mail no formulário de cadastro; o lint tem que passar`

> 💬 `crie um commit para essas alterações`

**Sobre o plano Pro:** o limite de uso renova em **janelas de 5 horas**. Acabou a
janela, espera renovar. Tudo da Parte 5 em diante existe para essa janela render — quem
segue os hábitos trabalha o dia inteiro no Pro.

A partir daqui você não instala mais nada na mão: **peça ao Claude**. Ele baixa,
instala, configura e confere — e se algo der errado, ele mesmo corrige. Exemplo, se
ainda não tem o Node (necessário para o passo seguinte):

> 💬 _instale o Node LTS nesta máquina (winget no Windows, brew no macOS), confirme com `node --version` e me diga se preciso reabrir o terminal_

## Parte 3 — Instalar as skills

Uma **skill** é uma instrução que o Claude carrega sozinho quando o assunto aparece —
o padrão do time escrito uma vez, seguido em toda sessão, sem repetir prompt. Este
pacote traz as skills do nosso stack (Vue 3 + PrimeVue + Django REST). Na pasta do
projeto:

```powershell
npx @wgalleti/wskills list                          # ver o catálogo
npx @wgalleti/wskills add frontend-kickstart wpvc   # instalar no projeto
npx @wgalleti/wskills add mr --global               # instalar para todos os projetos
```

- **No projeto** (`.claude/skills/`, versionado no Git): skills do padrão daquele
  repositório — o time inteiro pega a mesma regra.
- **Global** (`~/.claude/skills/`): método pessoal, vale em qualquer projeto.
- Reinicie a sessão do Claude Code e confirme com `/skills`.
- Depois, `npx @wgalleti/wskills status` mostra o que está desatualizado e
  `npx @wgalleti/wskills update` atualiza.

Skill que nunca dispara tem descrição ruim — ajuste a descrição, não desista da skill.
E toda tarefa repetitiva do time é candidata a virar skill nova: instrução escrita uma
vez custa menos que repetida em cada prompt, e é mais confiável que memória de conversa.

## Parte 4 — CLAUDE.md: a memória do projeto

O `CLAUDE.md` na raiz do projeto é lido **em toda sessão**. É onde mora o que você não
quer repetir nunca mais: "aqui usamos yarn, não npm", "commits em inglês", "não rode
format no repositório inteiro". O caminho depende de onde você está:

**Projeto existente** — o Claude analisa o que já está lá:

> 💬 _Analise este projeto e crie um CLAUDE.md de **no máximo 60 linhas**. Inclua apenas: os comandos do projeto (rodar, testar, lint, build), as convenções que o código não mostra sozinho e as proibições importantes. Frases curtas e imperativas, uma regra por linha. NÃO inclua: história do projeto, lista de arquivos, descrição da arquitetura nem nada que você descobre lendo o código._

**Projeto novo, do zero** — não existe código para analisar, então a ordem inverte:
primeiro instale as skills de bootstrap (Parte 3 — `frontend-kickstart` para um
frontend no nosso stack), descreva o que quer construir e deixe o Claude montar a
estrutura; o CLAUDE.md nasce **no final**, registrando as decisões tomadas:

> 💬 _Quero começar um projeto novo: [descreva em 3–5 linhas o que é, para quem e o stack se já souber]. Use a skill frontend-kickstart como base, monte a estrutura inicial e me mostre o plano antes de criar os arquivos._

> 💬 _Agora crie o CLAUDE.md deste projeto (máximo 60 linhas): os comandos que acabamos de definir, as convenções que escolhemos e o que NÃO fazer. Uma regra por linha, imperativa._

**Já tem um CLAUDE.md** (seu ou gerado pelo `/init`) e ele está gordo? Otimize:

> 💬 _Revise o CLAUDE.md deste projeto. Corte para no máximo 60 linhas: remova tudo que você descobre sozinho lendo o código (arquitetura, lista de arquivos, história), funda regras repetidas, converta prosa em frases imperativas de uma linha e mova conteúdo longo para `docs/` deixando só o apontador. Me mostre o diff antes de salvar._

Regras de manutenção (cada linha do CLAUDE.md entra em **todo** prompt — linha inútil
é custo permanente):

- **Alvo: até ~60 linhas.** Passou de 100, tem prosa demais — corte ou mova o conteúdo
  para um doc em `docs/` e deixe só o apontador.
- **Regra, não prosa.** "Não rode `yarn format` repo-wide" vale ouro; três parágrafos
  sobre a história do projeto valem tokens jogados fora.
- Corrigiu o Claude **duas vezes** pela mesma coisa? É uma linha nova. Peça na hora:
  > 💬 _adicione essa regra ao CLAUDE.md, em uma linha imperativa_
- Hierarquia: `~/.claude/CLAUDE.md` (pessoal, vale em tudo) → `CLAUDE.md` da raiz
  (regras do time, versionado) → `CLAUDE.md` por pasta (regras daquele app). Cada regra
  no nível mais específico possível.

Aproveite e configure mais duas coisas, dentro da sessão:

- `/permissions` — libere os comandos seguros e frequentes (testes, lint, git de
  leitura). Cada confirmação evitada é fluxo que não quebra.
- `/config` — tema, modelo e preferências.

## Parte 5 — A rotina de trabalho

```text
claude       inicia a sessão na pasta do projeto
claude -c    continua a conversa anterior
```

| Situação                       | O que fazer                                                                                                     |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Pedir algo                     | **Um objetivo por prompt**, com critério de aceite: _"...e o teste X tem que passar"_                           |
| Apontar um arquivo             | `@caminho/arquivo` — **nunca cole conteúdo grande** no prompt; log gigante → salve em arquivo e aponte          |
| Tarefa grande ou arriscada     | **Shift+Tab** (plan mode): o Claude planeja antes de mexer e você corrige a rota **antes** de gastar a execução |
| Rumo errado                    | **ESC** interrompe na hora — interromper cedo é a maior economia que existe                                     |
| Bug visual                     | Cole o print (**Ctrl+V**) em vez de descrever a tela                                                            |
| Claude perguntou "A ou B?"     | Responda "A" — direto, sem parágrafo                                                                            |
| Terminou a tarefa              | `/clear` — sessão nova para o próximo assunto                                                                   |
| Sessão longa no meio da tarefa | `/compact` resume o histórico e libera espaço                                                                   |
| Perdido                        | `/help` · `/status` · `/skills`                                                                                 |

**Por que `/clear` importa tanto:** continuar "na mesma conversa" arrasta todo o
histórico para dentro de cada novo prompt — você paga por ele a cada mensagem, sem
ganhar nada. Uma tarefa por sessão, limpou, próxima.

**Frentes que atravessam dias** ficam em arquivo, não na conversa:

- Mantenha um `PLANO.md`/`NOTAS.md` da frente: o que foi decidido, o que falta, as
  pegadinhas descobertas. Peça ao próprio Claude para mantê-lo:
  > 💬 _marque este item como feito no PLANO.md e anote a decisão que tomamos_
- Vai parar por hoje? Antes de sair:

  > 💬 _resuma o estado desta frente no NOTAS.md para eu retomar amanhã_

  Amanhã, sessão nova + `@NOTAS.md` custa uma fração de reabrir a conversa gigante.

**Gerindo a janela de 5h:** reserve o começo para o trabalho pesado (implementação);
revisão de texto e perguntas conceituais custam pouco e cabem em qualquer sobra. Janela
acabando? Feche a tarefa em andamento — tarefa pela metade é o pior gasto.

## Parte 6 — Ferramentas que multiplicam o plano

Duas ferramentas cortam o maior desperdício de uma sessão: saída de comando gigante e
exploração cega de código. Instale as duas pedindo ao Claude.

### rtk — saída de comando sem inchaço

O [rtk (Rust Token Killer)](https://www.rtk-ai.app/) é um proxy de linha de comando:
ele roda o comando de verdade (git, testes, build) e **filtra a saída antes de ela
entrar na conversa** — tipicamente 60–90% menos tokens nessas saídas, que são das
maiores da sessão. Com o hook configurado é transparente: o Claude pede `git status` e
o hook reescreve para `rtk git status`, sem você fazer nada.

> 💬 _instale o rtk (Rust Token Killer, https://www.rtk-ai.app — no macOS é `brew install rtk`; em outros sistemas siga o site) e configure o hook dele no Claude Code para reescrever os comandos automaticamente. Confirme com `rtk --version` e `rtk gain`._

Comandos úteis depois de instalado:

```bash
rtk gain          # quanto já foi economizado
rtk discover      # analisa seu histórico e aponta oportunidades perdidas
rtk proxy <cmd>   # roda o comando cru, sem filtro (quando a saída filtrada esconder algo)
```

### graphify — perguntar ao grafo antes de vasculhar

O [graphify](https://github.com/Graphify-Labs/graphify) transforma o repositório num
**grafo de conhecimento** (`graphify-out/`) e instala uma skill no Claude Code. Para
perguntas de arquitetura ("onde nasce o saldo?", "quem chama esse service?"), o agente
consulta o grafo e recebe um subgrafo pequeno — muito mais barato do que deixá-lo
grepear e ler dezenas de arquivos.

> 💬 _instale o graphify (https://github.com/Graphify-Labs/graphify — pacote `graphifyy`, via `uv tool install graphifyy`; instale o uv antes se precisar), rode `graphify install` para registrar a skill no Claude Code e depois gere o grafo deste projeto._

Uso no dia a dia:

```bash
graphify query "onde nasce o saldo de estoque?"   # pergunta ampla sobre o código
graphify path "ModelA" "ServiceB"                 # relação entre duas coisas
graphify explain "conceito"                        # um conceito focado
graphify update .                                  # DEPOIS de mexer no código (rápido, sem custo de API)
```

Grafo desatualizado gera resposta errada, e resposta errada custa uma rodada inteira —
o `update` depois de mexer faz parte do fluxo.

### ccusage — saber quanto você gasta

Dentro da sessão, `/usage` já mostra o estado da sua janela. Para o histórico completo,
o [ccusage](https://github.com/ryoppippi/ccusage) lê os logs locais do Claude Code (sem
conta, sem chave de API) e imprime relatórios por dia, por sessão e por janela de 5h —
é como você descobre **onde** o plano está indo embora e se os hábitos deste guia estão
funcionando:

```bash
npx ccusage            # relatório diário
npx ccusage blocks     # por janela de 5 horas
```

### MCPs — plugins que dão novos poderes ao Claude

MCP (Model Context Protocol) é o formato de plugin do Claude Code: um "server" MCP dá
ao agente uma capacidade nova. Dois que valem para o nosso fluxo:

- **[Context7](https://github.com/upstash/context7)** — documentação **atualizada e da
  versão certa** de qualquer biblioteca (Vue, PrimeVue, Django…). Sem ele, o Claude
  responde da memória, que pode estar defasada.
  > 💬 _adicione o MCP do Context7 (https://github.com/upstash/context7) na minha configuração do Claude Code e confirme com /mcp_
- **[Playwright MCP](https://github.com/microsoft/playwright-mcp)** — um navegador que
  o Claude controla: ele abre a tela que acabou de mexer, clica, preenche e tira
  screenshot para **verificar o próprio trabalho** em vez de supor que funcionou.
  > 💬 _adicione o MCP do Playwright (https://github.com/microsoft/playwright-mcp) na minha configuração do Claude Code e confirme com /mcp_

**Não colecione MCPs.** Cada server instalado consome contexto de toda sessão — a
mesma moeda que o CLAUDE.md gasta. Três a cinco bem escolhidos é o teto; instale
quando sentir a falta, remova o que não usa (`claude mcp list` / `claude mcp remove`).

### frontend-design — visuais que não parecem feitos por IA

Sem direção, todo agente de IA produz a mesma tela: fonte Inter, gradiente roxo, cards
em grade — o "cara de template" que faz qualquer um preferir um Lovable da vida. O
[frontend-design](https://claude.com/plugins/frontend-design) é o plugin **oficial da
Anthropic** que corrige isso: antes de escrever uma linha de CSS, ele obriga o Claude a
definir propósito, público e uma direção estética de verdade — tipografia com
personalidade, paleta intencional, movimento que parece de designer sênior. Instalação
é uma linha, dentro da sessão:

```text
/plugin install frontend-design@claude-plugins-official
```

Depois é só pedir a tela normalmente — a skill ativa sozinha quando o assunto é
interface. O combo que gera os melhores resultados:

1. **frontend-design** dá a ousadia estética;
2. as skills deste pacote (`frontend-kickstart`/`prototipo-portal`) seguram a
   identidade — tokens, cores e padrões do produto — para o ousado continuar **no
   nosso** design system;
3. **Playwright MCP** fecha o ciclo: o Claude abre a tela que criou, olha o resultado
   e refina sozinho.

> 💬 _crie a tela de [descreva] usando o design system do projeto; depois abra no navegador, tire um screenshot e refine o que não estiver à altura_

## Parte 7 — Resumo de bolso

1. Instalar: `irm https://claude.ai/install.ps1 | iex` (Windows) — terminal novo —
   `claude --version`.
2. `cd` no projeto → `claude` → login Pro no navegador.
3. Skills: `npx @wgalleti/wskills add ...` → reiniciar sessão → `/skills`.
4. CLAUDE.md pelos prompts prontos da Parte 4 (criar, começar do zero ou otimizar) —
   **até ~60 linhas**, regra por linha.
5. Rotina: um objetivo por prompt · `@arquivo` em vez de colar · Shift+Tab no grande ·
   ESC cedo · print no visual · `/clear` entre tarefas · estado da frente em markdown.
6. rtk filtra a saída · graphify responde antes do grep · `graphify update .` depois de
   mexer · `npx ccusage` para ver onde o plano vai · MCPs com moderação (Context7,
   Playwright) · frontend-design para tela bonita de verdade.

Fontes oficiais: [instalação](https://code.claude.com/docs/en/setup) ·
[quickstart](https://code.claude.com/docs/en/quickstart) ·
[configurações](https://code.claude.com/docs/en/settings) ·
[troubleshooting](https://code.claude.com/docs/en/troubleshoot-install)
