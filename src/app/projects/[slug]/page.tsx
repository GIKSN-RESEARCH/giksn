import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Section } from "@/components/sections/section";
import { getSession, isActiveContributor } from "@/lib/auth-guard";
import { getAllProjectSlugs, getProjectBySlug } from "@/lib/queries/projects";
import { renderMdx } from "@/lib/mdx";

interface Props { params: Promise<{ slug: string }>; }

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const session = await getSession();
  const isContributor = session ? isActiveContributor(session) : false;
  const p = await getProjectBySlug(slug, isContributor);
  return p ? { title: p.title } : { title: "Project" };
}

export default async function ProjectDetail({ params }: Props) {
  const { slug } = await params;
  const session = await getSession();
  const isContributor = session ? isActiveContributor(session) : false;
  const p = await getProjectBySlug(slug, isContributor);
  if (!p) notFound();

  const content = p.bodyMdx ? await renderMdx({ source: p.bodyMdx }) : <p>{p.description}</p>;

  return (
    <Section className="max-w-3xl">
      <h1 className="text-4xl font-bold">{p.title}</h1>
      <div className="mt-2 text-sm text-muted-foreground">{p.status} • {p.domains?.join(", ")}</div>

      <div className="prose prose-invert mt-8 max-w-none">
        <p>{p.description}</p>
        {content}
      </div>
    </Section>
  );
}
