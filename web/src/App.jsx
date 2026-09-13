import { useEffect, useMemo, useState } from "react";
import { api, getApiBase, setApiBase, isMixedContent } from "./api";

function parsePositiveInt(value) {
  const parsed = Number(String(value).trim());
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

function formatMoney(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR");
}

function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className={`toast ${toast.type || ""}`} onClick={onClose}>
      {toast.message}
    </div>
  );
}

const emptyProduct = {
  nome: "",
  descricao: "",
  preco_venda: "",
  quantidade_estoque: "",
  categoria_id: "",
};

export default function App() {
  const [tab, setTab] = useState("produtos");
  const [apiUrl, setApiUrl] = useState(getApiBase() || "http://localhost:8000");
  const [apiOk, setApiOk] = useState(null);
  const [toast, setToast] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [categoriasView, setCategoriasView] = useState(null);
  const [produtosView, setProdutosView] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categoriaForm, setCategoriaForm] = useState({ id: null, nome: "" });
  const [produtoForm, setProdutoForm] = useState(emptyProduct);
  const [produtoEditId, setProdutoEditId] = useState(null);
  const [buscaCategoriaId, setBuscaCategoriaId] = useState("");
  const [buscaProdutoId, setBuscaProdutoId] = useState("");
  const [buscaProdutoNome, setBuscaProdutoNome] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");

  const notify = (message, type = "") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 4200);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [cats, prods, health] = await Promise.all([
        api.listCategorias(),
        api.listProdutos(),
        api.health().catch(() => null),
      ]);
      setCategorias(cats);
      setProdutos(prods);
      setCategoriasView(null);
      setProdutosView(null);
      setFiltroCategoria("");
      setBuscaCategoriaId("");
      setBuscaProdutoId("");
      setBuscaProdutoNome("");
      setApiOk(Boolean(health) || Array.isArray(cats));
    } catch (error) {
      setApiOk(false);
      notify(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const saveApi = async () => {
    setApiBase(apiUrl);
    notify("URL da API salva. Recarregando dados...");
    await loadAll();
  };

  const categoriasTabela = categoriasView ?? categorias;
  const produtosTabela = produtosView ?? produtos;

  const stats = useMemo(() => {
    const semEstoque = produtos.filter((item) => !item.tem_estoque).length;
    return {
      categorias: categorias.length,
      produtos: produtos.length,
      comEstoque: produtos.filter((item) => item.tem_estoque).length,
      semEstoque,
    };
  }, [categorias, produtos]);

  const submitCategoria = async (event) => {
    event.preventDefault();
    const nome = categoriaForm.nome.trim();
    if (!nome) {
      notify("Informe o nome da categoria.", "error");
      return;
    }
    try {
      if (categoriaForm.id) {
        await api.updateCategoria(categoriaForm.id, nome);
        notify("Categoria atualizada.");
      } else {
        await api.createCategoria(nome);
        notify("Categoria criada.");
      }
      setCategoriaForm({ id: null, nome: "" });
      await loadAll();
    } catch (error) {
      notify(error.message, "error");
    }
  };

  const submitProduto = async (event) => {
    event.preventDefault();
    if (!produtoForm.nome.trim()) {
      notify("Informe o nome do produto.", "error");
      return;
    }
    const preco = Number(String(produtoForm.preco_venda).replace(",", "."));
    const estoque = Number(produtoForm.quantidade_estoque);
    if (Number.isNaN(preco) || preco < 0) {
      notify("Informe um preço válido.", "error");
      return;
    }
    if (!Number.isInteger(estoque) || estoque < 0) {
      notify("Informe um estoque inteiro maior ou igual a zero.", "error");
      return;
    }
    const payload = {
      nome: produtoForm.nome.trim(),
      descricao: produtoForm.descricao.trim() || null,
      preco_venda: preco,
      quantidade_estoque: estoque,
      categoria_id: Number(produtoForm.categoria_id),
    };
    try {
      if (produtoEditId) {
        await api.updateProduto(produtoEditId, payload);
        notify("Produto atualizado.");
      } else {
        await api.createProduto(payload);
        notify("Produto criado.");
      }
      setProdutoForm(emptyProduct);
      setProdutoEditId(null);
      await loadAll();
    } catch (error) {
      notify(error.message, "error");
    }
  };

  const buscarCategoriaPorId = async () => {
    const id = parsePositiveInt(buscaCategoriaId);
    if (!id) {
      notify("Informe um ID numérico válido.", "error");
      return;
    }
    try {
      const categoria = await api.getCategoria(id);
      setCategoriasView([categoria]);
      notify(`Categoria #${categoria.id} encontrada.`);
    } catch (error) {
      notify(error.message, "error");
    }
  };

  const buscarProdutoPorId = async () => {
    const id = parsePositiveInt(buscaProdutoId);
    if (!id) {
      notify("Informe um ID numérico válido.", "error");
      return;
    }
    try {
      const produto = await api.getProduto(id);
      setProdutosView([produto]);
      setFiltroCategoria("");
      notify(`Produto #${produto.id} encontrado.`);
    } catch (error) {
      notify(error.message, "error");
    }
  };

  const aplicarFiltrosProdutos = async ({ nome, categoriaId, avisar = false } = {}) => {
    const termo = (nome ?? buscaProdutoNome).trim();
    const categoria = categoriaId ?? filtroCategoria;
    if (!termo && !categoria) {
      setProdutosView(null);
      return;
    }
    try {
      const lista = await api.listProdutos({
        ...(termo ? { nome: termo } : {}),
        ...(categoria ? { categoria_id: categoria } : {}),
      });
      setProdutosView(lista);
      if (avisar) notify(`${lista.length} produto(s) encontrado(s).`);
    } catch (error) {
      notify(error.message, "error");
    }
  };

  const buscarProdutoPorNome = async () => {
    if (!buscaProdutoNome.trim() && !filtroCategoria) {
      notify("Informe um nome ou escolha uma categoria.", "error");
      return;
    }
    await aplicarFiltrosProdutos({ avisar: true });
  };

  const filtrarPorCategoria = async (categoriaId) => {
    setFiltroCategoria(categoriaId);
    await aplicarFiltrosProdutos({ categoriaId, avisar: false });
  };

  const ajustarEstoque = async (produto, delta) => {
    try {
      const atualizado = await api.ajustarEstoque(produto.id, delta);
      setProdutos((atual) => atual.map((item) => (item.id === atualizado.id ? atualizado : item)));
      setProdutosView((atual) =>
        atual ? atual.map((item) => (item.id === atualizado.id ? atualizado : item)) : atual
      );
      notify(`Estoque de ${atualizado.nome}: ${atualizado.quantidade_estoque} unid.`);
    } catch (error) {
      notify(error.message, "error");
    }
  };

  return (
    <div className="app">
      <header className="hero">
        <div className="brand">
          <div className="crest" aria-hidden="true">
            🏰
          </div>
          <div>
            <h1>GeekDungeon</h1>
            <p>Painel web de estoque — as mesmas operações do chatbot no WhatsApp.</p>
          </div>
        </div>
        <div className="api-box">
          <label htmlFor="api-url">API FastAPI</label>
          <div className="api-row">
            <input
              id="api-url"
              value={apiUrl}
              onChange={(event) => setApiUrl(event.target.value)}
              placeholder="http://localhost:8000"
            />
            <button className="btn" type="button" onClick={saveApi}>
              Salvar
            </button>
          </div>
          <div className="status">
            <span className={`dot ${apiOk ? "ok" : apiOk === false ? "bad" : ""}`} />
            {apiOk
              ? "API conectada"
              : apiOk === false
                ? "API offline — no site do Firebase use a URL local só neste PC, com a API ligada"
                : "Verificando API..."}
          </div>
          {isMixedContent(apiUrl) ? (
            <div className="status warn">O Firebase é HTTPS: a API precisa de URL https para funcionar daqui.</div>
          ) : null}
        </div>
      </header>

      <section className="stats">
        <article className="stat">
          <span>Categorias</span>
          <strong>{stats.categorias}</strong>
        </article>
        <article className="stat">
          <span>Produtos</span>
          <strong>{stats.produtos}</strong>
        </article>
        <article className="stat">
          <span>Com estoque</span>
          <strong>{stats.comEstoque}</strong>
        </article>
        <article className="stat">
          <span>Sem estoque</span>
          <strong>{stats.semEstoque}</strong>
        </article>
      </section>

      <nav className="tabs">
        <button className={`tab ${tab === "categorias" ? "active" : ""}`} onClick={() => setTab("categorias")}>
          Categorias
        </button>
        <button className={`tab ${tab === "produtos" ? "active" : ""}`} onClick={() => setTab("produtos")}>
          Produtos
        </button>
        <button className="btn secondary" type="button" onClick={loadAll} disabled={loading}>
          {loading ? "Atualizando..." : "Atualizar listas"}
        </button>
      </nav>

      {tab === "categorias" ? (
        <div className="grid">
          <form className="card form" onSubmit={submitCategoria}>
            <h2>{categoriaForm.id ? `Atualizar categoria #${categoriaForm.id}` : "Nova categoria"}</h2>
            <input
              required
              maxLength={100}
              placeholder="Nome da categoria"
              value={categoriaForm.nome}
              onChange={(event) => setCategoriaForm({ ...categoriaForm, nome: event.target.value })}
            />
            <div className="form-actions">
              <button className="btn" type="submit">
                {categoriaForm.id ? "Salvar alteração" : "Criar categoria"}
              </button>
              {categoriaForm.id ? (
                <button
                  className="btn secondary"
                  type="button"
                  onClick={() => setCategoriaForm({ id: null, nome: "" })}
                >
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>

          <section className="card">
            <h2>Listar / buscar</h2>
            <div className="toolbar">
              <input
                placeholder="Buscar por ID"
                value={buscaCategoriaId}
                onChange={(event) => setBuscaCategoriaId(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && buscarCategoriaPorId()}
              />
              <button className="btn secondary" type="button" onClick={buscarCategoriaPorId}>
                Buscar ID
              </button>
              <button className="btn secondary" type="button" onClick={loadAll}>
                Listar todas
              </button>
            </div>
            <div className="table-wrap">
              {categoriasTabela.length === 0 ? (
                <div className="empty">
                  {categoriasView ? "Nenhuma categoria encontrada com esse ID." : "Nenhuma categoria cadastrada."}
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nome</th>
                      <th>Status</th>
                      <th>Criada</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoriasTabela.map((categoria) => (
                      <tr key={categoria.id}>
                        <td>{categoria.id}</td>
                        <td>{categoria.nome}</td>
                        <td>
                          <span className={`badge ${categoria.esta_ativa ? "ok" : "muted"}`}>
                            {categoria.esta_ativa ? "Ativa" : "Inativa"}
                          </span>
                        </td>
                        <td>{formatDate(categoria.data_criacao)}</td>
                        <td>
                          <div className="row-actions">
                            <button
                              className="btn secondary"
                              type="button"
                              onClick={() => {
                                setCategoriaForm({ id: categoria.id, nome: categoria.nome });
                                setTab("categorias");
                              }}
                            >
                              Editar
                            </button>
                            <button
                              className="btn danger"
                              type="button"
                              onClick={async () => {
                                if (!window.confirm(`Ocultar categoria #${categoria.id} do estoque?`)) return;
                                try {
                                  await api.deleteCategoria(categoria.id);
                                  notify("Categoria ocultada (soft delete).");
                                  await loadAll();
                                } catch (error) {
                                  notify(error.message, "error");
                                }
                              }}
                            >
                              Deletar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      ) : (
        <div className="grid">
          <form className="card form" onSubmit={submitProduto}>
            <h2>{produtoEditId ? `Atualizar produto #${produtoEditId}` : "Novo produto"}</h2>
            {categorias.length === 0 ? (
              <p className="empty">Crie uma categoria antes de cadastrar produtos.</p>
            ) : null}
            <input
              required
              maxLength={200}
              placeholder="Nome"
              value={produtoForm.nome}
              onChange={(event) => setProdutoForm({ ...produtoForm, nome: event.target.value })}
            />
            <textarea
              rows="3"
              maxLength={1000}
              placeholder="Descrição (opcional)"
              value={produtoForm.descricao}
              onChange={(event) => setProdutoForm({ ...produtoForm, descricao: event.target.value })}
            />
            <input
              required
              placeholder="Preço de venda, ex: 49.90"
              value={produtoForm.preco_venda}
              onChange={(event) => setProdutoForm({ ...produtoForm, preco_venda: event.target.value })}
            />
            <input
              required
              type="number"
              min="0"
              placeholder="Quantidade em estoque"
              value={produtoForm.quantidade_estoque}
              onChange={(event) =>
                setProdutoForm({ ...produtoForm, quantidade_estoque: event.target.value })
              }
            />
            <select
              required
              value={produtoForm.categoria_id}
              onChange={(event) => setProdutoForm({ ...produtoForm, categoria_id: event.target.value })}
            >
              <option value="">Categoria</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.id}. {categoria.nome}
                </option>
              ))}
            </select>
            <div className="form-actions">
              <button className="btn" type="submit" disabled={categorias.length === 0}>
                {produtoEditId ? "Salvar alteração" : "Criar produto"}
              </button>
              {produtoEditId ? (
                <button
                  className="btn secondary"
                  type="button"
                  onClick={() => {
                    setProdutoEditId(null);
                    setProdutoForm(emptyProduct);
                  }}
                >
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>

          <section className="card">
            <h2>Listar / buscar</h2>
            <div className="toolbar">
              <input
                placeholder="Buscar por ID"
                value={buscaProdutoId}
                onChange={(event) => setBuscaProdutoId(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && buscarProdutoPorId()}
              />
              <button className="btn secondary" type="button" onClick={buscarProdutoPorId}>
                ID
              </button>
              <input
                placeholder="Buscar por nome"
                value={buscaProdutoNome}
                onChange={(event) => setBuscaProdutoNome(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && buscarProdutoPorNome()}
              />
              <button className="btn secondary" type="button" onClick={buscarProdutoPorNome}>
                Nome
              </button>
              <select value={filtroCategoria} onChange={(event) => filtrarPorCategoria(event.target.value)}>
                <option value="">Todas as categorias</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
              <button className="btn secondary" type="button" onClick={loadAll}>
                Listar todos
              </button>
            </div>
            {produtosView ? (
              <p className="hint">
                Exibindo resultado filtrado ({produtosTabela.length}). Use &quot;Listar todos&quot; para voltar à lista completa.
              </p>
            ) : null}
            <div className="table-wrap">
              {produtosTabela.length === 0 ? (
                <div className="empty">
                  {produtosView ? "Nenhum produto encontrado com esse filtro." : "Nenhum produto cadastrado."}
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Produto</th>
                      <th>Preço</th>
                      <th>Estoque</th>
                      <th>Categoria</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtosTabela.map((produto) => (
                      <tr key={produto.id}>
                        <td>{produto.id}</td>
                        <td>
                          <strong>{produto.nome}</strong>
                          <div style={{ color: "#b7a8c9", fontSize: 12 }}>
                            {produto.descricao || "Sem descrição"}
                          </div>
                        </td>
                        <td>{formatMoney(produto.preco_venda)}</td>
                        <td>
                          <div className="row-actions">
                            <button
                              className="btn secondary"
                              type="button"
                              onClick={() => ajustarEstoque(produto, -1)}
                              disabled={produto.quantidade_estoque <= 0}
                            >
                              −
                            </button>
                            <span className={`badge ${produto.tem_estoque ? "ok" : "warn"}`}>
                              {produto.quantidade_estoque}
                            </span>
                            <button className="btn secondary" type="button" onClick={() => ajustarEstoque(produto, 1)}>
                              +
                            </button>
                          </div>
                        </td>
                        <td>{produto.categoria_nome || `#${produto.categoria_id}`}</td>
                        <td>
                          <div className="row-actions">
                            <button
                              className="btn secondary"
                              type="button"
                              onClick={() => {
                                setProdutoEditId(produto.id);
                                setProdutoForm({
                                  nome: produto.nome,
                                  descricao: produto.descricao || "",
                                  preco_venda: produto.preco_venda,
                                  quantidade_estoque: produto.quantidade_estoque,
                                  categoria_id: String(produto.categoria_id),
                                });
                              }}
                            >
                              Editar
                            </button>
                            <button
                              className="btn danger"
                              type="button"
                              onClick={async () => {
                                if (!window.confirm(`Ocultar produto #${produto.id} do estoque?`)) return;
                                try {
                                  await api.deleteProduto(produto.id);
                                  notify("Produto ocultado (soft delete).");
                                  await loadAll();
                                } catch (error) {
                                  notify(error.message, "error");
                                }
                              }}
                            >
                              Deletar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      )}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
