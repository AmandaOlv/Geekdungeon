"""
Application Layer - Use Cases para Produto (Sync)
"""
from datetime import datetime
from typing import List, Optional
from decimal import Decimal

from src.domain.entities import Produto
from src.domain.repositories import IProdutoRepository, ICategoriaRepository
from src.application.dtos import CreateProdutoDTO, UpdateProdutoDTO, ProdutoDTO


class CreateProdutoUseCase:
    """Caso de uso para criar produto"""
    
    def __init__(
        self,
        produto_repository: IProdutoRepository,
        categoria_repository: ICategoriaRepository
    ):
        self._produto_repository = produto_repository
        self._categoria_repository = categoria_repository
    
    def execute(self, dto: CreateProdutoDTO) -> ProdutoDTO:
        """Cria um novo produto"""
        # Verifica se a categoria existe
        categoria = self._categoria_repository.find_by_id(dto.categoria_id)
        if not categoria:
            raise ValueError(f"Categoria com ID {dto.categoria_id} não encontrada")
        
        if not categoria.esta_ativa:
            raise ValueError("Não é possível criar produto em categoria excluída")
        
        # Cria a entidade
        produto = Produto(
            id=None,
            nome=dto.nome,
            descricao=dto.descricao,
            preco_venda=dto.preco_venda,
            quantidade_estoque=dto.quantidade_estoque,
            categoria_id=dto.categoria_id,
            data_criacao=datetime.now()
        )
        
        # Persiste
        created = self._produto_repository.create(produto)
        
        return ProdutoDTO.from_entity(created)


class GetProdutoUseCase:
    """Caso de uso para buscar produto"""
    
    def __init__(self, produto_repository: IProdutoRepository):
        self._produto_repository = produto_repository
    
    def execute(self, produto_id: int) -> Optional[ProdutoDTO]:
        """Busca produto por ID"""
        produto = self._produto_repository.find_by_id(produto_id)
        
        if not produto:
            return None
        
        return ProdutoDTO.from_entity(produto)


class ListProdutosUseCase:
    """Caso de uso para listar produtos"""
    
    def __init__(self, produto_repository: IProdutoRepository):
        self._produto_repository = produto_repository
    
    def execute(self, include_deleted: bool = False) -> List[ProdutoDTO]:
        """Lista todos os produtos"""
        produtos = self._produto_repository.find_all(include_deleted)
        
        return [ProdutoDTO.from_entity(prod) for prod in produtos]


class ListProdutosByCategoriaUseCase:
    """Caso de uso para listar produtos por categoria"""
    
    def __init__(self, produto_repository: IProdutoRepository):
        self._produto_repository = produto_repository
    
    def execute(self, categoria_id: int, include_deleted: bool = False) -> List[ProdutoDTO]:
        """Lista produtos de uma categoria"""
        produtos = self._produto_repository.find_by_categoria(categoria_id, include_deleted)
        
        return [ProdutoDTO.from_entity(prod) for prod in produtos]


class UpdateProdutoUseCase:
    """Caso de uso para atualizar produto"""
    
    def __init__(
        self,
        produto_repository: IProdutoRepository,
        categoria_repository: ICategoriaRepository
    ):
        self._produto_repository = produto_repository
        self._categoria_repository = categoria_repository
    
    def execute(self, produto_id: int, dto: UpdateProdutoDTO) -> ProdutoDTO:
        """Atualiza um produto"""
        produto = self._produto_repository.find_by_id(produto_id)
        
        if not produto:
            raise ValueError(f"Produto com ID {produto_id} não encontrado")
        
        # Verifica se está mudando categoria
        if dto.categoria_id and dto.categoria_id != produto.categoria_id:
            categoria = self._categoria_repository.find_by_id(dto.categoria_id)
            if not categoria or not categoria.esta_ativa:
                raise ValueError("Categoria inválida ou inativa")
            produto.categoria_id = dto.categoria_id
        
        # Atualiza os campos fornecidos
        if dto.nome:
            produto.nome = dto.nome
        
        if dto.descricao is not None:
            produto.descricao = dto.descricao
        
        if dto.preco_venda:
            produto.atualizar_preco(dto.preco_venda)
        
        if dto.quantidade_estoque is not None:
            produto.quantidade_estoque = dto.quantidade_estoque
        
        produto.data_atualizacao = datetime.now()
        
        updated = self._produto_repository.update(produto)
        
        return ProdutoDTO.from_entity(updated)


class DeleteProdutoUseCase:
    """Caso de uso para deletar produto"""
    
    def __init__(self, produto_repository: IProdutoRepository):
        self._produto_repository = produto_repository
    
    def execute(self, produto_id: int) -> bool:
        """Deleta um produto (soft delete)"""
        success = self._produto_repository.delete(produto_id)
        
        if not success:
            raise ValueError(f"Produto com ID {produto_id} não encontrado")
        
        return success


class SearchProdutosByNomeUseCase:
    """Caso de uso para buscar produtos por nome"""
    
    def __init__(self, produto_repository: IProdutoRepository):
        self._produto_repository = produto_repository
    
    def execute(self, nome: str) -> List[ProdutoDTO]:
        """Busca produtos por nome (busca parcial)"""
        produtos = self._produto_repository.find_by_nome(nome)
        
        return [ProdutoDTO.from_entity(prod) for prod in produtos]
