"""
Infrastructure Layer - Database Models
Modelos ORM para persistência - mapeando tabelas existentes
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, DECIMAL, ForeignKey
from sqlalchemy.orm import relationship
from src.infrastructure.database.config import Base


class CategoriaModel(Base):
    """Modelo de banco de dados para Categoria"""
    __tablename__ = "Categorias"
    
    Id = Column(Integer, primary_key=True, autoincrement=True)
    Nome = Column(String(100), nullable=False)
    DataCriacao = Column(DateTime, nullable=False)
    DataAtualizacao = Column(DateTime, nullable=True)
    DataExclusao = Column(DateTime, nullable=True)
    
    # Relacionamento
    produtos = relationship("ProdutoModel", back_populates="categoria")


class ProdutoModel(Base):
    """Modelo de banco de dados para Produto"""
    __tablename__ = "Produtos"
    
    Id = Column(Integer, primary_key=True, autoincrement=True)
    Nome = Column(String(200), nullable=False)
    Descricao = Column(String(1000), nullable=True)
    PrecoVenda = Column(DECIMAL(18, 2), nullable=False)
    QuantidadeEstoque = Column(Integer, nullable=False, default=0)
    CategoriaId = Column(Integer, ForeignKey("Categorias.Id"), nullable=False)
    DataCriacao = Column(DateTime, nullable=False)
    DataAtualizacao = Column(DateTime, nullable=True)
    DataExclusao = Column(DateTime, nullable=True)
    
    # Relacionamento
    categoria = relationship("CategoriaModel", back_populates="produtos")



