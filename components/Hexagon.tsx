'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface HexagonProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  /** Entrance animation delay in seconds */
  delay?: number;
  /** Set to false to skip the y-slide entrance (use for off-screen carousel items) */
  animateY?: boolean;
  style?: React.CSSProperties;
  /** Exit animation state */
  isExiting?: boolean;
}

/**
 * Hexagon — a bare liquid-glass hexagonal shell.
 *
 * Renders the SVG glassmorphism shape inside a `position: relative` container.
 * Children are stacked directly inside it — centering is the consumer's job.
 *
 * Dimensions always come from the `style` prop or parent layout.
 * No hardcoded Tailwind size classes — they fight with inline styles.
 *
 * Hover visual feedback via CSS `group` classes so consumers choose
 * their own interaction feel without framer-motion scale conflicts.
 */
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
      initial={{ opacity: 0, y: animateY ? 20 : 0 }}
      animate={
        isExiting
          ? { opacity: 0, y: 20 }
          : { opacity: 1, y: 0 }
      }
      transition={{
        duration: 0.15,
        delay,
        ease: isExiting ? 'easeIn' : [0.25, 0.46, 0.45, 0.94]
      }}
      className="relative"
      style={{
        ...style,
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden'
      }}
    >
      {/* Inner wrapper for hover effects - separates animation from interaction */}
      <div 
        className={`w-full h-full group ${className} ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
        style={{ pointerEvents: isExiting ? 'none' : 'auto' }}
      >
        {/* Liquid glass hexagon outline — fills whatever size the parent provides */}
        <div className="hex-glass-blur group-hover:bg-black/10 group-hover:backdrop-blur-md" />
        <svg
          viewBox="0 0 190 212"
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
        >
          <path
            d="M85.5 3.63965C91.3786 0.245625 98.6214 0.245625 104.5 3.63965L178.896 46.5928C184.775 49.9868 188.396 56.2589 188.396 63.0469V148.953C188.396 155.741 184.775 162.013 178.896 165.407L104.5 208.36C98.805 211.648 91.8296 211.751 86.0547 208.669L85.5 208.36L11.1035 165.407C5.22494 162.013 1.60356 155.741 1.60352 148.953V63.0469C1.60356 56.2589 5.22493 49.9868 11.1035 46.5928L85.5 3.63965Z"
            fill="rgba(255,255,255,0.05)"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
            className="transition-all duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:fill-[rgba(255,255,255,0.1)] group-hover:stroke-[rgba(255,255,255,0.2)]"
          />
        </svg>

        {/* Children slot — consumers own their own layout */}
        {children}
      </div>
    </motion.div>
  );
}
