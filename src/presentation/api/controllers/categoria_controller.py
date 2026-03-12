"""
Presentation Layer - Categoria Controller
"""
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from sqlalchemy.orm import Session

from src.application.use_cases import (
    CreateCategoriaUseCase,
    GetCategoriaUseCase,
    ListCategoriasUseCase,
    UpdateCategoriaUseCase,
    DeleteCategoriaUseCase
)
from src.application.dtos import CreateCategoriaDTO, UpdateCategoriaDTO, CategoriaDTO
from src.presentation.dependencies import (
    get_db_session,
    get_create_categoria_use_case,
    get_get_categoria_use_case,
    get_list_categorias_use_case,
    get_update_categoria_use_case,
    get_delete_categoria_use_case
)


router = APIRouter(prefix="/categorias", tags=["categorias"])


@router.post(
    "",
    response_model=CategoriaDTO,
    status_code=status.HTTP_201_CREATED,
    summary="Criar nova categoria"
)
def create_categoria(
    dto: CreateCategoriaDTO,
    session: Session = Depends(get_db_session)
) -> CategoriaDTO:
    """Cria uma nova categoria"""
    try:
        use_case = get_create_categoria_use_case(session)
        return use_case.execute(dto)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get(
    "/{categoria_id}",
    response_model=CategoriaDTO,
    summary="Buscar categoria por ID"
)
def get_categoria(
    categoria_id: int,
    session: Session = Depends(get_db_session)
) -> CategoriaDTO:
    """Busca uma categoria por ID"""
    use_case = get_get_categoria_use_case(session)
    categoria = use_case.execute(categoria_id)
    
    if not categoria:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Categoria com ID {categoria_id} não encontrada"
        )
    
    return categoria


@router.get(
    "",
    response_model=List[CategoriaDTO],
    summary="Listar todas as categorias"
)
def list_categorias(
    include_deleted: bool = False,
    session: Session = Depends(get_db_session)
) -> List[CategoriaDTO]:
    """Lista todas as categorias"""
    use_case = get_list_categorias_use_case(session)
    return use_case.execute(include_deleted)


@router.put(
    "/{categoria_id}",
    response_model=CategoriaDTO,
    summary="Atualizar categoria"
)
def update_categoria(
    categoria_id: int,
    dto: UpdateCategoriaDTO,
    session: Session = Depends(get_db_session)
) -> CategoriaDTO:
    """Atualiza uma categoria"""
    try:
        use_case = get_update_categoria_use_case(session)
        return use_case.execute(categoria_id, dto)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND if "não encontrada" in str(e) else status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete(
    "/{categoria_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Deletar categoria"
)
def delete_categoria(
    categoria_id: int,
    session: Session = Depends(get_db_session)
):
    """Deleta uma categoria (soft delete)"""
    try:
        use_case = get_delete_categoria_use_case(session)
        use_case.execute(categoria_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
