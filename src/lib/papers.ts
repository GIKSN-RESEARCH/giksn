export type Category = "AI" | "DT" | "HW" | "DS" | "UP";

export type PaperCategory = "AI" | "DT" | "HW" | "DS";
export type UpdateCategory = "UP";

export type Kind = "Original" | "Survey";

export type Status =
  | "Exploration"
  | "Draft"
  | "Preprint"
  | "Published"
  | "Landmark"
  | "Product";

export type Comment = {
  id: string;
  author: string;
  handle: string;
  date: string;
  body: string;
  replies?: Comment[];
};

export type Paper = {
  number: number;
  category: Category;
  kind: Kind;
  slug: string;
  title: string;
  abstract: string;
  status: Status;
  author: string;
  authorHandle: string;
  posted: string;
  updated: string;
  readingMinutes: number;
  hidden: boolean;
  featured: boolean;
  source?: string | null;
  body: PaperSection[];
  discussion: Comment[];
};

export type PaperSection = {
  heading?: string;
  paragraphs?: string[];
  list?: string[];
  pullquote?: string;
};

export const CATEGORIES: {
  code: Category;
  label: string;
  full: string;
  blurb: string;
}[] = [
  {
    code: "AI",
    label: "AI",
    full: "Artificial Intelligence",
    blurb:
      "Foundational and applied work on models, agents, evaluation, alignment, and the road to AGI. Where the lab spends most of its cycles.",
  },
  {
    code: "DT",
    label: "DT",
    full: "Deeptech",
    blurb:
      "Bio, materials, energy, quantum, robotics. Research that sits at the physical frontier and takes years to compound.",
  },
  {
    code: "HW",
    label: "HW",
    full: "Hardware",
    blurb:
      "Silicon, accelerators, embedded systems, sensors. The compute substrate the rest of the frontier runs on.",
  },
  {
    code: "DS",
    label: "DS",
    full: "Distributed Systems",
    blurb:
      "Consensus, storage, coordination, protocols. The plumbing that lets frontier systems scale without silently breaking.",
  },
  {
    code: "UP",
    label: "UP",
    full: "Updates",
    blurb:
      "Announcements from the lab and the wider frontier. Cohort openings, collaborations, releases, program dates.",
  },
];

export const PAPER_CATEGORIES: PaperCategory[] = ["AI", "DT", "HW", "DS"];
export const UPDATE_CATEGORIES: UpdateCategory[] = ["UP"];

export function isUpdate(c: Category): c is UpdateCategory {
  return c === "UP";
}

export function isPaper(c: Category): c is PaperCategory {
  return !isUpdate(c);
}

export const STATUSES: Status[] = [
  "Exploration",
  "Draft",
  "Preprint",
  "Published",
  "Landmark",
  "Product",
];

export const KINDS: { code: Kind; label: string; blurb: string }[] = [
  {
    code: "Original",
    label: "Original",
    blurb:
      "New research. A first-principles investigation, a novel result, or a proposed direction the lab has not written down before.",
  },
  {
    code: "Survey",
    label: "Survey",
    blurb:
      "A synthesis of existing work. Maps the state of a subfield, its tooling, its open questions, and where the lab thinks the leverage sits.",
  },
];

export function categoryByCode(
  code: string
): (typeof CATEGORIES)[number] | undefined {
  return CATEGORIES.find((c) => c.code.toLowerCase() === code.toLowerCase());
}

export function paperRef(p: { category: Category; number: number }): string {
  return `${p.category}-${String(p.number).padStart(3, "0")}`;
}

export function statusTone(
  status: Status
): "neutral" | "live" | "settled" {
  switch (status) {
    case "Exploration":
    case "Draft":
    case "Preprint":
    case "Published":
    case "Landmark":
      return "settled";
    case "Product":
      return "live";
  }
}

export function formatDate(iso: string): string {
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function shortDate(iso: string): string {
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
