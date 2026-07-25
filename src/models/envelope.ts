import { z } from 'zod';

export const envelopeSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    contractVersion: z.string(),
    data: dataSchema,
    nextChangeAt: z.string().nullable(),
    preview: z.boolean(),
    resolvedContext: z.record(z.string(), z.unknown()),
  });

export type Envelope<T extends z.ZodTypeAny> = z.infer<
  ReturnType<typeof envelopeSchema<T>>
>;
