import { Request, Response } from 'express';
import { parsePromptSchema } from '../schemas/parseSchema';
import llmService from '../services/llmService';
import sqlValidator from '../utils/sqlValidator';

class ParseController {
  async parsePrompt(data: any) {
    try {
      // Validate input
      const validatedData = parsePromptSchema.parse(data);

      // Call LLM service to generate SQL
      const sqlResult = await llmService.generateSQL(validatedData);

      // Validate generated SQL
      const validation = sqlValidator.validate(sqlResult.sql, validatedData.database_type);

      return {
        success: true,
        sql: sqlResult.sql,
        parameters: sqlResult.parameters,
        operation: sqlResult.operation,
        validation_status: validation.valid ? 'success' : 'warning',
        warnings: validation.warnings || []
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new ParseController();
