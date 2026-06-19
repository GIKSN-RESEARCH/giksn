import { MembersTable } from "@/components/admin/members-table";
import { listMembersForAdmin } from "@/actions/members";

export const dynamic = "force-dynamic";

export default async function AdminMembersPage() {
  const members = await listMembersForAdmin();

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Members ({members.length})</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Vetted contributors with platform accounts. Suspend access or revoke Discord
        community access.
      </p>
      <MembersTable members={members} />
    </div>
  );
}