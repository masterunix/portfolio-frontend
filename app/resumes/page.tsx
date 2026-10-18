import HexPage from '@/components/HexPage';
import Honeycomb from '@/components/Honeycomb';
import MobileList from '@/components/MobileList';
import { getResumes, getSite } from '@/lib/content';
import { WIDE_GRID } from '@/lib/hexLayout';
import { pageMetadata } from '@/lib/metadata';
import { resumeTile } from '@/lib/tiles';

export const generateMetadata = () => pageMetadata('resumes');

/** Where resumes go, in order */
const SLOTS = [
  [1, 1], [1, 2], [1, 3], [1, 4], [1, 5],
  [2, 2], [2, 3], [2, 4], [2, 5],
  [3, 2], [3, 3], [3, 4],
] as const;

export default function ResumesPage() {
  const { title } = getSite().pages.resumes;
  const resumes = getResumes().map(resumeTile);
  const cells = resumes.slice(0, SLOTS.length).map((tile, i) => ({ cell: SLOTS[i], tile }));
  return (
    <HexPage title={title} mobile={<MobileList title={title} sections={[{ tiles: resumes }]} />}>
      <Honeycomb grid={WIDE_GRID} cells={cells} />
    </HexPage>
  );
}
