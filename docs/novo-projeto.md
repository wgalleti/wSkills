# Guia de uso — novo-projeto

Como tirar uma ideia do papel usando a skill `novo-projeto`, sem conhecer nenhuma outra
skill. Este guia é para quem vai usar; o agente tem as instruções dele na própria skill.

## O que você precisa

- **Node ≥ 20** instalado (confira com `node --version`; instale em nodejs.org).
  Sem Docker, sem WSL, sem banco de dados.
- Claude Code com as skills instaladas:

  ```bash
  npx @wgalleti/wskills add --all
  ```

- Uma pasta vazia para o projeto e a sua ideia.

## Como funciona

Você conversa; o agente conduz por **fases**, uma por vez, e só avança quando você
aprova. Todo o combinado fica escrito em `docs/` — se a sessão cair ou trocar de
máquina, nada se perde: o próximo agente lê os docs e continua de onde parou. É isso
que mantém o processo barato e direto: **o contexto mora nos arquivos, não na conversa**.

Para começar, basta dizer:

> Quero criar um sistema para controlar os reembolsos de despesas da equipe.

## As fases, com exemplos

### Fase 1 — Contar a ideia (vira documentação)

O agente entra em modo de planejamento e faz perguntas simples, uma por vez — de
negócio, nunca de tecnologia:

> **Agente:** Que problema você quer resolver?
> **Você:** Reembolso é pedido por e-mail e o financeiro perde pedidos.
> **Agente:** Quem vai usar? …

Ao final ele mostra um rascunho de quatro arquivos e pede seu OK:

| Arquivo              | O que guarda                                         |
| -------------------- | ---------------------------------------------------- |
| `docs/context.md`    | a história: problema, quem usa, direção              |
| `docs/tasks.md`      | as tarefas, em ondas, com caixinhas para marcar      |
| `docs/notes.md`      | regras e detalhes (inclusive os campos de cada dado) |
| `docs/validation.md` | o que precisa estar funcionando para estar pronto    |

**Seu papel:** corrigir a história antes de aprovar. É muito mais barato ajustar aqui
do que depois de construído. Não aprove o que não entendeu.

### Fase 2 — Dados vivos (a API sobe)

O agente transforma os campos descritos em `docs/notes.md` num pequeno servidor local e
mostra funcionando:

> **Agente:** A API está no ar em `http://localhost:8000/api/pedidos-reembolso/` —
> abra no navegador e veja os dois pedidos de exemplo.

**Seu papel:** conferir se os campos e as opções de status são os da vida real
("faltou o centro de custo", "não existe status 'em análise'"). Mudou? Ele ajusta o
`notes.md` e o servidor juntos — os dois nunca divergem.

### Fase 3 — Telas

O agente monta o frontend no visual do portal (o mesmo padrão para onde o projeto pode
ser convertido depois) e começa **pela tela que resolve o problema**, não pela mais
fácil.

**Seu papel:** usar a tela e reagir ao que vê — "o valor tinha que aparecer antes do
status", "falta um aviso quando recusar". Reação concreta sobre tela concreta rende mais
que descrição abstrata.

### Fase 4 — Trabalhar por ondas

Daqui em diante o ritmo é o do `docs/tasks.md`: o agente pega a próxima tarefa, faz,
marca a caixinha e confere o `validation.md`. Fechou uma onda, ele mostra o resultado e
só abre a próxima com o seu aval.

Frases úteis nessa fase:

> "Continua o projeto." · "O que falta na onda atual?" · "Surgiu uma ideia nova: …"
> (ela vira tarefa ou nota — nada se faz por fora dos docs).

### Fase 5 — Virar sistema de verdade

Quando o protótipo provar seu valor, ele pode ser absorvido pela estrutura da
organização (portal, autenticação, banco de verdade). A documentação que você construiu
**é** o material da conversão: quem converter não vai te entrevistar — vai ler os docs.
Peça "prepara o projeto para conversão" e o agente confere se está tudo lá.

## Prompts prontos

Copie, preencha os `[colchetes]` com a sua realidade e envie. Prompt bom já diz o
contexto e o limite — o agente não gasta idas e voltas adivinhando.

**Criar o projeto (fase 1):**

> Quero criar um sistema para [o problema que você quer resolver]. Hoje isso é feito
> [como é feito hoje — planilha, e-mail, papel] e o maior problema é [a dor principal].
> Quem vai usar: [os papéis — ex.: vendedores e o gerente]. Me conduza pelas fases do
> novo-projeto, uma pergunta por vez.

**Retomar em qualquer sessão nova:**

> Continua o projeto. Leia os docs e me diga em uma frase onde paramos e qual é a
> próxima tarefa da onda atual — depois siga nela.

**Ideia nova no meio do caminho:**

> Surgiu uma ideia: [descreva em 1–3 frases]. Registre no lugar certo dos docs (tarefa
> ou nota) e me diga em qual onda entra. Não comece a fazer ainda.

**Ajustar uma tela:**

> Na tela de [nome da tela], [o que mudar — ex.: mostrar o valor antes do status].
> Mude só isso; se alguma regra mudar junto, atualize os docs.

**Tela ficou pobre / mal aproveitada:**

> A tela de [nome da tela] ficou pobre: [ex.: espaço mal usado, a imagem não aparece].
> Use a skill ui-rica: revise a tela pelo checklist dela, aproveite os componentes que
> já existem no projeto e aplique o mesmo padrão nas outras telas com o mesmo problema.

