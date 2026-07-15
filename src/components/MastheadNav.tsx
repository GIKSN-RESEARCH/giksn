"use client";

import { useEffect, useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { RINNE_SITE_URL } from "@/lib/products";

type NavItem = {
  href: string;
  label: string;
  external?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/about", label: "About" },
  { href: RINNE_SITE_URL, label: "Rinne", external: true },
  { href: "/submit", label: "Submit a paper" },
];

export function MastheadNav() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function close() {
    setOpen(false);
  }

  return (
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-10">
      <div className="relative z-50 grid grid-cols-3 items-center pt-3 pb-2 gap-3 px-4 sm:px-6 lg:px-10 text-[10px] sm:text-[11px] uppercase tracking-[0.14em] sm:tracking-[0.16em] text-ink-faint font-mono bg-paper">
        <span className="justify-self-start truncate min-w-0 hidden lg:block col-start-1">
          AI · Deeptech · Hardware · Distributed Systems
        </span>
        <Link
          href="/"
          aria-label="GIKSN Research home"
          className="inline-flex items-center justify-self-center col-start-2"
          onClick={close}
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
        <div className="justify-self-end col-start-3">
          <span className="hidden md:flex items-center gap-3 lg:gap-4">
            {NAV_ITEMS.map((item) =>
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline"
                >
                  {item.label === "Submit a paper" ? (
                    <>
                      <span className="hidden lg:inline">Submit a paper →</span>
                      <span className="lg:hidden">Submit →</span>
                    </>
                  ) : (
                    item.label
                  )}
                </a>
              ) : (
                <Link key={item.href} href={item.href} className="link-underline">
                  {item.label === "Submit a paper" ? (
                    <>
                      <span className="hidden lg:inline">Submit a paper →</span>
                      <span className="lg:hidden">Submit →</span>
                    </>
                  ) : (
                    item.label
                  )}
                </Link>
              )
            )}
          </span>
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 -mr-2 text-ink-faint hover:text-ink transition-colors relative z-50"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="flex flex-col justify-center gap-[5px] w-[18px]" aria-hidden>
              <span
                className={`block h-px w-full bg-current origin-center transition-transform duration-200 ${
                  open ? "translate-y-[6px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-px w-full bg-current transition-opacity duration-200 ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`block h-px w-full bg-current origin-center transition-transform duration-200 ${
                  open ? "-translate-y-[6px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <nav
          id={panelId}
          className="md:hidden fixed left-0 right-0 top-11 bottom-0 z-40 border-t border-rule bg-paper"
          style={{ minHeight: "calc(100dvh - 2.75rem)" }}
          aria-label="Site menu"
        >
          <ul className="flex flex-col">
            {NAV_ITEMS.map((item, i) => {
              const rowClass = [
                "block w-full py-3.5 px-4 sm:px-6 lg:px-10 text-[13px] font-mono uppercase tracking-[0.16em] transition-colors",
                i < NAV_ITEMS.length - 1 ? "border-b border-rule" : "",
                "text-ink-soft hover:text-accent",
              ].join(" ");

              return (
                <li key={item.href}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={rowClass}
                      onClick={close}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link href={item.href} className={rowClass} onClick={close}>
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}