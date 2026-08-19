# Esqueletos dos quatro arquivos

Copie cada bloco para `docs/` e preencha. Comentários `<!-- … -->` são guias: ficam no
lugar até a seção existir de verdade — não os deixe em seção já preenchida.

Depois de cada esqueleto há um **exemplo preenchido** de um mesmo mini-projeto
(controle de reembolsos de despesas). Use-o como régua de tamanho e tom: frases curtas,
linguagem de negócio, nada de tecnologia onde ela não é a resposta.

## docs/context.md

```markdown
# Contexto

## Problema

<!-- Que dor existe hoje, em linguagem de quem sofre a dor. Comece pelo efeito em quem
usa, nunca pela tecnologia. -->

## Para quem

<!-- Papéis envolvidos e o que cada um faz/precisa. Isso vira autenticação e permissão
na conversão — seja explícito. -->

## Direção

<!-- O caminho escolhido para resolver e por quê. Alternativa descartada relevante entra
aqui com o motivo. -->

## Metodologia e limites

<!-- Como o projeto trabalha (ritmo, ferramentas, convenções) e o que está fora de
escopo de propósito. -->

## Decisões de rumo

<!-- Uma linha por decisão que mudou a direção, com data e porquê. Não apague decisões
antigas — a história importa. -->
```

### Exemplo preenchido — context.md

```markdown
# Contexto

## Problema

Reembolso de despesa é pedido por e-mail com foto do comprovante. O financeiro perde
pedidos na caixa de entrada, e ninguém sabe em que pé está o seu pedido.

## Para quem

- **Colaborador** — pede reembolso e acompanha o status do próprio pedido.
- **Gestor** — aprova ou recusa pedidos da sua equipe.
- **Financeiro** — paga os aprovados e marca como pago.

## Direção

Um formulário único de pedido com anexo do comprovante e uma lista com status
(pendente → aprovado → pago). Descartamos integrar com o sistema contábil agora:
o ganho imediato é a fila visível, a integração fica para depois.

## Metodologia e limites

Trabalho em ondas curtas; cada onda termina com algo usável. Fora de escopo: adiantamento
de viagem e reembolso em moeda estrangeira.

## Decisões de rumo

- 2026-08-19 — Começar só com reembolso simples, sem adiantamento: 90% dos pedidos são
  desse tipo.
```

## docs/tasks.md

```markdown
# Tarefas

<!-- Uma tarefa por linha, verbo no infinitivo, efeito visível primeiro. Onda só abre
quando a anterior fecha. Detalhe extenso vai para notes.md com "(ver notes)" na linha. -->

## Onda 1 — <nome do resultado desta fase>

- [ ] <tarefa>
- [ ] <tarefa> (ver notes)

## Onda 2 — <nome>

- [ ] <tarefa>

## Concluídas

<!-- Ondas fechadas descem para cá inteiras, com os [x], para o topo ficar limpo. -->
```

### Exemplo preenchido — tasks.md

```markdown
# Tarefas

## Onda 1 — Pedir e acompanhar reembolso

- [x] Criar o formulário de pedido com anexo do comprovante
- [ ] Mostrar a lista de pedidos do colaborador com status
- [ ] Avisar o colaborador quando o status mudar (ver notes)

## Onda 2 — Aprovação do gestor

- [ ] Mostrar ao gestor a fila de pedidos da equipe
- [ ] Permitir aprovar ou recusar com motivo (ver notes)

## Concluídas

<!-- ainda nenhuma onda fechada -->
```

## docs/notes.md

```markdown
# Notas

<!-- Uma seção por tarefa, regra ou estrutura que precisa de detalhe. Específico e
verificável; prosa geral mora em context.md. -->

## <nome da tarefa ou regra>

<!-- Regras de negócio, casos especiais, exceções. -->

## Dados: <nome da entidade>

<!-- Forma estruturada — vira modelo de banco na conversão:
- campo — tipo — regra (ex.: obrigatório, único, padrão)
-->

## Desvios do padrão

<!-- Toda vez que o projeto fugir de uma regra do SDD ou do próprio plano de propósito:
o que foi feito diferente e por quê, para a conversão não tratar como erro. -->
```

### Exemplo preenchido — notes.md

```markdown
# Notas

## Avisar o colaborador quando o status mudar

Aviso por e-mail, no momento da mudança. Recusa sempre carrega o motivo escrito pelo
gestor — sem motivo, o sistema não deixa recusar.

## Permitir aprovar ou recusar com motivo

Só o gestor direto do colaborador aprova. Pedido acima de R$ 1.000 exige segunda
aprovação, do financeiro.

## Dados: Pedido de reembolso

- colaborador — pessoa — obrigatório
- data da despesa — data — obrigatória, não pode ser futura
- valor — dinheiro (R$) — obrigatório, maior que zero
- comprovante — arquivo (foto ou PDF) — obrigatório
- status — um de: pendente, aprovado, recusado, pago — começa em pendente
- motivo da recusa — texto — obrigatório quando recusado

## Desvios do padrão

Nenhum até agora.
```

## docs/validation.md

```markdown
# Validação

## O que é sucesso

<!-- A parte escrita: o que precisa ser verdade quando o projeto estiver pronto, e por
quê. Parágrafos curtos, um critério por parágrafo. -->

## Checklist

<!-- A parte checável: cada critério acima vira ao menos um item verificável. Marque
apenas quando de fato conferido — isso vira teste de aceite na conversão. -->

- [ ] <critério verificável>
- [ ] <critério verificável>
```

### Exemplo preenchido — validation.md

```markdown
# Validação

## O que é sucesso

Nenhum pedido se perde: todo pedido feito aparece na fila do gestor e tem um status
visível para o colaborador, do envio ao pagamento.

O financeiro para de receber pedido por e-mail: o formulário é o único caminho de
entrada, e o comprovante chega junto do pedido.

## Checklist

- [ ] Pedido enviado pelo formulário aparece na fila do gestor em seguida
- [ ] Colaborador vê o status atual de cada pedido seu
- [ ] Recusa sem motivo escrito é impossível
- [ ] Pedido acima de R$ 1.000 só sai de pendente com as duas aprovações
- [ ] Pedido sem comprovante anexado não é aceito
```
