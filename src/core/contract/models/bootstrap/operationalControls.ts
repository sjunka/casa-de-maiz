import { z } from 'zod';

export const appUpdateSchema = z
  .object({
    policy: z.string(),
    minimumVersion: z.string().optional(),
    recommendedVersion: z.string().optional(),
    message: z.string(),
  })
  .passthrough();

export type AppUpdate = z.infer<typeof appUpdateSchema>;

export const operationalControlsSchema = z
  .object({
    mode: z.string(),
    bannerMessage: z.string().optional(),
    appUpdate: appUpdateSchema.optional(),
  })
  .passthrough();

export type OperationalControls = z.infer<typeof operationalControlsSchema>;
