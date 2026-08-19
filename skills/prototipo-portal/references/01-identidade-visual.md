# Identidade visual — direção para protótipos

Este produto será integrado a um portal corporativo existente. Use esta identidade desde
o primeiro layout. É direção, não camisa de força: mantenha as cores, a tipografia e a
densidade; a criatividade vai em composição e hierarquia, não em paleta nova.

## Marca em três cores

- **Azul** é o primário — botões de ação, links, foco, seleção. Um único primário por tela.
- **Navy** é estrutura — barra superior, sidebar, fundos de "chrome". Nunca em botão.
- **Dourado** é acento — no máximo **um** destaque dourado por tela (um KPI, um selo, um marco).
- **Verde nunca é ação nem marca** — verde só existe como status "sucesso/aprovado".
- Vermelho só para ação destrutiva real ou status de erro.

## Tokens (cole como CSS variables do projeto)

```css
:root {
  /* ação (primário) */
  --primary: #1f5092; /* azul core */
  --primary-hover: #1c4179;
  --primary-soft: #eef4fb; /* fundos suaves de seleção/realce */
  --primary-fg: #ffffff;

  /* acento (máx. 1 uso por tela) */
  --accent: #d9952f; /* dourado core */
  --accent-soft: #fdf6e7;

  /* estrutura (topbar/sidebar) */
  --shell: #14283d; /* navy */
  --shell-2: #0f1f30;
  --shell-fg: #eaf0f7;
  --shell-fg-muted: #9fb0c6;
  --shell-accent: #e8b85c; /* item ativo na navegação */

  /* status (com fundo suave correspondente) */
  --success: #1e8e54;
  --success-soft: #e3f4ea;
  --warning: #c7861f;
  --warning-soft: #fbefd6;
  --danger: #d24b3b;
  --danger-soft: #fbe6e3;
  --info: #2f7e97;
  --info-soft: #e1f0f4;

  /* séries de gráfico, nesta ordem (não reutilizar success/danger como categoria) */
  --viz-1: #1f5092;
  --viz-2: #d9952f;
  --viz-3: #2f8f9e;
  --viz-4: #b9543f;
  --viz-5: #6b5e8c;
  --viz-6: #2e8b57;

  /* superfícies e texto (modo claro) */
  --bg: #f4f6f9; /* fundo da página */
  --surface: #ffffff; /* cards, tabelas */
  --surface-2: #f8fafc; /* cabeçalho de tabela, faixas */
  --fg: #141a22;
  --fg-muted: #5a6573; /* texto secundário — use bastante */
  --fg-subtle: #8794a3;
  --border: #e2e8f0; /* bordas quase brancas */
  --border-strong: #cdd6e2; /* só em inputs */

  /* forma */
  --radius: 8px; /* controles */
  --radius-lg: 12px; /* cards */
  --radius-full: 999px; /* tags/pills */
  --shadow-sm: 0 1px 2px rgba(16, 30, 24, 0.06), 0 1px 3px rgba(16, 30, 24, 0.08);
  --shadow-md: 0 2px 4px rgba(16, 30, 24, 0.06), 0 4px 8px rgba(16, 30, 24, 0.08);

  /* densidade (app de trabalho: compacto, muita informação) */
  --control-h: 38px; /* altura de input/botão */
  --row-h: 44px; /* linha de tabela */
  --card-pad: 20px;
  --section-gap: 24px;
  --motion: 220ms; /* transições curtas; nada de animação longa */
}
```

## Tipografia

- Fonte: **Satoshi** (Fontshare) se disponível; senão `system-ui`. Não usar serifada
  nem display.
- Escala reduzida — é app denso: texto de UI **14px**, secundário 13px, título de
  seção 17px, título de página 20–24px. Nada acima de 30px dentro do app.
- Peso: regular no corpo, **medium/semibold** no que importa. Evite bold pesado
  espalhado.
- Números em tabela: alinhados à direita com `font-variant-numeric: tabular-nums`.
- Moeda e data sempre em **pt-BR** (`R$ 1.234,56`, `17/08/2026`).

## Modo escuro

Preveja desde o início: defina tudo via variables e troque só os valores (fundo
`#0c1219`, superfície `#131b25`, texto `#e9eef4`, primário clareado `#7eaadd`). A barra
superior/sidebar **continua navy nos dois modos**.

## O que evitar (marcas de protótipo genérico)

- Gradientes em botão ou card; sombras pesadas; glassmorphism.
- Borda colorida grossa na lateral de card ("side-tab").
- Cartões com muita borda — agrupe por **espaço e fundo suave**, não por caixas.
- Roxo/violeta como primário (paleta default de template).
- Emoji como ícone; ícones decorativos sem função.
- Tela "de marketing" dentro do app: hero, frase de impacto, CTA gigante.
- Cor nova inventada para um caso — se falta cor, use as de status.

## Tom geral

Portal sóbrio de operação diária: fundo claro acinzentado, cards brancos de borda
sutil, uma ação primária óbvia por tela, texto secundário abafado (`--fg-muted`),
espaço em branco generoso entre blocos. Riqueza visual vem de hierarquia e ritmo — não
de decoração.
