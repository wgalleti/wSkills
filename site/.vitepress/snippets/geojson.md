Pedidos que disparam a skill:

> "Importa esse shapefile/KML com os contornos dos talhões."

> "A tela do mapa está lenta com 200 polígonos."

> "Cria o endpoint que devolve as geometrias para o mapa."

```text
você:  o arquivo veio com coordenadas tipo 285432.1, 6712890.4 — o que houve?
claude: (carrega geojson) → coordenada fora da faixa WGS84 ⇒ é UTM sem aviso;
        reprojeta com pyproj (EPSG explícito → crs do arquivo → bounding box)…
```

Os padrões cobrem o ciclo inteiro: formato canônico no banco, importação idempotente,
API sem geometria em listagem e render progressivo no frontend.
