import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Masthead } from "@/components/Masthead";
import { CategoryNav } from "@/components/CategoryNav";
import { Footer } from "@/components/Footer";
import { CommentThread } from "@/components/CommentThread";
import { StatusPill } from "@/components/StatusPill";
import { KindBadge } from "@/components/KindBadge";
import { categoryByCode, formatDate, isUpdate, paperRef } from "@/lib/papers";
import { getPaperBySlugPublic, listPapersPublic } from "@/db/queries";
import { renderInline } from "@/lib/inlineMarkdown";
import { ProseBody } from "@/components/ProseBody";
import { parseContact } from "@/lib/contact";
import { CommentForm } from "./CommentForm";

export const revalidate = 60;

export default async function PaperPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const cat = categoryByCode(category);
  if (!cat) return notFound();

  // Fire both public reads in parallel; both come from the tagged cache.
  const [paper, sameCategory] = await Promise.all([
    getPaperBySlugPublic(cat.code, slug),
    listPapersPublic(cat.code),
  ]);
  if (!paper) return notFound();

  const replyCount = paper.discussion.reduce(
    (n, c) => n + 1 + (c.replies?.length ?? 0),
    0
  );
  const related = sameCategory
    .filter((p) => p.slug !== paper.slug)
    .slice(0, 4);

  const upMode = isUpdate(paper.category);

  return (
    <>
      <Masthead />
      <CategoryNav active={upMode ? "UPDATES" : cat.code} />
      <main className="w-full mx-auto max-w-360 px-4 sm:px-6 lg:px-10 pt-8 sm:pt-10 pb-12 sm:pb-16">
        {/* Breadcrumb */}
        <nav className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint mb-6 sm:mb-8 flex items-center gap-2 flex-wrap">
          <Link
            href={upMode ? "/updates" : "/"}
            className="link-underline"
          >
            {upMode ? "Updates" : "Papers"}
          </Link>
          <span>/</span>
          {upMode ? (
            <span className="text-ink">{paperRef(paper)}</span>
          ) : (
            <>
              <Link
                href={`/${cat.code.toLowerCase()}`}
                className="link-underline truncate max-w-[40ch]"
              >
                {cat.full}
              </Link>
              <span>/</span>
              <span className="text-ink">{paperRef(paper)}</span>
            </>
          )}
        </nav>

        <article className="grid grid-cols-12 gap-6 md:gap-10">
          {/* Title block */}
          <header className="col-span-12 pb-8 sm:pb-10 border-b border-rule">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5 flex-wrap">
              <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-accent">
                {paperRef(paper)}
              </span>
              {upMode ? (
                <>
                  {paper.source && (
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent border border-accent px-2 py-0.5">
                      {paper.source}
                    </span>
                  )}
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink border border-rule px-2 py-0.5">
                    Update
                  </span>
                </>
              ) : (
                <>
                  <KindBadge kind={paper.kind} size="md" />
                  <StatusPill status={paper.status} size="md" />
                </>
              )}
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
                {paper.readingMinutes} min read
              </span>
            </div>
            <h1
              className="font-display font-semibold text-ink leading-none sm:leading-[0.98] tracking-[-0.03em] sm:tracking-[-0.035em] max-w-[24ch] wrap-anywhere hyphens-auto"
              style={{ fontSize: "clamp(1.85rem, 5.6vw, 4.4rem)" }}
            >
              {paper.title}
            </h1>
            <p className="mt-5 sm:mt-7 max-w-[60ch] text-[16px] sm:text-[19px] leading-[1.55] text-ink-soft font-display italic wrap-anywhere">
              {renderInline(paper.abstract)}
            </p>
            <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
              <span>
                <span className="text-ink-soft">By</span>{" "}
                <span className="text-ink normal-case tracking-normal text-[13px] font-body">
                  {paper.author}
                </span>{" "}
                {(() => {
                  const c = parseContact(paper.authorHandle);
                  if (!c.handle) return null;
                  const display =
                    c.platform === "twitter" || c.platform === "telegram"
                      ? `@${c.handle}`
                      : c.handle;
                  return c.url ? (
                    <a
                      href={c.url}
                      target={c.platform === "email" ? undefined : "_blank"}
                      rel={c.platform === "email" ? undefined : "noreferrer"}
                      className="text-ink-faint hover:text-accent transition-colors"
                    >
                      {display}
                    </a>
                  ) : (
                    <span className="text-ink-faint">{display}</span>
                  );
                })()}
              </span>
              <span className="hidden sm:inline">·</span>
              <span>Posted {formatDate(paper.posted)}</span>
              <span className="hidden sm:inline">·</span>
              <span>Updated {formatDate(paper.updated)}</span>
            </div>
          </header>

          {/* Body + sidebar */}
          <div className="col-span-12 md:col-span-8 pt-8 md:pt-10">
            <div className="prose-body">
              <ProseBody sections={paper.body} />
            </div>
          </div>

          <aside className="col-span-12 md:col-span-4 pt-2 md:pt-10 md:border-l md:border-rule md:pl-8">
            <div className="kicker mb-3">Metadata</div>
            <dl className="font-mono text-[12px] space-y-2.5">
              <Meta term="Reference" value={paperRef(paper)} />
              <Meta term="Sector" value={cat.full} />
              {upMode ? (
                paper.source ? (
                  <Meta term="Source" value={paper.source} />
                ) : null
              ) : (
                <>
                  <Meta term="Kind" value={paper.kind} />
                  <Meta term="Category" value={paper.status} />
                </>
              )}
              <Meta term="Author" value={paper.author} />
              <Meta term="Contact" value={renderContactMeta(paper.authorHandle)} />
              <Meta term="Posted" value={formatDate(paper.posted)} />
              <Meta term="Last edit" value={formatDate(paper.updated)} />
              <Meta term="Replies" value={String(replyCount)} />
            </dl>
            <div className="mt-8 divider-dashed" />
            <div className="kicker mt-8 mb-3">
              {upMode ? "Cite this update" : "Cite this paper"}
            </div>
            <code className="block bg-tint p-3 text-[12px] leading-relaxed break-all">
              giksn.research/{cat.code.toLowerCase()}/{paper.slug}
            </code>
            <div className="kicker mt-8 mb-3">Filed under</div>
            <ul className="space-y-1.5">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/${r.category.toLowerCase()}/${r.slug}`}
                    className="text-[14px] link-underline"
                  >
                    <span className="font-mono text-[11px] text-accent uppercase tracking-[0.14em] mr-2">
                      {paperRef(r)}
                    </span>
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </article>

        {/* Discussion */}
        <section className="mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-rule">
          <div className="flex items-end justify-between mb-2 flex-wrap gap-3">
            <div>
              <div className="kicker mb-2">The conversation</div>
              <h2 className="headline text-[1.6rem] sm:text-[2rem] md:text-[2.4rem]">
                {replyCount === 0
                  ? "No replies yet"
                  : replyCount === 1
                    ? "One reply"
                    : `${replyCount} replies`}
              </h2>
            </div>
            <p className="font-display italic text-ink-soft text-[14px] sm:text-[15px] max-w-[42ch]">
              Read first, then reply. Disagreement is welcome.
              Performance isn&apos;t.
            </p>
          </div>

          <div className="mt-8">
            <CommentThread
              comments={paper.discussion}
              category={cat.code}
              slug={paper.slug}
            />
          </div>

          <CommentForm category={cat.code} slug={paper.slug} />
        </section>
      </main>
      <Footer />
    </>
  );
}

function renderContactMeta(stored: string): ReactNode {
  const c = parseContact(stored);
  if (!c.handle) return "—";
  const display =
    c.platform === "twitter" || c.platform === "telegram"
      ? `@${c.handle}`
      : c.handle;
  const platformLabel =
    c.platform === "twitter"
      ? "X"
      : c.platform === "telegram"
      ? "Telegram"
      : c.platform === "github"
      ? "GitHub"
      : c.platform === "email"
      ? "Email"
      : null;
  const inner = platformLabel ? (
    <>
      <span className="text-ink-faint mr-1.5 normal-case tracking-normal">
        {platformLabel}
      </span>
      {display}
    </>
  ) : (
    display
  );
  return c.url ? (
    <a
      href={c.url}
      target={c.platform === "email" ? undefined : "_blank"}
      rel={c.platform === "email" ? undefined : "noreferrer"}
      className="text-ink hover:text-accent transition-colors break-all"
    >
      {inner}
    </a>
  ) : (
    <span className="break-all">{inner}</span>
  );
}

function Meta({
  term,
  value,
}: {
  term: string;
  value: ReactNode;
}) {
  return (
    <div className="flex justify-between gap-3 border-b border-rule-soft pb-2.5">
      <dt className="text-ink-faint uppercase tracking-[0.12em]">{term}</dt>
      <dd className="text-ink text-right">{value}</dd>
    </div>
  );
}
