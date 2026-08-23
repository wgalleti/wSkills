---
name: projeto
description: "Amarra o worktree a um projeto do portal (kanban de Projetos) e mantém documento, tarefas e status em dia no ambiente LOCAL. Use ao começar uma frente de trabalho, ao registrar o que foi feito, ao marcar tarefa concluída, ao mover o card de coluna ou ao atualizar o documento markdown do projeto. Gatilhos: 'qual é o projeto deste worktree', 'amarra esse worktree no projeto X', 'atualiza o documento do projeto', 'marca a tarefa como concluída', 'move o projeto para em validação', 'registra no projeto o que fizemos'."
---

# `/projeto` — o projeto do portal que este worktree está construindo

Cada frente de trabalho tem um card no kanban de projetos do portal e um documento markdown
que é a **memória da decisão**. Esta skill liga o worktree a esse card e mantém os dois em dia
enquanto o trabalho acontece — sem abrir o portal no meio da sessão.

> **Adapte ao instalar:** o script `scripts/projeto.py` é uma implementação de referência que
> fala com um app Django `apps.projetos` (models `Projeto`/`Tarefa`/`Workspace` + services).
> Ajuste os imports e nomes de campos aos do seu portal — a mecânica (resolução híbrida,
> amarração gitignorada, saída JSON, código 2 = pergunte) é o que vale a pena copiar.

## Duas regras que não se negociam

1. **O alvo é sempre o ambiente LOCAL.** Nada aqui escreve em staging ou produção. Produção só
   recebe pelo fluxo de sincronização do portal (comparação, simulação e confirmação humana).
2. **Criar projeto é decisão do usuário, nunca da resolução.** A busca não achou ou achou
   vários: **pergunte**. Só rode `criar` quando pedirem explicitamente — e mesmo assim o
   comando recusa nome parecido com card existente (código 2 + candidatos), porque um card
   duplicado no kanban some do radar de todo mundo e leva junto o documento.

## A boca única

Toda operação passa pelo script — ele sobe o Django com o `.env` **deste** worktree, que
aponta para o banco do slot. O `manage.py` rodado da pasta errada escreve no banco do vizinho,
e é justamente isso que o script evita:

```bash
cd api && uv run python ../.claude/skills/projeto/scripts/projeto.py <comando> [valor] [--projeto <uuid|nome>]
```

| Comando                                              | O que faz                                                                                                              |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `resolver`                                           | acha o projeto deste worktree e imprime a ficha                                                                        |
| `criar "<nome>" [--descricao "…"] [--workspace "…"]` | cria o card (coluna Planejado, workspace global por padrão) e já amarra o worktree; recusa nome parecido com existente |
| `amarrar <uuid\|nome>`                               | grava a amarração (`.orca-projeto`, gitignorado)                                                                       |
| `soltar`                                             | apaga a amarração                                                                                                      |
| `mostrar`                                            | ficha + tarefas + tamanho do documento                                                                                 |
| `documento-ler [arquivo]`                            | imprime o markdown, ou grava num arquivo para editar                                                                   |
| `documento-escrever <arquivo>`                       | substitui o markdown pelo conteúdo do arquivo                                                                          |
| `tarefa-add "<título>"`                              | acrescenta tarefa no fim da lista                                                                                      |
| `tarefa-concluir <id\|título>`                       | alterna concluída/aberta                                                                                               |
| `status <status>`                                    | move o card (`planejado`, `em_execucao`, `em_validacao`, `finalizado`)                                                 |

Saída é **JSON numa linha**. Código de saída `2` = não deu para decidir sozinho: a resposta traz
`candidatos` e você **pergunta ao usuário** qual é, em vez de escolher.

## Resolução híbrida do projeto

Na primeira vez o script tenta, nesta ordem:

1. **UUID** — exato, sem ambiguidade possível;
2. **nome ou rota** — exato primeiro, depois por slug (`Sincronização de projetos` casa com
   `sincronizacao-projetos`), depois por pedaço;
3. **nome da branch ou da pasta do worktree** — a última pista; `feature/etapa-2` vira `etapa-2`.

Achou **um**, trabalha direto. Achou **vários ou nenhum**, sai com `2` e pergunta.

Resolvido o desempate, amarre — daí em diante `resolver` sem argumento já sabe de quem se trata:

```bash
cd api && uv run python ../.claude/skills/projeto/scripts/projeto.py amarrar <uuid-do-projeto>
```

A amarração é do **worktree**, não do repositório: mora em `.orca-projeto`, ao lado do
`.orca-ports`, e é ignorada pelo git.

## Fluxo de trabalho

**Começando a sessão** — resolva e mostre. Se sair `2`, pergunte antes de qualquer outra coisa.

**Mexendo no documento** — o markdown é lido no portal com um vocabulário próprio de marcação
rica (alertas, passos, cards, abas, mermaid) e regras editoriais de estrutura e tom. **Não
escreva de cabeça: invoque a skill `/documento` antes de redigir.** Esta skill leva o texto
até o banco; a régua editorial é de lá.

```bash
cd api
uv run python ../.claude/skills/projeto/scripts/projeto.py documento-ler /tmp/doc.md   # tira uma cópia
# … edita /tmp/doc.md seguindo a skill /documento …
uv run python ../.claude/skills/projeto/scripts/projeto.py documento-escrever /tmp/doc.md
```

`documento-escrever` compara antes de gravar: texto idêntico responde `"alterado": false` e não
toca no banco (nem na trilha de auditoria).

**Fechando uma etapa** — marque a tarefa e, quando a frente inteira sair, mova o card:

```bash
uv run python ../.claude/skills/projeto/scripts/projeto.py tarefa-concluir "importar geometria"
uv run python ../.claude/skills/projeto/scripts/projeto.py status em_validacao
```

## Cuidados

- **A porta da API não é a padrão num worktree.** Ela está no `.orca-ports` (`API_PORT`). O
  script não usa HTTP — vai direto ao banco do slot — mas se você for testar a API na mão,
  leia o arquivo antes; `curl localhost:8000` pode falar com o checkout principal.
- **Escrita passa por `save(update_fields=…)`** e pelos services do domínio, nunca por
  `queryset.update()`: é o que mantém os signals e a trilha de auditoria.
- **A autoria da tarefa nova segue a do projeto.** O worktree não tem sessão de usuário, e
  inventar um autor sujaria a trilha.
- **Não abra o shell do Django para "só dar uma olhada"**: banco de dev costuma ter dados
  reais de teste. Se precisar mesmo, use `transaction.atomic()` + `set_rollback(True)`.
- **Levar para produção não é trabalho desta skill.** Terminou aqui? O fluxo de sincronização
  do portal faz o resto, com diff e confirmação.
