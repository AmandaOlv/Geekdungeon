"""
Application Layer - Use Cases para Categoria (Sync)
"""
from datetime import datetime
from typing import List, Optional

from src.domain.entities import Categoria
from src.domain.repositories import ICategoriaRepository, IProdutoRepository
from src.application.dtos import CreateCategoriaDTO, UpdateCategoriaDTO, CategoriaDTO


def _normalize_nome(nome: str) -> str:
    normalized = (nome or "").strip()
    if not normalized:
        raise ValueError("Nome da categoria é obrigatório")
    if len(normalized) > 100:
        raise ValueError("Nome da categoria deve ter no máximo 100 caracteres")
    return normalized


class CreateCategoriaUseCase:
    """Caso de uso para criar categoria"""

    def __init__(self, categoria_repository: ICategoriaRepository):
        self._categoria_repository = categoria_repository

    def execute(self, dto: CreateCategoriaDTO) -> CategoriaDTO:
        """Cria uma nova categoria"""
        nome = _normalize_nome(dto.nome)
        existing = self._categoria_repository.find_by_nome(nome)
        if existing:
            raise ValueError(f"Categoria com nome '{nome}' já existe")

        categoria = Categoria(
            id=None,
            nome=nome,
            data_criacao=datetime.now(),
        )
        created = self._categoria_repository.create(categoria)
        return CategoriaDTO.from_entity(created)


class GetCategoriaUseCase:
    """Caso de uso para buscar categoria"""

    def __init__(self, categoria_repository: ICategoriaRepository):
        self._categoria_repository = categoria_repository

    def execute(self, categoria_id: int) -> Optional[CategoriaDTO]:
        """Busca categoria ativa por ID"""
        categoria = self._categoria_repository.find_by_id(categoria_id)
        if not categoria or not categoria.esta_ativa:
            return None
        return CategoriaDTO.from_entity(categoria)


class ListCategoriasUseCase:
    """Caso de uso para listar categorias"""

    def __init__(self, categoria_repository: ICategoriaRepository):
        self._categoria_repository = categoria_repository

    def execute(self, include_deleted: bool = False) -> List[CategoriaDTO]:
        """Lista todas as categorias"""
        categorias = self._categoria_repository.find_all(include_deleted)
        return [CategoriaDTO.from_entity(cat) for cat in categorias]


class UpdateCategoriaUseCase:
    """Caso de uso para atualizar categoria"""

    def __init__(self, categoria_repository: ICategoriaRepository):
        self._categoria_repository = categoria_repository

    def execute(self, categoria_id: int, dto: UpdateCategoriaDTO) -> CategoriaDTO:
        """Atualiza uma categoria"""
        categoria = self._categoria_repository.find_by_id(categoria_id)
        if not categoria or not categoria.esta_ativa:
            raise ValueError(f"Categoria com ID {categoria_id} não encontrada")

        nome = _normalize_nome(dto.nome)
        existing = self._categoria_repository.find_by_nome(nome)
        if existing and existing.id != categoria_id:
            raise ValueError(f"Categoria com nome '{nome}' já existe")

        categoria.nome = nome
        categoria.atualizar()
        updated = self._categoria_repository.update(categoria)
        return CategoriaDTO.from_entity(updated)


class DeleteCategoriaUseCase:
    """Caso de uso para deletar categoria"""

    def __init__(
        self,
        categoria_repository: ICategoriaRepository,
        produto_repository: IProdutoRepository,
    ):
        self._categoria_repository = categoria_repository
        self._produto_repository = produto_repository

    def execute(self, categoria_id: int) -> bool:
        """Deleta uma categoria (soft delete)"""
        categoria = self._categoria_repository.find_by_id(categoria_id)
        if not categoria or not categoria.esta_ativa:
            raise ValueError(f"Categoria com ID {categoria_id} não encontrada")

        produtos_ativos = self._produto_repository.find_by_categoria(
            categoria_id, include_deleted=False
        )
        if produtos_ativos:
            raise ValueError(
                f"Não é possível deletar a categoria. "
                f"Existem {len(produtos_ativos)} produto(s) ativo(s) vinculado(s) a ela. "
                f"Delete ou mova os produtos antes de deletar a categoria."
            )

        success = self._categoria_repository.delete(categoria_id)
        if not success:
            raise ValueError(f"Erro ao deletar categoria com ID {categoria_id}")
        return success
