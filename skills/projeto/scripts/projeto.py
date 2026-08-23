#!/usr/bin/env python
"""CLI do worktree para o projeto do portal — a boca única da skill `/projeto`.

Fala com o banco **deste worktree** (o `api/.env` daqui aponta para o
`ORCA_DB` do slot; o do checkout principal aponta para o banco principal). Por isso a
skill nunca deve improvisar ORM solto: rodar o mesmo `manage.py shell` a partir
da pasta errada escreve no banco do vizinho.

Alvo é **sempre o ambiente local**. Produção só recebe pela tela de
sincronização do portal (comparação, simulação e confirmação humana).

Uso:
    python .claude/skills/projeto/scripts/projeto.py <comando> [args]

    resolver [termo]              acha o projeto (uuid → nome/rota → branch)
    criar <nome> [--descricao …] [--workspace …]
                                  cria o projeto (recusa nome parecido com um
                                  existente) e já amarra o worktree nele
    amarrar <uuid|nome>           grava a amarração do worktree
    soltar                        apaga a amarração
    mostrar                       ficha + tarefas + resumo do documento
    documento-ler [arquivo]       imprime (ou grava em arquivo) o markdown
    documento-escrever <arquivo>  substitui o markdown pelo conteúdo do arquivo
    tarefa-add <título>           acrescenta tarefa no fim da lista
    tarefa-concluir <id|título>   alterna concluída/aberta
    status <status>               move o card de coluna

Toda saída é JSON numa linha — é feita para ser lida por um agente.
Sai com 2 quando a resolução é ambígua ou vazia (o agente pergunta, não chuta).
"""

import argparse
import json
import os
import re
import subprocess
import sys
import unicodedata
import uuid
from pathlib import Path

#: Nome do arquivo de amarração — mora ao lado do `.orca-ports`, na raiz do
#: worktree, e é ignorado pelo git (é estado local, não conteúdo do repositório).
ARQUIVO_AMARRACAO = ".orca-projeto"


# --------------------------------------------------------------- bootstrap


def raiz_do_repositorio() -> Path:
    """A raiz deste worktree — a pasta que tem `api/manage.py`."""
    atual = Path(__file__).resolve()
    for pasta in atual.parents:
        if (pasta / "api" / "manage.py").exists():
            return pasta
    sair_com_erro("não encontrei `api/manage.py` — rode de dentro do repositório.")


def preparar_django(raiz: Path) -> None:
    """Sobe o Django com o settings e o `.env` DESTE worktree."""
    api = raiz / "api"
    sys.path.insert(0, str(api))
    os.chdir(api)  # o python-decouple lê o `.env` do diretório corrente
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

    import django

    django.setup()


def sair(dados: dict, codigo: int = 0):
    print(json.dumps(dados, ensure_ascii=False, default=str))
    raise SystemExit(codigo)


def sair_com_erro(mensagem: str):
    sair({"ok": False, "erro": mensagem}, codigo=1)


# ------------------------------------------------------------- resolução


def normalizar(texto: str) -> str:
    """`Sincronização de projetos` e `sincronizacao-projetos` viram a mesma coisa."""
    sem_acento = unicodedata.normalize("NFKD", texto or "")
    sem_acento = "".join(c for c in sem_acento if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "-", sem_acento.lower()).strip("-")


def pista_do_worktree(raiz: Path) -> str:
    """Nome da branch (ou da pasta) — a última pista da resolução híbrida."""
    try:
        branch = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            cwd=raiz,
            capture_output=True,
            text=True,
            check=True,
        ).stdout.strip()
    except (OSError, subprocess.CalledProcessError):
        branch = ""
    # `feature/etapa-2` → `etapa-2`: o prefixo de fluxo não diz nada do projeto.
    if branch and branch not in {"HEAD", "main", "develop"}:
        return branch.split("/")[-1]
    return raiz.name


def eh_uuid(termo: str) -> bool:
    try:
        uuid.UUID(str(termo))
    except (ValueError, AttributeError, TypeError):
        return False
    return True


