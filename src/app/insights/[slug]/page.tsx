import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Section } from "@/components/sections/section";
import { getAllInsightSlugs, getInsightBySlug } from "@/lib/queries/insights";
import { renderMdx } from "@/lib/mdx";
import { articleJsonLd, jsonLdScript, ogImageUrl } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllInsightSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getInsightBySlug(slug);
  if (!item) return { title: "Insight not found" };
  return {
    title: item.title,
    description: item.excerpt?.slice(0, 155),
    openGraph: {
      title: item.title,
      description: item.excerpt?.slice(0, 155),
      type: "article",
      images: [
        ogImageUrl({
          title: item.title,
          subtitle: item.excerpt,
          kind: item.category,
        }),
      ],
    },
  };
}

export default async function InsightDetail({ params }: Props) {
  const { slug } = await params;
  const item = await getInsightBySlug(slug);
  if (!item) notFound();

  const mdx = await renderMdx({ source: item.bodyMdx });

  return (
    <Section className="max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(articleJsonLd(item))}
      />
      <div className="mb-8">
        <div className="text-sm uppercase tracking-widest text-muted-foreground">{item.category}</div>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">{item.title}</h1>
      </div>

      <div className="prose prose-invert max-w-none">
        <p className="lead text-lg text-muted-foreground">{item.excerpt}</p>
        {mdx}
      </div>

      {item.substackUrl && (
        <div className="mt-10 text-sm">
          <a href={item.substackUrl} target="_blank" className="underline">Read on Substack →</a>
        </div>
      )}
    </Section>
  );
}
