/**
 * Insert four sector-side introductions to GIKSN Research (AI, DT, HW, DS).
 * Each is a Published Original paper. Idempotent: if a slug already exists
 * in its sector, we update in place; otherwise we insert with the next
 * category number.
 *
 * Run with:  bun run scripts/_insert-lab-manifesto-posts.ts
 */

import "dotenv/config";
import { and, eq, max } from "drizzle-orm";

import { db } from "@/db";
import { papers } from "@/db/schema";
import type { Category, PaperSection } from "@/lib/papers";

type Post = {
  category: Category;
  slug: string;
  title: string;
  abstract: string;
  body: PaperSection[];
  postedIso: string;
  updatedIso: string;
  readingMinutes: number;
};

const KIND = "Original" as const;
const STATUS = "Published" as const;
const AUTHOR = "GIKSN Research";
const AUTHOR_HANDLE = "https://github.com/GIKSN-RESEARCH";

const POSTS: Post[] = [
  {
    category: "AI",
    slug: "what-ai-work-at-giksn-looks-like",
    title: "What AI work at GIKSN looks like",
    abstract:
      "GIKSN Research is a community-first lab that publishes what it is working on and why. This is the AI-side view of the archive: what frontier work in AI means to us, why the reasoning gets published alongside the result and how the sector fits alongside Deeptech, Hardware and Distributed Systems.",
    postedIso: "2026-07-03T08:00:00Z",
    updatedIso: "2026-07-03T08:00:00Z",
    readingMinutes: 4,
    body: [
      {
        paragraphs: [
          "The frontier of AI shifts weekly. New models ship, new evaluation regimes surface, old assumptions collapse. Researchers writing in the open often get read months later, once the argument has already moved on. GIKSN Research is our response to that. It is a lab where the reasoning behind a result lands in the archive at the same time as the result itself, and where AI is the sector that gets the most cycles.",
        ],
      },
      {
        heading: "What lands here",
        paragraphs: [
          "An AI paper on GIKSN is not a compressed conference submission. It is the argument as we thought through it. The failure modes we considered. The prior work we leaned on and the prior work we did not. Original research goes up in Preprint status the moment it is ready to be argued with. Surveys of subfields sit alongside, because a good map is as valuable to us as a new experiment.",
        ],
      },
      {
        heading: "What we are working on",
        paragraphs: [
          "Our current focus areas cluster around agent orchestration, evaluation under domain shift and open-model interpretability. We do not try to compete with the largest labs on scale. We try to add clarity where the largest labs choose not to write. That includes benchmarks that nobody wants to run, cost-of-ownership numbers on model deployments and workflows for making multi-model setups debuggable rather than magical.",
        ],
      },
      {
        heading: "Reasoning in public",
        paragraphs: [
          "Every paper carries a discussion thread underneath it. Authors are credited, and rejected directions stay in the archive because the reasoning matters more than the verdict. We do not delete papers when we change our mind. We move the status, add a note and keep the trail. This is the record.",
        ],
      },
      {
        heading: "Cross-sector work is the point",
        paragraphs: [
          "AI does not live on its own. A frontier model is a compute substrate question first and a model quality question second. It is a systems question when the model has to serve requests. It is a deeptech question when the underlying advance depends on chemistry or biology or energy. That is why the archive has four sectors that share a discussion floor rather than one AI-only feed with everything else tacked on.",
        ],
      },
      {
        heading: "What we ship",
        paragraphs: [
          "Rinne is our first shipped tool out of the AI bench. It is a local terminal-first orchestrator that composes the coding-agent CLIs and model APIs you already have into a verifying generator to evaluator loop. It runs on your machine, holds no credentials in plaintext and does not phone home. The argument that led to Rinne, and the design decisions we made along the way, live under its companion paper in this sector.",
          "More products are on the bench. They will ship when they are ready.",
        ],
      },
      {
        heading: "Reading and contributing",
        paragraphs: [
          "Anyone can read. Anyone can comment. Contribution is gated because the work is real: applications land through the About page, and accepted contributors get access to the private working channels on Telegram alongside the public read-only channels. If you want to argue with something specific, the discussion thread under any paper is the fastest way in.",
        ],
      },
    ],
  },
  {
    category: "DT",
    slug: "what-deeptech-work-at-giksn-looks-like",
    title: "What Deeptech work at GIKSN looks like",
    abstract:
      "GIKSN Research is a community-first lab writing at the pace research actually moves. This is the Deeptech-side view: why longer timescales fit the archive, how a materials or biology or energy result gets treated here and where the sector overlaps with the rest of the lab.",
    postedIso: "2026-07-03T08:15:00Z",
    updatedIso: "2026-07-03T08:15:00Z",
    readingMinutes: 4,
    body: [
      {
        paragraphs: [
          "Deeptech work does not fit the news cycle. A materials paper that lands today may not have a product implication for five years. A biology result may not be reproducible outside a specific facility for even longer. GIKSN Research is a lab that writes down the intermediate reasoning at the pace it actually happens, so that a decade from now the record still holds up.",
        ],
      },
      {
        heading: "What deeptech work here looks like",
        paragraphs: [
          "The archive treats bio, materials, energy, quantum and robotics as one sector because they share a working style. Each result is anchored to a physical constraint that will not move. The reasoning trails include the assumptions we made about that constraint, the falsification path we would follow and the experiments that would make us wrong. That last part is the honest one and the one that tends to get cut from published work elsewhere.",
        ],
      },
      {
        heading: "Why this pace fits us",
        paragraphs: [
          "We do not publish on a monthly calendar and we do not chase the top-of-search-engine headline. A survey of a subfield often takes a full quarter to write well, and we would rather have one careful map than four excited previews. Deeptech is the sector where this discipline is easiest to see.",
        ],
      },
      {
        heading: "Reasoning stays visible",
        paragraphs: [
          "Every paper carries an argument. Every argument carries the counter-arguments we chose against. When later research proves a direction wrong we do not delete the earlier post. We move its status and leave the reasoning intact. The archive gets more useful over time, not less.",
        ],
      },
      {
        heading: "Cross-sector work",
        paragraphs: [
          "A deeptech result is often bottlenecked by hardware that needs to ship, or by a systems problem that has to be solved before the science is usable. A room-temperature superconductor claim without an economic manufacturing route is a materials result waiting for a hardware paper. A biology screen without a distributed compute story cannot scale. This is why the archive has four sectors sharing one comment floor.",
        ],
      },
      {
        heading: "What we are shipping",
        paragraphs: [
          "Deeptech products from the lab will follow the same rule as the rest: they ship when they are honest. That means an engineered biology tool has an actual assay attached, a materials script has an actual synthesis routine attached and a quantum result has an actual noise profile attached. Nothing goes on the products page as a proof of concept.",
        ],
      },
      {
        heading: "Reading and contributing",
        paragraphs: [
          "Papers are open to everyone. Commentary is welcomed under any thread. Contribution to active deeptech projects is gated behind the About-page application because the work often needs sustained attention. Accepted contributors get the private working channels alongside the public ones.",
        ],
      },
    ],
  },
  {
    category: "HW",
    slug: "what-hardware-work-at-giksn-looks-like",
    title: "What Hardware work at GIKSN looks like",
    abstract:
      "GIKSN Research is a community-first lab that treats hardware as a first-class research corpus, not a footnote to AI. This is the Hardware-side view: what an honest hardware paper looks like, why the compute substrate deserves its own bench and how the sector connects to the other three.",
    postedIso: "2026-07-03T08:30:00Z",
    updatedIso: "2026-07-03T08:30:00Z",
    readingMinutes: 4,
    body: [
      {
        paragraphs: [
          "The hardware conversation online lives in two places. Vendor decks that overstate the numbers, and forum threads that undercount them. Neither is a research corpus. GIKSN Research is our attempt to give hardware a place where the numbers are cited, the trade-offs are named and the assumptions are documented before the argument gets made.",
        ],
      },
      {
        heading: "What hardware work here means",
        paragraphs: [
          "A hardware paper on GIKSN treats specifications as claims and claims as arguments. TOPS is not enough. We want to know at what precision, at what batch size, at what sequence length and with what memory bandwidth utilisation. If a number is estimated we say so. If a design axis loses on a workload it was not built for we say that too. The point is that the paper survives its own numbers a year later.",
        ],
      },
      {
        heading: "What we cover",
        paragraphs: [
          "Silicon architecture, accelerators for transformer inference and training, embedded systems for autonomous applications, sensors and the packaging around them. We also cover the tooling on top of the hardware because the tooling decides whether the hardware ships or gathers dust. A verilog cell library without a synthesis flow argument is not a hardware paper. It is a set of files.",
        ],
      },
      {
        heading: "Why publish in the open",
        paragraphs: [
          "Hardware research suffers when it is only written for one audience. Vendors write papers for buyers. Academics write papers for tenure committees. GIKSN aims to write for the small group of people who will actually build on the paper. That means the failure mode section is the most important section, and the comparison baseline is stated in terms the reader can reproduce.",
        ],
      },
      {
        heading: "The cross-sector view",
        paragraphs: [
          "An AI paper without hardware honesty tends to overstate what the model can do at scale. A distributed systems paper without hardware honesty tends to assume interconnect that does not exist. A deeptech paper without hardware honesty tends to ignore the fabrication pipeline. The archive is designed so that a hardware paper can be linked directly to the AI or DS or DT paper that leans on it, and the discussion happens across the boundary rather than inside a silo.",
        ],
      },
      {
        heading: "What we are shipping",
        paragraphs: [
          "We do not tape out chips in a garage. What we ship from the hardware bench are open reference designs, characterisation tools and honest evaluations of publicly available parts. When the lab has a product ready for the products page it goes up with reproducible numbers, license terms and a link to the paper that argues for it.",
        ],
      },
      {
        heading: "Reading and contributing",
        paragraphs: [
          "Reading is open. Commentary is welcomed. Contribution to active hardware projects is gated because the work often needs sustained expertise, and the About-page application is the path in. Accepted contributors join the private working channels on Telegram.",
        ],
      },
    ],
  },
  {
    category: "DS",
    slug: "what-distributed-systems-work-at-giksn-looks-like",
    title: "What Distributed Systems work at GIKSN looks like",
    abstract:
      "GIKSN Research is a community-first lab where distributed systems work sits alongside AI, Deeptech and Hardware. This is the systems-side view: why the failure model comes first, what a systems paper on the archive looks like and how the sector supports the rest of the work.",
    postedIso: "2026-07-03T08:45:00Z",
    updatedIso: "2026-07-03T08:45:00Z",
    readingMinutes: 4,
    body: [
      {
        paragraphs: [
          "The systems papers that survive get to state their failure model on the first page. The systems papers that do not survive tend to bury it. GIKSN Research is a lab where distributed systems work goes into the archive with its assumptions in the open: crash-stop or Byzantine, synchronous or asynchronous, what breaks under partition, what does not. That is the entry price. Everything else follows from it.",
        ],
      },
      {
        heading: "What we treat as our sector",
        paragraphs: [
          "Consensus, storage, coordination, replication, protocols, scheduling and streaming. The plumbing that keeps working when parts fail. We include operational writing here too, because the runbook is often the paper. A protocol without an operator manual is a whiteboard, not a system.",
        ],
      },
      {
        heading: "What a paper looks like",
        paragraphs: [
          "A DS paper on GIKSN opens with a failure model and a workload. It names the property being traded, because you never get all of them, and it says which one it is willing to lose. Message complexity per operation is called out honestly. Correctness arguments cite the results they lean on. If a design is only faster than the baseline on read-heavy workloads that is stated on the first page, not the last.",
        ],
      },
      {
        heading: "Why the open archive fits",
        paragraphs: [
          "Systems knowledge tends to live in postmortem blog posts and internal wikis. Both are useful and neither is a citable record. GIKSN gives systems research a stable home where the reasoning is visible, the discussion thread stays open and the authors are credited by name. Rejected designs stay in the archive because the reasoning matters even when the design failed.",
        ],
      },
      {
        heading: "The cross-sector view",
        paragraphs: [
          "A distributed system that serves an AI workload has to think about batch dynamics that the model paper never mentions. A hardware paper that assumes a topology needs a systems paper to explain why the topology is safe under load. A deeptech result that runs on a cluster is a systems problem when it scales. The archive is one comment floor across four sectors so that these arguments happen in public rather than in Slack.",
        ],
      },
      {
        heading: "What we ship",
        paragraphs: [
          "Rinne, the first shipped tool, is not a distributed system. Systems products from the bench will be. When they arrive they will land on the products page with formal verification status where applicable, an operator runbook and a paper that argues for the design decisions we made.",
        ],
      },
      {
        heading: "Reading and contributing",
        paragraphs: [
          "Papers are open. Discussion is open. Contribution is gated because sustained systems work requires it. Applications land through the About page, and accepted contributors join private working channels on Telegram alongside the public read-only ones.",
        ],
      },
    ],
  },
];

