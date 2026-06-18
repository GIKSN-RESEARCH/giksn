"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { and, desc, eq, ne } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import {
  publications,
  insights,
  projects,
  resources,
} from "@/db/schema";
import {
  actionError,
  parseCommaList,
  resolvePublishedAt,
  slugFromTitle,
  slugSchema,
  type ActionResult,
} from "@/lib/admin/utils";
import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth-guard";

// ─── Shared helpers ───────────────────────────────────────────────────────────

async function getActorId() {
  const session = await requireAdmin();
  return session.user.id;
}

async function ensureUniqueSlug<T extends { id: string; slug: string }>(
  fetchExisting: (slug: string) => Promise<T | undefined>,
  slug: string
): Promise<string> {
  let candidate = slug;
  let suffix = 2;

  while (await fetchExisting(candidate)) {
    candidate = `${slug}-${suffix++}`;
  }

  return candidate;
}

function revalidatePublications(slug?: string) {
  revalidateTag("publications", "max");
  revalidatePath("/publications");
  revalidatePath("/");
  revalidatePath("/admin/publications");
  if (slug) revalidatePath(`/publications/${slug}`);
}

function revalidateInsights(slug?: string) {
  revalidateTag("insights", "max");
  revalidatePath("/insights");
  revalidatePath("/");
  revalidatePath("/admin/insights");
  if (slug) revalidatePath(`/insights/${slug}`);
}

function revalidateProjects(slug?: string) {
  revalidateTag("projects", "max");
  revalidatePath("/projects");
  revalidatePath("/admin/projects");
  if (slug) revalidatePath(`/projects/${slug}`);
}

function revalidateResources() {
  revalidateTag("resources", "max");
  revalidatePath("/resources");
  revalidatePath("/admin/resources");
}

// ─── Publications ─────────────────────────────────────────────────────────────

const publicationSchema = z.object({
  title: z.string().min(3).max(200),
  slug: slugSchema,
  abstract: z.string().min(10).max(2000),
  bodyMdx: z.string().min(20),
  type: z.enum(["Paper", "Report", "Preprint", "Explainer"]),
  domains: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  publishedAt: z.string().optional().nullable(),
  authors: z
    .array(z.object({ name: z.string(), profileId: z.string().optional() }))
    .default([]),
  links: z.record(z.string(), z.string()).default({}),
  featured: z.boolean().default(false),
});

export type PublicationFormValues = z.infer<typeof publicationSchema>;

export async function listPublications() {
  await requireAdmin();
  return db.select().from(publications).orderBy(desc(publications.createdAt));
}

export async function createPublication(
  formData: PublicationFormValues
): Promise<ActionResult<{ id: string }>> {
  try {
    const actorId = await getActorId();
    const data = publicationSchema.parse(formData);
    const now = new Date();

    const slug = await ensureUniqueSlug(async (candidate) => {
      const [row] = await db
        .select()
        .from(publications)
        .where(eq(publications.slug, candidate))
        .limit(1);
      return row;
    }, data.slug);

    const publishedAt = resolvePublishedAt(data.status, null, data.publishedAt);

    const [row] = await db
      .insert(publications)
      .values({
        ...data,
        slug,
        authorId: actorId,
        publishedAt,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: publications.id });

    revalidatePublications(slug);
    return { success: true, data: { id: row.id } };
  } catch (error) {
    return actionError(error);
  }
}

export async function updatePublication(
  id: string,
  formData: PublicationFormValues
): Promise<ActionResult<{ id: string }>> {
  try {
    const actorId = await getActorId();
    const data = publicationSchema.parse(formData);
    const now = new Date();

    const [existing] = await db
      .select()
      .from(publications)
      .where(eq(publications.id, id))
      .limit(1);

    if (!existing) return { success: false, error: "Publication not found" };

    const slug = await ensureUniqueSlug(async (candidate) => {
      const [row] = await db
        .select()
        .from(publications)
        .where(and(eq(publications.slug, candidate), ne(publications.id, id)))
        .limit(1);
      return row;
    }, data.slug);

    const publishedAt = resolvePublishedAt(
      data.status,
      existing.publishedAt,
      data.publishedAt
    );

    await db
      .update(publications)
      .set({
        ...data,
        slug,
        authorId: actorId,
        publishedAt,
        updatedAt: now,
      })
      .where(eq(publications.id, id));

    revalidatePublications(slug);
    if (existing.slug !== slug) revalidatePublications(existing.slug);
    return { success: true, data: { id } };
  } catch (error) {
    return actionError(error);
  }
}

