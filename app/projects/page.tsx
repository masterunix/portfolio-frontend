import type { Metadata } from 'next';
import ProjectsClient from './ProjectsClient';
import { getProjects, getSkills } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Projects | Vatsal Goyal',
  description: 'Explore my portfolio of live projects — full-stack web apps, mobile apps, AI/ML work, and more.',
};

export default function ProjectsPage() {
  return <ProjectsClient projects={getProjects()} skills={getSkills()} />;
}
