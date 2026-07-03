import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// `drizzle-kit generate` runs without a live database, so we don't fail when
// DATABASE_URL is missing — only the runtime commands (migrate/push/studio)
// will hit the connection and surface a clear error there.
const url = process.env.DATABASE_URL ?? "postgres://placeholder";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
