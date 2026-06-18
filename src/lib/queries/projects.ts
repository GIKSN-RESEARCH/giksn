import { db } from '@/db';
import { projects } from '@/db/schema';
import { and, desc, eq, or } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

import type { InferSelectModel } from 'drizzle-orm';

export type Project = InferSelectModel<typeof projects>;

export const getPublishedProjects = unstable_cache(
  async () => {
    return db
      .select()
      .from(projects)
      .where(eq(projects.visibility, 'public'))
      .orderBy(desc(projects.publishedAt), desc(projects.createdAt));
  },
  ['published-projects'],
  { revalidate: 60, tags: ['projects'] }
);

export async function getVisibleProjects(includeContributor: boolean) {
  if (!includeContributor) {
    return getPublishedProjects();
  }

  return db
    .select()
    .from(projects)
    .where(or(eq(projects.visibility, 'public'), eq(projects.visibility, 'contributor')))
    .orderBy(desc(projects.publishedAt), desc(projects.createdAt));
}

export async function getProjectBySlug(slug: string, includeContributor = false) {
  return unstable_cache(
    async () => {
      const visibilityFilter = includeContributor
        ? or(eq(projects.visibility, 'public'), eq(projects.visibility, 'contributor'))
        : eq(projects.visibility, 'public');

      const [item] = await db
        .select()
        .from(projects)
        .where(and(eq(projects.slug, slug), visibilityFilter))
        .limit(1);
      return item ?? null;
    },
    [`project-by-slug-${slug}-${includeContributor ? 'contributor' : 'public'}`],
    { revalidate: 60, tags: ['projects'] }
  )();
}

export async function getAllProjectSlugs(includeContributor = false) {
  const visibilityFilter = includeContributor
    ? or(eq(projects.visibility, 'public'), eq(projects.visibility, 'contributor'))
    : eq(projects.visibility, 'public');

  const rows = await db
    .select({ slug: projects.slug })
    .from(projects)
    .where(visibilityFilter);
  return rows.map((r) => r.slug);
}

export async function getProfileByHandle(handle: string) {
  const { profiles } = await import('@/db/schema');
  const { eq: eqOp } = await import('drizzle-orm');

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eqOp(profiles.handle, handle))
    .limit(1);

  return profile ?? null;
}