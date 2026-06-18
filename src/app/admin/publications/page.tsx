import { requireAdmin } from '@/lib/auth-guard';
import { db } from '@/db';
import { publications } from '@/db/schema';
import { desc } from 'drizzle-orm';

import { PublicationsManager } from './publications-manager';

export const dynamic = 'force-dynamic';

export default async function AdminPublications() {
  await requireAdmin();

  const pubs = await db
    .select()
    .from(publications)
    .orderBy(desc(publications.createdAt));

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Publications</h1>
        <p className="text-sm text-muted-foreground">Create, edit, publish/unpublish</p>
      </div>

      <PublicationsManager initialPublications={pubs} />
    </div>
  );
}

