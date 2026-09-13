const STORAGE_KEY = "GEEKDUNGEON_API_URL";

export function getApiBase() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored) return stored.replace(/\/$/, "");
  const fromEnv = import.meta.env.VITE_API_URL;
  if (fromEnv) return String(fromEnv).replace(/\/$/, "");
  if (import.meta.env.DEV) return "";
  return "http://localhost:8000";
}

export function setApiBase(url) {
  const normalized = String(url || "").trim().replace(/\/$/, "");
  if (normalized) window.localStorage.setItem(STORAGE_KEY, normalized);
  else window.localStorage.removeItem(STORAGE_KEY);
}

export function isMixedContent(apiBase) {
  return window.location.protocol === "https:" && apiBase.startsWith("http://");
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  const response = await fetch(`${getApiBase()}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = payload?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((item) => item.msg || JSON.stringify(item)).join("; ")
          : `Erro ${response.status} ao falar com a API`;
    throw new Error(message);
  }
  return payload;
}

export const api = {
  health: () => request("/health"),
  listCategorias: (includeDeleted = false) =>
    request(`/categorias?include_deleted=${includeDeleted}`),
  getCategoria: (id) => request(`/categorias/${id}`),
  createCategoria: (nome) =>
    request("/categorias", {
      method: "POST",
      body: JSON.stringify({ nome }),
    }),
  updateCategoria: (id, nome) =>
    request(`/categorias/${id}`, {
      method: "PUT",
      body: JSON.stringify({ nome }),
    }),
  deleteCategoria: (id) =>
    request(`/categorias/${id}`, { method: "DELETE" }),
  listProdutos: (params = {}) => {
    const query = new URLSearchParams();
    if (params.nome) query.set("nome", params.nome);
    if (params.categoria_id) query.set("categoria_id", params.categoria_id);
    if (params.include_deleted) query.set("include_deleted", "true");
    const suffix = query.toString() ? `?${query}` : "";
    return request(`/produtos${suffix}`);
  },
  getProduto: (id) => request(`/produtos/${id}`),
  createProduto: (data) =>
    request("/produtos", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateProduto: (id, data) =>
    request(`/produtos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteProduto: (id) => request(`/produtos/${id}`, { method: "DELETE" }),
  ajustarEstoque: (id, delta) =>
    request(`/produtos/${id}/estoque`, {
      method: "POST",
      body: JSON.stringify({ delta }),
    }),
};
