/**
 * SkillsClient.tsx — Skills page with infinite carousel (desktop)
 * and scrollable card list (mobile).
 *
 * Desktop: 3-row carousel (tech | career | tech) auto-scrolling horizontally.
 * Mobile:  Vertically scrollable glass cards showing career skills with attachments.
 */
'use client';

import { useMemo } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useMounted } from '@/hooks/useMounted';
import SkillsMobile from './SkillsMobile';
import SkillsDesktop from './SkillsDesktop';


import type { Skill } from '@/types';

// ─── Component ───────────────────────────────────────────────────────────────

export default function SkillsClient({ skills }: { skills: Skill[] }) {
  const mounted = useMounted();
  const isMobile = useIsMobile();

  const careerSkills = useMemo(() => skills.filter(s => !s.type || s.type === 'career'), [skills]);
  const topSkills = useMemo(() => skills.filter(s => s.type === 'skills_top'), [skills]);
  const bottomSkills = useMemo(() => skills.filter(s => s.type === 'skills_bottom'), [skills]);

  if (!mounted) return null;

  if (isMobile) {
    return <SkillsMobile careerSkills={careerSkills} topSkills={topSkills} bottomSkills={bottomSkills} />;
  }

  // Combine top and bottom for desktop
  const techSkills = [...topSkills, ...bottomSkills];

  return <SkillsDesktop careerSkills={careerSkills} techSkills={techSkills} />;
}
