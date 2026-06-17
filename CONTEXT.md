# GIKSN Research: Project Context & Technical Architecture

> Persistent context document for the GIKSN Research website and platform build. This is the single source of truth for positioning, design direction, technical stack, backend, database, content models, 3D strategy, site structure and phased delivery. Keep it updated as decisions evolve.

---

## 0. Project Overview

**Project Name:** GIKSN Research

**Positioning:** Community-first research lab focused on AI, AGI, Deeptech, Hardware and Distributed Systems. Research is conducted both standalone and in correlation across domains. AGI and Deeptech are the top priorities. The lab does not only write about the frontier, it builds at it: tools and protocols come out of the research and the platform is the hub for that work.

**Core Promise:** High-quality open research paired with clear, accessible explanations of existing tooling and real-world use cases.

**Approach:** Bootstrap through a community of researchers and builders. Prioritize real execution and open research. Funding comes after demonstrating maturity and tangible output.

**Community Model:** GIKSN is backed by a community built alongside the lab. The live community hub is **Telegram**: a group with both **public channels** (open to anyone) and **private channels** (gated). Contribution is gated, not open. The work requires people who can actually understand the research and continue it, so there is an access wall: anyone can apply, only vetted contributors get the right to work. Accepted candidates receive **access tokens** that unlock the private Telegram channels. The website handles applications, review, token issuance and contributor accounts; Telegram is where day-to-day community interaction happens.

**Distribution Channels:** Telegram (community hub), X, Reddit, Substack and LinkedIn.

**Website Goal:** The central platform and "home base" for the lab. It must read as a credible research institution while carrying modern AI lab energy and strong community-hub qualities. The site drives depth (long-form reading, publications, explainers) while amplifying activity on the social channels. The site is the home base, the social channels drive discovery and the two form a flywheel.

**Tone & Voice:**
- Rigorous yet curious and optimistic.
- Transparent about the community-first, bootstrap stage.
- Professional but approachable for both researchers and builders.
- High-signal. Substance over spectacle. Research credibility takes priority over pure visual flair.

---

## 1. Design Direction (Locked)

**Primary Style:** Refined Cyberpunk / Neon Futurism, research-appropriate version. Sophisticated, not game-like or glitch-heavy.

**Fallback Style:** Stark Monochrome Futurism (xAI-style). Only swap to this if the cyberpunk direction does not land in the final platform.

**Style Characteristics:**
- Dark foundation with strong neon accents and subtle glows.
- Clean visual hierarchy with excellent readability for dense technical content.
- Depth carried through high-quality 3D assets rather than heavy 2D effects.
- Subtle neon edge highlights and glows, especially on interactive and 3D elements.
- Terminal-inspired typography and restrained grid overlays.
- Ample whitespace and strong hierarchy so dense content stays scannable.

### Color Palette (Final)

Single cohesive theme built on off-white and orange as the dual core, electric cyan as the primary complementary neon (the "third compatible color") and deep purple as a restrained tertiary used only for depth and hover states.

| Role            | Name            | Hex       | Usage |
|-----------------|-----------------|-----------|-------|
| Background      | Deep Charcoal   | `#0D0D12` | Main background |
| Primary Text    | Warm Off-White  | `#F5F2E9` | Headings, body text, highlights |
| Primary Neon    | Electric Orange | `#FF5C00` | CTAs, key highlights, primary 3D emissive material |
| Secondary Neon  | Electric Cyan   | `#00E5FF` | Secondary accents, links, data viz, secondary emissive |
| Tertiary Accent | Deep Purple     | `#7B2CBF` | Subtle depth, hover states, ambient 3D glow |
| Surface / Cards | Dark Panel      | `#1A1A24` | Cards, sections, modals |
| Muted Text      | Muted Gray      | `#A1A1AA` | Secondary text and captions |

**Color hierarchy rule:** Off-white and orange define the identity. Cyan is the only secondary accent that should appear frequently. Purple stays subtle and is reserved for depth, ambient glow and hover transitions. Do not let cyan and purple compete with orange for attention.

**Mode:** Dark-only for v1. The aesthetic depends on the dark foundation, so a light mode is intentionally out of scope until there is a real reason for it. Skip the theme toggle for now.

### Typography

- **UI & Headings:** Modern sans-serif. Inter is the locked default (zero-config via `next/font/google`, no manual download step). Satoshi remains an approved later swap if a more distinctive heading face is wanted, self-hosted via `next/font/local`.
- **Body:** Inter. Highly readable at long-form lengths.
- **Code / Math / Technical:** Monospace. JetBrains Mono via `next/font/google` (zero download). Used for code blocks, inline code, math fallbacks and terminal-style accents.

Rationale for locking Inter + JetBrains Mono first: both install through `next/font/google` with no browser-download step, which keeps the whole setup CLI and package-manager driven. Satoshi is the upgrade path, not the starting point.

---

## 2. Technical Architecture

### 2.1 Core Stack (Locked)

- **Next.js 15** (App Router) as a full-stack framework. The backend lives inside the same app: Server Actions for mutations, Route Handlers for APIs and webhooks. No separate backend service in v1.
- **TypeScript** (strict mode)
- **Tailwind CSS** (v4, CSS-first config via `@theme`)
- **shadcn/ui** (component layer + design tokens; CLI is `shadcn`, not the deprecated `shadcn-ui`)
- **Framer Motion** (2D animation, transitions, scroll-triggered reveals; also published as the `motion` package, `framer-motion` is fine)
- **React Three Fiber** (`@react-three/fiber`) + **@react-three/drei** + **three** (all 3D assets and scenes)
- **MDX** for Publications, Insights and technical content, with **KaTeX** math support, now rendered at request time from the database (see 2.7)

### 2.2 Data & Backend Stack (Locked)

This is the core addition over the original spec. The site is no longer build-time static. Content and community state live in a database and are managed at runtime through a private admin panel.

