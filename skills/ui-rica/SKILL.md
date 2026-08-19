---
name: ui-rica
description: "Use sempre que for criar ou ajustar uma tela (página, formulário, dashboard, listagem) e quando o usuário reclamar do visual — 'ficou feio', 'parece anos 1990', 'espaço mal aproveitado', 'deixa a UI mais rica', 'melhora o layout'. Define o processo: carregar a direção de design disponível, inventariar os componentes existentes antes de construir e se auto-revisar com checklist antes de entregar. Independente de stack — funciona com qualquer biblioteca de componentes e estilo."
---

# UI rica — direção e auto-revisão de telas

Tela tecnicamente correta ainda pode sair pobre: formulário esticado em largura total,
espaço vazio, componente rico da biblioteca ignorado e reimplementado no básico. Cada
tela pobre custa um ciclo de "ficou ruim, refaz" — esta skill existe para a primeira
entrega já sair boa.

## O processo, nesta ordem

### 1. Carregue a direção de design — antes de escrever markup

Procure, nesta ordem, e use a **primeira** que existir:

1. **Skill ou plugin de frontend design instalado** (ex.: o plugin oficial
   `frontend-design`). Se aparecer na sua lista de skills, invoque — ele é
   especialista no assunto.
2. **Design system do projeto**: arquivo de tokens, guia de estilo, CSS de tema.
   Se o projeto nasceu da `frontend-kickstart`, a régua é o guia de design dela
   (arquivo design.md das referências: tokens, tipografia, densidade, os 7 padrões).
3. **Guias das skills instaladas**: o guia 02-padroes-frontend da `prototipo-portal`
   (padrões de tela e formulário do portal).
4. Nada disso existe? Use `references/heuristicas.md` desta skill — vale para
   qualquer stack.

Não misture: uma direção carregada é a lei da sessão. As heurísticas desta skill
complementam (espaço, riqueza, auto-revisão); nunca contradizem a direção do projeto.

### 2. Inventarie antes de construir — use o que tem

Antes de criar qualquer elemento, confira o que a biblioteca de componentes do projeto
**já oferece** para aquele problema. Regra dura: **nunca reimplemente no básico o que a
biblioteca faz rico**. Exemplos do que costuma passar batido:

- Upload de imagem: se existe componente com **crop/preview**, use-o — e **renderize a
  imagem de verdade** onde ela aparece (avatar, perfil, card), não um ícone genérico.
- Seleção: autocomplete/busca em vez de dropdown gigante; calendário em vez de input
  de texto para data.
- Feedback: toast, skeleton, tag de status, empty state — se existem prontos, são
  obrigatórios, não opcionais.

Na dúvida sobre a API de um componente, leia a doc dele (MCP/skill da biblioteca, se
disponível) em vez de adivinhar por nome de prop.

### 3. Construa com as heurísticas de espaço e riqueza

O detalhe está em `references/heuristicas.md` — inclusive os princípios clássicos de
design (Gestalt, Hick, Fitts, Jakob, 60-30-10, grid de 8pt, contraste acessível) já
traduzidos em regra prática. O resumo que evita 80% dos retrabalhos:

- **Largura tem propósito**: formulário de edição não ocupa a tela inteira — limite a
  largura e agrupe campos em colunas quando fizer par natural. Largura total é para
  tabela, dashboard e conteúdo que de fato precisa dela.
- **Preencha o espaço que reservou**: container largo com conteúdo espremido num canto
  é o pior dos dois mundos. Ou o bloco usa a área, ou a área diminui.
- **Riqueza é hierarquia + dados reais**: título claro, uma ação primária óbvia,
  agrupamento por espaço, e dados de verdade renderizados (foto, valor formatado,
  status com cor+rótulo) — não caixas, bordas e ícones decorativos.

### 4. Auto-revisão antes de entregar — obrigatória

Antes de mostrar a tela ao usuário, olhe-a como quem vai usá-la e passe o
**checklist de revisão** no fim de `references/heuristicas.md`. Item reprovado se
corrige **agora**, não depois da reclamação. Só então apresente — dizendo em uma frase
o que a tela resolve, não listando o que foi feito.

Se o usuário ainda pedir ajuste visual, trate como calibragem da direção: entenda o
princípio por trás do pedido (não só o caso) e aplique nas demais telas sem esperar a
mesma reclamação de novo.
