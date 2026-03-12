"""
Application Layer - Categoria DTOs
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class CreateCategoriaDTO:
    """DTO para criação de categoria"""
    nome: str


@dataclass
class UpdateCategoriaDTO:
    """DTO para atualização de categoria"""
    nome: str


@dataclass
class CategoriaDTO:
    """DTO de resposta de categoria"""
    id: int
    nome: str
    data_criacao: datetime
    data_atualizacao: Optional[datetime]
    data_exclusao: Optional[datetime]
    esta_ativa: bool

    @classmethod
    def from_entity(cls, categoria):
        """Converte entidade Categoria para DTO"""
        return cls(
            id=categoria.id,
            nome=categoria.nome,
            data_criacao=categoria.data_criacao,
            data_atualizacao=categoria.data_atualizacao,
            data_exclusao=categoria.data_exclusao,
            esta_ativa=categoria.esta_ativa
        )
