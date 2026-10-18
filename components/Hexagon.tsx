/**
 * Hexagon.tsx — A glass hexagon at a fixed spot, with the intro and outro waves.
 *
 * Fades in via --hex-fade, so the glass fades in with the outline, and out via
 * opacity, so the blur drops off at once (see HexShell and lib/hexTransition).
 */
'use client';

import type { CSSProperties, ReactNode } from 'react';
import { motion } from 'framer-motion';

import HexShell from '@/components/HexShell';
import { useIsExiting } from '@/components/transition';
import { ENTER_EASE, EXIT_EASE, HEX_FADE_DURATION, HEX_SLIDE } from '@/lib/hexTransition';

interface HexagonProps {
  /** Seconds before the intro starts */
  delay: number;
  /** Seconds before the outro starts */
  exitDelay: number;
  /** left, top, width, height */
  style: CSSProperties;
  children?: ReactNode;
}

export default function Hexagon({ delay, exitDelay, style, children }: HexagonProps) {
  const isExiting = useIsExiting();

  return (
    <motion.div
      className="absolute"
      style={style}
      initial={{ opacity: 1, '--hex-fade': 0, marginTop: HEX_SLIDE }}
      animate={isExiting
        ? { opacity: 0, '--hex-fade': 1, marginTop: HEX_SLIDE }
        : { opacity: 1, '--hex-fade': 1, marginTop: 0 }}
      transition={{
        duration: HEX_FADE_DURATION,
        delay: isExiting ? exitDelay : delay,
        ease: isExiting ? EXIT_EASE : ENTER_EASE,
      }}
    >
      <HexShell>{children}</HexShell>
    </motion.div>
  );
}
