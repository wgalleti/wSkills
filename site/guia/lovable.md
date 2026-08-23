# Usar no Lovable (e em IAs sem suporte a skills)

A skill [`prototipo-portal`](/skills/prototipo-portal) existe também em formato "cola e
usa": o arquivo `skills/prototipo-portal/references/lovable-knowledge.md` reúne os três
guias (identidade visual, padrões de frontend, dados/API) num markdown único, sem nada
específico de Claude Code.

## Passo a passo no Lovable

1. Abra (ou crie) o projeto no Lovable.
2. Clique no nome do projeto → **Settings** (engrenagem) → seção **Knowledge**.
   O Knowledge é um texto que o Lovable relê em **toda** geração do projeto — é o lugar
   certo para o guia valer sempre, sem repetir a cada prompt.
3. Copie o conteúdo inteiro de
   [`lovable-knowledge.md`](https://github.com/wgalleti/wSkills/blob/main/skills/prototipo-portal/references/lovable-knowledge.md)
   e cole no campo. Salve.
4. No primeiro prompt, reforce:

   > Siga o Knowledge do projeto como direção de design e de dados: ele descreve o
   > sistema final para onde este protótipo será convertido. Em conflito, prefira o
   > guia — mas proponha algo melhor quando tiver motivo, sinalizando o desvio.

Projeto que **já existe** no Lovable: cole o Knowledge do mesmo jeito e peça num prompt
"alinhe o visual ao design system descrito no Knowledge". Se a interface mudar de lugar,
procure por "Knowledge" nas configurações do projeto — o conceito permanece.

## Outras IAs

- **ChatGPT / Gemini** — crie um Project/GPT com o arquivo como conhecimento.
- **v0 / Bolt** — cole no prompt inicial.

O arquivo é **gerado** a partir dos guias em `references/` (o cabeçalho dele diz como
regenerar). Edite os guias, nunca o gerado.
