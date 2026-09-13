const axios = require('axios');
const { PYTHON_API_URL } = require('./config');

const api = axios.create({
  baseURL: PYTHON_API_URL,
  timeout: 10000,
});

// ── Categorias ────────────────────────────────────────────────────────────────

const listCategorias = (includeDeleted = false) =>
  api.get('/categorias', { params: { include_deleted: includeDeleted } }).then((r) => r.data);

const getCategoriaById = (id) =>
  api.get(`/categorias/${id}`).then((r) => r.data);

const createCategoria = (nome) =>
  api.post('/categorias', { nome }).then((r) => r.data);

const updateCategoria = (id, nome) =>
  api.put(`/categorias/${id}`, { nome }).then((r) => r.data);

const deleteCategoria = (id) =>
  api.delete(`/categorias/${id}`).then((r) => r.status);

// ── Produtos ──────────────────────────────────────────────────────────────────

const listProdutos = (params = {}) =>
  api.get('/produtos', { params }).then((r) => r.data);

const getProdutoById = (id) =>
  api.get(`/produtos/${id}`).then((r) => r.data);

const createProduto = (data) =>
  api.post('/produtos', data).then((r) => r.data);

const updateProduto = (id, data) =>
  api.put(`/produtos/${id}`, data).then((r) => r.data);

const deleteProduto = (id) =>
  api.delete(`/produtos/${id}`).then((r) => r.status);

const ajustarEstoque = (id, delta) =>
  api.post(`/produtos/${id}/estoque`, { delta }).then((r) => r.data);

module.exports = {
  listCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  listProdutos,
  getProdutoById,
  createProduto,
  updateProduto,
  deleteProduto,
  ajustarEstoque,
};
