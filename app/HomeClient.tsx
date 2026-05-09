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
import { useRouter } from 'next/navigation';
import NavHexagon from '@/components/NavHexagon';
import Hexagon from '@/components/Hexagon';
import { useTypewriter } from '@/hooks/useTypewriter';
import { useIsMobile } from '@/hooks/useIsMobile';
import { navigationContent, skipList, NavigationItem } from '@/lib/constants';
import { adjustColor } from '@/lib/utils';
import HomeMobile from './HomeMobile';
import HomeDesktop from './HomeDesktop';

// ─── Types ───────────────────────────────────────────────────────────────────

interface HomeMessage {
  id: number;
  text: string;
  link?: string;
  order: number;
}

interface GridItem {
  id: string;
  row: number;
  col: number;
  x: number;
  y: number;
  width: number;
  height: number;
  delay: number;
  /** Navigation data — undefined for empty/decorative hexagons */
  navData?: NavigationItem;
}

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
