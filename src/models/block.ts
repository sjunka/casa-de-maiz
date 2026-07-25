import { z } from 'zod';
import { mediaAssetSchema } from './media';

const platformSchema = z.enum(['ios', 'android']);

const blockBaseSchema = z.object({
  contractVersion: z.string(),
  channels: z.array(platformSchema).default(['ios', 'android']),
});

export const cardGridBlockSchema = blockBaseSchema.extend({
  blockType: z.literal('cardGrid'),
  cards: z
    .array(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        image: mediaAssetSchema.optional(),
        mobileImage: mediaAssetSchema.optional(),
      }),
    )
    .default([]),
});
export type CardGridBlock = z.infer<typeof cardGridBlockSchema>;

export const carouselBlockSchema = blockBaseSchema.extend({
  blockType: z.literal('carousel'),
  slides: z
    .array(
      z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        image: mediaAssetSchema.optional(),
        mobileImage: mediaAssetSchema.optional(),
      }),
    )
    .default([]),
});
export type CarouselBlock = z.infer<typeof carouselBlockSchema>;

export const promoRailBlockSchema = blockBaseSchema.extend({
  blockType: z.literal('promoRail'),
  heading: z.string().optional(),
  promotions: z
    .array(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        image: mediaAssetSchema.optional(),
        mobileImage: mediaAssetSchema.optional(),
      }),
    )
    .default([]),
});
export type PromoRailBlock = z.infer<typeof promoRailBlockSchema>;

export const textBlockSchema = blockBaseSchema.extend({
  blockType: z.literal('textBlock'),
  heading: z.string().optional(),
  body: z.string().default(''),
});
export type TextBlock = z.infer<typeof textBlockSchema>;

export const restaurantCtaBlockSchema = blockBaseSchema.extend({
  blockType: z.literal('restaurantCTA'),
  heading: z.string(),
  description: z.string().optional(),
  image: mediaAssetSchema.optional(),
  mobileImage: mediaAssetSchema.optional(),
  buttonLabel: z.string(),
  destination: z.string(),
});
export type RestaurantCtaBlock = z.infer<typeof restaurantCtaBlockSchema>;

export const KNOWN_BLOCK_SCHEMAS = {
  cardGrid: cardGridBlockSchema,
  carousel: carouselBlockSchema,
  promoRail: promoRailBlockSchema,
  textBlock: textBlockSchema,
  restaurantCTA: restaurantCtaBlockSchema,
} as const;

export type KnownBlockType = keyof typeof KNOWN_BLOCK_SCHEMAS;

export type Block =
  | CardGridBlock
  | CarouselBlock
  | PromoRailBlock
  | TextBlock
  | RestaurantCtaBlock;

export const blockEnvelopeSchema = z
  .object({
    blockType: z.string(),
  })
  .passthrough();

export type BlockEnvelope = z.infer<typeof blockEnvelopeSchema>;
