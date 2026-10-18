/**
 * types/index.ts — Canonical type definitions for the portfolio application.
 *
 * All shared interfaces live here. Components import from '@/types'
 * instead of re-declaring their own copies..
 */

// ─── Content Types (content/*.yaml, loaded by lib/content.ts) ───────────────

/** A file in public/, checked to exist when the content loads */
export interface Media {
  /** Site path, e.g. /media/logos/leetcode.png */
  url: string;
  /** The file's name, e.g. leetcode.png */
  name: string;
}

/** A project entry */
export interface Project {
  id: number;
  title: string;
  tech: string;
  description: string;
  icon?: string;
  logo?: Media;
  color: string;
  github?: string | null;
  visit?: string | null;
  order: number;
}

export type SkillType = 'skills_top' | 'skills_bottom' | 'career';
export type SkillCategory = 'beginner' | 'intermediate' | 'proficient' | 'expert';

/** A skill/experience entry */
export interface Skill {
  id: number;
  name: string;
  description: string;
  type: SkillType;
  category?: SkillCategory;
  color: string;
  icon?: string;
  logo?: Media;
  attachments: Array<{
    id: number;
    label: string;
    file: Media;
  }>;
  order: number;
}

/** A lightweight tech skill (used in top/bottom carousel rows) */
export interface TechSkill {
  name: string;
  description: string;
  icon?: string;
  color: string;
  logo?: Media;
  category?: string;
}

/** A resume entry: downloads `file`, or opens `link` when there is no file */
export interface Resume {
  id: number;
  domain: string;
  description: string;
  /** The name the download is saved as */
  filename?: string;
  color: string;
  icon: string;
  order: number;
  file?: Media;
  link?: string;
}

/** A DSA platform entry */
export interface DSAPlatform {
  id: number;
  name: string;
  url: string;
  color: string;
  logo?: Media;
  order: number;
}

/** A DSA concept (static data) */
export interface DSAConcept {
  title: string;
  icon: string;
  description: string;
  color: string;
}

/** A home page typewriter message */
export interface HomeMessage {
  id: number;
  text: string;
  link?: string;
  order: number;
}

/** A notice in the Gleck widget; `text` is HTML, sanitized before rendering */
export interface GleckNotice {
  id: number;
  text: string;
  link?: string;
  order: number;
}

/** The Gleck widget's "know more" link (content/settings/gleck.yaml) */
export interface GleckSettings {
  knowMoreLink: string;
  knowMoreText: string;
}

export type ThemePage = 'all' | 'home' | 'projects' | 'skills' | 'dsa' | 'resumes';

/** A background theme for the animated shader */
export interface BackgroundTheme {
  id: number;
  name: string;
  slug: string;
  enabled: boolean;
  isDefault: boolean;
  order: number;
  animationType: 'static' | 'shader-mesh' | 'shader-wave' | 'css-gradient';
  animationSpeed: number;
  grainIntensity: number;
  colorPalettes: Array<{
    id: number;
    page: ThemePage;
    colors: string[];
  }>;
}

/** Feedback tile data on the resumes page */
export interface FeedbackData {
  domain: string;
  description: string;
  email: string;
  color: string;
  icon: string;
}

/** Placeholder strings that indicate a link is not yet available */
export const PLACEHOLDER_VALUES = [
  'Coming Soon',
  'In Development',
  'Private',
  'Available on request',
  'Will be deployed soon'
] as const;

/** Checks if a link value is a placeholder or missing */
export function isPlaceholderLink(value: string | null | undefined): boolean {
  if (!value) return true;
  return (PLACEHOLDER_VALUES as readonly string[]).includes(value);
}
