/**
 * SkillsClient.tsx — Skills page with infinite carousel (desktop)
 * and scrollable card list (mobile).
 *
 * Desktop: 3-row carousel (tech | career | tech) auto-scrolling horizontally.
 * Mobile:  Vertically scrollable glass cards showing career skills with attachments.
 */
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import SkillsMobile from './SkillsMobile';
import SkillsDesktop from './SkillsDesktop';


// ─── Constants ───────────────────────────────────────────────────────────────

export const DEFAULT_TOP_SKILLS = [
  { name: 'JavaScript', description: 'Web development', icon: '⚡', color: '#f7df1e' },
  { name: 'HTML/CSS', description: 'Frontend markup & styling', icon: '🎨', color: '#e34f26' },
  { name: 'Express.js', description: 'Node.js web framework', icon: '🚀', color: '#000000' },
  { name: 'Dart', description: 'Flutter development', icon: '🎯', color: '#0175c2' },
  { name: 'Nginx', description: 'Reverse proxy server', icon: '🌐', color: '#009639' },
];

export const DEFAULT_BOTTOM_SKILLS = [
  { name: 'Ubuntu Server', description: 'Server operating system', icon: '🐧', color: '#e95420' },
  { name: 'GraphQL', description: 'API query language', icon: '📊', color: '#e10098' },
  { name: 'Redis', description: 'In-memory data store', icon: '🔴', color: '#dc382d' },
  { name: 'Kubernetes', description: 'Container orchestration', icon: '☸️', color: '#326ce5' },
  { name: 'Jenkins', description: 'Automation server', icon: '🔧', color: '#d24939' },
];

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Skill {
  id: number;
  name: string;
  description: string;
  type?: 'skills_top' | 'skills_bottom' | 'career';
  category?: string;
  color: string;
  icon?: string;
  logo?: { url: string };
  attachments?: Array<{ id: number; label: string; file: { url: string }; }>;
  order: number;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SkillsClient({ skills }: { skills: Skill[] }) {
  const [mounted, setMounted] = useState(false);
  const isMobile = useIsMobile();

  const careerSkills = useMemo(() => skills.filter(s => !s.type || s.type === 'career'), [skills]);
  const topSkills = useMemo(() => skills.filter(s => s.type === 'skills_top'), [skills]);
  const bottomSkills = useMemo(() => skills.filter(s => s.type === 'skills_bottom'), [skills]);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  if (isMobile) {
    return <SkillsMobile careerSkills={careerSkills} topSkills={topSkills} bottomSkills={bottomSkills} />;
  }

  return <SkillsDesktop careerSkills={careerSkills} topSkills={topSkills} bottomSkills={bottomSkills} />;
}