async function main() {
  let inserted = 0;
  let updated = 0;

  for (const post of POSTS) {
    const [existing] = await db
      .select({ id: papers.id, number: papers.number })
      .from(papers)
      .where(
        and(eq(papers.category, post.category), eq(papers.slug, post.slug))
      )
      .limit(1);

    if (existing) {
      await db
        .update(papers)
        .set({
          kind: KIND,
          title: post.title,
          abstract: post.abstract,
          status: STATUS,
          author: AUTHOR,
          authorHandle: AUTHOR_HANDLE,
          readingMinutes: post.readingMinutes,
          body: post.body,
          hidden: false,
          source: null,
          updated: new Date(post.updatedIso),
        })
        .where(eq(papers.id, existing.id));
      console.log(
        `Updated ${post.category}-${String(existing.number).padStart(3, "0")}: ${post.slug}`
      );
      updated += 1;
      continue;
    }

    const [maxRow] = await db
      .select({ max: max(papers.number) })
      .from(papers)
      .where(eq(papers.category, post.category));
    const nextNumber = (maxRow?.max ?? 0) + 1;

    const [row] = await db
      .insert(papers)
      .values({
        number: nextNumber,
        category: post.category,
        kind: KIND,
        slug: post.slug,
        title: post.title,
        abstract: post.abstract,
        status: STATUS,
        author: AUTHOR,
        authorHandle: AUTHOR_HANDLE,
        posted: new Date(post.postedIso),
        updated: new Date(post.updatedIso),
        readingMinutes: post.readingMinutes,
        body: post.body,
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
    inserted += 1;
  }

  console.log(
    `\nDone. ${inserted} inserted, ${updated} updated, ${POSTS.length} total.`
  );
  process.exit(0);
}

main().catch((e) => {
  console.error("Insert failed:", e);
  process.exit(1);
});
