import { z } from 'zod';
import { mediaAssetSchema } from './media';
import { richTextSchema } from './richText';

const blockBaseSchema = z.object({
  contractVersion: z.string(),
  channels: z.array(z.string()).default([]),
});

export const cardGridBlockSchema = blockBaseSchema.extend({
  blockType: z.literal('cardGrid'),
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  cards: z
    .array(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        price: z.string().optional(),
        image: mediaAssetSchema.optional(),
      }),
    )
    .default([]),
});
export type CardGridBlock = z.infer<typeof cardGridBlockSchema>;

export const carouselBlockSchema = blockBaseSchema.extend({
  blockType: z.literal('carousel'),
  title: z.string().optional(),
  slides: z
    .array(
      z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        image: mediaAssetSchema.optional(),
      }),
    )
    .default([]),
});
export type CarouselBlock = z.infer<typeof carouselBlockSchema>;

export const promoRailBlockSchema = blockBaseSchema.extend({
  blockType: z.literal('promoRail'),
  title: z.string().optional(),
  promotions: z
    .array(
      z.object({
        title: z.string(),
        eyebrow: z.string().optional(),
        description: z.string().optional(),
        desktopImage: mediaAssetSchema.optional(),
        mobileImage: mediaAssetSchema.optional(),
      }),
    )
    .default([]),
});
export type PromoRailBlock = z.infer<typeof promoRailBlockSchema>;

export const textBlockSchema = blockBaseSchema.extend({
  blockType: z.literal('textBlock'),
  eyebrow: z.string().optional(),
  heading: z.string().optional(),
  body: z.string().default(''),
  alignment: z.enum(['left', 'center', 'right']).optional(),
});
export type TextBlock = z.infer<typeof textBlockSchema>;

export const restaurantCtaBlockSchema = blockBaseSchema.extend({
  blockType: z.literal('restaurantCTA'),
  headline: z.string(),
  description: z.string().optional(),
  label: z.string(),
  href: z.string(),
});
export type RestaurantCtaBlock = z.infer<typeof restaurantCtaBlockSchema>;

export const imageBlockSchema = blockBaseSchema.extend({
  blockType: z.literal('imageBlock'),
  image: mediaAssetSchema.optional(),
  caption: z.string().optional(),
  fullBleed: z.boolean().default(false),
});
export type ImageBlock = z.infer<typeof imageBlockSchema>;

export const formFieldOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const formFieldSchema = z.object({
  blockType: z.string(),
  name: z.string(),
  label: z.string().optional(),
  required: z.boolean().default(false),
  options: z.array(formFieldOptionSchema).optional(),
});
export type FormField = z.infer<typeof formFieldSchema>;

export const formBlockSchema = blockBaseSchema.extend({
  blockType: z.literal('formBlock'),
  form: z.object({
    id: z.union([z.string(), z.number()]),
    fields: z.array(formFieldSchema).default([]),
    submitButtonLabel: z.string().optional(),
    confirmationMessage: z.string().optional(),
  }),
});
export type FormBlock = z.infer<typeof formBlockSchema>;

// Best-effort renderer for block types the contract declares but does not shape.
// All fields optional so the schema can never fail validation and fall through
// to the unknown-block marker (ADR 0008).
export const genericBlockSchema = blockBaseSchema.extend({
  blockType: z.enum(['restaurantHero', 'cta', 'content', 'mediaBlock', 'archive']),
  heading: z.string().optional(),
  title: z.string().optional(),
  richText: richTextSchema.optional(),
  content: richTextSchema.optional(),
  media: mediaAssetSchema.optional(),
  image: mediaAssetSchema.optional(),
  link: z.string().optional(),
  href: z.string().optional(),
  label: z.string().optional(),
});
export type GenericBlock = z.infer<typeof genericBlockSchema>;

export const KNOWN_BLOCK_SCHEMAS = {
  cardGrid: cardGridBlockSchema,
  carousel: carouselBlockSchema,
  promoRail: promoRailBlockSchema,
  textBlock: textBlockSchema,
  restaurantCTA: restaurantCtaBlockSchema,
  imageBlock: imageBlockSchema,
  formBlock: formBlockSchema,
  restaurantHero: genericBlockSchema,
  cta: genericBlockSchema,
  content: genericBlockSchema,
  mediaBlock: genericBlockSchema,
  archive: genericBlockSchema,
} as const;

export type KnownBlockType = keyof typeof KNOWN_BLOCK_SCHEMAS;

export type Block =
  | CardGridBlock
  | CarouselBlock
  | PromoRailBlock
  | TextBlock
  | RestaurantCtaBlock
  | ImageBlock
  | FormBlock
  | GenericBlock;

export const blockEnvelopeSchema = z
  .object({
    blockType: z.string(),
  })
  .passthrough();

export type BlockEnvelope = z.infer<typeof blockEnvelopeSchema>;
