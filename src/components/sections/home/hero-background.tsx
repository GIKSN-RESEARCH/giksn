"use client";

import dynamic from "next/dynamic";

const BinaryMultiplexer = dynamic(
  () => import("@/components/three/binary-multiplexer"),
  { ssr: false },
);

/**
 * Animation clipped to site gutters (matches navbar). A full-bleed base fill
 * using the platform background keeps the gutter strips matching the rest of
 * the site so the global grid reads uniform — only the animation is inset,
 * not the background.
 */
export function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-background" aria-hidden />
      <div className="site-gutter-clip absolute inset-0">
        <BinaryMultiplexer caption={null} className="size-full" />
      </div>
    </div>
  );
}