/**
 * DSAConceptHex.tsx — Displays a DSA concept in a hexagonal tile.
 *
 * Used on the DSA Stats page (top and bottom rows) to showcase
 * data structures and algorithms topics (Arrays, Trees, Graphs, etc.).
 *
 * Purely presentational — no buttons or interactions.
 * Simpler than DSAPlatformHex.
 */
'use client';

import React from 'react';
import { adjustColor } from '@/lib/utils';
import { HEX_SVG_PATH } from '@/lib/constants';

// ─── Props ───────────────────────────────────────────────────────────────────

interface DSAConceptHexProps {
  concept: {
    title: string;
    icon: string;
    description: string;
    color: string;
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function DSAConceptHex({ concept }: DSAConceptHexProps) {
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
          className="transition-all duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:fill-[rgba(255,255,255,0.1)] group-hover:stroke-[rgba(255,255,255,0.2)]"
        />
      </svg>

      {/* Content */}
      <div className="hex-content">
        {/* Concept Icon — gradient rounded square */}
        <div 
          className="w-[45px] h-[45px] rounded-[12px] flex items-center justify-center text-xl shadow-lg shrink-0 mb-1 transition-transform duration-300 group-hover:scale-110"
          style={{ 
            background: `linear-gradient(135deg, ${concept.color} 0%, ${adjustColor(concept.color, -20)} 100%)`,
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
    </div>
  );
}
