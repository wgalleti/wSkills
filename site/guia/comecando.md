# Começando

Uma **skill** é um conjunto de instruções que o Claude Code carrega sozinho quando a tarefa
combina com a descrição dela — regra de arquitetura, padrão de tela, convenção de commit.
Em vez de repetir "lembra que aqui a gente faz assim" a cada sessão, a regra mora num arquivo
versionado junto do projeto.

## Instalar

O CLI copia a pasta da skill para o diretório de skills do Claude Code. Não precisa de
install prévio nem de dependência de runtime:

```bash
# no projeto (fica em ./.claude/skills — versione junto do repositório)
npx @wgalleti/wskills add frontend-kickstart wpvc

# para todos os seus projetos (fica em ~/.claude/skills)
npx @wgalleti/wskills add mr --global

# tudo de uma vez
npx @wgalleti/wskills add --all
```

Reinicie a sessão do Claude Code depois de instalar. Confirme com `/skills` — a skill
aparece pelo `name` do frontmatter.

::: tip Não sabe por onde começar?
Instale tudo e diga **"quero criar um sistema"** — a skill
[`novo-projeto`](/skills/novo-projeto) é a porta de entrada: ela orquestra as demais na
ordem certa, sem você precisar conhecê-las. Guia detalhado, fase a fase:
[Criar um sistema](/guia/novo-projeto).
:::

**Sem acesso ao npm?** Clone e rode o CLI direto — o comportamento é idêntico:

```bash
git clone https://github.com/wgalleti/wSkills.git ~/wSkills
cd meu-projeto
node ~/wSkills/bin/wskills.mjs add frontend-kickstart
```

## Projeto ou global?

Skill que descreve como _este_ repositório trabalha (`portal-frontend`, `documento`,
`geojson`) vai **no projeto** e é versionada com ele — assim todo mundo do time e todo
agente pegam a mesma regra. Skill de método pessoal (`mr`) costuma render mais no
**global**.

## Comandos do CLI

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

## Atualizar

`npx` sempre busca a última versão publicada:

```bash
npx @wgalleti/wskills status   # vê o que está desatualizado ou editado
npx @wgalleti/wskills update   # reinstala tudo que foi instalado por aqui
```

O CLI grava um manifesto `.wskills.json` no diretório de skills com versão e checksum de
cada instalação. É ele que permite ao `add` **recusar sobrescrever uma skill que você
editou** — o aviso vem com a instrução de usar `--force` se a sobrescrita for mesmo o que
você quer.

Editou uma skill e quer manter a edição? Renomeie a pasta (e o `name:` do frontmatter):
ela sai do controle do CLI e vira sua.

## Adaptar ao seu projeto

`frontend-kickstart` e `wpvc` funcionam como vêm. `portal-frontend`, `documento`,
`geojson`, `manual-doc` e `projeto` descrevem regras de um portal específico e trazem um
bloco **"adapte ao instalar"** no topo: ajuste os caminhos de arquivo, os nomes de domínio
e os gotchas para a sua realidade, e apague o que não se aplica. Skill que descreve um
repositório que não é o seu vira ruído — e ruído o agente segue à risca.
