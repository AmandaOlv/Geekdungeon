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
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Registro de routers
    app.include_router(categoria_router)
    app.include_router(produto_router)
    
    def health_payload():
        return {
            "status": "healthy",
            "message": "GeekDungeon Chatbot API está rodando!",
            "endpoints": {
                "categorias": "/categorias",
                "produtos": "/produtos",
                "docs": "/docs",
                "health": "/health",
            },
        }

    @app.get("/", tags=["health"])
    async def root():
        """Health check endpoint"""
        return health_payload()

    @app.get("/health", tags=["health"])
    async def health_check():
        """Health check usado pelo painel web"""
        return health_payload()
    
    return app


# Instância da aplicação
app = create_app()

