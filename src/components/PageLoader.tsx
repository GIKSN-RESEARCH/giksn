import Image from "next/image";
import { Masthead } from "@/components/Masthead";
import { CategoryNav } from "@/components/CategoryNav";
import { Footer } from "@/components/Footer";

/**
 * Editorial page loader used by every `loading.tsx` boundary. Preserves
 * Masthead + CategoryNav + Footer for chrome continuity across navigation,
 * and centres a graphical loader: the GIKSN mark with a hairline accent arc
 * rotating around it.
 */
export function PageLoader() {
  return (
    <>
      <Masthead />
      <CategoryNav />
      <main
        role="status"
        aria-live="polite"
        aria-busy="true"
        className="flex-1 flex items-center justify-center px-4 py-24 sm:py-32"
      >
        <div className="relative inline-flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32">
          <svg
            className="absolute inset-0 w-full h-full animate-giksn-spin"
            viewBox="0 0 100 100"
            fill="none"
            aria-hidden
          >
            <circle
              cx="50"
              cy="50"
              r="46"
              stroke="var(--rule)"
              strokeWidth="2"
            />
            <circle
              cx="50"
              cy="50"
              r="46"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="34 255"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <Image
            src="/logo.png"
            alt=""
            aria-hidden
            width={96}
            height={96}
            priority
            className="relative w-14 h-14 sm:w-16 sm:h-16 object-contain animate-giksn-breathe"
          />
        </div>
        <span className="sr-only">Loading page.</span>
      </main>
      <Footer />
    </>
  );
}
