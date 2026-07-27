import { z } from 'zod';
import { mediaAssetSchema } from '../primitives/media';

export const bootstrapPromotionSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    eyebrow: z.string().optional(),
    description: z.string().optional(),
    placement: z.string(),
    priority: z.number().default(0),
    desktopImage: mediaAssetSchema.optional(),
    mobileImage: mediaAssetSchema.optional(),
  })
  .passthrough();

export type BootstrapPromotion = z.infer<typeof bootstrapPromotionSchema>;
