import HexPage from '@/components/HexPage';
import Honeycomb from '@/components/Honeycomb';
import MobileList from '@/components/MobileList';
import { getDSAConcepts, getDSAPlatforms, getSite } from '@/lib/content';
import type { GridConfig } from '@/lib/hexLayout';
import { pageMetadata } from '@/lib/metadata';
import { conceptTile, platformTile } from '@/lib/tiles';

export const generateMetadata = () => pageMetadata('dsa');

const GRID: GridConfig = { rows: 3, cols: 5, gap: 20, scale: 4.27 };

export default function DSAPage() {
  const { title } = getSite().pages.dsa;
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
    <HexPage title={title} mobile={<MobileList title={title} sections={[{ tiles: platforms }]} />}>
      <Honeycomb grid={GRID} cells={cells} fill={false} />
    </HexPage>
  );
}
