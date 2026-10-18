import Carousel from '@/components/Carousel';
import HexPage from '@/components/HexPage';
import MobileList from '@/components/MobileList';
import { getSite, getSkills } from '@/lib/content';
import { pageMetadata } from '@/lib/metadata';
import { skillTile } from '@/lib/tiles';

export const generateMetadata = () => pageMetadata('skills');

export default function SkillsPage() {
  const { title, hint } = getSite().pages.skills;
  const skills = getSkills();
  const experience = skills.filter((s) => s.row === 'middle').map((s) => skillTile(s));
  // Top-row skills first, then bottom-row ones
  const tech = [...skills.filter((s) => s.row === 'top'), ...skills.filter((s) => s.row === 'bottom')];

  return (
    <HexPage
      title={title}
      mobile={
        <MobileList sections={[
          { label: 'Experience', tiles: experience },
          { label: 'Skills', tiles: tech.map((s) => skillTile(s)) },
        ].filter((section) => section.tiles.length > 0)} />
      }
    >
      <Carousel
        main={experience}
        supporting={tech.map((s) => skillTile(s, 'sm'))}
        label="Experience"
        hint={hint ?? ''}
      />
    </HexPage>
  );
}
