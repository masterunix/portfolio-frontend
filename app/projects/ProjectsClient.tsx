/**
 * ProjectsClient.tsx — Projects page with infinite carousel (desktop)
 * and scrollable card list (mobile).
 *
 * Desktop: 3-row carousel (skills | projects | skills) auto-scrolling horizontally.
 * Mobile:  Vertically scrollable glass cards, one per project.
 */
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/useIsMobile';
import ProjectsMobile from './ProjectsMobile';
import ProjectsDesktop from './ProjectsDesktop';

import type { Project, Skill } from '@/types';

interface ProjectsClientProps {
  projects: Project[];
  skills: Skill[];
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProjectsClient({ projects = [], skills = [] }: ProjectsClientProps) {
  const [mounted, setMounted] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  if (isMobile) {
    return <ProjectsMobile projects={projects} />;
  }

  return <ProjectsDesktop projects={projects} skills={skills} />;
}
