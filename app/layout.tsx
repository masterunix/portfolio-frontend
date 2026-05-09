import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ShaderBackground from "@/components/ShaderBackground";
import GleckNoticeWrapper from "@/components/GleckNoticeWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Vatsal Goyal - Portfolio",
  description: "Full-stack developer, AI/ML enthusiast, and problem solver. Explore my projects, skills, and journey.",
  icons: {
    icon: "/website logo.png",
  },
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-black relative">
        <ShaderBackground />
        {/* Gleck mascot - persists across all pages */}
        <GleckNoticeWrapper />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
