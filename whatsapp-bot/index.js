const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { processMessage } = require('./src/menuHandler');
const {
  ALLOWED_NUMBERS,
  isAllowedPhone,
  isGroupOrBroadcast,
  isPrivateUserChat,
} = require('./src/allowlist');

if (!ALLOWED_NUMBERS.size) {
  console.error('❌ ALLOWED_NUMBERS está vazio. Ninguém será atendido. Configure o .env');
}

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: path.join(__dirname, '.wwebjs_auth') }),
  puppeteer: {
    headless: false,
    executablePath: chromePath,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-extensions',
      '--no-first-run',
      '--disable-features=site-per-process',
    ],
  },
});

async function replyIfAllowed(msg, text) {
  const from = msg.from || '';
  if (msg.fromMe) return;
  if (isGroupOrBroadcast(from, msg)) return;
  if (!isPrivateUserChat(from)) return;
  const phone = from.replace(/@.*$/, '');
  if (!isAllowedPhone(phone)) return;
  await msg.reply(text);
}

client.on('qr', (qr) => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🎮 GeekDungeon WhatsApp Bot');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n  📱 Escaneie o QR Code abaixo com o WhatsApp:\n');
  qrcode.generate(qr, { small: true });
  console.log('\n  Aguardando conexão...');
  console.log('  (Se expirar, um novo QR será gerado automaticamente)\n');
});

client.on('ready', () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🎮 GeekDungeon WhatsApp Bot');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('✅ WhatsApp conectado com sucesso!');
  console.log(`🔐 Allowlist ativa: só conversas privadas com os números configurados.`);
  console.log('   Grupos, status e números fora da lista são ignorados (sem resposta).');
  console.log('   Pressione Ctrl+C para encerrar.\n');
});

client.on('authenticated', () => {
  console.log('🔐 Autenticado! Carregando sessão...');
});

client.on('auth_failure', (msg) => {
  console.error('❌ Falha na autenticação:', msg);
});

client.on('disconnected', (reason) => {
  console.warn('⚠️  WhatsApp desconectado:', reason);
  console.log('   Reiniciando o bot para reconectar...');
  client.initialize();
});

client.on('message', async (msg) => {
  if (msg.fromMe) return;

  const from = msg.from || '';
  if (isGroupOrBroadcast(from, msg)) {
    console.log(`🚫 Grupo/broadcast ignorado: ${from}`);
    return;
  }
  if (!isPrivateUserChat(from)) {
    console.log(`🚫 Chat não privado ignorado: ${from}`);
    return;
  }

  const phone = from.replace(/@.*$/, '');
  if (!isAllowedPhone(phone)) {
    console.log(`🚫 Número não autorizado ignorado: ${phone}`);
    return;
  }

  const text = msg.body?.trim();
  if (!text) return;

  console.log(`📩 [${phone}]: ${text}`);

  try {
    const reply = await processMessage(phone, text);
    if (reply) {
      await replyIfAllowed(msg, reply);
      console.log(`📤 [${phone}]: ${reply.substring(0, 60).replace(/\n/g, ' ')}...`);
    }
  } catch (err) {
    console.error(`Erro ao processar mensagem de ${phone}:`, err.message);
    try {
      await replyIfAllowed(msg, '❌ Ocorreu um erro interno. Tente novamente ou envie *menu*.');
    } catch {
      // Ignora
    }
  }
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  🎮 GeekDungeon WhatsApp Bot — Iniciando...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
if (ALLOWED_NUMBERS.size) {
  console.log('🔐 Bot responde SOMENTE a estes números (privados):');
  console.log('   +55 88 9311-5914');
  console.log('   +55 88 99695-6647');
  console.log('   Grupos e qualquer outro contato são ignorados.\n');
}
console.log('⏳ Abrindo conexão com WhatsApp Web (aguarde o QR Code)...\n');

client.initialize().catch((err) => {
  console.error('❌ Erro fatal ao inicializar:', err.message);
  process.exit(1);
});
