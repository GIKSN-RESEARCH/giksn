import Link from "next/link";

import { Masthead } from "@/components/Masthead";
import { CategoryNav } from "@/components/CategoryNav";
import { Footer } from "@/components/Footer";
import { FilteredUpdatesList } from "@/components/FilteredUpdatesList";
import { listPapersSortedByUpdated } from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function UpdatesPage() {
  const all = await listPapersSortedByUpdated({ onlyUpdates: true });

  return (
    <>
      <Masthead />
      <CategoryNav active="UPDATES" />
      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 pt-8 sm:pt-12 pb-12 sm:pb-16">
        <header className="pb-8 sm:pb-10 border-b border-rule">
          <div className="flex items-center gap-3 mb-3">
            <div className="kicker">The wire</div>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent border border-accent px-2 py-0.5">
              Updates
            </span>
          </div>
          <h1
            className="font-display font-semibold text-ink leading-[1] sm:leading-[0.98] tracking-[-0.03em] sm:tracking-[-0.035em] max-w-[22ch]"
            style={{ fontSize: "clamp(2rem, 5.4vw, 4rem)" }}
          >
            <span className="text-accent">News from the lab</span> and the wider
            frontier.
          </h1>
          <p className="mt-5 sm:mt-7 max-w-[60ch] text-[15px] sm:text-[18px] leading-[1.55] text-ink-soft font-display italic">
            Cohort openings, collaborations, releases, program dates. Factual
            updates, sourced from the org doing the announcing.
          </p>
        </header>

        <section className="pt-6 sm:pt-10">
          <div className="flex items-end justify-between gap-3 flex-wrap mb-4 sm:mb-6">
            <div className="kicker">Search the wire</div>
            <Link
              href="/submit?kind=update"
              className="font-mono text-[11px] uppercase tracking-[0.14em] link-underline"
            >
              Submit an update →
            </Link>
          </div>
          {all.length === 0 ? (
            <p className="py-12 font-display italic text-ink-soft">
              No updates yet. Submit the first one.
            </p>
          ) : (
            <FilteredUpdatesList updates={all} pageSize={12} />
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
