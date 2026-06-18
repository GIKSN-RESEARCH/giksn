import { getSession } from "@/lib/auth-guard";

export async function requireAdminApi() {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return null;
  }
  return session;
}