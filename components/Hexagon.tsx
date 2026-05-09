/**
 * Hexagon.tsx — Base hexagonal glass component.
 *
 * Renders a liquid-glass hexagonal shell consisting of:
 * 1. A backdrop-filter blur layer (`.hex-glass-blur`) clipped to the hex shape
 * 2. An SVG stroke outline for the visible hexagonal border
 * 3. A children slot for consumer content (icons, text, buttons)
 *
 * Dimensions are always provided via the `style` prop or parent layout.
 * No hardcoded Tailwind size classes — they conflict with inline styles.
 *
 * Hover visual feedback uses CSS `group` classes so consumers can
 * choose their own interaction feel without framer-motion scale conflicts.
 *
 * Animation: Uses framer-motion for entrance/exit with a diagonal wave
 * delay pattern (col + row stagger).
 */
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HEX_SVG_PATH } from '@/lib/constants';

// ─── Props ───────────────────────────────────────────────────────────────────

interface HexagonProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  /** Entrance animation delay in seconds (typically col + row * 0.05) */
  delay?: number;
  /** Set to false to skip the y-slide entrance (used for off-screen carousel items) */
  animateY?: boolean;
  /** Inline styles — must include position, left, top, width, height */
  style?: React.CSSProperties;
  /** When true, plays the exit animation (fade + slide down) */
  isExiting?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Hexagon({
  children,
  className = '',
  onClick,
  delay = 0,
  animateY = true,
  style,
  isExiting = false
}: HexagonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, marginTop: animateY ? 20 : 0 }}
      animate={
        isExiting
          ? { opacity: 0, marginTop: 20 }
          : { opacity: 1, marginTop: 0 }
      }
      transition={{
        duration: 0.15,
        delay,
        ease: isExiting ? 'easeIn' : [0.25, 0.46, 0.45, 0.94]
      }}
      className="relative"
      style={style}
    >
      {/* Inner wrapper — applies hover effects and click handling */}
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
            className="transition-all duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:fill-[rgba(255,255,255,0.1)] group-hover:stroke-[rgba(255,255,255,0.2)]"
          />
        </svg>

        {/* Children slot — consumers own their own layout (icons, text, etc.) */}
        {children}
      </div>
    </motion.div>
  );
}
