import Image from "next/image";
import Link from "next/link";

export function Masthead() {
  return (
    <header className="border-b border-rule">
      <div className="border-t-[3px] border-accent" />
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-3 items-center pt-3 pb-2 gap-3 text-[10px] sm:text-[11px] uppercase tracking-[0.14em] sm:tracking-[0.16em] text-ink-faint font-mono">
          <span className="justify-self-start truncate min-w-0 hidden lg:block col-start-1">
            AI · Deeptech · Hardware · Distributed Systems
          </span>
          <Link
            href="/"
            aria-label="GIKSN Research home"
            className="inline-flex items-center justify-self-center col-start-2"
          >
            <Image
              src="/logo.png"
              alt=""
              aria-hidden
              width={28}
              height={28}
              priority
              className="block h-[22px] w-[22px] sm:h-[26px] sm:w-[26px] object-contain"
            />
          </Link>
          <span className="flex items-center gap-3 sm:gap-4 justify-self-end col-start-3">
            <Link href="/about" className="link-underline">
              About
            </Link>
            <Link href="/submit" className="link-underline">
              <span className="hidden sm:inline">Submit a paper →</span>
              <span className="sm:hidden">Submit →</span>
            </Link>
          </span>
        </div>
        <div className="divider-dashed" />
        <div className="flex flex-col items-center pt-5 pb-4 sm:pt-7 sm:pb-6 text-center">
          <Link href="/" className="block group">
            <h1
              className="font-blanka text-ink leading-[0.95] tracking-[-0.01em]"
              style={{ fontSize: "clamp(2.75rem, 9vw, 7rem)" }}
            >
              GIKSN <span className="text-accent">Research</span>
            </h1>
          </Link>
          <p className="mt-3 max-w-2xl font-display italic text-[14px] sm:text-[15px] md:text-base text-ink-soft px-2">
            A community-first research lab at the frontier of AI, Deeptech,
            Hardware, and Distributed Systems. We write, we build, we argue in
            the open.
          </p>
        </div>
      </div>
    </header>
  );
}
