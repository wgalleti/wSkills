# Heurísticas de UI rica — qualquer stack

Regras de espaço, hierarquia e riqueza que valem com qualquer biblioteca de componentes
e qualquer estilo. Quando o projeto tem design system próprio, ele manda nos valores
(cores, tamanhos, tokens); estas heurísticas mandam no **uso do espaço e na composição**.

## Princípios clássicos — o porquê por trás das regras

Não são teoria para citar: são o critério de desempate quando duas composições parecem
válidas. Aplique-os direto:

- **Proximidade (Gestalt)** — o que está perto se lê como grupo. Mais espaço **entre**
  grupos do que **dentro** deles; se precisou de borda para separar, o espaçamento
  falhou primeiro.
- **Similaridade (Gestalt)** — o que parece igual se lê como a mesma coisa. Todos os
  botões secundários com a mesma cara; toda tag de status com o mesmo formato. Variação
  visual sem variação de significado confunde.
- **Região comum (Gestalt)** — fundo/caixa compartilhado agrupa. Use **um tint de fundo
  sutil** para agrupar em layout denso — é o substituto da pilha de bordas.
- **Lei de Hick** — mais opções, decisão mais lenta. Menu enxuto, dialog com 2 ações
  (primária + cancelar), filtros avançados escondidos até serem pedidos.
- **Divulgação progressiva** — mostre o caminho padrão; o avançado fica em painel
  colapsável, aba ou "ver mais". Formulário com 20 campos visíveis de uma vez é falha
  de divulgação, não de espaço.
- **Lei de Fitts** — alvo maior e mais perto é mais rápido de acertar. Ação primária
  grande e onde a mão/olho já está (fim do formulário, linha da tabela); área de clique
  mínima ~40px, nunca ícone minúsculo para a ação principal.
- **Lei de Jakob** — o usuário espera que funcione como os sistemas que já usa. Busca
  no topo, ação de linha no fim da linha, salvar embaixo à direita. Criatividade vai na
  **riqueza**, nunca na **convenção** — não invente navegação.
- **Agrupamento em blocos (chunking)** — memória curta segura ~4–7 itens. Formulário
  longo vira seções nomeadas; wizard com muitos passos vira passos com resumo.
- **Regra 60-30-10 de cor** — ~60% neutro (fundos), ~30% estrutura/secundário, ~10%
  acento chamando atenção. Se a tela tem cor demais gritando, o acento perdeu a função.
- **Ritmo de espaçamento (grid de 8pt)** — espaçamentos múltiplos de uma base (4/8px):
  8 dentro do campo, 16 entre campos, 24–32 entre seções. Valores aleatórios (13px, 22px)
  quebram o ritmo que o olho percebe sem saber nomear.
- **Contraste acessível** — texto com contraste ≥ 4.5:1 sobre o fundo (3:1 para texto
  grande); informação **nunca só pela cor** (cor + rótulo/ícone). Texto cinza-claro
  sobre branco "elegante" é texto ilegível.

## Espaço — a causa nº 1 de tela "anos 1990"

### Largura por tipo de conteúdo

| Conteúdo                      | Largura                                                      |
| ----------------------------- | ------------------------------------------------------------ |
| Formulário de edição/cadastro | limitada (~640–880px) e centralizada — nunca a tela inteira  |
| Texto corrido / descrição     | ~65–75 caracteres por linha                                  |
| Tabela / listagem             | a área disponível — tabela espremida é pior que larga        |
| Dashboard                     | a área disponível, em grid — sem corredor vazio nas laterais |
| Dialog de formulário          | pelo conteúdo: 1 coluna ~480px, 2 colunas ~720px             |

### Largura por tipo de campo

Campo dimensionado pelo dado que recebe — todos com a mesma largura é o visual de
formulário gerado por máquina:

- **Curto** (data, CPF, CEP, moeda, quantidade): a largura do dado + respiro.
- **Médio** (nome, e-mail, telefone): meia linha; faz par natural com outro médio.
- **Longo** (endereço, razão social): linha inteira do formulário (não da tela).
- **Textarea** (observação): linha inteira, por último.

