---
name: manual-doc
description: "Use ao produzir ou atualizar uma página do manual de uso de um app web (rota `/manual`, arquivos em `docs/manual/`): levanta o comportamento real da tela no código, opera a tela no ambiente local com dados de demonstração, captura screenshots e GIFs e redige o markdown no vocabulário da skill /documento. Dispare em pedidos como 'documenta a tela X no manual', 'gera a página do manual de transferências', 'refresh das capturas do slug Y'."
---

# manual-doc — produzir uma página do manual de uso

O manual vive em `docs/manual/` (1 arquivo por tela/fluxo), é **público** numa rota `/manual`
e sai no bundle do frontend. Esta skill produz uma página completa: texto + capturas + GIF +
amarração com a rota. A régua editorial do markdown é da skill `/documento` — invoque-a antes
de redigir; esta skill acrescenta só o que é específico de manual.

> **Adapte ao instalar:** os caminhos (`docs/manual/`, `/manual-assets/`, router do Vue) e o
> comando de seed são do portal de origem. Troque pelos do seu projeto: o que importa é o
> ciclo — verificar no código, operar com dados de demonstração, capturar, redigir, amarrar.

## Regras que não se negociam

1. **Zero dado real.** O manual é público. Toda captura, GIF e exemplo sai de um cenário de
   demonstração (um comando de seed dedicado, com fornecedores e produtos fictícios).
   Encontrou dado real na tela? Pare e avise; não capture.
2. **Nunca inventar comportamento.** O que a skill não conseguiu verificar no código **e** na
   tela vira pergunta ao dono do projeto, não texto. Manual errado é pior que manual incompleto.
3. **Uma tarefa por GIF.** 5–20 segundos, começa na tela pronta e termina no resultado visível.
   Tarefa longa = quebrar em GIFs por etapa.
4. **pt-BR, voz de operador.** Nome do que a pessoa vê na tela, nunca nome de componente,
   endpoint ou service.

## O ciclo (modo completo)

Dado "documenta a tela X":

1. **Levantar o comportamento real.** Rota no router do frontend, schema/composable da tela e
   service do backend (se o projeto tiver grafo de conhecimento, consulte-o primeiro). Extraia
   o que o usuário percebe: campos obrigatórios, estados e transições, permissões, efeitos
   colaterais (ex.: fechar um documento gera movimentação de estoque; reabrir estorna). Anote
   o que não ficou claro — vira a lista de perguntas do passo 6.
2. **Preparar o ambiente.** API e front locais já devem estar de pé (não suba servidores por
   conta própria — confira as portas do ambiente antes; num worktree elas não são as padrão).
   Confirme que o banco tem o cenário de demonstração; se não tiver, peça para rodar o seed —
   nunca rode contra banco que não seja o do seu ambiente isolado.
3. **Operar e capturar.** Com automação de browser, execute a tarefa como um operador
   executaria. Capture screenshots dos estados-chave e um GIF por tarefa, com frames extras
   antes e depois. Nomes: `docs/manual/_assets/<slug>--passo-N.png` e
   `docs/manual/_assets/<slug>--<tarefa>.gif`.
4. **Redigir** em `docs/manual/<modulo>/<slug>.md`, seguindo a skill `/documento`, com as
   convenções de manual:
   - frontmatter: `titulo`, `modulo`, `rotas: [nome-da-rota]`, `ordem`, `atualizado`
     (data absoluta), `video` (opcional);
   - título orientado a tarefa ("Como lançar uma nota de entrada"), nunca nome de tela crua;
   - abre com **pré-requisitos** (permissão, filtros globais, dados que precisam existir);
   - corpo em `::: passos`, um passo = uma ação, captura por passo quando muda algo na tela;
   - seção **"O que acontece por trás"** com os efeitos (movimentação, estorno, campo
     calculado visível) em linguagem de operador;
   - FAQ curta (3–5 perguntas que um operador novo faria) só quando houver resposta verificada;
   - imagens referenciadas pelo caminho público de assets do manual (o build não embute mídia).
5. **Fechar o ciclo.** Acrescente/ajuste a amarração da rota com o slug do manual (ex.:
   `meta.manual = { slug }` na rota), confira que todo link e imagem da página resolvem e que
   o slug entrou no índice do manual.
6. **Relatar** o que ficou pendente: perguntas de comportamento, captura que não saiu, tela em
   estado que o seed não cobre.

## Modo refresh

"refresh <slug>": regrava **só as mídias** da página (mesmos nomes de arquivo, mesmos passos do
texto existente), sem reescrever uma linha de texto. Use após mudança visual de tela. Se o
texto não bater mais com a tela (campo sumiu, passo mudou), pare e avise — aí é modo completo.

## Cuidados

- Num worktree isolado, a porta do front/API não é a padrão — `localhost:8000` pode ser outro
  checkout. Confira antes de operar.
- GIF pesado: otimize (gifsicle ou WebM); mídia não entra no bundle, mas a pasta de assets do
  manual também não é lugar de arquivo de 50 MB.
- Não commite nada por conta própria; entregue os arquivos e o resumo.
