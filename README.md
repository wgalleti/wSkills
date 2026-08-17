# wSkills

Skills reutilizáveis de [Claude Code](https://claude.com/claude-code), extraídas de um portal
operacional em produção (Vue 3 + PrimeVue 4 + Django REST) e generalizadas para servir a
qualquer projeto com o mesmo stack.

Uma **skill** é um conjunto de instruções que o agente carrega sozinho quando a tarefa
combina com a descrição dela — regra de arquitetura, padrão de tela, convenção de commit.
Em vez de repetir "lembra que aqui a gente faz assim" a cada sessão, a regra mora num arquivo
versionado.

```bash
npx @wgalleti/wskills list                    # ver o catálogo
npx @wgalleti/wskills add frontend-kickstart  # instalar no projeto atual
```

## Catálogo

| Skill                    | Para quê                                                                                                                                                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`frontend-kickstart`** | **Iniciar um frontend novo** com o stack completo: bootstrap (Vite, PrimeVue 4 unstyled, Tailwind 4, Pinia), arquitetura em camadas, design system em tokens, regras de usabilidade e um `tokens.css` pronto para copiar. |
| **`portal-frontend`**    | **Trabalhar num app já montado** nesse padrão: regras inegociáveis, árvore de decisão de tela, o que fica no app × o que vai para a suite, gotchas que já custaram tempo.                                                 |
| **`wpvc`**               | API da suite `@wgalleti/primevue-components` (`W*`): setup, `useCrudManager`, `ColumnDef`/`FieldDef`, migração de código ad-hoc para os componentes.                                                                      |
| **`mr`**                 | Padrão editorial de Merge Request (Problema → Análise → Solução → Validação, legível por gestão não técnica) + regras de commit.                                                                                          |
| **`documento`**          | Escrever documento de projeto renderizado por `WMarkdownView`: vocabulário de marcação rica (alertas, passos, cards, abas, mermaid) e regras editoriais.                                                                  |
| **`prototipo-portal`**   | **Prototipar fora do portal** (Lovable, MVP, prova de conceito) já no padrão do destino: identidade visual com tokens prontos, os 7 padrões de tela e a forma de dados/API — para a conversão custar menos.               |

Detalhe de uma skill antes de instalar:

```bash
npx @wgalleti/wskills info portal-frontend
```

## Instalação

O CLI copia a pasta da skill para o diretório de skills do Claude Code. Não precisa de
install prévio nem de dependência de runtime.

```bash
# no projeto (fica em ./.claude/skills — versione junto do repositório)
npx @wgalleti/wskills add frontend-kickstart wpvc

# para todos os seus projetos (fica em ~/.claude/skills)
npx @wgalleti/wskills add mr --global

# tudo de uma vez
npx @wgalleti/wskills add --all
```

Reinicie a sessão do Claude Code depois de instalar. Confirme com `/skills` — a skill aparece
pelo `name` do frontmatter.

**Enquanto o pacote não estiver no npm** (ou se o seu npm bloquear fetch por git), clone e
rode o CLI direto — o comportamento é idêntico:

```bash
git clone https://github.com/wgalleti/wSkills.git ~/wSkills
cd meu-projeto
node ~/wSkills/bin/wskills.mjs add frontend-kickstart
```

**Projeto ou global?** Skill que descreve como _este_ repositório trabalha
(`portal-frontend`, `documento`) vai no projeto e é versionada com ele — assim todo mundo do
time e todo agente pegam a mesma regra. Skill de método pessoal (`mr`) costuma render mais no
global.

### Comandos

| Comando             | O que faz                                               |
| ------------------- | ------------------------------------------------------- |
| `list`              | lista o catálogo com um resumo de cada skill            |
| `info <skill>`      | descrição completa e arquivos que serão copiados        |
| `add <skill...>`    | instala (`--all` para todas)                            |
| `update [skill...]` | reinstala sobrescrevendo — traz a versão nova do pacote |
| `remove <skill...>` | remove skills instaladas                                |
| `status`            | o que está instalado, em que versão, e o que divergiu   |

| Flag              | Efeito                                                    |
| ----------------- | --------------------------------------------------------- |
| `-g`, `--global`  | instala em `~/.claude/skills`                             |
| `--dir <caminho>` | diretório alvo (default: `./.claude/skills`)              |
| `--all`           | todas as skills do catálogo                               |
| `-f`, `--force`   | sobrescreve skill existente, inclusive editada localmente |
| `--dry-run`       | mostra o que faria, sem escrever nada                     |
| `--json`          | saída em JSON (`list`, `status`)                          |

### Atualizar

`npx` sempre busca a última versão publicada, então:

```bash
npx @wgalleti/wskills status   # vê o que está desatualizado ou editado
npx @wgalleti/wskills update   # reinstala tudo que foi instalado por aqui
```

O CLI grava um manifesto `.wskills.json` no diretório de skills com versão e checksum de cada
instalação. É ele que permite ao `add` **recusar sobrescrever uma skill que você editou** — o
aviso vem com a instrução de usar `--force` se a sobrescrita for mesmo o que você quer.

Editou uma skill e quer manter a edição? Renomeie a pasta (e o `name:` do frontmatter): ela
sai do controle do CLI e vira sua.

## Usar no Lovable (e em IAs sem suporte a skills)

A skill `prototipo-portal` existe também em formato "cola e usa": o arquivo
`skills/prototipo-portal/references/lovable-knowledge.md` reúne os três guias
(identidade visual, padrões de frontend, dados/API) num markdown único, sem nada
específico de Claude Code.

**Passo a passo no Lovable:**

1. Abra (ou crie) o projeto no Lovable.
2. Clique no nome do projeto → **Settings** (engrenagem) → seção **Knowledge**.
   O Knowledge é um texto que o Lovable relê em **toda** geração do projeto — é o lugar
   certo para o guia valer sempre, sem repetir a cada prompt.
3. Copie o conteúdo inteiro de `skills/prototipo-portal/references/lovable-knowledge.md`
   e cole no campo. Salve.
4. No primeiro prompt, reforce:

   > Siga o Knowledge do projeto como direção de design e de dados: ele descreve o
   > sistema final para onde este protótipo será convertido. Em conflito, prefira o
   > guia — mas proponha algo melhor quando tiver motivo, sinalizando o desvio.

Projeto que **já existe** no Lovable: cole o Knowledge do mesmo jeito e peça num prompt
"alinhe o visual ao design system descrito no Knowledge". Se a interface mudar de lugar,
procure por "Knowledge" nas configurações do projeto — o conceito permanece.

**Outras IAs:** ChatGPT/Gemini — crie um Project/GPT com o arquivo como conhecimento;
v0/Bolt — cole no prompt inicial.

O arquivo é **gerado** a partir dos guias em `references/` (o cabeçalho dele diz como
regenerar). Edite os guias, nunca o gerado.

## Começando no Claude Code

Time novo no Claude Code (principalmente no plano Pro, onde token conta):

**[docs/claude-code.md](docs/claude-code.md)** — guia completo, do zero a produtivo:
instalar (Windows/macOS/Linux, passo a passo com o terminal na mão), logar, instalar
as skills deste pacote, montar o CLAUDE.md com prompt pronto, a rotina de trabalho que
faz o Pro render o dia, e as ferramentas que multiplicam o plano (rtk, graphify,
ccusage, MCPs) — quase tudo instalado pedindo ao próprio Claude.

## Adaptar ao seu projeto

`frontend-kickstart` e `wpvc` funcionam como vêm. `portal-frontend` e `documento` descrevem
regras de um portal específico e trazem um bloco **"adapte ao instalar"** no topo: ajuste os
caminhos de arquivo, o nome da paleta e os gotchas para a sua realidade, e apague o que não
se aplica. Skill que descreve um repositório que não é o seu vira ruído — e ruído o agente
segue à risca.

## Contribuir

Veja [CONTRIBUTING.md](CONTRIBUTING.md). Em resumo: uma pasta por skill em `skills/`, com
`SKILL.md` (frontmatter `name` + `description`) e o material pesado em `references/`. Antes de
abrir PR:

```bash
npm run validate
```

O validador checa estrutura (frontmatter, `name` batendo com a pasta, referências existentes)
e **vazamento**: caminho absoluto de máquina, token, IP interno, e-mail. Este repositório é
público — nome de cliente e de pessoa não entram nas skills.

```bash
yarn validate   # estrutura + vazamento
yarn smoke      # instala o catálogo num tmp e confere o ciclo do CLI
yarn format     # prettier
```

Release e publicação no npm: [PUBLISHING.md](PUBLISHING.md) — bump por
`commit-and-tag-version` a partir dos conventional commits, publicação manual
(`yarn release:publish`).

## Licença

[MIT](LICENSE).