def candidatos(termo: str):
    """Projetos que casam com o termo, do mais forte ao mais fraco.

    A ordem é a da decisão acordada: **UUID** (exato, sem ambiguidade) →
    **nome/rota** → **pista do worktree**. Nunca cria nada: o pior erro possível
    aqui é inventar um projeto porque a busca não achou o certo.
    """
    from apps.projetos.models import Projeto

    if eh_uuid(termo):
        achado = Projeto.objects.filter(pk=termo).first()
        return ([achado], "uuid") if achado else ([], "uuid")

    exatos = list(Projeto.objects.filter(nome__iexact=termo))
    if exatos:
        return exatos, "nome exato"

    alvo = normalizar(termo)
    if not alvo:
        return [], "termo vazio"

    por_slug, por_pedaco = [], []
    for projeto in Projeto.objects.all():
        chaves = {normalizar(projeto.nome), normalizar(projeto.rota_documento)}
        chaves.discard("")
        if alvo in chaves:
            por_slug.append(projeto)
        elif any(alvo in chave or chave in alvo for chave in chaves):
            por_pedaco.append(projeto)

    if por_slug:
        return por_slug, "rota/slug"
    return por_pedaco, "aproximação"


def caminho_amarracao(raiz: Path) -> Path:
    return raiz / ARQUIVO_AMARRACAO


def ler_amarracao(raiz: Path) -> str | None:
    arquivo = caminho_amarracao(raiz)
    if not arquivo.exists():
        return None
    for linha in arquivo.read_text(encoding="utf-8").splitlines():
        linha = linha.strip()
        if linha and not linha.startswith("#"):
            return linha.split("=")[-1].strip()
    return None


def resolver(raiz: Path, termo: str | None):
    """O projeto deste worktree — ou o motivo de não dar para decidir sozinho."""
    if termo:
        achados, via = candidatos(termo)
    else:
        amarrado = ler_amarracao(raiz)
        if amarrado:
            achados, via = candidatos(amarrado)
            via = f"amarração ({via})"
        else:
            pista = pista_do_worktree(raiz)
            achados, via = candidatos(pista)
            via = f"branch/worktree “{pista}” ({via})"

    return achados, via


def ficha(projeto, completo: bool = False) -> dict:
    dados = {
        "id": str(projeto.pk),
        "nome": projeto.nome,
        "status": projeto.status,
        "workspace": projeto.workspace.nome,
        "rota_documento": projeto.rota_documento,
        "descricao": projeto.descricao,
        "documento_linhas": len((projeto.conteudo or "").splitlines()),
        "documento_tamanho": len(projeto.conteudo or ""),
        "url": f"/projetos/{projeto.pk}",
    }
    if completo:
        dados["tarefas"] = [
            {
                "id": str(tarefa.pk),
                "titulo": tarefa.titulo,
                "concluida": tarefa.concluida,
                "ordem": tarefa.ordem,
            }
            for tarefa in projeto.tarefas.order_by("ordem", "criado_em")
        ]
    return dados


def um_projeto(raiz: Path, termo: str | None):
    """Resolve para EXATAMENTE um projeto, ou encerra pedindo desempate."""
    achados, via = resolver(raiz, termo)
    if len(achados) == 1:
        return achados[0], via
    sair(
        {
            "ok": False,
            "via": via,
            "motivo": "ambiguo" if achados else "nao_encontrado",
            "candidatos": [ficha(projeto) for projeto in achados],
            "dica": (
                "Rode `projeto.py amarrar <uuid>` com o projeto certo — a amarração "
                "fica no worktree e vale para as próximas vezes."
            ),
        },
        codigo=2,
    )


# --------------------------------------------------------------- comandos


def cmd_resolver(raiz, args):
    projeto, via = um_projeto(raiz, args.termo)
    sair({"ok": True, "via": via, "projeto": ficha(projeto)})


