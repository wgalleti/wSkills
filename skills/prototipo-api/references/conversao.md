# Conversão: protótipo → portal (Django/DRF + Postgres)

Guia para quem vai absorver o protótipo. A boa notícia: o servidor de protótipo já fala
o contrato do portal, então **o frontend não muda de forma — só de endereço**
(`VITE_API_URL`). O trabalho de conversão é gerar o backend real a partir do `_schema`
e dos documentos do sdd (`docs/context.md` para papéis/permissões, `docs/notes.md` para
regras, `docs/validation.md` para testes de aceite).

## 1. `_schema` → models Django

Cada entidade vira um model; a tabela abaixo é mecânica:

| tipo no schema | campo Django                                                 |
| -------------- | ------------------------------------------------------------ |
| `texto`        | `CharField` / `TextField`                                    |
| `decimal`      | `DecimalField(max_digits=…, decimal_places=2)` — nunca float |
| `inteiro`      | `IntegerField`                                               |
| `booleano`     | `BooleanField`                                               |
| `data`         | `DateField`                                                  |
| `datahora`     | `DateTimeField`                                              |
| `enum`         | `CharField(choices=…)` com `TextChoices` das `opcoes`        |
| `arquivo`      | `FileField` (aqui nasce o upload real)                       |
| `referencia`   | `ForeignKey(<Entidade>, on_delete=PROTECT)`                  |

- `obrigatorio: true` → `blank=False, null=False`; ausente → `blank=True, null=True`.
- `padrao` → `default=`.
- `id` UUID → `UUIDField(primary_key=True, default=uuid4)`; `criado_em`/`atualizado_em`
  → `auto_now_add`/`auto_now` (mesmos nomes — o frontend já os exibe).
- Acrescente o que o protótipo não tinha e o padrão do portal exige
  (`03-padroes-dados-api.md`): `criado_por`, escopo organizacional
  (`empresa_id`/`unidade_id`), numeração de negócio quando houver.

## 2. Rotas → DRF

- Cada entidade → `ModelViewSet` + `DefaultRouter` com o **mesmo nome de recurso**
  kebab-case (`router.register("pedidos-reembolso", …)`). Trailing slash é o default
  do router — nada a fazer.
- Listagem: paginação `take`/`skip` (a classe de paginação do portal já emite o envelope
  `{data, total, extras}`), `OrderingFilter` (`ordering`), `SearchFilter`
  (`search_fields` = `searchFields` do schema), `FilterSet` com os campos que o
  protótipo filtrava por igualdade.
- `extras` do schema → agregações no backend (annotate/aggregate sobre o queryset
  filtrado), expostas pelo mesmo param `extras`.
- Endpoint de opções de enum (`/{recurso}/{campo}/`) → `@action(detail=False)`
  devolvendo `[{value, label}]` a partir do `TextChoices`.

## 3. O que muda de verdade na conversão

É aqui que mora o trabalho — o resto é mecânico:

- **Auth e permissão**: o login de mentira vira o auth real do portal; os papéis
  descritos em `docs/context.md` ("Para quem") viram grupos e permissões por ViewSet.
- **Ações de negócio**: os PATCH de status do protótipo (anotados como desvio em
  `docs/notes.md`) viram `POST /{recurso}/{id}/<acao>/` nomeados, com validação de
  transição e trilha de decisão em tabela própria.
- **Upload**: campos `arquivo` passam a receber o arquivo de verdade.
- **Regras de servidor**: validações que no protótipo eram só combinadas
  (ex.: "acima de R$ 1.000 exige segunda aprovação") viram código no serializer/service.
- **Dados**: os registros do `db.json` servem de fixture inicial se valerem a pena;
  senão, descarte — o schema é o que importa.

## 4. Aceite

`docs/validation.md` (parte checável) é o roteiro de testes de aceite da conversão:
cada item vira ao menos um teste automatizado ou verificação manual antes de considerar
o módulo convertido.
