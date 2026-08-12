import "dotenv/config";

import { sql } from "drizzle-orm";

import { db } from "@/db";
import { comments, papers } from "@/db/schema";
import type { Paper } from "@/lib/papers";

// Sample papers used to bring the archive up from empty. Replace or extend
// as the lab's real content lands from the admin panel.
const SAMPLE_PAPERS: Paper[] = [
  {
    number: 1,
    category: "AI",
    kind: "Survey",
    slug: "state-of-open-agent-frameworks-2026",
    title: "The state of open agent frameworks in 2026",
    abstract:
      "A survey of the open agent frameworks that shipped in the last twelve months. What each one gets right, what each one leaves on the table, and where the lab thinks the leverage sits for building agents that hold up under real workloads.",
    status: "Research",
    author: "GIKSN Research",
    authorHandle: "giksn",
    posted: "2026-06-04",
    updated: "2026-06-18",
    readingMinutes: 12,
    hidden: false,
    featured: false,
    body: [
      {
        paragraphs: [
          "This is a working survey. It will be edited as new frameworks ship and as the lab spends more time using each one in anger. Feedback in the discussion below is how the paper stays useful as the field moves.",
          "Scope: open source, actively maintained, and used by at least one production team we could reach. Closed-source products are noted where relevant but are not the subject.",
        ],
      },
      {
        heading: "What we looked at",
        list: [
          "Concurrency model and how it handles long-running work.",
          "Observability primitives and how noisy the default traces are.",
          "Tool interface and how much the framework fights you.",
          "Escape hatches, because every framework has to be exited eventually.",
        ],
      },
    ],
    discussion: [],
  },
];

async function main() {
  console.log("→ Truncating tables…");
  await db.execute(
    sql`TRUNCATE TABLE comments, papers RESTART IDENTITY CASCADE`
  );

  console.log(`→ Seeding ${SAMPLE_PAPERS.length} paper(s)…`);
  let totalComments = 0;

  for (const p of SAMPLE_PAPERS) {
    const [row] = await db
      .insert(papers)
      .values({
        number: p.number,
        category: p.category,
        kind: p.kind,
        slug: p.slug,
        title: p.title,
        abstract: p.abstract,
        status: p.status,
        author: p.author,
        authorHandle: p.authorHandle,
        posted: new Date(`${p.posted}T12:00:00Z`),
        updated: new Date(`${p.updated}T12:00:00Z`),
        readingMinutes: p.readingMinutes,
        body: p.body,
      })
      .returning({ id: papers.id });

    if (p.discussion.length === 0) continue;

    const baseDate = new Date(`${p.updated}T12:00:00Z`);

    for (const top of p.discussion) {
      const [topRow] = await db
        .insert(comments)
        .values({
          paperId: row.id,
          parentId: null,
          author: top.author,
          handle: top.handle,
          body: top.body,
          createdAt: top.date ? new Date(`${top.date}T12:00:00Z`) : baseDate,
        })
        .returning({ id: comments.id });
      totalComments += 1;

      for (const reply of top.replies ?? []) {
        await db.insert(comments).values({
          paperId: row.id,
          parentId: topRow.id,
          author: reply.author,
          handle: reply.handle,
          body: reply.body,
          createdAt: reply.date
            ? new Date(`${reply.date}T12:00:00Z`)
            : baseDate,
        });
        totalComments += 1;
      }
    }
  }

  console.log(
    `✓ Seed complete: ${SAMPLE_PAPERS.length} paper(s), ${totalComments} comment(s).`
  );
  process.exit(0);
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