def gravar_amarracao(raiz: Path, projeto) -> None:
    caminho_amarracao(raiz).write_text(
        "# amarração do worktree com o projeto do portal (gerado por /projeto)\n"
        "# arquivo local, ignorado pelo git — ao lado do .orca-ports\n"
        f"PROJETO={projeto.pk}\n",
        encoding="utf-8",
    )


def cmd_amarrar(raiz, args):
    projeto, via = um_projeto(raiz, args.termo)
    gravar_amarracao(raiz, projeto)
    sair({"ok": True, "via": via, "amarrado": True, "projeto": ficha(projeto)})


def cmd_criar(raiz, args):
    """Cria o card no kanban local e amarra o worktree nele.

    Criação é sempre um pedido EXPLÍCITO do usuário — a resolução que não achou
    projeto continua terminando em pergunta, nunca aqui. Nome parecido com um
    card existente encerra com código 2 e os candidatos: duplicar card é o pior
    erro possível do kanban.
    """
    from django.contrib.auth import get_user_model
    from apps.projetos.models import Projeto, StatusProjeto, Workspace
    from apps.projetos.services import ProjetoService

    nome = (args.valor or "").strip()
    if not nome:
        sair_com_erro("nome do projeto vazio.")

    parecidos, via = candidatos(nome)
    if parecidos:
        sair(
            {
                "ok": False,
                "motivo": "ja_existe",
                "via": via,
                "candidatos": [ficha(projeto) for projeto in parecidos],
                "dica": (
                    "Projeto parecido já existe — amarre nele (`amarrar <uuid>`) "
                    "ou confirme com o usuário um nome diferente."
                ),
            },
            codigo=2,
        )

    if args.workspace:
        workspace = Workspace.objects.filter(nome__iexact=args.workspace).first()
        if workspace is None:
            sair_com_erro(f"workspace “{args.workspace}” não existe.")
    else:
        workspace = Workspace.objects.filter(eh_global=True).first()
        if workspace is None:
            sair_com_erro("nenhum workspace global — informe --workspace.")

    # A skill roda no worktree, sem sessão: assina o superusuário mais antigo
    # (o mesmo que a migration do workspace geral garante existir).
    autor = (
        get_user_model().objects.filter(is_superuser=True).order_by("date_joined").first()
    )
    if autor is None:
        sair_com_erro("nenhum superusuário no banco para assinar a criação.")

    projeto = Projeto.objects.create(
        workspace=workspace,
        nome=nome,
        descricao=(args.descricao or "").strip(),
        criado_por=autor,
    )
    # Pelo service: o card entra no fim da coluna com os irmãos renumerados.
    ProjetoService.mover_projeto(projeto, StatusProjeto.PLANEJADO)
    gravar_amarracao(raiz, projeto)
    sair({"ok": True, "criado": True, "amarrado": True, "projeto": ficha(projeto)})


def cmd_soltar(raiz, _args):
    arquivo = caminho_amarracao(raiz)
    existia = arquivo.exists()
    arquivo.unlink(missing_ok=True)
    sair({"ok": True, "amarrado": False, "existia": existia})


def cmd_mostrar(raiz, args):
    projeto, via = um_projeto(raiz, args.termo)
    sair({"ok": True, "via": via, "projeto": ficha(projeto, completo=True)})


def cmd_documento_ler(raiz, args):
    projeto, _ = um_projeto(raiz, args.termo)
    if args.arquivo:
        Path(args.arquivo).write_text(projeto.conteudo or "", encoding="utf-8")
        sair({"ok": True, "projeto": ficha(projeto), "arquivo": args.arquivo})
    sair({"ok": True, "projeto": ficha(projeto), "conteudo": projeto.conteudo or ""})


