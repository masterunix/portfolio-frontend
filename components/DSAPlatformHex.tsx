/**
 * DSAPlatformHex.tsx — Displays a coding platform in a hexagonal tile.
 *
 * Pure content component — renders inside a parent <Hexagon> (which provides the shell).
 * Used in the DSA Stats page (middle row).
 *
 * Features:
 * - Platform logo (from Strapi or local fallback)
 * - Platform name, category, and languages
 * - Visit profile button
 * - Hover effects via CSS `group` class (provided by parent shell)
 */
'use client';

import React from 'react';

import { STRAPI_URL } from '@/lib/api';
import type { DSAPlatform } from '@/types';

// ─── Props ───────────────────────────────────────────────────────────────────

interface DSAPlatformHexProps {
  platform: DSAPlatform & {
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
    ? `${STRAPI_URL}${platform.logo.url}`
    : `/${platform.logoPath}`;

  return (
    <div className="hex-content pointer-events-auto">
      {/* Platform Logo — gradient rounded square */}
      <div 
        className="w-[50px] h-[50px] rounded-[12px] flex items-center justify-center shadow-lg shrink-0 mb-1 transition-transform duration-300 group-hover:scale-110"
        style={{ 
          backgroundColor: platform.color,
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
  );
}
