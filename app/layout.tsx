/**
 * layout.tsx — Root layout for the portfolio application.
 *
 * Renders the persistent elements that appear on every page:
 * 1. Inter font loaded via next/font (prevents FOUT)
 * 2. ShaderBackground — full-screen WebGL animated gradient
 * 3. GleckNoticeWrapper — AI assistant notification widget (bottom-left)
 * 4. Children — the page-specific content, rendered above the background
 *
 * Uses Next.js App Router conventions:
 * - `metadata` export for SEO (title, description, icons)
 * - `viewport` export for mobile-specific meta tags
 */

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ShaderBackground from "@/components/ShaderBackground";
import GleckNoticeWrapper from "@/components/GleckNoticeWrapper";

// ─── Font ────────────────────────────────────────────────────────────────────

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// ─── Metadata & Viewport ────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Vatsal Goyal - Portfolio",
  description: "Full-stack developer, AI/ML enthusiast, and problem solver. Explore my projects, skills, and journey.",
  icons: {
    icon: "/website logo.png",
  },
};

/** Separate viewport export — Next.js 14+ best practice (replaces themeColor in metadata) */
export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// ─── Layout ──────────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-black relative">
        {/* WebGL animated gradient — renders behind everything */}
        <ShaderBackground />
        {/* Gleck AI mascot — persists across all pages */}
        <GleckNoticeWrapper />
        {/* Page content — rendered above the background */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
