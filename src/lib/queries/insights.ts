import { db } from '@/db';
import { insights } from '@/db/schema';
import { and, desc, eq } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

import type { InferSelectModel } from 'drizzle-orm';

export type Insight = InferSelectModel<typeof insights>;

export const getPublishedInsights = unstable_cache(
  async () => {
    return db
      .select()
      .from(insights)
      .where(eq(insights.status, 'published'))
      .orderBy(desc(insights.publishedAt), desc(insights.createdAt));
  },
  ['published-insights'],
  { revalidate: 60, tags: ['insights'] }
);

export async function getInsightBySlug(slug: string) {
  return unstable_cache(
    async () => {
      const [item] = await db
        .select()
        .from(insights)
        .where(and(eq(insights.slug, slug), eq(insights.status, 'published')))
        .limit(1);
      return item ?? null;
    },
    [`insight-by-slug-${slug}`],
    { revalidate: 60, tags: ['insights'] }
  )();
}

export async function getAllInsightSlugs() {
  const rows = await db
    .select({ slug: insights.slug })
    .from(insights)
    .where(eq(insights.status, 'published'));
  return rows.map((r) => r.slug);
}