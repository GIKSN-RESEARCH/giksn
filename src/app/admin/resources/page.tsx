import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/db";
import { resources } from "@/db/schema";
import { desc } from "drizzle-orm";

import { ResourcesManager } from "./resources-manager";

export const dynamic = "force-dynamic";

export default async function AdminResourcesPage() {
  await requireAdmin();

  const items = await db
    .select()
    .from(resources)
    .orderBy(desc(resources.createdAt));

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Resources</h1>
        <p className="text-sm text-muted-foreground">
          Curated links and optional MDX explainers
        </p>
      </div>
      <ResourcesManager initialResources={items} />
    </div>
  );
}