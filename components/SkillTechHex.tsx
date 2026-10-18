/**
 * SkillTechHex.tsx — Displays a technology/tool in a hexagonal tile.
 *
 * Pure content component — renders inside a parent <HexShell> or <Hexagon>.
 * Used in the Skills carousel (top and bottom rows).
 *
 * Shows the tech icon/logo, name, description, and proficiency level badge.
 * Shows the logo, or the icon when there is none.
 */
'use client';

import React from 'react';

import ItemIcon from '@/components/ItemIcon';
import type { TechSkill } from '@/types';

// ─── Proficiency Badge Config ────────────────────────────────────────────────

const PROFICIENCY_STYLES: Record<string, { bg: string; text: string; glow: string }> = {
  beginner:     { bg: 'rgba(251, 191, 36, 0.15)', text: '#fbbf24', glow: 'rgba(251, 191, 36, 0.3)' },
  intermediate: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', glow: 'rgba(59, 130, 246, 0.3)' },
  proficient:   { bg: 'rgba(52, 211, 153, 0.15)', text: '#34d399', glow: 'rgba(52, 211, 153, 0.3)' },
  expert:       { bg: 'rgba(192, 132, 252, 0.15)', text: '#c084fc', glow: 'rgba(192, 132, 252, 0.3)' },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function SkillTechHex({ tech }: { tech: TechSkill }) {
  const proficiency = tech.category?.toLowerCase();
  const badge = proficiency ? PROFICIENCY_STYLES[proficiency] : null;

  return (
    <div className="hex-content">
      {/* Tech Icon/Logo */}
      <div
        className="w-[45px] h-[45px] rounded-[12px] flex items-center justify-center text-xl shadow-lg transition-transform duration-300 group-hover:scale-110 shrink-0"
        style={{
          backgroundColor: tech.color,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
      >
        <ItemIcon logo={tech.logo} icon={<span>{tech.icon || '⚡'}</span>} alt={tech.name} size={25} />
      </div>

      {/* Tech Name */}
      <div className="text-[12px] font-bold text-white text-center mt-1 shrink-0">
        {tech.name}
      </div>

      {/* Description */}
      <div className="text-[9px] text-white/70 text-center leading-[1.2] shrink-0">
        {tech.description}
      </div>

      {/* Proficiency Badge */}
      {badge && proficiency && (
        <div
          className="mt-1 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 transition-all duration-300"
          style={{
            padding: '5px 14px',
            backgroundColor: badge.bg,
            color: badge.text,
            border: `1px solid ${badge.text}30`,
            boxShadow: `0 0 8px ${badge.glow}`,
            letterSpacing: '0.08em'
          }}
        >
          {proficiency}
        </div>
      )}
    </div>
  );
}
