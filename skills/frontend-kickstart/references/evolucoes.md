# Evoluções — o que dá para trazer depois

O bootstrap (`setup.md`) entrega o mínimo que já é padrão: camada de dados, tema, shell,
CRUD por configuração. As peças abaixo **já existem no portal que originou este kit** e podem ser
trazidas para um projeto novo quando a necessidade aparecer. Ordenadas por relação
custo/benefício. Não implemente por antecipação — cada uma resolve um problema concreto.

## Vale a pena cedo

| Peça                                                                      | Resolve                                                                     | Custo                      |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------------------------- |
| **`useResource`** — cache reativo global por endpoint                     | a mesma lista de apoio (produtos, unidades) sendo buscada em cinco telas    | baixo                      |
| **Command palette** (`Ctrl+K`)                                            | navegação em app com mais de ~15 telas; substitui busca na sidebar          | baixo                      |
| **Favoritos na sidebar** (estrela por item, `localStorage`)               | usuário que vive em 3 telas de 40                                           | baixo                      |
| **Preferências do usuário** (tema, densidade, tamanho e família de fonte) | acessibilidade real e operador que passa 8h na tela                         | baixo                      |
| **Bloco `extras` na listagem**                                            | resumo do **filtro inteiro** sem um segundo request e sem divergir da lista | médio (precisa do backend) |
| **Breadcrumb com folha dinâmica**                                         | tela de detalhe que precisa dizer _qual_ registro está aberto               | baixo                      |

## Quando o produto pedir

- **Contexto operacional global (baliza)** — unidade/safra/empresa na topbar preenchendo o
  controle visível das telas. Só faz sentido quando o eixo é realmente transversal.
  Releia a regra em `arquitetura.md` §3.8 antes: contexto que entra escondido na request
  vira "sumiu meu registro".
- **PDF por serviço de renderização** (ex.: Gotenberg em container) — o gerador abre uma
  **rota de impressão do próprio front** e converte. Vantagem: o relatório é uma tela Vue,
  versionada com o app, sem template duplicado no backend. Exige rota pública autenticada
  por token na query, um gateway e o `print-color-adjust` do `design.md` §8.
- **Kanban + documento markdown por projeto** — quando o time precisa de acompanhamento
  dentro do próprio sistema em vez de uma ferramenta externa.
- **Pivot / tabela dinâmica** — análise ad-hoc que o usuário monta sozinho, quando as
  listagens fixas não dão conta.
- **Etiquetas e impressão térmica** — operação de campo com código/QR por lote.
- **Timeline de rastreio** — histórico auditável de um registro que passa por várias etapas.
- **Camada de integração com sistema externo (ERP)** — nasce como app/módulo dedicado com um
  **adaptador por sistema**, nunca espalhada pelo domínio. O domínio não conhece o ERP.

## Higiene do repositório (barato e evita dor)

- **Versionamento único** entre back e front (`YYYY.MM.PATCH.BUILD`) por um script na raiz.
- **Grafo de conhecimento do código** (ex.: `graphify`) na raiz do monorepo — respostas sobre
  arquitetura sem varredura bruta. Versione só o grafo atual; backups datados ficam fora do git.
- **Auditoria de desvios** num `docs/AUDIT.md` priorizado: é trabalho pendente listado, e some
  quando zera. Melhor que regra morta em documentação.
- **Skills do projeto** em `.claude/skills/`: uma para as regras do front, uma para a API da
  suite, uma para o padrão de MR/commit. Regra que o agente precisa seguir mora em skill +
  `CLAUDE.md`, não na cabeça de quem escreveu.
- **Worktrees paralelos** (porta, env e banco por worktree) quando mais de uma frente roda ao
  mesmo tempo na mesma máquina.

## O que este stack deliberadamente NÃO tem

Saber o que ficou de fora evita discussão repetida:

- **TypeScript no app.** O app é JS; a **suite** é que publica os tipos (`.d.ts`), e é neles
  que se confere a API dos componentes. Projeto novo pode adotar TS — mas então adote inteiro,
  não pela metade.
- **Testes de componente no front.** Hoje a validação é `lint:check` + `build` + revisão. Se o
  projeto novo tem regra de negócio no front, coloque Vitest desde o dia 1 — depois é caro.
- **SSR / Nuxt.** É app interno atrás de login; SPA basta.
- **Biblioteca de UI genérica de terceiros** (shadcn e afins) — colide com o design system e
  com a suite. Foi removida do portal justamente por isso.
- **Store global de dados de tela.** Pinia só transversal.
