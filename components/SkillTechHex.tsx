/**
 * SkillTechHex.tsx — Displays a technology/tool in a hexagonal tile.
 *
 * Used in the Skills carousel (top and bottom rows) to show
 * complementary tech skills alongside the career experience tiles.
 *
 * Simpler than CareerSkillHex — no attachments or category badges.
 * Supports both emoji icons and Strapi-hosted logos.
 */
'use client';

import React from 'react';
import { adjustColor } from '@/lib/utils';
import { HEX_SVG_PATH } from '@/lib/constants';

// ─── Constants ───────────────────────────────────────────────────────────────

const STRAPI = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// ─── Props ───────────────────────────────────────────────────────────────────

interface SkillTechHexProps {
  tech: {
    name: string;
    description: string;
    icon?: string;
    color: string;
    logo?: { url: string };
  };
  /** Disable hover transitions during exit animation */
  isExiting?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SkillTechHex({ tech, isExiting = false }: SkillTechHexProps) {
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
        {/* Tech Icon/Logo — gradient rounded square */}
        <div
          className="w-[45px] h-[45px] rounded-[12px] flex items-center justify-center text-xl shadow-lg transition-transform duration-300 group-hover:scale-110 shrink-0"
          style={{
            background: `linear-gradient(135deg, ${tech.color} 0%, ${adjustColor(tech.color, -20)} 100%)`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          {tech.logo?.url ? (
            <img
              src={`${STRAPI}${tech.logo.url}`}
              alt={tech.name}
              className="w-[25px] h-[25px] object-contain"
            />
          ) : (
            <span>{tech.icon || '⚡'}</span>
          )}
        </div>

        {/* Tech Name */}
        <div className="text-[12px] font-bold text-white text-center mt-1 shrink-0">
          {tech.name}
        </div>

        {/* Description */}
        <div className="text-[9px] text-white/70 text-center leading-[1.2] shrink-0">
          {tech.description}
        </div>
      </div>
    </div>
  );
}
