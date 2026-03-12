const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { processMessage } = require('./src/menuHandler');

// Números autorizados a interagir com o bot (apenas o número, sem @c.us)
const ALLOWED_NUMBERS = ['558800000000','558800000001'];//numeros mockados

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: path.join(__dirname, '.wwebjs_auth') }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

// ── QR Code ───────────────────────────────────────────────────────────────────

client.on('qr', (qr) => {
  process.stdout.write('\x1Bc'); // limpa tela
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🎮 GeekDungeon WhatsApp Bot');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n  📱 Escaneie o QR Code abaixo com o WhatsApp:\n');
  qrcode.generate(qr, { small: true });
  console.log('\n  Aguardando conexão...');
  console.log('  (Se expirar, um novo QR será gerado automaticamente)\n');
});

// ── Pronto ─────────────────────────────────────────────────────────────────────

client.on('ready', () => {
  process.stdout.write('\x1Bc');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🎮 GeekDungeon WhatsApp Bot');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('✅ WhatsApp conectado com sucesso!');
  console.log('🤖 Bot pronto! Envie uma mensagem no WhatsApp para começar.');
  console.log('   Pressione Ctrl+C para encerrar.\n');
});

// ── Auth ──────────────────────────────────────────────────────────────────────

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

// ── Mensagens ────────────────────────────────────────────────────────────────

client.on('message', async (msg) => {
  // Ignora mensagens do próprio bot
  if (msg.fromMe) return;

  // Ignora grupos (@g.us), broadcasts (@broadcast) e status (@status.broadcast)
  const from = msg.from || '';
  if (
    msg.isGroupMsg ||
    from.endsWith('@g.us') ||
    from.endsWith('@broadcast') ||
    from === 'status@broadcast'
  ) return;

  // Aceita apenas mensagens privadas (@c.us)
  if (!from.endsWith('@c.us')) return;

  const phone = from.replace(/@.*$/, '');

  // Verifica se o número está na lista de autorizados
  if (!ALLOWED_NUMBERS.includes(phone)) {
    console.log(`🚫 Número não autorizado ignorado: ${phone}`);
    return;
  }

  const text = msg.body?.trim();

  if (!text) return;

  console.log(`📩 [${phone}]: ${text}`);

  try {
    const reply = await processMessage(phone, text);
    if (reply) {
      await msg.reply(reply);
      console.log(`📤 [${phone}]: ${reply.substring(0, 60).replace(/\n/g, ' ')}...`);
    }
  } catch (err) {
    console.error(`Erro ao processar mensagem de ${phone}:`, err.message);
    try {
      await msg.reply('❌ Ocorreu um erro interno. Tente novamente ou envie *menu*.');
    } catch {
      // Ignora
    }
  }
});

// ── Inicializa ────────────────────────────────────────────────────────────────

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  🎮 GeekDungeon WhatsApp Bot — Iniciando...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('⏳ Abrindo conexão com WhatsApp Web (aguarde)...\n');

client.initialize().catch((err) => {
  console.error('❌ Erro fatal ao inicializar:', err.message);
  process.exit(1);
});
