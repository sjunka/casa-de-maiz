import { z } from 'zod';
import { blockEnvelopeSchema } from '../blocks/block';

export const menuDataSchema = z
  .object({
    layout: z.array(blockEnvelopeSchema).default([]),
  })
  .passthrough();

export type MenuData = z.infer<typeof menuDataSchema>;
