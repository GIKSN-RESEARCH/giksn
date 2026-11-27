import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import test from "node:test";
import { eq } from "drizzle-orm";
import { readMigrationFiles } from "drizzle-orm/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { admins, comments, news, papers, products, programs } from "../src/db/schema";
import { kindSchema, productStatusSchema } from "../src/lib/validators";
import { kindLabel } from "../src/lib/papers";

const execFileAsync = promisify(execFile);

test("migrations and the Rust stack seed preserve existing content on rerun", async () => {
  const url = process.env.TEST_DATABASE_URL;
  assert.ok(url, "Set TEST_DATABASE_URL to an empty, disposable PostgreSQL database.");

  const client = postgres(url, { max: 1, prepare: false });
  const db = drizzle(client);

  try {
    const tables = await client`
      select table_name from information_schema.tables
      where table_schema in ('public', 'drizzle')
    `;
    assert.equal(tables.length, 0, "Refusing to run against an initialized database.");
    await assert.rejects(client`select * from papers`, { code: "42P01" });

    const migrations = readMigrationFiles({ migrationsFolder: "./drizzle" });
    const migrate = () => execFileAsync("npm", ["run", "db:migrate"], {
      env: { ...process.env, DATABASE_URL: url },
      timeout: 30_000,
    });
    await migrate();

    // Selecting through the current ORM schema checks every expected column.
    for (const table of [admins, comments, news, papers, products, programs]) {
      await db.select().from(table).limit(1);
    }

    const [paper] = await db.insert(papers).values({
      number: 1,
      category: "AI",
      kind: "implementation",
      slug: "migration-check",
      title: "Migration check",
      abstract: "Preserved across deployment builds.",
      author: "Test",
      authorHandle: "test",
      body: [],
    }).returning();
    await db.insert(comments).values({
      paperId: paper.id,
      author: "Test",
      handle: "test",
      body: "Preserve this comment.",
    });

    const [rinneBefore] = await db.select().from(products).where(eq(products.slug, "rinne"));
    const seed = (...args: string[]) => execFileAsync("node", [
      "--import", "tsx", "scripts/_seed-rust-stack.ts", ...args,
    ], { env: { ...process.env, DATABASE_URL: url }, timeout: 30_000 });
    const dryRun = await seed();
    assert.match(dryRun.stdout, /No database connection opened/);
    assert.equal((await db.select().from(products)).length, 1);

    await seed("--apply");
    await seed("--apply");
    await migrate();

    assert.deepEqual(await db.select().from(papers), [paper]);
    assert.equal((await db.select().from(comments)).length, 1);
    const productRows = await db.select().from(products);
    assert.equal(productRows.length, 3);
    assert.deepEqual(productRows.find((entry) => entry.slug === "rinne"), rinneBefore);
    const rustProducts = productRows.filter((entry) => entry.slug !== "rinne");
    assert.ok(rustProducts.every((entry) => entry.status === "In development" && entry.version === null));
    assert.ok(rustProducts.every((entry) => entry.links[0]?.href === "/programs"));
    const programRows = await db.select().from(programs);
    assert.equal(programRows.length, 1);
    assert.equal(programRows[0].status, "Open");
    assert.equal(programRows[0].website, "https://t.me/+xBmnL8ng85cyMDY1");
    assert.equal((await db.select().from(news)).length, 0);
    const applied = await client`select id from drizzle.__drizzle_migrations`;
    assert.equal(applied.length, migrations.length);
  } finally {
    await client.end();
  }
});

test("Implementation and In development are accepted without changing existing values", () => {
  for (const kind of ["Original", "Survey", "implementation"]) {
    assert.equal(kindSchema.parse(kind), kind);
  }
  assert.equal(kindLabel("implementation"), "Implementation");
  assert.equal(kindSchema.safeParse("unknown").success, false);
  for (const status of ["Alpha", "Beta", "Stable", "In development"]) {
    assert.equal(productStatusSchema.parse(status), status);
  }
});
