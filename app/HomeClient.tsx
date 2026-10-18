/**
 * HomeClient.tsx — Home page with typewriter header and hexagonal nav grid.
 *
 * Desktop: Full-screen honeycomb grid (4 rows × 8 cols) with glass hexagons.
 * Mobile:  Vertically scrollable card list with glass effect.
 *
 * Navigation is handled by this component (not by NavHexagon) so that
 * exit animations can run before the route change occurs...
 */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useMounted } from '@/hooks/useMounted';
import { navigationContent } from '@/lib/constants';
import HomeMobile from './HomeMobile';
import HomeDesktop from './HomeDesktop';
import type { HomeMessage } from '@/types';

// ─── Component ──────────────────────────────────────────────────────────────

export default function HomeClient({ messages }: { messages: HomeMessage[] }) {
  const mounted = useMounted();
  const isMobile = useIsMobile();
  const router = useRouter();

  useEffect(() => {
    // Prefetch internal routes to make navigation instantaneous
    Object.values(navigationContent).forEach((nav) => {
      if (!nav.external && nav.href.startsWith('/')) {
        router.prefetch(nav.href);
      }
    });
  }, [router]);

  if (!mounted) return null;

  if (isMobile) {
    return <HomeMobile messages={messages} />;
  }

  return <HomeDesktop messages={messages} />;
}
