# API Reference

## Base URL
```
http://localhost:3000/api
```

## Authentication
Currently, the API is open. For production, API key authentication should be implemented.

---

## Endpoints

### Parse Natural Language to SQL

**Endpoint:** `POST /api/parse`

**Description:** Convert a natural language prompt into a parameterized SQL query.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "prompt": "add Rice price 100 per kilo",
  "database_type": "postgresql",
  "schema": {
    "table": "products",
    "columns": ["id", "name", "price", "unit"],
    "primary_key": "id",
    "relationships": {}
  }
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `prompt` | string | Yes | Natural language instruction (e.g., "add Rice price 100") |
| `database_type` | enum | Yes | Target database: `postgresql`, `mysql`, `sqlite`, `mssql` |
| `schema.table` | string | Yes | Table name to operate on |
| `schema.columns` | array | Yes | Array of valid column names |
| `schema.primary_key` | string | No | Primary key column name |
| `schema.relationships` | object | No | Foreign key relationships |

#### Response - Success (200)

```json
{
  "success": true,
  "sql": "INSERT INTO products (name, price, unit) VALUES ($1, $2, $3)",
  "parameters": ["Rice", 100, "per kilo"],
  "operation": "INSERT",
  "validation_status": "success",
  "warnings": []
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Whether the parsing was successful |
| `sql` | string | Generated SQL query with parameter placeholders |
| `parameters` | array | Values for the parameterized query |
| `operation` | string | SQL operation type: `SELECT`, `INSERT`, `UPDATE`, `DELETE` |
| `validation_status` | string | `success` or `warning` |
| `warnings` | array | Optional warnings about the generated SQL |

#### Response - Error (400)

```json
{
  "success": false,
  "error": "Validation error: Invalid database type"
}
```

#### Response - Server Error (500)

```json
{
  "success": false,
  "error": "Claude API error: Rate limit exceeded"
}
```

---

## Examples

### Example 1: Insert Operation (PostgreSQL)

**Request:**
```json
POST /api/parse
{
  "prompt": "add a new product: Tomato with price 50 per kg",
  "database_type": "postgresql",
  "schema": {
    "table": "products",
    "columns": ["id", "name", "price", "unit"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "sql": "INSERT INTO products (name, price, unit) VALUES ($1, $2, $3)",
  "parameters": ["Tomato", 50, "per kg"],
  "operation": "INSERT",
  "validation_status": "success",
  "warnings": []
}
```

---

### Example 2: Update Operation (MySQL)

**Request:**
```json
POST /api/parse
{
  "prompt": "update rice price to 120",
  "database_type": "mysql",
  "schema": {
    "table": "products",
    "columns": ["id", "name", "price", "unit"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "sql": "UPDATE products SET price = ? WHERE name = ?",
  "parameters": [120, "rice"],
  "operation": "UPDATE",
  "validation_status": "success",
  "warnings": []
}
```

---

### Example 3: Select/Query Operation (SQLite)

**Request:**
```json
POST /api/parse
{
  "prompt": "show me all products with price less than 100",
  "database_type": "sqlite",
  "schema": {
    "table": "products",
    "columns": ["id", "name", "price", "unit"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "sql": "SELECT * FROM products WHERE price < ?",
  "parameters": [100],
  "operation": "SELECT",
  "validation_status": "success",
  "warnings": []
}
```

---

### Example 4: Delete Operation

**Request:**
```json
POST /api/parse
{
  "prompt": "remove the product called Obsolete Item",
  "database_type": "postgresql",
  "schema": {
    "table": "products",
    "columns": ["id", "name", "price", "unit"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "sql": "DELETE FROM products WHERE name = ?",
  "parameters": ["Obsolete Item"],
  "operation": "DELETE",
  "validation_status": "success",
  "warnings": []
}
```

---

### Example 5: With Warnings

**Request:**
```json
POST /api/parse
{
  "prompt": "add user with email test@example.com",
  "database_type": "postgresql",
  "schema": {
    "table": "users",
    "columns": ["id", "name", "email"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "sql": "INSERT INTO users (email) VALUES ($1)",
  "parameters": ["test@example.com"],
  "operation": "INSERT",
  "validation_status": "warning",
  "warnings": [
    "Column 'name' not provided but exists in schema"
  ]
}
```

---

## Error Handling

### Invalid Request
**Status:** 400 Bad Request

```json
{
  "success": false,
  "error": "Validation error: prompt is required"
}
```

### Invalid Database Type
**Status:** 400 Bad Request

```json
{
  "success": false,
  "error": "Validation error: Invalid database type. Use: postgresql, mysql, sqlite, mssql"
}
```

### LLM Service Unavailable
**Status:** 500 Internal Server Error

```json
{
  "success": false,
  "error": "Claude API error: Connection timeout"
}
```

### Malformed SQL Generation
**Status:** 400 Bad Request

```json
{
  "success": false,
  "error": "Failed to parse LLM response"
}
```

---

## Rate Limiting (Future)

Once implemented, rate limiting headers will be included:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

---

## Best Practices

### 1. Always Use Parameterized Queries
The API always returns parameterized queries. Never interpolate parameters directly into SQL.

```typescript
// ✅ Correct
const query = result.sql;  // "INSERT INTO products (name, price) VALUES ($1, $2)"
const params = result.parameters;  // ["Rice", 100]
connection.query(query, params);

// ❌ Wrong
const badQuery = `INSERT INTO products VALUES ('${result.parameters[0]}', ${result.parameters[1]})`;
```

### 2. Validate Schemas
Ensure your schema accurately represents the database structure.

```json
{
  "schema": {
    "table": "products",
    "columns": ["id", "name", "price", "unit"],
    "primary_key": "id"
  }
}
```

### 3. Handle Warnings
Check the `validation_status` and `warnings` fields:

```typescript
if (result.validation_status === 'warning') {
  console.warn('SQL generated with warnings:', result.warnings);
}
```

### 4. Clear, Specific Prompts
More specific prompts generate more accurate SQL:

```
✅ Good: "add new product Rice with price 100 per kilogram"
✅ Better: "insert into products table, name='Rice', price=100, unit='per kg'"

❌ Vague: "add stuff"
❌ Ambiguous: "update the thing"
```

### 5. Provide Context
Include relationships and constraints in schema:

```json
{
  "schema": {
    "table": "orders",
    "columns": ["id", "user_id", "total", "status"],
    "primary_key": "id",
    "relationships": {
      "user_id": "users.id"
    }
  }
}
```

---

## Database-Specific Notes

### PostgreSQL
- Parameter style: `$1, $2, $3` (positional)
- Best for: Large datasets, complex queries
- Transaction support: Full

```sql
INSERT INTO products (name, price) VALUES ($1, $2)
```

### MySQL
- Parameter style: `?, ?, ?` (positional)
- Best for: Web applications, general purpose
- Transaction support: Full (with InnoDB)

```sql
INSERT INTO products (name, price) VALUES (?, ?)
```

### SQLite
- Parameter style: `?, ?, ?` or `:name` (both supported)
- Best for: Desktop apps, small projects, testing
- Transaction support: Full

```sql
INSERT INTO products (name, price) VALUES (?, ?)
```

### MSSQL
- Parameter style: `@p0, @p1, @p2` (named)
- Best for: Enterprise applications
- Transaction support: Full

```sql
INSERT INTO products (name, price) VALUES (@p0, @p1)
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success - SQL generated |
| 400 | Bad Request - Invalid input or validation error |
| 500 | Server Error - LLM or system error |

---

## Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

---

## Versioning

The API is currently at v1. Future versions may support:
- Complex multi-step queries
- Custom function definitions
- Query optimization hints
- Result validation
