'use client';

import React from 'react';
import { adjustColor } from '@/lib/utils';

const STRAPI = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

interface DSAPlatformHexProps {
  platform: {
    id: number;
    name: string;
    url: string;
    color: string;
    logoPath?: string;
    logo?: { url: string };
    category?: string;
    languages?: string;
  };
  onVisit: (e: React.MouseEvent) => void;
}

/**
 * DSAPlatformHex — displays a coding platform in a hexagonal tile.
 * 
 * Features:
 * - Platform logo
 * - Visit profile button
 * - Languages display
 * - Hover effects via group class
 */
export default function DSAPlatformHex({ platform, onVisit }: DSAPlatformHexProps) {
  const logoUrl = platform.logo?.url 
    ? `${STRAPI}${platform.logo.url}`
    : `/${platform.logoPath}`;

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
      <div className="hex-content pointer-events-auto transition-transform duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ">
        {/* Platform Logo */}
        <div 
          className="w-[50px] h-[50px] rounded-[12px] flex items-center justify-center shadow-lg shrink-0 mb-1 transition-transform duration-300 group-hover:scale-110"
          style={{ 
            background: `linear-gradient(135deg, ${platform.color} 0%, ${adjustColor(platform.color, -20)} 100%)`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          <img 
            src={logoUrl}
            alt={platform.name}
            className="w-[30px] h-[30px] object-contain brightness-110"
          />
        </div>

        {/* Platform Name */}
        <div className="text-[14px] font-bold text-white text-center leading-tight shrink-0">
          {platform.name}
        </div>

        {/* Category */}
        {platform.category && (
          <div className="text-[11px] text-white/90 font-medium text-center shrink-0 mt-0.5">
            {platform.category}
          </div>
        )}

        {/* Languages */}
        {platform.languages && (
          <div className="text-[9px] text-white/60 text-center mb-2 shrink-0">
            {platform.languages}
          </div>
        )}
        
        {/* Visit Button */}
        <button 
          className="text-[10px] font-semibold transition-all duration-200 active:scale-95 cursor-pointer mt-2 shrink-0"
          style={{ 
            background: 'rgba(255, 255, 255, 0.9)',
            color: '#000',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '6px',
            padding: '5px 10px',
            width: '85px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
          }}
          onClick={onVisit}
          aria-label={`Visit ${platform.name} profile`}
        >
          View Profile
        </button>
      </div>
    </div>
  );
}
