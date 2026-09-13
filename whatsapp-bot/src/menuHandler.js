const crud = require('./crudClient');
const { getSession, setState, resetSession } = require('./sessionManager');

// ── Textos fixos ──────────────────────────────────────────────────────────────

const MAIN_MENU = `🎮 *GeekDungeon Bot*
Olá! O que você deseja fazer?

📦 *CATEGORIAS*
1️⃣  Listar todas as categorias
2️⃣  Buscar categoria por ID
3️⃣  Criar nova categoria
4️⃣  Atualizar categoria
5️⃣  Deletar categoria

🛍️ *PRODUTOS*
6️⃣  Listar todos os produtos
7️⃣  Buscar produto por ID
8️⃣  Buscar produtos por nome
9️⃣  Criar novo produto
🔟  Atualizar produto
1️⃣1️⃣  Deletar produto
1️⃣2️⃣  Ajustar estoque
1️⃣3️⃣  Listar produtos por categoria

─────────────────────
Digite o *número* da opção desejada.
Para voltar ao menu a qualquer momento, envie *0* ou *menu*.`;

const CANCEL_KEYWORDS = ['0', 'menu', 'inicio', 'início', 'voltar', 'cancelar', 'cancel', 'sair'];

// ── Formatadores ──────────────────────────────────────────────────────────────

function formatCategoria(c) {
  const status = c.esta_ativa ? '✅ Ativa' : '❌ Inativa';
  const criada = new Date(c.data_criacao).toLocaleDateString('pt-BR');
  return `📦 *Categoria #${c.id}*\nNome: ${c.nome}\nStatus: ${status}\nCriada em: ${criada}`;
}

function formatCategoriaLinha(c) {
  const status = c.esta_ativa ? '✅' : '❌';
  return `${status} *${c.id}.* ${c.nome}`;
}

function formatProduto(p) {
  const preco = Number(p.preco_venda).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const estoque = p.tem_estoque ? `${p.quantidade_estoque} unid.` : `0 unid. ⚠️ Sem estoque`;
  const status = p.esta_ativo ? '✅ Ativo' : '❌ Inativo';
  const criado = new Date(p.data_criacao).toLocaleDateString('pt-BR');
  return (
    `🛍️ *Produto #${p.id}*\n` +
    `Nome: ${p.nome}\n` +
    (p.descricao ? `Descrição: ${p.descricao}\n` : '') +
    `Preço: ${preco}\n` +
    `Estoque: ${estoque}\n` +
    `Categoria ID: ${p.categoria_id}` +
    (p.categoria_nome ? ` (${p.categoria_nome})` : '') + `\n` +
    `Status: ${status}\n` +
    `Criado em: ${criado}`
  );
}

function formatProdutoLinha(p) {
  const preco = Number(p.preco_venda).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const estoqueIcon = p.tem_estoque ? '✅' : '⚠️';
  return `${estoqueIcon} *${p.id}.* ${p.nome} — ${preco} (Estoque: ${p.quantidade_estoque})`;
}

function errMsg(err) {
  const detail = err.response?.data?.detail;
  if (typeof detail === 'string') return `❌ Erro: ${detail}`;
  if (Array.isArray(detail)) {
    return `❌ Erro: ${detail.map((item) => item.msg || JSON.stringify(item)).join('; ')}`;
  }
  return `❌ Erro ao conectar com a API. Tente novamente.`;
}

const LIST_LIMIT = 40;

function formatLista(linhas) {
  if (linhas.length <= LIST_LIMIT) return linhas.join('\n');
  return `${linhas.slice(0, LIST_LIMIT).join('\n')}\n… e mais ${linhas.length - LIST_LIMIT}. Use busca por nome ou ID.`;
}

async function textoCategorias() {
  const cats = await crud.listCategorias();
  if (!cats.length) {
    return { ok: false, text: '📦 Nenhuma categoria cadastrada.\nCrie uma categoria primeiro (opção 3).' };
  }
  return { ok: true, cats, text: formatLista(cats.map(formatCategoriaLinha)) };
}

// ── Handler principal ─────────────────────────────────────────────────────────

/**
 * Processa uma mensagem recebida de um usuário e retorna a resposta a enviar.
 * @param {string} phone  - Número do remetente
 * @param {string} text   - Texto da mensagem
 * @returns {Promise<string>} - Texto de resposta
 */
