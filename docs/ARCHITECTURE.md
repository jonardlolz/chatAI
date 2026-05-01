# Architecture Overview

## System Design

The AI SQL Parser is a middleware service that acts as a bridge between natural language user inputs and database-specific SQL queries.

```
┌─────────────────────────────────────────────────────────────┐
│                    External Applications                     │
│              (Web, Mobile, Desktop Apps)                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              AI SQL Parser API (Express.js)                  │
├──────────────────────────────────────────────────────────────┤
│  POST /api/parse                                            │
│  ├─ Input: { prompt, database_type, schema }               │
│  └─ Output: { sql, parameters, operation }                 │
└──────────────┬──────────────────────┬─────────────────────────┘
               │                      │
               ▼                      ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   LLM Service            │  │   Validation Service     │
│  ┌──────────────────────┐│  │ ┌──────────────────────┐ │
│  │ Claude API           ││  │ │ SQL Validator        │ │
│  │ (Recommended)        ││  │ │ Schema Validator     │ │
│  │                      ││  │ │ Injection Detection  │ │
│  └──────────────────────┘│  │ └──────────────────────┘ │
│  ┌──────────────────────┐│  │                          │
│  │ OpenAI API           ││  │                          │
│  │ (Alternative)        ││  │                          │
│  └──────────────────────┘│  │                          │
└──────────────────────────┘  └──────────────────────────┘
               │                      │
               └──────────┬───────────┘
                          │
                          ▼
           ┌──────────────────────────────┐
           │   SQL Query (Parameterized)   │
           │   with Parameters Array       │
           └──────────────┬────────────────┘
                          │
                          ▼
           ┌──────────────────────────────┐
           │   Supported Databases:        │
           │   • PostgreSQL                │
           │   • MySQL                     │
           │   • SQLite                    │
           │   • MSSQL                     │
           └──────────────────────────────┘
```

## Core Components

### 1. **Express Application** (`src/app.ts`)
- Server initialization
- Middleware setup (CORS, JSON parsing)
- Route registration
- Error handling

### 2. **Controllers** (`src/controllers/`)
- Handle HTTP requests
- Orchestrate business logic
- Return formatted responses

### 3. **Services** (`src/services/`)
- **LLM Service**: Communicates with Claude/OpenAI APIs
- Converts natural language to SQL concepts
- Handles API errors and retries

### 4. **Routes** (`src/routes/`)
- Define API endpoints
- Route mapping
- HTTP method definitions

### 5. **Schemas** (`src/schemas/`)
- Zod validation schemas
- Input/output type definitions
- Runtime validation

### 6. **Utils** (`src/utils/`)
- **SQL Validator**: Checks SQL safety and correctness
- Helper functions
- Error utilities

## Data Flow

```
1. User sends POST /api/parse
   {
     prompt: "add Rice price 100 per kilo",
     database_type: "postgresql",
     schema: { table: "products", columns: [...] }
   }

2. Controller receives and validates input

3. LLM Service:
   - Builds context with database schema
   - Calls Claude/OpenAI API
   - Receives SQL + parameters
   - Parses JSON response

4. SQL Validator:
   - Checks for injection patterns
   - Validates parameterization
   - Verifies SQL syntax

5. Response returned:
   {
     success: true,
     sql: "INSERT INTO products (name, price, unit) VALUES ($1, $2, $3)",
     parameters: ["Rice", 100, "per kilo"],
     operation: "INSERT"
   }
```

## Security Considerations

### 1. **Parameterized Queries**
- Always use placeholders ($1, $2 for PostgreSQL; ? for MySQL)
- Parameters passed separately
- Prevents SQL injection

### 2. **Input Validation**
- Zod schema validation
- Type checking
- Schema context validation

### 3. **SQL Inspection**
- Pattern detection for dangerous operations
- Schema column verification
- Operation authorization checks

### 4. **API Security**
- CORS middleware
- Environment variable protection
- Request logging

## Scalability

- **Stateless Design**: Each request is independent
- **Horizontal Scaling**: Can run multiple instances behind a load balancer
- **LLM Caching**: Could implement response caching
- **Rate Limiting**: Can be added per API key
- **Database Connection**: Users manage their own database connections

## Dependencies

- **express**: HTTP server framework
- **zod**: Runtime validation
- **axios**: HTTP client for LLM APIs
- **cors**: Cross-origin support
- **dotenv**: Environment configuration
- **typescript**: Type safety
- **ts-node**: Development execution

## Error Handling

- **Validation Errors**: 400 Bad Request
- **LLM Errors**: 500 Internal Server Error (with context)
- **Parsing Errors**: 400 Bad Request
- **Warnings**: Returned in response metadata

## Future Enhancements

- Request/response caching
- Rate limiting per user/API key
- Query result validation
- Multi-step prompts
- Custom function support
- Database connection pooling
- Real-time syntax highlighting
