---
name: documento
description: "Use ao escrever, revisar ou melhorar um documento de projeto do portal (Projetos › Kanban › documento do projeto, campo `conteudo`) — e em qualquer markdown que vá ser lido no portal. Traz o vocabulário de marcação rica (alertas `> [!DICA]`, `::: passos`, `::: cards`, `::: abas`, `::: detalhes`, código com realce, diagramas mermaid) e as regras editoriais de estrutura, tom e densidade de destaque. Dispare em pedidos como 'escreva o documento do projeto X', 'documenta esse fluxo', 'melhora esse markdown', 'transforma essa conversa em documento'."
---

# Documento de projeto — escrita

Documento de projeto é a **memória de uma decisão**: por que fizemos, como funciona, o que
falta. Ele vive no banco (campo `conteudo` do projeto), é lido em `/projetos/:id` no portal e
é editado por quem criou o projeto (ou superusuário).

> **Requisito:** o portal renderiza o documento com `WMarkdownView`, da suite
> `@wgalleti/primevue-components`. Sem esse componente, a marcação rica (`:::`, alertas,
> abas) sai como texto cru — use então só markdown padrão. Nomes de rota e model abaixo são
> os do portal de origem; ajuste aos do seu projeto.

O renderizador é o `WMarkdownView` da suite (`@wgalleti/primevue-components`), inspirado no
Material for MkDocs. Ele entende markdown normal **e** um vocabulário curto de marcação rica.
Referência completa da sintaxe: `references/sintaxe.md`. Esqueleto pronto: `references/modelo.md`.

---

## 1. Antes de escrever

Responda em uma frase cada. Se não souber, **pergunte** — não invente:

1. **Para quem?** Operador de campo, analista, dev, cliente. Muda o vocabulário inteiro.
2. **Que decisão o leitor precisa tomar** depois de ler? (executar um procedimento, aprovar
   um desenho, entender por que o saldo bateu diferente)
3. **O que já existe?** Documento de projeto não repete o que o código, a API ou o CLAUDE.md
   já dizem — ele explica o **porquê** e o que não está escrito em lugar nenhum.

Documento sem leitor definido vira lista de bullets sem dono. Não escreva.

---

## 2. Estrutura

Um documento bom tem quatro andares, nesta ordem. Corte os que não se aplicam — nunca inverta.

| Andar        | Pergunta que responde                      | Marcação típica                                      |
| ------------ | ------------------------------------------ | ---------------------------------------------------- |
| **Abertura** | O que é isso, em 3 linhas?                 | parágrafo + `::: resumo` quando for longo            |
| **Contexto** | Por que agora? O que dói hoje?             | parágrafo, `> [!IMPORTANTE]`                         |
| **Corpo**    | Como funciona / como se faz                | `## seções`, `::: passos`, tabela, código, `mermaid` |
| **Bordas**   | O que pode dar errado, o que ficou de fora | `> [!ATENÇÃO]`, `> [!CUIDADO]`, checklist            |

Regras de estrutura:

- **Comece pelo `##`.** O `# H1` é o nome do projeto — já aparece no topo da tela. Um `#` no
  texto duplica o título.
- **`##` a cada 2–4 parágrafos.** O índice lateral ("Nesta página") é montado com os `##` e
  `###`; documento sem seção não tem navegação.
- **`###` só dentro de um `##`.** Nunca pule nível.
- Documento longo (> 3 telas) abre com `::: resumo` de 3 linhas — o leitor decide se continua.

---

## 3. Vocabulário — o essencial

Cola completa em `references/sintaxe.md`. O que resolve 90% dos casos:

````markdown
## Seção ← entra no índice lateral

> [!DICA] ← destaque; funciona em qualquer visualizador de markdown
> Texto da sugestão.

::: atencao Título próprio ← mesmo destaque, com título e conteúdo longo
Vários parágrafos, listas, código.
:::

::: passos ← procedimento numerado (trilha visual)

1. Primeiro passo
2. Segundo passo
   :::

::: cards ← lista em cartões lado a lado

- **Título** — descrição curta
- **Outro** — descrição curta
  :::

::: aba Portal ← blocos `aba` seguidos viram um grupo de abas
Conteúdo da primeira aba.
:::
::: aba API
Conteúdo da segunda aba.
:::

