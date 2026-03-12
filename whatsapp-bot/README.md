# GeekDungeon WhatsApp Bot

Bot WhatsApp integrado à Evolution API que expõe o CRUD de Categorias e Produtos via menu interativo.

## Pré-requisitos

- Node.js >= 18
- [Evolution API](https://github.com/EvolutionAPI/evolution-api) rodando (Docker ou local)
- API Python (FastAPI) deste projeto rodando

## Instalação

```bash
cd whatsapp-bot
npm install
```

## Configuração

Copie o arquivo de exemplo e preencha as variáveis:

```bash
copy .env.example .env
```

Edite o `.env`:

```env
# URL do servidor Evolution API
EVOLUTION_API_URL=http://localhost:8080

# Chave de API (definida no .env do servidor Evolution como API_KEY)
EVOLUTION_API_KEY=sua-chave-aqui

# Nome da instância (identificador único da sua conexão)
INSTANCE_NAME=geekdungeon-bot

# URL que a Evolution API vai usar para enviar webhooks ao bot
# Se tudo roda localmente: http://localhost:3000/webhook
# Se Evolution API está em servidor remoto: use ngrok ou IP público
WEBHOOK_URL=http://localhost:3000/webhook

# Porta do servidor webhook local
WEBHOOK_PORT=3000

# URL da API Python (FastAPI) deste projeto
PYTHON_API_URL=http://localhost:8000
```

## Subindo a Evolution API com Docker

```bash
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e API_KEY=sua-chave-aqui \
  atendai/evolution-api:latest
```

Ou use o `docker-compose.yml` disponível no repositório da Evolution API.

## Executando o Bot

```bash
# Produção
npm start

# Desenvolvimento (com hot reload)
npm run dev
```

Na primeira execução, um QR Code será exibido no terminal. Escaneie com o WhatsApp no celular.

## Menu do Bot

Após conectar, qualquer mensagem recebida inicia o menu:

```
🎮 GeekDungeon Bot

📦 CATEGORIAS
1 - Listar todas as categorias
2 - Buscar categoria por ID
3 - Criar nova categoria
4 - Atualizar categoria
5 - Deletar categoria

🛍️ PRODUTOS
6  - Listar todos os produtos
7  - Buscar produto por ID
8  - Buscar produtos por nome
9  - Criar novo produto
10 - Atualizar produto
11 - Deletar produto
```

A qualquer momento, envie `0` ou `menu` para voltar ao menu principal.

## Observação sobre Webhook

A Evolution API precisa conseguir alcançar o `WEBHOOK_URL` configurado. Se a Evolution API rodar localmente junto com o bot, `http://localhost:3000/webhook` funciona. Se a Evolution API estiver em servidor remoto, use uma ferramenta como [ngrok](https://ngrok.com/) para expor a porta local:

```bash
ngrok http 3000
# Copie a URL gerada (ex: https://xxxx.ngrok.io) e use como WEBHOOK_URL
```