async function processMessage(phone, text) {
  const input = text.trim();

  // Resposta ao "menu" / "0" a qualquer momento
  if (CANCEL_KEYWORDS.includes(input.toLowerCase())) {
    resetSession(phone);
    return MAIN_MENU;
  }

  const session = getSession(phone);

  switch (session.state) {
    case 'IDLE':
      setState(phone, 'MENU');
      return MAIN_MENU;

    case 'MENU':
      return await handleMenuChoice(phone, input);

    // ── Categorias ────────────────────────────────────────────────────────────
    case 'CAT_BUSCAR_ID':
      return await handleCatBuscarId(phone, input);

    case 'CAT_CRIAR_NOME':
      return await handleCatCriarNome(phone, input);

    case 'CAT_ATUALIZAR_ID':
      return await handleCatAtualizarId(phone, input);

    case 'CAT_ATUALIZAR_NOME':
      return await handleCatAtualizarNome(phone, input);

    case 'CAT_DELETAR_ID':
      return await handleCatDeletarId(phone, input);

    // ── Produtos ──────────────────────────────────────────────────────────────
    case 'PROD_BUSCAR_ID':
      return await handleProdBuscarId(phone, input);

    case 'PROD_BUSCAR_NOME':
      return await handleProdBuscarNome(phone, input);

    case 'PROD_CRIAR_NOME':
      return await handleProdCriarNome(phone, input);

    case 'PROD_CRIAR_DESC':
      return await handleProdCriarDesc(phone, input);

    case 'PROD_CRIAR_PRECO':
      return await handleProdCriarPreco(phone, input);

    case 'PROD_CRIAR_ESTOQUE':
      return await handleProdCriarEstoque(phone, input);

    case 'PROD_CRIAR_CATEGORIA':
      return await handleProdCriarCategoria(phone, input);

    case 'PROD_ATUALIZAR_ID':
      return await handleProdAtualizarId(phone, input);

    case 'PROD_ATUALIZAR_NOME':
      return await handleProdAtualizarNome(phone, input);

    case 'PROD_ATUALIZAR_DESC':
      return await handleProdAtualizarDesc(phone, input);

    case 'PROD_ATUALIZAR_PRECO':
      return await handleProdAtualizarPreco(phone, input);

    case 'PROD_ATUALIZAR_ESTOQUE':
      return await handleProdAtualizarEstoque(phone, input);

    case 'PROD_ATUALIZAR_CATEGORIA':
      return await handleProdAtualizarCategoria(phone, input);

    case 'PROD_DELETAR_ID':
      return await handleProdDeletarId(phone, input);

    case 'PROD_ESTOQUE_ID':
      return await handleProdEstoqueId(phone, input);

    case 'PROD_ESTOQUE_DELTA':
      return await handleProdEstoqueDelta(phone, input);

    case 'PROD_LISTAR_CAT':
      return await handleProdListarCat(phone, input);

    default:
      resetSession(phone);
      return MAIN_MENU;
  }
}

// ── Escolha do menu ───────────────────────────────────────────────────────────

