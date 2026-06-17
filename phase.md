# GIKSN Research — Phased Build Plan

> Actionable delivery plan derived from [CONTEXT.md](./CONTEXT.md). Three phases total. Each phase ships a usable increment; later phases build on earlier foundations without rework.

---

## Overview

| Phase | Name | Goal | Ships when… |
|-------|------|------|-------------|
| **1** | MVP — Publish & Apply | Publish content without redeploys; collect contributor applications | Admin can post from `/admin`, public site reads from DB, applicants can submit |
| **2** | Gated Community & Discovery | Open the contributor door; Telegram private-channel access; full discovery and hardening | Vetted contributors get accounts + Telegram access tokens; search, RSS, and security controls are live |
| **3** | Depth, Collaboration & Tooling | Collaboration surfaces, expanded resources, research-tool hosting | Platform is the hub for ongoing lab work, not just a brochure |

**Stack throughout:** Next.js (App Router) + TypeScript + Tailwind v4 + shadcn/ui. Backend lives in the same app (Server Actions, Route Handlers). Neon Postgres + Drizzle + Better Auth.

---

## Phase 1 — MVP: Publish Without Redeploys, Collect Applicants

**Outcome:** A credible public-facing site with the GIKSN design system, a 3D home experience, DB-backed content that updates on publish (no redeploy), a private admin CMS, and a public contributor application form.

### 1.1 Design System & Layout Shell

- [x] Map GIKSN palette into `globals.css` (charcoal, off-white, orange, cyan, purple) as CSS custom properties and shadcn tokens
- [x] Dark-only base theme (no toggle)
- [x] Load **Inter** and **JetBrains Mono** via `next/font/google`
- [x] Install and wire **Framer Motion**; centralize variants in `lib/motion.ts`
- [x] Layout components: `Header`, `Footer`, `Nav`, `MobileNav`, `SocialLinks` (include Telegram public channel link)
- [x] Skip-to-content link, semantic landmarks, keyboard-navigable chrome
- [x] Reusable section primitives (container, section heading, grid, card shell)
- [x] Add core shadcn components as needed (button, input, badge, card, sheet, separator, sonner) — dialog, dropdown-menu, skeleton, textarea, select deferred until admin/forms

### 1.2 Home Page (Public, Static + 3D)

- [x] **Hero** — headline, tagline, sub-headline, dual CTAs ("Join the Community", "Explore Research")
- [ ] **3D hero scene** (`HeroScene`) — interconnected domains, emissive materials + bloom, mouse parallax, `frameloop="always"`
- [ ] `CanvasRoot` wrapper with `next/dynamic` + `ssr: false` and same-size static fallback
- [x] **Mission / Vision** section — four domains, correlations, bootstrap stance, values
- [x] **Research Pillars** — four cards (static placeholders; 3D micro-models next)
- [x] **Current Work & Explainers** — featured initiatives, open questions (seed content)
- [x] **Latest Publications & Insights** — seed placeholders (DB wiring in 1.6)
- [x] **Community & Impact** — bootstrap transparency, path to apply
- [x] **Get Involved** — public Telegram channel link, other social channels, newsletter CTA, apply CTA with vetted-contributor note
- [x] Reduced-motion for 2D motion (`useReducedMotion` in reveal components); 3D fallbacks pending with R3F

### 1.3 Database & ORM

- [ ] Neon project + pooled/direct connection URLs
- [ ] Drizzle schema: `profiles`, `publications`, `insights`, `projects`, `resources`, `applications`, `invitations`, `media`, `audit_log`, misc (`newsletter_subscribers`, `contact_messages`)
- [ ] Better Auth tables via Drizzle adapter (`user`, `session`, `account`, `verification` + `role`, `status` additional fields)
- [ ] `drizzle.config.ts`, `db/index.ts`, `db/migrate.ts`
- [ ] Migrations in CI before deploy (`drizzle-kit generate` + `drizzle-kit migrate`)

### 1.4 Authentication & Admin Access

- [ ] Better Auth: GitHub OAuth + email magic link
- [ ] `ADMIN_EMAILS` allowlist → `admin` role on sign-in
- [ ] `lib/auth.ts`, `lib/auth-guard.ts` (`getSession`, `requireAdmin`, `requireContributor` stub for Phase 2)
- [ ] `middleware.ts` — block `/admin/*` for non-admins
- [ ] `/admin` layout — server-side `requireAdmin()` guard
- [ ] `app/api/auth/[...all]/route.ts`

