/**
 * constants.tsx — Shared constants for the portfolio application.
 *
 * Contains:
 * - HEX_SVG_PATH: The master hexagonal SVG path used across all hex components
 * - navigationContent: Home page grid navigation items keyed by "row-col"
 * - skipList: Grid positions to leave empty on the home page
 */

import React from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

/** Shape of a navigation tile on the home page grid */
export interface NavigationItem {
  /** Display label shown inside the hex */
  text: string;
  /** Short subtitle below the label */
  description: string;
  /** SVG icon rendered inside the gradient box */
  svg: React.ReactNode;
  /** Gradient base color (hex string) */
  color: string;
  /** Route path or full URL to navigate to */
  href: string;
  /** If true, opens in a new tab instead of client-side routing */
  external: boolean;
}

// ─── Hexagon Geometry ────────────────────────────────────────────────────────

/**
 * Master SVG path for the rounded hexagon shape.
 * Used by every hex component (Hexagon, ProjectHex, TechHex, etc.)
 * to render the outline stroke and the backdrop-filter clip boundary.
 *
 * Changing this single constant updates the shape across the entire site.
 * Viewbox: 0 0 190 212
 */
export const HEX_SVG_PATH =
  'M85.5 3.63965C91.3786 0.245625 98.6214 0.245625 104.5 3.63965L178.896 46.5928C184.775 49.9868 188.396 56.2589 188.396 63.0469V148.953C188.396 155.741 184.775 162.013 178.896 165.407L104.5 208.36C98.805 211.648 91.8296 211.751 86.0547 208.669L85.5 208.36L11.1035 165.407C5.22494 162.013 1.60356 155.741 1.60352 148.953V63.0469C1.60356 56.2589 5.22493 49.9868 11.1035 46.5928L85.5 3.63965Z';

// ─── Navigation Grid ─────────────────────────────────────────────────────────

/**
 * Home page navigation content, keyed by grid position "row-col".
 * Only positions listed here get a clickable tile; all other positions
 * render as decorative empty hexagons.
 */
export const navigationContent: Record<string, NavigationItem> = {
  '1-1': {
    text: 'Summary',
    description: 'Who I am, in short',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    ),
    color: '#fd79a8',
    href: '/summary',
    external: false,
  },
  '1-2': {
    text: 'Github',
    description: 'View my code repositories',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
        <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
    color: '#333333',
    href: 'https://github.com/masterunix',
    external: true,
  },
  '1-3': {
    text: 'Live Projects',
    description: 'Explore my portfolio',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
        <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
      </svg>
    ),
    color: '#667eea',
    href: '/projects',
    external: false,
  },
  '1-4': {
    text: 'LinkedIn',
    description: 'Connect professionally',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    color: '#0077b5',
    href: 'https://www.linkedin.com/in/vatsal-goyal-05a896165',
    external: true,
  },
  '2-2': {
    text: 'Explore Resumes',
    description: 'Different resumes for different domains',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
      </svg>
    ),
    color: '#34a853',
    href: '/resumes',
    external: false,
  },
  '2-3': {
    text: 'Experience & Skills',
    description: 'My tech stack & career',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10Z"/>
      </svg>
    ),
    color: '#ff6b6b',
    href: '/skills',
    external: false,
  },
  '2-4': {
    text: 'DSA Stats',
    description: 'Coding achievements',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
        <path d="M22,21H2V3H4V19H6V10H10V19H12V6H16V19H18V14H22V21Z"/>
      </svg>
    ),
    color: '#4ecdc4',
    href: '/dsa',
    external: false,
  },
  '1-5': {
    text: 'Blog',
    description: 'Notes on what I build',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
      </svg>
    ),
    color: '#a29bfe',
    href: '/blog',
    external: false,
  },
  '2-5': {
    text: 'Mail Me!',
    description: "Let's get in touch",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
        <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"/>
      </svg>
    ),
    color: '#feca57',
    href: 'mailto:vatsalgoyal9999@gmail.com',
    external: true,
  },
};

// ─── Grid Configuration ──────────────────────────────────────────────────────

/**
 * Grid positions to skip (leave empty) on the home and resumes pages.
 * Format: [row, col] pairs. These positions render as transparent spacers
 * to create the organic, non-rectangular honeycomb boundary.
 */
export const skipList = [
  [0, 0], [2, 0], [0, 7], [2, 7],
  [1, 7], [3, 7]
];
