---
name: prototipo-api
description: "Use quando um protótipo precisar de backend rodando localmente sem Docker, WSL, Postgres ou Django — só Node. Traz um servidor de arquivo único (assets/server.mjs) que gera a API a partir de um db.json declarativo, falando o mesmo contrato do portal de destino (envelope {data, total, extras}, take/skip/ordering/search, trailing slash, erros DRF em pt-BR), para o frontend do frontend-kickstart funcionar sem adaptação e a conversão para Django/DRF custar pouco. Dispare em pedidos como 'sobe uma API para o protótipo', 'preciso de um backend simples', 'mock da API', 'banco para o protótipo'."
---

# API de protótipo — backend simples, conversão barata

O protótipo precisa de uma API e de dados, mas o autor não tem Docker, WSL, Postgres nem
Django — e não deveria precisar. Esta skill entrega um servidor Node de **arquivo único e
zero dependências** que fala exatamente o contrato do portal de destino. O frontend nasce
apontando para ele sem nenhuma adaptação, e a conversão futura vira troca de URL + geração
dos models a partir do schema.

> **Não é produção.** Auth de mentira (qualquer credencial loga), sem permissões, dados
> num JSON local. É o suficiente para prototipar — e nada além disso. Diga isso ao usuário.

## Setup (passo a passo)

1. **Pré-requisito único: Node ≥ 20.** Confira com `node --version`; se faltar, instale
   pelo instalador oficial de nodejs.org — sem Docker, sem WSL.
2. **Frontend**: siga a skill `frontend-kickstart` (não duplique nada daqui). O default
   `VITE_API_URL=http://localhost:8000/api` já casa com a porta deste servidor.
3. **Servidor**: copie `assets/server.mjs` para `server/` no projeto e crie o
   `server/db.json`:
   - Projeto no padrão `sdd`? **Gere o `_schema` a partir das seções "Dados:" do
     `docs/notes.md`** — cada campo/tipo/regra de lá vira uma entrada em `campos`. É essa
     amarração que faz a documentação virar banco.
   - Sem sdd? Parta de `assets/db.example.json` e adapte.
   - Formato completo do `_schema` e das rotas geradas: `references/servidor.md`.
4. **Rode**: `node server/server.mjs server/db.json` (porta via `PORT=…`). O console
   lista os recursos disponíveis. Semeie 2–3 registros por entidade no próprio `db.json`
   para as telas não nascerem vazias.
5. **Modelagem**: as regras de dados continuam sendo as de
   `prototipo-portal/references/03-padroes-dados-api.md` (UUID, carimbos, enums de
   status, pt-BR snake_case) — o servidor já cumpre id/carimbos sozinho; o resto é
   decisão sua no `_schema`.

## Limites do v1 — e o que fazer quando esbarrar

- **Ação de negócio nomeada** (`POST /lotes/{id}/aprovar`): não existe; use PATCH de
  status no protótipo e **anote como desvio** (em `docs/notes.md` se o projeto usa sdd),
  para a conversão criar a action de verdade.
- **Upload de arquivo**: campo `arquivo` guarda só o nome; o arquivo em si não sobe.
- **Multiusuário/permissão**: todo mundo vê tudo. Papéis ficam documentados no
  `context.md`, não no servidor.

## Conversão depois

Quando o protótipo for absorvido pelo portal, siga `references/conversao.md`: o `_schema`
vira models Django campo a campo, as rotas viram ViewSets no router, e o que o frontend
consome não muda de forma — só de endereço.
