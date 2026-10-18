/**
 * TechHex.tsx — Displays a technology/skill inside a hexagonal tile.
 *
 * Pure content component — renders inside a parent <HexShell> or <Hexagon>.
 * Used in the Projects carousel (top and bottom rows).
 *
 * Simpler than ProjectHex — no action buttons, just logo/icon + name + description.
 */
'use client';

import React from 'react';

import ItemIcon from '@/components/ItemIcon';
import type { Media } from '@/types';

// ─── Props ───────────────────────────────────────────────────────────────────

interface TechHexProps {
  skill: {
    id: number;
    name: string;
    description: string;
    icon?: string;
    logo?: Media;
    color: string;
    category?: string;
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TechHex({ skill }: TechHexProps) {
  return (
    <div className="hex-content">
      {/* Tech Icon — gradient rounded square */}
      <div
        className="w-[45px] h-[45px] rounded-[12px] flex items-center justify-center text-xl shadow-lg transition-transform duration-300 group-hover:scale-110 shrink-0"
        style={{
          backgroundColor: skill.color,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
      >
        <ItemIcon logo={skill.logo} icon={skill.icon || '⚙️'} alt={skill.name} size={25} />
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
  );
}
