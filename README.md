# GIKSN Research

A community-first research lab working at the frontier of **Artificial Intelligence**, **Deeptech**, **Hardware**, and **Distributed Systems**. This repo is the lab's front door: an editorial archive of papers, surveys, and lab updates, argued in the open, with a threaded discussion under every entry.

The site is the record. Telegram is the room.

## The two corners

The archive has one table and two front-of-house sections:

- **Papers** — original research and surveys across the four sectors below. Each paper has an abstract, a body, a status, and a discussion thread.
- **Updates** — lab announcements. Cohort openings, releases, program dates, collaborations. Factual, sourced from the org doing the announcing.

Both are the same underlying content type (a "paper" in the DB), distinguished by category. `UP` is the update category; the rest are research sectors.

## Sectors

| Code | Full name              | Scope                                                                            |
| ---- | ---------------------- | -------------------------------------------------------------------------------- |
| `AI` | Artificial Intelligence | Foundational and applied work on models, agents, evaluation, alignment, AGI.     |
| `DT` | Deeptech               | Bio, materials, energy, quantum, robotics. Research at the physical frontier.    |
| `HW` | Hardware               | Silicon, accelerators, embedded systems, sensors. The compute substrate.         |
| `DS` | Distributed Systems    | Consensus, storage, coordination, protocols. Plumbing that scales.               |
| `UP` | Updates                | Announcements from the lab and the wider frontier.                               |

## Lifecycle statuses

Status describes where the research is, not the editorial state of the document.

| Status        | Meaning                                            |
| ------------- | -------------------------------------------------- |
| `Exploration` | Sketching. Open questions, no strong claims yet.   |
| `Draft`       | Being written. The argument has a shape.           |
| `Preprint`    | Public and open for critique.                      |
| `Published`   | Final version. The lab stands by it.               |
| `Landmark`    | Foundational. Cited widely, referenced by later work. |

Kinds: `Original` (new research) or `Survey` (synthesis of existing work).

## Stack

- **Next.js 16.2.4** (App Router, Turbopack, React 19)
- **TypeScript** strict mode
- **Tailwind v4** with `@theme inline` design tokens
- **next/font** — Space Grotesk (display) + Ubuntu (body)
- **Postgres** via **Drizzle ORM** + `postgres` driver (Neon-friendly)
- HMAC-signed session cookie for admin auth (scrypt password hashes)

The whole app is one Next.js deploy. No separate backend service.

## Design tokens

Defined in `src/app/globals.css` and consumed via Tailwind `@theme inline`:

| Token                       | Value                    | Use                        |
| --------------------------- | ------------------------ | -------------------------- |
| `--paper`                   | `#ffffff`                | Background                 |
| `--ink`                     | `#281e32`                | Body text                  |
| `--accent`                  | `#35a29f`                | Headlines, accents         |
| `--ink-soft` / `--ink-faint` | `#5b5263` / `#8b8390`   | Secondary text, metadata   |
| `--rule`                    | `rgba(40,30,50,0.12)`    | Hairline borders           |
| `--tint`                    | `#faf7f2`                | Hover backgrounds          |

## Routes

```
/                       masthead, featured, sectors, latest activity, hero search
/[sector]               listing for one sector (/ai, /dt, /hw, /ds)
/[sector]/[slug]        paper detail with metadata, discussion, reply form
/updates                the wire — lab and partner announcements
/archive                every paper, filterable
/about                  the lab, its principles, how statuses move
/submit                 paper + update submission form
/admin                  private CMS (email + password login)
/api/papers/...         REST endpoints backing the client
```

`[sector]` accepts the lowercase code (`ai`, `dt`, `hw`, `ds`, `up`). 404 otherwise.

## Project layout

