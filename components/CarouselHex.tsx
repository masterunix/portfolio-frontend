/**
 * CarouselHex.tsx — Positional wrapper for hexagons in the infinite carousel.
 *
 * Handles three animation phases:
 * 1. Entrance: Diagonal wave using framer-motion (col+row stagger)
 * 2. Active:   Smooth horizontal scrolling via useTransform (declarative)
 * 3. Exit:     Diagonal wave fade-out with slide-down
 *
 * The X position is computed declaratively via framer-motion's useTransform,
 * which wraps the offset using modular arithmetic for seamless infinite looping.
 *
 * NO DOM MANIPULATION — uses framer-motion's declarative API throughout.
 */
'use client';

import React from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';

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
  /** Column index (0-based) — used for stagger delay calculation */
  col: number;
  /** Which set this hex belongs to (0, 1, or 2) for carousel duplication */
  setIndex: number;
  /** Framer-motion MotionValue tracking the current scroll offset */
  carouselOffset: MotionValue<number>;
  /** Total width of all columns in one set (for modular wrapping) */
  totalWidth: number;
  /** Horizontal spacing between hex centers */
  hexSpacing: number;
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
  isExiting
}: CarouselHexProps) {
  // Diagonal wave delays — same pattern as DSA Stats page for consistency
  const entranceDelay = (col + row) * 0.05;
  const exitDelay = (col + row) * 0.05;

  /**
   * Transform carousel offset into a wrapped X position.
   * Uses modular arithmetic to create seamless infinite looping:
   * rawX = baseX - offset (moves left as offset increases)
   * wrappedX = rawX mod totalWidth (wraps around when off-screen)
   */
  const x = useTransform(carouselOffset, (offset) => {
    const rawX = baseX - offset;
    let wrappedX = ((rawX % totalWidth) + totalWidth) % totalWidth;
    return wrappedX - hexSpacing;
  });

  return (
    <motion.div
      className="absolute"
      initial={setIndex === 0 ? { opacity: 0, marginTop: 20 } : { opacity: 1, marginTop: 0 }}
      animate={
        isExiting
          ? { opacity: 0, marginTop: 20 }
          : { opacity: 1, marginTop: 0 }
      }
      transition={{
        duration: 0.15,
        delay: isExiting ? exitDelay : (setIndex === 0 ? entranceDelay : 0),
        ease: isExiting ? 'easeIn' : [0.25, 0.46, 0.45, 0.94]
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
