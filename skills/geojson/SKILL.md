---
name: geojson
description: "Padrões de trabalho com GeoJSON/geometria em aplicações web (contornos de área — talhões, setores, lotes, zonas). Use ao criar ou revisar QUALQUER código que leia, grave, sirva ou renderize geometria — importação de arquivos, campos JSON de contorno, endpoints que devolvem coordenadas, mapas Leaflet no frontend. Gatilhos: 'geojson', 'geometria', 'contorno', 'polígono no mapa', 'importar desenho', 'shapefile', 'UTM', 'coordenadas', 'reprojeção'."
---

# GeoJSON — padrões de aplicação

Regra, não prosa. Nasceu da otimização de uma tela de mapa em produção: cada item abaixo
corresponde a um erro real que já custou performance ou importação falhada.

> **Adapte ao instalar:** os exemplos falam de "talhão" (área agrícola) e usam Django REST +
> Leaflet, mas os padrões valem para qualquer entidade com contorno e qualquer stack.
> Troque os nomes pelos do seu domínio e apague o que não se aplica.

## 1. Formato canônico (banco)

- Geometry GeoJSON **`Polygon`/`MultiPolygon`**, em **WGS84**, posição **`[longitude, latitude]`**
  (nesta ordem — RFC 7946; trocar os dois é o erro clássico de quem vem de lib de mapa, onde a
  convenção é `[lat, lng]`).
- **2D sempre**: descarte a altitude na entrada. Arquivos de campo chegam com `[lon, lat, 0.0]`
  e a 3ª componente é +33% de peso morto no banco e no payload.
- **6 casas decimais** (≈11 cm de precisão). Arquivos chegam com 15 casas; defina a constante
  num lugar só e arredonde **na entrada**, nunca na saída.
- Valide o formato em todo campo JSON de contorno com um validador único: tipo, aninhamento,
  faixa de coordenada (|lon|≤180, |lat|≤90) e anel fechado — formato, não topologia.
- Área cadastral (a que consta no registro) **nunca** é derivada/sobrescrita pelo desenho.
  Divergência entre área cadastral e área do polígono é relatório, não correção automática.

## 2. Importação de arquivos externos

- **Nunca assuma WGS84.** Arquivos de delimitação vêm em UTM sem aviso (caso real: arquivo de
  campo em SIRGAS 2000 / UTM 21S = EPSG:31981). Coordenada fora da faixa (|lon|>180 ou |lat|>90)
  ⇒ reprojetar (pyproj/proj4), na ordem de precedência: **EPSG explícito → `crs` declarado no
  arquivo → inferência por bounding box**. A inferência é ambígua entre zonas UTM vizinhas —
  quando ambígua, erro claro pedindo o EPSG e listando as candidatas; nunca chute.
- Pipeline de entrada, nesta ordem: **reprojetar → simplificar (opcional, default OFF) →
  descartar altitude → arredondar → validar**.
- Simplificação é Douglas-Peucker opcional (tolerância ~0.00001 ≈ 1 m), preservando o
  fechamento do anel e o mínimo de 4 posições. Default desligado: precisão vence.
- Importação é **idempotente**: geometria idêntica conta como "igual" e não regrava nem versiona.
- Casamento por nome usa normalização tolerante (acentos, caixa, separadores); o que não casa
  vira relatório com sugestão (`difflib` ou similar), nunca gravação por palpite.

## 3. Servir geometria pela API

- **Geometria NUNCA vai em listagem.** O serializer de list exclui o campo e expõe um booleano
  anotado `tem_geometria`; o queryset da list usa `defer("geometria")` (ou equivalente).
  Retrieve/create/update continuam completos — o form de edição precisa.
- Mapa/visualização em massa consome **endpoint dedicado e paginado** com payload mínimo:
  só `{id, nome, agrupador, area, geometria}`, mesmos filtros da listagem, ordenação estável.
  Nada de "traga tudo" para coleções com geometria.
- Compressão HTTP ligada (coordenadas comprimem ~75%). Não devolva geometria "de carona" em
  serializers `fields = "__all__"` de entidades que tenham contorno — cheque sempre.

## 4. Renderizar no frontend (Leaflet e afins)

- **Carregamento progressivo**: consumir o endpoint paginado em páginas (~40), anexando ao
  array de features com diff incremental por `id` — e **sem** refazer o `fitBounds` nas páginas
  seguintes (fit só na primeira leva). Cancele a sequência quando o filtro muda ou o painel
  fecha/desmonta (token/AbortController — resposta velha nunca sobrescreve a nova).
- **Tooltip só no hover** quando houver dezenas de polígonos — tooltip `permanent` é um nó DOM
  por polígono reposicionado a cada pan/zoom. Use `preferCanvas: true` no mapa.
- **Recarga do mapa só em mutação** (create/update/delete) **ou troca de filtro global**.
  Paginação/busca/ordenação da tabela não tocam no mapa.
- Seleção mapa↔grid: seleção única, `v-model`/estado compartilhado com a seleção de linha do
  grid, `fitToFeature(id)` no sentido grid→mapa. A mecânica genérica vive num componente
  reutilizável; a tela só liga as pontas.
- **Form de edição**: como a list não traz `geometria`, o edit precisa dos dados do **detail** —
  busque `GET /:pk/` antes de abrir o form; nunca monte o formData do contorno a partir da
  linha da tabela, e o PATCH não envia `geometria` que o usuário não tocou.

## 5. Histórico de desenhos

- Contorno muda com o tempo; a âncora de identidade é o **UUID da entidade** (nunca troca).
- Toda mudança de geometria registra versão numa tabela append-only, com vigência
  (`vigente_desde`/`vigente_ate`); o campo `geometria` da entidade é cache da versão aberta.
  Escrita só por um service (`registrar`, `registrar_lote`, consulta `vigente_em(entidade, quando)`).
- Relatórios históricos resolvem o desenho pela **vigência na data do evento**, nunca pelo cache.
- `bulk_update` pula signals e trilha de auditoria — o importador registra as versões
  explicitamente na mesma transação. Não escreva geometria fora dos services.

## 6. Checklist rápido de revisão

- [ ] Coordenadas 2D, 6 casas, `[lon, lat]`, WGS84 — validador aplicado.
- [ ] Entrada externa passou por reprojeção-quando-preciso e nunca assumiu datum.
- [ ] Nenhuma listagem serializa `geometria`; visualização em massa é paginada e enxuta.
- [ ] Mapa: progressivo, sem refit por página, hover tooltips, recarga só em mutação/filtro.
- [ ] Mudança de contorno gerou versão; área cadastral intocada.
