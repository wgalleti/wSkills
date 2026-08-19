# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [0.3.0](https://github.com/wgalleti/wSkills/compare/v0.2.0...v0.3.0) (2026-08-19)

### Skills e funcionalidades

* skill novo-projeto — porta de entrada que orquestra as demais ([e99c596](https://github.com/wgalleti/wSkills/commit/e99c596f40a03128d4bd77aaf89d150873d991f2))
* skill prototipo-api — backend de protótipo sem Docker/WSL ([e03f17f](https://github.com/wgalleti/wSkills/commit/e03f17f21bfe4292fb38148b39bb88b988625e39))
* skill sdd — documentação simplificada em quatro arquivos ([d4a03a3](https://github.com/wgalleti/wSkills/commit/d4a03a395bc7cb8285eae526aabbc7969d1a5bd2))
* skill ui-rica — direção e auto-revisão visual de telas ([4cd3fd2](https://github.com/wgalleti/wSkills/commit/4cd3fd225722b15cf0aa8fab8e97c710d1ac55a0))

### Documentação

* catálogo com as skills novas e destaque da porta de entrada ([f31dd67](https://github.com/wgalleti/wSkills/commit/f31dd67f4244d82cc0e4e4790b19df859e10a285))
* package is on npm — reword clone fallback ([8789f66](https://github.com/wgalleti/wSkills/commit/8789f669f7afef65749c7c4d14831f1977c53e70))
## [0.2.0](https://github.com/wgalleti/wSkills/compare/v0.1.0...v0.2.0) (2026-08-17)

### Skills e funcionalidades

* **prototipo-portal:** direção de padrão para protótipos fora do portal (Lovable, MVP,
  prova de conceito) — identidade visual com tokens, 7 padrões de tela, forma de
  dados/API — mais o `lovable-knowledge.md` gerado para colar no Knowledge do Lovable
  ([6ebfdf6](https://github.com/wgalleti/wSkills/commit/6ebfdf6bf2809c55b7c9dcce1fbfcfc301042466))

### Documentação

* guia completo do Claude Code, do zero a produtivo — `docs/claude-code.md`: instalação
  detalhada, prompts prontos (CLAUDE.md, ferramentas), rotina de trabalho no plano Pro,
  rtk, graphify, ccusage, MCPs e o plugin frontend-design
  ([a892102](https://github.com/wgalleti/wSkills/commit/a89210261ef06d44deb92ec6169b2b19e2dcf60f),
  [769205a](https://github.com/wgalleti/wSkills/commit/769205a258b185c7e6c038dc7ded32190673865b),
  [4b482e2](https://github.com/wgalleti/wSkills/commit/4b482e2364013338a9e186fce3791b1bd3d83879),
  [ccbd2a8](https://github.com/wgalleti/wSkills/commit/ccbd2a8b82d29aa10246748f6c1d4ec891657fbb))
* passo a passo de uso no Lovable (Settings → Knowledge) e em outras IAs no README

## 0.1.0 (2026-08-14)

### Skills e funcionalidades

* catálogo inicial de skills e CLI de instalação ([6fbaec6](https://github.com/wgalleti/wSkills/commit/6fbaec68de091f1dcfb790d027efa2930b620add))
  * **frontend-kickstart:** kit para iniciar um frontend Vue 3 + PrimeVue 4 + Tailwind 4 + suite W*
    (bootstrap, arquitetura em camadas, design system em tokens, usabilidade, evoluções)
  * **portal-frontend:** regras de trabalho num app já montado nesse padrão
  * **wpvc:** API da suite `@wgalleti/primevue-components`
  * **mr:** padrão editorial de Merge Request e regras de commit
  * **documento:** escrita de documento de projeto renderizado por `WMarkdownView`
  * **cli:** `wskills list · info · add · update · remove · status`, com manifesto `.wskills.json`
    que detecta skill editada localmente
* instalação sem npm e teste de tarball com --package ([b2fc5cd](https://github.com/wgalleti/wSkills/commit/b2fc5cd174011495760cd346742750c803bb8e1b))
