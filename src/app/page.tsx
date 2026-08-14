import Link from "next/link";
import { Masthead } from "@/components/Masthead";
import { CategoryNav } from "@/components/CategoryNav";
import { Footer } from "@/components/Footer";

import { FilteredPapersList } from "@/components/FilteredPapersList";
import { HeroSearchBar, HeroSearchHints } from "@/components/HeroSearchBar";
import { StatusPill } from "@/components/StatusPill";
import { KindBadge } from "@/components/KindBadge";
import {
  CATEGORIES,
  STATUSES,
  STATUS_LEGENDS,
  isPaper,
  paperRef,
  shortDate,
  type Paper,
} from "@/lib/papers";
import { listPapersSortedByUpdatedPublic, listProductsPublic } from "@/db/queries";

// Rendered fresh at most every hour; admin mutations force revalidation
// immediately via revalidateTag('papers').
export const revalidate = 60;

const DESKTOP_PAGE_SIZE = 5;

export default async function HomePage() {
  const [all, PRODUCTS] = await Promise.all([
    listPapersSortedByUpdatedPublic(),
    listProductsPublic(),
  ]);
  const papersOnly = all.filter((p) => isPaper(p.category));

  if (all.length === 0) {
    return <EmptyState />;
  }

  // Featured entry is whichever the admin has flagged. If none, fall back to
  // the most recently updated paper or update. It stays in Recent below.
  const featured = all.find((p) => p.featured) ?? all[0];
  const recent = all;

  const liveCount = papersOnly.filter(
    (p) => p.status === "Research" || p.status === "Writings"
  ).length;
  const totalReplies = papersOnly.reduce(
    (n, p) =>
      n +
      p.discussion.reduce((m, c) => m + 1 + (c.replies?.length ?? 0), 0),
    0
  );

  return (
    <>
      <Masthead />
      <CategoryNav />
      <main className="w-full mx-auto max-w-360 px-4 sm:px-6 lg:px-10 pt-8 sm:pt-10 pb-10 sm:pb-12">
        {/* MOBILE LAYOUT */}
        <div className="md:hidden">
          <FeaturedArticle p={featured} />

          <section className="mt-10 pt-8 border-t border-rule">
            <div className="mb-5">
              <div className="kicker mb-2">The list</div>
              <h2 className="headline text-[1.6rem]">Recent</h2>
            </div>
            <FilteredPapersList papers={recent} pageSize={DESKTOP_PAGE_SIZE} />
          </section>

          <div className="mt-12 mb-8">
            <div className="border-t-[3px] border-accent" />
            <div className="mt-3 kicker">Also in this issue</div>
          </div>

          <section className="space-y-10">
            <div>
              <div className="kicker mb-3">From the lab</div>
              <p className="font-display italic text-ink leading-normal text-[17px]">
                GIKSN Research is an independent lab pursuing ambitious
                ideas across artificial intelligence, deep tech, hardware
                and distributed systems. We conduct research, build
                experimental technology and create spaces for researchers,
                engineers and founders to work on difficult problems.
              </p>
              <Link
                href="/about"
                className="mt-4 inline-block link-underline font-mono text-[11px] uppercase tracking-[0.14em] text-accent hover:text-accent-deep transition-colors"
              >
                About the lab →
              </Link>
              <div className="mt-5 divider-dashed" />
              <dl className="mt-5 space-y-3 font-mono text-[12px] uppercase tracking-[0.12em]">
                <div className="flex justify-between">
                  <dt className="text-ink-faint">Open papers</dt>
                  <dd className="text-ink tabular-nums">{papersOnly.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-faint">In discussion</dt>
                  <dd className="text-accent tabular-nums">{liveCount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-faint">Total replies</dt>
                  <dd className="text-ink tabular-nums">{totalReplies}</dd>
                </div>
              </dl>
            </div>

            <SectionsBlock papers={papersOnly} />

            <div>
              <div className="kicker mb-3">Categories</div>
              <ul className="space-y-3">
                {STATUSES.map((s) => (
                  <li
                    key={s}
                    className="flex items-start justify-between gap-3"
                  >
                    <StatusPill status={s} />
                    <span className="text-[12px] text-ink-soft text-right max-w-[18ch]">
                      {STATUS_LEGENDS[s]}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 divider-dashed" />
              <div className="kicker mt-6 mb-3">Reading the archive</div>
              <p className="text-[14px] text-ink-soft leading-[1.65]">
                Every paper lives at a stable URL. Category marks what kind of
                work it is: research, writing, a product or a program.
              </p>
              <Link
                href="/about"
                className="mt-4 inline-block link-underline font-mono text-[11px] uppercase tracking-[0.14em]"
              >
                About the lab →
              </Link>
            </div>
          </section>
        </div>

        {/* DESKTOP HERO SEARCH */}
        <section className="hidden md:block pb-8 sm:pb-10 border-b border-rule">
          <div className="kicker mb-3">Find a paper</div>
          <HeroSearchBar paperCount={papersOnly.length} />
          <HeroSearchHints />
        </section>

        {/* DESKTOP LAYOUT */}
        <section className="hidden md:grid grid-cols-12 gap-8 md:gap-10 pt-8 sm:pt-10 pb-10 sm:pb-12 border-b border-rule">
          <aside className="col-span-12 md:col-span-3 min-w-0">
            <div className="kicker mb-3">From the lab</div>
            <p className="font-display italic text-ink leading-normal text-[18px]">
              GIKSN Research is an independent lab pursuing ambitious ideas
              across artificial intelligence, deep tech, hardware and
              distributed systems. We conduct research, build experimental
              technology and create spaces for researchers, engineers and
              founders to work on difficult problems.
            </p>
            <Link
              href="/about"
              className="mt-5 inline-block link-underline font-mono text-[11px] uppercase tracking-[0.14em] text-accent hover:text-accent-deep transition-colors"
            >
              About the lab →
            </Link>
            <div className="mt-6 divider-dashed" />
            <dl className="mt-6 space-y-3 font-mono text-[12px] uppercase tracking-[0.12em]">
              <div className="flex justify-between">
                <dt className="text-ink-faint">Open papers</dt>
                <dd className="text-ink tabular-nums">{papersOnly.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-faint">In discussion</dt>
                <dd className="text-accent tabular-nums">{liveCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-faint">Total replies</dt>
                <dd className="text-ink tabular-nums">{totalReplies}</dd>
              </div>
            </dl>
          </aside>
          <article className="col-span-12 md:col-span-5 min-w-0 md:border-l md:border-rule md:pl-8">
            <FeaturedArticleInner p={featured} />
          </article>
          <aside className="col-span-12 md:col-span-4 min-w-0 md:border-l md:border-rule md:pl-8">
            <SectionsBlock papers={papersOnly} />
          </aside>
        </section>

        <section className="hidden md:grid grid-cols-12 gap-8 md:gap-10 pt-10 sm:pt-12">
          <div className="col-span-12 md:col-span-9 min-w-0">
            <div className="flex items-end justify-between gap-3 flex-wrap mb-5 sm:mb-6">
              <div>
                <div className="kicker mb-2">The list</div>
                <h2 className="headline text-[1.6rem] sm:text-[1.9rem] md:text-[2.3rem]">
                  Recent
                </h2>
              </div>
              <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
                Sorted by recent edit
              </div>
            </div>
            <FilteredPapersList
              papers={recent}
              pageSize={DESKTOP_PAGE_SIZE}
            />
          </div>
          <aside className="col-span-12 md:col-span-3 min-w-0 md:border-l md:border-rule md:pl-8">
            {PRODUCTS.length > 0 && (
              <>
                <div className="flex items-baseline justify-between mb-3">
                  <div className="kicker">On the bench</div>
                  <Link
                    href="/products"
                    className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent hover:text-accent-deep transition-colors"
                  >
                    See all →
                  </Link>
                </div>
                <ul className="space-y-3 mb-8">
                  {PRODUCTS.slice(0, 4).map((product) => (
                    <li
                      key={product.slug}
                      className="border-b border-rule-soft pb-3 last:border-b-0"
                    >
                      <Link
                        href="/products"
                        className="block hover:text-accent transition-colors"
                      >
                        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent mb-1">
                          {product.status}
                          {product.version ? ` · v${product.version}` : ""}
                        </div>
                        <div className="text-[13px] text-ink leading-tight font-display font-medium">
                          {product.name}
                        </div>
                        <div className="text-[11.5px] text-ink-soft leading-snug mt-1">
                          {product.tagline}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="divider-dashed mb-8" />
              </>
            )}
            <div className="kicker mb-3">Categories</div>
            <ul className="space-y-3">
              {STATUSES.map((s) => (
                <li
                  key={s}
                  className="flex items-start justify-between gap-3"
                >
                  <StatusPill status={s} />
                  <span className="text-[12px] text-ink-soft text-right max-w-[16ch]">
                    {STATUS_LEGENDS[s]}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-10 divider-dashed" />
            <div className="kicker mt-8 mb-3">Reading the archive</div>
            <p className="text-[14px] text-ink-soft leading-[1.65]">
              Every paper lives at a stable URL. Category marks what kind of
              work it is: research, writing, a product or a program.
            </p>
            <Link
              href="/about"
              className="mt-4 inline-block link-underline font-mono text-[11px] uppercase tracking-[0.14em]"
            >
              About the lab →
            </Link>
          </aside>
        </section>
      </main>
      <Footer />
    </>
  );
}

function FeaturedArticle({ p }: { p: Paper }) {
  return (
    <article>
      <FeaturedArticleInner p={p} />
    </article>
  );
}

function FeaturedArticleInner({ p }: { p: Paper }) {
  const upMode = p.category === "UP";
  return (
    <>
      <div className="flex items-center gap-2 sm:gap-3 mb-3 flex-wrap">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
          Featured · {paperRef(p)}
        </span>
        {upMode ? (
          <>
            {p.source && (
              <span className="inline-flex items-center font-mono uppercase tracking-[0.14em] text-[10px] px-1.5 py-px text-accent border border-accent/50">
                {p.source}
              </span>
            )}
            <span className="inline-flex items-center font-mono uppercase tracking-[0.14em] text-[10px] px-1.5 py-px text-ink border border-rule">
              Update
            </span>
          </>
        ) : (
          <>
            <KindBadge kind={p.kind} />
            <StatusPill status={p.status} />
          </>
        )}
      </div>
      <h2
        className="font-display font-semibold text-ink leading-[1.04] tracking-[-0.03em] wrap-anywhere hyphens-auto"
        style={{ fontSize: "clamp(1.65rem, 3.2vw, 2.6rem)" }}
      >
        <Link
          href={`/${p.category.toLowerCase()}/${p.slug}`}
          className="hover:text-accent-deep transition-colors"
        >
          {p.title}
        </Link>
      </h2>
      <p className="mt-4 sm:mt-5 text-[15px] sm:text-[16px] leading-[1.65] text-ink-soft wrap-anywhere">
        {p.abstract}
      </p>
      <div className="mt-5 sm:mt-6 flex flex-wrap items-center gap-x-4 sm:gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
        <span>By {p.author}</span>
        <span className="hidden sm:inline">·</span>
        <span>{shortDate(p.updated)}</span>
        <span className="hidden sm:inline">·</span>
        <span>{p.readingMinutes} min read</span>
        <span className="hidden sm:inline">·</span>
        <Link
          href={`/${p.category.toLowerCase()}/${p.slug}`}
          className="text-accent link-underline"
        >
          Continue reading →
        </Link>
      </div>
    </>
  );
}

function SectionsBlock({ papers }: { papers: Paper[] }) {
  const paperCats = CATEGORIES.filter((c) => c.code !== "UP");
  return (
    <div>
      <div className="flex items-baseline justify-between mb-4">
        <div className="kicker">Sectors</div>
        <span className="font-mono text-[11px] tabular-nums text-ink-faint">
          {String(paperCats.length).padStart(2, "0")}
        </span>
      </div>
      <h3 className="font-display font-semibold text-[1.3rem] sm:text-[1.4rem] leading-[1.05] tracking-[-0.02em] mb-1">
        Four sectors. One lab.
      </h3>
      <p className="font-display italic text-ink-soft text-[14px] leading-[1.55] mb-5">
        Each sector runs its own research. The threads often overlap.
        AI and Deeptech get the most cycles.
      </p>
      <ul className="border-t border-rule">
        {paperCats.map((cat) => {
          const count = papers.filter((p) => p.category === cat.code).length;
          return (
            <li key={cat.code} className="border-b border-rule">
              <Link
                href={`/${cat.code.toLowerCase()}`}
                className="group flex items-baseline justify-between gap-3 py-3 transition-colors hover:bg-accent-wash hover:px-2"
              >
                <div className="flex items-baseline gap-3 min-w-0">
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent shrink-0 w-10">
                    {cat.code}
                  </span>
                  <span className="font-display font-medium text-[14px] tracking-[-0.01em] text-ink truncate group-hover:text-accent-deep transition-colors">
                    {cat.full}
                  </span>
                </div>
                <span className="font-mono text-[11px] tabular-nums text-ink-faint shrink-0">
                  {String(count).padStart(2, "0")}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function EmptyState() {
  return (
    <>
      <Masthead />
      <CategoryNav />
      <main className="w-full mx-auto max-w-360 px-4 sm:px-6 lg:px-10 pt-20 pb-16 text-center">
        <div className="kicker mb-3 justify-center">The lab is quiet</div>
        <h1
          className="font-display font-semibold text-ink leading-[0.98] tracking-[-0.035em] mx-auto max-w-[18ch]"
          style={{ fontSize: "clamp(2rem, 5.4vw, 4rem)" }}
        >
          Nothing published <span className="text-accent">yet</span>.
        </h1>
        <p className="mt-6 mx-auto max-w-[55ch] text-[15px] sm:text-[17px] leading-[1.6] text-ink-soft font-display italic">
          Submit the first paper, or post the first lab update.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/submit"
            className="bg-accent text-white! px-6 py-3 font-mono text-[12px] uppercase tracking-[0.16em] hover:bg-accent-deep transition-colors"
          >
            Submit a paper →
          </Link>
          <Link
            href="/about"
            className="border border-rule px-6 py-3 font-mono text-[12px] uppercase tracking-[0.16em] hover:bg-tint transition-colors"
          >
            About the lab
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}