- **Neon** (serverless Postgres): primary database. Scales to zero, branchable, Vercel-native. Supabase Postgres is the all-in-one alternative if managed auth plus storage plus RLS in one product is preferred. Decision: Neon, paired with discrete auth and storage for full control.
- **Drizzle ORM** + **drizzle-kit**: TypeScript-native, SQL-first, typed, migrations through CLI. Chosen over Prisma for the lighter runtime and SQL-level control.
- **Better Auth**: self-hosted, TypeScript-native auth with sessions, OAuth, magic links and a role model. Drizzle adapter, Postgres-backed. Chosen over a managed provider (Clerk, WorkOS) to avoid vendor lock-in and keep identity and access fully owned. Auth.js (NextAuth v5) is the fallback if Better Auth ever becomes a constraint.
- **next-mdx-remote** (`next-mdx-remote/rsc`): renders MDX source stored in the database at request time, using the same remark and rehype plugins. This replaces Velite. It is what makes runtime publishing possible without a redeploy.
- **Vercel Blob**: object storage for uploads (publication PDFs, cover images, figures, CVs). Cloudflare R2 (S3-compatible) is the cost-optimized path at scale.
- **Resend** + **React Email**: transactional email (application confirmations, admin notifications, contributor invitations).
- **@upstash/ratelimit** + **@upstash/redis**: rate limiting on public endpoints (application form, contact, newsletter, auth).
- **Cloudflare Turnstile**: lightweight privacy-friendly bot protection on public forms, paired with a honeypot field.
- **Zod**: validation on every server boundary (Server Actions, Route Handlers, forms). Already in the stack.
- **@tanstack/react-query**: client data and mutations inside the admin panel. Now justified by the interactive admin UI. Not used on public content pages, which stay server-rendered.

### 2.3 Supporting Libraries

- **@react-three/postprocessing**: bloom and effect composition. This is the missing piece for real neon glow. Emissive materials alone do not glow, bloom is what produces it.
- **remark-math** + **rehype-katex** + **katex**: math rendering pipeline (wired into the MDX render config).
- **rehype-pretty-code** + **shiki**: syntax highlighting (wired into the MDX render config).
- **react-hook-form** + **@hookform/resolvers**: forms (admin editors, Join, Apply, Contact) with Zod schemas.
- **sonner**: toast notifications.
- **leva**: runtime dev controls for tuning 3D scenes. Gate behind `NODE_ENV !== 'production'` so it never ships.
- **clsx** + **tailwind-merge** + **class-variance-authority** + **lucide-react**: utilities and icons (installed by shadcn init).
- **@vercel/analytics** + **@vercel/speed-insights**: privacy-friendly analytics and Web Vitals. Plausible or Umami if a self-hosted privacy story is preferred.

Removed from the original plan: **Velite** (superseded by DB-backed MDX) and **Fuse.js** (client-side search superseded by Postgres full-text search, see 2.19).

### 2.4 Install (CLI, pnpm)

```bash
# scaffold
pnpm create next-app@latest giksn-research --typescript --tailwind --app --eslint --no-src-dir --import-alias "@/*"
cd giksn-research

# shadcn/ui
pnpm dlx shadcn@latest init

# 3D
pnpm add three @react-three/fiber @react-three/drei @react-three/postprocessing
pnpm add -D @types/three

# animation
pnpm add framer-motion

# database + ORM
pnpm add drizzle-orm @neondatabase/serverless
pnpm add -D drizzle-kit

# auth
pnpm add better-auth

# runtime MDX rendering + math + highlighting
pnpm add next-mdx-remote remark-math rehype-katex katex rehype-pretty-code shiki

# storage, email, rate limiting
pnpm add @vercel/blob resend react-email @react-email/components @upstash/ratelimit @upstash/redis

# forms, validation, toasts, admin data
pnpm add react-hook-form zod @hookform/resolvers sonner @tanstack/react-query

# dev 3D controls
pnpm add leva

# analytics
pnpm add @vercel/analytics @vercel/speed-insights
```

No browser-download steps anywhere. Fonts come through `next/font/google`. Everything else installs through the package manager.

### 2.5 Environment Variables

