"""
Main - Ponto de entrada da aplicação
"""
import os

import uvicorn


if __name__ == "__main__":
    uvicorn.run(
        "src.presentation.api.app:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=os.getenv("DEBUG", "false").lower() in {"1", "true", "yes"},
        log_level="info",
    )
