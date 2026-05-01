# AI SQL Parser Middleware

An intelligent API middleware that converts natural language prompts into executable SQL statements for any SQL database.

## Features

- 🤖 **AI-Powered**: Uses Claude or OpenAI to understand natural language
- 🔄 **Multi-Database Support**: Works with PostgreSQL, MySQL, SQLite, and more
- 🛡️ **SQL Injection Safe**: Always generates parameterized queries
- 🔌 **Middleware Design**: Independent API that serves multiple projects
- 📝 **Schema-Aware**: Understands your database structure for accurate SQL generation
- ⚡ **Fast & Lightweight**: Built with Express.js and TypeScript

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Claude API key (or OpenAI API key)

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Update .env with your API keys
# CLAUDE_API_KEY=your_key_here
```

### Development

```bash
npm run dev
```

The API will start on `http://localhost:3000`

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
LLM_PROVIDER=claude
CLAUDE_API_KEY=your_key
OPENAI_API_KEY=optional
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
