---
name: sdd
description: "Use ao iniciar, organizar ou manter a documentação de um projeto no padrão SDD simplificado — quatro arquivos em docs/ (context.md, tasks.md, notes.md, validation.md) e uma linha no CLAUDE.md que obriga o padrão. Serve para qualquer pessoa modelar um projeto de forma que ele possa depois ser convertido para estruturas mais complexas (portal, API, app). Dispare em pedidos como 'documenta o projeto no padrão SDD', 'inicia a documentação', 'cria os docs do projeto', 'organiza as tarefas do projeto', 'atualiza o context/tasks/notes/validation'."
---

# SDD simplificado — documentação que vira projeto

Quatro arquivos em `docs/` contam tudo que um projeto precisa para ser entendido,
executado e depois **convertido** para uma estrutura maior (portal interno, aplicação
com API, autenticação, banco). A documentação é o contrato da conversão: quem converter
não vai entrevistar o autor — vai ler estes arquivos. Escreva para esse leitor.

## Instalação no projeto (primeira vez)

**Comece em plan mode.** Se o ambiente oferece a ferramenta de plan mode
(`EnterPlanMode`), entre nela antes de escrever qualquer arquivo; sem a ferramenta,
simule: rascunhe tudo na conversa e só grave após aprovação explícita. O usuário pode
ser não técnico — o plano é a chance dele corrigir a história antes de virar arquivo.

No plano:

1. **Entreviste com perguntas simples**, uma por vez, em linguagem de negócio: "que
   problema você quer resolver?", "quem vai usar?", "como isso é feito hoje?", "o que
   precisa estar funcionando para você considerar pronto?". Não pergunte sobre
   tecnologia — a direção técnica você propõe depois, no rascunho.
2. **Rascunhe os quatro arquivos** com as respostas, usando os esqueletos e os exemplos
   preenchidos de `references/templates.md` como régua de tamanho e tom.
3. **Apresente o rascunho para aprovação.** Ajuste o que o usuário corrigir; só então
   saia do plano e grave.

Ao gravar:

1. Crie a pasta `docs/` com os quatro arquivos aprovados. Seção sem conteúdo fica com
   o comentário-guia do template, nunca vazia em silêncio.
2. Registre no `CLAUDE.md` do projeto (crie se não existir), no topo:

   ```markdown
   # Documentação

   Este projeto segue o padrão SDD simplificado. Toda documentação mora em `docs/`
   (context.md, tasks.md, notes.md, validation.md) e **deve** seguir essa estrutura —
   não crie outros arquivos de documentação nem outras estruturas. Antes de qualquer
   trabalho, leia `docs/context.md` e `docs/tasks.md`; ao concluir tarefa, marque em
   tasks.md e confira validation.md.
   ```

3. Se o projeto já tem documentação espalhada (README extenso, TODOs, planos), migre o
   conteúdo para o arquivo certo e aponte o original para `docs/` — uma fonte da verdade.

## Os quatro arquivos — o que mora em cada um

| Arquivo         | Papel                                                                                                                                               |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `context.md`    | A **história** do projeto: que problema resolve, para quem, direção escolhida, metodologias e decisões de rumo. Muda pouco; quando muda, é notícia. |
| `tasks.md`      | As **tarefas**, checáveis, organizadas por **ondas** (fases sequenciais). É o único lugar onde trabalho pendente é registrado.                      |
| `notes.md`      | Anotações **detalhadas por tarefa**: regras de negócio, estruturas, casos especiais — o específico que não cabe na história nem na tarefa.          |
| `validation.md` | Os **pré-requisitos de sucesso** em duas partes: a escrita (o que precisa ser verdade e por quê) e a checável (checklist verificável).              |

Na dúvida de onde escrever: direção → context; trabalho → tasks; detalhe → notes;
critério de pronto → validation. Um assunto nunca mora em dois arquivos — o mais
específico ganha e o outro aponta.

## Regras de manutenção

- **tasks.md** — uma tarefa por linha, verbo no infinitivo, efeito visível primeiro:
  `- [ ] Mostrar o saldo na tela inicial`. Onda só abre quando a anterior fecha. Tarefa
  que surgiu no caminho entra na onda atual; plano que mudou não é apagado — risque
  (`~~texto~~`) com o porquê. Tarefa com detalhe extenso ganha seção em notes.md e um
  `(ver notes)` na linha.
- **context.md** — atualize quando a direção mudar, não a cada tarefa. Registre a decisão
  e o porquê; não reescreva o problema para "combinar" com a solução final.
- **notes.md** — cada seção nomeia a tarefa ou regra a que pertence. Específico e
  verificável ("desconto máximo 15%, acima disso exige aprovação"), não prosa geral.
- **validation.md** — a parte escrita explica o que é sucesso; a checável espelha isso em
  itens `- [ ]` testáveis. Checkbox só marca quando de fato conferido. Todo critério novo
  descoberto durante o trabalho entra aqui na hora.
- **pt-BR**, frases curtas, voz ativa. O leitor pode ser não técnico — termo técnico só
  quando inevitável, com meia frase de tradução na primeira vez.

## Pensando na conversão futura

O projeto documentado assim será absorvido por uma estrutura maior. Para a conversão
custar pouco:

- Em notes.md, ao descrever dados, prefira forma estruturada (lista de campos com tipo e
  regra) a prosa — vira modelo de banco direto.
- Em context.md, deixe explícito quem usa o quê (papéis) — vira autenticação e permissão.
- Em validation.md, critérios checáveis viram testes de aceite. Quanto mais verificável a
  frase, mais barata a conversão.
- Desvio consciente de qualquer regra deste padrão: anote em notes.md, para a conversão
  não tratar como erro.
