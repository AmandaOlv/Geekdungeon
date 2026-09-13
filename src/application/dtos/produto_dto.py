"""
Application Layer - Produto DTOs
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from decimal import Decimal


@dataclass
class CreateProdutoDTO:
    """DTO para criação de produto"""
    nome: str
    descricao: Optional[str]
    preco_venda: Decimal
    quantidade_estoque: int
    categoria_id: int


@dataclass
class UpdateProdutoDTO:
    """DTO para atualização de produto"""
    nome: Optional[str] = None
    descricao: Optional[str] = None
    preco_venda: Optional[Decimal] = None
    quantidade_estoque: Optional[int] = None
    categoria_id: Optional[int] = None


@dataclass
class ProdutoDTO:
    """DTO de resposta de produto"""
    id: int
    nome: str
    descricao: Optional[str]
    preco_venda: Decimal
    quantidade_estoque: int
    categoria_id: int
    data_criacao: datetime
    data_atualizacao: Optional[datetime]
    data_exclusao: Optional[datetime]
    esta_ativo: bool
    tem_estoque: bool
    categoria_nome: Optional[str] = None

    @classmethod
    def from_entity(cls, produto, categoria_nome: Optional[str] = None):
        """Converte entidade Produto para DTO"""
        return cls(
            id=produto.id,
            nome=produto.nome,
            descricao=produto.descricao,
            preco_venda=produto.preco_venda,
            quantidade_estoque=produto.quantidade_estoque,
            categoria_id=produto.categoria_id,
            data_criacao=produto.data_criacao,
            data_atualizacao=produto.data_atualizacao,
            data_exclusao=produto.data_exclusao,
            esta_ativo=produto.esta_ativo,
            tem_estoque=produto.tem_estoque,
            categoria_nome=categoria_nome,
        )


@dataclass
class AjusteEstoqueDTO:
    """DTO para entrada/saída de estoque"""
    delta: int


@dataclass
class ProdutoComCategoriaDTO:
    """DTO de produto com informações da categoria"""
    id: int
    nome: str
    descricao: Optional[str]
    preco_venda: Decimal
    quantidade_estoque: int
    categoria_id: int
    categoria_nome: str
    data_criacao: datetime
    data_atualizacao: Optional[datetime]
    esta_ativo: bool
    tem_estoque: bool
