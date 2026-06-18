import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/db";
import { insights } from "@/db/schema";
import { desc } from "drizzle-orm";

import { InsightsManager } from "./insights-manager";

export const dynamic = "force-dynamic";

export default async function AdminInsightsPage() {
  await requireAdmin();

  const items = await db
    .select()
    .from(insights)
    .orderBy(desc(insights.createdAt));

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Insights</h1>
        <p className="text-sm text-muted-foreground">
          Create, edit, publish/unpublish, feature
        </p>
      </div>
      <InsightsManager initialInsights={items} />
    </div>
  );
}