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

export const productStatusSchema = z.enum(["Alpha", "Beta", "Stable"]);
export const productSectorSchema = z.enum(["AI", "DT", "HW", "DS"]);

const productLinkSchema = z.object({
  label: z.string().min(1).max(80),
  href: z.string().min(1).max(400),
  primary: z.boolean().optional(),
});

const productInstallSchema = z.object({
  label: z.string().min(1).max(80),
  command: z.string().min(1).max(400),
});

const productPaperRefSchema = z.object({
  category: productSectorSchema,
  slug: z.string().min(3).max(160).regex(slugRe),
  label: z.string().min(1).max(80),
});

export const updateProductSchema = z
  .object({
    name: z.string().min(2).max(80).optional(),
    tagline: z.string().min(8).max(200).optional(),
    version: z
      .string()
      .max(40)
      .regex(/^[0-9A-Za-z._-]*$/, "Use a version like 0.1.8")
      .nullable()
      .optional(),
    status: productStatusSchema.optional(),
    license: z.string().min(2).max(80).optional(),
    website: z
      .string()
      .max(400)
      .nullable()
      .optional()
      .refine(
        (v) => !v || /^https?:\/\/.+/i.test(v),
        "Use a full URL starting with http:// or https://"
      ),
    category: productSectorSchema.optional(),
    description: z.string().min(20).max(2000).optional(),
    highlights: z.array(z.string().min(1).max(400)).max(12).optional(),
    install: productInstallSchema.nullable().optional(),
    paperRef: productPaperRefSchema.nullable().optional(),
    links: z.array(productLinkSchema).max(12).optional(),
    listed: z.boolean().optional(),
  })
  .refine((d) => Object.values(d).some((v) => v !== undefined), {
    message: "Provide at least one field to update.",
  });

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const createProductSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(80)
    .regex(slugRe, "Use kebab-case (lowercase letters, digits, hyphens)."),
  name: z.string().min(2).max(80),
  tagline: z.string().min(8).max(200),
  version: z
    .string()
    .max(40)
    .regex(/^[0-9A-Za-z._-]*$/, "Use a version like 0.1.8")
    .optional()
    .or(z.literal("")),
  status: productStatusSchema.optional(),
  license: z.string().min(2).max(80),
  website: z
    .string()
    .max(400)
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || /^https?:\/\/.+/i.test(v),
      "Use a full URL starting with http:// or https://"
    ),
  category: productSectorSchema,
  description: z.string().min(20).max(2000),
  highlights: z.array(z.string().min(1).max(400)).max(12).optional(),
  install: productInstallSchema.nullable().optional(),
  paperRef: productPaperRefSchema.nullable().optional(),
  links: z.array(productLinkSchema).max(12).optional(),
  listed: z.boolean().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const programStatusSchema = z.enum([
  "Open",
  "Upcoming",
  "Rolling",
  "Closed",
]);

const programWebsiteSchema = z
  .string()
  .max(400)
  .nullable()
  .optional()
  .refine(
    (v) => !v || /^https?:\/\/.+/i.test(v),
    "Paste a full URL starting with http:// or https://"
  );

export const createProgramSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(80)
    .regex(slugRe, "Use kebab-case (lowercase letters, digits, hyphens)."),
  name: z.string().min(2).max(80),
  tagline: z.string().min(8).max(200),
  status: programStatusSchema.optional(),
  startsOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .nullable()
    .optional(),
  endsOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .nullable()
    .optional(),
  tentativeStart: z.string().max(80).nullable().optional(),
  website: programWebsiteSchema,
  category: productSectorSchema.optional(),
  sectors: z.array(z.string().min(1).max(40)).min(1).max(12),
  description: z.string().min(20).max(8000),
  highlights: z.array(z.string().min(1).max(800)).max(20).optional(),
  listed: z.boolean().optional(),
});

export const updateProgramSchema = z
  .object({
    name: z.string().min(2).max(80).optional(),
    tagline: z.string().min(8).max(200).optional(),
    status: programStatusSchema.optional(),
    startsOn: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
      .nullable()
      .optional(),
    endsOn: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
      .nullable()
      .optional(),
    tentativeStart: z.string().max(80).nullable().optional(),
    website: z
      .string()
      .max(400)
      .nullable()
      .optional()
      .refine(
        (v) => !v || /^https?:\/\/.+/i.test(v),
        "Use a full URL starting with http:// or https://"
      ),
    category: productSectorSchema.optional(),
    sectors: z.array(z.string().min(1).max(40)).min(1).max(12).optional(),
    description: z.string().min(20).max(8000).optional(),
    highlights: z.array(z.string().min(1).max(800)).max(20).optional(),
    listed: z.boolean().optional(),
  })
  .refine((d) => Object.values(d).some((v) => v !== undefined), {
    message: "Provide at least one field to update.",
  });

export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;

const newsHrefSchema = z
  .string()
  .max(400)
  .optional()
  .or(z.literal(""))
  .refine(
    (v) => !v || /^https?:\/\/.+/i.test(v),
    "Paste a full URL starting with http:// or https://"
  );

export const createNewsSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(80)
    .regex(slugRe, "Use kebab-case (lowercase letters, digits, hyphens)."),
  title: z.string().min(4).max(200),
  href: newsHrefSchema,
  listed: z.boolean().optional(),
});

export const updateNewsSchema = z
  .object({
    title: z.string().min(4).max(200).optional(),
    href: z
      .string()
      .max(400)
      .nullable()
      .optional()
      .refine(
        (v) => !v || /^https?:\/\/.+/i.test(v),
        "Paste a full URL starting with http:// or https://"
      ),
    listed: z.boolean().optional(),
  })
  .refine((d) => Object.values(d).some((v) => v !== undefined), {
    message: "Provide at least one field to update.",
  });

export type CreateNewsInput = z.infer<typeof createNewsSchema>;
export type UpdateNewsInput = z.infer<typeof updateNewsSchema>;
