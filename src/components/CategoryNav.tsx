"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORIES, PAPER_CATEGORIES } from "@/lib/papers";

type Props = {
  active?: string;
};

const SECTOR_CODES = ["AI", "DT", "HW", "DS"] as const;
type SectorCode = (typeof SECTOR_CODES)[number];

function isSectorCode(code: string): code is SectorCode {
  return (SECTOR_CODES as readonly string[]).includes(code);
}

// When one sector is hovered, its flex-grow rises to HOVER while the other
// three sectors evenly share the remaining budget so that the four sectors'
// total flex-grow stays at REST_TOTAL. That keeps the Papers section width
// visually constant (All + sectors + Archive all sum to the same fraction of
// the row). The natural flex behaviour also gives us the directional
// expansion the design asks for:
//   • AI (leftmost) growing pushes DT/HW/DS right; its left edge stays put
//     because "All" doesn't shrink. → expansion rightward.
//   • DS (rightmost) growing pushes AI/DT/HW left; its right edge stays
//     against Archive. → expansion leftward.
//   • DT and HW (middle) push siblings both ways symmetrically.
const REST_GROW = 1;
const HOVER_GROW = 2;
const OTHER_SECTORS_TOTAL = SECTOR_CODES.length - 1;
const REST_TOTAL = REST_GROW * SECTOR_CODES.length;
const OTHER_GROW_ON_HOVER =
  (REST_TOTAL - HOVER_GROW) / OTHER_SECTORS_TOTAL;

export function CategoryNav({ active }: Props) {
  const [hoveredSector, setHoveredSector] = useState<SectorCode | null>(null);

  const paperItems = [
    { code: "ALL", label: "All", full: null as string | null, href: "/" },
    ...CATEGORIES.filter((c) =>
      (PAPER_CATEGORIES as readonly string[]).includes(c.code)
    ).map((c) => ({
      code: c.code,
      label: c.label,
      full: c.full,
      href: `/${c.code.toLowerCase()}`,
    })),
    {
      code: "ARCHIVE",
      label: "Archive",
      full: null as string | null,
      href: "/archive",
    },
  ];

  const isProductsActive = active === "PRODUCTS";
  const isPapersActive = !isProductsActive;

  function flexGrowFor(code: string): number {
    if (!isSectorCode(code)) return REST_GROW;
    if (hoveredSector === null) return REST_GROW;
    if (hoveredSector === code) return HOVER_GROW;
    return OTHER_GROW_ON_HOVER;
  }

  return (
    <nav className="border-b border-rule bg-paper sticky top-0 z-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        {/* MOBILE — Top-level Papers / Products split */}
        <div className="md:hidden">
          <div className="grid grid-cols-2 border-t border-rule -mx-4 sm:-mx-6">
            <Link
              href="/"
              className={[
                "block py-3.5 text-center text-[13px] font-mono uppercase tracking-[0.16em] border-r border-rule transition-colors",
                isPapersActive
                  ? "text-accent bg-accent-wash"
                  : "text-ink-soft hover:text-ink hover:bg-tint",
              ].join(" ")}
              aria-current={isPapersActive ? "page" : undefined}
            >
              Papers
            </Link>
            <Link
              href="/products"
              className={[
                "block py-3.5 text-center text-[13px] font-mono uppercase tracking-[0.16em] transition-colors",
                isProductsActive
                  ? "text-accent bg-accent-wash"
                  : "text-ink-soft hover:text-ink hover:bg-tint",
              ].join(" ")}
              aria-current={isProductsActive ? "page" : undefined}
            >
              Products
            </Link>
          </div>
          {/* MOBILE — Sector pills, only when on the Papers side */}
          {isPapersActive && (
            <div className="border-t border-rule-soft -mx-4 sm:-mx-6">
              <div className="flex justify-center overflow-x-auto no-scrollbar">
                <ul className="flex items-stretch">
                  {paperItems.map((item, i) => {
                    const isActive =
                      (item.code === "ALL" && !active) || item.code === active;
                    const isLast = i === paperItems.length - 1;
                    return (
                      <li key={item.code} className="flex-shrink-0">
                        <Link
                          href={item.href}
                          className={[
                            "block py-2.5 px-2.5 text-center text-[10.5px] font-mono uppercase tracking-[0.12em] transition-colors whitespace-nowrap",
                            isLast ? "" : "border-r border-rule-soft",
                            isActive
                              ? "text-accent"
                              : "text-ink-soft hover:text-ink",
                          ].join(" ")}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* DESKTOP — Single-row with Papers/Products groups */}
        <div className="hidden md:block border-t border-rule">
          <div className="flex items-stretch">
            <ul className="flex items-stretch flex-1 overflow-hidden">
              <li className="flex-shrink-0 self-center pr-5 flex items-center">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                  Papers
                </span>
              </li>
              {paperItems.map((item, i) => {
                const isActive =
                  (item.code === "ALL" && !active) || item.code === active;
                const isLast = i === paperItems.length - 1;
                const sector = isSectorCode(item.code) ? item.code : null;
                const isHovered = sector !== null && hoveredSector === sector;
                return (
                  <li
                    key={item.code}
                    className="flex-1 min-w-0 overflow-hidden transition-[flex-grow] duration-300 ease-out"
                    style={{ flexGrow: flexGrowFor(item.code) }}
                    onMouseEnter={
                      sector ? () => setHoveredSector(sector) : undefined
                    }
                    onMouseLeave={
                      sector ? () => setHoveredSector(null) : undefined
                    }
                  >
                    <Link
                      href={item.href}
                      className={[
                        "relative block py-3.5 px-3 text-center text-sm font-mono uppercase tracking-[0.14em] transition-colors overflow-hidden",
                        isLast ? "" : "border-r border-rule",
                        isActive
                          ? "text-accent bg-accent-wash"
                          : "text-ink-soft hover:text-ink hover:bg-tint",
                      ].join(" ")}
                      aria-label={sector && item.full ? item.full : undefined}
                    >
                      <span
                        className={[
                          "block transition-opacity duration-200 whitespace-nowrap",
                          isHovered ? "opacity-0" : "opacity-100",
                        ].join(" ")}
                      >
                        {item.label}
                      </span>
                      {sector && item.full && (
                        <span
                          aria-hidden
                          className={[
                            "pointer-events-none absolute inset-0 flex items-center justify-center whitespace-nowrap px-2 transition-opacity",
                            isHovered
                              ? "opacity-100 duration-300 delay-100"
                              : "opacity-0 duration-150",
                          ].join(" ")}
                        >
                          {item.full}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="w-px bg-rule" />
            <ul className="flex items-stretch flex-shrink-0">
              <li className="flex-shrink-0 self-center px-5 flex items-center">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                  Products
                </span>
              </li>
              <li className="min-w-[100px] lg:min-w-[112px]">
                <Link
                  href="/products"
                  className={[
                    "block py-3.5 px-4 text-center text-sm font-mono uppercase tracking-[0.14em] transition-colors",
                    isProductsActive
                      ? "text-accent bg-accent-wash"
                      : "text-ink-soft hover:text-ink hover:bg-tint",
                  ].join(" ")}
                >
                  Products
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
