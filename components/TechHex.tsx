'use client';

import React from 'react';
import { adjustColor } from '@/lib/utils';

interface TechHexProps {
  skill: {
    id: number;
    name: string;
    description: string;
    icon?: string;
    color: string;
    category?: string;
  };
  /** Disable transitions during exit animation */
  isExiting?: boolean;
}

/**
 * TechHex — displays a technology/skill in a hexagonal tile.
 * Renders SVG hexagon background and content.
 * Wrapper with group class for hover effects.
 */
export default function TechHex({ skill, isExiting = false }: TechHexProps) {
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
          className={isExiting ? '' : 'transition-all duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:fill-[rgba(255,255,255,0.1)] group-hover:stroke-[rgba(255,255,255,0.2)] '}
        />
      </svg>

      {/* Content */}
      <div className="hex-content transition-transform duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ">
        {/* Tech Icon */}
        <div
          className="w-[45px] h-[45px] rounded-[12px] flex items-center justify-center text-xl shadow-lg transition-transform duration-300 group-hover:scale-110 shrink-0"
          style={{
            background: `linear-gradient(135deg, ${skill.color} 0%, ${adjustColor(skill.color, -20)} 100%)`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          {skill.icon || '⚙️'}
        </div>

        {/* Tech Title */}
        <div className="text-[12px] font-bold text-white text-center mt-1 shrink-0">
          {skill.name}
        </div>

        {/* Category Badge */}
        {skill.category && (
          <div className="text-[10px] text-white/80 text-center shrink-0 capitalize">
            {skill.category}
          </div>
        )}

        {/* Description */}
        <div className="text-[9px] text-white/60 text-center leading-[1.2] shrink-0">
          {skill.description}
        </div>
      </div>
    </div>
  );
}