::: detalhes Como calculamos ← bloco que abre e fecha (detalhe que nem todos precisam)
Conteúdo escondido por padrão.
:::

- [ ] pendência ← checklist
      ==texto marcado== ← destaque no meio da frase

```python title="services/projeto.py"
def mover(): ...               ← código com realce e botão de copiar
```
````

```mermaid
graph LR
  A[Nota] --> B[Lote]          ← diagrama de fluxo
```

```

**Tipos de destaque** (`> [!X]` ou `::: x`), na ordem de uso:

| Tipo | Use quando | Não use para |
|---|---|---|
| `DICA` | sugestão que economiza tempo do leitor | qualquer observação |
| `NOTA` | informação lateral, verdadeira mas não crítica | o conteúdo principal |
| `IMPORTANTE` | regra de negócio que o leitor **precisa** saber | ênfase genérica |
| `ATENÇÃO` | erro provável, limite, janela de tempo | assustar sem motivo |
| `CUIDADO` | ação destrutiva ou irreversível | erro comum não destrutivo |
| `EXEMPLO` | caso concreto que ilustra a regra | trecho de código solto |
| `RESUMO` | TL;DR no topo de documento longo | conclusão no fim |
| `PERGUNTA` | decisão em aberto, esperando o cliente | dúvida sua sobre o texto |

---

## 4. Regras editoriais

**Densidade.** No máximo **1 destaque a cada 2 telas de texto**. Documento com um alerta a cada
parágrafo não tem destaque nenhum — tem ruído colorido. Se tudo é importante, nada é.

**Um tipo por motivo.** `ATENÇÃO` é sempre risco de erro; `IMPORTANTE` é sempre regra. Não
alterne por variedade visual.

**Destaque não substitui texto.** O parágrafo antes do alerta tem que fazer sentido sozinho —
o alerta acrescenta, não completa a frase.

**Nada de alerta dentro de alerta.** Se precisa aninhar, o conteúdo é uma seção, não um aviso.

**Passos são imperativos.** "Confira o saldo", não "O saldo deve ser conferido". Um passo = uma
ação verificável. Se um passo tem "e" no meio, são dois passos.

**Tabela é para comparar**, não para diagramar layout. Três colunas no máximo em documento que
alguém vai ler no celular.

**Diagrama só quando o texto falha.** Fluxo com decisão (`-->|sim|`) e caminho alternativo ganha
diagrama; sequência linear de 3 caixas é um `::: passos` melhor escrito.

**Código com propósito.** Sempre com `title="caminho/do/arquivo.py"` quando o trecho existe no
repositório — o leitor precisa achar o original. Trecho > 20 linhas vai dentro de
`::: detalhes`.

**Tom.** pt-BR, presente do indicativo, frase curta. Sem "simplesmente", "apenas", "basta" —
nada é simples para quem está lendo pela primeira vez. Sem emoji decorativo.

**Datas absolutas.** "a partir de 10/11/2026", nunca "a partir da semana que vem".

---

## 5. Revisar um documento existente

Nesta ordem, e mostre o diff antes de aplicar:

1. **Estrutura:** tem `##` suficiente para o índice? A abertura responde "o que é isso"?
2. **Excesso de destaque:** conte os alertas. Mais de um a cada duas telas → rebaixe os fracos
   a texto normal.
3. **Passo solto:** sequência de instruções em lista simples vira `::: passos`.
4. **Bloco de código sem `title=`:** procure o arquivo real e acrescente.
5. **Parede de texto:** parágrafo com mais de 6 linhas quebra em dois ou vira lista.
6. **Promessa vaga:** "vamos melhorar a performance" → o que, quanto, quando, quem mede.

---

## 6. Publicar

O caminho normal é **pelo portal**: `/projetos` → abrir o card → *Editar documento* → escrever
no editor (o botão `?` abre a cola da sintaxe) → *Salvar*. Só o criador do projeto ou um
superusuário consegue salvar.

Precisa criar/atualizar em lote (importação, migração de conteúdo)? Ver
`references/publicar.md` — nunca escreva direto na tabela; passe pelo service/API.

---

## Arquivos de referência

- `references/sintaxe.md` — todos os blocos, com exemplo e resultado esperado
- `references/modelo.md` — esqueleto para copiar e preencher
- `references/publicar.md` — criar/atualizar documento pela API ou pelo command de importação
```
