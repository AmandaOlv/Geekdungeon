"""
Presentation Layer - Produto Controller
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from sqlalchemy.orm import Session

from src.application.use_cases import (
    CreateProdutoUseCase,
    GetProdutoUseCase,
    ListProdutosUseCase,
    ListProdutosByCategoriaUseCase,
    UpdateProdutoUseCase,
    DeleteProdutoUseCase,
    SearchProdutosByNomeUseCase
)
from src.application.dtos import CreateProdutoDTO, UpdateProdutoDTO, ProdutoDTO
from src.presentation.dependencies import (
    get_db_session,
    get_create_produto_use_case,
    get_get_produto_use_case,
    get_list_produtos_use_case,
    get_list_produtos_by_categoria_use_case,
    get_update_produto_use_case,
    get_delete_produto_use_case,
    get_search_produtos_by_nome_use_case
)


router = APIRouter(prefix="/produtos", tags=["produtos"])


@router.post(
    "",
    response_model=ProdutoDTO,
    status_code=status.HTTP_201_CREATED,
    summary="Criar novo produto"
)
def create_produto(
    dto: CreateProdutoDTO,
    session: Session = Depends(get_db_session)
) -> ProdutoDTO:
    """Cria um novo produto"""
    try:
        use_case = get_create_produto_use_case(session)
        return use_case.execute(dto)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get(
    "/{produto_id}",
    response_model=ProdutoDTO,
    summary="Buscar produto por ID"
)
def get_produto(
    produto_id: int,
    session: Session = Depends(get_db_session)
) -> ProdutoDTO:
    """Busca um produto por ID"""
    use_case = get_get_produto_use_case(session)
    produto = use_case.execute(produto_id)
    
    if not produto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Produto com ID {produto_id} não encontrado"
        )
    
    return produto


@router.get(
    "",
    response_model=List[ProdutoDTO],
    summary="Listar produtos"
)
def list_produtos(
    categoria_id: Optional[int] = Query(None, description="Filtrar por categoria"),
    nome: Optional[str] = Query(None, description="Buscar por nome"),
    include_deleted: bool = False,
    session: Session = Depends(get_db_session)
) -> List[ProdutoDTO]:
    """Lista produtos com filtros opcionais"""
    # Busca por nome tem prioridade
    if nome:
        use_case = get_search_produtos_by_nome_use_case(session)
        return use_case.execute(nome)
    
    # Filtro por categoria
    if categoria_id:
        use_case = get_list_produtos_by_categoria_use_case(session)
        return use_case.execute(categoria_id, include_deleted)
    
    # Lista todos
    use_case = get_list_produtos_use_case(session)
    return use_case.execute(include_deleted)


@router.put(
    "/{produto_id}",
    response_model=ProdutoDTO,
    summary="Atualizar produto"
)
def update_produto(
    produto_id: int,
    dto: UpdateProdutoDTO,
    session: Session = Depends(get_db_session)
) -> ProdutoDTO:
    """Atualiza um produto"""
    try:
        use_case = get_update_produto_use_case(session)
        return use_case.execute(produto_id, dto)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND if "não encontrado" in str(e) else status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete(
    "/{produto_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Deletar produto"
)
def delete_produto(
    produto_id: int,
    session: Session = Depends(get_db_session)
):
    """Deleta um produto (soft delete)"""
    try:
        use_case = get_delete_produto_use_case(session)
        use_case.execute(produto_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
