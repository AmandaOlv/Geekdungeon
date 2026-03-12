/**
 * Gerenciamento de sessões de conversa em memória.
 * Cada sessão é identificada pelo número de telefone do usuário.
 */

const sessions = new Map();

/**
 * Retorna a sessão de um usuário. Cria uma nova se não existir.
 * @param {string} phone
 * @returns {{ state: string, data: object }}
 */
function getSession(phone) {
  if (!sessions.has(phone)) {
    sessions.set(phone, { state: 'IDLE', data: {} });
  }
  return sessions.get(phone);
}

/**
 * Atualiza o estado e os dados temporários de uma sessão.
 * @param {string} phone
 * @param {string} state  - Estado da conversa
 * @param {object} data   - Dados temporários coletados durante o fluxo
 */
function setState(phone, state, data = {}) {
  const current = getSession(phone);
  sessions.set(phone, { state, data: { ...current.data, ...data } });
}

/**
 * Reseta a sessão de um usuário para o estado inicial.
 * @param {string} phone
 */
function resetSession(phone) {
  sessions.set(phone, { state: 'IDLE', data: {} });
}

module.exports = { getSession, setState, resetSession };
