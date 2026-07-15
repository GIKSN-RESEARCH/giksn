import Link from "next/link";

import { RINNE_SITE_URL, productBySlug } from "@/lib/products";

const TELEGRAM_URL = "https://t.me/+xBmnL8ng85cyMDY1";

export function CapitalCard() {
  const rinne = productBySlug("rinne");

  return (
    <section className="mt-16 sm:mt-20 border-t border-rule">
      <div className="mx-auto max-w-360 px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
        <h2
          className="font-blanka text-ink text-center leading-[0.95] tracking-[-0.01em] mb-8 sm:mb-10"
          style={{ fontSize: "clamp(1.75rem, 4.2vw, 3.25rem)" }}
        >
          The community <span className="text-accent">preneurs</span>
        </h2>

        <div className="grid grid-cols-12 gap-8 md:gap-0">
          {rinne && (
            <div className="col-span-12 md:col-span-6 md:px-8 lg:px-10 md:border-r md:border-rule flex flex-col items-center text-center">
              <div className="kicker mb-3">The product</div>
              <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                <h3 className="font-display font-semibold text-[1.35rem] sm:text-[1.5rem] tracking-[-0.02em] text-ink">
                  {rinne.name}
                </h3>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint border border-rule px-2 py-0.5">
                  {rinne.status}
                </span>
                {rinne.version && (
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                    v{rinne.version}
                  </span>
                )}
              </div>
              <p className="text-[14px] sm:text-[15px] leading-[1.7] text-ink-soft max-w-[52ch] mx-auto">
                {rinne.tagline} Plans work into a DAG, routes it across the
                harnesses and APIs already on your machine, then drives a
                generator-evaluator loop until the job is done.
              </p>
              <div className="mt-5 sm:mt-6 flex flex-col items-center gap-3">
                <a
                  href={RINNE_SITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block link-underline font-mono text-[11px] uppercase tracking-[0.14em] text-accent hover:text-accent-deep transition-colors"
                >
                  Open rinne.giksn.com →
                </a>
                <Link
                  href="/products"
                  className="inline-block link-underline font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint hover:text-accent transition-colors"
                >
                  Product details →
                </Link>
              </div>
            </div>
          )}

          <div
            className={`col-span-12 flex flex-col items-center text-center ${
              rinne ? "md:col-span-6 md:px-8 lg:px-10" : "md:col-span-12"
            }`}
          >
            <div className="kicker mb-3">The community</div>
            <h3 className="font-display font-semibold tracking-tight leading-[1.05] text-[1.35rem] sm:text-[1.5rem] mb-4">
              Join on <span className="text-accent">Telegram</span>
            </h3>
            <p className="text-[14px] sm:text-[15px] leading-[1.7] text-ink-soft max-w-[52ch] mx-auto">
              Day-to-day discussion, working groups and research in progress live
              here. Public channels are open to anyone. Private channels sit
              behind an application so contributors are vetted before they get
              the keys.
            </p>
            <div className="mt-5 sm:mt-6 flex flex-col items-center gap-3">
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-block link-underline font-mono text-[11px] uppercase tracking-[0.14em] text-accent hover:text-accent-deep transition-colors"
              >
                Join the public channel →
              </a>
              <Link
                href="/about"
                className="inline-block link-underline font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint hover:text-accent transition-colors"
              >
                Apply to contribute →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}