### 1.5 Admin CMS

- [ ] Admin shell: sidebar nav, dashboard
- [ ] **Dashboard** — content counts, recent activity, pending application count
- [ ] **Publications** — list / new / edit; draft, publish, unpublish, archive, feature; slug auto-gen + uniqueness
- [ ] **Insights** — same CRUD pattern
- [ ] **Projects** — same CRUD pattern (public visibility only in Phase 1)
- [ ] **Resources** — same CRUD pattern
- [ ] **MDX editor** — CodeMirror 6 source editor + live preview via same `next-mdx-remote` pipeline as production
- [ ] **Media library** — upload to Vercel Blob (`app/api/upload/route.ts`), browse, insert into content
- [ ] **Applications** — read-only review queue (view submissions; accept/reject deferred to Phase 2)
- [ ] Server Actions in `actions/content.ts` — Zod validation, `requireAdmin()`, `revalidateTag` + `revalidatePath` on publish
- [ ] `@tanstack/react-query` in admin for client mutations/lists

### 1.6 Public Content Pages (DB-backed MDX)

- [ ] `lib/mdx.ts` — `next-mdx-remote/rsc` with `remark-math`, `rehype-katex`, `rehype-pretty-code` + shiki; custom MDX components
- [ ] Import `katex/dist/katex.min.css` in root layout
- [ ] `lib/queries/` — typed read functions; always filter `status = 'published'`
- [ ] ISR + `unstable_cache` with collection tags (`publications`, `insights`, `projects`, `resources`)
- [ ] Routes:
  - [ ] `/publications` — list with domain/type/date filters
  - [ ] `/publications/[slug]` — entry page
  - [ ] `/insights` — list with category/domain filters
  - [ ] `/insights/[slug]` — entry page
  - [ ] `/projects` — list (public projects)
  - [ ] `/projects/[slug]` — entry page
  - [ ] `/resources` — list
- [ ] Content components: `PublicationCard`, `InsightCard`, `ProjectCard`, `DomainBadge`, `Filters`

### 1.7 Static Marketing Pages

- [ ] `/about` — founding principles, cross-domain vision, roadmap
- [ ] `/research` — pillar detail, methodology, how standalone + correlated research works
- [ ] `/join` — entry into apply flow + public Telegram channel + other social channels
- [ ] `/contact` — contact form (basic; full hardening in Phase 2)

### 1.8 Contributor Application (Collect Only)

- [ ] `/contribute/apply` — public form: domains, background, links, optional CV upload, motivation, evidence field
- [ ] `actions/applications.ts` — submit → `applications` row (`pending`)
- [ ] Zod validation on all fields
- [ ] Admin can view submissions in `/admin/applications` (no accept/reject/invite yet)

### 1.9 Email (Transactional)

- [ ] Resend + React Email templates
- [ ] Application received (to applicant)
- [ ] New application notification (to admin)

### 1.10 SEO & Infra Basics

- [x] Root metadata (lab name, description, OG defaults)
- [ ] `app/sitemap.ts`, `app/robots.ts` (static + published slugs from DB)
- [x] `app/not-found.tsx`
- [ ] Env var template documented; Vercel deploy target
- [ ] `@vercel/analytics` + `@vercel/speed-insights` (optional in Phase 1, recommended)

### Phase 1 Exit Criteria

- Brooklyn can sign in as admin, write MDX in the admin panel, publish, and see the public page update within seconds without a redeploy.
- Home page renders with 3D hero and pillar micro-models (with accessible fallbacks).
- A visitor can submit a contributor application; admin sees it in the queue.
- Published publications and insights are readable on the public site with math and syntax highlighting.

---

## Phase 2 — Gated Community & Full Discovery

**Outcome:** The access wall is fully operational (apply → review → invite → contributor account → Telegram private channels). Content is searchable. Remaining public pages ship. Public surfaces are hardened. SEO feeds go live.

### 2.1 Application Review, Contributor Provisioning & Telegram Tokens

