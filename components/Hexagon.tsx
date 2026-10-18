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
import { ENTER_EASE, EXIT_EASE, HEX_FADE_DURATION, HEX_SLIDE } from '@/lib/hexTransition';

// ─── Props ───────────────────────────────────────────────────────────────────

interface HexagonProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  /** Intro delay in seconds (enterDelay in lib/hexTransition) */
  delay?: number;
  /** Outro delay in seconds (exitDelay in lib/hexTransition) */
  exitDelay?: number;
  /** Set to false to skip the y-slide entrance (used for off-screen carousel items) */
  animateY?: boolean;
  /** Inline styles — must include position, left, top, width, height */
  style?: React.CSSProperties;
  /** When true, plays the outro (the intro backwards) */
  isExiting?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Hexagon({
  children,
  className = '',
  onClick,
  delay = 0,
  exitDelay = 0,
  animateY = true,
  style,
  isExiting = false
}: HexagonProps) {
  return (
    // Fades via --hex-fade, not opacity, so the glass fades with the outline (see HexShell)
    <motion.div
      initial={{ '--hex-fade': 0, marginTop: animateY ? HEX_SLIDE : 0 }}
      animate={
        isExiting
          ? { '--hex-fade': 0, marginTop: HEX_SLIDE }
          : { '--hex-fade': 1, marginTop: 0 }
      }
      transition={{
        duration: HEX_FADE_DURATION,
        delay: isExiting ? exitDelay : delay,
        ease: isExiting ? EXIT_EASE : ENTER_EASE
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
