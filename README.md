# GIKSN Research

An independent lab rebuilding the AI stack in Rust, from GPU kernels to agents, in public.

Every layer ships as open source with a paper explaining how it works and where it falls short. Go implementations follow Rust.

## Current focus

Two halves of the stack run in parallel today.

- **Inference engine.** A Qwen3 forward pass on the CPU, then CUDA kernels, a paged KV cache, continuous batching, quantization, speculative decoding and an OpenAI-compatible server.
- **Agent framework.** Typed messages and tools, chains, a stateful graph runtime with checkpoints and interrupts and an agent server. A Go implementation follows.

Each piece is tested against a reference implementation before it counts as done. The write-ups become the record.

## The four sectors

| Code | Sector                  | How the lab treats it                                                          |
| ---- | ----------------------- | ------------------------------------------------------------------------------ |
| `AI` | Artificial Intelligence | Agent frameworks, models and evals. |
| `DT` | Deeptech                | The longer-horizon survey track. |
| `HW` | Hardware                | GPU kernels, quantization and memory bandwidth. |
| `DS` | Distributed Systems     | Serving: batching, paged KV cache, tensor parallelism and routing. |

## Categories

Category marks what kind of work a post is (stored in the `status` column).

| Category   | Meaning                                            |
| ---------- | -------------------------------------------------- |
| `Research` | Papers and technical work.                         |
| `Writings` | Essays, notes and commentary.                      |
| `Products` | Shipped tools and releases.                        |
| `Programs` | Cohorts, fellowships and community work.           |

Kinds: `Original` (new research), `Survey` (synthesis of an existing subfield) or
`implementation` (a write-up of building something yourself, with code).

## What you can do

- **Read** every paper without an account.
- **Comment** on any paper's discussion thread.
- **Submit** your own paper or a lab update through the public submission form. Everything lands as `Research` and an editor sets the category.
- **Follow** the products page for what the lab has actually shipped.

## What has shipped

The first product is [**Rinne**](https://github.com/GIKSN-RESEARCH/Rinne). A local, open-source, terminal-first AI orchestration harness that composes the coding-agent CLIs and model APIs you already have into a verifying generator-evaluator loop. Zero telemetry, zero hosted component, MIT/Apache-2.0.

The paper that argues for its design lives under `AI` in the archive.

## The community, second

The lab does its own research first. The community is where GIKSN meets other researchers and builders working in the same four sectors: reading each other, arguing threads, occasionally collaborating on a specific problem.

- Public Telegram channel: [join](https://t.me/+xBmnL8ng85cyMDY1)
- Contribution to active lab projects is gated. Apply through the About page.

## Principles

1. **Research first.** The lab picks open problems and works them. Papers ship alongside the tools.
2. **Built in public.** Reasoning gets published with the result. Rejected directions stay in the archive.
3. **Open community.** Readers welcome. Contributors vetted because the work is real, not because the door is closed.

## Get in touch

For questions, feedback or takedown requests: `research@giksn.com`.

Independent. Open. Ambitious.

## Deploying to Vercel

Set `DATABASE_URL` in Vercel for each environment you deploy. Use the intended
database and branch; a new database starts with an empty paper archive.

The build command in `vercel.json` runs `npm run db:migrate` before
`npm run build`. The homepage reads Postgres during prerendering, so its tables
must exist before Next.js builds the site. All SQL migrations referenced by
`drizzle/meta/_journal.json` must be committed. Drizzle records applied migrations
and only runs pending ones on subsequent builds.

For a manual migration, set `DATABASE_URL` in your shell or `.env.local`, then run:

```sh
npm run db:migrate
```

To check the full migration chain and verify that rerunning it preserves content,
point `TEST_DATABASE_URL` at an empty, disposable PostgreSQL database and run:

```sh
npm run test:db
```

The test refuses to run against a database that already has application tables.

The Rust stack content seed is separate from schema migrations and deployment.
It adds the two Rust products and the open build program without changing
existing entries. Preview it with:

```sh
bunx tsx scripts/_seed-rust-stack.ts
```

To apply it to an explicitly selected database, first apply schema migrations,
then set `DATABASE_URL` in your shell and pass `--apply`. The seed does not load
`.env.local`. The launch post remains a draft in the PR description.
