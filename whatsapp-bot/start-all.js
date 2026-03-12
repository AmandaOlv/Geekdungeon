const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const EVOLUTION_DIR = path.resolve(__dirname, '..', 'evolution-api');
const EVOLUTION_PORT = 8080;

// ── Helpers ───────────────────────────────────────────────────────────────────

function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, () => resolve(true));
    req.on('error', () => resolve(false));
    req.setTimeout(1500, () => { req.destroy(); resolve(false); });
    req.end();
  });
}

async function waitForPort(port, maxMs = 120000) {
  const start = Date.now();
  process.stdout.write('⏳ Aguardando Evolution API');
  while (Date.now() - start < maxMs) {
    if (await checkPort(port)) {
      process.stdout.write(' ✅\n');
      return true;
    }
    process.stdout.write('.');
    await new Promise((r) => setTimeout(r, 2000));
  }
  process.stdout.write(' ❌\n');
  return false;
}

// ── Inicia a Evolution API como processo filho ────────────────────────────────

async function startEvolutionApi() {
  if (await checkPort(EVOLUTION_PORT)) {
    console.log('✅ Evolution API já está rodando na porta ' + EVOLUTION_PORT);
    return null;
  }

  const mainJs = path.join(EVOLUTION_DIR, 'dist', 'main.js');
  if (!fs.existsSync(mainJs)) {
    console.error('❌ Evolution API não foi buildada.');
    console.error('   Execute primeiro: npm run setup');
    process.exit(1);
  }

  console.log('🚀 Iniciando Evolution API...');

  const proc = spawn('node', [path.join('dist', 'main.js')], {
    cwd: EVOLUTION_DIR,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  });

  proc.stdout.on('data', (d) =>
    d.toString().split('\n').filter((l) => l.trim()).forEach((l) =>
      process.stdout.write(`  \x1b[90m[evo]\x1b[0m ${l}\n`)
    )
  );

  proc.stderr.on('data', (d) =>
    d.toString().split('\n').filter((l) => l.trim()).forEach((l) =>
      process.stderr.write(`  \x1b[33m[evo]\x1b[0m ${l}\n`)
    )
  );

  proc.on('exit', (code) => {
    if (code) {
      console.error(`\n❌ Evolution API encerrou com código ${code}`);
      process.exit(1);
    }
  });

  return proc;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🎮 GeekDungeon Bot — Iniciando tudo...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const evoProc = await startEvolutionApi();

  if (evoProc) {
    const ready = await waitForPort(EVOLUTION_PORT);
    if (!ready) {
      console.error('❌ Evolution API não ficou pronta em 2 minutos.');
      evoProc.kill();
      process.exit(1);
    }
    console.log('');
  }

  // Encerra a Evolution API junto quando o usuário der Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n🛑 Encerrando tudo...');
    if (evoProc) evoProc.kill('SIGINT');
    process.exit(0);
  });

  // Inicia o bot (index.js exporta main())
  const { main: runBot } = require('./index.js');
  await runBot();
}

main().catch((err) => {
  console.error('\n❌ Erro fatal:', err.message);
  if (err.code === 'ECONNREFUSED') {
    console.error('   Evolution API não respondeu. Verifique se a porta 8080 está livre.');
  }
  process.exit(1);
});