async function handleMenuChoice(phone, input) {
  switch (input) {
    // ── 1. Listar categorias
    case '1': {
      try {
        const cats = await crud.listCategorias();
        if (!cats.length) {
          resetSession(phone);
          return '📦 Nenhuma categoria cadastrada.\n\nEnvie *menu* para voltar.';
        }
        const linhas = formatLista(cats.map(formatCategoriaLinha));
        resetSession(phone);
        return `📦 *Categorias* (${cats.length} encontrada${cats.length > 1 ? 's' : ''})\n\n${linhas}\n\nEnvie *menu* para voltar.`;
      } catch (err) {
        resetSession(phone);
        return errMsg(err);
      }
    }

    // ── 2. Buscar categoria por ID
    case '2':
      setState(phone, 'CAT_BUSCAR_ID');
      return '📦 *Buscar Categoria*\nDigite o *ID* da categoria:';

    // ── 3. Criar categoria
    case '3':
      setState(phone, 'CAT_CRIAR_NOME');
      return '📦 *Nova Categoria*\nDigite o *nome* da nova categoria:';

    // ── 4. Atualizar categoria
    case '4':
      setState(phone, 'CAT_ATUALIZAR_ID');
      return '📦 *Atualizar Categoria*\nDigite o *ID* da categoria que deseja atualizar:';

    // ── 5. Deletar categoria
    case '5':
      setState(phone, 'CAT_DELETAR_ID');
      return '📦 *Deletar Categoria*\nDigite o *ID* da categoria que deseja deletar:';

    // ── 6. Listar produtos
    case '6': {
      try {
        const prods = await crud.listProdutos();
        if (!prods.length) {
          resetSession(phone);
          return '🛍️ Nenhum produto cadastrado.\n\nEnvie *menu* para voltar.';
        }
        const linhas = formatLista(prods.map(formatProdutoLinha));
        resetSession(phone);
        return `🛍️ *Produtos* (${prods.length} encontrado${prods.length > 1 ? 's' : ''})\n\n${linhas}\n\nEnvie *menu* para voltar.`;
      } catch (err) {
        resetSession(phone);
        return errMsg(err);
      }
    }

    // ── 7. Buscar produto por ID
    case '7':
      setState(phone, 'PROD_BUSCAR_ID');
      return '🛍️ *Buscar Produto*\nDigite o *ID* do produto:';

    // ── 8. Buscar produto por nome
    case '8':
      setState(phone, 'PROD_BUSCAR_NOME');
      return '🛍️ *Buscar por Nome*\nDigite o *nome* (ou parte do nome) do produto:';

    // ── 9. Criar produto
    case '9': {
      try {
        const listed = await textoCategorias();
        if (!listed.ok) {
          resetSession(phone);
          return `${listed.text}\n\nEnvie *menu* para voltar.`;
        }
        setState(phone, 'PROD_CRIAR_NOME', { categoriasHint: listed.text });
        return '🛍️ *Novo Produto* (1/5)\nDigite o *nome* do produto:';
      } catch (err) {
        resetSession(phone);
        return errMsg(err);
      }
    }

    // ── 10. Atualizar produto
    case '10':
      setState(phone, 'PROD_ATUALIZAR_ID');
      return '🛍️ *Atualizar Produto*\nDigite o *ID* do produto que deseja atualizar:';

    // ── 11. Deletar produto
    case '11':
      setState(phone, 'PROD_DELETAR_ID');
      return '🛍️ *Deletar Produto*\nDigite o *ID* do produto que deseja deletar:';

    case '12':
      setState(phone, 'PROD_ESTOQUE_ID');
      return '📦 *Ajustar Estoque*\nDigite o *ID* do produto:';

    case '13': {
      try {
        const listed = await textoCategorias();
        if (!listed.ok) {
          resetSession(phone);
          return `${listed.text}\n\nEnvie *menu* para voltar.`;
        }
        setState(phone, 'PROD_LISTAR_CAT');
        return `🛍️ *Produtos por categoria*\nDigite o *ID* da categoria:\n\n${listed.text}`;
      } catch (err) {
        resetSession(phone);
        return errMsg(err);
      }
    }

    default:
      return `❓ Opção inválida. Escolha um número entre 1 e 13.\n\nEnvie *menu* para ver as opções.`;
  }
}

// ── Fluxos de Categoria ───────────────────────────────────────────────────────

async function handleCatBuscarId(phone, input) {
  const id = parseInt(input, 10);
  if (isNaN(id) || id <= 0) return '⚠️ ID inválido. Digite apenas o número:';
  try {
    const cat = await crud.getCategoriaById(id);
    resetSession(phone);
    return `${formatCategoria(cat)}\n\nEnvie *menu* para voltar.`;
  } catch (err) {
    resetSession(phone);
    return errMsg(err);
  }
}

async function handleCatCriarNome(phone, input) {
  if (!input) return '⚠️ Nome não pode estar vazio. Digite o nome da categoria:';
  try {
    const cat = await crud.createCategoria(input);
    resetSession(phone);
    return `✅ *Categoria criada com sucesso!*\n\n${formatCategoria(cat)}\n\nEnvie *menu* para voltar.`;
  } catch (err) {
    return `${errMsg(err)}\n\nDigite outro nome, ou *menu* para cancelar.`;
  }
}

