/**
 * HexPage.tsx — The frame of every hex page.
 *
 * Narrow screens get `mobile` (server-rendered; CSS hides it on wide screens). Wide
 * screens get the hex layout passed as children, mounted in the browser since it's
 * sized from the window, under a header (the title and ← Back to Home, or a custom
 * heading) and above the footer.
 *
 * It owns the outro: following a link to another page here fades the header and
 * footer, plays the grid's exit wave, and navigates when the wave is done.
 */
'use client';

import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import Footer from '@/components/Footer';
import { PageTransitionContext, SmartLink } from '@/components/transition';
import { useIsDesktop } from '@/hooks/useIsDesktop';

interface HexPageProps {
  title?: string;
  /** Replaces the title and back link (the home page's typewriter) */
  heading?: ReactNode;
  mobile: ReactNode;
  children: ReactNode;
}

export default function HexPage({ title, heading, mobile, children }: HexPageProps) {
  const isDesktop = useIsDesktop();
  return (
    <>
      <div className="mobile-only">{mobile}</div>
      {isDesktop && (
        <DesktopFrame heading={heading ?? (
          <>
            <h1 className="hex-page-title">{title}</h1>
            <SmartLink href="/" className="back-button-glass">← Back to Home</SmartLink>
          </>
        )}>
          {children}
        </DesktopFrame>
      )}
    </>
  );
}

function DesktopFrame({ heading, children }: { heading: ReactNode; children: ReactNode }) {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);
  const exitMs = useRef(0);
  const leaving = useRef(false);

  const leave = useCallback((href: string) => {
    if (leaving.current) return;
    leaving.current = true;
    setIsExiting(true);
    setTimeout(() => router.push(href), exitMs.current);
  }, [router]);

  const transition = useMemo(() => ({
    isExiting,
    leave,
    setExitMs: (ms: number) => { exitMs.current = ms; },
  }), [isExiting, leave]);

  return (
    <PageTransitionContext value={transition}>
      <main className="hex-page" data-exiting={isExiting || undefined}>
        <header className="hex-page-header page-fade">{heading}</header>
        {children}
        <Footer className="hex-page-footer page-fade" />
      </main>
    </PageTransitionContext>
  );
}
