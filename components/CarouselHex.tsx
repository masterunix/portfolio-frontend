'use client';

import React from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';

interface CarouselHexProps {
  children: React.ReactNode;
  baseX: number;
  y: number;
  width: number;
  height: number;
  row: number;
  col: number;
  setIndex: number;
  carouselOffset: MotionValue<number>;
  totalWidth: number;
  hexSpacing: number;
  isExiting: boolean;
}

/**
 * CarouselHex — wrapper that positions a hex in the infinite carousel.
 * 
 * Animation phases:
 * 1. Entrance: Diagonal wave using framer-motion (like DSA Stats)
 * 2. Active: Smooth horizontal scrolling via useTransform
 * 3. Exit: Diagonal wave using framer-motion (like DSA Stats)
 * 
 * NO DOM MANIPULATION - uses framer-motion's declarative API throughout.
 */
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
  // Diagonal wave delays (same as DSA Stats)
  const entranceDelay = (col + row) * 0.05; // Convert to seconds for framer-motion
  const exitDelay = (col + row) * 0.05;

  // Transform carousel offset to wrapped X position (declarative, no DOM manipulation)
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
      <div 
        className="w-full h-full transition-all duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
        style={{ pointerEvents: isExiting ? 'none' : 'auto' }}
      >
        {children}
      </div>
    </motion.div>
  );
}
