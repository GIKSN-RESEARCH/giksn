import Link from "next/link";
import { desc, eq, count } from "drizzle-orm";

import { db } from "@/db";
import {
  publications,
  insights,
  projects,
  resources,
  applications,
  media,
} from "@/db/schema";
import { requireAdmin } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdmin();

  const [
    [pubCount],
    [insightCount],
    [projectCount],
    [resourceCount],
    [appCount],
    [mediaCount],
    recentPubs,
    recentInsights,
    recentApps,
  ] = await Promise.all([
    db.select({ count: count() }).from(publications),
    db.select({ count: count() }).from(insights),
    db.select({ count: count() }).from(projects),
    db.select({ count: count() }).from(resources),
    db
      .select({ count: count() })
      .from(applications)
      .where(eq(applications.status, "pending")),
    db.select({ count: count() }).from(media),
    db
      .select({
        title: publications.title,
        status: publications.status,
        updatedAt: publications.updatedAt,
      })
      .from(publications)
      .orderBy(desc(publications.updatedAt))
      .limit(3),
    db
      .select({
        title: insights.title,
        status: insights.status,
        updatedAt: insights.updatedAt,
      })
      .from(insights)
      .orderBy(desc(insights.updatedAt))
      .limit(3),
    db
      .select({
        name: applications.name,
        email: applications.email,
        createdAt: applications.createdAt,
      })
      .from(applications)
      .orderBy(desc(applications.createdAt))
      .limit(3),
  ]);

  const stats = [
    { label: "Publications", value: pubCount.count, href: "/admin/publications" },
    { label: "Insights", value: insightCount.count, href: "/admin/insights" },
    { label: "Projects", value: projectCount.count, href: "/admin/projects" },
    { label: "Pending applications", value: appCount.count, href: "/admin/applications" },
  ];

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Admin Dashboard</h1>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="card-elevated rounded-xl p-6 transition hover:border-foreground/20"
          >
            <div className="text-sm text-muted-foreground">{stat.label}</div>
            <div className="mt-2 text-4xl font-bold">{stat.value}</div>
          </Link>
        ))}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="card-elevated rounded-xl p-6">
          <div className="text-sm text-muted-foreground">Resources</div>
          <div className="mt-2 text-3xl font-bold">{resourceCount.count}</div>
        </div>
        <div className="card-elevated rounded-xl p-6">
          <div className="text-sm text-muted-foreground">Media uploads</div>
          <div className="mt-2 text-3xl font-bold">{mediaCount.count}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-border p-5">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Recent publications
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            {recentPubs.length === 0 ? (
              <li className="text-muted-foreground">None yet</li>
            ) : (
              recentPubs.map((item) => (
                <li key={item.title}>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.status} • {item.updatedAt.toLocaleDateString()}
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="rounded-xl border border-border p-5">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Recent insights
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            {recentInsights.length === 0 ? (
              <li className="text-muted-foreground">None yet</li>
            ) : (
              recentInsights.map((item) => (
                <li key={item.title}>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.status} • {item.updatedAt.toLocaleDateString()}
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="rounded-xl border border-border p-5">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Recent applications
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            {recentApps.length === 0 ? (
              <li className="text-muted-foreground">None yet</li>
            ) : (
              recentApps.map((item) => (
                <li key={`${item.email}-${item.createdAt.toISOString()}`}>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.email} • {item.createdAt.toLocaleDateString()}
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}