import type { Metadata } from 'next';

import Carousel from '@/components/Carousel';
import HexPage from '@/components/HexPage';
import MobileList from '@/components/MobileList';
import { getSkills } from '@/lib/content';
import { skillTile } from '@/lib/tiles';

export const metadata: Metadata = {
  title: 'Experience & Skills | Vatsal Goyal',
  description: 'My tech stack, career experience, and professional skills — from React and Node.js to AI/ML.',
};

export default function SkillsPage() {
  const skills = getSkills();
  const career = skills.filter((s) => s.type === 'career').map((s) => skillTile(s));
  // Top-row skills first, then bottom-row ones
  const tech = [
    ...skills.filter((s) => s.type === 'skills_top'),
    ...skills.filter((s) => s.type === 'skills_bottom'),
  ];

  return (
    <HexPage
      title="Experience & Skills"
      mobile={
        <MobileList sections={[
          { label: 'Experience', tiles: career },
          { label: 'Skills', tiles: tech.map((s) => skillTile(s)) },
        ].filter((section) => section.tiles.length > 0)} />
      }
    >
      <Carousel
        main={career}
        supporting={tech.map((s) => skillTile(s, 'sm'))}
        label="Experience"
        hint="Use arrow keys to navigate experiences"
      />
    </HexPage>
  );
}
