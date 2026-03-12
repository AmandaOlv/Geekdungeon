"""
Domain Layer - Repository Interface para Produto
"""
from abc import ABC, abstractmethod
from typing import Optional, List
from src.domain.entities import Produto


class IProdutoRepository(ABC):
    """Interface do repositório de produtos"""
    
    @abstractmethod
    def create(self, produto: Produto) -> Produto:
        """Cria um novo produto"""
        pass
    
    @abstractmethod
    def find_by_id(self, produto_id: int) -> Optional[Produto]:
        """Busca produto por ID"""
        pass
    
    @abstractmethod
    def find_all(self, include_deleted: bool = False) -> List[Produto]:
        """Retorna todos os produtos"""
        pass
    
    @abstractmethod
    def find_by_categoria(self, categoria_id: int, include_deleted: bool = False) -> List[Produto]:
        """Retorna produtos de uma categoria"""
        pass
    
    @abstractmethod
    def update(self, produto: Produto) -> Produto:
        """Atualiza um produto"""
        pass
    
    @abstractmethod
    def delete(self, produto_id: int) -> bool:
        """Soft delete de um produto"""
        pass
    
    @abstractmethod
    def find_by_nome(self, nome: str) -> List[Produto]:
        """Busca produtos por nome (parcial)"""
        pass
