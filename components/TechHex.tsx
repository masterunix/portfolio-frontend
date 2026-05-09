/**
 * TechHex.tsx — Displays a technology/skill inside a hexagonal tile.
 *
 * Used in the Projects carousel (top and bottom rows) to show
 * the tech stack alongside project tiles.
 *
 * Simpler than ProjectHex — no action buttons, just icon + name + description.
 */
'use client';

import React from 'react';
import { adjustColor } from '@/lib/utils';
import { HEX_SVG_PATH } from '@/lib/constants';

// ─── Props ───────────────────────────────────────────────────────────────────

interface TechHexProps {
  skill: {
    id: number;
    name: string;
    description: string;
    icon?: string;
    color: string;
    category?: string;
  };
  /** Disable hover transitions during exit animation */
  isExiting?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TechHex({ skill, isExiting = false }: TechHexProps) {
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
        {/* Tech Icon — gradient rounded square */}
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

        {/* Category Badge (optional) */}
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
