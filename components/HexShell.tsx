/**
 * HexShell.tsx — Pure visual hexagonal glass shell (no animation).
 *
 * Renders the frosted glass blur layer and SVG outline that create the
 * "liquid glass" hexagonal appearance. Used by:
 * - <Hexagon> (which adds entrance/exit animation on top)
 * - Carousel page call sites (where <CarouselHex> handles animation)
 *
 * Children are rendered inside the shell for content.
 */
'use client';

import React from 'react';
import { HEX_SVG_PATH } from '@/lib/constants';

// ─── Props ───────────────────────────────────────────────────────────────────

interface HexShellProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  /** When true, disables pointer events and hover transitions */
  isExiting?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function HexShell({
  children,
  className = '',
  onClick,
  isExiting = false
}: HexShellProps) {
  return (
    <div
      className={`w-full h-full group ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      style={{ pointerEvents: isExiting ? 'none' : 'auto' }}
    >
      {/* Frosted glass blur layer — clipped to hex shape via CSS clip-path */}
      <div className="hex-glass-blur" />

      {/* Hexagonal SVG outline — renders the visible white stroke border */}
      <svg
        viewBox="0 0 190 212"
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
      >
        <path
          d={HEX_SVG_PATH}
          fill="rgba(255,255,255,0.05)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
          className={isExiting ? '' : 'transition-all duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:fill-[rgba(255,255,255,0.1)] group-hover:stroke-[rgba(255,255,255,0.2)]'}
        />
      </svg>

      {/* Children slot — consumers own their own layout */}
      {children}
    </div>
  );
}
