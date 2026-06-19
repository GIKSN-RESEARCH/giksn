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
    focus: "Understanding and building toward general intelligence: architectures, training, reasoning and the limits of current methods.",
  },
  {
    id: "deeptech",
    title: "Deeptech",
    description:
      "Novel materials, quantum-adjacent systems and breakthrough science translated into engineering.",
    focus: "Hard, science-driven technology: novel compute, advanced materials and the engineering that turns research into real capability.",
  },
  {
    id: "hardware",
    title: "Hardware",
    description:
      "Custom silicon, edge compute, neuromorphic architectures and the physical layer of intelligence.",
    focus: "The silicon and systems underneath modern AI: accelerators, memory, interconnect and the economics of compute.",
  },
  {
    id: "distributed",
    title: "Distributed Systems",
    description:
      "Decentralized protocols, fault-tolerant networks and coordination at planetary scale.",
    focus: "How computation scales across many machines: collectives, sharding, fault tolerance and coordination at scale.",
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
    label: "Discord",
    href: process.env.NEXT_PUBLIC_DISCORD_URL ?? "#",
    icon: "discord" as const,
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