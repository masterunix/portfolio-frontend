import type { Metadata } from 'next';

import HexPage from '@/components/HexPage';
import Honeycomb from '@/components/Honeycomb';
import MobileList from '@/components/MobileList';
import { getPosts } from '@/lib/content';
import { WIDE_GRID } from '@/lib/hexLayout';
import { postTile, type Tile } from '@/lib/tiles';

export const metadata: Metadata = {
  title: 'Blog | Vatsal Goyal',
  description: 'Notes on what I build and learn: web development, AI/ML and problem solving.',
};

/**
 * Where posts go, newest first, filling outward from the centre: [1, 3] is dead
 * centre (odd rows sit half a hex right), the pair under it is centred too, and each
 * later pair widens the block evenly.
 */
const SLOTS = [
  [1, 3],
  [2, 3], [2, 4],
  [1, 2], [1, 4],
  [2, 2], [2, 5],
  [1, 1], [1, 5],
  [3, 2], [3, 3], [3, 4],
] as const;

const EMPTY = { title: 'No posts yet', description: 'The first one is on its way.' };

export default function BlogPage() {
  const posts = getPosts().map(postTile);
  const list = (wide: boolean) => <MobileList title="Blog" sections={[{ tiles: posts }]} empty={EMPTY} wide={wide} />;

  // More posts than the honeycomb holds: the list on every screen, so none is left out
  if (posts.length > SLOTS.length) return list(true);

  const emptyTile: Tile = { key: 'empty', ...EMPTY };
  const cells = posts.length
    ? posts.map((tile, i) => ({ cell: SLOTS[i], tile }))
    : [{ cell: SLOTS[0], tile: emptyTile }];

  return (
    <HexPage title="Blog" mobile={list(false)}>
      <Honeycomb grid={WIDE_GRID} cells={cells} />
    </HexPage>
  );
}
