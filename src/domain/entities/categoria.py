"""
Domain Layer - Categoria Entity
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class Categoria:
    """Entidade Categoria"""
    id: Optional[int]
    nome: str
    data_criacao: datetime
    data_atualizacao: Optional[datetime] = None
    data_exclusao: Optional[datetime] = None

    def __post_init__(self):
        """Validações de negócio"""
        if not self.nome or len(self.nome.strip()) == 0:
            raise ValueError("Nome da categoria é obrigatório")
        
        if len(self.nome) > 100:
            raise ValueError("Nome da categoria deve ter no máximo 100 caracteres")
    
    def atualizar(self) -> None:
        """Marca a categoria como atualizada"""
        self.data_atualizacao = datetime.now()
    
    def excluir(self) -> None:
        """Soft delete da categoria"""
        self.data_exclusao = datetime.now()
    
    @property
    def esta_ativa(self) -> bool:
        """Verifica se a categoria está ativa (não excluída)"""
        return self.data_exclusao is None
