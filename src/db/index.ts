import { drizzle } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";

import * as schema from "./schema";

// Cache the Postgres client and the Drizzle instance on globalThis so warm
// serverless invocations reuse the same TCP connection pool instead of
// negotiating a new TLS handshake on every request. This matters a lot on
// Vercel: a fresh connection to Neon adds ~150–300ms per request.
const globalForDb = globalThis as unknown as {
  __pg?: Sql;
  __drizzle?: ReturnType<typeof drizzle<typeof schema>>;
};

function getClient(): Sql {
  if (globalForDb.__pg) return globalForDb.__pg;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and fill it in."
    );
  }
  const ssl = process.env.DATABASE_SSL === "1" ? "require" : undefined;
  const client = postgres(url, {
    ssl,
    max: 10,
    idle_timeout: 30,
    // Neon's pooler does not support prepared statement caching across
    // pooled connections, so keep prepare off.
    prepare: false,
  });
  globalForDb.__pg = client;
  return client;
}

function getDb() {
  if (globalForDb.__drizzle) return globalForDb.__drizzle;
  const instance = drizzle(getClient(), { schema });
  globalForDb.__drizzle = instance;
  return instance;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === "function" ? (value as Function).bind(real) : value;
  },
});

export { schema };
