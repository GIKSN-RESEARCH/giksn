import { auth } from './auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.user.role !== 'admin') {
    redirect('/sign-in?error=unauthorized');
  }
  return session;
}

export function isActiveContributor(
  session: NonNullable<Awaited<ReturnType<typeof getSession>>>
) {
  return (
    session.user.status === "active" &&
    (session.user.role === "contributor" || session.user.role === "admin")
  );
}

export async function requireContributor() {
  const session = await getSession();
  if (!session || !isActiveContributor(session)) {
    redirect("/sign-in?error=unauthorized");
  }
  return session;
}
