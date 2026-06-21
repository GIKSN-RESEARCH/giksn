import { db } from '@/db';
import { publications, insights } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

type HomepageContentBase = {
  title: string;
  excerpt: string;
  domains: string[];
  featured: boolean;
  publishedAt: Date | null;
  /** Seed cards shown when nothing is published yet — link to list pages. */
  isPreview?: boolean;
};

export type HomepageContentItem =
  | (HomepageContentBase & {
      kind: 'publication';
      slug: string;
    })
  | (HomepageContentBase & {
      kind: 'insight';
      slug: string;
    });

/** Bento placeholders — always shown when the DB has no published content yet. */
export const homepageContentFallback: HomepageContentItem[] = [
  {
    kind: 'insight',
    slug: '',
    title: 'Mapping the AGI tooling landscape',
    excerpt:
      "A practitioner's guide to what exists today, what is hype, and what actually ships.",
    domains: ['AGI', 'Tooling'],
    featured: true,
    publishedAt: null,
    isPreview: true,
  },
  {
    kind: 'publication',
    slug: '',
    title: 'Hardware–software co-design for edge inference',
    excerpt:
      'How substrate choices reshape what models can run where — and why it matters for AGI paths.',
    domains: ['Hardware', 'AGI'],
    featured: false,
    publishedAt: null,
    isPreview: true,
  },
  {
    kind: 'insight',
    slug: '',
    title: 'Distributed systems as research infrastructure',
    excerpt:
      'Why open, fault-tolerant coordination layers are prerequisites for community-scale research.',
    domains: ['Distributed Systems'],
    featured: false,
    publishedAt: null,
    isPreview: true,
  },
];

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