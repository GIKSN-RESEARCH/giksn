import { z } from "zod";

export const categorySchema = z.enum(["AI", "DT", "HW", "DS", "UP"]);
export const kindSchema = z.enum(["Original", "Survey"]);
export const statusSchema = z.enum([
  "Exploration",
  "Draft",
  "Preprint",
  "Published",
  "Landmark",
  "Product",
]);

export const paperSectionSchema = z.object({
  heading: z.string().min(1).max(200).optional(),
  paragraphs: z.array(z.string().min(1).max(8000)).optional(),
  list: z.array(z.string().min(1).max(2000)).optional(),
  pullquote: z.string().min(1).max(800).optional(),
});

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