async function handleCatAtualizarId(phone, input) {
  const id = parseInt(input, 10);
  if (isNaN(id) || id <= 0) return '⚠️ ID inválido. Digite apenas o número:';
  try {
    const cat = await crud.getCategoriaById(id);
    setState(phone, 'CAT_ATUALIZAR_NOME', { id: cat.id, nomeAtual: cat.nome });
    return `📦 *Categoria encontrada:*\n${formatCategoria(cat)}\n\nDigite o *novo nome* para esta categoria:`;
  } catch (err) {
    resetSession(phone);
    return errMsg(err);
  }
}

async function handleCatAtualizarNome(phone, input) {
  if (!input) return '⚠️ Nome não pode estar vazio. Digite o novo nome:';
  const { id } = getSession(phone).data;
  try {
    const cat = await crud.updateCategoria(id, input);
    resetSession(phone);
    return `✅ *Categoria atualizada com sucesso!*\n\n${formatCategoria(cat)}\n\nEnvie *menu* para voltar.`;
  } catch (err) {
    resetSession(phone);
    return errMsg(err);
  }
}

async function handleCatDeletarId(phone, input) {
  const id = parseInt(input, 10);
  if (isNaN(id) || id <= 0) return '⚠️ ID inválido. Digite apenas o número:';
  try {
    await crud.deleteCategoria(id);
    resetSession(phone);
    return `✅ Categoria #${id} deletada com sucesso!\n\nEnvie *menu* para voltar.`;
  } catch (err) {
    resetSession(phone);
    return errMsg(err);
  }
}

// ── Fluxos de Produto ─────────────────────────────────────────────────────────

async function handleProdBuscarId(phone, input) {
  const id = parseInt(input, 10);
  if (isNaN(id) || id <= 0) return '⚠️ ID inválido. Digite apenas o número:';
  try {
    const prod = await crud.getProdutoById(id);
    resetSession(phone);
    return `${formatProduto(prod)}\n\nEnvie *menu* para voltar.`;
  } catch (err) {
    resetSession(phone);
    return errMsg(err);
  }
}

async function handleProdBuscarNome(phone, input) {
  if (!input) return '⚠️ Digite o nome ou parte do nome do produto:';
  try {
    const prods = await crud.listProdutos({ nome: input });
    if (!prods.length) {
      resetSession(phone);
      return `🛍️ Nenhum produto encontrado com "${input}".\n\nEnvie *menu* para voltar.`;
    }
    const linhas = formatLista(prods.map(formatProdutoLinha));
    resetSession(phone);
    return `🛍️ *Resultado para "${input}"* (${prods.length})\n\n${linhas}\n\nEnvie *menu* para voltar.`;
  } catch (err) {
    resetSession(phone);
    return errMsg(err);
  }
}

// ── Criar produto (fluxo de 5 passos) ────────────────────────────────────────

async function handleProdCriarNome(phone, input) {
  if (!input) return '⚠️ Nome não pode estar vazio. Digite o nome do produto:';
  setState(phone, 'PROD_CRIAR_DESC', { nome: input });
  return '🛍️ *Novo Produto* (2/5)\nDigite a *descrição* do produto\n_(ou envie *-* para deixar sem descrição)_:';
}

async function handleProdCriarDesc(phone, input) {
  const descricao = input === '-' ? null : input;
  setState(phone, 'PROD_CRIAR_PRECO', { descricao });
  return '🛍️ *Novo Produto* (3/5)\nDigite o *preço de venda* (ex: 49.90):';
}

async function handleProdCriarPreco(phone, input) {
  const preco = parseFloat(input.replace(',', '.'));
  if (isNaN(preco) || preco < 0) return '⚠️ Preço inválido. Use o formato numérico (ex: 49.90):';
  setState(phone, 'PROD_CRIAR_ESTOQUE', { preco_venda: preco });
  return '🛍️ *Novo Produto* (4/5)\nDigite a *quantidade em estoque* (número inteiro):';
}

async function handleProdCriarEstoque(phone, input) {
  const estoque = parseInt(input, 10);
  if (isNaN(estoque) || estoque < 0) return '⚠️ Quantidade inválida. Digite um número inteiro >= 0:';
  const session = getSession(phone);
  let catsText = session.data.categoriasHint;
  if (!catsText) {
    try {
      catsText = (await textoCategorias()).text;
    } catch (err) {
      catsText = '(Não foi possível listar as categorias agora)';
    }
  }
  setState(phone, 'PROD_CRIAR_CATEGORIA', { quantidade_estoque: estoque });
  return `🛍️ *Novo Produto* (5/5)\nDigite o *ID da categoria*:\n\n${catsText}`;
}

