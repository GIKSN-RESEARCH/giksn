import Link from "next/link";

import { AdminQueryProvider } from "@/components/admin/query-provider";
import { requireAdmin } from "@/lib/auth-guard";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/publications", label: "Publications" },
  { href: "/admin/insights", label: "Insights" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/resources", label: "Resources" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/contact", label: "Contact" },
  { href: "/admin/audit", label: "Audit log" },
  { href: "/admin/members", label: "Members" },
] as const;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <AdminQueryProvider>
      <div className="flex min-h-screen">
        <aside className="w-64 border-r border-border bg-card/30 p-6">
          <div className="mb-8">
            <Link href="/" className="text-xl font-bold">
              GIKSN Admin
            </Link>
          </div>

          <nav className="space-y-1 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded px-3 py-2 hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-4 border-t border-border pt-4">
              <Link
                href="/"
                className="block rounded px-3 py-2 text-muted-foreground hover:bg-muted"
              >
                ← Back to site
              </Link>
            </div>
          </nav>
        </aside>

        <main className="flex-1 overflow-x-hidden p-8">{children}</main>
      </div>
    </AdminQueryProvider>
  );
}