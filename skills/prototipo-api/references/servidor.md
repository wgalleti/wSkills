# Contrato do servidor de protótipo

O que `assets/server.mjs` faz a partir do `db.json`. Tudo aqui espelha o portal de
destino — se algo divergir do que `frontend-kickstart/references/setup.md` §4 espera,
é bug do servidor, não do frontend.

## Formato do db.json

```json
{
  "_schema": {
    "pedidos-reembolso": {
      "searchFields": ["colaborador"],
      "extras": {
        "total_pendente": { "op": "sum", "campo": "valor", "quando": { "status": "pendente" } }
      },
      "campos": {
        "colaborador": { "tipo": "texto", "obrigatorio": true },
        "valor": { "tipo": "decimal", "obrigatorio": true },
        "status": { "tipo": "enum", "opcoes": ["pendente", "aprovado"], "padrao": "pendente" }
      }
    }
  },
  "pedidos-reembolso": []
}
```

- Nome da entidade = recurso da URL: **kebab-case plural** (`/api/pedidos-reembolso/`).
- Campos em **snake_case pt-BR**, curtos, sem redundância (`valor`, não `valor_pedido`).
- Cada entidade em `_schema` ganha um array de mesmo nome com os registros (semente e
  dados criados em runtime — o servidor grava de volta no arquivo).

### Tipos de campo

| tipo         | valor aceito                           | atributos extras           |
| ------------ | -------------------------------------- | -------------------------- |
| `texto`      | string                                 |                            |
| `decimal`    | número (2 casas por convenção)         |                            |
| `inteiro`    | número inteiro                         |                            |
| `booleano`   | true/false                             |                            |
| `data`       | string `AAAA-MM-DD`                    |                            |
| `datahora`   | string ISO-8601                        |                            |
| `enum`       | uma das `opcoes`                       | `opcoes: []`, `padrao`     |
| `arquivo`    | string (só o nome — nada sobe)         |                            |
| `referencia` | id (UUID) existente na `entidade` alvo | `entidade: "fornecedores"` |

Todo campo aceita `obrigatorio: true` e `padrao`. O servidor cria sozinho `id` (UUID) e
`criado_em`/`atualizado_em` (ISO) — não os declare.

## Rotas geradas por entidade

| Rota                           | Método | Faz                                               |
| ------------------------------ | ------ | ------------------------------------------------- |
| `/api/<recurso>/`              | GET    | listagem paginada/filtrada                        |
| `/api/<recurso>/`              | POST   | cria (valida obrigatório/tipo/enum/referência)    |
| `/api/<recurso>/<id>/`         | GET    | detalhe                                           |
| `/api/<recurso>/<id>/`         | PATCH  | atualização parcial (PUT também aceito, completa) |
| `/api/<recurso>/<id>/`         | DELETE | exclui (204)                                      |
| `/api/<recurso>/<campo-enum>/` | GET    | opções do enum: `[{value, label}]`                |
| `/api/auth/login/`             | POST   | qualquer credencial → `{token}` (auth de mentira) |

**Trailing slash obrigatório** em tudo (como no portal); sem ela, 404 com dica.

## Listagem

Query params (mesmos que o dataProvider do kickstart emite):

- `take` / `skip` — paginação (`take` ausente = tudo).
- `ordering=campo` ou `ordering=-campo` — ordenação, `-` = desc.
- `search=termo` — busca case-insensitive nos `searchFields` do schema.
- `<campo>=valor` — filtro por igualdade em qualquer campo declarado.
- `extras=1` — inclui o bloco `extras` (agregações do **conjunto filtrado inteiro**,
  não da página): `op: "sum"` (soma de `campo`) ou `"count"`, com `quando` opcional.

Resposta: `{ "data": [...], "total": n, "extras": {...}? }` — o envelope do portal;
`normalizeList` do kickstart consome sem ajuste.

## Erros — formato DRF, pt-BR

- Validação: `{ "campo": ["Este campo é obrigatório."] }` (400)
- Gerais: `{ "detail": "Não encontrado." }` (404, 405, JSON inválido)

As mensagens são exibíveis direto pelo `useApiError` do frontend.

## Decisões registradas

- `search` como nome do param de busca: é o default do `SearchFilter` do DRF — na
  conversão, nada muda no frontend.
- Persistência em JSON (não SQLite): `node:sqlite` ainda é experimental no Node 22 LTS e
  drivers nativos exigem compilação — atrito que a skill existe para evitar. O JSON é
  legível pelo autor e pelo agente na conversão.

## Fora do v1

- Ação de negócio nomeada (`POST /{id}/aprovar`) — use PATCH de status e anote o desvio.
- Upload real de arquivo; multiusuário; permissão por papel; soft-delete automático
  (modele status `cancelado` no schema se precisar da regra).
