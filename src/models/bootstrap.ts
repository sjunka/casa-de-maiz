import { z } from 'zod';
import { alertSchema } from './alert';
import { operationalControlsSchema } from './operationalControls';
import { bootstrapPromotionSchema } from './promotion';

export const cmsDestinationSchema = z.object({
  key: z.string(),
  label: z.string(),
  path: z.string(),
  supportedPlatforms: z.array(z.string()).default([]),
});

const navigationItemSchema = z.object({
  label: z.string(),
  icon: z.string().optional(),
  highlighted: z.boolean().default(false),
  destination: cmsDestinationSchema,
});

const navigationSchema = z
  .object({
    items: z.array(navigationItemSchema).default([]),
  })
  .passthrough();

export const bootstrapDataSchema = z
  .object({
    navigation: navigationSchema.default({ items: [] }),
    alerts: z.array(alertSchema).default([]),
    operationalControls: operationalControlsSchema.optional(),
    featureFlags: z.record(z.string(), z.boolean()).default({}),
    promotions: z.array(bootstrapPromotionSchema).default([]),
  })
  .passthrough();

export type BootstrapData = z.infer<typeof bootstrapDataSchema>;

// The flat shape the tab navigator renders from — decoupled from the CMS's nested
// { items: [{ destination }] } wrapper so the navigator doesn't need to know about it.
export type Destination = {
  key: string;
  path: string;
  label: string;
  platforms: string[];
  highlighted: boolean;
};

export const flattenNavigation = (navigation: BootstrapData['navigation']): Destination[] =>
  navigation.items.map(item => ({
    key: item.destination.key,
    path: item.destination.path,
    label: item.label,
    platforms: item.destination.supportedPlatforms,
    highlighted: item.highlighted,
  }));
