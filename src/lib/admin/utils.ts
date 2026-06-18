import { z } from "zod";

export const slugSchema = z
  .string()
  .min(3)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be kebab-case");

export function slugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 160);
}

export function parseCommaList(value?: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function resolvePublishedAt(
  status: "draft" | "published" | "archived",
  existingPublishedAt?: Date | null,
  incomingPublishedAt?: string | null
): Date | null {
  if (status !== "published") return null;
  if (incomingPublishedAt) return new Date(incomingPublishedAt);
  if (existingPublishedAt) return existingPublishedAt;
  return new Date();
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export function actionError(error: unknown): ActionResult<never> {
  if (error instanceof z.ZodError) {
    return { success: false, error: error.issues[0]?.message ?? "Validation failed" };
  }
  if (error instanceof Error) {
    return { success: false, error: error.message };
  }
  return { success: false, error: "Something went wrong" };
}