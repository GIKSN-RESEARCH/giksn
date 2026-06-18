import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { desc } from "drizzle-orm";

import { ProjectsManager } from "./projects-manager";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  await requireAdmin();

  const items = await db
    .select()
    .from(projects)
    .orderBy(desc(projects.createdAt));

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="text-sm text-muted-foreground">
          Public visibility in Phase 1; contributor-only in Phase 2
        </p>
      </div>
      <ProjectsManager initialProjects={items} />
    </div>
  );
}