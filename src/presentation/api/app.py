"""
Presentation Layer - FastAPI Application
Configuração principal da aplicação FastAPI
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.presentation.api.controllers import categoria_router, produto_router


def create_app() -> FastAPI:
    """
    Factory para criar a aplicação FastAPI
    
    Returns:
        Instância configurada do FastAPI
    """
    app = FastAPI(
        title="GeekDungeon Chatbot API",
        description="API com Clean Architecture para o GeekDungeon Chatbot",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )
    
    # Configuração de CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Em produção, especifique os domínios permitidos
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Registro de routers
    app.include_router(categoria_router)
    app.include_router(produto_router)
    
    @app.get("/", tags=["health"])
    async def health_check():
        """Health check endpoint"""
        return {
            "status": "healthy",
            "message": "GeekDungeon Chatbot API está rodando!",
            "endpoints": {
                "categorias": "/categorias",
                "produtos": "/produtos",
                "docs": "/docs"
            }
        }
    
    return app


# Instância da aplicação
app = create_app()