async function handleProdCriarCategoria(phone, input) {
  const categoriaId = parseInt(input, 10);
  if (isNaN(categoriaId) || categoriaId <= 0) return '⚠️ ID inválido. Digite apenas o número da categoria:';
  const { nome, descricao, preco_venda, quantidade_estoque } = getSession(phone).data;
  try {
    const prod = await crud.createProduto({
      nome,
      descricao,
      preco_venda,
      quantidade_estoque,
      categoria_id: categoriaId,
    });
    resetSession(phone);
    return `✅ *Produto criado com sucesso!*\n\n${formatProduto(prod)}\n\nEnvie *menu* para voltar.`;
  } catch (err) {
    return `${errMsg(err)}\n\nDigite outro *ID de categoria*, ou *menu* para cancelar.`;
  }
}

// ── Atualizar produto (fluxo: ID → campos com "." para manter) ────────────────

async function handleProdAtualizarId(phone, input) {
  const id = parseInt(input, 10);
  if (isNaN(id) || id <= 0) return '⚠️ ID inválido. Digite apenas o número:';
  try {
    const prod = await crud.getProdutoById(id);
    setState(phone, 'PROD_ATUALIZAR_NOME', {
      id: prod.id,
      atual: prod,
      updates: {},
    });
    return (
      `🛍️ *Produto encontrado:*\n${formatProduto(prod)}\n\n` +
      `Vamos atualizar campo a campo.\n` +
      `_(Envie *-* para manter o valor atual de cada campo)_\n\n` +
      `🛍️ *Atualizar* (1/5) — Nome atual: *${prod.nome}*\nNovo nome:`
    );
  } catch (err) {
    resetSession(phone);
    return errMsg(err);
  }
}

async function handleProdAtualizarNome(phone, input) {
  const session = getSession(phone);
  const updates = { ...session.data.updates };
  if (input !== '-') updates.nome = input;
  setState(phone, 'PROD_ATUALIZAR_DESC', { updates });
  const descAtual = session.data.atual?.descricao || '(sem descrição)';
  return `🛍️ *Atualizar* (2/5) — Descrição atual: *${descAtual}*\nNova descrição _(ou *-* para manter)_:`;
}

async function handleProdAtualizarDesc(phone, input) {
  const session = getSession(phone);
  const updates = { ...session.data.updates };
  if (input !== '-') updates.descricao = input === '.' ? null : input;
  setState(phone, 'PROD_ATUALIZAR_PRECO', { updates });
  const precoAtual = Number(session.data.atual?.preco_venda).toLocaleString('pt-BR', {
    style: 'currency', currency: 'BRL',
  });
  return `🛍️ *Atualizar* (3/5) — Preço atual: *${precoAtual}*\nNovo preço _(ex: 59.90 ou *-* para manter)_:`;
}

async function handleProdAtualizarPreco(phone, input) {
  const session = getSession(phone);
  const updates = { ...session.data.updates };
  if (input !== '-') {
    const preco = parseFloat(input.replace(',', '.'));
    if (isNaN(preco) || preco < 0) return '⚠️ Preço inválido. Use o formato numérico (ex: 59.90) ou *-* para manter:';
    updates.preco_venda = preco;
  }
  setState(phone, 'PROD_ATUALIZAR_ESTOQUE', { updates });
  const estoqueAtual = session.data.atual?.quantidade_estoque;
  return `🛍️ *Atualizar* (4/5) — Estoque atual: *${estoqueAtual}*\nNovo estoque _(número inteiro ou *-* para manter)_:`;
}

