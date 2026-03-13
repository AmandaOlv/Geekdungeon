# 🏰 GeekDungeon API — Clean Architecture com Python + FastAPI + SQL Server

> **Um guia completo para estudantes**: aprenda na prática como construir uma API REST profissional usando **Clean Architecture**, do zero ao deploy.

---

## 🤝 Contribuintes

Este projeto é uma iniciativa de extensão da **Descomplica**, desenvolvido por:

- **Amanda Pereira de Oliveira**
- **Italo Lima Da Silva**
- **Saulo Lohan Soares**

---

## 📖 Índice

1. [O que é esse projeto?](#-o-que-é-esse-projeto)
2. [O que você vai aprender?](#-o-que-você-vai-aprender)
3. [Pré-requisitos](#-pré-requisitos)
4. [Entendendo a Clean Architecture](#-entendendo-a-clean-architecture)
5. [Estrutura de pastas do projeto](#-estrutura-de-pastas-do-projeto)
6. [Camada por camada — explicação detalhada](#-camada-por-camada--explicação-detalhada)
   - [1. Domain Layer (Camada de Domínio)](#1️⃣-domain-layer--camada-de-domínio)
   - [2. Application Layer (Camada de Aplicação)](#2️⃣-application-layer--camada-de-aplicação)
   - [3. Infrastructure Layer (Camada de Infraestrutura)](#3️⃣-infrastructure-layer--camada-de-infraestrutura)
   - [4. Presentation Layer (Camada de Apresentação)](#4️⃣-presentation-layer--camada-de-apresentação)
7. [O Banco de Dados](#-o-banco-de-dados)
8. [Como instalar e rodar o projeto](#-como-instalar-e-rodar-o-projeto)
9. [Testando a API (Swagger)](#-testando-a-api-swagger)
10. [Todos os Endpoints](#-todos-os-endpoints)
11. [Regras de negócio](#-regras-de-negócio)
12. [Conceitos importantes para iniciantes](#-conceitos-importantes-para-iniciantes)
13. [Tecnologias utilizadas](#-tecnologias-utilizadas)
14. [Princípios de design aplicados](#-princípios-de-design-aplicados)
15. [Fluxo completo de uma requisição](#-fluxo-completo-de-uma-requisição)
16. [Possíveis erros e soluções](#-possíveis-erros-e-soluções)
17. [Próximos passos](#-próximos-passos)
18. [Glossário rápido](#-glossário-rápido)

---

## 🎯 O que é esse projeto?

O **GeekDungeon API** é uma API REST (Application Programming Interface) que gerencia **Categorias** e **Produtos** de uma loja geek. Ela foi construída seguindo a **Clean Architecture** (Arquitetura Limpa), um padrão de projeto criado por **Robert C. Martin (Uncle Bob)** que organiza o código em camadas independentes.

### Em palavras simples:
- **API** = um programa que recebe pedidos (requisições HTTP) e responde com dados (geralmente JSON)
- **REST** = um padrão de como organizar essas requisições (GET para buscar, POST para criar, PUT para atualizar, DELETE para deletar)
- **Clean Architecture** = uma forma de organizar o código para que ele seja fácil de entender, testar e modificar

---

## 📚 O que você vai aprender?

| Conceito | Descrição |
|----------|-----------|
| **Clean Architecture** | Como separar seu código em camadas independentes |
| **FastAPI** | Framework moderno para criar APIs em Python |
| **SQLAlchemy** | ORM para conectar Python ao banco de dados |
| **Repository Pattern** | Como isolar o acesso a dados do resto da aplicação |
| **Use Cases** | Como organizar a lógica de negócio |
| **DTOs** | Como transferir dados entre camadas de forma segura |
| **Dependency Injection** | Como desacoplar componentes da aplicação |
| **Soft Delete** | Como "deletar" dados sem apagar do banco |
| **Dataclasses** | Como criar classes de dados em Python de forma elegante |
| **SQL Server + Python** | Como conectar Python a um banco SQL Server |

---

## 🔧 Pré-requisitos

Antes de começar, você precisa ter instalado:

| Ferramenta | Versão | Para que serve? |
|------------|--------|-----------------|
| **Python** | 3.11 ou superior | Linguagem de programação |
| **pip** | Qualquer | Gerenciador de pacotes do Python |
| **Git** | Qualquer | Controle de versão |
| **ODBC Driver 18 for SQL Server** | 18.x | Driver para conectar ao SQL Server |

### 📥 Instalando o ODBC Driver (Windows)

O ODBC Driver é o "tradutor" que permite o Python conversar com o SQL Server.

1. Acesse: https://learn.microsoft.com/pt-br/sql/connect/odbc/download-odbc-driver-for-sql-server
2. Baixe o **ODBC Driver 18 for SQL Server**
3. Execute o instalador e siga o passo a passo

> 💡 **Dica**: Para verificar se já está instalado, abra o PowerShell e execute:
> ```powershell
> Get-OdbcDriver | Where-Object { $_.Name -like '*SQL Server*' } | Select-Object Name
> ```

---

## 🧠 Entendendo a Clean Architecture

A Clean Architecture organiza o código em **4 camadas**, como uma cebola 🧅 — cada camada só conhece a camada interna a ela:

```
┌─────────────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                         │
│        (FastAPI Controllers, Rotas HTTP, Swagger)           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              APPLICATION LAYER                         │ │
│  │        (Use Cases, DTOs, Orquestração)                 │ │
│  │  ┌───────────────────────────────────────────────────┐ │ │
│  │  │           INFRASTRUCTURE LAYER                    │ │ │
│  │  │    (SQL Server, SQLAlchemy, Repositórios)         │ │ │
│  │  │  ┌──────────────────────────────────────────────┐ │ │ │
│  │  │  │           DOMAIN LAYER                       │ │ │ │
│  │  │  │   (Entidades, Regras de negócio, Interfaces) │ │ │ │
│  │  │  └──────────────────────────────────────────────┘ │ │ │
│  │  └───────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 🔑 Regra de ouro: as dependências apontam para DENTRO

| Camada | Pode depender de... | NÃO pode depender de... |
|--------|---------------------|-------------------------|
| **Domain** | Nada (é o centro!) | Application, Infrastructure, Presentation |
| **Application** | Domain | Infrastructure, Presentation |
| **Infrastructure** | Domain | Application, Presentation |
| **Presentation** | Application, Infrastructure | — |

### Por que isso é importante?

- 🔄 **Trocar o banco de dados?** Só muda a camada Infrastructure, o resto não é afetado
- 🧪 **Testar regras de negócio?** Teste só o Domain, sem precisar de banco de dados
- 🔌 **Trocar o framework web?** Só muda a Presentation, a lógica permanece intacta
- 👥 **Trabalho em equipe?** Cada pessoa pode trabalhar em uma camada sem conflitos

---

## 📁 Estrutura de pastas do projeto

```
GeekDungeon-Chatbot/
│
├── 📄 main.py                           # 🚀 Ponto de entrada da aplicação
├── 📄 requirements.txt                   # 📦 Lista de dependências Python
├── 📄 .env.example                       # 🔐 Exemplo de variáveis de ambiente
├── 📄 .gitignore                         # 🙈 Arquivos ignorados pelo Git
├── 📄 README.md                          # 📖 Este arquivo que você está lendo!
│
└── src/                                  # 📂 Todo o código-fonte
    ├── __init__.py
    │
    ├── domain/                           # 🧠 CAMADA 1: Domínio (o coração)
    │   ├── __init__.py
    │   ├── entities/                     #    Entidades de negócio
    │   │   ├── __init__.py
    │   │   ├── categoria.py              #    Entidade Categoria
    │   │   └── produto.py                #    Entidade Produto
    │   └── repositories/                 #    Interfaces (contratos) de repositório
    │       ├── __init__.py
    │       ├── categoria_repository.py   #    Interface ICategoriaRepository
    │       └── produto_repository.py     #    Interface IProdutoRepository
    │
    ├── application/                      # ⚙️ CAMADA 2: Aplicação (orquestração)
    │   ├── __init__.py
    │   ├── dtos/                         #    Data Transfer Objects
    │   │   ├── __init__.py
    │   │   ├── categoria_dto.py          #    DTOs de Categoria
    │   │   └── produto_dto.py            #    DTOs de Produto
    │   └── use_cases/                    #    Casos de Uso
    │       ├── __init__.py
    │       ├── categoria_use_cases.py    #    5 Use Cases de Categoria
    │       └── produto_use_cases.py      #    7 Use Cases de Produto
    │
    ├── infrastructure/                   # 🔌 CAMADA 3: Infraestrutura (detalhes técnicos)
    │   ├── __init__.py
    │   ├── database/                     #    Configuração do banco
    │   │   ├── __init__.py
    │   │   ├── config.py                 #    Conexão com SQL Server
    │   │   └── models.py                 #    Modelos ORM (tabelas)
    │   └── repositories/                 #    Implementações concretas
    │       ├── __init__.py
    │       ├── sqlserver_categoria_repository.py
    │       └── sqlserver_produto_repository.py
    │
    └── presentation/                     # 🌐 CAMADA 4: Apresentação (API HTTP)
        ├── __init__.py
        ├── dependencies.py               #    Injeção de dependências
        └── api/
            ├── __init__.py
            ├── app.py                    #    Configuração do FastAPI
            └── controllers/              #    Controladores REST
                ├── __init__.py
                ├── categoria_controller.py
                └── produto_controller.py
```

---

## 🔬 Camada por camada — explicação detalhada

---

### 1️⃣ Domain Layer — Camada de Domínio

> 📍 Localização: `src/domain/`

A camada de domínio é o **coração** da aplicação. Aqui ficam as **regras de negócio** e as **entidades** — os conceitos centrais do seu sistema. Essa camada **NÃO conhece nada sobre banco de dados, HTTP, ou frameworks**.

#### 📦 Entidades (`src/domain/entities/`)

Entidades são **classes que representam conceitos do mundo real** no seu sistema. Elas contêm atributos e regras de negócio.

##### Categoria (`src/domain/entities/categoria.py`)

```python
@dataclass
class Categoria:
    """Entidade Categoria"""
    id: Optional[int]           # ID no banco (None quando ainda não foi salva)
    nome: str                   # Nome da categoria (ex: "Eletrônicos")
    data_criacao: datetime      # Quando foi criada
    data_atualizacao: Optional[datetime] = None  # Quando foi atualizada
    data_exclusao: Optional[datetime] = None     # Quando foi "deletada" (soft delete)
```

**O que é `@dataclass`?**
É um decorador do Python que cria automaticamente os métodos `__init__`, `__repr__` e outros para sua classe. Em vez de escrever todo o `def __init__(self, id, nome, ...)`, o Python gera tudo automaticamente!

**Regras de negócio da Categoria:**

| Regra | O que faz |
|-------|-----------|
| `__post_init__` | Valida que o nome não é vazio e tem no máximo 100 caracteres |
| `atualizar()` | Marca o campo `data_atualizacao` com a data/hora atual |
| `excluir()` | Faz o "soft delete" preenchendo `data_exclusao` |
| `esta_ativa` | Property que retorna `True` se a categoria não foi excluída |

##### Produto (`src/domain/entities/produto.py`)

```python
@dataclass
class Produto:
    """Entidade Produto"""
    id: Optional[int]
    nome: str                    # Nome do produto
    descricao: Optional[str]     # Descrição (opcional)
    preco_venda: Decimal         # Preço em Decimal (precisão monetária!)
    quantidade_estoque: int      # Quantidade em estoque
    categoria_id: int            # FK: a qual categoria pertence
    data_criacao: datetime
    data_atualizacao: Optional[datetime] = None
    data_exclusao: Optional[datetime] = None
```

> 💡 **Por que usar `Decimal` em vez de `float` para preço?**
> O `float` tem problemas de precisão (`0.1 + 0.2 = 0.30000000000000004`). O `Decimal` garante precisão exata para valores monetários!

**Regras de negócio do Produto:**

| Regra | O que faz |
|-------|-----------|
| `__post_init__` | Valida nome (obrigatório, max 200 chars), preço ≥ 0, estoque ≥ 0 |
| `atualizar_preco()` | Atualiza preço com validação |
| `adicionar_estoque()` | Soma quantidade ao estoque (deve ser positiva) |
| `remover_estoque()` | Subtrai do estoque (verifica se tem suficiente) |
| `excluir()` | Soft delete |
| `esta_ativo` | Property: `True` se não foi excluído |
| `tem_estoque` | Property: `True` se `quantidade_estoque > 0` |

#### 📋 Interfaces de Repositório (`src/domain/repositories/`)

Interfaces (ou contratos) definem **O QUE** um repositório deve fazer, sem dizer **COMO**. Usamos a classe `ABC` (Abstract Base Class) do Python.

```python
class ICategoriaRepository(ABC):
    """Interface do repositório de categorias"""

    @abstractmethod
    def create(self, categoria: Categoria) -> Categoria: ...

    @abstractmethod
    def find_by_id(self, categoria_id: int) -> Optional[Categoria]: ...

    @abstractmethod
    def find_all(self, include_deleted: bool = False) -> List[Categoria]: ...

    @abstractmethod
    def update(self, categoria: Categoria) -> Categoria: ...

    @abstractmethod
    def delete(self, categoria_id: int) -> bool: ...

    @abstractmethod
    def find_by_nome(self, nome: str) -> Optional[Categoria]: ...
```

> 🤔 **Por que usar interfaces?**
>
> Imagine que amanhã você queira trocar o SQL Server por PostgreSQL. Com interfaces, você só precisa criar uma **nova implementação** (`PostgresCategoriaRepository`) que siga o mesmo contrato. Nenhuma outra parte do código precisa mudar!

---

### 2️⃣ Application Layer — Camada de Aplicação

> 📍 Localização: `src/application/`

A camada de aplicação **orquestra** o fluxo da aplicação. Ela pega os dados que chegam, chama as entidades do domínio, e usa os repositórios para persistir dados. Aqui ficam os **Use Cases** (Casos de Uso) e os **DTOs** (Data Transfer Objects).

#### 📨 DTOs (`src/application/dtos/`)

DTOs são **objetos simples para transferência de dados** entre camadas. Eles definem exatamente quais dados entram e quais dados saem.

```python
# O que o cliente ENVIA para criar uma categoria:
@dataclass
class CreateCategoriaDTO:
    nome: str                    # Só precisa do nome!

# O que o cliente ENVIA para atualizar:
@dataclass
class UpdateCategoriaDTO:
    nome: str

# O que a API RETORNA como resposta:
@dataclass
class CategoriaDTO:
    id: int
    nome: str
    data_criacao: datetime
    data_atualizacao: Optional[datetime]
    data_exclusao: Optional[datetime]
    esta_ativa: bool             # Calculado a partir da entidade

    @classmethod
    def from_entity(cls, categoria):
        """Converte entidade Categoria para DTO"""
        return cls(
            id=categoria.id,
            nome=categoria.nome,
            data_criacao=categoria.data_criacao,
            data_atualizacao=categoria.data_atualizacao,
            data_exclusao=categoria.data_exclusao,
            esta_ativa=categoria.esta_ativa
        )
```

> 💡 **Por que não retornar a entidade diretamente?**
> 1. **Segurança**: Você controla exatamente quais campos são expostos
> 2. **Flexibilidade**: Pode adicionar campos calculados (como `esta_ativa`)
> 3. **Desacoplamento**: A API não depende da estrutura interna da entidade

#### 🎬 Use Cases (`src/application/use_cases/`)

Cada Use Case representa **uma ação que o usuário pode fazer**. A regra é: **um Use Case, uma responsabilidade**.

##### Use Cases de Categoria:

| Use Case | O que faz |
|----------|-----------|
| `CreateCategoriaUseCase` | Verifica duplicidade de nome → Cria entidade → Salva no banco |
| `GetCategoriaUseCase` | Busca categoria por ID → Retorna DTO ou None |
| `ListCategoriasUseCase` | Lista todas (com opção de incluir deletadas) |
| `UpdateCategoriaUseCase` | Busca → Valida nome único → Atualiza → Salva |
| `DeleteCategoriaUseCase` | Busca → Verifica se há produtos ativos → Faz soft delete |

##### Use Cases de Produto:

| Use Case | O que faz |
|----------|-----------|
| `CreateProdutoUseCase` | Verifica se categoria existe e está ativa → Cria produto |
| `GetProdutoUseCase` | Busca produto por ID |
| `ListProdutosUseCase` | Lista todos os produtos |
| `ListProdutosByCategoriaUseCase` | Lista produtos de uma categoria específica |
| `UpdateProdutoUseCase` | Atualiza produto (pode trocar de categoria) |
| `DeleteProdutoUseCase` | Soft delete do produto |
| `SearchProdutosByNomeUseCase` | Busca parcial por nome (ex: "note" encontra "Notebook") |

**Exemplo de um Use Case completo:**

```python
class CreateCategoriaUseCase:
    def __init__(self, categoria_repository: ICategoriaRepository):
        # Recebe a INTERFACE, não a implementação concreta!
        self._categoria_repository = categoria_repository

    def execute(self, dto: CreateCategoriaDTO) -> CategoriaDTO:
        # 1. Regra de negócio: não pode ter nome duplicado
        existing = self._categoria_repository.find_by_nome(dto.nome)
        if existing:
            raise ValueError(f"Categoria com nome '{dto.nome}' já existe")

        # 2. Cria a entidade (que valida nome vazio, tamanho, etc.)
        categoria = Categoria(
            id=None,
            nome=dto.nome,
            data_criacao=datetime.now()
        )

        # 3. Salva no banco via repositório
        created = self._categoria_repository.create(categoria)

        # 4. Retorna DTO (não a entidade!)
        return CategoriaDTO.from_entity(created)
```

---

### 3️⃣ Infrastructure Layer — Camada de Infraestrutura

> 📍 Localização: `src/infrastructure/`

A camada de infraestrutura contém os **detalhes técnicos**: como conectar ao banco, como mapear tabelas, como salvar dados. É aqui que o "mundo exterior" entra na aplicação.

#### 🗄️ Configuração do Banco (`src/infrastructure/database/config.py`)

```python
class DatabaseConfig:
    def __init__(self):
        connection_string = (
            "DRIVER={ODBC Driver 18 for SQL Server};"       # Driver ODBC instalado
            "SERVER=[REDACTED_HOST];"   # Endereço do servidor
            "DATABASE=geekdungeon-produtos;"                 # Nome do banco
            "UID=[REDACTED_USER];"                      # Usuário
            "PWD=[REDACTED];"                                # Senha
            "TrustServerCertificate=yes;"                    # Aceitar certificado SSL
        )

        # Converte a connection string para URL do SQLAlchemy
        params = urllib.parse.quote_plus(connection_string)
        database_url = f"mssql+pyodbc:///?odbc_connect={params}"

        # Cria a "engine" - o motor de conexão com o banco
        self.engine = create_engine(
            database_url,
            echo=True,          # True = mostra as queries SQL no console (ótimo para debug!)
            pool_pre_ping=True,  # Verifica se a conexão está viva antes de usar
            pool_recycle=3600,   # Recicla conexões a cada 1 hora
        )
```

> 💡 **O que é uma Engine?** É o objeto principal do SQLAlchemy que gerencia a conexão com o banco. Pense nela como um "gerente de conexões".

> 💡 **O que é Session?** É como uma "conversa" com o banco. Cada requisição HTTP abre uma session, faz as operações, e depois fecha.

#### 🗂️ Modelos ORM (`src/infrastructure/database/models.py`)

Modelos ORM são **classes Python que representam tabelas do banco de dados**. O SQLAlchemy faz a tradução entre Python e SQL automaticamente.

```python
class CategoriaModel(Base):
    __tablename__ = "Categorias"          # Nome real da tabela no SQL Server

    Id = Column(Integer, primary_key=True, autoincrement=True)
    Nome = Column(String(100), nullable=False)
    DataCriacao = Column(DateTime, nullable=False)
    DataAtualizacao = Column(DateTime, nullable=True)
    DataExclusao = Column(DateTime, nullable=True)

    # Relacionamento: uma categoria tem muitos produtos
    produtos = relationship("ProdutoModel", back_populates="categoria")


class ProdutoModel(Base):
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

    # Relacionamento inverso: um produto pertence a uma categoria
    categoria = relationship("CategoriaModel", back_populates="produtos")
```

> ⚠️ **Nota**: Os nomes das colunas usam **PascalCase** (ex: `DataCriacao`) porque estamos mapeando tabelas que já existem no SQL Server com essa convenção. No código Python usamos **snake_case** (ex: `data_criacao`).

#### 🔧 Implementação dos Repositórios (`src/infrastructure/repositories/`)

Aqui é onde as interfaces do Domain ganham **implementação concreta** para SQL Server:

```python
class SqlServerCategoriaRepository(ICategoriaRepository):
    """Implementação SQL Server do repositório de categorias"""

    def __init__(self, session: Session):
        self._session = session

    # Converte Model (banco) → Entity (domínio)
    def _to_entity(self, model: CategoriaModel) -> Categoria:
        return Categoria(
            id=model.Id,
            nome=model.Nome,
            data_criacao=model.DataCriacao,
            data_atualizacao=model.DataAtualizacao,
            data_exclusao=model.DataExclusao
        )

    def create(self, categoria: Categoria) -> Categoria:
        model = CategoriaModel(
            Nome=categoria.nome,
            DataCriacao=datetime.now(),
            DataAtualizacao=None,
            DataExclusao=None
        )

        self._session.add(model)        # Adiciona à sessão
        self._session.commit()           # Confirma no banco (INSERT INTO...)
        self._session.refresh(model)     # Recarrega com o ID gerado

        return self._to_entity(model)

    def find_all(self, include_deleted: bool = False) -> List[Categoria]:
        query = self._session.query(CategoriaModel)

        if not include_deleted:
            # Filtra: só retorna categorias que NÃO foram deletadas
            query = query.filter(CategoriaModel.DataExclusao.is_(None))

        models = query.all()
        return [self._to_entity(model) for model in models]

    def delete(self, categoria_id: int) -> bool:
        model = self._session.query(CategoriaModel).filter(
            CategoriaModel.Id == categoria_id
        ).first()

        if not model:
            return False

        model.DataExclusao = datetime.now()  # Soft delete!
        self._session.commit()

        return True
```

> 💡 **Por que converter Model ↔ Entity?**
> - O **Model** é do SQLAlchemy (infraestrutura) — ele sabe sobre o banco
> - A **Entity** é do Domain (domínio) — ela sabe sobre regras de negócio
> - Converter entre eles mantém as camadas **independentes**

---

### 4️⃣ Presentation Layer — Camada de Apresentação

> 📍 Localização: `src/presentation/`

A camada de apresentação é a **porta de entrada** da aplicação. Ela recebe requisições HTTP, chama os Use Cases, e retorna respostas JSON.

#### 🌐 Configuração do FastAPI (`src/presentation/api/app.py`)

```python
def create_app() -> FastAPI:
    app = FastAPI(
        title="GeekDungeon Chatbot API",
        description="API com Clean Architecture para o GeekDungeon Chatbot",
        version="1.0.0",
        docs_url="/docs",       # Swagger UI automático!
        redoc_url="/redoc",     # Documentação alternativa
    )

    # CORS: permite que o frontend acesse a API
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],    # Em produção, especifique os domínios!
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Registra as rotas
    app.include_router(categoria_router)   # /categorias
    app.include_router(produto_router)     # /produtos

    return app
```

#### 🎮 Controllers (`src/presentation/api/controllers/`)

Controllers definem os **endpoints HTTP** da API. Cada função trata uma rota.

```python
router = APIRouter(prefix="/categorias", tags=["categorias"])

@router.post("", status_code=status.HTTP_201_CREATED)
def create_categoria(
    dto: CreateCategoriaDTO,                    # FastAPI lê do body JSON automaticamente!
    session: Session = Depends(get_db_session)  # Injeção de dependência
) -> CategoriaDTO:
    try:
        use_case = get_create_categoria_use_case(session)  # Cria o Use Case
        return use_case.execute(dto)                       # Executa a lógica
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
```

> 💡 **O que é `Depends()`?** É o sistema de **Injeção de Dependência** do FastAPI. Ele automaticamente chama `get_db_session()` e fornece o resultado para a função. Quando a requisição termina, ele fecha a sessão do banco.

#### 🔗 Injeção de Dependências (`src/presentation/dependencies.py`)

Este arquivo é o **"montador"** da aplicação. Ele cria os objetos necessários e conecta tudo:

```python
# 1. Fornece sessão do banco de dados
def get_db_session():
    for session in db_config.get_session():
        yield session                # "yield" permite limpar depois

# 2. Cria repositórios
def get_categoria_repository(session: Session) -> ICategoriaRepository:
    return SqlServerCategoriaRepository(session)

# 3. Cria Use Cases com seus repositórios
def get_create_categoria_use_case(session: Session) -> CreateCategoriaUseCase:
    return CreateCategoriaUseCase(get_categoria_repository(session))
```

---

## 🗄️ O Banco de Dados

A aplicação conecta-se a um **SQL Server hospedado na nuvem** (somee.com) com duas tabelas:

### Tabela `Categorias`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `Id` | INT (PK, IDENTITY) | Identificador único, gerado automaticamente |
| `Nome` | NVARCHAR(100) | Nome da categoria |
| `DataCriacao` | DATETIME2 | Data/hora de criação |
| `DataAtualizacao` | DATETIME2 (NULL) | Data/hora da última atualização |
| `DataExclusao` | DATETIME2 (NULL) | Data/hora de exclusão (soft delete) |

### Tabela `Produtos`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `Id` | INT (PK, IDENTITY) | Identificador único |
| `Nome` | NVARCHAR(200) | Nome do produto |
| `Descricao` | NVARCHAR(1000) (NULL) | Descrição detalhada |
| `PrecoVenda` | DECIMAL(18,2) | Preço de venda |
| `QuantidadeEstoque` | INT | Quantidade disponível |
| `CategoriaId` | INT (FK → Categorias.Id) | Categoria do produto |
| `DataCriacao` | DATETIME2 | Data/hora de criação |
| `DataAtualizacao` | DATETIME2 (NULL) | Data/hora da última atualização |
| `DataExclusao` | DATETIME2 (NULL) | Data/hora de exclusão (soft delete) |

### Relacionamento entre as tabelas

```
┌──────────────┐       1    *  ┌──────────────┐
│  Categorias  │──────────────│   Produtos    │
│              │               │              │
│  Id (PK)     │               │  Id (PK)     │
│  Nome        │               │  Nome        │
│  ...         │               │  CategoriaId │◄── FK para Categorias.Id
│              │               │  ...         │
└──────────────┘               └──────────────┘

Uma categoria pode ter MUITOS produtos (1:N)
Um produto pertence a UMA categoria
```

---

## 🚀 Como instalar e rodar o projeto

### Passo 1: Clone o repositório

```bash
git clone <url-do-repositorio>
cd GeekDungeon-Chatbot
```

### Passo 2: Crie um ambiente virtual

```bash
python -m venv .venv
```

> 💡 **O que é um ambiente virtual?** É uma "caixa isolada" que mantém as dependências desse projeto separadas dos outros projetos Python do seu computador. Assim, se o projeto A usa a versão 1.0 de uma biblioteca e o projeto B usa a versão 2.0, não há conflito!

### Passo 3: Ative o ambiente virtual

**Windows (PowerShell):**
```powershell
.venv\Scripts\Activate.ps1
```

**Windows (CMD):**
```cmd
.venv\Scripts\activate.bat
```

**Linux/Mac:**
```bash
source .venv/bin/activate
```

> Você saberá que está ativo quando ver `(.venv)` no início da linha do terminal.

### Passo 4: Instale as dependências

```bash
pip install -r requirements.txt
```

Isso vai instalar:

| Pacote | Versão | Para que serve |
|--------|--------|----------------|
| `fastapi` | 0.109.0 | Framework para criar a API REST |
| `uvicorn[standard]` | 0.27.0 | Servidor web que roda o FastAPI |
| `pydantic` | 2.5.3 | Validação e serialização de dados |
| `sqlalchemy` | 2.0.25 | ORM para comunicar com o banco de dados |
| `pyodbc` | 5.0.1 | Driver Python para ODBC (SQL Server) |
| `greenlet` | 3.0.3 | Suporte a concorrência para SQLAlchemy |
| `python-dotenv` | 1.0.0 | Carregar variáveis de ambiente de arquivos `.env` |

### Passo 5: Execute a aplicação

```bash
python main.py
```

Você verá no terminal:

```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxx] using WatchFiles
INFO:     Started server process [xxxx]
INFO:     Application startup complete.
```

✅ **A API está rodando!**

### Passo 6: Acesse a documentação

Abra no navegador:
- 📘 **Swagger UI**: http://localhost:8000/docs
- 📕 **ReDoc**: http://localhost:8000/redoc

---

## 🧪 Testando a API (Swagger)

O FastAPI gera **automaticamente** uma interface de testes chamada **Swagger UI**. Acesse http://localhost:8000/docs

### Como testar no Swagger:

1. **Clique** no endpoint que deseja testar (ex: `POST /categorias`)
2. **Clique** em `Try it out`
3. **Preencha** o corpo da requisição (JSON)
4. **Clique** em `Execute`
5. **Veja** a resposta com código de status e dados retornados

### Exemplo: Criando uma categoria

1. Abra `POST /categorias`
2. Clique em `Try it out`
3. No corpo, coloque:
```json
{
  "nome": "Eletrônicos"
}
```
4. Clique `Execute`
5. Resposta esperada (status `201 Created`):
```json
{
  "id": 1,
  "nome": "Eletrônicos",
  "data_criacao": "2026-02-07T19:00:00",
  "data_atualizacao": null,
  "data_exclusao": null,
  "esta_ativa": true
}
```

### Exemplo: Criando um produto

1. Abra `POST /produtos`
2. No corpo:
```json
{
  "nome": "Notebook Gamer",
  "descricao": "Notebook com RTX 4060, 16GB RAM",
  "preco_venda": 5999.99,
  "quantidade_estoque": 10,
  "categoria_id": 1
}
```
3. Resposta esperada (status `201 Created`):
```json
{
  "id": 1,
  "nome": "Notebook Gamer",
  "descricao": "Notebook com RTX 4060, 16GB RAM",
  "preco_venda": 5999.99,
  "quantidade_estoque": 10,
  "categoria_id": 1,
  "data_criacao": "2026-02-07T19:05:00",
  "data_atualizacao": null,
  "data_exclusao": null,
  "esta_ativo": true,
  "tem_estoque": true
}
```

### Exemplo: Listando categorias

1. Abra `GET /categorias`
2. Clique em `Try it out`
3. Deixe `include_deleted` como `false` para ver só as ativas
4. Clique `Execute`

### Exemplo: Buscando produtos por nome

1. Abra `GET /produtos`
2. No campo `nome`, digite `notebook`
3. A busca é parcial — vai encontrar "Notebook Gamer", "Notebook Dell", etc.

---

## 📡 Todos os Endpoints

### 🏷️ Categorias

| Método | Rota | Descrição | Status de Sucesso |
|--------|------|-----------|-------------------|
| `POST` | `/categorias` | Criar nova categoria | `201 Created` |
| `GET` | `/categorias` | Listar todas as categorias | `200 OK` |
| `GET` | `/categorias?include_deleted=true` | Listar incluindo deletadas | `200 OK` |
| `GET` | `/categorias/{id}` | Buscar por ID | `200 OK` |
| `PUT` | `/categorias/{id}` | Atualizar categoria | `200 OK` |
| `DELETE` | `/categorias/{id}` | Deletar (soft delete) | `204 No Content` |

### 📦 Produtos

| Método | Rota | Descrição | Status de Sucesso |
|--------|------|-----------|-------------------|
| `POST` | `/produtos` | Criar novo produto | `201 Created` |
| `GET` | `/produtos` | Listar todos os produtos | `200 OK` |
| `GET` | `/produtos?categoria_id=1` | Filtrar por categoria | `200 OK` |
| `GET` | `/produtos?nome=notebook` | Buscar por nome (parcial) | `200 OK` |
| `GET` | `/produtos?include_deleted=true` | Incluir deletados | `200 OK` |
| `GET` | `/produtos/{id}` | Buscar por ID | `200 OK` |
| `PUT` | `/produtos/{id}` | Atualizar produto | `200 OK` |
| `DELETE` | `/produtos/{id}` | Deletar (soft delete) | `204 No Content` |

### 🏥 Health Check

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/` | Verifica se a API está rodando |

---

## 📏 Regras de negócio

As regras de negócio são validações que garantem a **integridade dos dados**:

### Regras de Categoria

| # | Regra | Onde é validada |
|---|-------|----------------|
| 1 | Nome é obrigatório | `Categoria.__post_init__` (Domain) |
| 2 | Nome máximo 100 caracteres | `Categoria.__post_init__` (Domain) |
| 3 | Nome deve ser único (entre categorias ativas) | `CreateCategoriaUseCase` (Application) |
| 4 | Não pode deletar categoria com produtos ativos | `DeleteCategoriaUseCase` (Application) |

### Regras de Produto

| # | Regra | Onde é validada |
|---|-------|----------------|
| 1 | Nome é obrigatório | `Produto.__post_init__` (Domain) |
| 2 | Nome máximo 200 caracteres | `Produto.__post_init__` (Domain) |
| 3 | Preço não pode ser negativo | `Produto.__post_init__` (Domain) |
| 4 | Estoque não pode ser negativo | `Produto.__post_init__` (Domain) |
| 5 | Produto deve pertencer a uma categoria existente e ativa | `CreateProdutoUseCase` (Application) |
| 6 | Ao trocar de categoria, a nova deve ser válida e ativa | `UpdateProdutoUseCase` (Application) |
| 7 | Remoção de estoque não pode ultrapassar quantidade disponível | `Produto.remover_estoque` (Domain) |

### Soft Delete — O que é?

**Soft Delete** significa que ao "deletar" um registro, ele **não é removido** do banco de dados. Em vez disso, o campo `DataExclusao` é preenchido com a data/hora atual. Isso permite:

- 📊 **Auditoria**: Saber quando um registro foi excluído
- 🔄 **Recuperação**: Possibilidade de "restaurar" registros
- 📈 **Histórico**: Manter dados para relatórios futuros

```
Antes de "deletar":  DataExclusao = NULL                    → está ativo ✅
Depois de "deletar": DataExclusao = 2026-02-07 19:00:00     → está "excluído" ❌
```

O registro continua no banco — ele só é filtrado nas consultas padrão!

---

## 💡 Conceitos importantes para iniciantes

### O que é uma API REST?

**API** = Application Programming Interface (Interface de Programação de Aplicação)

Pense assim: um **restaurante** tem um **garçom** que leva seus pedidos para a cozinha e traz a comida de volta. A API é o garçom!

```
Cliente (frontend/app) → API (garçom) → Banco de dados (cozinha)
                       ← Resposta JSON ←
```

**REST** define regras de como fazer os pedidos:

| Verbo HTTP | O que significa | Exemplo no restaurante |
|------------|-----------------|------------------------|
| `GET` | Buscar/ler dados | "Me mostra o cardápio" |
| `POST` | Criar novo dado | "Quero fazer um novo pedido" |
| `PUT` | Atualizar dado | "Trocar o acompanhamento do pedido" |
| `DELETE` | Remover dado | "Cancelar o pedido" |

### O que é JSON?

**JSON** (JavaScript Object Notation) é o formato mais usado para enviar e receber dados em APIs. É basicamente um "dicionário" de texto:

```json
{
  "nome": "Notebook Gamer",
  "preco_venda": 5999.99,
  "quantidade_estoque": 10
}
```

### O que é ORM?

**ORM** = Object-Relational Mapping (Mapeamento Objeto-Relacional)

Em vez de escrever SQL puro:
```sql
SELECT * FROM Categorias WHERE Id = 1;
```

Você escreve em Python:
```python
session.query(CategoriaModel).filter(CategoriaModel.Id == 1).first()
```

O ORM traduz Python → SQL automaticamente!

### O que é Injeção de Dependência?

Em vez de cada classe criar suas próprias dependências:

```python
# ❌ Ruim: acoplado, difícil de testar
class CreateCategoriaUseCase:
    def __init__(self):
        self._repo = SqlServerCategoriaRepository()  # Criou sozinho!
```

Nós **injetamos** as dependências de fora:

```python
# ✅ Bom: desacoplado, fácil de testar
class CreateCategoriaUseCase:
    def __init__(self, categoria_repository: ICategoriaRepository):
        self._repo = categoria_repository  # Recebeu de fora!
```

Assim, para testar, podemos injetar um repositório falso (mock) sem precisar do banco de dados!

### O que é DTO?

**DTO** = Data Transfer Object (Objeto de Transferência de Dados)

É uma classe simples que carrega dados entre camadas. Pense como um **envelope** 📨:

```
Cliente envia JSON → [CreateCategoriaDTO] → Use Case processa → [CategoriaDTO] → Cliente recebe JSON
```

- **DTO de entrada** (`CreateCategoriaDTO`): define quais dados o cliente precisa enviar
- **DTO de saída** (`CategoriaDTO`): define quais dados a API retorna

### O que são Decorators (@)?

Decorators são "funções que modificam outras funções". Exemplos nesse projeto:

| Decorator | O que faz |
|-----------|-----------|
| `@dataclass` | Gera `__init__`, `__repr__`, etc. automaticamente |
| `@abstractmethod` | Marca um método como obrigatório nas classes filhas |
| `@property` | Transforma um método em atributo de leitura |
| `@router.get("/")` | Registra uma função como handler de rota HTTP GET |
| `@router.post("")` | Registra como handler de POST |
| `@classmethod` | Método que pertence à classe, não à instância |

### O que é `__init__.py`?

O arquivo `__init__.py` é necessário para que o Python reconheça uma pasta como um **módulo/pacote**. Ele também serve para controlar o que é exportado:

```python
# src/domain/entities/__init__.py
from .categoria import Categoria      # Permite: from src.domain.entities import Categoria
from .produto import Produto          # Em vez de: from src.domain.entities.produto import Produto

__all__ = ["Categoria", "Produto"]    # Define o que é público
```

### O que são Status HTTP?

Códigos de status HTTP são números que indicam o resultado de uma requisição:

| Código | Nome | Significado |
|--------|------|-------------|
| `200` | OK | Tudo certo, dados retornados |
| `201` | Created | Recurso criado com sucesso |
| `204` | No Content | Sucesso, mas sem conteúdo para retornar |
| `400` | Bad Request | Dados inválidos enviados pelo cliente |
| `404` | Not Found | Recurso não encontrado |
| `500` | Internal Server Error | Erro inesperado no servidor |

---

## 🛠️ Tecnologias utilizadas

| Tecnologia | Versão | Papel na aplicação |
|------------|--------|-------------------|
| **Python** | 3.11+ | Linguagem de programação principal |
| **FastAPI** | 0.109 | Framework web para criar APIs REST com documentação automática |
| **Uvicorn** | 0.27 | Servidor ASGI que executa a aplicação FastAPI |
| **SQLAlchemy** | 2.0 | ORM que traduz operações Python em queries SQL |
| **PyODBC** | 5.0 | Driver ODBC para conectar ao SQL Server |
| **Pydantic** | 2.5 | Validação automática e serialização de dados JSON |
| **SQL Server** | — | Banco de dados relacional (hospedado na somee.com) |

---

## 🎨 Princípios de design aplicados

| Princípio | Sigla | Como é aplicado neste projeto |
|-----------|-------|-------------------------------|
| **Single Responsibility** | S (SOLID) | Cada classe tem uma única responsabilidade. Ex: `CreateCategoriaUseCase` só cria categoria |
| **Open/Closed** | O (SOLID) | Interfaces permitem extensão sem modificação. Adicionar PostgreSQL não muda o Use Case |
| **Liskov Substitution** | L (SOLID) | `SqlServerCategoriaRepository` pode ser substituído por qualquer `ICategoriaRepository` |
| **Interface Segregation** | I (SOLID) | `ICategoriaRepository` e `IProdutoRepository` são interfaces separadas e específicas |
| **Dependency Inversion** | D (SOLID) | Use Cases dependem de `ICategoriaRepository` (abstração), não de `SqlServerCategoriaRepository` (concreta) |
| **Repository Pattern** | — | Abstração completa do acesso a dados atrás de interfaces |
| **Use Case Pattern** | — | Lógica de negócio isolada em classes especializadas |
| **DTO Pattern** | — | Transferência de dados controlada entre camadas |
| **Factory Pattern** | — | Criação de objetos centralizada em `dependencies.py` |

---

## 🔄 Fluxo completo de uma requisição

Veja o que acontece quando você faz `POST /categorias` com `{"nome": "Games"}`:

```
1. 🌐 Cliente envia HTTP POST /categorias com body JSON
       │
       ▼
2. 🎮 FastAPI (app.py) recebe e encaminha para o router correto
       │
       ▼
3. 📋 Controller (categoria_controller.py)
       │  - FastAPI converte JSON → CreateCategoriaDTO automaticamente
       │  - Depends(get_db_session) abre uma sessão do banco
       │  - Cria o Use Case via factory
       │
       ▼
4. ⚙️ Use Case (CreateCategoriaUseCase.execute)
       │  - Verifica se já existe categoria com nome "Games"
       │  - Cria entidade Categoria (valida nome no __post_init__)
       │  - Chama repository.create()
       │
       ▼
5. 🔌 Repository (SqlServerCategoriaRepository.create)
       │  - Converte Entity → Model (Python → formato do banco)
       │  - session.add(model) → INSERT INTO Categorias ...
       │  - session.commit() → Confirma no banco
       │  - session.refresh(model) → Pega o ID gerado
       │  - Converte Model → Entity (banco → Python)
       │
       ▼
6. ⚙️ Use Case converte Entity → CategoriaDTO (resposta)
       │
       ▼
7. 📋 Controller retorna o DTO
       │
       ▼
8. 🌐 FastAPI converte DTO → JSON e envia resposta HTTP 201
       │
       ▼
9. 🎯 Cliente recebe: {"id": 1, "nome": "Games", "esta_ativa": true, ...}
```

---

## ⚠️ Possíveis erros e soluções

### ❌ Erro: "ODBC Driver Manager: Nome da fonte de dados não encontrado"

**Causa**: O driver ODBC não está instalado ou a versão é diferente da configurada.

**Solução**:
1. Verifique os drivers instalados:
```powershell
Get-OdbcDriver | Where-Object { $_.Name -like '*SQL Server*' } | Select-Object Name
```
2. Se tiver **Driver 17** em vez de **18** (ou vice-versa), altere no arquivo `src/infrastructure/database/config.py`:
```python
"DRIVER={ODBC Driver 17 for SQL Server};"  # Mude para a versão que você tem
```

### ❌ Erro: "Categoria com nome 'X' já existe"

**Causa**: Já existe uma categoria ativa com esse nome.

**Solução**: Use outro nome ou atualize a categoria existente com `PUT /categorias/{id}`.

### ❌ Erro: "Não é possível deletar a categoria. Existem X produto(s) ativo(s)"

**Causa**: A categoria tem produtos ativos vinculados.

**Solução**: Delete ou mova os produtos para outra categoria antes de deletar a categoria.

### ❌ Erro: "Categoria com ID X não encontrada" ao criar produto

**Causa**: O `categoria_id` informado não existe no banco.

**Solução**: Verifique as categorias disponíveis com `GET /categorias` e use um ID válido.

### ❌ Erro: "Connection refused" ou timeout

**Causa**: Servidor SQL Server pode estar indisponível ou sua internet instável.

**Solução**: Verifique sua conexão com a internet e tente novamente. O servidor somee.com é gratuito e pode ter instabilidades.

### ❌ Erro: "ModuleNotFoundError"

**Causa**: Dependências não instaladas ou ambiente virtual não ativado.

**Solução**:
```bash
# 1. Ative o ambiente virtual
.venv\Scripts\Activate.ps1

# 2. Instale as dependências
pip install -r requirements.txt
```

### ❌ Erro: "Internal Server Error" (500)

**Causa**: Pode ser erro de conexão com o banco, ou um bug no código.

**Solução**: Olhe o terminal onde o servidor está rodando — o erro completo aparece lá. Os erros mais comuns são problemas de conexão com o SQL Server.

---

## 📝 Próximos passos

Ideias para evoluir o projeto e continuar aprendendo:

- [ ] 🧪 Adicionar testes unitários com **pytest**
- [ ] 🔐 Implementar autenticação com **JWT** (JSON Web Tokens)
- [ ] 📄 Adicionar **paginação** nos endpoints de listagem
- [ ] 🐳 **Containerizar** com Docker
- [ ] 📊 Adicionar **logging** estruturado
- [ ] 🔄 Implementar **migrations** com Alembic
- [ ] 💾 Adicionar **cache** com Redis
- [ ] 📈 Adicionar métricas e **monitoramento**
- [ ] 🌐 Fazer **deploy** em cloud (Azure, AWS, etc.)
- [ ] 🤖 Integrar com um **chatbot** (LLM)

---

## 📝 Glossário rápido

| Termo | Significado |
|-------|-------------|
| **API** | Application Programming Interface — Interface de Programação de Aplicações |
| **REST** | Representational State Transfer — padrão arquitetural para APIs |
| **CRUD** | Create, Read, Update, Delete — as 4 operações básicas de dados |
| **ORM** | Object-Relational Mapping — traduz Python ↔ SQL |
| **DTO** | Data Transfer Object — transporta dados entre camadas |
| **Use Case** | Caso de Uso — uma ação que o usuário pode realizar |
| **Entity** | Entidade — objeto de negócio com regras e validações |
| **Repository** | Repositório — interface de acesso a dados |
| **Soft Delete** | Exclusão lógica — marca como excluído sem apagar do banco |
| **SOLID** | 5 princípios de design orientado a objetos |
| **DI** | Dependency Injection — injeção de dependências |
| **FK** | Foreign Key — chave estrangeira (relacionamento entre tabelas) |
| **PK** | Primary Key — chave primária (identificador único) |
| **ASGI** | Asynchronous Server Gateway Interface — protocolo do servidor |
| **CORS** | Cross-Origin Resource Sharing — permite acesso de outros domínios |
| **JSON** | JavaScript Object Notation — formato de dados leve |
| **HTTP** | HyperText Transfer Protocol — protocolo de comunicação da web |
| **Endpoint** | Ponto de acesso — uma URL específica da API |
| **Middleware** | Camada intermediária que processa requisições antes do controller |
| **Session** | Sessão — uma "conversa" temporária com o banco de dados |

---

<div align="center">

**Desenvolvido com ❤️ seguindo os princípios de Clean Architecture** 🏗️

**Python** 🐍 | **FastAPI** ⚡ | **SQL Server** 🗄️ | **SQLAlchemy** 🔌

*"A arquitetura é sobre intenção, não sobre frameworks."* — Robert C. Martin

</div>
