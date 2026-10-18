/**
 * CareerSkillHex.tsx — Displays a career/experience skill in a hexagonal tile.
 *
 * Pure content component — renders inside a parent <HexShell> or <Hexagon>.
 * Used in the Skills carousel (middle row).
 *
 * Features:
 * - Logo, or its icon when there is none
 * - Name, description, and category badge
 * - Attachment buttons for certificates/documents
 * - Hover effects via CSS `group` class (provided by parent shell)
 */
'use client';

import React from 'react';

import ItemIcon from '@/components/ItemIcon';
import type { Skill } from '@/types';

// ─── Component ───────────────────────────────────────────────────────────────

export default function CareerSkillHex({ skill }: { skill: Skill }) {
  return (
    <div className="hex-content">
      {/* Skill Icon/Logo — gradient rounded square */}
      <div
        className="w-[50px] h-[50px] rounded-[12px] flex items-center justify-center text-2xl shadow-lg transition-transform duration-300 group-hover:scale-110 shrink-0"
        style={{
          backgroundColor: skill.color,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
      >
        <ItemIcon logo={skill.logo} icon={<span>{skill.icon || '📦'}</span>} alt={skill.name} size={30} />
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

      {/* Attachment Buttons — certificates/documents */}
      {skill.attachments.length > 0 && (
        <div className="flex flex-col mt-2 w-full items-center shrink-0" style={{ gap: '12px' }}>
          {skill.attachments
            .map((attachment) => (
              <button
                key={attachment.id}
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(attachment.file.url, '_blank');
                }}
                className="hex-button max-w-[100px] truncate"
                aria-label={`View ${attachment.label}`}
              >
                {attachment.label}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
