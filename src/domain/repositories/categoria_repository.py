"""
Domain Layer - Repository Interface para Categoria
"""
from abc import ABC, abstractmethod
from typing import Optional, List
from src.domain.entities import Categoria


class ICategoriaRepository(ABC):
    """Interface do repositório de categorias"""
    
    @abstractmethod
    def create(self, categoria: Categoria) -> Categoria:
        """Cria uma nova categoria"""
        pass
    
    @abstractmethod
    def find_by_id(self, categoria_id: int) -> Optional[Categoria]:
        """Busca categoria por ID"""
        pass
    
    @abstractmethod
    def find_all(self, include_deleted: bool = False) -> List[Categoria]:
        """Retorna todas as categorias"""
        pass
    
    @abstractmethod
    def update(self, categoria: Categoria) -> Categoria:
        """Atualiza uma categoria"""
        pass
    
    @abstractmethod
    def delete(self, categoria_id: int) -> bool:
        """Soft delete de uma categoria"""
        pass
    
    @abstractmethod
    def find_by_nome(self, nome: str) -> Optional[Categoria]:
        """Busca categoria por nome"""
        pass