def cmd_documento_escrever(raiz, args):
    projeto, _ = um_projeto(raiz, args.termo)
    novo = Path(args.arquivo).read_text(encoding="utf-8")
    if novo == (projeto.conteudo or ""):
        sair({"ok": True, "alterado": False, "projeto": ficha(projeto)})
    projeto.conteudo = novo
    # `save(update_fields=…)`, nunca `queryset.update()`: mantém os signals e a
    # trilha de auditoria (easy-audit ou equivalente).
    projeto.save(update_fields=["conteudo", "atualizado_em"])
    sair({"ok": True, "alterado": True, "projeto": ficha(projeto)})


def cmd_tarefa_add(raiz, args):
    from apps.projetos.services import TarefaService

    projeto, _ = um_projeto(raiz, args.termo)
    titulo = args.titulo.strip()
    if not titulo:
        sair_com_erro("título da tarefa vazio.")
    if projeto.tarefas.filter(titulo__iexact=titulo).exists():
        sair_com_erro(f"já existe uma tarefa “{titulo}” neste projeto.")

    tarefa = projeto.tarefas.create(
        titulo=titulo,
        ordem=TarefaService.proxima_ordem(projeto),
        # Autoria segue a do projeto — a skill roda no worktree, sem sessão de
        # usuário, e inventar um autor qualquer sujaria a trilha.
        criado_por=projeto.criado_por,
    )
    sair({"ok": True, "tarefa": {"id": str(tarefa.pk), "titulo": tarefa.titulo}})


def cmd_tarefa_concluir(raiz, args):
    from apps.projetos.services import TarefaService

    projeto, _ = um_projeto(raiz, args.termo)
    tarefas = projeto.tarefas.all()
    alvo = (
        tarefas.filter(pk=args.tarefa).first()
        if eh_uuid(args.tarefa)
        else tarefas.filter(titulo__icontains=args.tarefa).first()
    )
    if alvo is None:
        sair_com_erro(f"nenhuma tarefa casa com “{args.tarefa}” neste projeto.")

    TarefaService.concluir_tarefa(alvo)
    sair({"ok": True, "tarefa": {"id": str(alvo.pk), "titulo": alvo.titulo, "concluida": alvo.concluida}})


def cmd_status(raiz, args):
    from apps.projetos.models import StatusProjeto
    from apps.projetos.services import ProjetoService

    projeto, _ = um_projeto(raiz, args.termo)
    validos = [status.value for status in StatusProjeto]
    if args.status not in validos:
        sair_com_erro(f"status inválido: {args.status}. Use um de: {', '.join(validos)}.")

    ProjetoService.mover_projeto(projeto, args.status)
    sair({"ok": True, "projeto": ficha(projeto)})


COMANDOS = {
    "resolver": cmd_resolver,
    "criar": cmd_criar,
    "amarrar": cmd_amarrar,
    "soltar": cmd_soltar,
    "mostrar": cmd_mostrar,
    "documento-ler": cmd_documento_ler,
    "documento-escrever": cmd_documento_escrever,
    "tarefa-add": cmd_tarefa_add,
    "tarefa-concluir": cmd_tarefa_concluir,
    "status": cmd_status,
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("comando", choices=sorted(COMANDOS))
    parser.add_argument("valor", nargs="?", default=None)
    parser.add_argument(
        "--projeto",
        dest="termo",
        default=None,
        help="Força o projeto (uuid ou nome), ignorando a amarração do worktree.",
    )
    parser.add_argument(
        "--descricao",
        default="",
        help="criar: descrição curta do card (aparece no kanban).",
    )
    parser.add_argument(
        "--workspace",
        default=None,
        help="criar: nome do workspace; sem informar, usa o global.",
    )
    args = parser.parse_args()

    # `amarrar` recebe o alvo no posicional; os demais o recebem por `--projeto`.
    if args.comando == "amarrar":
        args.termo = args.valor or args.termo
    args.arquivo = args.valor
    args.titulo = args.valor or ""
    args.tarefa = args.valor
    args.status = args.valor

    raiz = raiz_do_repositorio()
    preparar_django(raiz)
    COMANDOS[args.comando](raiz, args)


if __name__ == "__main__":
    main()
