import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ApplicationReviewPanel } from "@/components/admin/application-review";

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage() {
  await requireAdmin();

  const apps = await db
    .select()
    .from(applications)
    .orderBy(desc(applications.createdAt))
    .limit(100);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">
        Applications ({apps.length})
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Accept to mint platform + Telegram tokens and email the applicant. Reject
        and waitlist send templated updates.
      </p>

      {apps.length === 0 ? (
        <p className="text-muted-foreground">No applications submitted yet.</p>
      ) : (
        <div className="space-y-4">
          {apps.map((app) => (
            <article
              key={app.id}
              className="rounded-xl border border-border p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{app.name}</h2>
                  <p className="text-sm text-muted-foreground">{app.email}</p>
                </div>
                <span className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
                  {app.status}
                </span>
              </div>

              <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Domains</dt>
                  <dd>{app.domains.join(", ") || "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Submitted</dt>
                  <dd>{app.createdAt.toLocaleString()}</dd>
                </div>
                {app.referral ? (
                  <div>
                    <dt className="text-muted-foreground">Referral</dt>
                    <dd>{app.referral}</dd>
                  </div>
                ) : null}
                {app.cvUrl ? (
                  <div>
                    <dt className="text-muted-foreground">CV</dt>
                    <dd>
                      <a
                        href={app.cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        View PDF ↗
                      </a>
                    </dd>
                  </div>
                ) : null}
                <div className="md:col-span-2">
                  <dt className="text-muted-foreground">Background</dt>
                  <dd className="mt-1 whitespace-pre-wrap">{app.background}</dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-muted-foreground">Motivation</dt>
                  <dd className="mt-1 whitespace-pre-wrap">{app.motivation}</dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-muted-foreground">Evidence</dt>
                  <dd className="mt-1 whitespace-pre-wrap">{app.evidence}</dd>
                </div>
                {app.links && Object.keys(app.links).length > 0 ? (
                  <div className="md:col-span-2">
                    <dt className="text-muted-foreground">Links</dt>
                    <dd className="mt-1">
                      {Object.entries(app.links as Record<string, string>).map(
                        ([key, value]) => (
                          <div key={key}>
                            <span className="text-muted-foreground">{key}:</span>{" "}
                            <a
                              href={value}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              {value}
                            </a>
                          </div>
                        )
                      )}
                    </dd>
                  </div>
                ) : null}
              </dl>

              <ApplicationReviewPanel application={app} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}