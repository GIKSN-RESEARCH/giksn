import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "@/lib/papers";
import { CapitalCard } from "./CapitalCard";

export function Footer() {
  return (
    <>
      <CapitalCard />
      <FooterInner />
    </>
  );
}

function FooterInner() {
  return (
    <footer className="border-t border-rule">
      <div className="border-t-[3px] border-accent" />
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-10 sm:py-12">
        <div className="grid grid-cols-12 gap-8 sm:gap-8">
          <div className="col-span-12 md:col-span-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3"
              aria-label="GIKSN Research home"
            >
              <Image
                src="/logo.png"
                alt="GIKSN"
                width={80}
                height={80}
                className="block h-10 w-10 sm:h-11 sm:w-11 object-contain"
              />
              <h3 className="font-blanka text-2xl leading-[0.95] text-ink">
                GIKSN <span className="text-accent">Research</span>
              </h3>
            </Link>
            <p className="mt-3 text-[14px] text-ink-soft max-w-[40ch] leading-relaxed">
              An independent research lab working on AI and memory. Papers,
              tools and reasoning shipped in the open. A community of
              researchers and builders takes shape alongside.
            </p>
          </div>
          <div className="col-span-12 md:col-span-3">
            <div className="kicker mb-3">Sectors</div>
            <ul className="space-y-1.5">
              {CATEGORIES.map((c) => (
                <li key={c.code}>
                  <Link
                    href={`/${c.code.toLowerCase()}`}
                    className="text-[14px] link-underline"
                  >
                    {c.full}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-12 md:col-span-3">
            <div className="kicker mb-3">Index</div>
            <ul className="space-y-1.5">
              <li>
                <Link href="/about" className="text-[14px] link-underline">
                  About the lab
                </Link>
              </li>
              <li>
                <Link href="/submit" className="text-[14px] link-underline">
                  Submit a paper
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-[14px] link-underline">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/" className="text-[14px] link-underline">
                  Latest activity
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-12 md:col-span-2">
            <div className="kicker mb-3">Terms &amp; Policies</div>
            <ul className="space-y-1.5">
              <li>
                <Link href="/privacy" className="text-[14px] link-underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-[14px] link-underline">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[14px] link-underline">
                  About the Lab
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 sm:mt-12 pt-6 border-t border-rule flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint text-center sm:text-left">
          <span>© {new Date().getFullYear()} GIKSN Research</span>
          <span className="tracking-[0.16em]">
            Frontier Research{" "}
            <span className="text-accent" aria-hidden>
              ·
            </span>{" "}
            Built in Public{" "}
            <span className="text-accent" aria-hidden>
              ·
            </span>{" "}
            Open Community
          </span>
        </div>
      </div>
    </footer>
  );
}
