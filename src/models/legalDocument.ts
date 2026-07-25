import { z } from 'zod';
import { richTextSchema } from './richText';

export const legalDocumentDataSchema = z
  .object({
    title: z.string(),
    summary: z.string().optional(),
    body: richTextSchema,
  })
  .passthrough();

export type LegalDocumentData = z.infer<typeof legalDocumentDataSchema>;
