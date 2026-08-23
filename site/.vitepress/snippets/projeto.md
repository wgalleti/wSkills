Pedidos que disparam a skill:

> "Qual é o projeto deste worktree?"

> "Amarra esse worktree no projeto de sincronização."

> "Marca a tarefa de importação como concluída e move o card para em validação."

```bash
# a boca única — sempre pelo script, nunca ORM solto:
cd api && uv run python ../.claude/skills/projeto/scripts/projeto.py resolver
# → {"ok": true, "via": "amarração (uuid)", "projeto": {...}}
```

Saída JSON numa linha; código de saída `2` significa "não decidi sozinho — pergunte".
