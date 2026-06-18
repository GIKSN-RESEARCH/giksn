import type { MetadataRoute } from "next";

import { getAllInsightSlugs } from "@/lib/queries/insights";
import { getAllProjectSlugs } from "@/lib/queries/projects";
import { getAllPublicationSlugs } from "@/lib/queries/publications";
import { site } from "@/lib/site";

const staticPaths = [
  "",
  "/about",
  "/research",
  "/join",
  "/contact",
  "/community",
  "/publications",
  "/insights",
  "/projects",
  "/resources",
  "/contribute/apply",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url;

  const [publicationSlugs, insightSlugs, projectSlugs] = await Promise.all([
    getAllPublicationSlugs(),
    getAllInsightSlugs(),
    getAllProjectSlugs(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));

  const publicationEntries: MetadataRoute.Sitemap = publicationSlugs.map(
    (slug) => ({
      url: `${base}/publications/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    })
  );

  const insightEntries: MetadataRoute.Sitemap = insightSlugs.map((slug) => ({
    url: `${base}/insights/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const projectEntries: MetadataRoute.Sitemap = projectSlugs.map((slug) => ({
    url: `${base}/projects/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    ...staticEntries,
    ...publicationEntries,
    ...insightEntries,
    ...projectEntries,
  ];
}