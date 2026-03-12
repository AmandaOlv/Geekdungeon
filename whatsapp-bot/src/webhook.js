const express = require('express');
const { WEBHOOK_PORT } = require('./config');
const { processMessage } = require('./menuHandler');
const { sendText } = require('./evolutionApi');

const app = express();
app.use(express.json());

/**
 * Extrai o texto da mensagem de diferentes tipos de conteúdo do WhatsApp.
 */
function extractText(message) {
  if (!message) return null;
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    null
  );
}

/**
 * Extrai o número de telefone limpo do remoteJid da Evolution API.
 * Ex: "5511999999999@s.whatsapp.net" → "5511999999999"
 */
function extractPhone(remoteJid) {
  if (!remoteJid) return null;
  return remoteJid.replace(/@.*$/, '');
}

// ── Webhook endpoint ──────────────────────────────────────────────────────────

app.post('/webhook', async (req, res) => {
  // Confirma recebimento imediatamente para a Evolution API
  res.status(200).json({ received: true });

  const body = req.body;

  // Aceita evento messages.upsert ou MESSAGES_UPSERT
  const event = (body.event || '').toUpperCase();
  if (event !== 'MESSAGES_UPSERT') return;

  const data = body.data;
  if (!data) return;

  const key = data.key || {};

  // Ignora mensagens enviadas pelo próprio bot
  if (key.fromMe) return;

  // Ignora mensagens de grupos (remoteJid termina com @g.us)
  const remoteJid = key.remoteJid || '';
  if (remoteJid.endsWith('@g.us')) return;

  const phone = extractPhone(remoteJid);
  if (!phone) return;

  const text = extractText(data.message);
  if (!text || !text.trim()) return;

  console.log(`📩 [${phone}]: ${text}`);

  try {
    const reply = await processMessage(phone, text);
    if (reply) {
      await sendText(phone, reply);
      console.log(`📤 [${phone}]: ${reply.substring(0, 60)}...`);
    }
  } catch (err) {
    console.error(`Erro ao processar mensagem de ${phone}:`, err.message);
    try {
      await sendText(phone, '❌ Ocorreu um erro interno. Tente novamente ou envie *menu*.');
    } catch {
      // Ignora erro ao enviar mensagem de erro
    }
  }
});

// ── Health check ──────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'geekdungeon-whatsapp-bot' });
});

// ── Start ─────────────────────────────────────────────────────────────────────

function startWebhookServer() {
  return new Promise((resolve, reject) => {
    const server = app.listen(WEBHOOK_PORT, (err) => {
      if (err) return reject(err);
      resolve(server);
    });
  });
}

module.exports = { startWebhookServer };