async function handleProdAtualizarEstoque(phone, input) {
  const session = getSession(phone);
  const updates = { ...session.data.updates };
  if (input !== '-') {
    const estoque = parseInt(input, 10);
    if (isNaN(estoque) || estoque < 0) return '⚠️ Quantidade inválida. Digite um inteiro >= 0 ou *-* para manter:';
    updates.quantidade_estoque = estoque;
  }
  setState(phone, 'PROD_ATUALIZAR_CATEGORIA', { updates });
  const catAtual = session.data.atual?.categoria_id;
  const catNome = session.data.atual?.categoria_nome;
  let catsText = '';
  try {
    catsText = `\n\n${(await textoCategorias()).text}`;
  } catch {
    catsText = '';
  }
  return `🛍️ *Atualizar* (5/5) — Categoria atual: *${catAtual}${catNome ? ` (${catNome})` : ''}*\nNovo ID de categoria _(ou *-* para manter)_:${catsText}`;
}

async function handleProdAtualizarCategoria(phone, input) {
  const session = getSession(phone);
  const updates = { ...session.data.updates };
  if (input !== '-') {
    const catId = parseInt(input, 10);
    if (isNaN(catId) || catId <= 0) return '⚠️ ID inválido. Digite apenas o número ou *-* para manter:';
    updates.categoria_id = catId;
  }
  if (!Object.keys(updates).length) {
    resetSession(phone);
    return 'ℹ️ Nenhum campo foi alterado.\n\nEnvie *menu* para voltar.';
  }
  const { id } = session.data;
  try {
    const prod = await crud.updateProduto(id, updates);
    resetSession(phone);
    return `✅ *Produto atualizado com sucesso!*\n\n${formatProduto(prod)}\n\nEnvie *menu* para voltar.`;
  } catch (err) {
    return `${errMsg(err)}\n\nDigite outro ID de categoria, *-* para manter, ou *menu* para cancelar.`;
  }
}

async function handleProdDeletarId(phone, input) {
  const id = parseInt(input, 10);
  if (isNaN(id) || id <= 0) return '⚠️ ID inválido. Digite apenas o número:';
  try {
    await crud.deleteProduto(id);
    resetSession(phone);
    return `✅ Produto #${id} deletado com sucesso!\n\nEnvie *menu* para voltar.`;
  } catch (err) {
    resetSession(phone);
    return errMsg(err);
  }
}

async function handleProdEstoqueId(phone, input) {
  const id = parseInt(input, 10);
  if (isNaN(id) || id <= 0) return '⚠️ ID inválido. Digite apenas o número:';
  try {
    const prod = await crud.getProdutoById(id);
    setState(phone, 'PROD_ESTOQUE_DELTA', { id: prod.id, atual: prod });
    return (
      `${formatProduto(prod)}\n\n` +
      `📦 Estoque atual: *${prod.quantidade_estoque}*\n` +
      `Digite a quantidade com sinal, por exemplo *+5* (entrada) ou *-2* (saída):`
    );
  } catch (err) {
    resetSession(phone);
    return errMsg(err);
  }
}

async function handleProdEstoqueDelta(phone, input) {
  const cleaned = String(input).trim().replace(/\s/g, '').replace(',', '.');
  if (!/^[+-]?\d+$/.test(cleaned)) {
    return '⚠️ Use um número inteiro com sinal, por exemplo *+5* ou *-2*:';
  }
  const delta = parseInt(cleaned, 10);
  if (!delta) return '⚠️ Informe uma quantidade diferente de zero:';
  const { id } = getSession(phone).data;
  try {
    const prod = await crud.ajustarEstoque(id, delta);
    resetSession(phone);
    return `✅ *Estoque atualizado!*\n\n${formatProduto(prod)}\n\nEnvie *menu* para voltar.`;
  } catch (err) {
    return `${errMsg(err)}\n\nDigite outra quantidade, ou *menu* para cancelar.`;
  }
}

async function handleProdListarCat(phone, input) {
  const id = parseInt(input, 10);
  if (isNaN(id) || id <= 0) return '⚠️ ID inválido. Digite apenas o número da categoria:';
  try {
    const prods = await crud.listProdutos({ categoria_id: id });
    resetSession(phone);
    if (!prods.length) {
      return `🛍️ Nenhum produto ativo na categoria #${id}.\n\nEnvie *menu* para voltar.`;
    }
    const linhas = formatLista(prods.map(formatProdutoLinha));
    return `🛍️ *Produtos da categoria #${id}* (${prods.length})\n\n${linhas}\n\nEnvie *menu* para voltar.`;
  } catch (err) {
    resetSession(phone);
    return errMsg(err);
  }
}

module.exports = { processMessage };
