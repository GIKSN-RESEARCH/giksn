import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Ubuntu } from "next/font/google";
import "./globals.css";
import { Analytics } from "@/components/Analytics";
import { ConsentBanner } from "@/components/ConsentBanner";

// Only the weights actually referenced across the codebase are loaded.
// A codebase scan shows 400 (default), 500 (font-medium) and 600
// (font-semibold) in use; nothing uses 300, 700 or 800.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "GIKSN Research — A community-first research lab at the frontier",
  description:
    "Open research and building across AI, Deeptech, Hardware, and Distributed Systems. Papers, surveys, projects, and lab updates from the GIKSN community.",
  // Favicon is auto-picked up from src/app/icon.png and apple-icon.png
  // (Next.js App Router convention). No manual `icons` field needed.
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${ubuntu.variable} h-full antialiased`}
    >
      <head>
        {/* Preload the display face used for the top wordmark so it is not
            waiting on a paint after fonts.css resolves. */}
        <link
          rel="preload"
          href="/fonts/Blanka-Regular.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
        {/* If analytics ever loads, warm the connection early. Consent-gated
            so the actual script is still deferred, but the TCP handshake
            plus TLS to Google's tag manager can start in parallel. */}
        <link
          rel="dns-prefetch"
          href="https://www.googletagmanager.com"
        />
      </head>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        {children}
        <ConsentBanner />
        <Analytics />
      </body>
    </html>
  );
}
