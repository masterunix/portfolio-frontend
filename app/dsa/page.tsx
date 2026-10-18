import type { Metadata } from 'next';

import HexPage from '@/components/HexPage';
import Honeycomb from '@/components/Honeycomb';
import MobileList from '@/components/MobileList';
import { getDSAConcepts, getDSAPlatforms } from '@/lib/content';
import type { GridConfig } from '@/lib/hexLayout';
import { conceptTile, platformTile } from '@/lib/tiles';

export const metadata: Metadata = {
  title: 'DSA Stats | Vatsal Goyal',
  description: 'My competitive programming profiles and data structures & algorithms achievements across Codeforces, LeetCode, and more.',
};

const GRID: GridConfig = { rows: 3, cols: 5, gap: 20, scale: 4.27 };

export default function DSAPage() {
  const platforms = getDSAPlatforms().map(platformTile);
  const concepts = getDSAConcepts().map(conceptTile);
  // Concepts fill the top row, then the bottom; platforms sit centred in the middle
  const firstPlatformCol = Math.max(0, Math.floor((GRID.cols - platforms.length) / 2));
  const cells = [
    ...concepts.slice(0, GRID.cols).map((tile, col) => ({ cell: [0, col] as const, tile })),
    ...platforms.slice(0, GRID.cols).map((tile, i) => ({ cell: [1, firstPlatformCol + i] as const, tile })),
    ...concepts.slice(GRID.cols, GRID.cols * 2).map((tile, col) => ({ cell: [2, col] as const, tile })),
  ];

  return (
    <HexPage title="DSA Stats" mobile={<MobileList title="DSA Stats" sections={[{ tiles: platforms }]} />}>
      <Honeycomb grid={GRID} cells={cells} fill={false} />
    </HexPage>
  );
}
