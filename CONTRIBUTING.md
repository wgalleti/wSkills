# Contribuir

## Anatomia de uma skill

```
skills/<nome-em-kebab-case>/
├── SKILL.md          obrigatório — frontmatter + a regra
├── references/       material consultado sob demanda (o agente lê quando precisa)
└── assets/           arquivos para copiar (ex.: tokens.css)
```

`SKILL.md` começa com frontmatter YAML:

```markdown
---
name: minha-skill
description: "Use quando … Traz … Dispare em pedidos como '…', '…'."
---
```

- **`name` = nome da pasta**, kebab-case. O validador reprova divergência.
- **`description` é o que faz a skill ser escolhida.** Escreva _quando_ usar e _o que ela
  traz_, com os gatilhos em linguagem de usuário. Descrição vaga = skill que nunca carrega.
- **`SKILL.md` é regra, não prosa.** Enxuto, imperativo. O que for longo (receita completa,
  tabela de API, exemplo grande) vai para `references/` e é citado pelo caminho relativo —
  o validador confere que o arquivo citado existe.

## Regras editoriais

- **Diga o porquê junto da regra.** "Não use X" sem motivo vira regra morta que a próxima
  pessoa desfaz. O valor está no que já custou tempo.
- **Sem duplicar o que o código diz.** Skill aponta para a fonte da verdade; ela não copia
  número que vai mudar.
- **Skill acoplada a um projeto** (caminhos, nomes de model, gotchas de versão) abre com um
  bloco _"adapte ao instalar"_ dizendo o que precisa ser trocado.
- pt-BR, frases curtas, voz ativa.

## Este repositório é público

Nada de nome de cliente, nome de pessoa, host interno, IP, caminho absoluto de máquina
(`/Users/...`) ou credencial. O validador barra caminho absoluto, token, IP privado e e-mail.

Nomes próprios **não** ficam listados no repositório — escrever o nome que se quer esconder
num repo público é o próprio vazamento. Passe-os por fora, ao rodar o validador:

```bash
WSKILLS_DENYLIST="cliente,fulano" yarn validate
```

Ou crie um `.wskills-denylist` local (uma expressão regular por linha) — o arquivo é
ignorado pelo git. No CI a lista vem do secret `WSKILLS_DENYLIST`.

## Antes de abrir PR

```bash
yarn validate     # estrutura + vazamento
yarn smoke        # instala o catálogo inteiro num tmp e confere o ciclo do CLI
yarn format       # prettier nos .mjs/.json/.md
```

Commits em conventional commits (`feat:`, `fix:`, `docs:`…) — eles viram o CHANGELOG no
release. Uma skill nova é `feat:`; ajuste de texto é `docs:` ou `fix:`.

Publicação: [PUBLISHING.md](PUBLISHING.md).
