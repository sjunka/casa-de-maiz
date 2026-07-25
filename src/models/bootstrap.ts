import { z } from 'zod';

export const bootstrapDataSchema = z.object({}).passthrough();

export type BootstrapData = z.infer<typeof bootstrapDataSchema>;
