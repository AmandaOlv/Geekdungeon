"""
Application Layer - Use Cases para Produto (Sync)
"""
from datetime import datetime
from typing import List, Optional
from decimal import Decimal

from src.domain.entities import Produto
from src.domain.repositories import IProdutoRepository, ICategoriaRepository
from src.application.dtos import CreateProdutoDTO, UpdateProdutoDTO, ProdutoDTO, AjusteEstoqueDTO


def _normalize_nome(nome: str) -> str:
    normalized = (nome or "").strip()
    if not normalized:
        raise ValueError("Nome do produto é obrigatório")
    if len(normalized) > 200:
        raise ValueError("Nome do produto deve ter no máximo 200 caracteres")
    return normalized


class CreateProdutoUseCase:
    """Caso de uso para criar produto"""

    def __init__(
        self,
        produto_repository: IProdutoRepository,
        categoria_repository: ICategoriaRepository,
    ):
        self._produto_repository = produto_repository
        self._categoria_repository = categoria_repository

    def execute(self, dto: CreateProdutoDTO) -> ProdutoDTO:
        """Cria um novo produto"""
        categoria = self._categoria_repository.find_by_id(dto.categoria_id)
        if not categoria or not categoria.esta_ativa:
            raise ValueError(f"Categoria com ID {dto.categoria_id} não encontrada")

        descricao = dto.descricao.strip() if isinstance(dto.descricao, str) else dto.descricao
        produto = Produto(
            id=None,
            nome=_normalize_nome(dto.nome),
            descricao=descricao or None,
            preco_venda=Decimal(str(dto.preco_venda)),
            quantidade_estoque=dto.quantidade_estoque,
            categoria_id=dto.categoria_id,
            data_criacao=datetime.now(),
        )
        created = self._produto_repository.create(produto)
        return ProdutoDTO.from_entity(created, categoria.nome)


class GetProdutoUseCase:
    """Caso de uso para buscar produto"""

    def __init__(
        self,
        produto_repository: IProdutoRepository,
        categoria_repository: ICategoriaRepository,
    ):
        self._produto_repository = produto_repository
        self._categoria_repository = categoria_repository

    def execute(self, produto_id: int) -> Optional[ProdutoDTO]:
        """Busca produto ativo por ID"""
        produto = self._produto_repository.find_by_id(produto_id)
        if not produto or not produto.esta_ativo:
            return None
        categoria = self._categoria_repository.find_by_id(produto.categoria_id)
        return ProdutoDTO.from_entity(
            produto, categoria.nome if categoria else None
        )


class ListProdutosUseCase:
    """Caso de uso para listar produtos"""

    def __init__(
        self,
        produto_repository: IProdutoRepository,
        categoria_repository: ICategoriaRepository,
    ):
        self._produto_repository = produto_repository
        self._categoria_repository = categoria_repository

    def execute(self, include_deleted: bool = False) -> List[ProdutoDTO]:
        """Lista todos os produtos"""
        produtos = self._produto_repository.find_all(include_deleted)
        nomes = {
            cat.id: cat.nome
            for cat in self._categoria_repository.find_all(include_deleted=True)
        }
        return [
            ProdutoDTO.from_entity(prod, nomes.get(prod.categoria_id))
            for prod in produtos
        ]


class ListProdutosByCategoriaUseCase:
    """Caso de uso para listar produtos por categoria"""

    def __init__(
        self,
        produto_repository: IProdutoRepository,
        categoria_repository: ICategoriaRepository,
    ):
        self._produto_repository = produto_repository
        self._categoria_repository = categoria_repository

    def execute(self, categoria_id: int, include_deleted: bool = False) -> List[ProdutoDTO]:
        """Lista produtos de uma categoria"""
        categoria = self._categoria_repository.find_by_id(categoria_id)
        produtos = self._produto_repository.find_by_categoria(categoria_id, include_deleted)
        nome = categoria.nome if categoria else None
        return [ProdutoDTO.from_entity(prod, nome) for prod in produtos]


