import { z } from 'zod';

export const parsePromptSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty'),
  database_type: z.enum(['postgresql', 'mysql', 'sqlite', 'mssql']),
  schema: z.object({
    table: z.string(),
    columns: z.array(z.string()),
    primary_key: z.string().optional(),
    relationships: z.record(z.string()).optional()
  })
});

export type ParsePromptInput = z.infer<typeof parsePromptSchema>;
