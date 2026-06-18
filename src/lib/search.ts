import { sql } from "drizzle-orm";

import { db } from "@/db";

export type SearchHit = {
  slug: string;
  title: string;
  excerpt: string;
  rank: number;
};

const MIN_QUERY_LENGTH = 2;
const DEFAULT_LIMIT = 50;

function normalizeQuery(query: string): string | null {
  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) return null;
  return trimmed.slice(0, 200);
}

async function queryTable(
  table: "publications" | "insights" | "projects",
  excerptColumn: "abstract" | "excerpt" | "description",
  whereClause: string,
  query: string,
  limit: number
): Promise<SearchHit[]> {
  const q = normalizeQuery(query);
  if (!q) return [];

  const result = await db.execute(sql`
    SELECT
      slug,
      title,
      ${sql.raw(excerptColumn)} AS excerpt,
      GREATEST(
        ts_rank(search_vector, websearch_to_tsquery('english', ${q})),
        similarity(title, ${q})
      )::float AS rank
    FROM ${sql.raw(table)}
    WHERE ${sql.raw(whereClause)}
      AND (
        search_vector @@ websearch_to_tsquery('english', ${q})
        OR title % ${q}
        OR similarity(title, ${q}) > 0.25
      )
    ORDER BY rank DESC, published_at DESC NULLS LAST
    LIMIT ${limit}
  `);

  const rows = result.rows as Array<{
    slug: string;
    title: string;
    excerpt: string;
    rank: number;
  }>;

  return rows.map((row) => ({
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    rank: Number(row.rank) || 0,
  }));
}

export async function searchPublications(
  query: string,
  limit = DEFAULT_LIMIT
): Promise<SearchHit[]> {
  return queryTable(
    "publications",
    "abstract",
    "status = 'published'",
    query,
    limit
  );
}

export async function searchInsights(
  query: string,
  limit = DEFAULT_LIMIT
): Promise<SearchHit[]> {
  return queryTable(
    "insights",
    "excerpt",
    "status = 'published'",
    query,
    limit
  );
}

export async function searchProjects(
  query: string,
  limit = DEFAULT_LIMIT
): Promise<SearchHit[]> {
  return queryTable(
    "projects",
    "description",
    "visibility = 'public'",
    query,
    limit
  );
}

export function rankAndFilterBySlugs<T extends { slug: string }>(
  items: T[],
  hits: SearchHit[]
): T[] {
  if (hits.length === 0) return [];

  const rankBySlug = new Map(hits.map((hit) => [hit.slug, hit.rank]));
  const slugSet = new Set(hits.map((hit) => hit.slug));

  return items
    .filter((item) => slugSet.has(item.slug))
    .sort(
      (a, b) =>
        (rankBySlug.get(b.slug) ?? 0) - (rankBySlug.get(a.slug) ?? 0)
    );
}