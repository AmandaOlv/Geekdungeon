"""API Controllers"""
from .categoria_controller import router as categoria_router
from .produto_controller import router as produto_router

__all__ = ["categoria_router", "produto_router"]
