---
name: prototipo-portal
description: "Use ao criar ou revisar protótipo, mockup, MVP ou prova de conceito de um produto que depois será convertido para o portal (Vue 3 + PrimeVue 4 + Django REST) — em qualquer stack, inclusive exports do Lovable. Traz a identidade visual (tokens prontos), os padrões de tela e a forma de dados/API do destino, para o protótipo nascer parecido e a conversão custar menos. Dispare em pedidos como 'cria um protótipo', 'monta um MVP', 'tela de demonstração', 'novo módulo no padrão do portal'."
---

# Protótipo no padrão do portal

Este protótipo será convertido para um portal operacional existente. Quanto mais próximo
ele nascer do padrão do destino, mais barata a conversão — o objetivo da skill é
direção, não fidelidade de stack.

> **Adapte ao instalar:** os tokens de cor e os termos de domínio das referências
> descrevem o nosso portal. Outro destino? Troque a paleta e os exemplos — a estrutura
> das regras continua valendo.

## Como aplicar

1. Leia as referências antes de gerar tela ou modelo de dados:
   - `references/01-identidade-visual.md` — cores, tokens CSS prontos, tipografia,
     densidade, dark mode, o que evitar. **Sempre.**
   - `references/02-padroes-frontend.md` — os 7 padrões de tela, formulários, tabelas,
     status, navegação, fluxos de aprovação. **Sempre que houver UI.**
   - `references/03-padroes-dados-api.md` — modelagem (UUID, carimbos, enums de status,
     ledger, trilha de aprovação, dados sensíveis) e forma da API. **Quando houver
     banco ou backend.**
2. Trate tudo como **direção, não regra**: ideia melhor que conflita com um guia ganha —
   mas deixe o desvio anotado (comentário ou nota na tela), para a conversão não tratar
   como erro.
3. Preserve custe o que custar: a paleta e a densidade (01), o padrão de tela escolhido
   (02) e a forma dos dados (03). O resto é livre.
4. Interface e nomes de domínio em **pt-BR**; moeda e data em formato brasileiro.

## Limites

- A skill vale para **protótipos fora do portal**. Dentro do repositório do portal, as
  regras de lá (CLAUDE.md do projeto) mandam e esta skill não se aplica.
- Para usar os mesmos guias no Lovable ou em outra IA sem skills, cole
  `references/lovable-knowledge.md` (os três guias num arquivo só) no Knowledge do
  projeto — instruções no README do pacote.
