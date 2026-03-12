"""
Infrastructure Layer - Database Configuration
Configuração de banco de dados SQL Server
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from typing import Generator
import urllib.parse


class Base(DeclarativeBase):
    """Base class para modelos SQLAlchemy"""
    pass


class DatabaseConfig:
    """Configuração do banco de dados SQL Server"""
    
    def __init__(self):
        # Connection string do SQL Server (síncrona)
        connection_string = (
            "DRIVER={SQL Server};"
            "SERVER=[REDACTED_HOST];"
            "DATABASE=geekdungeon-produtos;"
            "UID=AQUI É O USUARIO;"
            "PWD=AQUI É A SENHA;"
            "TrustServerCertificate=yes;"
            "Packet Size=4096;"
            "Workstation ID=[REDACTED_HOST];"
        )
        
        params = urllib.parse.quote_plus(connection_string)
        database_url = f"mssql+pyodbc:///?odbc_connect={params}"
        
        self.engine = create_engine(
            database_url,
            echo=True,
            pool_pre_ping=True,
            pool_recycle=3600,
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


# Instância global do database config
db_config = DatabaseConfig()

