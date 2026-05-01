# Development Guide

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Claude API key or OpenAI API key

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-sql-parser
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```
   CLAUDE_API_KEY=your_api_key_here
   PORT=3000
   NODE_ENV=development
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   Server will run on `http://localhost:3000`

---

## Project Structure

```
ai-sql-parser/
├── src/
│   ├── app.ts                    # Express app setup
│   ├── controllers/
│   │   └── parseController.ts    # Request handlers
│   ├── services/
│   │   └── llmService.ts         # LLM integration
│   ├── routes/
│   │   └── parseRoutes.ts        # API routes
│   ├── schemas/
│   │   └── parseSchema.ts        # Zod validation
│   └── utils/
│       └── sqlValidator.ts       # SQL validation
├── docs/                         # Documentation
│   ├── ARCHITECTURE.md           # System design
│   ├── API.md                    # API reference
│   ├── decisions/
│   │   └── DECISIONS.md          # Architecture decisions
│   └── DEVELOPMENT.md            # This file
├── tests/                        # Test files
├── .env.example                  # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## Development Workflow

### Running the Dev Server

```bash
npm run dev
```

This uses `nodemon` to automatically restart the server when files change.

### Building for Production

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Starting Production Build

```bash
npm start
```

### Running Tests

```bash
npm test
```

---

## Code Style & Standards

### TypeScript Configuration

The project uses strict TypeScript settings:
```json
"strict": true,
"esModuleInterop": true,
"resolveJsonModule": true
```

**No `any` types allowed** - always provide explicit types.

### Naming Conventions

- **Files**: kebab-case (e.g., `parse-controller.ts`)
- **Functions**: camelCase (e.g., `generateSQL()`)
- **Classes**: PascalCase (e.g., `ParseController`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)
- **Interfaces**: PascalCase with `I` prefix (e.g., `ISQLResult`)

### Code Organization

**Controllers**: Handle HTTP requests only
```typescript
// ✅ Good
class ParseController {
  async parsePrompt(data: any) {
    const validated = parsePromptSchema.parse(data);
    const result = await llmService.generateSQL(validated);
    return result;
  }
}
```

**Services**: Contain business logic
```typescript
// ✅ Good
class LLMService {
  async generateSQL(input: ParsePromptInput): Promise<SQLGenerationResult> {
    // Complex business logic here
  }
}
```

**Schemas**: Define validation rules
```typescript
// ✅ Good
export const parsePromptSchema = z.object({
  prompt: z.string().min(1),
  database_type: z.enum(['postgresql', 'mysql'])
});
```

---

## Adding Features

### 1. Adding a New Endpoint

**File: `src/routes/parseRoutes.ts`**
```typescript
router.post('/new-endpoint', async (req: Request, res: Response) => {
  try {
    const result = await someController.someMethod(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
```

### 2. Adding a New Service

**Create: `src/services/newService.ts`**
```typescript
class NewService {
  async doSomething(input: SomeType): Promise<ResultType> {
    // Implementation
  }
}

export default new NewService();
```

**Use in controller:**
```typescript
import newService from '../services/newService';

// In controller method
const result = await newService.doSomething(data);
```

### 3. Adding Validation

**Update: `src/schemas/parseSchema.ts`**
```typescript
export const newSchema = z.object({
  field1: z.string(),
  field2: z.number(),
  // ... more fields
});

export type NewInput = z.infer<typeof newSchema>;
```

**Use in controller:**
```typescript
import { newSchema } from '../schemas/parseSchema';

const validated = newSchema.parse(input);
```

---

## Testing

### Running Tests

```bash
npm test
```

### Test Structure

```typescript
// tests/services/llmService.test.ts
describe('LLMService', () => {
  describe('generateSQL', () => {
    it('should generate valid INSERT statement', async () => {
      const input = {
        prompt: 'add Rice price 100',
        database_type: 'postgresql',
        schema: { table: 'products', columns: ['id', 'name', 'price'] }
      };
      
      const result = await llmService.generateSQL(input);
      
      expect(result.operation).toBe('INSERT');
      expect(result.parameters).toContain('Rice');
    });
  });
});
```

### Mock LLM Responses

```typescript
// Avoid real API calls in tests
jest.mock('../services/llmService', () => ({
  generateSQL: jest.fn().mockResolvedValue({
    sql: 'INSERT INTO products VALUES ($1, $2)',
    parameters: ['Rice', 100],
    operation: 'INSERT'
  })
}));
```

---

## Debugging

### Enable Debug Logging

Set `LOG_LEVEL=debug` in `.env`:
```
LOG_LEVEL=debug
```

### Using VS Code Debugger

**Create: `.vscode/launch.json`**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "program": "${workspaceFolder}/src/app.ts",
      "preLaunchTask": "tsc",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    }
  ]
}
```

### Using Chrome DevTools

```bash
node --inspect-brk dist/app.js
```

Then open `chrome://inspect` in Chrome.

---

## Common Tasks

### Adding Database Type Support

1. **Update schema**:
   ```typescript
   // src/schemas/parseSchema.ts
   database_type: z.enum(['postgresql', 'mysql', 'sqlite', 'mssql', 'new-db'])
   ```

2. **Update LLM Service**:
   ```typescript
   private buildSystemPrompt(input: ParsePromptInput): string {
     // Add database-specific instructions
     if (input.database_type === 'new-db') {
       // Special handling
     }
   }
   ```

3. **Update SQL Validator**:
   ```typescript
   private hasParameterPlaceholders(sql: string, databaseType: string): boolean {
     case 'new-db':
       return /special-placeholder/.test(sql);
   }
   ```

### Adding a New LLM Provider

1. **Add provider to env**:
   ```
   LLM_PROVIDER=new-llm
   NEW_LLM_API_KEY=***
   ```

2. **Implement in LLM Service**:
   ```typescript
   private async callNewLLMAPI(systemPrompt: string, userPrompt: string) {
     // Implementation
   }
   ```

3. **Route in generateSQL**:
   ```typescript
   if (this.provider === 'new-llm') {
     return this.callNewLLMAPI(systemPrompt, userPrompt);
   }
   ```

### Error Handling

Create typed errors:
```typescript
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Usage
throw new ValidationError('Invalid schema');
```

---

## Performance Optimization

### 1. Caching (Future)

```typescript
// Simple cache
private cache = new Map<string, SQLGenerationResult>();

async generateSQL(input: ParsePromptInput) {
  const cacheKey = JSON.stringify(input);
  if (this.cache.has(cacheKey)) {
    return this.cache.get(cacheKey)!;
  }
  
  const result = await this.callLLM(...);
  this.cache.set(cacheKey, result);
  return result;
}
```

### 2. Parallel Requests

```typescript
// Don't await sequentially
const results = await Promise.all([
  service1.doWork(),
  service2.doWork(),
  service3.doWork()
]);
```

### 3. Connection Pooling (Future)

For database connections in consuming applications:
```typescript
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000
});
```

---

## Deployment

### Docker (Optional)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/app.js"]
```

### Environment Variables for Production

```
NODE_ENV=production
PORT=3000
LLM_PROVIDER=claude
CLAUDE_API_KEY=***
LOG_LEVEL=info
```

### Monitoring

Consider adding:
- Request logging (Morgan)
- Error tracking (Sentry)
- Performance monitoring (Datadog)

---

## Troubleshooting

### Issue: LLM API Key Not Working

1. Verify key is valid in `.env`
2. Check API provider quotas
3. Ensure correct provider is set (`LLM_PROVIDER`)

### Issue: TypeScript Compilation Errors

```bash
# Clear cache and rebuild
rm -rf dist/
npm run build
```

### Issue: Port Already in Use

```bash
# Change PORT in .env or find process:
lsof -i :3000
kill -9 <PID>
```

---

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Zod Documentation](https://zod.dev/)
- [Claude API Docs](https://docs.anthropic.com/)
- [OpenAI API Docs](https://platform.openai.com/docs/)

---

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test thoroughly
3. Commit with clear messages: `git commit -m "Add: new feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Create a Pull Request

---

## Support

For questions or issues:
1. Check existing documentation
2. Review architecture decisions
3. Open an issue with detailed information
