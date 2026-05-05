# AI SQL Parser Middleware

An intelligent API middleware that converts natural language prompts into executable SQL statements for any SQL database. **Completely free** using Ollama running locally on your machine.

## Features

- 🤖 **AI-Powered**: Uses Ollama (free, local) as primary, with Claude or OpenAI support
- 💰 **Completely Free**: Ollama runs locally—no API charges
- 🔄 **Multi-Database Support**: Works with PostgreSQL, MySQL, SQLite, and more
- 🛡️ **SQL Injection Safe**: Always generates parameterized queries
- 🔌 **Middleware Design**: Independent API that serves multiple projects
- 📝 **Schema-Aware**: Understands your database structure for accurate SQL generation
- ⚡ **Fast & Lightweight**: Built with Express.js and TypeScript

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- **Ollama** (free download from https://ollama.ai)

### Installation

1. **Install Ollama**
   - Download from https://ollama.ai
   - Install and run the application

2. **Download a Model**
   ```bash
   ollama pull phi4-mini
   # Alternative: ollama pull llama3:latest or phi3
   ```

3. **Setup Project**
   ```bash
   # Clone and install
   npm install

   # Copy environment template
   cp .env.example .env

   # .env is pre-configured for Ollama, no API keys needed!
   ```

### Development

```bash
# Make sure Ollama is running
ollama serve

# In another terminal:
npm run dev
```

The API will start on `http://localhost:3000`

### Local deployment helper

This repo also includes a local helper script for starting and stopping Ollama + the API together.

```bash
npm run local:start
npm run local:stop
npm run local:status
```

### Build for Production

```bash
npm run build
npm start
```

## API Usage

### Parse Prompt to SQL

**Endpoint**: `POST /api/parse`

**Request**:
```json
{
  "prompt": "add Rice price 100 per kilo",
  "database_type": "postgresql",
  "schema": {
    "table": "products",
    "columns": ["id", "name", "price", "unit"],
    "primary_key": "id"
  }
}
```

**Response**:
```json
{
  "success": true,
  "sql": "INSERT INTO products (name, price, unit) VALUES ($1, $2, $3)",
  "parameters": ["Rice", 100, "per kilo"],
  "operation": "INSERT",
  "validation_status": "success"
}
```

## Supported Operations

- `ADD` → INSERT
- `REMOVE` → DELETE
- `MODIFY` → UPDATE
- `CHECK` → SELECT

## LLM Providers

### Ollama (Primary - FREE)
- **Cost**: $0 (runs locally)
- **Setup**: Download from https://ollama.ai
- **Models**: phi4-mini, llama3:latest, phi3, etc.
- **Best for**: Development, low-resource local usage, privacy

### Claude (Optional)
- **Cost**: Pay per token (~$0.003 per 1K input)
- **Setup**: Add `CLAUDE_API_KEY` to `.env`, set `LLM_PROVIDER=claude`

### OpenAI (Optional)
- **Cost**: $0 free trial + pay per token
- **Setup**: Add `OPENAI_API_KEY` to `.env`, set `LLM_PROVIDER=openai`

## Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [Design Decisions](./docs/decisions/DECISIONS.md)
- [API Reference](./docs/API.md)
- [Development Guide](./docs/DEVELOPMENT.md)

## Project Structure

```
.
├── src/
│   ├── app.ts                 # Express app setup
│   ├── controllers/           # Route handlers
│   ├── services/              # Business logic
│   ├── routes/                # API routes
│   ├── schemas/               # Zod validation
│   └── utils/                 # Helpers
├── docs/                      # Documentation
├── tests/                     # Test files
├── package.json
├── tsconfig.json
└── README.md
```

## Environment Variables

```
PORT=3000
NODE_ENV=development
LLM_PROVIDER=ollama
OLLAMA_MODEL=phi4-mini
OLLAMA_BASE_URL=http://localhost:11434
LOG_LEVEL=debug
```

## Contributing

Contributions welcome! Please:
1. Create a feature branch
2. Follow TypeScript strict mode
3. Add tests for new features
4. Update documentation

## License

MIT

## Support

For issues or questions, open an issue on the repository.
