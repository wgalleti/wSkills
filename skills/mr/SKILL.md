---
name: mr
description: "Use ao criar ou atualizar a descrição de um Merge Request / Pull Request e ao escrever as mensagens de commit de uma frente de trabalho. Traz o padrão editorial do MR — fluxo Problema → Análise → Solução → Validação, em pt-BR legível por gestão não técnica — e as regras de commit (conventional commits, um assunto por commit). Dispare em pedidos como 'abre o MR', 'documenta o MR', 'atualiza a descrição do MR', 'prepara os commits dessa frente', e sempre que for marcar operações feitas no checklist do MR."
---

# MR e commits — padrão da frente de trabalho

O MR é a **documentação viva da frente** — não um formulário. Quem lê pode ser uma pessoa de
gestão **não técnica**: ela precisa entender o que estava acontecendo, o que foi decidido e o
que mudou na operação, sem tradutor. O commit, ao contrário, é para desenvolvedores: técnico,
em inglês, conventional commits. **Não misture os dois registros** — o MR conta a história em
linguagem de negócio; o commit registra a mudança em linguagem de código.

> Escrito para GitLab (`glab`), mas vale igual para PR no GitHub (`gh`) — troque o comando.

## 1. A descrição do MR — Problema → Análise → Solução → Validação

Vale a pena ter isso como template de MR no repositório
(`.gitlab/merge_request_templates/*.md` ou `.github/pull_request_template.md`), para as quatro
seções já nascerem no draft. Elas têm papéis distintos — não as deixe genéricas:

### Problema

O que motiva a frente, **em linguagem de operação/negócio**. Comece pelo efeito em quem usa o
sistema, nunca pela tecnologia.

- ✅ "A etiqueta sai sem o lote, e a conferência no armazém está sendo feita à mão."
- ❌ "Refatorar o composable de etiquetas para suportar novo campo."

### Análise

O que foi investigado e **o que se descobriu** — causa, contexto, restrições. É a seção que
evita retrabalho futuro: quem reler entende por que o caminho óbvio não servia. Escreva depois
de investigar; 2–5 frases bastam. Se houve alternativa descartada, diga qual e por quê
("clonar por dump ficaria lento com o banco grande; usamos template").

### Solução

O que será/foi feito, como **checklist vivo**:

- Uma operação por linha, verbo no infinitivo, efeito visível primeiro:
  `- [ ] Mostrar o lote na etiqueta (tela e PDF)`.
- Operação puramente técnica ganha meia frase de tradução:
  `- [ ] Criar índice no banco (a listagem de análises estava lenta)`.
- **Vivo** de verdade: marcar `[x]` ao concluir; operação que surgiu no caminho entra na lista;
  plano que mudou não é apagado — risque (`~~texto~~`) e anote o porquê na linha ou em
  "Decisões".
- Decisões relevantes ganham um bullet em **Decisões tomadas**, sempre com o porquê em uma frase.

### Validação

Como conferimos que funciona, em termos verificáveis ("testado com os dados clonados; PDF
conferido; suíte de testes verde"). Checkbox padrão do template só sai marcado quando de fato
rodou.

## 2. Tom e linguagem (vale para o MR inteiro)

- **pt-BR**, frases curtas, voz ativa. Nada de "foi realizado o desenvolvimento de".
- Termo técnico só quando inevitável — e com tradução de meia frase na primeira vez:
  "migration (mudança na estrutura do banco)". Sigla só se o leitor de gestão a usa.
- Nome de arquivo, rota e código ficam fora do texto corrido; quando necessários, em `código`
  e no fim da frase.
- Título do MR: o resultado, não a tarefa — "Etiqueta com lote e validade" em vez de
  "feat: ajustes em etiquetas". Draft enquanto em andamento.
- Sem tabela de jargão, sem seção vazia: se Análise ainda não existe, deixe o comentário-guia
  do template no lugar até existir.

## 3. Marcos e encerramento

- Marco relevante (virada de abordagem, bloqueio, dependência externa) vira comentário no MR:
  `glab mr note <iid> -m "…"` (ou `gh pr comment <n> -b "…"`) — curto e datado pela plataforma.
- Atualização da descrição preserva o histórico das seções; nunca reescreva o Problema para
  "combinar" com a solução final — se o entendimento mudou, registre em Análise.
- Antes de tirar do draft: checklist da Solução fechado (feito, riscado ou movido para outra
  frente — nada pendente em silêncio), Validação preenchida, título final.

```bash
glab mr update <iid> --description "$(cat descricao.md)"
gh   pr edit   <n>   --body-file descricao.md
```

## 4. Commits

Inglês, conventional commits — o MR traduz para gestão, o commit não precisa:

- `feat(escopo): …` · `fix:` · `test:` · `docs:` · `chore:` — imperativo, minúsculo, sem ponto
  final. Escopo = app/área (`estoque`, `web`, `dev`).
- **Um assunto por commit.** Se a frase do título precisa de "and", são dois commits.
- Corpo (quando o título não basta): o **porquê** e o efeito, não a lista de arquivos.
- Sem trailer de coautoria (a menos que o repositório peça).
- Não amasse (squash) nem reescreva commits já publicados no branch.
- Commit que conclui uma operação do checklist → marque a operação no MR na sequência. É esse
  par (commit técnico + checklist legível) que mantém os dois públicos servidos.

## 5. Se o fluxo cria o MR automaticamente

Alguns fluxos (worktree por card, script de setup) já abrem o MR em draft ao criar o branch —
rodar o script de novo só imprime a URL. Nesse caso:

- Não crie um segundo MR: atualize a descrição do que já existe.
- Agente trabalhando num card: ao concluir cada operação, atualizar o checklist do MR **faz
  parte da tarefa** — não é opcional.
- Documente o gatilho e o caminho do template no `CLAUDE.md` do repositório, não aqui.
