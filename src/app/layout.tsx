import type { Metadata } from "next";
import { Space_Grotesk, Ubuntu } from "next/font/google";
import "./globals.css";
import { Analytics } from "@/components/Analytics";
import { ConsentBanner } from "@/components/ConsentBanner";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GIKSN Research — A community-first research lab at the frontier",
  description:
    "Open research and building across AI, Deeptech, Hardware, and Distributed Systems. Papers, surveys, projects, and lab updates from the GIKSN community.",
  icons: {
    icon: [{ url: "/1.png", type: "image/png" }],
    shortcut: "/1.png",
    apple: "/1.png",
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
      className={`${spaceGrotesk.variable} ${ubuntu.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        {children}
        <ConsentBanner />
        <Analytics />
      </body>
    </html>
  );
}
