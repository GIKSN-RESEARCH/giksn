import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DomainList } from "@/components/content/domain-badge";
import { Section } from "@/components/sections/section";
import { getProfileByHandle } from "@/lib/queries/projects";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const profile = await getProfileByHandle(handle);
  if (!profile) return { title: "Member not found" };
  return {
    title: profile.displayName,
    description: profile.bio ?? `GIKSN contributor — ${profile.displayName}`,
  };
}

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const profile = await getProfileByHandle(handle);
  if (!profile) notFound();

  const links = profile.links as Record<string, string> | null;

  return (
    <Section className="max-w-2xl">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Contributor
      </p>
      <h1 className="mt-2 text-4xl font-bold">{profile.displayName}</h1>
      <p className="mt-1 text-sm text-muted-foreground">@{profile.handle}</p>

      {profile.bio ? (
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>
      ) : null}

      <DomainList domains={profile.domains} className="mt-6" />

      {links && Object.keys(links).length > 0 ? (
        <ul className="mt-8 space-y-2 text-sm">
          {Object.entries(links).map(([key, value]) => (
            <li key={key}>
              <span className="text-muted-foreground">{key}: </span>
              <Link href={value} target="_blank" className="underline">
                {value}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </Section>
  );
}