import type { Metadata } from 'next';
import SkillsClient from './SkillsClient';
import { getSkills } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Experience & Skills | Vatsal Goyal',
  description: 'My tech stack, career experience, and professional skills — from React and Node.js to AI/ML.',
};

export default function SkillsPage() {
  return <SkillsClient skills={getSkills()} />;
}
