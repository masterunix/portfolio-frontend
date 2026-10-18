/**
 * ProjectHex.tsx — Displays a single project inside a hexagonal tile.
 *
 * Pure content component — renders inside a parent <HexShell> or <Hexagon>.
 * The hex glass shell is NOT included here (see HexShell.tsx).
 *
 * Features:
 * - Project logo, or its icon when there is none
 * - Title, tech stack, and description
 * - GitHub and Visit action buttons
 * - Hover effects via CSS `group` class (provided by parent shell)
 */
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import ItemIcon from '@/components/ItemIcon';
import { isPlaceholderLink } from '@/types';
import type { Project } from '@/types';

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProjectHex({ project }: { project: Project }) {
  const router = useRouter();

  const hasGithub = !isPlaceholderLink(project.github);
  const hasVisit = !isPlaceholderLink(project.visit);

  return (
    <div className="hex-content">
      {/* Project Icon/Logo — gradient rounded square */}
      <div
        className="w-[50px] h-[50px] rounded-[12px] flex items-center justify-center text-2xl shadow-lg transition-transform duration-300 group-hover:scale-110 shrink-0"
        style={{
          backgroundColor: project.color,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
      >
        <ItemIcon logo={project.logo} icon={<span>{project.icon || '📦'}</span>} alt={project.title} size={30} />
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
  );
}
