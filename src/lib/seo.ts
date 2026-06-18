import type { Publication } from "@/lib/queries/publications";
import type { Insight } from "@/lib/queries/insights";
import { site } from "@/lib/site";

export function ogImageUrl({
  title,
  subtitle,
  kind,
}: {
  title: string;
  subtitle?: string;
  kind?: string;
}) {
  const params = new URLSearchParams({ title });
  if (subtitle) params.set("subtitle", subtitle.slice(0, 120));
  if (kind) params.set("kind", kind);
  return `${site.url}/api/og?${params.toString()}`;
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    description: site.description,
    url: site.url,
  };
}

export function scholarlyArticleJsonLd(publication: Publication) {
  return {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: publication.title,
    description: publication.abstract,
    url: `${site.url}/publications/${publication.slug}`,
    datePublished: publication.publishedAt?.toISOString(),
    author: publication.authors?.map((author) => ({
      "@type": "Person",
      name: author.name,
    })),
    keywords: [...publication.domains, ...publication.tags].join(", "),
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
  };
}

export function articleJsonLd(insight: Insight) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: insight.title,
    description: insight.excerpt,
    url: `${site.url}/insights/${insight.slug}`,
    datePublished: insight.publishedAt?.toISOString(),
    articleSection: insight.category,
    keywords: [...insight.domains, ...insight.tags].join(", "),
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
  };
}

export function jsonLdScript(data: Record<string, unknown> | Record<string, unknown>[]) {
  return {
    __html: JSON.stringify(data),
  };
}