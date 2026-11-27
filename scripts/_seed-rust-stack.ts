/**
 * Add the Rust stack products and open build without changing existing entries.
 * Dry run: bunx tsx scripts/_seed-rust-stack.ts
 * Apply: explicitly set DATABASE_URL, then append --apply.
 * This script does not load .env.local or run as part of the deployment build.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { products, programs } from "../src/db/schema";

const TELEGRAM_URL = "https://t.me/+xBmnL8ng85cyMDY1";

const PRODUCT_ENTRIES = [
  {
    slug: "rust-agent-framework",
    name: "Rust agent framework",
    tagline: "LangChain and LangGraph concepts rebuilt in Rust.",
    description: "LangChain and LangGraph concepts rebuilt in Rust: typed messages and tools, chains, a stateful graph runtime with checkpoints and interrupts and an agent server. A Go implementation follows.",
    status: "In development",
    license: "MIT OR Apache-2.0",
    category: "AI",
    version: null,
    website: null,
    highlights: ["Platforms: macOS, Linux."],
    links: [{ label: "Follow the build", href: "/programs" }],
    listed: true,
    sortOrder: 1,
  },
  {
    slug: "rust-inference-engine",
    name: "Rust inference engine",
    tagline: "An LLM serving engine written in Rust.",
    description: "An LLM serving engine written in Rust: a Qwen3 forward pass, custom CUDA kernels, paged KV cache, continuous batching, quantization and speculative decoding, behind an OpenAI-compatible API.",
    status: "In development",
    license: "MIT OR Apache-2.0",
    category: "AI",
    version: null,
    website: null,
    highlights: ["Platform: Linux with an NVIDIA GPU."],
    links: [{ label: "Follow the build", href: "/programs" }],
    listed: true,
    sortOrder: 2,
  },
] satisfies (typeof products.$inferInsert)[];

const PROGRAM_ENTRY = {
  slug: "open-build-rust-ai-stack",
  name: "Open build: the Rust AI stack",
  tagline: "Weekly public builds of the inference engine and the agent framework.",
  status: "Open",
  website: TELEGRAM_URL,
  category: "AI",
  sectors: ["AI", "HW", "DS"],
  description: "Weekly public builds of the inference engine and the agent framework. Every repo carries labelled first issues, reviews come within 48 hours and every contributor is credited in release notes. Join the Telegram public channel to pick up an issue.",
  highlights: [],
  listed: true,
  sortOrder: 0,
} satisfies typeof programs.$inferInsert;

async function main() {
  if (!process.argv.includes("--apply")) {
    console.log("Dry run. No database connection opened.");
    console.log("Products:", PRODUCT_ENTRIES.map((entry) => entry.name).join("; "));
    console.log("Program:", PROGRAM_ENTRY.name);
    console.log("Apply schema migrations first, then explicitly set DATABASE_URL and pass --apply.");
    return;
  }

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Explicitly set DATABASE_URL before applying this seed.");
  const client = postgres(url, { max: 1, prepare: false });
  const db = drizzle(client);

  try {
    await db.transaction(async (tx) => {
      await tx.insert(products).values(PRODUCT_ENTRIES).onConflictDoNothing({ target: products.slug });
      await tx.insert(programs).values(PROGRAM_ENTRY).onConflictDoNothing({ target: programs.slug });
    });
    console.log("Rust stack entries inserted. Existing entries were preserved.");
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Rust stack seed failed.");
  process.exitCode = 1;
});
