import type { Metadata } from 'next';
import SkillsClient from './SkillsClient';
import { getSkills } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Experience & Skills | Vatsal Goyal',
  description: 'My tech stack, career experience, and professional skills — from React and Node.js to AI/ML.',
};

export default async function SkillsPage() {
  let skills = [];
  
  try {
    skills = await getSkills();
    if (!skills || skills.length === 0) {
      throw new Error('No skills found in Strapi');
    }
  } catch (error) {
    console.warn('Failed to fetch skills data (Strapi might be down):', error);
    // Fallback to static data
    skills = [
      { id: 1, name: 'React Development', description: 'Built multiple React applications', type: 'career', category: 'proficient', color: '#61dafb', icon: '⚛️', attachmentLabel: 'View Certificate', order: 0 },
      { id: 2, name: 'Node.js Backend', description: 'Developed REST APIs', type: 'career', category: 'proficient', color: '#339933', icon: '🟢', attachmentLabel: 'View Projects', order: 1 },
      { id: 3, name: 'Python Programming', description: 'Data analysis and automation', type: 'career', category: 'intermediate', color: '#3776ab', icon: '🐍', order: 2 },
      { id: 4, name: 'TypeScript', description: 'Type-safe development', type: 'career', category: 'proficient', color: '#3178c6', icon: '📘', order: 3 },
      { id: 5, name: 'MongoDB', description: 'Database design', type: 'career', category: 'intermediate', color: '#47a248', icon: '🍃', order: 4 },
      { id: 6, name: 'Docker', description: 'Containerization', type: 'career', category: 'intermediate', color: '#2496ed', icon: '🐳', order: 5 },
      { id: 7, name: 'AWS', description: 'Cloud platform services', type: 'career', category: 'beginner', color: '#ff9900', icon: '☁️', order: 6 },
      { id: 8, name: 'PostgreSQL', description: 'Relational database', type: 'career', category: 'intermediate', color: '#336791', icon: '🐘', order: 7 },
      { id: 9, name: 'Git & GitHub', description: 'Version control', type: 'career', category: 'expert', color: '#f05032', icon: '📦', order: 8 },
      { id: 10, name: 'Next.js', description: 'Full-stack framework', type: 'career', category: 'proficient', color: '#000000', icon: '▲', order: 9 },
      { id: 11, name: 'Flutter', description: 'Mobile app development', type: 'career', category: 'intermediate', color: '#02569b', icon: '📱', order: 10 },
      { id: 12, name: 'TensorFlow', description: 'Machine learning', type: 'career', category: 'beginner', color: '#ff6f00', icon: '🧠', order: 11 }
    ];
  }

  return <SkillsClient skills={skills} />;
}
