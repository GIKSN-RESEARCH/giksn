export type ProgramStatus = "Open" | "Upcoming" | "Rolling" | "Closed";

export const PROGRAM_STATUSES: ProgramStatus[] = [
  "Open",
  "Upcoming",
  "Rolling",
  "Closed",
];

export const PROGRAM_PRESET_SECTORS = ["AI", "DT", "HW", "DS"] as const;

export function primaryProgramCategory(
  sectors: string[]
): "AI" | "DT" | "HW" | "DS" {
  const hit = sectors.find((s) =>
    (PROGRAM_PRESET_SECTORS as readonly string[]).includes(s)
  );
  return (hit as "AI" | "DT" | "HW" | "DS") ?? "AI";
}

export type Program = {
  slug: string;
  name: string;
  tagline: string;
  status: ProgramStatus;
  startsOn?: string | null;
  endsOn?: string | null;
  tentativeStart?: string | null;
  website?: string | null;
  category: "AI" | "DT" | "HW" | "DS";
  sectors: string[];
  description: string;
  highlights: string[];
  listed: boolean;
  updated?: string;
};
