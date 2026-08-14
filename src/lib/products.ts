export const RINNE_SITE_URL = "https://rinne.giksn.com";

export type ProductStatus = "Alpha" | "Beta" | "Stable";

export const PRODUCT_STATUSES: ProductStatus[] = ["Alpha", "Beta", "Stable"];

export type ProductLink = {
  label: string;
  href: string;
  primary?: boolean;
};

export type ProductInstall = {
  label: string;
  command: string;
};

export type ProductPaperRef = {
  category: "AI" | "DT" | "HW" | "DS";
  slug: string;
  label: string;
};

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  version?: string;
  status: ProductStatus;
  license: string;
  website?: string | null;
  category: "AI" | "DT" | "HW" | "DS";
  description: string;
  highlights: string[];
  install?: ProductInstall | null;
  paperRef?: ProductPaperRef | null;
  links: ProductLink[];
  listed: boolean;
  updated?: string;
};

export const RINNE_SEED: Product = {
  slug: "rinne",
  name: "Rinne",
  tagline: "Local, open-source, terminal-first AI orchestration.",
  version: "0.1.8",
  status: "Alpha",
  license: "MIT OR Apache-2.0",
  website: RINNE_SITE_URL,
  category: "AI",
  description:
    "A CLI harness that plans work into a JSON DAG, distributes it across the AI coding tools and model APIs already on your machine, then drives it to completion through a generator-evaluator loop. You never open Claude Code, Codex, Grok or OpenCode yourself. You live in Rinne. It reaches down to those tools as workers.",
  highlights: [
    "Conductor planning turns a prompt into a JSON DAG of tasks with roles and evaluators.",
    "Two worker families, one contract: autonomous harness CLIs and raw OpenAI-compatible APIs.",
    "Verifying loop with critique; evaluators can be AI, a tool, or you.",
    "No hosted component, no telemetry, no accounts. Keys stay in the OS keychain.",
    "Pool-aware tiered routing that never dies on a rate-limited worker.",
  ],
  install: {
    label: "Install (macOS or Linux)",
    command:
      "curl -fsSL https://raw.githubusercontent.com/GIKSN-RESEARCH/Rinne/main/install.sh | sh",
  },
  paperRef: {
    category: "AI",
    slug: "rinne-local-terminal-first-ai-orchestration",
    label: "Read the paper",
  },
  listed: true,
  links: [
    {
      label: "rinne.giksn.com",
      href: RINNE_SITE_URL,
    },
    {
      label: "GitHub repository",
      href: "https://github.com/GIKSN-RESEARCH/Rinne",
    },
    {
      label: "Latest release",
      href: "https://github.com/GIKSN-RESEARCH/Rinne/releases/latest",
    },
    {
      label: "Install script",
      href: "https://raw.githubusercontent.com/GIKSN-RESEARCH/Rinne/main/install.sh",
    },
    {
      label: "Report an issue",
      href: "https://github.com/GIKSN-RESEARCH/Rinne/issues",
    },
  ],
};
