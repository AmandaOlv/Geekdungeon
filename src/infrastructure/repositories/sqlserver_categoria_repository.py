"""
Infrastructure Layer - SQL Server Categoria Repository
Implementação do repositório usando SQL Server
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime

from src.domain.entities import Categoria
from src.domain.repositories import ICategoriaRepository
from src.infrastructure.database import CategoriaModel


class SqlServerCategoriaRepository(ICategoriaRepository):
    """Implementação SQL Server do repositório de categorias"""
    
    def __init__(self, session: Session):
        self._session = session
    
    def _to_entity(self, model: CategoriaModel) -> Categoria:
        """Converte model para entidade"""
        return Categoria(
            id=model.Id,
            nome=model.Nome,
            data_criacao=model.DataCriacao,
            data_atualizacao=model.DataAtualizacao,
            data_exclusao=model.DataExclusao
        )
    
    def _to_model(self, entity: Categoria) -> CategoriaModel:
        """Converte entidade para model"""
        return CategoriaModel(
            Id=entity.id,
            Nome=entity.nome,
            DataCriacao=entity.data_criacao,
            DataAtualizacao=entity.data_atualizacao,
            DataExclusao=entity.data_exclusao
        )
    
    def create(self, categoria: Categoria) -> Categoria:
        """Cria uma nova categoria"""
        model = CategoriaModel(
            Nome=categoria.nome,
            DataCriacao=datetime.now(),
            DataAtualizacao=None,
            DataExclusao=None
        )
        
        self._session.add(model)
        self._session.commit()
        self._session.refresh(model)
        
        return self._to_entity(model)
    
    def find_by_id(self, categoria_id: int) -> Optional[Categoria]:
        """Busca categoria por ID"""
        model = self._session.query(CategoriaModel).filter(
            CategoriaModel.Id == categoria_id
        ).first()
        
        return self._to_entity(model) if model else None
    
    def find_all(self, include_deleted: bool = False) -> List[Categoria]:
        """Retorna todas as categorias"""
        query = self._session.query(CategoriaModel)
        
        if not include_deleted:
            query = query.filter(CategoriaModel.DataExclusao.is_(None))
        
        models = query.order_by(CategoriaModel.Id).all()
        
        return [self._to_entity(model) for model in models]
    
    def update(self, categoria: Categoria) -> Categoria:
        """Atualiza uma categoria"""
        model = self._session.query(CategoriaModel).filter(
            CategoriaModel.Id == categoria.id
        ).first()
        
        if not model:
            raise ValueError(f"Categoria com ID {categoria.id} não encontrada")
        
        model.Nome = categoria.nome
        model.DataAtualizacao = datetime.now()
        
        self._session.commit()
        self._session.refresh(model)
        
        return self._to_entity(model)
    
    def delete(self, categoria_id: int) -> bool:
        """Soft delete de uma categoria"""
        model = self._session.query(CategoriaModel).filter(
            CategoriaModel.Id == categoria_id,
            CategoriaModel.DataExclusao.is_(None),
        ).first()
        
        if not model:
            return False
        
        model.DataExclusao = datetime.now()
        self._session.commit()
        
        return True
    
    def find_by_nome(self, nome: str) -> Optional[Categoria]:
        """Busca categoria ativa por nome (sem diferenciar maiúsculas)"""
        model = self._session.query(CategoriaModel).filter(
            func.lower(CategoriaModel.Nome) == nome.strip().lower(),
            CategoriaModel.DataExclusao.is_(None)
        ).first()
        
        return self._to_entity(model) if model else None
