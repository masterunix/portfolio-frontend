/**
 * ProjectHex.tsx — Displays a single project inside a hexagonal tile.
 *
 * Used in the Projects carousel (middle row). Renders its own hex shell
 * because CarouselHex wraps it directly (not via <Hexagon>).
 *
 * Features:
 * - Project icon or Strapi-hosted logo
 * - Title, tech stack, and description
 * - GitHub and Visit action buttons
 * - Hover effects via CSS `group` class
 */
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { adjustColor } from '@/lib/utils';
import { HEX_SVG_PATH } from '@/lib/constants';

// ─── Constants ───────────────────────────────────────────────────────────────

const STRAPI = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

/** Placeholder strings that indicate a link is not yet available */
const PLACEHOLDER_VALUES = ['Coming Soon', 'In Development', 'Private', 'Available on request', 'Will be deployed soon'];

// ─── Props ───────────────────────────────────────────────────────────────────

interface ProjectHexProps {
  project: {
    id: number;
    title: string;
    tech: string;
    description: string;
    icon?: string;
    logo?: { url: string };
    color: string;
    github?: string | null;
    visit?: string | null;
  };
  /** Disable hover transitions during exit animation */
  isExiting?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProjectHex({ project, isExiting = false }: ProjectHexProps) {
  const router = useRouter();

  /** Checks if a link value is a placeholder or missing */
  const isPrivateOrPlaceholder = (value: string | null | undefined): boolean => {
    if (!value) return true;
    return PLACEHOLDER_VALUES.includes(value);
  };

  const hasGithub = !isPrivateOrPlaceholder(project.github);
  const hasVisit = !isPrivateOrPlaceholder(project.visit);

  return (
    <div className="group relative w-full h-full">
      {/* Frosted glass blur layer */}
      <div className="hex-glass-blur" />

      {/* Hexagonal SVG outline */}
      <svg
        viewBox="0 0 190 212"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        <path
          d={HEX_SVG_PATH}
          fill="rgba(255,255,255,0.05)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
          className={isExiting ? '' : 'transition-all duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:fill-[rgba(255,255,255,0.1)] group-hover:stroke-[rgba(255,255,255,0.2)]'}
        />
      </svg>

      {/* Content */}
      <div className="hex-content">
        {/* Project Icon/Logo — gradient rounded square */}
        <div
          className="w-[50px] h-[50px] rounded-[12px] flex items-center justify-center text-2xl shadow-lg transition-transform duration-300 group-hover:scale-110 shrink-0"
          style={{
            background: `linear-gradient(135deg, ${project.color} 0%, ${adjustColor(project.color, -20)} 100%)`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          {project.logo?.url ? (
            <img
              src={`${STRAPI}${project.logo.url}`}
              alt={project.title}
              className="w-[30px] h-[30px] object-contain"
            />
          ) : (
            <span>{project.icon || '📦'}</span>
          )}
        </div>

        {/* Project Title */}
        <div className="text-[13px] font-bold text-white text-center mt-1 shrink-0">
          {project.title}
        </div>

        {/* Tech Stack */}
        <div className="text-[11px] text-white/90 text-center font-medium shrink-0">
          {project.tech}
        </div>

        {/* Description */}
        <div className="text-[9px] text-white/70 text-center leading-[1.3] max-w-[140px] shrink-0">
          {project.description}
        </div>

        {/* Action Buttons — GitHub and/or Visit links */}
        <div className="flex flex-col mt-2 shrink-0 w-full items-center" style={{ gap: '12px' }}>
          {hasGithub && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(project.github!, '_blank', 'noopener,noreferrer');
              }}
              className="hex-button"
              aria-label={`View ${project.title} on GitHub`}
            >
              GitHub
            </button>
          )}
          {hasVisit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const url = project.visit!;
                if (url.startsWith('/')) {
                  router.push(url);
                } else {
                  const fullUrl = url.startsWith('http') ? url : `https://${url}`;
                  window.open(fullUrl, '_blank', 'noopener,noreferrer');
                }
              }}
              className="hex-button"
              aria-label={`Visit ${project.title}`}
            >
              Visit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
