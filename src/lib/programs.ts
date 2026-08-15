export type ProgramStatus = "Open" | "Upcoming" | "Rolling" | "Closed";

export const PROGRAM_STATUSES: ProgramStatus[] = [
  "Open",
  "Upcoming",
  "Rolling",
  "Closed",
];

export type Program = {
  slug: string;
  name: string;
  tagline: string;
  status: ProgramStatus;
  website?: string | null;
  category: "AI" | "DT" | "HW" | "DS";
  description: string;
  highlights: string[];
  listed: boolean;
  updated?: string;
};
