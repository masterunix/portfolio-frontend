import type { Metadata } from 'next';

import Carousel from '@/components/Carousel';
import HexPage from '@/components/HexPage';
import MobileList from '@/components/MobileList';
import { getProjects, getSkills } from '@/lib/content';
import { projectTile, skillTile } from '@/lib/tiles';

export const metadata: Metadata = {
  title: 'Projects | Vatsal Goyal',
  description: 'Explore my portfolio of live projects — full-stack web apps, mobile apps, AI/ML work, and more.',
};

const TITLE = 'My Projects & Work';

export default function ProjectsPage() {
  const projects = getProjects().map((p) => projectTile(p));
  return (
    <HexPage title={TITLE} mobile={<MobileList title={TITLE} sections={[{ tiles: projects }]} />}>
      <Carousel
        main={projects}
        supporting={getSkills().map((s) => skillTile(s, 'sm'))}
        label="Projects"
        hint="Use arrow keys to control the projects carousel"
      />
    </HexPage>
  );
}
