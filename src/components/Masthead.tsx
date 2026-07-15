import Link from "next/link";

import { MastheadNav } from "@/components/MastheadNav";

export function Masthead() {
  return (
    <header className="border-b border-rule">
      <div className="border-t-[3px] border-accent" />
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <MastheadNav />
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
            An independent research lab working on AI and memory. Two
            things we&apos;re building at once. Memory that surfaces the
            right context to a model at agent speed. The model side of
            the problem where retrieval alone stops helping. A community
            of researchers and builders forms alongside.
          </p>
        </div>
      </div>
    </header>
  );
}