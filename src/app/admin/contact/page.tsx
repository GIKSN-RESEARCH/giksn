import { desc } from "drizzle-orm";

import { ContactInbox } from "@/components/admin/contact-inbox";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export default async function AdminContactPage() {
  await requireAdmin();

  const messages = await db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt))
    .limit(100);

  const unhandled = messages.filter((m) => !m.handled).length;

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">
        Contact inbox ({messages.length})
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Messages from the public contact form.
        {unhandled > 0 ? ` ${unhandled} unhandled.` : " All caught up."}
      </p>

      <ContactInbox messages={messages} />
    </div>
  );
}