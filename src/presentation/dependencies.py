"""
Presentation Layer - Dependency Injection
Gerenciamento de dependências e injeção
"""
from sqlalchemy.orm import Session

from src.domain.repositories import ICategoriaRepository, IProdutoRepository
from src.infrastructure.repositories import (
    SqlServerCategoriaRepository,
    SqlServerProdutoRepository
)
from src.infrastructure.database import db_config
from src.application.use_cases import (
    CreateCategoriaUseCase,
    GetCategoriaUseCase,
    ListCategoriasUseCase,
    UpdateCategoriaUseCase,
    DeleteCategoriaUseCase,
    CreateProdutoUseCase,
    GetProdutoUseCase,
    ListProdutosUseCase,
    ListProdutosByCategoriaUseCase,
    UpdateProdutoUseCase,
    DeleteProdutoUseCase,
    SearchProdutosByNomeUseCase
)


# Dependency para obter sessão do banco
def get_db_session():
    """Obtém sessão do banco de dados"""
    for session in db_config.get_session():
        yield session


# Factories para repositórios SQL Server
def get_categoria_repository(session: Session) -> ICategoriaRepository:
    """Factory para CategoriaRepository"""
    return SqlServerCategoriaRepository(session)


def get_produto_repository(session: Session) -> IProdutoRepository:
    """Factory para ProdutoRepository"""
    return SqlServerProdutoRepository(session)


# Use Case factories - Categoria
def get_create_categoria_use_case(session: Session) -> CreateCategoriaUseCase:
    """Factory para CreateCategoriaUseCase"""
    return CreateCategoriaUseCase(get_categoria_repository(session))


def get_get_categoria_use_case(session: Session) -> GetCategoriaUseCase:
    """Factory para GetCategoriaUseCase"""
    return GetCategoriaUseCase(get_categoria_repository(session))


def get_list_categorias_use_case(session: Session) -> ListCategoriasUseCase:
    """Factory para ListCategoriasUseCase"""
    return ListCategoriasUseCase(get_categoria_repository(session))


def get_update_categoria_use_case(session: Session) -> UpdateCategoriaUseCase:
    """Factory para UpdateCategoriaUseCase"""
    return UpdateCategoriaUseCase(get_categoria_repository(session))


def get_delete_categoria_use_case(session: Session) -> DeleteCategoriaUseCase:
    """Factory para DeleteCategoriaUseCase"""
    return DeleteCategoriaUseCase(
        get_categoria_repository(session),
        get_produto_repository(session)
    )


# Use Case factories - Produto
def get_create_produto_use_case(session: Session) -> CreateProdutoUseCase:
    """Factory para CreateProdutoUseCase"""
    return CreateProdutoUseCase(
        get_produto_repository(session),
        get_categoria_repository(session)
    )


def get_get_produto_use_case(session: Session) -> GetProdutoUseCase:
    """Factory para GetProdutoUseCase"""
    return GetProdutoUseCase(get_produto_repository(session))


def get_list_produtos_use_case(session: Session) -> ListProdutosUseCase:
    """Factory para ListProdutosUseCase"""
    return ListProdutosUseCase(get_produto_repository(session))


def get_list_produtos_by_categoria_use_case(session: Session) -> ListProdutosByCategoriaUseCase:
    """Factory para ListProdutosByCategoriaUseCase"""
    return ListProdutosByCategoriaUseCase(get_produto_repository(session))


def get_update_produto_use_case(session: Session) -> UpdateProdutoUseCase:
    """Factory para UpdateProdutoUseCase"""
    return UpdateProdutoUseCase(
        get_produto_repository(session),
        get_categoria_repository(session)
    )


def get_delete_produto_use_case(session: Session) -> DeleteProdutoUseCase:
    """Factory para DeleteProdutoUseCase"""
    return DeleteProdutoUseCase(get_produto_repository(session))


def get_search_produtos_by_nome_use_case(session: Session) -> SearchProdutosByNomeUseCase:
    """Factory para SearchProdutosByNomeUseCase"""
    return SearchProdutosByNomeUseCase(get_produto_repository(session))

