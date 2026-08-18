import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Masthead } from "@/components/Masthead";
import { CategoryNav } from "@/components/CategoryNav";
import { Footer } from "@/components/Footer";
import { ProgramBlock } from "@/components/ProgramBlock";
import { getProgramBySlugPublic, listProgramsPublic } from "@/db/queries";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const program = await getProgramBySlugPublic(slug);
  if (!program) return { title: "Program not found" };
  return {
    title: `${program.name} · GIKSN Research`,
    description: program.tagline,
    openGraph: {
      title: program.name,
      description: program.tagline,
      url: `https://giksn.com/programs/${program.slug}`,
    },
  };
}

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [program, all] = await Promise.all([
    getProgramBySlugPublic(slug),
    listProgramsPublic(),
  ]);
  if (!program) return notFound();

  const index = Math.max(
    0,
    all.findIndex((p) => p.slug === program.slug)
  );

  return (
    <>
      <Masthead />
      <CategoryNav active="PROGRAMS" />
      <main className="w-full mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 pt-8 sm:pt-10 pb-12 sm:pb-16">
        <nav className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint mb-6 sm:mb-8 flex items-center gap-2 flex-wrap">
          <Link href="/programs" className="link-underline">
            Programs
          </Link>
          <span>/</span>
          <span className="text-ink">{program.name}</span>
        </nav>

        <ProgramBlock program={program} index={index} />
      </main>
      <Footer />
    </>
  );
}
