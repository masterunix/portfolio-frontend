/**
 * HomeClient.tsx — Home page with typewriter header and hexagonal nav grid.
 *
 * Desktop: Full-screen honeycomb grid (4 rows × 8 cols) with glass hexagons.
 * Mobile:  Vertically scrollable card list with glass effect.
 *
 * Navigation is handled by this component (not by NavHexagon) so that
 * exit animations can run before the route change occurs.
 */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import HomeMobile from './HomeMobile';
import HomeDesktop from './HomeDesktop';
import type { HomeMessage } from '@/types';

// ─── Component ───────────────────────────────────────────────────────────────

export default function HomeClient({ messages }: { messages: HomeMessage[] }) {
  const [mounted, setMounted] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isMobile) {
    return <HomeMobile messages={messages} />;
  }

  return <HomeDesktop messages={messages} />;
}