```
# database
DATABASE_URL=                # pooled connection (app runtime)
DATABASE_URL_UNPOOLED=       # direct connection (migrations)

# auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
ADMIN_EMAILS=                # comma-separated allowlist, grants admin role on sign-in

# email
RESEND_API_KEY=
EMAIL_FROM=

# storage
BLOB_READ_WRITE_TOKEN=

# rate limiting
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# bot protection
TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

### 2.6 Project Structure

No `src` directory. App Router, backend and data concerns sit at the repo root.

```
giksn-research/
├── app/
│   ├── layout.tsx                  # root layout: fonts, providers, header, footer
│   ├── globals.css                 # Tailwind v4 @theme + design tokens
│   ├── page.tsx                    # Home
│   ├── not-found.tsx
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── about/page.tsx
│   ├── research/page.tsx
│   ├── publications/
│   │   ├── page.tsx                # filterable + searchable list (server search)
│   │   └── [slug]/page.tsx         # entry, ISR, DB-backed
│   ├── insights/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── projects/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── community/page.tsx
│   ├── resources/page.tsx          # DB-backed, posted from admin
│   ├── join/page.tsx               # entry point into Apply
│   ├── contribute/
│   │   └── apply/page.tsx          # public contributor application form
│   ├── contact/page.tsx
│   │
│   ├── admin/                      # PRIVATE. Admin-only. Gated in middleware + layout.
│   │   ├── layout.tsx              # role guard (requireAdmin), admin shell
│   │   ├── page.tsx                # dashboard: counts, recent activity, pending applications
│   │   ├── publications/           # list / new / [id] edit
│   │   ├── insights/
│   │   ├── projects/
│   │   ├── resources/
│   │   ├── applications/           # review queue: accept / reject / waitlist
│   │   ├── members/                # contributors: roles, status
│   │   ├── media/                  # uploaded asset library
│   │   └── settings/
│   │
│   └── api/
│       ├── auth/[...all]/route.ts  # Better Auth handler
│       ├── upload/route.ts         # Vercel Blob upload / presign
│       ├── feed.xml/route.ts       # DB-backed RSS (insights + publications)
│       ├── og/route.tsx            # dynamic OG images (next/og)
│       └── cron/[job]/route.ts     # scheduled jobs
│
├── db/
│   ├── index.ts                    # Drizzle client (Neon)
│   ├── schema/                     # table definitions (see 2.8)
│   │   ├── auth.ts
│   │   ├── profiles.ts
│   │   ├── publications.ts
│   │   ├── insights.ts
│   │   ├── projects.ts
│   │   ├── resources.ts
│   │   ├── applications.ts
│   │   ├── invitations.ts
│   │   ├── media.ts
│   │   ├── audit.ts
│   │   └── misc.ts                 # newsletter, contact
│   └── migrate.ts
│
├── actions/                        # Server Actions (mutations), Zod-validated
│   ├── content.ts                  # publication / insight / project / resource CRUD
│   ├── applications.ts             # submit, review, accept (-> invitation), reject
│   ├── members.ts                  # role / status changes
│   └── public.ts                   # contact, newsletter
│
├── components/
│   ├── ui/                         # shadcn/ui primitives
│   ├── layout/                     # Header, Footer, Nav, SocialLinks, MobileNav
│   ├── sections/                   # Hero, Mission, Pillars, CurrentWork, ...
│   ├── three/                      # all React Three Fiber code (see 2.16)
│   ├── content/                    # PublicationCard, InsightCard, ProjectCard, Filters, SearchBar, DomainBadge
│   ├── mdx/                        # MDX component overrides (headings, code, callouts, figures, math)
│   ├── admin/                      # editors, tables, MDX editor + live preview, review panels
│   └── forms/                      # ApplicationForm, ContactForm, NewsletterForm
│
├── lib/
│   ├── auth.ts                     # Better Auth config + role model
│   ├── auth-guard.ts               # getSession, requireAdmin, requireContributor
│   ├── mdx.ts                      # next-mdx-remote render config (remark/rehype + components)
│   ├── queries/                    # typed DB read functions
│   ├── search.ts                   # Postgres full-text search queries
│   ├── ratelimit.ts                # Upstash limiters per endpoint
│   ├── email/                      # Resend client + React Email templates
│   ├── motion.ts                   # centralized Framer Motion variants
│   ├── seo.ts                      # metadata + JSON-LD builders
│   └── utils.ts                    # cn(), formatters
│
├── hooks/
├── types/
├── public/
├── middleware.ts                   # protect /admin and contributor-only routes
├── drizzle.config.ts
├── next.config.mjs
├── components.json                 # shadcn config
└── tsconfig.json
```

### 2.7 Content Architecture (DB-backed MDX): supersedes Velite

The original spec authored content as MDX files compiled at build by Velite. That is incompatible with the requirement to post regularly from an admin panel without touching the codebase. Content now lives in Postgres and is rendered at request time. This decision supersedes the Velite content-layer decision.

How it works:
- Publications, Insights, Projects and Resources are rows in Postgres. The long-form body is stored as MDX source in a `body_mdx` text column. Authoring still uses full MDX with LaTeX math and code blocks, so nothing is lost in expressive power.
- Public pages render the MDX source through `next-mdx-remote/rsc` inside a Server Component, with `remark-math` + `rehype-katex` for math and `rehype-pretty-code` + `shiki` for code, plus the custom MDX components. `katex/dist/katex.min.css` is imported in the root layout.
- Pages use Incremental Static Regeneration and tag-based caching. Public reads go through `unstable_cache` tagged per collection (for example `insights`, `publications`). When the admin publishes or edits, the relevant Server Action calls `revalidateTag('insights')` and `revalidatePath('/insights/[slug]')`, so the public page updates within seconds with no redeploy.
- Marketing and structural pages (home, about, research, community) stay as coded React. They are design-heavy and rarely change, so they do not belong in the CMS.
- Drafts are never publicly readable. Public queries always filter `status = 'published'`. Contributor-only content (for example private projects) additionally requires a contributor session.

### 2.8 Database Schema (Drizzle)

Better Auth owns the core auth tables (`user`, `session`, `account`, `verification`). `role` and `status` are added to the `user` table through Better Auth `additionalFields`. The application tables below are defined in `db/schema/*` with Drizzle.

```ts
import {
  pgTable, pgEnum, uuid, text, varchar, boolean, timestamp, jsonb, index,
} from 'drizzle-orm/pg-core'

// enums
export const roleEnum = pgEnum('role', ['admin', 'contributor'])
export const userStatusEnum = pgEnum('user_status', ['active', 'suspended'])
export const contentStatusEnum = pgEnum('content_status', ['draft', 'published', 'archived'])
export const pubTypeEnum = pgEnum('publication_type', ['Paper', 'Report', 'Preprint', 'Explainer'])
export const insightCategoryEnum = pgEnum('insight_category', [
  'Tooling & Use Cases', 'Frontier Analysis', 'Cross-Domain Thinking', 'Community Spotlights',
])
export const projectStatusEnum = pgEnum('project_status', [
  'Active', 'Open for Contributors', 'Completed', 'Exploratory',
])
export const visibilityEnum = pgEnum('visibility', ['public', 'contributor'])
export const applicationStatusEnum = pgEnum('application_status', [
  'pending', 'under_review', 'accepted', 'rejected', 'waitlisted',
])

// public-facing contributor identity + expertise (1:1 with an approved user)
export const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().unique(),            // fk -> user.id (Better Auth)
  handle: varchar('handle', { length: 64 }).notNull().unique(),
  displayName: text('display_name').notNull(),
  bio: text('bio'),
  domains: text('domains').array().notNull().default([]),
  links: jsonb('links').$type<{ github?: string; x?: string; scholar?: string; website?: string }>().default({}),
  joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
})

// publications
export const publications = pgTable('publications', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 160 }).notNull().unique(),
  title: text('title').notNull(),
  abstract: text('abstract').notNull(),
  bodyMdx: text('body_mdx').notNull(),                   // MDX source
  type: pubTypeEnum('type').notNull(),
  domains: text('domains').array().notNull().default([]),// multi-domain, captures cross-domain work
  tags: text('tags').array().notNull().default([]),
  authors: jsonb('authors').$type<Array<{ name: string; profileId?: string }>>().notNull().default([]),
  links: jsonb('links').$type<{ pdf?: string; arxiv?: string; code?: string; discussion?: string }>().default({}),
  status: contentStatusEnum('status').notNull().default('draft'),
  featured: boolean('featured').notNull().default(false),
  authorId: text('author_id').notNull(),                 // who posted
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  statusIdx: index('pub_status_idx').on(t.status),
  // generated tsvector column + GIN index added via raw SQL migration (see 2.19)
}))

// applications: the access wall. Applicants are NOT users until invited.
export const applications = pgTable('applications', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: varchar('email', { length: 256 }).notNull(),
  domains: text('domains').array().notNull().default([]), // areas they want to work on
  background: text('background').notNull(),               // experience / track record
  cvUrl: text('cv_url'),                                  // optional uploaded file
  links: jsonb('links').$type<{ github?: string; scholar?: string; x?: string; portfolio?: string }>().default({}),
  motivation: text('motivation').notNull(),               // why GIKSN
  evidence: text('evidence').notNull(),                   // demonstrates understanding of the research
  referral: text('referral'),
  status: applicationStatusEnum('status').notNull().default('pending'),
  reviewerNotes: text('reviewer_notes'),                  // admin only
  reviewedBy: text('reviewed_by'),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  statusIdx: index('app_status_idx').on(t.status),
  emailIdx: index('app_email_idx').on(t.email),
}))

// invitations: minted when admin accepts an application; redeemed to create the contributor account
export const invitations = pgTable('invitations', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 256 }).notNull(),
  token: text('token').notNull().unique(),               // platform invite redemption
  telegramAccessToken: text('telegram_access_token').notNull().unique(), // gates private TG channels
  telegramUserId: text('telegram_user_id'),                               // bound on first bot redemption
  telegramTokenRedeemedAt: timestamp('telegram_token_redeemed_at', { withTimezone: true }),
  role: roleEnum('role').notNull().default('contributor'),
  applicationId: uuid('application_id'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// audit log: every privileged action (Brooklyn is security-minded; keep a trail)
export const auditLog = pgTable('audit_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  actorId: text('actor_id').notNull(),
  action: text('action').notNull(),                       // e.g. 'publication.publish'
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
```

`insights`, `projects` and `resources` mirror the `publications` shape with their own fields:

- **insights**: `slug`, `title`, `excerpt`, `bodyMdx`, `category` (`insightCategoryEnum`), `domains[]`, `tags[]`, `coverImageUrl`, `substackUrl` (syndication source), `status`, `featured`, `authorId`, `publishedAt`, timestamps.
- **projects**: `slug`, `title`, `description`, `bodyMdx`, `status` (`projectStatusEnum`), `visibility` (`visibilityEnum`, default `public`; `contributor` gates it behind auth), `domains[]`, `leads` (jsonb of profile refs), `goals` (text[]), `outputs` (jsonb of `{ label, url }`), `repo`, `contact`, `featured`, `authorId`, timestamps.
- **resources**: `slug`, `title`, `summary`, `bodyMdx` (optional explainer), `category`, `domains[]`, `url`, `tags[]`, `status`, timestamps. DB-backed so the tooling landscape can be updated regularly from admin.
- **misc**: `newsletter_subscribers` (`email`, `status`, `source`, `confirmedAt`, `createdAt`) and `contact_messages` (`name`, `email`, `subject`, `message`, `handled`, `createdAt`). `media` (`url`, `key`, `mimeType`, `size`, `uploadedBy`, `createdAt`) backs the asset library.

Migrations via `drizzle-kit generate` then `drizzle-kit migrate`, run in CI before deploy against `DATABASE_URL_UNPOOLED`. Custom SQL migrations (tsvector columns, GIN indexes, partial indexes) are committed alongside generated ones.

### 2.9 Authentication & RBAC

Better Auth, Drizzle adapter, Postgres-backed. Sign-in methods: GitHub OAuth (researchers and builders already have GitHub) and email magic link. No password storage.

Roles, kept minimal and extensible:
- **admin**: Brooklyn. Granted by allowlist. On sign-in, if the email is in `ADMIN_EMAILS`, a Better Auth hook sets `role = admin`. Single admin now, but the model supports adding editors later without schema change.
- **contributor**: vetted member. Granted only by redeeming an invitation that the admin issued from an accepted application. There is no open self-service signup into a privileged role.
- **public / unauthenticated**: everyone else. Can read published content and submit an application. Nothing more.

Enforcement is layered, not trusted to any single point:
1. `middleware.ts` blocks `/admin/*` for non-admins and contributor-only routes for non-contributors. Defense in depth and a clean redirect, not the security boundary.
2. The `/admin` layout calls `requireAdmin()` server-side and renders nothing for anyone else.
3. Every Server Action and Route Handler re-checks the session and role at the data layer with `requireAdmin()` or `requireContributor()`. This is the real boundary. Middleware can be bypassed in edge cases, the data layer cannot.
4. Read queries enforce visibility: public queries filter `status = 'published'` and `visibility = 'public'`. Contributor-only data is never returned without a contributor session.

`lib/auth-guard.ts` exposes `getSession()`, `requireAdmin()` and `requireContributor()`, which throw or redirect on failure and return a typed session on success.

### 2.10 Admin Panel

Private CMS at `/admin`, admin-only, single source of all runtime publishing. This is what removes the codebase-and-redeploy loop.

Scope:
- **Dashboard**: content counts, recent activity, pending application count front and center.
- **Content CRUD** for publications, insights, projects and resources: create, edit, save as draft, publish, unpublish, archive, feature, set domains and tags, manage authors and links. Slugs auto-generate with manual override and a uniqueness check.
- **MDX editor with live preview**: a source editor (CodeMirror 6) beside a preview pane that renders through the exact same `next-mdx-remote` pipeline, so math and code render identically to production. WYSIWYG is intentionally avoided because MDX with LaTeX and code is more reliable as source.
- **Media library**: upload to Vercel Blob through the presigned upload route, browse and reuse assets, insert into content.
- **Applications review queue**: see 2.11.
- **Members**: list contributors, change role or status (suspend or restore), view profiles.
- **Newsletter and contact**: subscriber list, inbound contact messages, mark handled.
- **Audit log**: read-only view of privileged actions.

On publish or edit, the corresponding Server Action revalidates the affected tag and path so the public site reflects the change immediately. Optional scheduled publish via a `publishedAt` in the future plus a cron job that flips status.

### 2.11 Contributor Applications & Access Wall

The wall has two halves: an open door to apply and a closed door to work. Anyone can apply. Only vetted people get a contributor account.

Flow:
1. A prospective contributor fills the public form at `/contribute/apply` (reached from `/join` and from Get Involved CTAs). It captures expertise domains, background and track record, links (GitHub, Scholar, X, portfolio), an optional CV upload, motivation for joining GIKSN and evidence that they understand the kind of research the lab does. The evidence field is the point of the wall: it is what separates bright minds who can continue the research from generic interest.
2. Submission is rate-limited, Turnstile-verified and honeypot-guarded, then stored as an `applications` row with status `pending`. The applicant gets a confirmation email, the admin gets a notification.
3. The admin reviews in `/admin/applications` and sets `accepted`, `rejected` or `waitlisted`, with private reviewer notes.
4. On accept, a tokened `invitation` is created (expiring), including a unique `telegramAccessToken`, and an invite email is sent. Rejection and waitlist can send templated mail optionally.
5. The applicant redeems the platform invitation, signs in through Better Auth and is provisioned a `contributor` role plus a `profiles` row. Only now do they have an account.
6. The accepted applicant uses the **Telegram access token** (delivered in the invite email and visible in their post-redemption onboarding) to join the **private Telegram channels**. Public channels remain open to everyone via the public invite link on the site.
7. Contributors can also access contributor-only **platform** content where it exists (for example private projects with `visibility = 'contributor'`). Day-to-day collaboration, working groups and research-in-progress discussion live in the private Telegram channels, not in a bespoke on-site chat.

No application ever auto-creates an account. The only path to a privileged role is admin acceptance plus invitation redemption. The only path to private Telegram channels is a valid, unexpired `telegramAccessToken` tied to an accepted invitation.

### 2.11.1 Telegram Community Architecture

Telegram is the operational community layer. The website is the front door; Telegram is the room.

**Channel structure:**
- **Public channels** — announcements, open discussion, onboarding pointers, links back to publications and insights. Linked from the site (`/community`, `/join`, header/footer). No token required.
- **Private channels** — working groups, research-in-progress, contributor-only discussion and coordination. Access requires a per-candidate `telegramAccessToken` issued only on application acceptance.

**Token lifecycle (platform-owned):**
1. Admin accepts an application → Server Action mints `telegramAccessToken` (cryptographically random, single-use or time-limited per policy) alongside the platform invitation token.
2. Token is stored on the `invitations` row, emailed to the accepted applicant and shown once on the post-redemption onboarding screen.
3. Applicant opens the lab's Telegram bot (linked from the invite email and post-redemption onboarding), sends or pastes their `telegramAccessToken`. The bot validates the token **server-side** against the database, then adds that Telegram user to the private channels. **This is the chosen approach** — safest of the three options because tokens are not shareable invite URLs, redemption is bound to a single Telegram user ID, and access can be revoked without rotating channel links.
4. On successful redemption: set `telegramTokenRedeemedAt`, store the redeemer's Telegram user ID on the invitation (or a `telegram_members` join table) for revocation, audit-log the event.
5. Admin can revoke or rotate tokens from `/admin/members` — bot removes the user from private channels on revoke (audit-logged).

**Why not the alternatives:**
- *Token-gated invite links* — once leaked or forwarded, anyone with the URL can join. Links appear in email clients, browser history and referrers.
- *On-site redemption revealing a join link* — same leak problem after the link is shown; the URL becomes the credential.

**Bot hardening (required):**
- Single-use tokens: reject if `telegramTokenRedeemedAt` is already set (unless admin re-issues).
- Bind to Telegram user ID on first redemption; reject if a different Telegram account presents the same token.
- Rate-limit validation attempts per token and per Telegram user ID (`@upstash/ratelimit`).
- Constant-time token comparison; tokens are high-entropy (≥ 32 bytes, URL-safe).
- Bot webhook Route Handler (`app/api/telegram/webhook/route.ts`) authenticated with a secret path or `X-Telegram-Bot-Api-Secret-Token`; never expose `TELEGRAM_BOT_TOKEN` client-side.
- Private channels use no public invite links; bot adds members by user ID only.

**Platform responsibilities:** application intake, review, token generation, delivery, bot validation, revocation and audit. **Telegram responsibilities:** real-time community interaction in public and private channels.

**Env (required for Telegram):**
```
TELEGRAM_PUBLIC_CHANNEL_URL=       # public channel invite link (open, no token)
TELEGRAM_BOT_TOKEN=                # BotFather token; server-only
TELEGRAM_BOT_WEBHOOK_SECRET=       # validates incoming webhook requests
TELEGRAM_PRIVATE_CHANNEL_IDS=      # comma-separated chat IDs the bot administers
```

### 2.12 Email (Resend + React Email)

Transactional only, templated with React Email, sent through Resend from `EMAIL_FROM`:
- Application received (to applicant).
- New application (to admin).
- Contributor invitation with platform redemption link and Telegram access token (to accepted applicant).
- Optional decision notifications (reject, waitlist).
- Optional newsletter double opt-in confirmation.

### 2.13 Rate Limiting & Security

Brooklyn's threat awareness is high, so the public surface is hardened from the start.
- **Rate limiting** with `@upstash/ratelimit` on the application form, contact form, newsletter signup and auth endpoints. Per-IP sliding window, distinct limits per endpoint in `lib/ratelimit.ts`.
- **Bot protection**: Cloudflare Turnstile plus a honeypot field on every public form.
- **Validation**: Zod on every Server Action and Route Handler input. Never trust the client.
- **Authorization at the data layer**: every mutation re-checks role server-side (see 2.9). Middleware is convenience, not the boundary.
- **CSRF**: Server Actions carry built-in protections. Better Auth handles auth CSRF. Route Handlers that mutate require an authenticated session.
- **Audit trail**: privileged actions written to `audit_log`.
- **Secrets** stay in env. Use the pooled `DATABASE_URL` at runtime and the direct `DATABASE_URL_UNPOOLED` only for migrations. Consider a restricted Postgres role for the app distinct from the migration role.
- **Drafts and private content** are filtered at the query layer, not hidden in the UI.

### 2.14 Object Storage & Media

Vercel Blob for uploads, written through `app/api/upload/route.ts` with auth and type and size checks, recorded in the `media` table. Public assets served from Blob URLs, referenced from content and `coverImageUrl`. Cloudflare R2 (S3-compatible) is the migration target if storage cost or egress becomes a factor.

### 2.15 Routing Map

| Route | Page | Access | Rendering | Notes |
|-------|------|--------|-----------|-------|
| `/` | Home | Public | Static | 3D hero, all home sections |
| `/about` | About / Our Story | Public | Static | coded React |
| `/research` | Research | Public | Static | pillar detail, methodology |
| `/publications` | Publications list | Public | Server-rendered + server search | filter by domain/type/date |
| `/publications/[slug]` | Publication entry | Public | ISR, DB-backed MDX | revalidated on publish |
| `/insights` | Insights list | Public | Server-rendered + server search | category + domain filters |
| `/insights/[slug]` | Insight entry | Public | ISR, DB-backed MDX | |
| `/projects` | Projects list | Public | Server-rendered | public projects only |
| `/projects/[slug]` | Project entry | Public or contributor | ISR / dynamic | `visibility` gates contributor-only |
| `/community` | Community | Public | Static | guidelines, process, public Telegram link, how private access works |
| `/resources` | Resources | Public | ISR, DB-backed | posted from admin |
| `/join` | Join / Contribute | Public | Static | routes into Apply and the channels |
| `/contribute/apply` | Application form | Public | Dynamic + Server Action | rate-limited, Turnstile |
| `/contact` | Contact | Public | Dynamic + Server Action | |
| `/admin/**` | Admin CMS | Admin only | Dynamic | middleware + `requireAdmin` + data-layer checks |
| `/api/auth/[...all]` | Auth | n/a | Route Handler | Better Auth |
| `/api/upload` | Uploads | Admin / contributor | Route Handler | Blob, validated |
| `/api/feed.xml` | RSS | Public | Route Handler | DB-backed |
| `/api/og` | OG images | Public | Route Handler | next/og |

### 2.16 3D Architecture (React Three Fiber)

The 3D layer is the differentiator. The requirement is good-quality dynamic and 3D assets built natively in code, with proper animation and real neon glow.

**SSR and loading.** R3F cannot render on the server. Every scene is wrapped in a client `CanvasRoot` and pulled in with `next/dynamic` and `ssr: false`, plus a lightweight fallback so layout never shifts.

```tsx
import dynamic from 'next/dynamic'
const HeroScene = dynamic(() => import('@/components/three/HeroScene'), {
  ssr: false,
  loading: () => <HeroFallback />,   // static poster / gradient, same dimensions
})
```

**Neon via emissive + bloom.** Emissive `MeshStandardMaterial` plus an `EffectComposer` with `Bloom` from `@react-three/postprocessing`. This is the correct path to a glow. Tone mapping stays filmic, the background stays dark so neon reads.

```tsx
import { EffectComposer, Bloom } from '@react-three/postprocessing'
// inside <Canvas>
<EffectComposer>
  <Bloom intensity={1.2} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur />
</EffectComposer>
```

Material factory pattern under `components/three/materials/` returns emissive standard materials keyed to palette colors (`#FF5C00`, `#00E5FF`, `#7B2CBF`) with tuned `emissiveIntensity`. Connections use drei `<Line>` or a thin emissive tube, the glow comes from bloom.

**Lighting.** Low ambient, one or two point or directional lights, optional subtle environment. Keep it dark on purpose so emissive surfaces pop.

**Scenes:**
- **Hero (`HeroScene.tsx`)**: large scene of interconnected research domains. A central AGI neural structure (instanced node spheres linked by emissive lines, orange and cyan), connected outward to hardware elements (chip-like meshes with circuit-trace detailing) and distributed network nodes (instanced points). Subtle pulsing energy along connections, a slow auto-rotating group with mouse-driven parallax, faint drei `<Stars>` in the deep background. `frameloop="always"` here because of continuous motion, kept cheap through instancing and light geometry.
- **Pillar micro-models (`three/pillars/`)**: one per domain, animating meaningfully on hover or on scroll-into-view:
  - **AGI**: floating neural nodes that form and break connections.
  - **Hardware**: rotating chip with neon circuit traces.
  - **Distributed Systems**: dynamic graph that highlights active links.
  - **Deeptech**: abstract crystalline / lattice structure that refracts and pulses.
  These use `frameloop="demand"` and `invalidate()` on hover or when in view to avoid burning frames while idle.
- **Backgrounds (`three/backgrounds/`)**: subtle particle systems or floating abstract data structures with emissive properties behind Publications and Projects pages. Instanced points, slow drift, low opacity, never competing with text.
- **Card micro-interactions**: small 3D flourishes or data-viz on card hover, kept tiny and lazy.

**Performance discipline:**
- `<Suspense>` boundaries around every scene, lazy load below the fold.
- Instancing (`InstancedMesh`) for repeated nodes and points. Never one mesh per node.
- Never allocate objects inside `useFrame`. Mutate via refs.
- `frameloop="demand"` everywhere except the hero. `invalidate()` on interaction.
- Clamp `dpr={[1, 2]}`. Lower it on low-power devices.
- drei `<PerformanceMonitor>`, `<AdaptiveDpr>` and `<AdaptiveEvents>` to scale quality dynamically.
- Dispose geometries and materials on unmount.
- Prefer procedural or low-to-medium poly geometry over heavy imported models.

**Reduced motion and mobile (non-negotiable):**
- Respect `prefers-reduced-motion`. When set, render a single static frame, disable auto-rotate and pulsing, freeze parallax.
- Below the mobile breakpoint or on low `hardwareConcurrency` / slow connection, render a simplified scene or a static poster image instead of the full hero. Reduce node and particle counts on small screens.
- All canvases are decorative: mark them `aria-hidden` and keep all meaning in the DOM.

**Prototyping note:** Spline is allowed for fast 3D concepting only. Final production assets must be rebuilt in React Three Fiber for control and performance. Nothing ships from Spline directly.

### 2.17 Styling Architecture (Tailwind v4 + shadcn tokens)

Design tokens live as CSS custom properties in `globals.css` and are mapped into both the Tailwind theme and the shadcn token names so every shadcn component inherits the palette automatically. Hex values below, convert to the format the installed shadcn version expects if it uses a different channel notation.

```css
/* globals.css */
@import "tailwindcss";

