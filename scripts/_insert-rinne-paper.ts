/**
 * Insert the Rinne paper into the papers table.
 * Idempotent: if a paper with the same (category, slug) already exists, it is
 * updated in place; otherwise it is inserted with the next number for the sector.
 *
 * Run with:  bun run scripts/_insert-rinne-paper.ts
 */

import "dotenv/config";
import { and, eq, max } from "drizzle-orm";

import { db } from "@/db";
import { papers } from "@/db/schema";
import type { PaperSection } from "@/lib/papers";

const CATEGORY = "AI" as const;
const KIND = "Original" as const;
const STATUS = "Research" as const;
const SLUG = "rinne-local-terminal-first-ai-orchestration";

const TITLE =
  "Rinne: composing local AI coding agents into a verified generator–evaluator loop";

const ABSTRACT =
  "Rinne is the first product shipped under GIKSN Research. It is a terminal-first orchestration harness that plans work into a JSON DAG, distributes that work across the AI coding tools and model APIs a user already has installed, and drives the DAG to completion through a generator–evaluator loop with critique. This paper argues the design: a decoupled conductor for cheap planning, a durable loop for long-running work, and a filesystem blackboard as the shared substrate that lets heterogeneous workers collaborate without a bespoke protocol.";

const BODY: PaperSection[] = [
  {
    paragraphs: [
      "Most engineers with a coding-agent subscription end up locked to one vendor and one model. The frontier moves week-to-week, but the harness you sit inside does not. Rinne is an attempt to invert that: keep the harness stable, keep the workers swappable, and route each subtask to the tool that is best suited to it, whether that tool is a subscription-backed CLI like `claude-code` or a raw OpenAI-compatible API call.",
      "This is the first product GIKSN Research has shipped. It is v0.1, actively built, single-machine, single-user. There is no hosted component, no telemetry, and no account. The rest of this paper argues the choices behind that shape.",
    ],
  },
  {
    heading: "Problem",
    paragraphs: [
      "A user with one or more coding-agent subscriptions, or with raw API keys, or with both, cannot easily compose those assets into a single workflow. Each harness has its own login, its own context model, and its own idea of what a task looks like. Multi-model orchestration exists commercially, but it charges again on top of what the user has already paid for, and it introduces a hosted middleman.",
      "Behind that surface complaint sits a research question: what is the minimum interface a heterogeneous pool of AI coding tools needs to share so that a planner can compose them into an ad-hoc team for a single task and verify the result? Rinne argues the answer is small.",
    ],
  },
  {
    heading: "Approach",
    paragraphs: [
      "Rinne unifies two ideas from the last two years of AI-agent research. The first is the conductor: a small, cheap model that composes a team of larger workers for a given task instead of one monolithic worker doing everything. The second is the loop: durable state on disk, generator into evaluator, critique fed back until the goal is met or a budget runs out.",
      "The synthesis is a three-layer harness. A conductor plans a JSON DAG from the goal, a digest of the blackboard, and the live worker registry. A loop engine schedules that DAG across workers, gates each node with an evaluator, and re-plans on failure. A blackboard on the filesystem holds the plan, the progress, and the working outputs, and it is the only channel workers need to share.",
    ],
    pullquote:
      "The conductor composes a per-task team, the loop drives verification, and the filesystem is the substrate that lets heterogeneous workers collaborate.",
  },
  {
    heading: "The worker contract",
    paragraphs: [
      "Rinne defines one worker interface and two families that implement it. A harness worker wraps a native headless call to an existing coding-agent CLI (`claude -p`, `codex exec`, `opencode`, `grok`, `cursor-agent`, `aider`, `antigravity`). It is autonomous: give it a chunky self-contained subtask and it does its own reading and editing. An API worker is a direct OpenAI-compatible model call on the user's own key. It is raw: give it a precise instruction and inlined context and it returns one focused result.",
      "The critical constraint is that context assembly differs by family. For a harness worker, mentioned files are pinned as paths and the worker reads them itself, preserving the harness's own retrieval logic. For an API worker, file contents are inlined into the prompt because the model only ever sees what is sent. Rinne makes this seam explicit so authors of new adapters know which mode they are writing.",
    ],
  },
  {
    heading: "Why the conductor is decoupled",
    paragraphs: [
      "Planning is small and frequent. The subtask worker is heavy and expensive. If the same model is asked to plan and to build, planning burns quota meant for the actual work and can rate-limit itself out of the run. Rinne runs the conductor on a separate cheap or free backend by default (Cloudflare Workers AI, Groq, NVIDIA NIM, or a local Ollama), and only falls back to a harness planner if no conductor key is configured.",
      "The fallback chains across every installed harness in order rather than dying on the first non-zero exit, so a rate limit or auth glitch on the top harness does not kill the run. When the fallback triggers, Rinne surfaces the failing worker's actual output rather than a bare exit code, on the theory that a debug session is easier when the harness's own error is legible.",
    ],
  },
  {
    heading: "Why the loop is durable",
    paragraphs: [
      "Long-running agent runs die in practice from things unrelated to model quality: a laptop lid, a rate limit, a stuck subprocess. Rinne keeps state on disk under `.rinne/` in the working directory. The plan, the progress, the working outputs, and the logs all live there. `rinne status` and `rinne resume` are cheap because they read the same files the engine writes.",
      "The engine treats generator–evaluator as a pair of nodes with a loop-back edge rather than a distinguished structure. A node's on-fail policy is one of `loop_back(node[, critique])`, `loop_with(node)`, `fixer`, or `replan`. A stuck loop, defined as identical failures crossing a configurable threshold, escalates to the user rather than burning budget silently.",
    ],
  },
  {
    heading: "Design decisions and their trade-offs",
    list: [
      "**Local only, no hosted component.** The trade is that horizontal scaling requires re-thinking; the win is that the user's keys and repo never leave their machine.",
      "**Subscription-first economics.** A user with Claude Pro and ChatGPT gets orchestration value without paying again; the trade is that the harness cannot bill for the orchestration, which changes the incentives around what ships.",
      "**Filesystem blackboard, not a database.** The trade is that intra-run parallelism has to sequence writes carefully; the win is that any tool that can read a repo can be a worker without a bespoke protocol.",
      "**Prompted routing, not learned.** The trade is that routing decisions are a per-token cost; the win is that they are legible and steerable now, and can be replaced by a learned router later using the trajectories Rinne already logs.",
      "**Terminal-first, no GUI.** The trade is discoverability; the win is that Rinne composes with every other CLI and every other harness on the machine.",
    ],
  },
  {
    heading: "Prior work",
    list: [
      "Existing agent frameworks compose LLM calls, but few compose *coding-agent CLIs* as first-class workers alongside raw APIs. Rinne's contribution is treating both families under one contract.",
      "The conductor–orchestra shape is not new; the specific claim is that pushing the conductor onto a cheap decoupled model, rather than the strongest worker, is the correct default for long-running coding tasks.",
      "Blackboard architectures date back to Hearsay-II. Rinne is a modern instantiation over a git-native filesystem, with the plan itself as a first-class artifact rather than an ephemeral message queue.",
      "Generator–evaluator loops with critique are well-explored in the literature. Rinne's specific position is that the evaluator should be *independent* of the generator (different family, different vendor where the pool permits) so a model is not just grading itself.",
    ],
  },
  {
    heading: "Open questions",
    paragraphs: [
      "Three questions the paper does not yet answer, and that the lab expects to answer as v0.1 gets used in anger.",
    ],
    list: [
      "How much of the routing decision should stay prompted, and how much should move to a learned router trained on logged trajectories. The instrumentation for the second version exists in v0.1; the training run does not.",
      "Whether git-worktree parallelism is worth the isolation cost for concurrent file edits. Today the engine sequences writes to the same repo; a per-branch worktree would remove that sequencing at the cost of more disk and more merge surface.",
      "Where the evaluator's independence should come from. Different family is a good default; different training corpus is stronger but harder to certify. The lab is watching how much this matters on real tasks.",
    ],
  },
  {
    heading: "Availability",
    paragraphs: [
      "Rinne is open source under MIT OR Apache-2.0. Source, install script, and prebuilt binaries for macOS, Linux, and Windows are at [github.com/GIKSN-RESEARCH/Rinne](https://github.com/GIKSN-RESEARCH/Rinne). Install with:",
      "`curl -fsSL https://raw.githubusercontent.com/GIKSN-RESEARCH/Rinne/main/install.sh | sh`",
      "Comments and disagreements are welcome under this paper. Bug reports and pull requests belong on the GitHub repo. This paper stays under Research as the design settles.",
    ],
  },
];

