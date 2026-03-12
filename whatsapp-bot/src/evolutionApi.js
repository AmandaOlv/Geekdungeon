const axios = require('axios');
const { EVOLUTION_API_URL, EVOLUTION_API_KEY, INSTANCE_NAME, WEBHOOK_URL } = require('./config');

const api = axios.create({
  baseURL: EVOLUTION_API_URL,
  headers: { apikey: EVOLUTION_API_KEY },
  timeout: 15000,
});

/**
 * Garante que a instância existe na Evolution API.
 * Cria uma nova se não existir.
 */
async function ensureInstance() {
  try {
    const res = await api.get('/instance/fetchInstances');
    const instances = Array.isArray(res.data) ? res.data : [];
    const exists = instances.some(
      (i) => i.instance?.instanceName === INSTANCE_NAME || i.instanceName === INSTANCE_NAME
    );

    if (!exists) {
      console.log(`  Criando instância "${INSTANCE_NAME}"...`);
      await api.post('/instance/create', {
        instanceName: INSTANCE_NAME,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
      });
      console.log(`  Instância "${INSTANCE_NAME}" criada.`);
    } else {
      console.log(`  Instância "${INSTANCE_NAME}" já existe.`);
    }
  } catch (err) {
    // Se fetchInstances falhar, tenta criar diretamente
    if (err.response?.status === 404) {
      await api.post('/instance/create', {
        instanceName: INSTANCE_NAME,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
      });
    } else {
      throw err;
    }
  }
}

/**
 * Retorna o estado atual da conexão da instância.
 * Possíveis valores: 'open', 'close', 'qrcode', 'connecting'
 */
async function getConnectionState() {
  const res = await api.get(`/instance/connectionState/${INSTANCE_NAME}`);
  return res.data?.instance?.state || res.data?.state || 'close';
}

/**
 * Busca o QR code da instância para exibição no terminal.
 * Retorna a string bruta do QR code ou null se não disponível.
 */
async function getQRCode() {
  try {
    const res = await api.get(`/instance/connect/${INSTANCE_NAME}`);
    const data = res.data;
    // Diferentes versões da Evolution API retornam em formatos distintos
    return (
      data?.qrcode?.code ||
      data?.code ||
      data?.base64 ||
      null
    );
  } catch {
    return null;
  }
}

/**
 * Configura o webhook da instância para receber mensagens.
 */
async function setWebhook() {
  await api.post(`/webhook/set/${INSTANCE_NAME}`, {
    url: WEBHOOK_URL,
    webhook_by_events: false,
    webhook_base64: false,
    events: ['MESSAGES_UPSERT'],
  });
}

/**
 * Envia uma mensagem de texto para um número.
 * @param {string} number  Número no formato 5511999999999 (sem @ ou sufixo)
 * @param {string} text    Texto a enviar (suporta markdown do WhatsApp: *negrito*, _itálico_)
 */
async function sendText(number, text) {
  await api.post(`/message/sendText/${INSTANCE_NAME}`, {
    number,
    text,
  });
}

module.exports = { ensureInstance, getConnectionState, getQRCode, setWebhook, sendText };
