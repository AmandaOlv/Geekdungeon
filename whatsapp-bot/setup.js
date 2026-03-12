const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { execSync } = require('child_process');
const fs = require('fs');

const API_KEY = process.env.EVOLUTION_API_KEY || 'geekdungeon123';
const EVOLUTION_DIR = path.resolve(__dirname, '..', 'evolution-api');
const BOT_DIR = __dirname;

function run(cmd, cwd = process.cwd()) {
  console.log(`  $ ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit', shell: true });
}

function minimalEnv(key) {
  return [
    'SERVER_URL=http://localhost:8080',
    'SERVER_PORT=8080',
    '',
    'AUTHENTICATION_TYPE=apikey',
    `AUTHENTICATION_API_KEY=${key}`,
    'AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES=true',
    '',
    'DATABASE_ENABLED=false',
    '',
    'CACHE_REDIS_ENABLED=false',
    '',
    'DEL_INSTANCE=false',
    'INSTANCE_EXPIRY_TIME=5',
    '',
    'LOG_LEVEL=ERROR',
  ].join('\n');
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🔧 GeekDungeon — Setup Evolution API (Node.js)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 1. Clone ─────────────────────────────────────────────────────────────────
  if (!fs.existsSync(EVOLUTION_DIR)) {
    console.log('📥 Clonando Evolution API (--depth 1)...\n');
    run(
      `git clone --depth 1 https://github.com/EvolutionAPI/evolution-api "${EVOLUTION_DIR}"`,
      process.cwd()
    );
    console.log('\n✅ Clone concluído.');
  } else {
    console.log('✅ Evolution API já clonada em:\n   ' + EVOLUTION_DIR);
  }

  // 2. Instalar dependências ──────────────────────────────────────────────────
  console.log('\n📦 Instalando dependências da Evolution API...\n');
  run('npm install --legacy-peer-deps', EVOLUTION_DIR);
  console.log('\n✅ Dependências instaladas.');

  // 3. Configurar .env da Evolution API ────────────────────────────────────────
  const evoEnvPath = path.join(EVOLUTION_DIR, '.env');
  if (!fs.existsSync(evoEnvPath)) {
    const evoEnvExample = path.join(EVOLUTION_DIR, '.env.example');
    let content = fs.existsSync(evoEnvExample)
      ? fs.readFileSync(evoEnvExample, 'utf8')
          .replace(/^AUTHENTICATION_API_KEY=.*/m, `AUTHENTICATION_API_KEY=${API_KEY}`)
          .replace(/^API_KEY=.*/m, `API_KEY=${API_KEY}`)
      : minimalEnv(API_KEY);
    fs.writeFileSync(evoEnvPath, content, 'utf8');
    console.log(`\n✅ .env da Evolution API criado com API_KEY=${API_KEY}`);
  } else {
    console.log('\n✅ .env da Evolution API já existe.');
  }

  // 4. Configurar .env do bot ───────────────────────────────────────────────────
  const botEnvPath = path.join(BOT_DIR, '.env');
  if (!fs.existsSync(botEnvPath)) {
    const botEnvExample = path.join(BOT_DIR, '.env.example');
    let content = fs.readFileSync(botEnvExample, 'utf8');
    content = content.replace(/EVOLUTION_API_KEY=.*/, `EVOLUTION_API_KEY=${API_KEY}`);
    fs.writeFileSync(botEnvPath, content, 'utf8');
    console.log('\n✅ .env do bot criado.');
  } else {
    console.log('\n✅ .env do bot já existe.');
  }

  // 5. Gerar Prisma Client ──────────────────────────────────────────────────────
  console.log('\n🗄️  Gerando Prisma Client (postgresql)...\n');
  run('npx prisma generate --schema ./prisma/postgresql-schema.prisma', EVOLUTION_DIR);
  console.log('\n✅ Prisma Client gerado.');

  // 6. Build ────────────────────────────────────────────────────────────────────
  // Usa tsup diretamente (ignora tsc --noEmit que falha por tipos do prisma)
  console.log('\n🔨 Buildando Evolution API com tsup...\n');
  run('npx tsup', EVOLUTION_DIR);
  console.log('\n✅ Build concluído.');

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ✅ Setup concluído!');
  console.log('  Próximo passo: npm run start:all');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch((err) => {
  console.error('\n❌ Erro no setup:', err.message);
  process.exit(1);
});
