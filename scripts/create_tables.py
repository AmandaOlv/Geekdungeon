"""Cria as tabelas do projeto no SQL Server."""
import sys
from pathlib import Path

from sqlalchemy import inspect, text

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.infrastructure.database import CategoriaModel, ProdutoModel, db_config


def main() -> None:
    db_config.create_tables()
    inspector = inspect(db_config.engine)
    print("TABLES:", inspector.get_table_names())
    for table_name in inspector.get_table_names():
        columns = [column["name"] for column in inspector.get_columns(table_name)]
        print(table_name, columns)

    with db_config.engine.connect() as connection:
        version = connection.execute(text("SELECT @@VERSION")).scalar()
        print("SQL_VERSION:", version)


if __name__ == "__main__":
    main()
