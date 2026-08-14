# Publicar / atualizar um documento

> Os nomes de rota, model e comando abaixo são os do portal que originou esta skill. Ajuste
> para os do seu projeto — o que importa é o **padrão**, não os nomes.

## Pelo portal (caminho normal)

`/projetos` → abrir o card do projeto → **Editar documento** → escrever → **Salvar**.

- O editor tem preview lado a lado e o botão `?` abre a cola da sintaxe.
- Permissão restrita: só **quem criou o projeto** ou um **superusuário** salva (o backend nega
  o resto com 403).
- Salvar faz `PATCH /api/v1/projetos/{id}/` com `{"conteudo": "..."}`.

## Pela API

```bash
curl -X PATCH https://<host>/api/v1/projetos/<uuid>/ \
  -H "Authorization: Token <token>" \
  -H "Content-Type: application/json" \
  --data-binary @documento.json     # {"conteudo": "..."}
```

O serializer de **lista** não devolve `conteudo` — só o detalhe (`GET .../{id}/`). É de
propósito: o board não precisa carregar documento nenhum para desenhar os cards.

## Catálogo versionado (como o conteúdo chega nos outros ambientes)

Cada ambiente roda em container separado, com banco próprio, e o kanban é conteúdo do
**produto** — não dado de usuário. Então a fonte da verdade é o que está **versionado no
repositório**:

```
catalogo/
├── carga_inicial.json     estrutura: workspaces, projetos (com os ids), tarefas
└── documentos/<slug>.md   o documento de cada projeto, um arquivo por projeto
```

Uma **migration de carga** aplica esse catálogo no deploy: limpa workspaces, projetos e tarefas
e recria tudo com os **mesmos ids** — link para `/projetos/<uuid>` funciona em qualquer
ambiente. A autoria não viaja: cada ambiente assina com o usuário de sistema dele. Nenhum
comando manual é necessário em produção.

> [!CUIDADO]
> A carga é destrutiva de propósito. Projeto criado direto em outro ambiente **não sobrevive**
> à migration. Depois dela, quem manda é o portal daquele ambiente.

### Fluxo para mudar o conteúdo

1. Edite os projetos e documentos **no portal local**.
2. Exporte o banco de volta para o catálogo e commite:

```bash
python manage.py exportar_carga_projetos --dry-run   # confere
python manage.py exportar_carga_projetos             # escreve o catálogo
```

3. Para levar a mudança a um ambiente que **já aplicou** a carga: uma migration nova (mesma
   função, um `RunPython`) ou, se for só documento, o import abaixo.

O exportador avisa sobre `.md` órfão (projeto excluído) — ele não apaga arquivo.

### Importar só os documentos (sem limpar nada)

```bash
python manage.py importar_documentos_projetos --dry-run     # confere
python manage.py importar_documentos_projetos               # aplica
python manage.py importar_documentos_projetos --sobrescrever
```

- Casa o arquivo com o projeto pela rota do documento (`/<slug>/`).
- Sem `--sobrescrever`, só preenche documento **vazio** — nunca atropela o que foi escrito no
  portal.

## Duas regras que valem em qualquer ambiente

> [!CUIDADO]
> Nunca edite o campo de conteúdo com `queryset.update()` nem direto no banco: pula os signals
> e a trilha de auditoria. Toda escrita passa pelo service/serializer.

Precisou usar o shell para investigar? O banco de desenvolvimento costuma ter dado real de
teste — trabalhe dentro de transação com rollback:

```python
from django.db import transaction
with transaction.atomic():
    ...
    transaction.set_rollback(True)
```
