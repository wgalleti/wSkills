Pedidos que disparam a skill:

> "Abre o MR dessa frente."

> "Atualiza a descrição do MR com o que fizemos hoje."

> "Prepara os commits dessa frente."

> "Abre um hotfix para produção."

O MR sai no fluxo **Problema → Análise → Solução (checklist vivo) → Validação**, escrito
para gestão não técnica — efeito na operação primeiro, jargão traduzido. Os commits saem
convencionais (`feat:`, `fix:`) em inglês. Para correção urgente, a skill cobre o padrão
de hotfix: branch `hotfix/*` com MR direto na branch de produção, sem squash.
