import axios from 'axios';
import { ParsePromptInput } from '../schemas/parseSchema';

interface SQLGenerationResult {
  sql: string;
  parameters: any[];
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
}

class LLMService {
  private apiKey: string = '';
  private provider: string;
  private ollamaBaseUrl: string;
  private ollamaModel: string;

  constructor() {
    this.provider = process.env.LLM_PROVIDER || 'ollama';
    this.ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.ollamaModel = process.env.OLLAMA_MODEL || 'phi4-mini';
    
    // API key only required for Claude and OpenAI
    if (this.provider === 'claude') {
      this.apiKey = process.env.CLAUDE_API_KEY || '';
      if (!this.apiKey) {
        throw new Error('Missing CLAUDE_API_KEY in environment');
      }
    } else if (this.provider === 'openai') {
      this.apiKey = process.env.OPENAI_API_KEY || '';
      if (!this.apiKey) {
        throw new Error('Missing OPENAI_API_KEY in environment');
      }
    } else if (this.provider !== 'ollama') {
      throw new Error(`Unknown LLM_PROVIDER: ${this.provider}. Use: ollama, claude, or openai`);
    }
  }

  async generateSQL(input: ParsePromptInput): Promise<SQLGenerationResult> {
    const systemPrompt = this.buildSystemPrompt(input);
    const userPrompt = `Convert this prompt to SQL: "${input.prompt}"`;

    if (this.provider === 'ollama') {
      return this.callOllamaAPI(systemPrompt, userPrompt);
    } else if (this.provider === 'claude') {
      return this.callClaudeAPI(systemPrompt, userPrompt);
    } else {
      return this.callOpenAIAPI(systemPrompt, userPrompt);
    }
  }

  private buildSystemPrompt(input: ParsePromptInput): string {
    return `You are an SQL expert that converts natural language to SQL queries.
Database Type: ${input.database_type}
Table: ${input.schema.table}
Columns: ${input.schema.columns.join(', ')}

Rules:
1. Always use parameterized queries (e.g., $1, $2 for PostgreSQL)
2. Extract parameters separately
3. Return JSON format: {"sql": "...", "parameters": [...], "operation": "INSERT|SELECT|UPDATE|DELETE"}
4. Validate column names against the schema
5. Use appropriate SQL syntax for the database type`;
  }

  private async callOllamaAPI(systemPrompt: string, userPrompt: string): Promise<SQLGenerationResult> {
    try {
      const response = await axios.post(
        `${this.ollamaBaseUrl}/api/generate`,
        {
          model: this.ollamaModel,
          prompt: `${systemPrompt}\n\nUser: ${userPrompt}\n\nAssistant:`,
          stream: false,
          temperature: 0.2
        }
      );

      const content = response.data.response;
      return this.parseJSONResponse(content);
    } catch (error: any) {
      throw new Error(`Ollama API error: ${error.message}. Make sure Ollama is running on ${this.ollamaBaseUrl}`);
    }
  }

  private async callClaudeAPI(systemPrompt: string, userPrompt: string): Promise<SQLGenerationResult> {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1024,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: userPrompt
            }
          ]
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
          }
        }
      );

      const content = response.data.content[0].text;
      return this.parseJSONResponse(content);
    } catch (error: any) {
      throw new Error(`Claude API error: ${error.message}`);
    }
  }

  private async callOpenAIAPI(systemPrompt: string, userPrompt: string): Promise<SQLGenerationResult> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          temperature: 0.2
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      const content = response.data.choices[0].message.content;
      return this.parseJSONResponse(content);
    } catch (error: any) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  private parseJSONResponse(content: string): SQLGenerationResult {
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      const parsed = JSON.parse(jsonStr);

      return {
        sql: parsed.sql,
        parameters: parsed.parameters || [],
        operation: parsed.operation || 'SELECT'
      };
    } catch (error) {
      throw new Error(`Failed to parse LLM response: ${content}`);
    }
  }
}

export default new LLMService();
