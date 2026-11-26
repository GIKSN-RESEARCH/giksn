import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import test from "node:test";
import { readMigrationFiles } from "drizzle-orm/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { admins, comments, news, papers, products, programs } from "../src/db/schema";

const execFileAsync = promisify(execFile);

test("migrations initialize an empty database and preserve data on rerun", async () => {
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

    await migrate();

    assert.deepEqual(await db.select().from(papers), [paper]);
    assert.equal((await db.select().from(comments)).length, 1);
    assert.equal((await db.select().from(products)).length, 1);
    const applied = await client`select id from drizzle.__drizzle_migrations`;
    assert.equal(applied.length, migrations.length);
  } finally {
    await client.end();
  }
});