:root {
  /* raw palette */
  --color-charcoal:   #0D0D12;
  --color-offwhite:   #F5F2E9;
  --color-orange:     #FF5C00;
  --color-cyan:       #00E5FF;
  --color-purple:     #7B2CBF;
  --color-panel:      #1A1A24;
  --color-muted:      #A1A1AA;

  /* shadcn token mapping (dark-only) */
  --background: var(--color-charcoal);
  --foreground: var(--color-offwhite);
  --card: var(--color-panel);
  --card-foreground: var(--color-offwhite);
  --popover: var(--color-panel);
  --popover-foreground: var(--color-offwhite);
  --primary: var(--color-orange);
  --primary-foreground: var(--color-charcoal);
  --secondary: var(--color-cyan);
  --secondary-foreground: var(--color-charcoal);
  --accent: var(--color-purple);
  --accent-foreground: var(--color-offwhite);
  --muted: var(--color-panel);
  --muted-foreground: var(--color-muted);
  --border: #2A2A38;
  --input: #2A2A38;
  --ring: var(--color-orange);
  --radius: 0.5rem;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-secondary: var(--secondary);
  --color-accent: var(--accent);
  --color-card: var(--card);
  --color-muted: var(--muted);
  --font-sans: var(--font-inter);
  --font-mono: var(--font-jetbrains-mono);
}
```

Fonts are loaded in the root layout through `next/font/google`, exposed as CSS variables (`--font-inter`, `--font-jetbrains-mono`) and referenced in the theme. Subtle restrained grid overlays and neon edge highlights are utility classes layered on top, not baked into every surface.

### 2.18 Animation System (Framer Motion)

- All 2D motion, transitions, scroll reveals and micro-interactions go through Framer Motion. 3D motion stays in R3F.
- Centralize variants in `lib/motion.ts`: section fade-and-rise on `whileInView`, staggered children for card grids, hover lift on cards, page transition wrappers.
- Durations roughly 0.3 to 0.6s, ease-out. Purposeful and restrained, never distracting.
- Gate everything on `useReducedMotion()`. When reduced motion is requested, drop to instant opacity changes with no transform.

### 2.19 Search (Postgres full-text): supersedes Fuse.js

Now that content lives in Postgres, search is server-side and scales without a client index.
- A generated `tsvector` column on each searchable table, populated from title plus abstract or excerpt plus tags, with a GIN index. Added through a raw SQL migration.
- `pg_trgm` for fuzzy and typo-tolerant matching on titles.
- Queries use `websearch_to_tsquery` with `ts_rank` for ordering, exposed through `lib/search.ts` and called from the list pages, composing with the domain, type, category and date filters.
- Move to a dedicated engine (Typesense, Meilisearch or Algolia) only when volume makes Postgres search slow. Not before.

### 2.20 SEO, Metadata and Feeds

- Per-route Metadata API. `generateMetadata` for dynamic publication, insight and project pages, reading from the DB.
- JSON-LD: `ScholarlyArticle` for publications, `Article` for insights, `Organization` for the lab. Built in `lib/seo.ts`.
- `app/sitemap.ts` and `app/robots.ts`, with the sitemap generated from published rows.
- RSS at `app/api/feed.xml/route.ts`, DB-backed, covering insights and publications.
- Dynamic Open Graph images per publication and insight via `next/og` `ImageResponse`, themed in the palette.

### 2.21 Performance Budget

- Server Components by default. Ship minimal client JS. Only interactive islands, the admin panel and 3D are client.
- ISR plus tag-based caching for DB content, so reads are served from cache and only regenerate on publish.
- Code-split all 3D, lazy load below the fold.
- `next/font` for both faces, `next/image` for all raster images.
- Route prefetching for primary navigation.
- Track Core Web Vitals with Speed Insights. LCP is the priority metric given the 3D hero, which ships with a same-size static fallback.

### 2.22 Accessibility (Non-negotiable)

- Semantic HTML and landmark regions. Skip-to-content link.
- Fully keyboard-navigable nav, forms and admin controls. Visible `focus-visible` states in the neon palette.
- Color contrast: off-white on charcoal passes for body text. Treat orange and cyan as accents and large text, not small body copy. Verify contrast anywhere color sits on color.
- `prefers-reduced-motion` honored across Framer Motion and R3F.
- 3D is decorative and `aria-hidden`. All meaning lives in the DOM.
- Form fields are labeled with clear inline error messaging. Toasts announce through `sonner`'s live region.
- Alt text on all images including MDX figures.

### 2.23 Deployment

- Target Vercel (native Next.js, zero-config previews). The full stack ships as one deploy.
- Neon as the managed database, connected over the pooled URL at runtime. Migrations run in CI before deploy against the direct URL.
- Vercel Blob for storage, Upstash for rate limiting, Resend for email, all configured through env.
- Scheduled jobs via Vercel Cron hitting `app/api/cron/[job]`. Vercel Cron has plan-dependent frequency limits, so for tighter schedules an external scheduler (for example cron-job.org) can call the same authenticated cron route.
- Privacy-friendly analytics through Vercel Analytics and Speed Insights or Plausible / Umami if a self-hosted posture is preferred.

### 2.24 Conventions

- TypeScript `strict: true`. No implicit `any`.
- Server Components by default. Mark a file `"use client"` only when it needs state, effects, browser APIs, Framer Motion or R3F.
- Mutations go through Server Actions in `actions/`, each validating input with Zod and re-checking auth at the top. Reads go through typed functions in `lib/queries/`.
- All 3D is client-only and dynamically imported.
- Named exports for components and utilities. Default export only where a framework requires it (Next route files).
- Path alias `@/*` for all internal imports.

---

## 3. 3D Assets & Dynamic Content Strategy (Summary)

**Goal:** the website creates good-quality dynamic and 3D assets on its own, in code, natively in the Next.js project with React Three Fiber and Three.js.

**Key placements:**
- **Hero:** large interconnected-domains scene. Central AGI neural structure linked by glowing orange and cyan lines to hardware elements and distributed network nodes. Subtle pulsing energy, slow orbital or mouse-controlled camera, emissive materials on palette.
- **Research Pillars:** four custom micro-models, one per domain, animating meaningfully on hover or scroll.
- **Publications & Projects:** subtle background particle systems or floating abstract data structures with neon emissive properties.
- **Interactive elements:** card hover states that trigger small 3D micro-interactions or data viz.

**Implementation rules:** R3F with proper lighting and emissive standard materials, bloom for glow, drei helpers (`OrbitControls`, `Stars`, `Html`, `PerformanceMonitor`), procedural low-to-medium poly geometry preferred, `Suspense` and correct canvas sizing, instancing, no allocation in `useFrame`, reusable and documented components and reduced-motion plus mobile fallbacks throughout.

**Non-3D motion:** Framer Motion for all 2D animation, scroll-triggered effects and micro-interactions, consistent with the cyberpunk aesthetic (subtle glows, smooth transitions, purposeful motion).

---

## 4. Full Site Structure & Pages

Pages in priority order:

1. **Home / Landing**
2. **About / Our Story**: founding principles, vision for cross-domain correlations, long-term roadmap.
3. **Research**: detailed pillars, how research happens standalone and correlated, methodology notes, open questions.
4. **Publications**: filterable and searchable list (domain, type, date) plus individual entry pages with abstracts, authors, tags and discussion links. DB-backed.
5. **Insights / Blog / Explainers**: strong categorization (Tooling & Use Cases, Frontier Analysis, Cross-Domain Thinking, Community Spotlights), search, tags, excellent readability, Substack syndication. DB-backed.
6. **Projects / Initiatives**: status indicators, leads, goals, outputs, contribution CTAs, repo links. Public and contributor-only visibility. DB-backed.
7. **Community**: clear guidelines, contribution process, link to the **public Telegram channel**, explanation of how private channel access works (apply → accept → access token), member spotlights, events, code of conduct.
8. **Resources**: curated and explained tooling landscape, reading lists, per-domain benchmarks. DB-backed so it updates regularly.
9. **Join / Contribute**: entry point into the application flow plus the channels.
10. **Apply** (`/contribute/apply`): the public contributor application form behind the access wall.
11. **Contact**: form or integrated into Join.

**Private:**
- **Admin** (`/admin`): admin-only CMS for all content, applications, members and media. Not linked from public navigation.
- **Contributor areas**: private Telegram channels (token-gated) plus contributor-only platform content (for example private projects), gated by role or token respectively.

### Home Page Structure (Detailed)

- **Header**: logo, navigation, social icons (Telegram, X, Reddit, Substack, LinkedIn) and future search.
- **Hero**: bold headline ("GIKSN Research"), tagline ("Pioneering AGI, Deeptech, Hardware & Distributed Systems, standalone and at their intersections"), sub-headline on the community-first open-research stance, the 3D scene and dual CTAs ("Join the Community" and "Explore Research" or "Read Latest Insights").
- **Mission / Vision**: the vision (frontier research plus clear explanation of existing tooling and use cases), the four domains and why correlations matter, the community-first bootstrap approach and the long-term ambition. Values: Openness, Rigor, Collaboration, Curiosity.
- **Research Pillars**: four domains as 3D animated cards. Each: title, one or two sentence description, current focus or why it matters, link to deeper content. Cross-domain work called out explicitly.
- **Current Work & Explainers**: momentum even at early stage. Featured initiatives, explainer-series highlights, open research questions, founding notes repurposed from existing Substack and X threads.
- **Latest Publications & Insights**: three or four featured items with title, excerpt, domain tags, date and read link, plus links to the full lists.
- **Community & Impact**: "built by researchers and builders, for the frontier," early stats that grow over time, one or two voices spotlighted, a note on the collaborative approach and a clear path into the application flow.
- **Get Involved**: multiple paths: join the **public Telegram channel**, follow on X/Reddit/Substack/LinkedIn, subscribe for insights, apply to contribute (propose a project, co-author an explainer, join a working group in private Telegram after acceptance), with a transparent note that contribution is vetted and execution-focused.
- **Footer**: quick links, socials, copyright, "Independent. Open. Ambitious."

---

## 5. Content & Community Principles

- Balance frontier research with practical explanations of existing tools.
- Seed early content by repurposing existing Substack and X threads, posted through the admin panel.
- Stay transparent about the community-powered bootstrap stage and about contribution being gated to people who can do the work.
- Drive a strong flywheel between the website and the social channels: discussion links back to X and Reddit, newsletter signup everywhere, embedded or linked latest discussions.
- Each page stands alone as valuable, high-signal content. Substance over spectacle.
- A simple responsible-research and open-research ethos statement builds trust.

---

## 6. Branding & Visual Language

- **Logo:** abstract mark for interconnected systems (neural plus hardware plus networks) in the palette.
- **Visual language:** abstract interconnected systems, neural patterns with hardware elements, distributed graphs, neon orange and cyan glows on 3D elements.
- **Motion language:** purposeful, restrained, supportive of content, never distracting.
- **Consistency** across the website and all social channels is mandatory. Establish the guidelines (logo, voice, visuals) now and apply everywhere. The site is home base, the channels drive discovery.

---

## 7. Phased Build Approach

**Phase 1 (MVP): publish without redeploys, collect applicants**
- Core design system: tokens, fonts, shadcn theme, Framer Motion variants, layout shell.
- Home page with the 3D hero and animated pillars (hero scene, four pillar micro-models, bloom, reduced-motion and mobile fallbacks).
- Database and ORM live (Neon + Drizzle, migrations in CI).
- Admin auth and single-admin RBAC (Better Auth, allowlist).
- Admin CMS for publications, insights, projects and resources, with the MDX editor and live preview, plus media upload.
- Public content pages rendering DB-backed MDX with ISR and on-demand revalidation.
- Research overview.
- Public application form capturing submissions, stored and reviewable in admin. (Approval and contributor accounts can follow in Phase 2.)
- Email for application confirmation and admin notification.

**Phase 2: open the gated door, full discovery**
- Application review workflow: accept, reject, waitlist, with invitations and contributor account provisioning.
- Contributor role, profiles, Telegram access token issuance and revocation, contributor-only platform content (private projects). Working groups live in private Telegram channels.
- Full filterable and searchable Publications and Insights via Postgres full-text search.
- Projects page with status indicators, visibility gating and contribute CTAs.
- Community page (public Telegram link, private-access explainer, guidelines).
- RSS, JSON-LD and dynamic OG images from the DB.
- Advanced 3D interactions (card micro-interactions, background particle systems).
- Rate limiting, Turnstile and audit log across public and admin surfaces.

**Phase 3: depth, collaboration, tooling**
- Resources expansion and per-domain benchmarks.
- Contributor collaboration spaces, working-group tooling, project assignment.
- Hosting for research tools, demos and protocol-related services as additional Route Handlers or separate services, with the platform as the hub.
- Deeper 3D experiences.
- Performance optimization passes and analytics.
- Future-proofing: contributor tiers, bounties for open problems, a research API once funded.

---

## 8. Important Decisions & Constraints

- The backend is full-stack Next.js: Server Actions for mutations, Route Handlers for APIs and webhooks. No separate backend service in v1. The architecture stays modular so research tools and protocol services can be added later as additional handlers or services.
- Data lives in Neon Postgres, accessed through Drizzle. Supabase is the all-in-one fallback.
- Auth and access control are owned, not outsourced: Better Auth, Postgres-backed, with a minimal admin and contributor role model. Managed providers are a fallback only.
- Content moved from build-time MDX (Velite) to DB-backed MDX rendered with `next-mdx-remote/rsc`, with ISR and on-demand revalidation. This supersedes the Velite decision and is what enables runtime publishing from the admin panel with no redeploy.
- A private admin panel at `/admin` is the single source of runtime publishing, admin-only, enforced in middleware, layout and at the data layer.
- Contribution is gated. Anyone can apply, only vetted contributors get a role. The path to a privileged role is admin acceptance plus invitation redemption. There is no open self-signup.
- Authorization is enforced at the data layer on every mutation and read. Middleware is convenience, not the security boundary.
- Public surfaces are rate-limited and bot-protected, all inputs Zod-validated, privileged actions audited.
- Search moved to Postgres full-text search. This supersedes Fuse.js.
- The project must create its own high-quality 3D and dynamic assets in code. No dependence on external asset tools for production. Spline is prototyping only.
- Neon glow is achieved with emissive materials plus bloom post-processing, not emissive alone.
- Primary style is Refined Cyberpunk / Neon Futurism on the defined palette. Off-white and orange lead, cyan is the secondary accent, purple is subtle depth.
- Fallback style if the primary does not land: Stark Monochrome Futurism.
- Dark-only for v1, no theme toggle.
- Fonts load through `next/font/google` (Inter, JetBrains Mono), no browser-download steps. Satoshi is a later self-hosted upgrade path.
- Performance, accessibility and mobile experience are non-negotiable, including `prefers-reduced-motion` and mobile 3D fallbacks.
- Content quality and research credibility take priority over pure visual spectacle.

---

## 9. References

**Design & Style**
- Refined cyberpunk examples (Dribbble)
- xAI: https://x.ai/
- Anthropic Research: https://www.anthropic.com/research
- OpenAI Research: https://openai.com/research
- Google DeepMind: https://deepmind.google/
- Twelve Labs: https://www.twelvelabs.io/
- Clarity AI research template: https://shikun.io/projects/clarity (GitHub: https://github.com/lorenmt/clarity-template)

**3D & Technical**
- React Three Fiber docs and examples
- @react-three/drei and @react-three/postprocessing docs
- High-quality Three.js research and tech demos
- shadcn/ui + Framer Motion best practices

**Backend & Data**
- Next.js App Router: Server Actions, Route Handlers, caching and revalidation
- Drizzle ORM and drizzle-kit docs
- Neon serverless Postgres docs
- Better Auth docs (sessions, OAuth, roles, Drizzle adapter)
- next-mdx-remote (RSC) docs
- Resend and React Email docs
- Upstash Ratelimit docs