- [ ] Admin actions: accept, reject, waitlist + private reviewer notes
- [ ] On accept: mint expiring platform `invitation` token **and** unique `telegramAccessToken` on the `invitations` row
- [ ] Invite email includes platform redemption link + Telegram access token (and instructions for private channels)
- [ ] Invitation redemption flow → Better Auth sign-in → `contributor` role + `profiles` row
- [ ] Post-redemption onboarding screen: show Telegram access token once, link to public channel, steps for joining private channels
- [ ] **Telegram bot token redemption** (chosen — safest): webhook Route Handler validates token server-side, binds to Telegram user ID, adds user to private channels via Bot API
- [ ] Bot hardening: single-use tokens, per-user binding, rate limiting, constant-time compare, no public private-channel invite links
- [ ] `app/api/telegram/webhook/route.ts` + env (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_WEBHOOK_SECRET`, `TELEGRAM_PRIVATE_CHANNEL_IDS`)
- [ ] Store redeemer Telegram user ID for revocation; record `telegramTokenRedeemedAt`; audit-log issuance and redemption
- [ ] Rejection / waitlist optional templated emails
- [ ] Audit log entries for all review actions

### 2.2 Contributor Role, Telegram Access & Platform Gating

- [ ] `requireContributor()` enforced on contributor-only platform routes and queries
- [ ] Contributor-only project visibility (`visibility = 'contributor'`) on the website
- [ ] Contributor profile pages (handle, bio, domains, links)
- [ ] `/admin/members` — list contributors, suspend/restore, role management, **revoke/rotate Telegram access tokens** (bot removes user from private channels on revoke)
- [ ] Env: `TELEGRAM_PUBLIC_CHANNEL_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_WEBHOOK_SECRET`, `TELEGRAM_PRIVATE_CHANNEL_IDS`
- [ ] Private working groups and day-to-day collaboration live in **private Telegram channels**, not on-site chat

### 2.3 Full-Text Search

- [ ] Raw SQL migration: `tsvector` generated columns + GIN indexes on publications, insights, projects
- [ ] `pg_trgm` for fuzzy title matching
- [ ] `lib/search.ts` — `websearch_to_tsquery` + `ts_rank`
- [ ] Search UI on `/publications` and `/insights` (compose with existing filters)
- [ ] Header search entry point (if scoped for this phase)

### 2.4 Remaining Public Pages

- [ ] `/community` — guidelines, contribution process, **public Telegram channel CTA**, how private channel access works (apply → accept → token), member spotlights, events, code of conduct
- [ ] `/projects` — status indicators (Active, Open for Contributors, Completed, Exploratory), contribute CTAs, repo links
- [ ] `/about` and `/research` polish pass with live DB content cross-links

### 2.5 SEO, Metadata & Feeds

- [ ] `generateMetadata` on all dynamic slug pages
- [ ] JSON-LD in `lib/seo.ts` — `ScholarlyArticle`, `Article`, `Organization`
- [ ] `app/api/feed.xml/route.ts` — DB-backed RSS (insights + publications)
- [ ] `app/api/og/route.tsx` — dynamic OG images per publication/insight (palette-themed)

### 2.6 Security Hardening

- [ ] `@upstash/ratelimit` on application, contact, newsletter, auth endpoints (`lib/ratelimit.ts`)
- [ ] Cloudflare Turnstile + honeypot on all public forms
- [ ] Audit log: write on every privileged action; read-only view in `/admin`
- [ ] Confirm Zod + data-layer auth checks on every Server Action and Route Handler

### 2.7 Advanced 3D

- [ ] Background particle systems on Publications and Projects list pages
- [ ] Card hover micro-interactions (small 3D flourishes / data-viz)
- [ ] `PerformanceMonitor`, `AdaptiveDpr`, `AdaptiveEvents` tuning pass

### 2.8 Newsletter & Contact (Complete)

- [ ] Newsletter signup with double opt-in (optional email)
- [ ] Contact form → `contact_messages` table; admin inbox in `/admin`
- [ ] `/admin` settings stub for site config

### Phase 2 Exit Criteria

- Admin can accept an application; applicant redeems invite, lands as a contributor with a profile, and can use their Telegram access token to join private channels.
- Contributor-only platform projects are invisible to the public and readable when signed in.
- Publications and Insights are full-text searchable with filters.
- RSS feed and dynamic OG images work from DB content.
- Public forms are rate-limited and Turnstile-protected.

---

## Phase 3 — Depth, Collaboration & Tooling

**Outcome:** The platform becomes the operational hub for lab work — expanded resources, collaboration tooling, hosted research tools/demos, performance and analytics maturity.

### 3.1 Resources Expansion

- [ ] Rich `/resources` — categorized tooling landscape, reading lists
- [ ] Per-domain benchmarks section
- [ ] Admin workflows for bulk resource updates

### 3.2 Contributor Collaboration (Telegram-First)

- [ ] Working-group channels in private Telegram (domain-specific or project-specific)
- [ ] Project assignment and lead management in admin (platform); coordination in Telegram
- [ ] Optional Telegram bot enhancements (token re-validation, channel onboarding messages, `/lab` commands)
- [ ] Internal research-in-progress surfaced on platform where useful; discussion stays in Telegram

### 3.3 Research Tools & Protocol Hosting

- [ ] Route Handlers or attached services for lab tools, demos, protocol endpoints
- [ ] Platform as discovery hub linking to hosted tools
- [ ] Auth-gated tool access where needed

### 3.4 Deeper 3D Experiences

- [ ] Expanded hero / pillar interactions
- [ ] Optional immersive research-visualization scenes
- [ ] Continued performance discipline (instancing, dispose on unmount, mobile caps)

### 3.5 Performance & Analytics

- [ ] Core Web Vitals optimization pass (LCP priority — 3D hero fallback sizing)
- [ ] Bundle analysis; lazy-load audit for 3D and admin
- [ ] Analytics dashboard review (Vercel Analytics / Plausible / Umami)
- [ ] Scheduled publish via Vercel Cron (`app/api/cron/[job]/route.ts`)

### 3.6 Future-Proofing (As Needed)

- [ ] Contributor tiers / expanded role model (no schema break)
- [ ] Bounties for open research problems
- [ ] Research API (once funded)
- [ ] Cloudflare R2 migration path for Blob storage if cost warrants
- [ ] Dedicated search engine (Typesense / Meilisearch) only if Postgres search slows

### Phase 3 Exit Criteria

- Resources and benchmarks are maintained entirely from admin without code changes.
- Contributors collaborate in private Telegram channels; platform surfaces gated content and tool links.
- At least one research tool or demo is reachable through the platform.
- Performance budgets met on key routes; analytics baseline established.

---

## Cross-Phase Conventions (All Phases)

- **Server Components by default** — `"use client"` only for interactivity, Framer Motion, R3F, admin client islands
- **Mutations** → `actions/` with Zod + auth re-check at top
- **Reads** → `lib/queries/` with visibility and status filters at the query layer
- **3D** → always `dynamic(..., { ssr: false })`, decorative + `aria-hidden`
- **Accessibility** → `prefers-reduced-motion`, contrast checks, labeled forms, focus-visible states
- **No Velite** — all long-form content is DB-backed MDX via `next-mdx-remote/rsc`
- **No open contributor signup** — invitation redemption is the only privileged onboarding path
- **Telegram is the community hub** — public channels are open; private channels require a platform-issued `telegramAccessToken` redeemed via the lab bot (not shareable invite links)

---

## Suggested Build Order Within Phase 1

Phase 1 is the largest slice. Recommended sequence to avoid blocking:

```
1. Design tokens + fonts + layout shell
2. Static home sections (no 3D yet)
3. Database schema + migrations
4. Better Auth + admin shell
5. MDX pipeline + one content type end-to-end (e.g. Insights)
6. Remaining content types + public list/detail pages
7. Admin MDX editor + media upload
8. 3D hero + pillar micro-models
9. Application form + email
10. About, Research, Join, Contact
```

3D can run in parallel with backend work once the layout shell exists; the sequence above keeps something shippable at every step.

---

## What Is Explicitly Out of Scope (Until Later)

| Item | Phase |
|------|-------|
| Contributor account provisioning | Phase 2 |
| Postgres full-text search | Phase 2 |
| Turnstile + rate limiting | Phase 2 |
| RSS / dynamic OG | Phase 2 |
| Community page | Phase 2 |
| Telegram private-channel access tokens | Phase 2 |
| Working-group tooling (Telegram channels) | Phase 3 |
| Research tool hosting | Phase 3 |
| Light mode / theme toggle | Not planned for v1 |
| Velite / build-time MDX | Removed permanently |
| Spline assets in production | Prototyping only |

---

*Keep this file updated as phases complete. [CONTEXT.md](./CONTEXT.md) remains the source of truth for architecture and design decisions.*