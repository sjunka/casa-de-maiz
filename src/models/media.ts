import { z } from 'zod';

export const mediaSizeSchema = z.object({
  url: z.string().nullable().optional(),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
});

export const mediaAssetSchema = z.object({
  url: z.string(),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  alt: z.string().default(''),
  sizes: z.record(z.string(), mediaSizeSchema).optional(),
});

export type MediaAsset = z.infer<typeof mediaAssetSchema>;
