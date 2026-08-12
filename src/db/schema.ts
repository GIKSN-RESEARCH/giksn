import { sql } from "drizzle-orm";
import {
  boolean,
  pgEnum,
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  jsonb,
  varchar,
  uniqueIndex,
  index,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

import type { PaperSection } from "@/lib/papers";

export const categoryEnum = pgEnum("category", [
  "AI",
  "DT",
  "HW",
  "DS",
  "UP",
]);

export const statusEnum = pgEnum("status", [
  "Research",
  "Writings",
  "Products",
  "Programs",
]);

export const kindEnum = pgEnum("kind", ["Original", "Survey"]);

export const papers = pgTable(
  "papers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    number: integer("number").notNull(),
    category: categoryEnum("category").notNull(),
    kind: kindEnum("kind").notNull().default("Original"),
    slug: varchar("slug", { length: 200 }).notNull(),
    title: text("title").notNull(),
    abstract: text("abstract").notNull(),
    status: statusEnum("status").notNull().default("Research"),
    author: text("author").notNull(),
    authorHandle: text("author_handle").notNull(),
    posted: timestamp("posted", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updated: timestamp("updated", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    readingMinutes: integer("reading_minutes").notNull().default(3),
    body: jsonb("body").$type<PaperSection[]>().notNull(),
    hidden: boolean("hidden").notNull().default(false),
    featured: boolean("featured").notNull().default(false),
    source: text("source"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    bySlug: uniqueIndex("papers_category_slug_uniq").on(t.category, t.slug),
    byNumber: uniqueIndex("papers_category_number_uniq").on(
      t.category,
      t.number
    ),
    byUpdated: index("papers_updated_idx").on(t.updated),
  })
);

export const admins = pgTable(
  "admins",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    emailUniq: uniqueIndex("admins_email_uniq").on(t.email),
  })
);

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    paperId: uuid("paper_id")
      .notNull()
      .references(() => papers.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id").references((): AnyPgColumn => comments.id, {
      onDelete: "cascade",
    }),
    author: text("author").notNull(),
    handle: text("handle").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    byPaper: index("comments_paper_idx").on(t.paperId),
    byParent: index("comments_parent_idx").on(t.parentId),
  })
);

export type PaperRow = typeof papers.$inferSelect;
export type PaperInsert = typeof papers.$inferInsert;
export type CommentRow = typeof comments.$inferSelect;
export type CommentInsert = typeof comments.$inferInsert;
export type AdminRow = typeof admins.$inferSelect;
export type AdminInsert = typeof admins.$inferInsert;
