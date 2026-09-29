import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HackTrack — track hackathons end to end",
  description:
    "Review, apply, attend, and record results, ranks, notes and learnings for every hackathon.",
  // PWA manifest wired in the PWA milestone (see docs/pwa-roadmap.md).
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "HackTrack" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#09090b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <AppHeader />
        <main className="mx-auto w-full max-w-2xl px-4 pb-24 pt-4 sm:pb-12 sm:pt-6">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