export async function deletePublication(id: string): Promise<ActionResult> {
  try {
    const actorId = await getActorId();

    const [existing] = await db
      .select({ slug: publications.slug })
      .from(publications)
      .where(eq(publications.id, id))
      .limit(1);

    await db.delete(publications).where(eq(publications.id, id));

    await logAdminAction({
      actorId,
      action: "delete",
      entityType: "publication",
      entityId: id,
    });

    revalidatePublications(existing?.slug);
    return { success: true, data: undefined };
  } catch (error) {
    return actionError(error);
  }
}

export async function togglePublishPublication(
  id: string,
  publish: boolean
): Promise<ActionResult> {
  try {
    const actorId = await getActorId();
    const now = new Date();

    const [existing] = await db
      .select({ slug: publications.slug, publishedAt: publications.publishedAt })
      .from(publications)
      .where(eq(publications.id, id))
      .limit(1);

    await db
      .update(publications)
      .set({
        status: publish ? "published" : "draft",
        publishedAt: publish ? existing?.publishedAt ?? now : null,
        updatedAt: now,
      })
      .where(eq(publications.id, id));

    await logAdminAction({
      actorId,
      action: publish ? "publish" : "unpublish",
      entityType: "publication",
      entityId: id,
    });

    revalidatePublications(existing?.slug);
    return { success: true, data: undefined };
  } catch (error) {
    return actionError(error);
  }
}

export async function toggleFeaturePublication(
  id: string,
  featured: boolean
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const [existing] = await db
      .select({ slug: publications.slug })
      .from(publications)
      .where(eq(publications.id, id))
      .limit(1);

    await db
      .update(publications)
      .set({ featured, updatedAt: new Date() })
      .where(eq(publications.id, id));

    revalidatePublications(existing?.slug);
    return { success: true, data: undefined };
  } catch (error) {
    return actionError(error);
  }
}

// ─── Insights ─────────────────────────────────────────────────────────────────

const insightSchema = z.object({
  title: z.string().min(3).max(200),
  slug: slugSchema,
  excerpt: z.string().min(10).max(2000),
  bodyMdx: z.string().min(20),
  category: z.enum([
    "Tooling & Use Cases",
    "Frontier Analysis",
    "Cross-Domain Thinking",
    "Community Spotlights",
  ]),
  domains: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  coverImageUrl: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v?.trim() ? v.trim() : null))
    .pipe(z.union([z.string().url(), z.null()])),
  substackUrl: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v?.trim() ? v.trim() : null))
    .pipe(z.union([z.string().url(), z.null()])),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  publishedAt: z.string().optional().nullable(),
  featured: z.boolean().default(false),
});

export type InsightFormValues = z.infer<typeof insightSchema>;

export async function listInsights() {
  await requireAdmin();
  return db.select().from(insights).orderBy(desc(insights.createdAt));
}

