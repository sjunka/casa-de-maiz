import { z } from 'zod';

export type RichTextNode = {
  type: string;
  children?: RichTextNode[];
  text?: string;
  format?: number | string;
  tag?: string;
  listType?: string;
  fields?: { url?: string } & Record<string, unknown>;
  [key: string]: unknown;
};

const richTextNodeSchema: z.ZodType<RichTextNode> = z.lazy(() =>
  z
    .object({
      type: z.string(),
      children: z.array(richTextNodeSchema).optional(),
      text: z.string().optional(),
      format: z.union([z.number(), z.string()]).optional(),
      tag: z.string().optional(),
      listType: z.string().optional(),
      fields: z.object({ url: z.string().optional() }).passthrough().optional(),
    })
    .passthrough(),
);

export const richTextSchema = z.object({
  root: z
    .object({
      children: z.array(richTextNodeSchema).default([]),
    })
    .passthrough(),
});

export type RichTextDocument = z.infer<typeof richTextSchema>;
