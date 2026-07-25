import { z } from 'zod';

const platformSchema = z.enum(['ios', 'android']);

export const destinationSchema = z.object({
  path: z.string(),
  label: z.string(),
  platforms: z.array(platformSchema),
  highlighted: z.boolean().default(false),
});

export type Destination = z.infer<typeof destinationSchema>;

export const bootstrapDataSchema = z
  .object({
    navigation: z.array(destinationSchema).default([]),
  })
  .passthrough();

export type BootstrapData = z.infer<typeof bootstrapDataSchema>;
