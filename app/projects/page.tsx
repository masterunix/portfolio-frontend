import ProjectsClient from './ProjectsClient';
import { getProjects, getSkills } from '@/lib/api';

export default async function ProjectsPage() {
  let projects = [];
  let skills = [];
  
  // Fetch projects
  try {
    projects = await getProjects();
    if (!projects || projects.length === 0) {
      throw new Error('No projects found in Strapi');
    }
  } catch (error) {
    console.warn('Failed to fetch projects (Strapi might be down):', error);
    // Fallback to static data if Strapi is not running
    projects = [
      { id: 1, title: 'Job Nest', tech: 'MERN Stack', description: 'A comprehensive platform for job seekers and employers with advanced matching algorithms', icon: '💼', color: '#667eea', github: 'https://github.com/masterunix/JobNest-v1', visit: 'Will be deployed soon', order: 0 },
      { id: 2, title: '450 House of Sourdough', tech: 'Modern Web Stack', description: 'Elegant website for artisanal sourdough bakery with e-commerce integration', icon: '🍞', color: '#d4a574', github: 'Available on request', visit: '450houseofsourdough.com', order: 1 },
      { id: 3, title: 'movie_fy', tech: 'Flutter, Dart', description: 'Feature-rich mobile app for movie enthusiasts with reviews and recommendations', icon: '🎬', color: '#e74c3c', github: 'https://github.com/masterunix/Fluttter-Movie-App', visit: null, order: 2 },
      { id: 4, title: 'Mobile Dev Project', tech: 'React Native', description: 'Cross-platform mobile application with native performance and modern UI', icon: '📱', color: '#61dafb', github: 'Coming Soon', visit: null, order: 3 },
      { id: 5, title: 'WalterWins', tech: 'Full Stack', description: 'In-progress online gaming platform with real-time multiplayer capabilities', icon: '🎮', color: '#9b59b6', github: 'In Development', visit: null, order: 4 },
      { id: 6, title: 'Personal DIY Server', tech: 'Ubuntu, Nginx', description: 'Custom-built server infrastructure from repurposed hardware with enterprise features', icon: '🖥️', color: '#34495e', github: 'Private', visit: 'Request Access', order: 5 },
      { id: 7, title: 'Jarvis 2.0', tech: 'AI/ML, Python', description: 'Advanced AI assistant with natural language processing and smart automation', icon: '🤖', color: '#f39c12', github: 'Coming Soon', visit: null, order: 6 },
      { id: 8, title: 'AI ML Project', tech: 'TensorFlow, PyTorch', description: 'Cutting-edge machine learning solution for data analysis and prediction', icon: '🧠', color: '#e67e22', github: 'In Development', visit: null, order: 7 },
      { id: 9, title: 'AI ML Project 2', tech: 'Deep Learning', description: 'Advanced neural network implementation for computer vision applications', icon: '👁️', color: '#3498db', github: 'Coming Soon', visit: null, order: 8 },
      { id: 10, title: 'Cyber Security Project', tech: 'Security Tools', description: 'Comprehensive cybersecurity solution with threat detection and prevention', icon: '🔒', color: '#e74c3c', github: 'Coming Soon', visit: null, order: 9 },
      { id: 11, title: 'DSA Stats', tech: 'Data Structures', description: 'Explore coding achievements and algorithm mastery statistics', icon: '📊', color: '#2ecc71', github: null, visit: '/dsa', order: 10 },
      { id: 12, title: 'Skills & Journey', tech: 'Career Path', description: 'Discover technical skills, experience timeline, and professional growth', icon: '🎯', color: '#9b59b6', github: null, visit: '/skills', order: 11 },
      { id: 13, title: 'Upcoming Project', tech: 'TBD', description: 'Exciting new project in planning phase with innovative features', icon: '🚀', color: '#95a5a6', github: 'Coming Soon', visit: null, order: 12 },
      { id: 14, title: 'Future Innovation', tech: 'Next-Gen Tech', description: 'Revolutionary project leveraging emerging technologies and modern frameworks', icon: '✨', color: '#f1c40f', github: 'Coming Soon', visit: null, order: 13 }
    ];
  }

  // Fetch skills
  try {
    skills = await getSkills();
    if (!skills || skills.length === 0) {
      throw new Error('No skills found in Strapi');
    }
  } catch (error) {
    console.warn('Failed to fetch skills (Strapi might be down):', error);
    // Fallback to static data
    skills = [
      { id: 1, name: 'React', description: 'Modern UI', color: '#61dafb', icon: '⚛️', order: 0 },
      { id: 2, name: 'Node.js', description: 'Backend', color: '#339933', icon: '🟢', order: 1 },
      { id: 3, name: 'Next.js', description: 'Framework', color: '#000000', icon: '▲', order: 2 },
      { id: 4, name: 'TypeScript', description: 'Type Safety', color: '#3178c6', icon: '📘', order: 3 },
      { id: 5, name: 'MongoDB', description: 'Database', color: '#47a248', icon: '🍃', order: 4 },
      { id: 6, name: 'Docker', description: 'DevOps', color: '#2496ed', icon: '🐳', order: 5 },
      { id: 7, name: 'Python', description: 'AI/ML', color: '#3776ab', icon: '🐍', order: 6 },
      { id: 8, name: 'Tailwind', description: 'Styling', color: '#06b6d4', icon: '🎨', order: 7 }
    ];
  }

  return <ProjectsClient projects={projects} skills={skills} />;
}

