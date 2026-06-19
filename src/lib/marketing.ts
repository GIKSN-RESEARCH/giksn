import { researchDomains, values } from "@/lib/site";

export const foundingPrinciples = [
  {
    title: "Open by default",
    description:
      "Research output, explainers and reasoning are published in the open. Transparency builds trust and attracts the right collaborators.",
  },
  {
    title: "Rigor over hype",
    description:
      "We separate what is demonstrated from what is marketed. Clear writing and reproducible thinking matter more than trend-chasing.",
  },
  {
    title: "Cross-domain by design",
    description:
      "AGI, Deeptech, Hardware and Distributed Systems are studied individually and at their intersections — where the hardest problems live.",
  },
  {
    title: "Community-first execution",
    description:
      "The lab grows through vetted contributors who can understand and continue the work. Funding follows demonstrated maturity, not the other way around.",
  },
] as const;

export const roadmapPhases = [
  {
    phase: "Now",
    title: "Publish & explain",
    items: [
      "DB-backed publications, insights and resources",
      "Public Discord server and open social presence",
      "Contributor application intake",
    ],
  },
  {
    phase: "Next",
    title: "Gated community",
    items: [
      "Application review and contributor provisioning",
      "Private Discord channels via OAuth and access tokens",
      "Full-text search, RSS and security hardening",
    ],
  },
  {
    phase: "Later",
    title: "Depth & tooling",
    items: [
      "Working-group coordination in Discord",
      "Hosted research tools and protocol demos",
      "Expanded benchmarks and resources landscape",
    ],
  },
] as const;

export const researchMethodology = {
  standalone: {
    title: "Standalone research",
    description:
      "Each domain has its own depth: AGI reasoning and capability paths, Deeptech breakthrough translation, Hardware substrate economics, Distributed Systems coordination at scale. We publish papers, reports and explainers within a single domain when the problem warrants it.",
  },
  correlated: {
    title: "Correlated research",
    description:
      "The lab's distinctive edge is studying where domains meet — hardware limits shaping AGI deployment, distributed protocols as research infrastructure, deeptech substrates enabling new compute paths. Cross-domain work is explicit, tagged and linked across publications and projects.",
  },
} as const;

export const openQuestions = [
  "What hardware assumptions break first as reasoning models scale?",
  "Which distributed coordination primitives actually support community-scale research?",
  "Where do tooling explainers create the highest leverage for frontier builders?",
  "How should cross-domain correlations be validated — benchmarks, prototypes, or field studies?",
] as const;

export const communityGuidelines = [
  {
    title: "Lead with substance",
    description:
      "Share reasoning, links, and evidence — not hype threads. The lab optimizes for people who can read, critique, and continue the work.",
  },
  {
    title: "Stay on-domain",
    description:
      "Public channels are for AGI, Deeptech, Hardware, Distributed Systems and their intersections. Off-topic noise dilutes the signal.",
  },
  {
    title: "No credential theater",
    description:
      "Titles and follower counts do not grant authority here. Demonstrated work, clear writing, and useful critique do.",
  },
  {
    title: "Respect the vetting boundary",
    description:
      "Private channels, internal projects, and contributor tooling are gated. Do not ask for tokens, invite links, or exceptions in public channels.",
  },
] as const;

export const contributionProcess = [
  {
    step: "01",
    title: "Follow in public",
    description:
      "Join the public Discord server, read publications and insights, and participate in open discussion.",
  },
  {
    step: "02",
    title: "Apply with evidence",
    description:
      "Submit the contributor form with domains, background, motivation, and concrete evidence of deep work — repos, writing, prototypes.",
  },
  {
    step: "03",
    title: "Manual review",
    description:
      "Applications are reviewed by the lab. We accept a small number of contributors at a time based on fit and execution capacity.",
  },
  {
    step: "04",
    title: "Onboard with Discord",
    description:
      "Accepted contributors receive a platform invitation and connect Discord for the contributor role.",
  },
] as const;

export const codeOfConductPoints = [
  "No harassment, discrimination, or personal attacks.",
  "No spam, unsolicited promotion, or credential farming.",
  "No sharing of private-channel content, tokens, or internal materials.",
  "Report concerns to the lab via the contact form — we take enforcement seriously.",
] as const;

export const memberSpotlights = [
  {
    name: "Bootstrap cohort",
    role: "Founding contributors",
    note: "Member spotlights will highlight vetted contributors as the community grows. Apply if you want to be among the first named profiles.",
  },
] as const;

export const communityEvents = [
  {
    title: "Open research drops",
    cadence: "Ongoing",
    description:
      "Publications, insights, and explainers publish to the site and are announced in the public Discord server.",
  },
  {
    title: "Working groups",
    cadence: "Contributor-only",
    description:
      "Domain and project working groups coordinate in private Discord channels after vetting. Details shared on acceptance.",
  },
] as const;

export { researchDomains, values };