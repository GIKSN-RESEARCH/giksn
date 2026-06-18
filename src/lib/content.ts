import { researchDomains } from "@/lib/site";

export const publicationTypes = [
  "Paper",
  "Report",
  "Preprint",
  "Explainer",
] as const;

export const insightCategories = [
  "Tooling & Use Cases",
  "Frontier Analysis",
  "Cross-Domain Thinking",
  "Community Spotlights",
] as const;

export const contentDomains = researchDomains.map((d) => d.title);

export type PublicationType = (typeof publicationTypes)[number];
export type InsightCategory = (typeof insightCategories)[number];

export function filterByDomain<T extends { domains: string[] }>(
  items: T[],
  domain?: string
): T[] {
  if (!domain) return items;
  return items.filter((item) =>
    item.domains.some((d) => d.toLowerCase() === domain.toLowerCase())
  );
}

export function filterByType<T extends { type: string }>(
  items: T[],
  type?: string
): T[] {
  if (!type) return items;
  return items.filter((item) => item.type === type);
}

export function filterByCategory<T extends { category: string }>(
  items: T[],
  category?: string
): T[] {
  if (!category) return items;
  return items.filter((item) => item.category === category);
}

export function filterByResourceCategory<T extends { category: string }>(
  items: T[],
  category?: string
): T[] {
  if (!category) return items;
  return items.filter((item) => item.category === category);
}

export function uniqueCategories<T extends { category: string }>(items: T[]): string[] {
  return [...new Set(items.map((item) => item.category))].sort();
}