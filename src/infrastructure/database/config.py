"""
Infrastructure Layer - Database Configuration
Configuração de banco de dados SQL Server
"""
import os
import urllib.parse
from pathlib import Path
from typing import Generator

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

load_dotenv(Path(__file__).resolve().parents[3] / ".env")


class Base(DeclarativeBase):
    """Base class para modelos SQLAlchemy"""
    pass


class DatabaseConfig:
    """Configuração do banco de dados SQL Server"""

    def __init__(self):
        server = os.getenv("DB_SERVER")
        database = os.getenv("DB_NAME")
        user = os.getenv("DB_USER")
        password = os.getenv("DB_PASSWORD")
        driver = os.getenv("DB_DRIVER", "ODBC Driver 18 for SQL Server")

        missing = [
            name
            for name, value in (
                ("DB_SERVER", server),
                ("DB_NAME", database),
                ("DB_USER", user),
                ("DB_PASSWORD", password),
            )
            if not value
        ]
        if missing:
            raise RuntimeError(
                "Variáveis de ambiente ausentes no .env: " + ", ".join(missing)
            )

        connection_string = (
            f"DRIVER={{{driver}}};"
            f"SERVER={server};"
            f"DATABASE={database};"
            f"UID={user};"
            f"PWD={password};"
            "Encrypt=yes;"
            "TrustServerCertificate=yes;"
            "Connection Timeout=30;"
            "Packet Size=4096;"
            f"Workstation ID={server};"
        )

        params = urllib.parse.quote_plus(connection_string)
        database_url = f"mssql+pyodbc:///?odbc_connect={params}"

        self.engine = create_engine(
            database_url,
            echo=os.getenv("DEBUG", "false").lower() in {"1", "true", "yes"},
            pool_pre_ping=True,
            pool_recycle=3600,
            pool_size=3,
            max_overflow=2,
        )
        self.session_maker = sessionmaker(
            self.engine,
            expire_on_commit=False,
        )

    def get_session(self) -> Generator:
        """Obtém uma sessão do banco de dados"""
        session = self.session_maker()
        try:
            yield session
        finally:
            session.close()

    def create_tables(self):
        """Cria as tabelas do banco de dados"""
        Base.metadata.create_all(self.engine)

    def drop_tables(self):
        """Remove as tabelas do banco de dados"""
        Base.metadata.drop_all(self.engine)


class _LazyDatabaseConfig:
    """Atrasa a conexão até a primeira query — o /health sobe sem falar com o Somee."""

    def __init__(self):
        self._inner: DatabaseConfig | None = None

    def _get(self) -> DatabaseConfig:
        if self._inner is None:
            self._inner = DatabaseConfig()
        return self._inner

    def __getattr__(self, name: str):
        return getattr(self._get(), name)


db_config = _LazyDatabaseConfig()
