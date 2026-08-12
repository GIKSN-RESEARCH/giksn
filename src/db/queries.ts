import { and, asc, desc, eq, max, ne, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { db } from "./index";
import { admins, comments, papers } from "./schema";
import type {
  Category,
  Comment,
  Kind,
  Paper,
  PaperSection,
  Status,
} from "@/lib/papers";
import type { CommentRow, PaperRow } from "./schema";

function toIso(d: Date | string): string {
  return d instanceof Date ? d.toISOString() : new Date(d).toISOString();
}

function rowToPaper(row: PaperRow, discussion: Comment[]): Paper {
  return {
    number: row.number,
    category: row.category as Category,
    kind: row.kind as Kind,
    slug: row.slug,
    title: row.title,
    abstract: row.abstract,
    status: row.status as Status,
    author: row.author,
    authorHandle: row.authorHandle,
    posted: toIso(row.posted),
    updated: toIso(row.updated),
    readingMinutes: row.readingMinutes,
    hidden: row.hidden,
    featured: row.featured,
    source: row.source ?? null,
    body: row.body as PaperSection[],
    discussion,
  };
}

function buildThread(rows: CommentRow[]): Comment[] {
  const byId = new Map<string, Comment>();
  rows.forEach((r) => {
    byId.set(r.id, {
      id: r.id,
      author: r.author,
      handle: r.handle,
      date: toIso(r.createdAt),
      body: r.body,
      replies: [],
    });
  });

  const roots: Comment[] = [];
  rows.forEach((r) => {
    const node = byId.get(r.id)!;
    if (r.parentId) {
      const parent = byId.get(r.parentId);
      if (parent) {
        parent.replies = parent.replies ?? [];
        parent.replies.push(node);
        return;
      }
    }
    roots.push(node);
  });

  roots.forEach((r) => {
    if (r.replies && r.replies.length === 0) delete r.replies;
  });
  return roots;
}

async function loadDiscussionsByPaperIds(
  ids: string[]
): Promise<Map<string, Comment[]>> {
  if (ids.length === 0) return new Map();
  const rows = await db
    .select()
    .from(comments)
    .where(sql`${comments.paperId} IN ${ids}`)
    .orderBy(asc(comments.createdAt));

  const grouped = new Map<string, CommentRow[]>();
  rows.forEach((r) => {
    const list = grouped.get(r.paperId) ?? [];
    list.push(r);
    grouped.set(r.paperId, list);
  });
  const out = new Map<string, Comment[]>();
  grouped.forEach((list, pid) => out.set(pid, buildThread(list)));
  return out;
}

export async function listPapers(opts?: {
  category?: Category;
  includeHidden?: boolean;
}): Promise<Paper[]> {
  const filters = [];
  if (opts?.category) filters.push(eq(papers.category, opts.category));
  if (!opts?.includeHidden) filters.push(eq(papers.hidden, false));
  const where =
    filters.length === 0
      ? undefined
      : filters.length === 1
        ? filters[0]
        : and(...filters);

  const rows = await db
    .select()
    .from(papers)
    .where(where)
    .orderBy(asc(papers.number));

  const ids = rows.map((r) => r.id);
  const discussions = await loadDiscussionsByPaperIds(ids);

  return rows.map((r) => rowToPaper(r, discussions.get(r.id) ?? []));
}

export async function listPapersSortedByUpdated(opts?: {
  includeHidden?: boolean;
  onlyPapers?: boolean;
  onlyUpdates?: boolean;
}): Promise<Paper[]> {
  const filters = [];
  if (!opts?.includeHidden) filters.push(eq(papers.hidden, false));
  if (opts?.onlyPapers) filters.push(ne(papers.category, "UP"));
  if (opts?.onlyUpdates) filters.push(eq(papers.category, "UP"));
  const where =
    filters.length === 0
      ? undefined
      : filters.length === 1
        ? filters[0]
        : and(...filters);
  const rows = await db
    .select()
    .from(papers)
    .where(where)
    .orderBy(desc(papers.updated));
  const ids = rows.map((r) => r.id);
  const discussions = await loadDiscussionsByPaperIds(ids);
  return rows.map((r) => rowToPaper(r, discussions.get(r.id) ?? []));
}

export async function getPaperBySlug(
  category: string,
  slug: string,
  opts?: { includeHidden?: boolean }
): Promise<Paper | null> {
  const upper = category.toUpperCase() as Category;
  const filters = [eq(papers.category, upper), eq(papers.slug, slug)];
  if (!opts?.includeHidden) filters.push(eq(papers.hidden, false));
  const [row] = await db
    .select()
    .from(papers)
    .where(and(...filters))
    .limit(1);
  if (!row) return null;

  const cmts = await db
    .select()
    .from(comments)
    .where(eq(comments.paperId, row.id))
    .orderBy(asc(comments.createdAt));

  return rowToPaper(row, buildThread(cmts));
}

export async function nextNumberForCategory(
  category: Category
): Promise<number> {
  const [row] = await db
    .select({ max: max(papers.number) })
    .from(papers)
    .where(eq(papers.category, category));
  return (row?.max ?? 0) + 1;
}

export async function createPaper(input: {
  category: Category;
  kind?: Kind;
  slug: string;
  title: string;
  abstract: string;
  author: string;
  authorHandle: string;
  source?: string | null;
  body: PaperSection[];
  status?: Status;
  readingMinutes?: number;
}): Promise<Paper> {
  return await db.transaction(async (tx) => {
    const [maxRow] = await tx
      .select({ max: max(papers.number) })
      .from(papers)
      .where(eq(papers.category, input.category));
    const nextNumber = (maxRow?.max ?? 0) + 1;

    const [row] = await tx
      .insert(papers)
      .values({
        number: nextNumber,
        category: input.category,
        kind: input.kind ?? "Original",
        slug: input.slug,
        title: input.title,
        abstract: input.abstract,
        author: input.author,
        authorHandle: input.authorHandle,
        source: input.source ?? null,
        body: input.body,
        status: input.status ?? "Research",
        readingMinutes: input.readingMinutes ?? 3,
      })
      .returning();

    return rowToPaper(row, []);
  });
}

export async function updatePaperStatus(
  category: string,
  slug: string,
  status: Status
): Promise<Paper | null> {
  const upper = category.toUpperCase() as Category;
  const [row] = await db
    .update(papers)
    .set({ status, updated: new Date() })
    .where(and(eq(papers.category, upper), eq(papers.slug, slug)))
    .returning();
  if (!row) return null;
  const cmts = await db
    .select()
    .from(comments)
    .where(eq(comments.paperId, row.id))
    .orderBy(asc(comments.createdAt));
  return rowToPaper(row, buildThread(cmts));
}

export async function setPaperHidden(
  category: string,
  slug: string,
  hidden: boolean
): Promise<Paper | null> {
  const upper = category.toUpperCase() as Category;
  const [row] = await db
    .update(papers)
    .set({ hidden, updated: new Date() })
    .where(and(eq(papers.category, upper), eq(papers.slug, slug)))
    .returning();
  if (!row) return null;
  const cmts = await db
    .select()
    .from(comments)
    .where(eq(comments.paperId, row.id))
    .orderBy(asc(comments.createdAt));
  return rowToPaper(row, buildThread(cmts));
}

// Enforce single-featured invariant: setting a paper as featured first
// clears featured on every other paper in the same transaction.
export async function setPaperFeatured(
  category: string,
  slug: string,
  featured: boolean
): Promise<Paper | null> {
  const upper = category.toUpperCase() as Category;
  return await db.transaction(async (tx) => {
    if (featured) {
      await tx.update(papers).set({ featured: false });
    }
    const [row] = await tx
      .update(papers)
      .set({ featured })
      .where(and(eq(papers.category, upper), eq(papers.slug, slug)))
      .returning();
    if (!row) return null;
    const cmts = await tx
      .select()
      .from(comments)
      .where(eq(comments.paperId, row.id))
      .orderBy(asc(comments.createdAt));
    return rowToPaper(row, buildThread(cmts));
  });
}

export async function deletePaper(
  category: string,
  slug: string
): Promise<boolean> {
  const upper = category.toUpperCase() as Category;
  const result = await db
    .delete(papers)
    .where(and(eq(papers.category, upper), eq(papers.slug, slug)))
    .returning({ id: papers.id });
  return result.length > 0;
}

export async function addComment(
  paperId: string,
  input: { author: string; handle: string; body: string; parentId?: string }
): Promise<CommentRow> {
  return await db.transaction(async (tx) => {
    if (input.parentId) {
      const [parent] = await tx
        .select({ id: comments.id, parent: comments.parentId, paper: comments.paperId })
        .from(comments)
        .where(eq(comments.id, input.parentId))
        .limit(1);
      if (!parent) throw new Error("Parent comment not found");
      if (parent.paper !== paperId)
        throw new Error("Parent comment does not belong to this paper");
      if (parent.parent)
        throw new Error("Replies are limited to one level deep");
    }

    const [row] = await tx
      .insert(comments)
      .values({
        paperId,
        parentId: input.parentId ?? null,
        author: input.author,
        handle: input.handle,
        body: input.body,
      })
      .returning();

    await tx
      .update(papers)
      .set({ updated: new Date() })
      .where(eq(papers.id, paperId));

    return row;
  });
}

export async function findAdminByEmail(email: string) {
  const lower = email.trim().toLowerCase();
  const [row] = await db
    .select()
    .from(admins)
    .where(eq(admins.email, lower))
    .limit(1);
  return row ?? null;
}

export async function createAdmin(email: string, passwordHash: string) {
  const [row] = await db
    .insert(admins)
    .values({ email: email.trim().toLowerCase(), passwordHash })
    .returning();
  return row;
}

export async function updateAdminPassword(email: string, passwordHash: string) {
  const [row] = await db
    .update(admins)
    .set({ passwordHash })
    .where(eq(admins.email, email.trim().toLowerCase()))
    .returning();
  return row ?? null;
}

export async function getPaperIdBySlug(
  category: string,
  slug: string
): Promise<string | null> {
  const upper = category.toUpperCase() as Category;
  const [row] = await db
    .select({ id: papers.id })
    .from(papers)
    .where(and(eq(papers.category, upper), eq(papers.slug, slug)))
    .limit(1);
  return row?.id ?? null;
}

// ---------------------------------------------------------------------------
// Cached public reads
//
// Every public-facing page (home, archive, updates, category, paper detail)
// used to force-dynamic and hit Postgres on every request. That is the
// single biggest source of latency in the app.
//
// These wrappers use Next.js data cache with a shared tag `papers`. First
// request populates the cache; subsequent requests are served instantly
// from Next.js's cache without touching Postgres. Every mutation endpoint
// calls revalidateTag('papers') so admin edits appear within milliseconds
// rather than waiting for the TTL. The `revalidate` value is a safety net
// in case a tag call is missed.
//
// includeHidden: true reads (admin panel) must NOT use these helpers —
// they bypass hidden filtering and would leak drafts to the public cache.
// ---------------------------------------------------------------------------

export const PAPERS_TAG = "papers";
// TTL kept short so pages self-heal within a minute even when DB rows are
// inserted or updated outside the app (seed scripts, direct SQL, etc.).
// Mutations through the API still fire revalidateTag('papers', 'default')
// for instant invalidation.
const CACHE_TTL_SECONDS = 60;

// In development, skip the cache entirely so every save/refresh reads live
// data. unstable_cache persists to .next/cache/fetch-cache/ on disk and
// survives HMR and server restarts, which makes iterating with direct DB
// scripts painful. Production keeps the caching for latency.
const IS_DEV = process.env.NODE_ENV !== "production";

async function listPapersPublicUncached(category?: Category) {
  return listPapers({ category, includeHidden: false });
}

async function listPapersSortedByUpdatedPublicUncached(
  opts: { onlyPapers?: boolean; onlyUpdates?: boolean } = {}
) {
  return listPapersSortedByUpdated({ ...opts, includeHidden: false });
}

async function getPaperBySlugPublicUncached(
  category: string,
  slug: string
) {
  return getPaperBySlug(category, slug, { includeHidden: false });
}

export const listPapersPublic = IS_DEV
  ? listPapersPublicUncached
  : unstable_cache(listPapersPublicUncached, ["listPapersPublic"], {
      tags: [PAPERS_TAG],
      revalidate: CACHE_TTL_SECONDS,
    });

export const listPapersSortedByUpdatedPublic = IS_DEV
  ? listPapersSortedByUpdatedPublicUncached
  : unstable_cache(
      listPapersSortedByUpdatedPublicUncached,
      ["listPapersSortedByUpdatedPublic"],
      { tags: [PAPERS_TAG], revalidate: CACHE_TTL_SECONDS }
    );

export const getPaperBySlugPublic = IS_DEV
  ? getPaperBySlugPublicUncached
  : unstable_cache(getPaperBySlugPublicUncached, ["getPaperBySlugPublic"], {
      tags: [PAPERS_TAG],
      revalidate: CACHE_TTL_SECONDS,
    });
