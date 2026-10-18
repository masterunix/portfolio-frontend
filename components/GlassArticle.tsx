/**
 * GlassArticle.tsx — A readable glass panel over the animated background, for pages
 * that are mostly text (blog posts, the summary).
 *
 * The panel fades up on arrival, and the back link fades it back down before
 * navigating, matching the hex pages' outros. Only this frame runs in the browser:
 * the page passes its content in as children, which stay server-rendered.
 */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import Footer from '@/components/Footer';

/** Matches the panel's fade-out in globals.css (.glass-article.is-exiting) */
const EXIT_MS = 250;

interface GlassArticleProps {
  back: { href: string; label: string };
  children: React.ReactNode;
}

export default function GlassArticle({ back, children }: GlassArticleProps) {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsExiting(true);
    setTimeout(() => router.push(back.href), EXIT_MS);
  };

  return (
    <main className="article-page">
      <article className={`glass-article ${isExiting ? 'is-exiting' : ''}`}>
        <Link href={back.href} onClick={handleBack} className="article-back">← {back.label}</Link>
        {children}
      </article>
      <Footer className="article-footer" />
    </main>
  );
}
