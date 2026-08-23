<!-- Copie este arquivo para .gitlab/merge_request_templates/Orca.md no seu repo.
     Padrão editorial completo: skill /mr (npx @wgalleti/wskills add mr).
     Escreva para quem NÃO é técnico: efeito na operação primeiro, jargão traduzido. -->

## Problema

<!-- O que motiva esta frente, em linguagem de operação/negócio.
     Comece pelo efeito em quem usa o sistema, não pela tecnologia. -->

## Análise

<!-- O que foi investigado e o que se descobriu: causa, contexto, restrições.
     Alternativa descartada? Diga qual e por quê. Preencha ao investigar. -->

## Solução

<!-- Checklist VIVO: uma operação por linha, verbo no infinitivo, efeito visível
     primeiro. Marque o feito, acrescente o que surgir; plano que mudou é
     riscado (~~assim~~) com o porquê — nunca apagado. -->

- [ ] _preencher ao iniciar a frente_

### Decisões tomadas

<!-- Cada decisão relevante em um bullet, sempre com o porquê em uma frase. -->

## Validação

<!-- Como conferimos que funciona, em termos verificáveis. -->

- [ ] Suite de testes da API verde
- [ ] Frontend limpo (lint + build)
- [ ] Testado no worktree (portas do slot, banco clonado)

---

_Worktree Orca `__WORKTREE__` · slot **SLOT** · api :**API_PORT** · web :**WEB_PORT** · banco `__DB__`_
