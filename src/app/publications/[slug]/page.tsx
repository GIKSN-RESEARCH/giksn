import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Section } from "@/components/sections/section";
import { getPublicationBySlug, getAllPublicationSlugs } from "@/lib/queries/publications";
import { renderMdx } from "@/lib/mdx";
import { jsonLdScript, ogImageUrl, scholarlyArticleJsonLd } from "@/lib/seo";

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pub = await getPublicationBySlug(slug);
  if (!pub) return { title: "Publication not found" };
  return {
    title: pub.title,
    description: pub.abstract.slice(0, 155),
    openGraph: {
      title: pub.title,
      description: pub.abstract.slice(0, 155),
      type: "article",
      images: [
        ogImageUrl({
          title: pub.title,
          subtitle: pub.abstract,
          kind: pub.type,
        }),
      ],
    },
  };
}

export async function generateStaticParams() {
  // ISR friendly: pre-generate published slugs at build where possible
  const slugs = await getAllPublicationSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function PublicationDetailPage({ params }: Props) {
  const { slug } = await params;
  const pub = await getPublicationBySlug(slug);

  if (!pub) notFound();

  const mdxContent = await renderMdx({ source: pub.bodyMdx });

  return (
    <Section className="max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(scholarlyArticleJsonLd(pub))}
      />
      <div className="mb-8">
        <div className="text-sm uppercase tracking-[2px] text-muted-foreground">
          {pub.type} {pub.publishedAt && `• ${new Date(pub.publishedAt).toLocaleDateString()}`}
        </div>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">{pub.title}</h1>
        {pub.authors?.length > 0 && (
          <p className="mt-2 text-muted-foreground">
            {pub.authors.map((a: any) => a.name).join(", ")}
          </p>
        )}
      </div>

      <div className="prose prose-invert max-w-none">
        {/* Abstract as lead */}
        <p className="lead text-lg text-muted-foreground">{pub.abstract}</p>

        {/* Rendered MDX body */}
        {mdxContent}
      </div>

      {pub.links && Object.keys(pub.links).length > 0 && (
        <div className="mt-12 border-t border-border pt-6 text-sm">
          <div className="font-medium text-muted-foreground">Links</div>
          <ul className="mt-2 space-y-1">
            {Object.entries(pub.links as Record<string, string>).map(([k, v]) => (
              <li key={k}>
                <a href={v} target="_blank" rel="noopener" className="underline hover:no-underline">
                  {k} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  );
}