Agrupe em colunas o que se lê junto (cidade + UF + CEP; valor + vencimento). Uma coluna
única de campos full-width, um embaixo do outro, só se o formulário tem ≤ 4 campos.

### Preencher o que reservou

- Container largo com conteúdo encolhido num canto = redimensione um dos dois.
- Altura também conta: bloco alto com 3 linhas de conteúdo vira bloco baixo; lista longa
  dentro de card vira área rolável interna só em último caso — prefira paginação ou
  colapsável.
- Grid de cards: os cards da última linha não esticam para preencher — mantêm o tamanho
  dos irmãos.

## Hierarquia — o olho precisa de um caminho

- **Um título por tela** que diz o que ela resolve; seções com títulos menores. Três
  tamanhos de texto bastam para quase tudo: título, corpo, apoio.
- **Uma ação primária por bloco**, visualmente distinta; as demais são secundárias
  (outline/texto). Duas ações "gritando" = nenhuma.
- **Agrupe por espaço, não por caixa**: mais margem entre grupos, menos borda em volta
  de tudo. Borda é para input e separações que precisam ser duras.
- **Contexto antes de detalhe**: quem/quando/status no topo (cabeçalho do registro);
  os campos vêm depois.

## Riqueza — dados reais, não decoração

Riqueza que funciona (nesta ordem de investimento):

1. **Dados de verdade renderizados**: a foto aparece (avatar, perfil, card) — não um
   ícone de placeholder; moeda e data formatadas em pt-BR; status como tag com cor
   **e** rótulo.
2. **Resumo antes da lista**: 3–5 números-chave (totais do filtro) acima da tabela
   transformam um CRUD em painel.
3. **Estados desenhados**: vazio (com frase que diz o que fazer + ação), carregando
   (skeleton no lugar do conteúdo, não spinner solto), erro (o que houve + como sair).
4. **Micro-feedback**: hover perceptível, transição curta em overlay, loading no botão
   que disparou a ação.

Riqueza falsa — não faça: gradiente e sombra pesada, ícone decorativo sem função, borda
colorida "para dar vida", cor nova inventada para uma tela, animação longa em elemento
de trabalho, card artesanal quando a biblioteca tem card pronto.

## Anti-padrões "anos 1990" — reconheça e elimine

- Tabela crua sem toolbar (sem título, contagem, busca, ação "Novo").
- Formulário full-width de coluna única com 15 campos iguais.
- Tudo com borda: card com borda dentro de card com borda dentro de página com borda.
- Botões genéricos ("OK", "Enviar") e tudo com o mesmo peso visual.
- Upload que mostra só o nome do arquivo quando o dado é uma **imagem**.
- Tela em branco durante carregamento; "Nenhum dado" como estado vazio.
- Espaço vazio dos dois lados de um conteúdo que deveria ocupá-lo — ou conteúdo
  espremido ocupando 100% sem respiro nas margens.

## Checklist de auto-revisão — passe antes de entregar

Olhe a tela renderizada (não o código) e responda honestamente:

- [ ] O espaço está bem usado? Nada espremido num canto, nada esticado sem motivo,
      formulário com largura limitada, campos dimensionados pelo dado.
- [ ] Em 3 segundos dá para saber o que a tela resolve e qual é a ação principal?
- [ ] Os dados reais aparecem — imagem renderizada, valores formatados, status legível?
- [ ] Todo componente rico disponível para o caso foi usado (crop, autocomplete,
      calendário, tag, skeleton) em vez de uma versão pobre feita à mão?
- [ ] Vazio, carregando e erro estão desenhados?
- [ ] O agrupamento vem de espaço, não de uma pilha de caixas com borda?
- [ ] Redimensionando a janela (estreita e larga), nada quebra nem sobra corredor?
- [ ] A tela conversa com as irmãs — mesmos padrões, nada "de outro sistema"?
- [ ] Tudo é legível — contraste suficiente, nada comunicado só por cor?
- [ ] O que é raro ou avançado está recolhido (divulgação progressiva), e o caminho
      comum está a um clique óbvio?

Reprovou em algum? Corrija antes de apresentar. É mais barato que o usuário pedir.
