/**
 * CareerSkillHex.tsx — Displays a career/experience skill in a hexagonal tile.
 *
 * Used in the Skills carousel (middle row). Shows the user's professional
 * experience items with optional Strapi-hosted logo and downloadable
 * attachment buttons (certificates, documents).
 *
 * Features:
 * - Icon or Strapi-hosted logo display
 * - Name, description, and category badge
 * - Attachment buttons for certificates/documents (from Strapi)
 * - Hover effects via CSS `group` class
 */
'use client';

import React from 'react';
import { adjustColor } from '@/lib/utils';
import { HEX_SVG_PATH } from '@/lib/constants';

// ─── Constants ───────────────────────────────────────────────────────────────

const STRAPI = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// ─── Props ───────────────────────────────────────────────────────────────────

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
  /** Disable hover transitions during exit animation */
  isExiting?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CareerSkillHex({ skill, isExiting = false }: CareerSkillHexProps) {
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
        {/* Skill Icon/Logo — gradient rounded square */}
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

        {/* Description — clamped to 3 lines via max-h + overflow */}
        <div className="text-[11px] text-white/90 text-center leading-[1.4] max-h-[45px] overflow-hidden shrink-0 font-medium">
          {skill.description}
        </div>

        {/* Category Badge (optional) */}
        {skill.category && (
          <div className="text-[10px] text-white/70 text-center uppercase font-bold tracking-wider shrink-0">
            {skill.category}
          </div>
        )}

        {/* Attachment Buttons — certificates/documents from Strapi */}
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
                  className="hex-button max-w-[100px] truncate"
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
