import { db } from '@/db';
import { resources } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

import type { InferSelectModel } from 'drizzle-orm';

export type Resource = InferSelectModel<typeof resources>;

export const getPublishedResources = unstable_cache(
  async () => {
    return db
      .select()
      .from(resources)
      .where(eq(resources.status, 'published'))
      .orderBy(desc(resources.updatedAt), desc(resources.createdAt));
  },
  ['published-resources'],
  { revalidate: 60, tags: ['resources'] }
);