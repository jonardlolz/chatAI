# AI SQL Parser - Copilot Instructions

## Project Overview
This is an AI-powered middleware API that converts natural language prompts into SQL strings for multiple databases. The system uses Claude or OpenAI to understand user intent and generate appropriate SQL commands.

## Architecture & Tech Stack
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **LLM Integration**: Claude API (primary) / OpenAI (alternative)
- **Validation**: Zod schemas
- **Database Support**: Flexible (PostgreSQL, MySQL, SQLite, MSSQL)

## Key Project Decisions
1. **LLM Provider**: Claude API chosen for superior structured outputs and SQL reasoning
2. **API-First Design**: Independent middleware that serves multiple projects
3. **Schema-Driven**: Users provide database schema context with each request
4. **Parameterized Queries**: Always use parameter placeholders to prevent SQL injection
5. **TypeScript Strict Mode**: All code must pass strict TypeScript compilation
6. **Zod Validation**: All inputs validated at runtime before processing
7. **Error Handling**: Structured error responses with validation warnings

## File Structure
```
src/
├── app.ts                    # Express app initialization
├── controllers/
│   └── parseController.ts    # Request handlers
├── services/
│   └── llmService.ts         # LLM integration (Claude/OpenAI)
├── routes/
│   └── parseRoutes.ts        # API endpoints
├── schemas/
│   └── parseSchema.ts        # Zod validation schemas
└── utils/
    └── sqlValidator.ts       # SQL validation and safety checks
```

## Development Guidelines
- Use TypeScript strictly (no `any` types)
- All user input must be validated with Zod before processing
- SQL output must always use parameterized queries
- Follow REST conventions for API design
- Write clear, self-documenting code
- Add proper error handling with context

## Documentation
- [Architecture Overview](../docs/ARCHITECTURE.md) - System design and data flow
- [API Reference](../docs/API.md) - Endpoint documentation and examples
- [Development Guide](../docs/DEVELOPMENT.md) - Setup, development, and deployment
- [Architecture Decisions](../docs/decisions/DECISIONS.md) - Rationale for key decisions

## Quick Commands
```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build TypeScript to JavaScript
npm start            # Run production build
npm test             # Run tests
```

## Environment Setup
Copy `.env.example` to `.env` and configure:
- `CLAUDE_API_KEY` - Your Claude API key (required)
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `LLM_PROVIDER` - Provider selection (claude/openai)
