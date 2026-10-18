/**
 * Hexagon.tsx — Animated hexagonal glass component.
 *
 * Combines:
 * 1. Framer-motion entrance/exit animation (diagonal wave stagger)
 * 2. HexShell — the visual glass blur + SVG outline
 * 3. A children slot for consumer content (icons, text, buttons)
 *
 * Dimensions are always provided via the `style` prop or parent layout.
 * No hardcoded size classes — they conflict with inline styles.
 *
 * For carousel pages where CarouselHex handles animation, use
 * <HexShell> directly instead of this component.
 */
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import HexShell from './HexShell';

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
    // Fades via --hex-fade, not opacity, so the glass fades in with the outline (see HexShell)
    <motion.div
      initial={{ '--hex-fade': 0, marginTop: animateY ? 20 : 0 }}
      animate={
        isExiting
          ? { '--hex-fade': 0, marginTop: 20 }
          : { '--hex-fade': 1, marginTop: 0 }
      }
      transition={{
        duration: 0.15,
        delay,
        ease: isExiting ? 'easeIn' : [0.25, 0.46, 0.45, 0.94]
      }}
      className="relative"
      style={style}
    >
      <HexShell className={className} onClick={onClick} isExiting={isExiting}>
        {children}
      </HexShell>
    </motion.div>
  );
}
