/**
 * CarouselHex.tsx — Positional wrapper for hexagons in the infinite carousel.
 *
 * Handles three animation phases:
 * 1. Entrance: Diagonal wave using framer-motion (col+row stagger)
 * 2. Active:   Smooth horizontal scrolling via useTransform (declarative)
 * 3. Exit:     The entrance played backwards (lib/hexTransition)
 *
 * The X position is computed declaratively via framer-motion's useTransform,
 * which wraps the offset using modular arithmetic for seamless infinite looping.
 *
 * The exit wave follows where each hex is on screen when the exit starts, not its
 * column in the data: by then the carousel has scrolled, so data columns no longer
 * run left to right across the screen.
 *
 * NO DOM MANIPULATION — uses framer-motion's declarative API throughout.
 */
'use client';

import React, { useMemo } from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';

import {
  ENTER_EASE, EXIT_EASE, HEX_FADE_DURATION, HEX_SLIDE, enterDelay, exitDelay,
} from '@/lib/hexTransition';

// ─── Props ───────────────────────────────────────────────────────────────────

interface CarouselHexProps {
  children: React.ReactNode;
  /** Base X position in pixels (before carousel offset is applied) */
  baseX: number;
  /** Y position in pixels (fixed — rows don't scroll) */
  y: number;
  /** Hexagon width in pixels */
  width: number;
  /** Hexagon height in pixels */
  height: number;
  /** Row index (0-based) — used for stagger delay calculation */
  row: number;
  /** Column index (0-based) — used for the entrance stagger */
  col: number;
  /** Which set this hex belongs to (0, 1, or 2) for carousel duplication */
  setIndex: number;
  /** Framer-motion MotionValue tracking the current scroll offset */
  carouselOffset: MotionValue<number>;
  /** Total width of all columns in one set (for modular wrapping) */
  totalWidth: number;
  /** Horizontal spacing between hex centers */
  hexSpacing: number;
  /** The largest screen row + column (carouselLastStep), so the exit starts there */
  lastStep: number;
  /** When true, plays the exit animation */
  isExiting: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CarouselHex({
  children,
  baseX,
  y,
  width,
  height,
  row,
  col,
  setIndex,
  carouselOffset,
  totalWidth,
  hexSpacing,
  lastStep,
  isExiting
}: CarouselHexProps) {
  /**
   * Transform carousel offset into a wrapped X position.
   * Uses modular arithmetic to create seamless infinite looping:
   * rawX = baseX - offset (moves left as offset increases)
   * wrappedX = rawX mod totalWidth (wraps around when off-screen)
   */
  const x = useTransform(carouselOffset, (offset) => {
    const rawX = baseX - offset;
    const wrappedX = ((rawX % totalWidth) + totalWidth) % totalWidth;
    return wrappedX - hexSpacing;
  });

  // Only set 0 waves in; the other sets start off screen
  const entranceDelay = setIndex === 0 ? enterDelay(row, col) : 0;

  // Read once when the exit starts: the screen column this hex is in right now.
  // Hexes off screen get no delay (exitDelay clamps them to 0).
  const exitDelaySec = useMemo(() => {
    if (!isExiting) return 0;
    const screenCol = Math.round(x.get() / hexSpacing) + 1;
    return screenCol < 0 ? 0 : exitDelay(row, screenCol, lastStep);
  }, [isExiting, x, hexSpacing, row, lastStep]);

  return (
    // Fades via --hex-fade, not opacity, so the glass fades with the outline (see HexShell)
    <motion.div
      className="absolute"
      initial={setIndex === 0 ? { '--hex-fade': 0, marginTop: HEX_SLIDE } : { '--hex-fade': 1, marginTop: 0 }}
      animate={
        isExiting
          ? { '--hex-fade': 0, marginTop: HEX_SLIDE }
          : { '--hex-fade': 1, marginTop: 0 }
      }
      transition={{
        duration: HEX_FADE_DURATION,
        delay: isExiting ? exitDelaySec : entranceDelay,
        ease: isExiting ? EXIT_EASE : ENTER_EASE
      }}
      style={{
        left: x,
        top: y,
        width,
        height
      }}
    >
      {/* Inner wrapper — disables pointer events during exit to prevent stale clicks */}
      <div
        className="w-full h-full transition-all duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
        style={{ pointerEvents: isExiting ? 'none' : 'auto' }}
      >
        {children}
      </div>
    </motion.div>
  );
}
