import Link from "next/link";

import { Masthead } from "@/components/Masthead";
import { CategoryNav } from "@/components/CategoryNav";
import { Footer } from "@/components/Footer";
import { PRODUCTS, type Product } from "@/lib/products";
import { categoryByCode } from "@/lib/papers";

export const dynamic = "force-static";

export default function ProductsPage() {
  return (
    <>
      <Masthead />
      <CategoryNav active="PRODUCTS" />
      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 pt-8 sm:pt-12 pb-12 sm:pb-16">
        <header className="pb-8 sm:pb-10 border-b border-rule">
          <div className="flex items-center gap-3 mb-3">
            <div className="kicker">The bench</div>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent border border-accent px-2 py-0.5">
              Products
            </span>
          </div>
          <h1
            className="font-display font-semibold text-ink leading-[1] sm:leading-[0.98] tracking-[-0.03em] sm:tracking-[-0.035em] max-w-[22ch]"
            style={{ fontSize: "clamp(2rem, 5.4vw, 4rem)" }}
          >
            Things the lab has <span className="text-accent">built</span>.
          </h1>
          <p className="mt-5 sm:mt-7 max-w-[60ch] text-[15px] sm:text-[18px] leading-[1.55] text-ink-soft font-display italic">
            The lab writes and the lab builds. Products are open source unless
            noted otherwise, live at their own URLs, and are argued for in a
            companion paper in the archive.
          </p>
        </header>

        <section className="pt-8 sm:pt-12">
          <div className="flex items-baseline justify-between gap-3 flex-wrap mb-6 sm:mb-8">
            <div className="kicker">
              {String(PRODUCTS.length).padStart(2, "0")} on the bench
            </div>
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
              Sorted by first release
            </div>
          </div>

          <ul className="space-y-10 sm:space-y-14">
            {PRODUCTS.map((p, i) => (
              <li key={p.slug}>
                <ProductBlock product={p} index={i} />
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}

function ProductBlock({ product, index }: { product: Product; index: number }) {
  const sector = categoryByCode(product.category);

  return (
    <article className="grid grid-cols-12 gap-6 md:gap-10 border border-rule bg-paper p-5 sm:p-8">
      <div className="col-span-12 md:col-span-4 min-w-0">
        <div className="flex items-baseline gap-3 mb-3 flex-wrap">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
            Product {String(index + 1).padStart(2, "0")}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint border border-rule px-2 py-0.5">
            {product.status}
          </span>
          {product.version && (
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              v{product.version}
            </span>
          )}
        </div>
        <h2
          className="font-display font-semibold text-ink leading-[1.02] tracking-[-0.03em]"
          style={{ fontSize: "clamp(1.8rem, 3.6vw, 2.8rem)" }}
        >
          {product.name}
        </h2>
        <p className="mt-3 font-display italic text-ink-soft text-[15px] sm:text-[17px] leading-[1.5] max-w-[36ch]">
          {product.tagline}
        </p>
        <dl className="mt-6 space-y-2.5 font-mono text-[11px] uppercase tracking-[0.14em]">
          <MetaRow term="Sector" value={sector ? sector.full : product.category} />
          <MetaRow term="License" value={product.license} />
          <MetaRow term="Status" value={product.status} />
          {product.version && (
            <MetaRow term="Version" value={`v${product.version}`} />
          )}
        </dl>
      </div>

      <div className="col-span-12 md:col-span-8 min-w-0 md:border-l md:border-rule md:pl-8">
        <p className="text-[15px] sm:text-[16px] leading-[1.65] text-ink-soft">
          {product.description}
        </p>

        <div className="mt-6">
          <div className="kicker mb-3">What it does</div>
          <ul className="space-y-2">
            {product.highlights.map((h, i) => (
              <li
                key={i}
                className="flex gap-3 text-[14px] sm:text-[15px] leading-[1.6] text-ink"
              >
                <span className="font-mono text-[11px] text-accent tracking-[0.16em] mt-1 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        {product.install && (
          <div className="mt-6">
            <div className="kicker mb-2">{product.install.label}</div>
            <code className="block bg-tint p-3 text-[12px] sm:text-[13px] leading-relaxed break-all font-mono">
              {product.install.command}
            </code>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-2 sm:gap-3">
          {product.paperRef && (
            <Link
              href={`/${product.paperRef.category.toLowerCase()}/${product.paperRef.slug}`}
              className="inline-flex items-center gap-2 border border-rule px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink hover:border-accent hover:text-accent transition-colors"
            >
              {product.paperRef.label} →
            </Link>
          )}
          {product.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
              className={
                link.primary
                  ? "inline-flex items-center gap-2 bg-accent text-paper px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] hover:bg-accent-deep transition-colors"
                  : "inline-flex items-center gap-2 border border-rule px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft hover:text-accent hover:border-accent transition-colors"
              }
            >
              {link.label} →
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}

function MetaRow({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-rule-soft pb-2">
      <dt className="text-ink-faint">{term}</dt>
      <dd className="text-ink text-right normal-case tracking-normal font-body text-[13px]">
        {value}
      </dd>
    </div>
  );
}
