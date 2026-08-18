import { sql } from "drizzle-orm";
import {
  boolean,
  pgEnum,
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  date,
  jsonb,
  varchar,
  uniqueIndex,
  index,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

import type { PaperSection } from "@/lib/papers";
import type { ProductInstall, ProductLink, ProductPaperRef } from "@/lib/products";

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

export const productStatusEnum = pgEnum("product_status", [
  "Alpha",
  "Beta",
  "Stable",
]);

export const programStatusEnum = pgEnum("program_status", [
  "Open",
  "Upcoming",
  "Rolling",
  "Closed",
]);

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

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 80 }).notNull(),
    name: text("name").notNull(),
    tagline: text("tagline").notNull(),
    version: varchar("version", { length: 40 }),
    status: productStatusEnum("status").notNull().default("Alpha"),
    license: text("license").notNull(),
    website: text("website"),
    category: categoryEnum("category").notNull(),
    description: text("description").notNull(),
    highlights: jsonb("highlights").$type<string[]>().notNull(),
    install: jsonb("install").$type<ProductInstall | null>(),
    paperRef: jsonb("paper_ref").$type<ProductPaperRef | null>(),
    links: jsonb("links").$type<ProductLink[]>().notNull(),
    listed: boolean("listed").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    updated: timestamp("updated", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    slugUniq: uniqueIndex("products_slug_uniq").on(t.slug),
    bySort: index("products_sort_idx").on(t.sortOrder),
  })
);

export type PaperRow = typeof papers.$inferSelect;
export type PaperInsert = typeof papers.$inferInsert;
export type CommentRow = typeof comments.$inferSelect;
export type CommentInsert = typeof comments.$inferInsert;
export type AdminRow = typeof admins.$inferSelect;
export type AdminInsert = typeof admins.$inferInsert;
export const programs = pgTable(
  "programs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 80 }).notNull(),
    name: text("name").notNull(),
    tagline: text("tagline").notNull(),
    status: programStatusEnum("status").notNull().default("Upcoming"),
    startsOn: date("starts_on", { mode: "string" }),
    endsOn: date("ends_on", { mode: "string" }),
    tentativeStart: varchar("tentative_start", { length: 80 }),
    website: text("website"),
    category: categoryEnum("category").notNull(),
    sectors: jsonb("sectors").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    description: text("description").notNull(),
    highlights: jsonb("highlights").$type<string[]>().notNull(),
    listed: boolean("listed").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    updated: timestamp("updated", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    slugUniq: uniqueIndex("programs_slug_uniq").on(t.slug),
    bySort: index("programs_sort_idx").on(t.sortOrder),
  })
);

export const news = pgTable(
  "news",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 80 }).notNull(),
    title: text("title").notNull(),
    href: text("href"),
    listed: boolean("listed").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    updated: timestamp("updated", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    slugUniq: uniqueIndex("news_slug_uniq").on(t.slug),
    bySort: index("news_sort_idx").on(t.sortOrder),
  })
);

export type ProductRow = typeof products.$inferSelect;
export type ProductInsert = typeof products.$inferInsert;
export type ProgramRow = typeof programs.$inferSelect;
export type ProgramInsert = typeof programs.$inferInsert;
export type NewsRow = typeof news.$inferSelect;
export type NewsInsert = typeof news.$inferInsert;