class UpdateProdutoUseCase:
    """Caso de uso para atualizar produto"""

    def __init__(
        self,
        produto_repository: IProdutoRepository,
        categoria_repository: ICategoriaRepository,
    ):
        self._produto_repository = produto_repository
        self._categoria_repository = categoria_repository

    def execute(self, produto_id: int, dto: UpdateProdutoDTO) -> ProdutoDTO:
        """Atualiza um produto"""
        produto = self._produto_repository.find_by_id(produto_id)
        if not produto or not produto.esta_ativo:
            raise ValueError(f"Produto com ID {produto_id} não encontrado")

        if dto.categoria_id is not None and dto.categoria_id != produto.categoria_id:
            categoria = self._categoria_repository.find_by_id(dto.categoria_id)
            if not categoria or not categoria.esta_ativa:
                raise ValueError("Categoria inválida ou inativa")
            produto.categoria_id = dto.categoria_id

        if dto.nome is not None:
            produto.nome = _normalize_nome(dto.nome)

        if dto.descricao is not None:
            produto.descricao = dto.descricao.strip() or None

        if dto.preco_venda is not None:
            produto.atualizar_preco(Decimal(str(dto.preco_venda)))

        if dto.quantidade_estoque is not None:
            if dto.quantidade_estoque < 0:
                raise ValueError("Quantidade em estoque não pode ser negativa")
            produto.quantidade_estoque = dto.quantidade_estoque

        produto.data_atualizacao = datetime.now()
        updated = self._produto_repository.update(produto)
        categoria = self._categoria_repository.find_by_id(updated.categoria_id)
        return ProdutoDTO.from_entity(updated, categoria.nome if categoria else None)


class DeleteProdutoUseCase:
    """Caso de uso para deletar produto"""

    def __init__(self, produto_repository: IProdutoRepository):
        self._produto_repository = produto_repository

    def execute(self, produto_id: int) -> bool:
        """Deleta um produto (soft delete)"""
        produto = self._produto_repository.find_by_id(produto_id)
        if not produto or not produto.esta_ativo:
            raise ValueError(f"Produto com ID {produto_id} não encontrado")

        success = self._produto_repository.delete(produto_id)
        if not success:
            raise ValueError(f"Produto com ID {produto_id} não encontrado")
        return success


class SearchProdutosByNomeUseCase:
    """Caso de uso para buscar produtos por nome"""

    def __init__(
        self,
        produto_repository: IProdutoRepository,
        categoria_repository: ICategoriaRepository,
    ):
        self._produto_repository = produto_repository
        self._categoria_repository = categoria_repository

    def execute(self, nome: str) -> List[ProdutoDTO]:
        """Busca produtos por nome (busca parcial)"""
        termo = (nome or "").strip()
        if not termo:
            return []
        produtos = self._produto_repository.find_by_nome(termo)
        nomes = {
            cat.id: cat.nome
            for cat in self._categoria_repository.find_all(include_deleted=True)
        }
        return [
            ProdutoDTO.from_entity(prod, nomes.get(prod.categoria_id))
            for prod in produtos
        ]


class AjustarEstoqueUseCase:
    """Caso de uso para entrada/saída rápida de estoque"""

    def __init__(
        self,
        produto_repository: IProdutoRepository,
        categoria_repository: ICategoriaRepository,
    ):
        self._produto_repository = produto_repository
        self._categoria_repository = categoria_repository

    def execute(self, produto_id: int, dto: AjusteEstoqueDTO) -> ProdutoDTO:
        produto = self._produto_repository.find_by_id(produto_id)
        if not produto or not produto.esta_ativo:
            raise ValueError(f"Produto com ID {produto_id} não encontrado")

        if dto.delta > 0:
            produto.adicionar_estoque(dto.delta)
        elif dto.delta < 0:
            produto.remover_estoque(-dto.delta)
        else:
            raise ValueError("Informe uma quantidade diferente de zero")

        updated = self._produto_repository.update(produto)
        categoria = self._categoria_repository.find_by_id(updated.categoria_id)
        return ProdutoDTO.from_entity(updated, categoria.nome if categoria else None)
