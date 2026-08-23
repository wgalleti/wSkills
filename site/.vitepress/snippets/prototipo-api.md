Pedidos que disparam a skill:

> "Preciso de uma API fake para esse protótipo, sem Docker."

> "Gera o backend de mentira a partir desse modelo de dados."

Resultado: um servidor Node de arquivo único gerado a partir de um `db.json` declarativo,
no mesmo contrato do portal (envelope `{links, total, data}`, paginação `take`/`skip`,
erros no formato DRF em pt-BR) — o frontend funciona sem adaptação e a conversão para
Django/DRF sai barata.
