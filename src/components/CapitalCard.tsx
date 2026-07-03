import Link from "next/link";

// The name is preserved for import compatibility; the card now surfaces the
// community/Telegram entry point instead of the old capital cross-promo.
export function CapitalCard() {
  return (
    <section className="mt-16 sm:mt-20 border-t border-rule">
      <div className="mx-auto max-w-360 px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
        <div className="grid grid-cols-12 gap-6 md:gap-10 items-start">
          <div className="col-span-12 md:col-span-3">
            <div className="kicker">The community</div>
            <h2
              className="mt-3 font-display font-semibold tracking-tight leading-none sm:leading-[0.98]"
              style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.6rem)" }}
            >
              Join on <span className="text-accent">Telegram</span>
            </h2>
          </div>
          <div className="col-span-12 md:col-span-6 md:border-l md:border-rule md:pl-8 lg:pl-10">
            <p className="font-display italic text-ink leading-[1.55] text-[16px] sm:text-[18px] max-w-[55ch]">
              The site is the record. Telegram is the room.
            </p>
            <p className="mt-3 sm:mt-4 text-[14px] sm:text-[15px] leading-[1.7] text-ink-soft max-w-[60ch]">
              Day-to-day discussion, working groups, and research in progress
              happen on Telegram. Public channels are open to anyone. Private
              channels are gated behind an application, so contributors are
              vetted before they get the keys.
            </p>
          </div>
          <div className="col-span-12 md:col-span-3 md:border-l md:border-rule md:pl-8 lg:pl-10 flex flex-col gap-3 sm:gap-4">
            <span className="inline-block font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
              Public channel · open to all
            </span>
            <Link
              href="/about"
              className="inline-block link-underline font-mono text-[11px] uppercase tracking-[0.14em] text-accent hover:text-accent-deep transition-colors"
            >
              Apply to contribute →
            </Link>
            <a
              href="https://t.me/+xBmnL8ng85cyMDY1"
              target="_blank"
              rel="noreferrer"
              className="inline-block link-underline font-mono text-[11px] uppercase tracking-[0.14em] text-accent hover:text-accent-deep transition-colors"
            >
              Join the public channel →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