export async function createInsight(
  formData: InsightFormValues
): Promise<ActionResult<{ id: string }>> {
  try {
    const actorId = await getActorId();
    const data = insightSchema.parse(formData);
    const now = new Date();

    const slug = await ensureUniqueSlug(async (candidate) => {
      const [row] = await db
        .select()
        .from(insights)
        .where(eq(insights.slug, candidate))
        .limit(1);
      return row;
    }, data.slug);

    const publishedAt = resolvePublishedAt(data.status, null, data.publishedAt);

    const [row] = await db
      .insert(insights)
      .values({
        ...data,
        slug,
        coverImageUrl: data.coverImageUrl ?? null,
        substackUrl: data.substackUrl ?? null,
        authorId: actorId,
        publishedAt,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: insights.id });

    revalidateInsights(slug);
    return { success: true, data: { id: row.id } };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateInsight(
  id: string,
  formData: InsightFormValues
): Promise<ActionResult<{ id: string }>> {
  try {
    const actorId = await getActorId();
    const data = insightSchema.parse(formData);
    const now = new Date();

    const [existing] = await db
      .select()
      .from(insights)
      .where(eq(insights.id, id))
      .limit(1);

    if (!existing) return { success: false, error: "Insight not found" };

    const slug = await ensureUniqueSlug(async (candidate) => {
      const [row] = await db
        .select()
        .from(insights)
        .where(and(eq(insights.slug, candidate), ne(insights.id, id)))
        .limit(1);
      return row;
    }, data.slug);

    const publishedAt = resolvePublishedAt(
      data.status,
      existing.publishedAt,
      data.publishedAt
    );

    await db
      .update(insights)
      .set({
        ...data,
        slug,
        coverImageUrl: data.coverImageUrl ?? null,
        substackUrl: data.substackUrl ?? null,
        authorId: actorId,
        publishedAt,
        updatedAt: now,
      })
      .where(eq(insights.id, id));

    revalidateInsights(slug);
    if (existing.slug !== slug) revalidateInsights(existing.slug);
    return { success: true, data: { id } };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteInsight(id: string): Promise<ActionResult> {
  try {
    const actorId = await getActorId();

    const [existing] = await db
      .select({ slug: insights.slug })
      .from(insights)
      .where(eq(insights.id, id))
      .limit(1);

    await db.delete(insights).where(eq(insights.id, id));

    await logAdminAction({
      actorId,
      action: "delete",
      entityType: "insight",
      entityId: id,
    });

    revalidateInsights(existing?.slug);
    return { success: true, data: undefined };
  } catch (error) {
    return actionError(error);
  }
}

export async function togglePublishInsight(
  id: string,
  publish: boolean
): Promise<ActionResult> {
  try {
    const actorId = await getActorId();
    const now = new Date();

    const [existing] = await db
      .select({ slug: insights.slug, publishedAt: insights.publishedAt })
      .from(insights)
      .where(eq(insights.id, id))
      .limit(1);

    await db
      .update(insights)
      .set({
        status: publish ? "published" : "draft",
        publishedAt: publish ? existing?.publishedAt ?? now : null,
        updatedAt: now,
      })
      .where(eq(insights.id, id));

    await logAdminAction({
      actorId,
      action: publish ? "publish" : "unpublish",
      entityType: "insight",
      entityId: id,
    });

    revalidateInsights(existing?.slug);
    return { success: true, data: undefined };
  } catch (error) {
    return actionError(error);
  }
}

export async function toggleFeatureInsight(
  id: string,
  featured: boolean
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const [existing] = await db
      .select({ slug: insights.slug })
      .from(insights)
      .where(eq(insights.id, id))
      .limit(1);

    await db
      .update(insights)
      .set({ featured, updatedAt: new Date() })
      .where(eq(insights.id, id));

    revalidateInsights(existing?.slug);
    return { success: true, data: undefined };
  } catch (error) {
    return actionError(error);
  }
}

// ─── Projects ─────────────────────────────────────────────────────────────────

const projectSchema = z.object({
  title: z.string().min(3).max(200),
  slug: slugSchema,
  description: z.string().min(10).max(2000),
  bodyMdx: z.string().min(1),
  status: z.enum([
    "Active",
    "Open for Contributors",
    "Completed",
    "Exploratory",
  ]),
  visibility: z.enum(["public", "contributor"]).default("public"),
  domains: z.array(z.string()).default([]),
  goals: z.array(z.string()).default([]),
  repo: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v?.trim() ? v.trim() : null))
    .pipe(z.union([z.string().url(), z.null()])),
  contact: z.string().optional().nullable(),
  featured: z.boolean().default(false),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

export async function listProjects() {
  await requireAdmin();
  return db.select().from(projects).orderBy(desc(projects.createdAt));
}

export async function createProject(
  formData: ProjectFormValues
): Promise<ActionResult<{ id: string }>> {
  try {
    const actorId = await getActorId();
    const data = projectSchema.parse(formData);
    const now = new Date();

    const slug = await ensureUniqueSlug(async (candidate) => {
      const [row] = await db
        .select()
        .from(projects)
        .where(eq(projects.slug, candidate))
        .limit(1);
      return row;
    }, data.slug);

    const [row] = await db
      .insert(projects)
      .values({
        ...data,
        slug,
        repo: data.repo ?? null,
        contact: data.contact ?? null,
        leads: [],
        outputs: [],
        authorId: actorId,
        publishedAt: data.visibility === "public" ? now : null,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: projects.id });

    revalidateProjects(slug);
    return { success: true, data: { id: row.id } };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateProject(
  id: string,
  formData: ProjectFormValues
): Promise<ActionResult<{ id: string }>> {
  try {
    const actorId = await getActorId();
    const data = projectSchema.parse(formData);
    const now = new Date();

    const [existing] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (!existing) return { success: false, error: "Project not found" };

    const slug = await ensureUniqueSlug(async (candidate) => {
      const [row] = await db
        .select()
        .from(projects)
        .where(and(eq(projects.slug, candidate), ne(projects.id, id)))
        .limit(1);
      return row;
    }, data.slug);

    const publishedAt =
      data.visibility === "public"
        ? existing.publishedAt ?? now
        : null;

    await db
      .update(projects)
      .set({
        ...data,
        slug,
        repo: data.repo ?? null,
        contact: data.contact ?? null,
        authorId: actorId,
        publishedAt,
        updatedAt: now,
      })
      .where(eq(projects.id, id));

    revalidateProjects(slug);
    if (existing.slug !== slug) revalidateProjects(existing.slug);
    return { success: true, data: { id } };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  try {
    const actorId = await getActorId();

    const [existing] = await db
      .select({ slug: projects.slug })
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    await db.delete(projects).where(eq(projects.id, id));

    await logAdminAction({
      actorId,
      action: "delete",
      entityType: "project",
      entityId: id,
    });

    revalidateProjects(existing?.slug);
    return { success: true, data: undefined };
  } catch (error) {
    return actionError(error);
  }
}

export async function togglePublishProject(
  id: string,
  publish: boolean
): Promise<ActionResult> {
  try {
    const actorId = await getActorId();
    const now = new Date();

    const [existing] = await db
      .select({ slug: projects.slug, publishedAt: projects.publishedAt })
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    await db
      .update(projects)
      .set({
        visibility: publish ? "public" : "contributor",
        publishedAt: publish ? existing?.publishedAt ?? now : null,
        updatedAt: now,
      })
      .where(eq(projects.id, id));

    await logAdminAction({
      actorId,
      action: publish ? "publish" : "unpublish",
      entityType: "project",
      entityId: id,
    });

    revalidateProjects(existing?.slug);
    return { success: true, data: undefined };
  } catch (error) {
    return actionError(error);
  }
}

export async function toggleFeatureProject(
  id: string,
  featured: boolean
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const [existing] = await db
      .select({ slug: projects.slug })
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    await db
      .update(projects)
      .set({ featured, updatedAt: new Date() })
      .where(eq(projects.id, id));

    revalidateProjects(existing?.slug);
    return { success: true, data: undefined };
  } catch (error) {
    return actionError(error);
  }
}

// ─── Resources ────────────────────────────────────────────────────────────────

const resourceSchema = z.object({
  title: z.string().min(3).max(200),
  slug: slugSchema,
  summary: z.string().min(10).max(2000),
  bodyMdx: z.string().optional().nullable(),
  category: z.string().min(2).max(100),
  url: z.string().url(),
  domains: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  status: z.enum(["draft", "published", "archived"]).default("published"),
});

export type ResourceFormValues = z.infer<typeof resourceSchema>;

export async function listResources() {
  await requireAdmin();
  return db.select().from(resources).orderBy(desc(resources.createdAt));
}

export async function createResource(
  formData: ResourceFormValues
): Promise<ActionResult<{ id: string }>> {
  try {
    const data = resourceSchema.parse(formData);
    const now = new Date();

    const slug = await ensureUniqueSlug(async (candidate) => {
      const [row] = await db
        .select()
        .from(resources)
        .where(eq(resources.slug, candidate))
        .limit(1);
      return row;
    }, data.slug);

    const [row] = await db
      .insert(resources)
      .values({
        ...data,
        slug,
        bodyMdx: data.bodyMdx ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: resources.id });

    revalidateResources();
    return { success: true, data: { id: row.id } };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateResource(
  id: string,
  formData: ResourceFormValues
): Promise<ActionResult<{ id: string }>> {
  try {
    const data = resourceSchema.parse(formData);
    const now = new Date();

    const [existing] = await db
      .select()
      .from(resources)
      .where(eq(resources.id, id))
      .limit(1);

    if (!existing) return { success: false, error: "Resource not found" };

    const slug = await ensureUniqueSlug(async (candidate) => {
      const [row] = await db
        .select()
        .from(resources)
        .where(and(eq(resources.slug, candidate), ne(resources.id, id)))
        .limit(1);
      return row;
    }, data.slug);

    await db
      .update(resources)
      .set({
        ...data,
        slug,
        bodyMdx: data.bodyMdx ?? null,
        updatedAt: now,
      })
      .where(eq(resources.id, id));

    revalidateResources();
    return { success: true, data: { id } };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteResource(id: string): Promise<ActionResult> {
  try {
    const actorId = await getActorId();
    await db.delete(resources).where(eq(resources.id, id));

    await logAdminAction({
      actorId,
      action: "delete",
      entityType: "resource",
      entityId: id,
    });

    revalidateResources();
    return { success: true, data: undefined };
  } catch (error) {
    return actionError(error);
  }
}

export async function togglePublishResource(
  id: string,
  publish: boolean
): Promise<ActionResult> {
  try {
    const actorId = await getActorId();

    await db
      .update(resources)
      .set({
        status: publish ? "published" : "draft",
        updatedAt: new Date(),
      })
      .where(eq(resources.id, id));

    await logAdminAction({
      actorId,
      action: publish ? "publish" : "unpublish",
      entityType: "resource",
      entityId: id,
    });

    revalidateResources();
    return { success: true, data: undefined };
  } catch (error) {
    return actionError(error);
  }
}

// Re-export helpers used by form components
export { parseCommaList, slugFromTitle };