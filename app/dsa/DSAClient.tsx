/**
 * DSAClient.tsx — DSA Stats page with hex grid (desktop)
 * and scrollable card list (mobile).
 *
 * Desktop: 3-row static grid (concepts | platforms | concepts).
 * Mobile:  Vertically scrollable glass cards, platforms first.
 */
'use client';

import { useIsMobile } from '@/hooks/useIsMobile';
import { useMounted } from '@/hooks/useMounted';
import DSAMobile from './DSAMobile';
import DSADesktop from './DSADesktop';

// ─── Constants ───────────────────────────────────────────────────────────────

export const DSA_CONCEPTS = [
  { title: 'Arrays', icon: '📊', description: 'Linear data structures', color: '#3498db' },
  { title: 'Linked Lists', icon: '🔗', description: 'Dynamic data structures', color: '#9b59b6' },
  { title: 'Stacks', icon: '📚', description: 'LIFO data structure', color: '#e74c3c' },
  { title: 'Queues', icon: '🚶', description: 'FIFO data structure', color: '#f39c12' },
  { title: 'Trees', icon: '🌳', description: 'Hierarchical structures', color: '#27ae60' },
  { title: 'Graphs', icon: '🕸️', description: 'Network structures', color: '#2c3e50' },
  { title: 'Hashing', icon: '#️⃣', description: 'Key-value mapping', color: '#8e44ad' },
  { title: 'Sorting', icon: '🔢', description: 'Ordering algorithms', color: '#d35400' },
  { title: 'Searching', icon: '🔍', description: 'Finding algorithms', color: '#16a085' },
  { title: 'Dynamic Programming', icon: '🧮', description: 'Optimization technique', color: '#c0392b' }
];

import type { DSAPlatform } from '@/types';

// ─── Component ───────────────────────────────────────────────────────────────

export default function DSAClient({ platforms }: { platforms: DSAPlatform[] }) {
  const mounted = useMounted();
  const isMobile = useIsMobile();

  if (!mounted) return null;

  if (isMobile) {
    return <DSAMobile platforms={platforms} />;
  }

  return <DSADesktop platforms={platforms} />;
}