async function main() {
  const [existing] = await db
    .select({
      id: papers.id,
      number: papers.number,
    })
    .from(papers)
    .where(and(eq(papers.category, CATEGORY), eq(papers.slug, SLUG)))
    .limit(1);

  const now = new Date();
  const posted = new Date("2026-07-02T12:00:00Z");

  if (existing) {
    await db
      .update(papers)
      .set({
        kind: KIND,
        title: TITLE,
        abstract: ABSTRACT,
        status: STATUS,
        author: "GIKSN Research",
        authorHandle: "https://github.com/GIKSN-RESEARCH",
        readingMinutes: 9,
        body: BODY,
        hidden: false,
        source: null,
        updated: now,
      })
      .where(eq(papers.id, existing.id));
    console.log(
      `Updated existing paper ${CATEGORY}-${String(existing.number).padStart(3, "0")}`
    );
    process.exit(0);
  }

  const [maxRow] = await db
    .select({ max: max(papers.number) })
    .from(papers)
    .where(eq(papers.category, CATEGORY));
  const nextNumber = (maxRow?.max ?? 0) + 1;

  const [row] = await db
    .insert(papers)
    .values({
      number: nextNumber,
      category: CATEGORY,
      kind: KIND,
      slug: SLUG,
      title: TITLE,
      abstract: ABSTRACT,
      status: STATUS,
      author: "GIKSN Research",
      authorHandle: "https://github.com/GIKSN-RESEARCH",
      posted,
      updated: now,
      readingMinutes: 9,
      body: BODY,
      hidden: false,
      source: null,
    })
    .returning({
      id: papers.id,
      number: papers.number,
      category: papers.category,
      slug: papers.slug,
    });

  console.log(
    `Inserted ${row.category}-${String(row.number).padStart(3, "0")}: ${row.slug}`
  );
  process.exit(0);
}

main().catch((e) => {
  console.error("Insert failed:", e);
  process.exit(1);
});
