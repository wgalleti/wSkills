---
layout: home

hero:
  name: wSkills
  text: Skills de Claude Code prontas para o seu stack
  tagline: Extraídas de um portal em produção (Vue 3 + PrimeVue 4 + Django REST), anonimizadas e generalizadas — instale com um comando e o agente passa a trabalhar no seu padrão.
  image:
    src: /logo.svg
    alt: wSkills
  actions:
    - theme: brand
      text: Começar
      link: /guia/comecando
    - theme: alt
      text: Catálogo de skills
      link: /skills/
    - theme: alt
      text: Worktrees com Orca
      link: /orca/

features:
  - icon: 🚀
    title: Do zero ao sistema
    details: A skill novo-projeto orquestra as demais na ordem certa — ideia → documentação → dados/API → telas → conversão. Você diz "quero criar um sistema" e o resto se encadeia.
    link: /skills/novo-projeto
  - icon: 🧩
    title: Frontend no padrão
    details: Bootstrap com Vite + PrimeVue 4 unstyled + Tailwind 4, arquitetura em camadas, design system em tokens e a suite de componentes W* — a primeira versão da tela já sai boa.
    link: /skills/frontend-kickstart
  - icon: 📝
    title: Processo que documenta sozinho
    details: MR legível por gestão não técnica, documento de projeto com marcação rica, manual de uso com capturas — o registro nasce junto com o trabalho.
    link: /skills/mr
  - icon: 🌳
    title: Worktrees paralelos no Orca
    details: Kit completo para monorepo — API, frontend e banco Postgres isolados por worktree, com clone do banco de dev, teardown automático e MR draft por frente.
    link: /orca/
  - icon: 🔍
    title: Busca em tudo
    details: Todas as skills e guias indexados — aperte / e procure por "reprojeção UTM", "FieldDef" ou "clone do banco".
  - icon: 🛡️
    title: Público por construção
    details: Validador de vazamento no CI — caminho de máquina, segredo, IP interno e nome de cliente não entram. O que está aqui pode ser compartilhado.
---

## Instalação em uma linha

```bash
npx @wgalleti/wskills list        # ver o catálogo
npx @wgalleti/wskills add --all   # instalar tudo no projeto atual
```

Reinicie a sessão do Claude Code e confirme com `/skills`. Detalhes, opções e instalação
global: [Começando](/guia/comecando).
