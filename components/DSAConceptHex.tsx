/**
 * DSAConceptHex.tsx — Displays a DSA concept in a hexagonal tile.
 *
 * Pure content component — renders inside a parent <Hexagon> (which provides the shell).
 * Used on the DSA Stats page (top and bottom rows).
 *
 * Purely presentational — no buttons or interactions.
 */
'use client';

import React from 'react';

import type { DSAConcept } from '@/types';

// ─── Component ───────────────────────────────────────────────────────────────

export default function DSAConceptHex({ concept }: { concept: DSAConcept }) {
  return (
    <div className="hex-content">
      {/* Concept Icon — gradient rounded square */}
      <div 
        className="w-[45px] h-[45px] rounded-[12px] flex items-center justify-center text-xl shadow-lg shrink-0 mb-1 transition-transform duration-300 group-hover:scale-110"
        style={{ 
          backgroundColor: concept.color,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
      >
        {concept.icon}
      </div>

      {/* Concept Title */}
      <div className="text-[13px] font-bold text-white text-center leading-tight shrink-0">
        {concept.title}
      </div>

      {/* Description */}
      <div className="text-[9px] text-white/70 text-center leading-tight max-w-[120px] shrink-0 mt-1">
        {concept.description}
      </div>
    </div>
  );
}