**Mudança de regra de negócio:**

> A regra de [assunto] mudou: agora [a regra nova — ex.: acima de R$ 500 exige aval].
> Atualize notes.md e validation.md, aplique no que já foi construído e me diga o que
> mais foi afetado.

**Fechar uma onda:**

> Acho que a onda atual terminou. Confira tasks.md e validation.md, me mostre o que
> ficou pendente e, se estiver tudo certo, feche a onda [se versiona: e faça o commit].

**Preparar a conversão (fase 5):**

> Prepara o projeto para conversão: confira se os docs contam tudo que o time técnico
> vai precisar (papéis, regras, dados, critérios de aceite), liste o que está faltando
> e complete comigo o que depender de mim.

## Já tem um projeto em andamento? (organizar a bagunça)

Projeto que cresceu na conversa, sem documentação, com sessões que estouram o limite
diário — dá para trazer para este padrão sem recomeçar. Nesta ordem:

### 1. Backup primeiro (obrigatório)

Antes de qualquer limpeza, uma cópia fora da pasta. No terminal, um nível acima da
pasta do projeto:

```bash
# Mac / Linux
zip -r meu-projeto-backup.zip meu-projeto -x "*/node_modules/*"
```

```powershell
# Windows (PowerShell)
Compress-Archive -Path .\meu-projeto -DestinationPath .\meu-projeto-backup.zip
```

Guarde o zip em outro lugar (pendrive, nuvem). Só siga com o backup feito.

### 2. Diagnóstico sem mexer em nada

> Tenho um projeto em andamento nesta pasta e está desorganizado. Já fiz backup. Faça
> primeiro um diagnóstico **sem mudar nada**: me diga em linguagem simples o que o
> projeto faz, o que está pela metade, o que parece abandonado e o que você não
> conseguiu entender. Não leia pastas de dependências nem arquivos gerados.

### 3. Limpeza combinada

> Com base no diagnóstico, liste o que parece lixo (cópias antigas, testes mortos,
> arquivos soltos) e **me pergunte antes de apagar qualquer coisa**. O que eu aprovar,
> apague.

A pasta `node_modules` pode ser apagada sem medo — ela é recriada com um comando
(`yarn` ou `npm install`) e é a maior da maioria dos projetos:

```bash
# Mac / Linux
rm -rf node_modules
```

```powershell
# Windows (PowerShell)
Remove-Item -Recurse -Force .\node_modules
```

### 4. Gerar a documentação retroativa

> Agora organize o projeto no padrão SDD: gere os docs (context, tasks, notes,
> validation) a partir do que existe — o que já funciona vira tarefa concluída, o que
> está pela metade vira a onda atual — e me faça as perguntas que o código não responde
> (que problema resolve, quem usa, para onde vai). Me mostre o rascunho antes de gravar.

### 5. Sessão nova e vida normal

Feche a sessão da organização e abra outra com "Continua o projeto". A partir daqui o
projeto se comporta como um nascido no padrão — sessões curtas, contexto nos docs.

## Versionar ou não? (git)

O agente vai perguntar no início se você quer versionar. Versionar = poder voltar a um
ponto anterior; **não** exige GitHub nem publicar nada.

- **Quer simplicidade?** Diga não. O backup em zip da seção anterior já cobre o
  essencial para um protótipo.
- **Aceitou versionar?** O combinado é **um commit por onda fechada** — um ponto de
  restauração por resultado entregue. Commit a cada tarefinha só gera ruído e custo;
  peça para o agente não fazer isso se ele tentar.

## Dicas para gastar menos e render mais

- **Uma coisa por mensagem.** "Ajusta o formulário de pedido" rende mais que três
  assuntos numa mensagem só.
- **Responda o que foi perguntado** na fase 1 — a entrevista é curta de propósito.
- **Não pule a documentação.** A tentação de "ir direto para as telas" cobra caro: sem
  `notes.md`, cada sessão nova re-explica tudo (e re-paga tudo).
- **Sessão nova?** Só diga "continua o projeto" — os docs contam o resto.
- **Sessões curtas rendem mais que uma sessão eterna.** O que estoura o limite diário é
  contexto acumulado: conversa longa, arquivos grandes lidos inteiros, logs colados na
  conversa. Fechou uma onda? Feche a sessão junto — a próxima começa leve, lendo só os
  docs.
- **Não cole saídas enormes.** Erro na tela? Cole só as últimas linhas da mensagem, não
  o log inteiro. Quer mostrar um arquivo? Diga o nome — o agente lê só o que precisa.
- **No Windows**, o custo por sessão tende a subir pelos mesmos motivos (projetos com
  `node_modules` gigante, logs verbosos de terminal) — o formato de gravação dos
  arquivos em si não muda o gasto de forma relevante. As dicas acima valem dobrado.
- **Errou o rumo?** Diga cedo. Mudança de direção é registrada no `context.md` e o
  plano se ajusta; não é recomeço.

## O que este processo não é

- **Não é produção.** O servidor local não tem segurança de verdade; é para prototipar
  e validar. A versão de produção nasce na fase 5, com o time técnico.
- **Não é rígido.** Os docs são o mapa, não uma prisão — ideia melhor ganha, desde que
  anotada.
