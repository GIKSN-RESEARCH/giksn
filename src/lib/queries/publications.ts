import { db } from '@/db';
import { publications } from '@/db/schema';
import { and, desc, eq } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

import type { InferSelectModel } from 'drizzle-orm';

export type Publication = InferSelectModel<typeof publications>;

export const getPublishedPublications = unstable_cache(
  async () => {
    return db
      .select()
      .from(publications)
      .where(eq(publications.status, 'published'))
      .orderBy(desc(publications.publishedAt), desc(publications.createdAt));
  },
  ['published-publications'],
  { revalidate: 60, tags: ['publications'] }
);

export async function getPublicationBySlug(slug: string) {
  return unstable_cache(
    async () => {
      const [pub] = await db
        .select()
        .from(publications)
        .where(and(eq(publications.slug, slug), eq(publications.status, 'published')))
        .limit(1);
      return pub ?? null;
    },
    [`publication-by-slug-${slug}`],
    { revalidate: 60, tags: ['publications'] }
  )();
}

export async function getAllPublicationSlugs() {
  const rows = await db
    .select({ slug: publications.slug })
    .from(publications)
    .where(eq(publications.status, 'published'));
  return rows.map((r) => r.slug);
}