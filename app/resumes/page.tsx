import ResumesClient from './ResumesClient';
import { getResumes } from '@/lib/api';

export default async function ResumesPage() {
  let resumes = [];
  
  try {
    resumes = await getResumes();
    if (!resumes || resumes.length === 0) {
      throw new Error('No resumes found in Strapi');
    }
  } catch (error) {
    console.warn('Failed to fetch resumes (Strapi might be down):', error);
    // Fallback to static data
    resumes = [
      { id: 1, domain: 'Basic Resume', description: 'General purpose', filename: 'Basic.pdf', color: '#667eea', icon: '📄', order: 0 },
      { id: 2, domain: 'Full Stack Developer', description: 'Frontend & Backend', filename: 'Full Stack.pdf', color: '#61dafb', icon: '💻', order: 1 },
      { id: 3, domain: 'Software Engineer', description: 'Core Engineering', filename: 'SDE.pdf', color: '#f39c12', icon: '⚙️', order: 2 },
      { id: 4, domain: 'ML Engineer', description: 'Machine Learning & AI', filename: 'ML: AI.pdf', color: '#e74c3c', icon: '🤖', order: 3 },
      { id: 5, domain: 'Mobile Developer', description: 'iOS & Android', filename: 'Mobile Developer.pdf', color: '#9b59b6', icon: '📱', order: 4 },
      { id: 6, domain: 'Embedded Systems', description: 'Hardware & Firmware', filename: 'Embedded Systems.pdf', color: '#16a085', icon: '🔌', order: 5 },
      { id: 7, domain: 'Quant Developer', description: 'Financial Engineering', filename: 'Quant Developer.pdf', color: '#27ae60', icon: '📈', order: 6 },
      { id: 8, domain: 'CyberSecurity', description: 'Security & Protection', filename: 'CyberSecurity.pdf', color: '#c0392b', icon: '🔒', order: 7 }
    ];
  }

  return <ResumesClient resumes={resumes} />;
}