```
src/
├── app/
│   ├── layout.tsx              root layout, fonts, metadata
│   ├── globals.css             design tokens + typographic base
│   ├── page.tsx                homepage
│   ├── about/page.tsx
│   ├── archive/page.tsx
│   ├── updates/page.tsx
│   ├── submit/{page,SubmitForm}.tsx
│   ├── admin/{page,AdminPanel}.tsx
│   ├── [category]/page.tsx
│   ├── [category]/[slug]/page.tsx
│   └── api/
│       ├── admin/
│       └── papers/
├── components/
│   ├── Masthead.tsx            top nameplate
│   ├── CategoryNav.tsx         sticky sector nav (Papers / Updates)
│   ├── PaperRow.tsx            paper list row
│   ├── UpdateRow.tsx           update list row
│   ├── FilteredPapersList.tsx  search + filter for papers
│   ├── FilteredUpdatesList.tsx search + filter for updates
│   ├── HeroSearchBar.tsx       prominent home-page search + filter
│   ├── StatusPill.tsx          lifecycle badge
│   ├── KindBadge.tsx           Original / Survey
│   ├── CommentThread.tsx       threaded discussion (1 level)
│   ├── CapitalCard.tsx         (legacy filename) Community/Telegram card
│   └── Footer.tsx              colophon + sector links
├── db/
│   ├── schema.ts               Drizzle table + enum definitions
│   ├── queries.ts              typed query functions
│   └── index.ts                Drizzle client
└── lib/
    ├── papers.ts               types, category/status/kind data, helpers
    ├── validators.ts           Zod schemas for API + form input
    ├── session.ts              HMAC-signed session cookie
    ├── api.ts                  Route handler helpers (json, error, requireAdmin)
    ├── contact.ts              social-handle parsing / URL building
    ├── parseBody.ts            plain-text → PaperSection[] parser
    ├── inlineMarkdown.tsx      inline **bold** / *italic* / [links]
    └── password.ts             scrypt hashing
```

## Local development

```bash
bun install                    # or npm/pnpm
bun dev                        # http://localhost:3000
```

Other scripts:

```bash
bun run build                  # production build
bun run start                  # serve the production build
bun run lint                   # eslint
bun run db:generate            # regenerate drizzle migrations from schema
bun run db:migrate             # apply pending migrations
bun run db:push                # push schema straight to DB (dev only)
bun run db:studio              # inspect the DB
bun run db:seed                # load a sample paper
bun run admin -- create <email> <password>   # create an admin
```

## Environment variables

Copy `.env.example` to `.env` and fill in:

```
DATABASE_URL=                   # Postgres connection string (Neon-style URL is fine)
DATABASE_SSL=                   # "1" to force sslmode=require, blank otherwise
SESSION_SECRET=                 # openssl rand -base64 32
NEXT_PUBLIC_GA_MEASUREMENT_ID=  # optional; enables Google Analytics behind the on-site consent banner
```

## Submitting content

The submit form (`/submit`) is the primary entry point. It handles both types:

- **Papers** — pick a sector, pick `Original` or `Survey`, write an abstract and a body, add a contact handle.
- **Updates** — the same form with `?kind=update`. Instead of a sector picker, you name the source organization; the sector locks to `UP`.

Every submission lands as `Exploration`. Editors move it through `Draft` → `Preprint` → `Published` from the admin panel.

## Editorial conventions

- Titles use specific verbs and specific nouns. No slogans.
- Abstracts state the question and the approach. They do not sell.
- Rejected directions stay in the archive. The reasoning matters more than the verdict.
- Editors copy-edit for clarity. They do not rewrite voice.
- Discussion is threaded one level deep on purpose.
- No em dashes, no Oxford commas, sparing semicolons.

## Community

GIKSN is community-first. The public Telegram channel is open to anyone; the private channels are gated behind a contributor application. See `GIKSN_CONTEXT.md` for the full platform vision, including the Phase 2 Telegram-bot architecture, contributor application flow, and the eventual admin CMS rebuild.

Independent. Open. Ambitious.
