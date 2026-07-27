import { z } from 'zod';
import { richTextSchema } from '../primitives/richText';

export const legalDocumentDataSchema = z
  .object({
    title: z.string(),
    summary: z.string().optional(),
    content: richTextSchema,
  })
  .passthrough();

export type LegalDocumentData = z.infer<typeof legalDocumentDataSchema>;
