import { z } from 'zod';

const alertActionSchema = z
  .object({
    href: z.string(),
    label: z.string(),
  })
  .passthrough();

const alertTriggerSchema = z
  .object({
    type: z.string(),
    delayMs: z.number().optional(),
  })
  .passthrough();

const alertFrequencySchema = z
  .object({
    type: z.string(),
    cooldownHours: z.number().optional(),
  })
  .passthrough();

export const alertSchema = z
  .object({
    id: z.string(),
    title: z.string().optional(),
    message: z.string(),
    placement: z.string(),
    trigger: alertTriggerSchema,
    dismissible: z.boolean().default(false),
    frequency: alertFrequencySchema.optional(),
    pageSlugs: z.array(z.string()).default([]),
    priority: z.number().default(0),
    actions: z.array(alertActionSchema).default([]),
  })
  .passthrough();

export type Alert = z.infer<typeof alertSchema>;
