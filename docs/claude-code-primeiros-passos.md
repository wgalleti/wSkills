# Claude Code — do zero ao uso (passo a passo)

Guia para quem nunca usou o [Claude Code](https://code.claude.com/docs): instalar,
logar, instalar as skills deste pacote e começar a trabalhar do jeito certo. Comandos
priorizando **Windows** (a maioria do time), com o equivalente para macOS e Linux.

Complemento obrigatório depois de instalar:
[claude-code-boas-praticas.md](claude-code-boas-praticas.md) — como usar sem
desperdiçar tokens (importante no plano Pro).

---

## Passo 0 — O que você precisa (e o que NÃO precisa)

- **Conta Claude com plano Pro** (ou superior). Plano gratuito não roda o Claude Code.
- **Windows 10 (1809+) / macOS 13+ / Ubuntu 20.04+**, 4 GB de RAM e internet.
- **Não precisa de Python.** O Claude Code é um binário nativo.
- **Não precisa de Node** para o Claude Code em si (o instalador nativo resolve).
  O Node entra só no passo 3, para instalar as skills via `npx` — instale o
  [Node LTS](https://nodejs.org) se ainda não tiver:

  ```powershell
  winget install OpenJS.NodeJS.LTS     # Windows
  ```
  ```bash
  brew install node                    # macOS
  ```

- **Windows: instale o [Git for Windows](https://git-scm.com/downloads/win).** Não é
  obrigatório, mas com ele o Claude Code usa o Git Bash como shell — os comandos se
  comportam igual aos exemplos da internet (que são quase todos em bash). Sem ele, cai
  no PowerShell.

## Passo 1 — Instalar

**Windows** — abra o PowerShell (Win+X → Terminal) e rode:

```powershell
irm https://claude.ai/install.ps1 | iex
```

**macOS / Linux / WSL:**

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Feche e abra o terminal de novo, e confirme:

```powershell
claude --version
claude doctor        # diagnóstico completo, se algo parecer errado
```

O instalador nativo **se atualiza sozinho** — você não precisa gerenciar versão.

> Instalou via `npm install -g @anthropic-ai/claude-code`? Funciona (exige Node 18+),
> mas não se atualiza sozinho. Prefira o instalador nativo.

**Diferenças entre sistemas, na prática:**

| | Windows | macOS / Linux |
|---|---|---|
| Shell usado | Git Bash (se instalado) ou PowerShell | bash/zsh |
| Caminhos | `C:\...` e `C:/...` funcionam; `~` = sua pasta de usuário | `~` normal |
| Pegadinhas | Evite acento/espaço no caminho do projeto; `claude` não achado → abra um terminal novo | — |
| WSL | Opcional — só se o projeto for Linux-first (Docker etc.); instale o Claude Code **dentro** do WSL nesse caso | — |

## Passo 2 — Logar

Entre na pasta de um projeto e rode:

```powershell
cd C:\projetos\meu-app
claude
```

Na primeira vez o navegador abre — faça login com a conta Claude (Pro). A credencial
fica salva (`%USERPROFILE%\.claude\` no Windows); não precisa logar de novo. Para
trocar de conta: `/login` dentro da sessão.

**Sobre o plano Pro:** o limite de uso renova em **janelas de 5 horas**. Acabou a
janela, espera renovar. Por isso o guia de boas práticas insiste em sessões e prompts
enxutos — é o que faz o Pro durar o dia.

## Passo 3 — Instalar as skills deste pacote

Skills são regras que o Claude carrega sozinho quando o assunto aparece — o time
inteiro trabalhando no mesmo padrão sem repetir instruções. Na pasta do projeto:

```powershell
npx @wgalleti/wskills list                          # ver o catálogo
npx @wgalleti/wskills add frontend-kickstart wpvc   # instalar no projeto
npx @wgalleti/wskills add mr --global               # instalar para todos os projetos
```

- **No projeto** (`.claude/skills/` — versionado no Git): skills do padrão daquele
  repositório. **Global** (`~/.claude/skills/`): método pessoal, vale em tudo.
- Reinicie a sessão do Claude Code e confirme com `/skills`.
- Atualizar depois: `npx @wgalleti/wskills status` e `update`.

## Passo 4 — Configurar o projeto (5 minutos que se pagam)

1. **Gere o CLAUDE.md**: dentro da sessão, rode `/init` — o Claude analisa o projeto e
   cria o arquivo. Depois **enxugue** (regras abaixo).
2. **Permissões**: `/permissions` e libere os comandos seguros e frequentes (testes,
   lint, git de leitura). Cada confirmação evitada é fluxo que não quebra.
3. **Preferências**: `/config` (tema, modelo, verbosidade).

**Regras do CLAUDE.md** (ele é lido em TODA sessão — cada linha custa em todo prompt):

- Alvo: **até ~60 linhas**. Passou de 100, tem prosa demais — corte ou mova para um
  doc em `docs/` e deixe só o apontador.
- Só o que o Claude **não descobre lendo o código**: comandos do projeto (build,
  teste), convenções ("commits em inglês, conventional"), proibições que já custaram
  tempo ("não rode format repo-wide").
- Frases curtas e imperativas. Nada de história do projeto, lista de arquivos ou
  documentação longa.
- Corrigiu o Claude duas vezes pela mesma coisa? Vira linha nova: *"adicione essa
  regra ao CLAUDE.md"*.
- Hierarquia: `~/.claude/CLAUDE.md` (pessoal, todos os projetos) → `CLAUDE.md` na raiz
  (regras do time, versionado) → por pasta (regras daquele app).

## Passo 5 — Usar (a rotina)

```text
claude                 inicia a sessão na pasta do projeto
claude -c              continua a conversa anterior
```

Dentro da sessão:

| Ação | Como |
|---|---|
| Pedir algo | Escreva **um objetivo por prompt**, com critério de aceite ("...e o teste X tem que passar") |
| Apontar um arquivo | `@caminho/arquivo` — nunca cole conteúdo grande no prompt |
| Tarefa grande | **Shift+Tab** (plan mode): o Claude planeja antes de mexer; você corrige a rota antes de gastar |
| Interromper | **ESC** — na dúvida, interrompa cedo |
| Bug visual | Cole o print (**Ctrl+V**) em vez de descrever |
| Terminou a tarefa | `/clear` — sessão nova para o próximo assunto |
| Sessão longa no meio da tarefa | `/compact` |
| Ajuda / situação | `/help` · `/status` · `/skills` |

Primeira sessão sugerida, para pegar o jeito:

```text
> o que faz este projeto?
> adicione validação de e-mail no formulário de cadastro; o lint tem que passar
> crie um commit para essas alterações
```

## Passo 6 — Ler o guia de economia

A partir daqui, o que separa quem faz o Pro durar o dia é hábito:
**[claude-code-boas-praticas.md](claude-code-boas-praticas.md)** — sessões e /clear,
prompts enxutos, markdowns de contexto (PLANO.md/NOTAS.md), rtk (filtra a saída dos
comandos) e graphify (pergunta ao grafo antes de vasculhar o código).

---

**Resumo de bolso:** instalador nativo (sem Python, sem Node) → `claude` e login Pro →
`npx @wgalleti/wskills add` → `/init` + CLAUDE.md ≤ 60 linhas → um objetivo por prompt,
`@arquivo`, Shift+Tab no grande, ESC cedo, `/clear` entre tarefas.

Fontes: [instalação](https://code.claude.com/docs/en/setup) ·
[quickstart](https://code.claude.com/docs/en/quickstart) ·
[configurações](https://code.claude.com/docs/en/settings) ·
[troubleshooting](https://code.claude.com/docs/en/troubleshoot-install)
