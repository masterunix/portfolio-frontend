import Carousel from '@/components/Carousel';
import HexPage from '@/components/HexPage';
import MobileList from '@/components/MobileList';
import { getProjects, getSite, getSkills } from '@/lib/content';
import { pageMetadata } from '@/lib/metadata';
import { projectTile, skillTile } from '@/lib/tiles';

export const generateMetadata = () => pageMetadata('projects');

export default function ProjectsPage() {
  const { title, hint } = getSite().pages.projects;
  const projects = getProjects().map((p) => projectTile(p));
  return (
    <HexPage title={title} mobile={<MobileList title={title} sections={[{ tiles: projects }]} />}>
      <Carousel
        main={projects}
        supporting={getSkills().map((s) => skillTile(s, 'sm'))}
        label="Projects"
        hint={hint ?? ''}
      />
    </HexPage>
  );
}
