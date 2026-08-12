import { z } from "zod";

export const categorySchema = z.enum(["AI", "DT", "HW", "DS", "UP"]);
export const kindSchema = z.enum(["Original", "Survey"]);
export const statusSchema = z.enum([
  "Research",
  "Writings",
  "Products",
  "Programs",
]);

const bodyBlockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("paragraph"),
    text: z.string().min(1).max(8000),
  }),
  z.object({
    type: z.literal("list"),
    items: z.array(z.string().min(1).max(2000)).min(1).max(80),
  }),
  z.object({
    type: z.literal("pullquote"),
    text: z.string().min(1).max(800),
  }),
  z.object({
    type: z.literal("heading"),
    level: z.union([z.literal(2), z.literal(3), z.literal(4)]),
    text: z.string().min(1).max(200),
  }),
  z.object({
    type: z.literal("code"),
    lang: z.string().max(40).optional(),
    code: z.string().min(1).max(16000),
  }),
  z.object({
    type: z.literal("table"),
    headers: z.array(z.string().max(500)).min(1).max(12),
    rows: z
      .array(z.array(z.string().max(2000)).min(1).max(12))
      .max(50),
    align: z
      .array(z.enum(["left", "center", "right"]))
      .optional(),
  }),
]);

export const paperSectionSchema = z
  .object({
    heading: z.string().min(1).max(200).optional(),
    blocks: z.array(bodyBlockSchema).max(120).optional(),
    paragraphs: z.array(z.string().min(1).max(8000)).optional(),
    list: z.array(z.string().min(1).max(2000)).optional(),
    pullquote: z.string().min(1).max(800).optional(),
  })
  .refine(
    (s) =>
      Boolean(
        s.heading ||
          (s.blocks && s.blocks.length > 0) ||
          (s.paragraphs && s.paragraphs.length > 0) ||
          (s.list && s.list.length > 0) ||
          s.pullquote
      ),
    { message: "Each section needs a heading or at least one block." }
  );

const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createPaperSchema = z.object({
  category: categorySchema,
  kind: kindSchema.optional(),
  slug: z
    .string()
    .min(3)
    .max(160)
    .regex(slugRe, "Use kebab-case (lowercase letters, digits, hyphens)."),
  title: z.string().min(8).max(200),
  abstract: z.string().min(40).max(800),
  author: z.string().min(2).max(120),
  authorHandle: z.string().min(2).max(200),
  source: z.string().min(2).max(160).optional(),
  body: z.array(paperSectionSchema).min(1).max(40),
  status: statusSchema.optional(),
  readingMinutes: z.number().int().min(1).max(60).optional(),
});

export const updateStatusSchema = z.object({
  status: statusSchema,
});

export const updatePaperSchema = z
  .object({
    status: statusSchema.optional(),
    hidden: z.boolean().optional(),
    featured: z.boolean().optional(),
  })
  .refine(
    (d) =>
      d.status !== undefined ||
      d.hidden !== undefined ||
      d.featured !== undefined,
    { message: "Provide at least one of: status, hidden, featured." }
  );

export const createCommentSchema = z.object({
  author: z.string().min(2).max(120),
  handle: z.string().min(2).max(80),
  body: z.string().min(2).max(5000),
  parentId: z.string().uuid().optional(),
});

export type CreatePaperInput = z.infer<typeof createPaperSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
