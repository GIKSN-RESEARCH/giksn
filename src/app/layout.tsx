import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";

import { Footer } from "@/components/layout/footer";
import { SiteGrid } from "@/components/layout/site-grid";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { SkipLink } from "@/components/layout/skip-link";
import { Toaster } from "@/components/ui/sonner";
import { spaceGrotesk } from "@/lib/fonts";
import { site } from "@/lib/site";

import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: site.name,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  metadataBase: new URL(site.url),
  icons: {
    icon: [
      {
        url: "/giksn-icon.svg?v=5",
        type: "image/svg+xml",
      },
      {
        url: "/favicon.png?v=5",
        type: "image/png",
        sizes: "32x32",
      },
    ],
    shortcut: "/favicon.png?v=5",
  },
  openGraph: {
    title: site.name,
    description: site.description,
    siteName: site.name,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${jetbrainsMono.variable} ${spaceGrotesk.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <SiteGrid />
        <SkipLink />
        <SiteNavbar />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}