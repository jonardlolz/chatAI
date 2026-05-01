# Key Project Decisions

## Overview
This document outlines the major architectural and technical decisions made for the AI SQL Parser project, including the rationale behind each choice.

---

## 1. **LLM Provider Selection: Claude API (Primary)**

### Decision
Use Anthropic's Claude API as the primary LLM provider, with OpenAI as a fallback.

### Rationale
- **Superior Structured Outputs**: Claude excels at generating structured JSON responses
- **Better SQL Reasoning**: Claude's instruction-following produces more accurate SQL
- **Context Length**: Larger context window for complex schema information
- **Cost Efficiency**: Better token efficiency for SQL generation tasks
- **Reliability**: Consistent output formatting

### Alternative Considered
- OpenAI GPT-4: Industry standard but less structured output
- Local Models (Ollama): Free but slower, more resource-intensive

### Implementation
```typescript
LLM_PROVIDER=claude  // Set in .env
CLAUDE_API_KEY=***   // Required API key
```

---

## 2. **API-First, Middleware Architecture**

### Decision
Build as an independent middleware service that multiple projects can call via REST API.

### Rationale
- **Decoupling**: Not tied to any specific application
- **Reusability**: Multiple projects can use the same service
- **Scalability**: Single instance can serve many applications
- **Flexibility**: Easy to integrate into different tech stacks
- **Maintainability**: Centralized SQL generation logic

### Alternative Considered
- Library/SDK: Would require integration into each project
- Monolithic Application: Would tightly couple SQL parsing with business logic

### Benefits
- Version upgrades affect only this service
- Easy to add new LLM providers
- Can be deployed independently
- Easier to monitor and debug

---

## 3. **TypeScript for Type Safety**

### Decision
Use TypeScript with strict mode for all source code.

### Rationale
- **Type Safety**: Catch errors at compile time
- **Better IDE Support**: Autocomplete and refactoring
- **Documentation**: Types serve as inline documentation
- **Maintainability**: Clear contracts between functions
- **Scalability**: Easier to refactor as codebase grows

### Implementation
```json
"strict": true  // tsconfig.json enforces strict mode
```

---

## 4. **Schema-Driven SQL Generation**

### Decision
Require users to provide database schema context with each request.

### Rationale
- **Accuracy**: LLM knows exact column names and types
- **Validation**: Can verify columns exist in schema
- **Flexibility**: Works with any database schema
- **Safety**: Can reject invalid column references
- **Consistency**: No assumptions about database structure

### API Example
```json
{
  "prompt": "add Rice price 100",
  "schema": {
    "table": "products",
    "columns": ["id", "name", "price", "unit"]
  }
}
```

---

## 5. **Parameterized Queries (Always)**

### Decision
Always generate parameterized queries with separate parameters array.

### Rationale
- **SQL Injection Prevention**: Primary security measure
- **Database Efficiency**: Allows query plan caching
- **Type Safety**: Parameters properly typed
- **Consistency**: Same approach across all databases

### Implementation
```typescript
// PostgreSQL style
sql: "INSERT INTO products (name, price) VALUES ($1, $2)"
parameters: ["Rice", 100]

// MySQL style
sql: "INSERT INTO products (name, price) VALUES (?, ?)"
parameters: ["Rice", 100]
```

---

## 6. **Express.js Framework**

### Decision
Use Express.js for the HTTP server framework.

### Rationale
- **Mature Ecosystem**: Extensive middleware and extensions
- **Simplicity**: Minimal setup overhead
- **Performance**: Adequate for this use case
- **Community**: Large community for support and examples
- **TypeScript Support**: Excellent typing with `@types/express`

### Alternative Considered
- Fastify: Faster but smaller ecosystem
- Nest.js: Opinionated, more overhead for this use case

---

## 7. **Zod for Runtime Validation**

### Decision
Use Zod schemas for input validation.

### Rationale
- **Type Inference**: Automatic TypeScript types from schemas
- **Runtime Validation**: Catches invalid input before processing
- **Error Messages**: Clear validation error messages
- **No Decorators**: Unlike other validation libraries
- **Lightweight**: Minimal dependencies

### Example
```typescript
const parsePromptSchema = z.object({
  prompt: z.string().min(1),
  database_type: z.enum(['postgresql', 'mysql', 'sqlite']),
  schema: z.object({
    table: z.string(),
    columns: z.array(z.string())
  })
});
```

---

