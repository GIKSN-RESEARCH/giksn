import { notFound } from "next/navigation";
import Link from "next/link";
import { Masthead } from "@/components/Masthead";
import { CategoryNav } from "@/components/CategoryNav";
import { Footer } from "@/components/Footer";
import { FilteredPapersList } from "@/components/FilteredPapersList";
import { categoryByCode, STATUSES } from "@/lib/papers";
import { listPapersPublic } from "@/db/queries";

export const revalidate = 60;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = categoryByCode(category);
  if (!cat) return notFound();

  const list = await listPapersPublic(cat.code);
  const counts = STATUSES.map((s) => ({
    status: s,
    n: list.filter((p) => p.status === s).length,
  }));

  return (
    <>
      <Masthead />
      <CategoryNav active={cat.code} />
      <main className="w-full mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 pt-8 sm:pt-12 pb-10 sm:pb-12">
        <section className="grid grid-cols-12 gap-6 md:gap-10 pb-8 sm:pb-10 border-b border-rule">
          <div className="col-span-12 md:col-span-9">
            <div className="flex items-baseline gap-3 mb-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                {cat.code}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
                {String(list.length).padStart(2, "0")} papers
              </span>
            </div>
            <h1
              className="font-display font-semibold text-ink leading-[1] sm:leading-[0.98] tracking-[-0.03em] sm:tracking-[-0.035em]"
              style={{ fontSize: "clamp(1.85rem, 5.4vw, 4rem)" }}
            >
              {cat.full}
            </h1>
            <p className="mt-4 sm:mt-5 max-w-[55ch] text-[15px] sm:text-[17px] leading-[1.6] text-ink-soft font-display italic">
              {cat.blurb}
            </p>
          </div>
          <aside className="col-span-12 md:col-span-3 pt-2 md:pt-0 md:border-l md:border-rule md:pl-8">
            <div className="kicker mb-3">Status breakdown</div>
            <ul className="space-y-1.5">
              {counts.map(({ status, n }) => (
                <li
                  key={status}
                  className="flex items-center justify-between font-mono text-[12px]"
                >
                  <span className="text-ink-soft uppercase tracking-[0.12em]">
                    {status}
                  </span>
                  <span
                    className={`tabular-nums ${
                      n > 0 ? "text-ink" : "text-ink-faint/50"
                    }`}
                  >
                    {String(n).padStart(2, "0")}
                  </span>
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <section className="pt-8 sm:pt-10">
          <div className="flex items-end justify-between gap-3 flex-wrap mb-4">
            <div className="kicker">Search {cat.label}</div>
            <Link
              href="/submit"
              className="font-mono text-[11px] uppercase tracking-[0.14em] link-underline"
            >
              Submit a {cat.code} →
            </Link>
          </div>
          {list.length === 0 ? (
            <p className="py-12 font-display italic text-ink-soft">
              No papers in this section yet. Submit the first one.
            </p>
          ) : (
            <FilteredPapersList
              papers={list}
              pageSize={12}
              hideCategoryFilter
            />
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
