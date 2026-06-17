import Image from "next/image";

import giksnWordmark from "@/../public/GIKSN_v2.png";
import { HeroBackground } from "@/components/sections/home/hero-background";
import { spaceGrotesk } from "@/lib/fonts";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Hero — wordmark + intro copy over binary multiplexer canvas. */
export function Hero() {
  return (
    <section className="relative flex h-[calc(100dvh-4rem)] min-h-140 overflow-hidden ">
      <HeroBackground />

      <div
        className="site-gutter-clip pointer-events-none absolute inset-0 z-1 bg-linear-to-r from-background from-12% via-background/55 via-48% to-transparent "
        aria-hidden
      />

      <div
        className={cn(
          spaceGrotesk.className,
          "site-gutter-x relative z-10 flex h-full w-full items-center",
        )}
      >
        <div className="max-w-xl">
          <Image
            src={giksnWordmark}
            alt="GIKSN Research"
            width={giksnWordmark.width}
            height={giksnWordmark.height}
            priority
            sizes="(max-width: 768px) 70vw, 36rem"
            className="block h-[23dvh] max-h-[45%] w-auto brightness-0 invert"
            style={{ height: "23dvh", width: "auto", maxHeight: "45%" }}
          />

          <p className="mt-6 text-lg leading-snug text-foreground sm:mt-8 sm:text-xl sm:leading-relaxed">
            {site.tagline}
          </p>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {site.description}
          </p>
        </div>
      </div>
    </section>
  );
}