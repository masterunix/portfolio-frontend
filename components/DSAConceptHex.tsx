'use client';

import React from 'react';
import { adjustColor } from '@/lib/utils';

interface DSAConceptHexProps {
  concept: {
    title: string;
    icon: string;
    description: string;
    color: string;
  };
}

/**
 * DSAConceptHex — displays a DSA concept in a hexagonal tile.
 * 
 * Used for top and bottom rows to show data structures and algorithms.
 * Simpler than DSAPlatformHex - no buttons or interactions.
 */
export default function DSAConceptHex({ concept }: DSAConceptHexProps) {
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
          className="transition-all duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:fill-[rgba(255,255,255,0.1)] group-hover:stroke-[rgba(255,255,255,0.2)] "
        />
      </svg>

      {/* Content */}
      <div className="hex-content transition-transform duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ">
        {/* Concept Icon */}
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
