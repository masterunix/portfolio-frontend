'use client';

import React from 'react';
import { adjustColor } from '@/lib/utils';

const STRAPI = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

interface CareerSkillHexProps {
  skill: {
    id: number;
    name: string;
    description: string;
    category?: string;
    color: string;
    icon?: string;
    logo?: { url: string };
    attachments?: Array<{
      id: number;
      label: string;
      file: { url: string };
    }>;
  };
  /** Disable transitions during exit animation */
  isExiting?: boolean;
}

/**
 * CareerSkillHex — displays a career/experience skill in a hexagonal tile.
 * 
 * Features:
 * - Icon or logo display
 * - Category badge
 * - Attachment buttons for certificates/documents
 * - Hover effects via group class
 */
export default function CareerSkillHex({ skill, isExiting = false }: CareerSkillHexProps) {
  return (
    <div className="group relative w-full h-full">
      {/* Hexagon SVG Background */}
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
        {/* Skill Icon/Logo */}
        <div
          className="w-[50px] h-[50px] rounded-[12px] flex items-center justify-center text-2xl shadow-lg transition-transform duration-300 group-hover:scale-110 shrink-0"
          style={{
            background: `linear-gradient(135deg, ${skill.color} 0%, ${adjustColor(skill.color, -20)} 100%)`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          {skill.logo?.url ? (
            <img
              src={`${STRAPI}${skill.logo.url}`}
              alt={skill.name}
              className="w-[30px] h-[30px] object-contain"
            />
          ) : (
            <span>{skill.icon || '📦'}</span>
          )}
        </div>

        {/* Skill Name */}
        <div className="text-[14px] font-bold text-white text-center mt-1 shrink-0">
          {skill.name}
        </div>

        {/* Description */}
        <div className="text-[11px] text-white/90 text-center leading-[1.4] max-h-[45px] overflow-hidden shrink-0 font-medium">
          {skill.description}
        </div>

        {/* Category Badge */}
        {skill.category && (
          <div className="text-[10px] text-white/70 text-center uppercase font-bold tracking-wider shrink-0">
            {skill.category}
          </div>
        )}

        {/* Attachment Buttons */}
        {skill.attachments && skill.attachments.length > 0 && (
          <div className="flex flex-col mt-2 w-full items-center shrink-0" style={{ gap: '12px' }}>
            {skill.attachments.map((attachment) => (
              attachment.file?.url && (
                <button
                  key={attachment.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`${STRAPI}${attachment.file.url}`, '_blank');
                  }}
                  className="text-[9px] font-semibold cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis transition-all duration-200 active:scale-95"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#000',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    maxWidth: '100px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                  }}
                  aria-label={`View ${attachment.label}`}
                >
                  {attachment.label}
                </button>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
