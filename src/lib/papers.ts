export type Category = "AI" | "DT" | "HW" | "DS" | "UP";

export type PaperCategory = "AI" | "DT" | "HW" | "DS";
export type UpdateCategory = "UP";

export type Kind = "Original" | "Survey" | "implementation";

/** Content category (formerly lifecycle status). Not the same as sector (AI/DT/HW/DS). */
export type Status =
  | "Research"
  | "Writings"
  | "Products"
  | "Programs";

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

export type BodyBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "pullquote"; text: string }
  | { type: "heading"; level: 2 | 3 | 4; text: string }
  | { type: "code"; lang?: string; code: string }
  | {
      type: "table";
      headers: string[];
      rows: string[][];
      align?: ("left" | "center" | "right")[];
    };

export type PaperSection = {
  heading?: string;
  blocks?: BodyBlock[];
  /** @deprecated Parsed bodies use `blocks`; kept for older stored JSON. */
  paragraphs?: string[];
  /** @deprecated Parsed bodies use `blocks`; kept for older stored JSON. */
  list?: string[];
  /** @deprecated Parsed bodies use `blocks`; kept for older stored JSON. */
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
      "AI covers agent frameworks, models and evals.",
  },
  {
    code: "DT",
    label: "DT",
    full: "Deeptech",
    blurb:
      "Deeptech stays the longer-horizon survey track.",
  },
  {
    code: "HW",
    label: "HW",
    full: "Hardware",
    blurb:
      "Hardware covers GPU kernels, quantization and memory bandwidth.",
  },
  {
    code: "DS",
    label: "DS",
    full: "Distributed Systems",
    blurb:
      "Distributed Systems covers serving: batching, paged KV cache, tensor parallelism and routing.",
  },
  {
    code: "UP",
    label: "UP",
    full: "Updates",
    blurb:
      "Updates carries announcements.",
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
  "Research",
  "Writings",
  "Products",
  "Programs",
];

export const STATUS_LEGENDS: Record<Status, string> = {
  Research: "Papers and technical work",
  Writings: "Essays, notes and commentary",
  Products: "Shipped tools and releases",
  Programs: "Cohorts, fellowships and community",
};

export const KINDS: { code: Kind; label: string; blurb: string }[] = [
  {
    code: "Original",
    label: "Original",
    blurb:
      "New research. A first-principles investigation, a novel result or a proposed direction the lab has not written down before.",
  },
  {
    code: "Survey",
    label: "Survey",
    blurb:
      "A synthesis of existing work. Maps the state of a subfield, its tooling, its open questions and where the lab thinks the leverage sits.",
  },
  {
    code: "implementation",
    label: "Implementation",
    blurb: "A write-up of building something yourself, with code.",
  },
];

export function kindLabel(kind: Kind): string {
  return KINDS.find((entry) => entry.code === kind)?.label ?? kind;
}

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
    case "Research":
    case "Writings":
      return "settled";
    case "Products":
      return "live";
    case "Programs":
      return "neutral";
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
