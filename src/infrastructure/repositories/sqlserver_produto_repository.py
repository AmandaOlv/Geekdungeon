"""
Infrastructure Layer - SQL Server Produto Repository
Implementação do repositório usando SQL Server
"""
from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.orm import Session
from datetime import datetime
from decimal import Decimal

from src.domain.entities import Produto
from src.domain.repositories import IProdutoRepository
from src.infrastructure.database import ProdutoModel


class SqlServerProdutoRepository(IProdutoRepository):
    """Implementação SQL Server do repositório de produtos"""
    
    def __init__(self, session: Session):
        self._session = session
    
    def _to_entity(self, model: ProdutoModel) -> Produto:
        """Converte model para entidade"""
        return Produto(
            id=model.Id,
            nome=model.Nome,
            descricao=model.Descricao,
            preco_venda=Decimal(str(model.PrecoVenda)),
            quantidade_estoque=model.QuantidadeEstoque,
            categoria_id=model.CategoriaId,
            data_criacao=model.DataCriacao,
            data_atualizacao=model.DataAtualizacao,
            data_exclusao=model.DataExclusao
        )
    
    def create(self, produto: Produto) -> Produto:
        """Cria um novo produto"""
        model = ProdutoModel(
            Nome=produto.nome,
            Descricao=produto.descricao,
            PrecoVenda=float(produto.preco_venda),
            QuantidadeEstoque=produto.quantidade_estoque,
            CategoriaId=produto.categoria_id,
            DataCriacao=datetime.now(),
            DataAtualizacao=None,
            DataExclusao=None
        )
        
        self._session.add(model)
        self._session.commit()
        self._session.refresh(model)
        
        return self._to_entity(model)
    
    def find_by_id(self, produto_id: int) -> Optional[Produto]:
        """Busca produto por ID"""
        model = self._session.query(ProdutoModel).filter(
            ProdutoModel.Id == produto_id
        ).first()
        
        return self._to_entity(model) if model else None
    
    def find_all(self, include_deleted: bool = False) -> List[Produto]:
        """Retorna todos os produtos"""
        query = self._session.query(ProdutoModel)
        
        if not include_deleted:
            query = query.filter(ProdutoModel.DataExclusao.is_(None))
        
        models = query.all()
        
        return [self._to_entity(model) for model in models]
    
    def find_by_categoria(self, categoria_id: int, include_deleted: bool = False) -> List[Produto]:
        """Retorna produtos de uma categoria"""
        query = self._session.query(ProdutoModel).filter(ProdutoModel.CategoriaId == categoria_id)
        
        if not include_deleted:
            query = query.filter(ProdutoModel.DataExclusao.is_(None))
        
        models = query.all()
        
        return [self._to_entity(model) for model in models]
    
    def update(self, produto: Produto) -> Produto:
        """Atualiza um produto"""
        model = self._session.query(ProdutoModel).filter(
            ProdutoModel.Id == produto.id
        ).first()
        
        if not model:
            raise ValueError(f"Produto com ID {produto.id} não encontrado")
        
        model.Nome = produto.nome
        model.Descricao = produto.descricao
        model.PrecoVenda = float(produto.preco_venda)
        model.QuantidadeEstoque = produto.quantidade_estoque
        model.CategoriaId = produto.categoria_id
        model.DataAtualizacao = datetime.now()
        
        self._session.commit()
        self._session.refresh(model)
        
        return self._to_entity(model)
    
    def delete(self, produto_id: int) -> bool:
        """Soft delete de um produto"""
        model = self._session.query(ProdutoModel).filter(
            ProdutoModel.Id == produto_id
        ).first()
        
        if not model:
            return False
        
        model.DataExclusao = datetime.now()
        self._session.commit()
        
        return True
    
    def find_by_nome(self, nome: str) -> List[Produto]:
        """Busca produtos por nome (parcial)"""
        models = self._session.query(ProdutoModel).filter(
            ProdutoModel.Nome.like(f"%{nome}%"),
            ProdutoModel.DataExclusao.is_(None)
        ).all()
        
        return [self._to_entity(model) for model in models]
