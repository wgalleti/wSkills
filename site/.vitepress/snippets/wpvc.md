Pedidos que disparam a skill:

> "Monta o CRUD de produtos com WCrudView."

> "Como uso o useCrudManager com filtro por período?"

> "Migra esse form solto para FieldDef + WFormRenderer."

```js
// o tipo de resposta que a skill orienta:
const columns = [
  { field: 'nome', header: 'Nome', sortable: true },
  { field: 'preco', header: 'Preço', type: 'currency' },
]
const fields = [
  { name: 'nome', label: 'Nome', type: 'text', required: true },
  { name: 'grupo', label: 'Grupo', type: 'fk', endpoint: 'grupos' },
]
```
