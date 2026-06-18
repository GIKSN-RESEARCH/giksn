import {
  pgTable,
  pgEnum,
  uuid,
  text,
  varchar,
  boolean,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';

// Enums
export const roleEnum = pgEnum('role', ['admin', 'contributor']);
export const userStatusEnum = pgEnum('user_status', ['active', 'suspended']);
export const contentStatusEnum = pgEnum('content_status', ['draft', 'published', 'archived']);
export const pubTypeEnum = pgEnum('publication_type', ['Paper', 'Report', 'Preprint', 'Explainer']);
export const insightCategoryEnum = pgEnum('insight_category', [
  'Tooling & Use Cases',
  'Frontier Analysis',
  'Cross-Domain Thinking',
  'Community Spotlights',
]);
export const projectStatusEnum = pgEnum('project_status', [
  'Active',
  'Open for Contributors',
  'Completed',
  'Exploratory',
]);
export const visibilityEnum = pgEnum('visibility', ['public', 'contributor']);
export const applicationStatusEnum = pgEnum('application_status', [
  'pending',
  'under_review',
  'accepted',
  'rejected',
  'waitlisted',
]);

// Better Auth core tables (with additional fields on user)
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  role: roleEnum('role').notNull().default('contributor'),
  status: userStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

// Profiles (1:1 with approved users)
export const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().unique(), // FK to Better Auth user.id
  handle: varchar('handle', { length: 64 }).notNull().unique(),
  displayName: text('display_name').notNull(),
  bio: text('bio'),
  domains: text('domains').array().notNull().default([]),
  links: jsonb('links').$type<{
    github?: string;
    x?: string;
    scholar?: string;
    website?: string;
  }>().default({}),
  joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
});

// Publications
export const publications = pgTable('publications', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 160 }).notNull().unique(),
  title: text('title').notNull(),
  abstract: text('abstract').notNull(),
  bodyMdx: text('body_mdx').notNull(),
  type: pubTypeEnum('type').notNull(),
  domains: text('domains').array().notNull().default([]),
  tags: text('tags').array().notNull().default([]),
  authors: jsonb('authors').$type<Array<{ name: string; profileId?: string }>>().notNull().default([]),
  links: jsonb('links').$type<{
    pdf?: string;
    arxiv?: string;
    code?: string;
    discussion?: string;
  }>().default({}),
  status: contentStatusEnum('status').notNull().default('draft'),
  featured: boolean('featured').notNull().default(false),
  authorId: text('author_id').notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  statusIdx: index('pub_status_idx').on(t.status),
  // tsvector + GIN to be added via custom migration
}));

// Insights
export const insights = pgTable('insights', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 160 }).notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull(),
  bodyMdx: text('body_mdx').notNull(),
  category: insightCategoryEnum('category').notNull(),
  domains: text('domains').array().notNull().default([]),
  tags: text('tags').array().notNull().default([]),
  coverImageUrl: text('cover_image_url'),
  substackUrl: text('substack_url'),
  status: contentStatusEnum('status').notNull().default('draft'),
  featured: boolean('featured').notNull().default(false),
  authorId: text('author_id').notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  statusIdx: index('insight_status_idx').on(t.status),
}));

// Projects
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 160 }).notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  bodyMdx: text('body_mdx').notNull(),
  status: projectStatusEnum('status').notNull().default('Exploratory'),
  visibility: visibilityEnum('visibility').notNull().default('public'),
  domains: text('domains').array().notNull().default([]),
  leads: jsonb('leads').$type<Array<{ name: string; profileId?: string }>>().notNull().default([]),
  goals: text('goals').array().notNull().default([]),
  outputs: jsonb('outputs').$type<Array<{ label: string; url?: string }>>().notNull().default([]),
  repo: text('repo'),
  contact: text('contact'),
  featured: boolean('featured').notNull().default(false),
  authorId: text('author_id').notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  statusIdx: index('project_status_idx').on(t.status),
  visibilityIdx: index('project_visibility_idx').on(t.visibility),
}));

// Resources
export const resources = pgTable('resources', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 160 }).notNull().unique(),
  title: text('title').notNull(),
  summary: text('summary').notNull(),
  bodyMdx: text('body_mdx'),
  category: text('category').notNull(),
  domains: text('domains').array().notNull().default([]),
  url: text('url').notNull(),
  tags: text('tags').array().notNull().default([]),
  status: contentStatusEnum('status').notNull().default('published'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  statusIdx: index('resource_status_idx').on(t.status),
}));

// Applications
export const applications = pgTable('applications', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: varchar('email', { length: 256 }).notNull(),
  domains: text('domains').array().notNull().default([]),
  background: text('background').notNull(),
  cvUrl: text('cv_url'),
  links: jsonb('links').$type<{
    github?: string;
    scholar?: string;
    x?: string;
    portfolio?: string;
  }>().default({}),
  motivation: text('motivation').notNull(),
  evidence: text('evidence').notNull(),
  referral: text('referral'),
  status: applicationStatusEnum('status').notNull().default('pending'),
  reviewerNotes: text('reviewer_notes'),
  reviewedBy: text('reviewed_by'),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  statusIdx: index('app_status_idx').on(t.status),
  emailIdx: index('app_email_idx').on(t.email),
}));

// Invitations
export const invitations = pgTable('invitations', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 256 }).notNull(),
  token: text('token').notNull().unique(),
  telegramAccessToken: text('telegram_access_token').notNull().unique(),
  telegramUserId: text('telegram_user_id'),
  telegramTokenRedeemedAt: timestamp('telegram_token_redeemed_at', { withTimezone: true }),
  role: roleEnum('role').notNull().default('contributor'),
  applicationId: uuid('application_id'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Audit log
export const auditLog = pgTable('audit_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  actorId: text('actor_id').notNull(),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Misc tables
export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 256 }).notNull().unique(),
  status: text('status').notNull().default('pending'), // pending, confirmed, unsubscribed
  source: text('source'),
  confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const contactMessages = pgTable('contact_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: varchar('email', { length: 256 }).notNull(),
  subject: text('subject'),
  message: text('message').notNull(),
  handled: boolean('handled').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const media = pgTable('media', {
  id: uuid('id').defaultRandom().primaryKey(),
  url: text('url').notNull(),
  key: text('key').notNull().unique(),
  mimeType: text('mime_type'),
  size: text('size'),
  uploadedBy: text('uploaded_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});