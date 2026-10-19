/**
 * tiles.tsx — Every hexagon and mobile card shows a Tile: an icon, a title, a few
 * lines of text and some links. Pages turn their content into tiles here, on the
 * server, and HexTile / MobileCard draw them the same way everywhere.
 */
import type { ReactNode } from 'react';

import ItemIcon from '@/components/ItemIcon';
import { MENU_ICONS } from '@/lib/icons';
import type { DSAConcept, DSAPlatform, MenuItem, Project, Resume, Skill, SkillLevel } from '@/types';

export interface TileLink {
  label: string;
  href: string;
  /** Save the file under this name instead of opening it */
  download?: string;
  /** Open in a new tab even though it's on this site (files) */
  newTab?: boolean;
}

export interface Tile {
  key: string;
  title: string;
  /** The icon square's colour */
  color?: string;
  icon?: ReactNode;
  /** A short line under the title: tech stack, date, … */
  meta?: string;
  description?: string;
  badge?: { label: string; color: string };
  /** The whole tile is this link */
  link?: TileLink;
  /** Separate buttons, for tiles that aren't one link */
  actions?: TileLink[];
  /** A glow pulsing around the icon, to draw the eye (home.md `pulse: true`) */
  pulse?: boolean;
  /** Hex size: lg for the home menu, sm for the outer carousel rows */
  size?: 'lg' | 'md' | 'sm';
}

const icon = (logo: Project['logo'], fallback: string, alt: string) => (
  <ItemIcon logo={logo} fallback={fallback} alt={alt} />
);

/** A home menu tile (content/home.md) */
export function menuTile(item: MenuItem): Tile {
  return {
    key: item.href,
    title: item.title,
    description: item.description,
    color: item.color,
    icon: item.logo ? icon(item.logo, item.title.charAt(0), item.title) : (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={MENU_ICONS[item.icon!]} /></svg>
    ),
    link: { label: item.title, href: item.href },
    pulse: item.pulse,
    size: 'lg',
  };
}

export function projectTile(project: Project, size?: Tile['size']): Tile {
  return {
    key: `project-${project.slug}`,
    title: project.title,
    color: project.color,
    icon: icon(project.logo, project.icon ?? '📦', project.title),
    meta: project.tech,
    description: project.description,
    actions: [
      ...(project.github ? [{ label: 'GitHub', href: project.github }] : []),
      ...(project.visit ? [{ label: 'Visit', href: project.visit }] : []),
    ],
    size,
  };
}

const LEVEL_COLORS: Record<SkillLevel, string> = {
  beginner: '#fbbf24',
  intermediate: '#60a5fa',
  proficient: '#34d399',
  expert: '#c084fc',
};

export function skillTile(skill: Skill, size?: Tile['size']): Tile {
  return {
    key: `skill-${skill.slug}`,
    title: skill.title,
    color: skill.color,
    icon: icon(skill.logo, skill.icon ?? (skill.row === 'middle' ? '📦' : '⚡'), skill.title),
    description: skill.description,
    badge: skill.level && { label: skill.level, color: LEVEL_COLORS[skill.level] },
    // Small tiles (the outer carousel rows) have no room for buttons
    actions: size === 'sm' ? [] : skill.attachments.map((a) => ({ label: a.label, href: a.file.url, newTab: true })),
    size,
  };
}

export function platformTile(platform: DSAPlatform): Tile {
  return {
    key: `platform-${platform.slug}`,
    title: platform.title,
    color: platform.color,
    icon: icon(platform.logo, platform.title.charAt(0), platform.title),
    link: { label: 'View Profile', href: platform.url },
  };
}

export function conceptTile(concept: DSAConcept): Tile {
  return {
    key: `concept-${concept.title}`,
    title: concept.title,
    color: concept.color,
    icon: concept.icon,
    description: concept.description,
    size: 'sm',
  };
}

export function resumeTile(resume: Resume): Tile {
  return {
    key: `resume-${resume.slug}`,
    title: resume.title,
    color: resume.color,
    icon: resume.icon,
    description: resume.description,
    link: resume.file ? { label: 'Download', href: resume.file.url, download: resume.filename }
      : resume.link ? { label: 'Open', href: resume.link }
        : undefined,
  };
}
