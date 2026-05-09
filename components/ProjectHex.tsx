'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { adjustColor } from '@/lib/utils';

const STRAPI = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

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
  /** Disable transitions during exit animation */
  isExiting?: boolean;
}

/**
 * ProjectHex — displays a single project in a hexagonal tile.
 * Renders SVG hexagon background and content.
 * Wrapper with group class for hover effects.
 */
export default function ProjectHex({ project, isExiting = false }: ProjectHexProps) {
  const router = useRouter();
  const isPrivateOrPlaceholder = (value: string | null | undefined) => {
    if (!value) return true;
    const placeholders = ['Coming Soon', 'In Development', 'Private', 'Available on request', 'Will be deployed soon'];
    return placeholders.includes(value);
  };

  const hasGithub = !isPrivateOrPlaceholder(project.github);
  const hasVisit = !isPrivateOrPlaceholder(project.visit);

  return (
    <div className="group relative w-full h-full">
      {/* Hexagon SVG Background */}
      <div className="hex-glass-mask"><div className="hex-glass-blur" /></div>
      <svg
        viewBox="0 0 190 212"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        <path
          d="M85.5 3.63965C91.3786 0.245625 98.6214 0.245625 104.5 3.63965L178.896 46.5928C184.775 49.9868 188.396 56.2589 188.396 63.0469V148.953C188.396 155.741 184.775 162.013 178.896 165.407L104.5 208.36C98.805 211.648 91.8296 211.751 86.0547 208.669L85.5 208.36L11.1035 165.407C5.22494 162.013 1.60356 155.741 1.60352 148.953V63.0469C1.60356 56.2589 5.22493 49.9868 11.1035 46.5928L85.5 3.63965Z"
          fill="rgba(255,255,255,0.05)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
          className={isExiting ? '' : 'transition-all duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:fill-[rgba(255,255,255,0.1)] group-hover:stroke-[rgba(255,255,255,0.2)]'}
        />
      </svg>

      {/* Content */}
      <div className="hex-content">
        {/* Project Icon/Logo */}
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

        {/* Action Buttons */}
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
