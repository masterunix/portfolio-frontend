/**
 * types/index.ts — Canonical type definitions for the portfolio application.
 *
 * All shared interfaces live here. Components import from '@/types'
 * instead of re-declaring their own copies.
 */

// ─── CMS Data Types ─────────────────────────────────────────────────────────

/** A project entry from Strapi */
export interface Project {
  id: number;
  title: string;
  tech: string;
  description: string;
  icon?: string;
  logo?: { url: string };
  color: string;
  github?: string | null;
  visit?: string | null;
  order: number;
}

/** A skill/experience entry from Strapi */
export interface Skill {
  id: number;
  name: string;
  description: string;
  type?: 'skills_top' | 'skills_bottom' | 'career';
  category?: string;
  color: string;
  icon?: string;
  logo?: { url: string };
  attachments?: Array<{
    id: number;
    label: string;
    file: { url: string };
  }>;
  order: number;
}

/** A lightweight tech skill (used in top/bottom carousel rows and fallback data) */
export interface TechSkill {
  name: string;
  description: string;
  icon?: string;
  color: string;
  logo?: { url: string };
  category?: string;
}

/** A resume entry from Strapi */
export interface Resume {
  id: number;
  domain: string;
  description: string;
  filename: string;
  color: string;
  icon: string;
  order: number;
  file?: { url: string; name: string };
}

/** A DSA platform entry from Strapi */
export interface DSAPlatform {
  id: number;
  name: string;
  url: string;
  color: string;
  logoPath?: string;
  logo?: { url: string };
  order: number;
}

/** A DSA concept (static data) */
export interface DSAConcept {
  title: string;
  icon: string;
  description: string;
  color: string;
}

/** A home page typewriter message from Strapi */
export interface HomeMessage {
  id: number;
  text: string;
  link?: string;
  order: number;
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
