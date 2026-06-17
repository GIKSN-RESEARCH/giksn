export const site = {
  name: "GIKSN Research",
  tagline:
    "Pioneering AGI, Deeptech, Hardware & Distributed Systems individually and at their intersections.",
  description:
    "Community-first research lab focused on frontier AI, deeptech, hardware and distributed systems. Open research, clear explanations, real execution.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://giksn.com",
} as const;

export const navLinks = [
  { href: "/research", label: "Research" },
  { href: "/publications", label: "Publications" },
  { href: "/insights", label: "Insights" },
  { href: "/projects", label: "Projects" },
  { href: "/community", label: "Community" },
  { href: "/about", label: "About" },
] as const;

export const researchDomains = [
  {
    id: "agi",
    title: "AGI",
    description:
      "Reasoning systems, alignment, capability scaling and the path toward general intelligence.",
    focus: "Top priority — foundational work on intelligence itself.",
  },
  {
    id: "deeptech",
    title: "Deeptech",
    description:
      "Novel materials, quantum-adjacent systems and breakthrough science translated into engineering.",
    focus: "Top priority — where frontier science meets buildable systems.",
  },
  {
    id: "hardware",
    title: "Hardware",
    description:
      "Custom silicon, edge compute, neuromorphic architectures and the physical layer of intelligence.",
    focus: "Building the substrates that AGI runs on.",
  },
  {
    id: "distributed",
    title: "Distributed Systems",
    description:
      "Decentralized protocols, fault-tolerant networks and coordination at planetary scale.",
    focus: "Infrastructure for open, resilient research and deployment.",
  },
] as const;

export const values = [
  "Openness",
  "Rigor",
  "Collaboration",
  "Curiosity",
] as const;

export const socialLinks = [
  {
    label: "Telegram",
    href: process.env.NEXT_PUBLIC_TELEGRAM_URL ?? "#",
    icon: "telegram" as const,
  },
  {
    label: "X",
    href: process.env.NEXT_PUBLIC_X_URL ?? "https://x.com",
    icon: "x" as const,
  },
  {
    label: "Reddit",
    href: process.env.NEXT_PUBLIC_REDDIT_URL ?? "https://reddit.com",
    icon: "reddit" as const,
  },
  {
    label: "Substack",
    href: process.env.NEXT_PUBLIC_SUBSTACK_URL ?? "https://substack.com",
    icon: "substack" as const,
  },
  {
    label: "LinkedIn",
    href: process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "https://linkedin.com",
    icon: "linkedin" as const,
  },
] as const;