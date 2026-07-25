import { z } from 'zod';
import { blockEnvelopeSchema } from './block';

export const homeDataSchema = z
  .object({
    layout: z.array(blockEnvelopeSchema).default([]),
  })
  .passthrough();

export type HomeData = z.infer<typeof homeDataSchema>;
