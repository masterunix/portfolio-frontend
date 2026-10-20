/**
 * GlassArticle.tsx: A readable glass panel over the animated background, for pages
 * that are mostly text (blog posts, the summary).
 *
 * The panel fades up on arrival, and the back link fades it back down before
 * navigating, matching the hex pages' outros. On phones, once the back link has
 * scrolled out of view, a copy of it floats at the top left, so a long page never
 * needs scrolling back up to leave. Only this frame runs in the browser:
 * the page passes its content in as children, which stay server-rendered.
 */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import BackArrow from '@/components/BackArrow';
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
  const [scrolledPast, setScrolledPast] = useState(false);
  const backRef = useRef<HTMLAnchorElement>(null);

  // The floating copy shows while the back link at the top is out of view
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setScrolledPast(!entry.isIntersecting));
    observer.observe(backRef.current!);
    return () => observer.disconnect();
  }, []);

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsExiting(true);
    setTimeout(() => router.push(back.href), EXIT_MS);
  };

  return (
    <main className="article-page">
      <article className={`glass-article ${isExiting ? 'is-exiting' : ''}`}>
        <Link ref={backRef} href={back.href} onClick={handleBack} className="article-back"><BackArrow />{back.label}</Link>
        {children}
      </article>
      <Link href={back.href} onClick={handleBack} className="article-back article-back-float"
        data-shown={scrolledPast && !isExiting} inert={!scrolledPast} aria-hidden={!scrolledPast}>
        <BackArrow />{back.label}
      </Link>
      <Footer className="article-footer" />
    </main>
  );
}
