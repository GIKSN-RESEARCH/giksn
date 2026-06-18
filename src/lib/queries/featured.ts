import { db } from '@/db';
import { publications, insights } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

export type HomepageContentItem =
  | {
      kind: 'publication';
      slug: string;
      title: string;
      excerpt: string;
      domains: string[];
      featured: boolean;
      publishedAt: Date | null;
    }
  | {
      kind: 'insight';
      slug: string;
      title: string;
      excerpt: string;
      domains: string[];
      featured: boolean;
      publishedAt: Date | null;
    };

export const getHomepageContent = unstable_cache(
  async (): Promise<HomepageContentItem[]> => {
    const [pubs, items] = await Promise.all([
      db
        .select({
          slug: publications.slug,
          title: publications.title,
          excerpt: publications.abstract,
          domains: publications.domains,
          featured: publications.featured,
          publishedAt: publications.publishedAt,
        })
        .from(publications)
        .where(eq(publications.status, 'published'))
        .orderBy(desc(publications.publishedAt), desc(publications.createdAt)),
      db
        .select({
          slug: insights.slug,
          title: insights.title,
          excerpt: insights.excerpt,
          domains: insights.domains,
          featured: insights.featured,
          publishedAt: insights.publishedAt,
        })
        .from(insights)
        .where(eq(insights.status, 'published'))
        .orderBy(desc(insights.publishedAt), desc(insights.createdAt)),
    ]);

    const combined: HomepageContentItem[] = [
      ...pubs.map((pub) => ({
        kind: 'publication' as const,
        slug: pub.slug,
        title: pub.title,
        excerpt: pub.excerpt,
        domains: pub.domains,
        featured: pub.featured,
        publishedAt: pub.publishedAt,
      })),
      ...items.map((item) => ({
        kind: 'insight' as const,
        slug: item.slug,
        title: item.title,
        excerpt: item.excerpt,
        domains: item.domains,
        featured: item.featured,
        publishedAt: item.publishedAt,
      })),
    ];

    return combined
      .sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        const aTime = a.publishedAt?.getTime() ?? 0;
        const bTime = b.publishedAt?.getTime() ?? 0;
        return bTime - aTime;
      })
      .slice(0, 3);
  },
  ['homepage-content'],
  { revalidate: 60, tags: ['publications', 'insights'] }
);