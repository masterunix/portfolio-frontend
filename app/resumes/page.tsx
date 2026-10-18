import type { Metadata } from 'next';

import HexPage from '@/components/HexPage';
import Honeycomb from '@/components/Honeycomb';
import MobileList from '@/components/MobileList';
import { getResumes } from '@/lib/content';
import { WIDE_GRID } from '@/lib/hexLayout';
import { resumeTile } from '@/lib/tiles';

export const metadata: Metadata = {
  title: 'Resumes | Vatsal Goyal',
  description: 'Download domain-specific resumes — full-stack, software engineering, ML, mobile, embedded, and more.',
};

/** Where resumes go, in order */
const SLOTS = [
  [1, 1], [1, 2], [1, 3], [1, 4], [1, 5],
  [2, 2], [2, 3], [2, 4], [2, 5],
  [3, 2], [3, 3], [3, 4],
] as const;

const TITLE = 'Explore Resumes';

export default function ResumesPage() {
  const resumes = getResumes().map(resumeTile);
  const cells = resumes.slice(0, SLOTS.length).map((tile, i) => ({ cell: SLOTS[i], tile }));
  return (
    <HexPage title={TITLE} mobile={<MobileList title={TITLE} sections={[{ tiles: resumes }]} />}>
      <Honeycomb grid={WIDE_GRID} cells={cells} />
    </HexPage>
  );
}
