/**
 * DSAPlatformHex.tsx — Displays a coding platform in a hexagonal tile.
 *
 * Used in the DSA Stats page (middle row). Shows competitive programming
 * platforms (Codeforces, LeetCode, etc.) with a "View Profile" button.
 *
 * Features:
 * - Platform logo (from Strapi or local fallback)
 * - Platform name, category, and languages
 * - Visit profile button
 * - Hover effects via CSS `group` class
 */
'use client';

import React from 'react';
import { adjustColor } from '@/lib/utils';
import { HEX_SVG_PATH } from '@/lib/constants';

// ─── Constants ───────────────────────────────────────────────────────────────

const STRAPI = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// ─── Props ───────────────────────────────────────────────────────────────────

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
  /** Click handler for the "View Profile" button */
  onVisit: (e: React.MouseEvent) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function DSAPlatformHex({ platform, onVisit }: DSAPlatformHexProps) {
  /** Resolve logo URL — prefer Strapi-hosted, fall back to local public/ */
  const logoUrl = platform.logo?.url 
    ? `${STRAPI}${platform.logo.url}`
    : `/${platform.logoPath}`;

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
      <div className="hex-content pointer-events-auto">
        {/* Platform Logo — gradient rounded square */}
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

        {/* Category (optional) */}
        {platform.category && (
          <div className="text-[11px] text-white/90 font-medium text-center shrink-0 mt-0.5">
            {platform.category}
          </div>
        )}

        {/* Languages (optional) */}
        {platform.languages && (
          <div className="text-[9px] text-white/60 text-center mb-2 shrink-0">
            {platform.languages}
          </div>
        )}
        
        {/* Visit Button */}
        <button 
          className="hex-button mt-2"
          onClick={onVisit}
          aria-label={`Visit ${platform.name} profile`}
        >
          View Profile
        </button>
      </div>
    </div>
  );
}