## 8. **Flexible Database Support**

### Decision
Support multiple SQL databases (PostgreSQL, MySQL, SQLite, MSSQL) with database-agnostic approach.

### Rationale
- **User Choice**: Projects can use their preferred database
- **Query Format**: Different databases have different parameter styles
- **Validation Rules**: Apply database-specific SQL rules
- **Future-Proof**: Easy to add new database types

### Parameter Styles
- PostgreSQL: `$1, $2, $3` (positional)
- MySQL: `?, ?, ?` (positional)
- SQLite: `?, ?, ?` or `:name` (named)
- MSSQL: `@p0, @p1, @p2` (named)

---

## 9. **Separation of Concerns**

### Decision
Split code into controllers, services, schemas, routes, and utils.

### Rationale
- **Maintainability**: Each component has single responsibility
- **Testability**: Easy to unit test individual components
- **Reusability**: Services can be used in multiple controllers
- **Clarity**: Code organization is self-documenting

### Structure
```
routes/        → HTTP endpoints
controllers/   → Request orchestration
services/      → Business logic (LLM calls)
schemas/       → Validation and types
utils/         → Helper functions
```

---

## 10. **Environment-Based Configuration**

### Decision
Use `.env` file for sensitive configuration (API keys, port, etc.).

### Rationale
- **Security**: Keep secrets out of source code
- **Flexibility**: Different configs per environment (dev, prod)
- **Simplicity**: Easy to deploy to different platforms
- **Best Practice**: Industry standard approach

### Environment Variables
```
LLM_PROVIDER=claude
CLAUDE_API_KEY=***
PORT=3000
NODE_ENV=development
```

---

## 11. **Error Handling Strategy**

### Decision
Implement structured error responses with validation warnings.

### Rationale
- **User Feedback**: Clear error messages
- **Debugging**: Context for troubleshooting
- **Non-Breaking**: Warnings allow partial success
- **Standards**: RESTful error conventions

### Response Format
```json
{
  "success": true|false,
  "sql": "...",
  "parameters": [],
  "validation_status": "success|warning",
  "warnings": []
}
```

---

## 12. **Keyword-to-Operation Mapping**

### Decision
Map natural language keywords to SQL operations:
- "add" → INSERT
- "remove" → DELETE
- "modify" → UPDATE
- "check" → SELECT

### Rationale
- **Intuitiveness**: Natural language keywords
- **LLM Guidance**: Clear intent for the model
- **Consistency**: Standardized operation types

### Extension Point
Can be expanded to support more complex operations and multi-step commands.

---

## Testing Strategy

### Decision
Implement unit tests for services and utilities.

### Approach
- Jest for test runner
- Mock LLM responses for unit tests
- Integration tests for API endpoints
- SQL validation tests

---

## Deployment Considerations

### Decision
Design for containerization and cloud deployment.

### Approach
- Dockerfile support (can be added)
- Environment-based configuration
- No persistent state (stateless)
- Horizontal scalability

---

## Future Decisions To Make

1. **Caching Strategy**: Response caching for repeated queries
2. **Rate Limiting**: Per-user or per-API-key limits
3. **Logging**: Structured logging approach
4. **Monitoring**: Health checks and metrics
5. **Authentication**: API key validation
6. **Multi-Step Prompts**: Supporting complex, multi-stage queries
7. **Custom Functions**: User-defined SQL functions
8. **Query Result Validation**: Post-execution validation

---

## Decision Log

| Date | Decision | Status |
|------|----------|--------|
| 2024-01-XX | Claude API as primary LLM | ✅ Approved |
| 2024-01-XX | TypeScript strict mode | ✅ Approved |
| 2024-01-XX | Parameterized queries always | ✅ Approved |
| 2024-01-XX | Express.js framework | ✅ Approved |
| 2024-01-XX | Zod for validation | ✅ Approved |

---

## Questions & Discussion

### Q: Why not use an ORM?
**A:** Direct SQL generation gives more control and flexibility. ORMs abstract too much for natural language interpretation.

### Q: What about database connections?
**A:** This service generates SQL; consuming applications manage their own database connections. This maintains decoupling.

### Q: How do we handle complex queries?
**A:** Schema context allows the LLM to understand relationships. Complex queries will be tested and refined.

### Q: Can we use local LLMs?
**A:** Yes! The `LLM_PROVIDER` is configurable. Local LLMs can be integrated with appropriate API adapters.
