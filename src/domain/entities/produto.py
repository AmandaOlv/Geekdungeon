"""
Domain Layer - Produto Entity
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from decimal import Decimal


@dataclass
class Produto:
    """Entidade Produto"""
    id: Optional[int]
    nome: str
    descricao: Optional[str]
    preco_venda: Decimal
    quantidade_estoque: int
    categoria_id: int
    data_criacao: datetime
    data_atualizacao: Optional[datetime] = None
    data_exclusao: Optional[datetime] = None

    def __post_init__(self):
        """Validações de negócio"""
        if not self.nome or len(self.nome.strip()) == 0:
            raise ValueError("Nome do produto é obrigatório")
        
        if len(self.nome) > 200:
            raise ValueError("Nome do produto deve ter no máximo 200 caracteres")
        
        if self.preco_venda < 0:
            raise ValueError("Preço de venda não pode ser negativo")
        
        if self.quantidade_estoque < 0:
            raise ValueError("Quantidade em estoque não pode ser negativa")
    
    def atualizar_preco(self, novo_preco: Decimal) -> None:
        """Atualiza o preço do produto"""
        if novo_preco < 0:
            raise ValueError("Preço não pode ser negativo")
        self.preco_venda = novo_preco
        self.data_atualizacao = datetime.now()
    
    def adicionar_estoque(self, quantidade: int) -> None:
        """Adiciona quantidade ao estoque"""
        if quantidade <= 0:
            raise ValueError("Quantidade deve ser positiva")
        self.quantidade_estoque += quantidade
        self.data_atualizacao = datetime.now()
    
    def remover_estoque(self, quantidade: int) -> None:
        """Remove quantidade do estoque"""
        if quantidade <= 0:
            raise ValueError("Quantidade deve ser positiva")
        if quantidade > self.quantidade_estoque:
            raise ValueError("Estoque insuficiente")
        self.quantidade_estoque -= quantidade
        self.data_atualizacao = datetime.now()
    
    def excluir(self) -> None:
        """Soft delete do produto"""
        self.data_exclusao = datetime.now()
    
    @property
    def esta_ativo(self) -> bool:
        """Verifica se o produto está ativo (não excluído)"""
        return self.data_exclusao is None
    
    @property
    def tem_estoque(self) -> bool:
        """Verifica se há estoque disponível"""
        return self.quantidade_estoque > 0
