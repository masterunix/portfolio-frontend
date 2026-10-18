/**
 * CarouselHex.tsx — A glass hexagon in the scrolling carousel.
 *
 * Its x position follows the carousel offset, wrapped so the three copies of the
 * grid loop forever. The first copy waves in like the other pages; the others start
 * off screen and appear without animating.
 *
 * The exit wave follows where each hex is on screen when it starts, not its column
 * in the data: by then the carousel has scrolled.
 */
'use client';

import { useMemo, type ReactNode } from 'react';
import { motion, useTransform, type MotionValue } from 'framer-motion';

import HexShell from '@/components/HexShell';
import { useIsExiting } from '@/components/transition';
import { ENTER_EASE, EXIT_EASE, HEX_FADE_DURATION, HEX_SLIDE, enterDelay, exitDelay } from '@/lib/hexTransition';

interface CarouselHexProps {
  /** Left edge before scrolling */
  baseX: number;
  y: number;
  width: number;
  height: number;
  row: number;
  col: number;
  /** Which copy of the grid (0–2) */
  copy: number;
  offset: MotionValue<number>;
  /** Width of all copies together, where positions wrap */
  loopWidth: number;
  spacingX: number;
  children?: ReactNode;
}

export default function CarouselHex({
  baseX, y, width, height, row, col, copy, offset, loopWidth, spacingX, children,
}: CarouselHexProps) {
  const isExiting = useIsExiting();
  const x = useTransform(offset, (o) => ((((baseX - o) % loopWidth) + loopWidth) % loopWidth) - spacingX);

  // Read once when the exit starts: the screen column this hex is in right now. Odd
  // rows sit half a hex to the right; taking that off keeps every row's columns on
  // the same diagonals at any scroll position. Hexes off screen to the left go first.
  const exitDelaySec = useMemo(() => {
    if (!isExiting) return 0;
    const rowOffset = row % 2 === 1 ? spacingX / 2 : 0;
    const screenCol = Math.round((x.get() - rowOffset) / spacingX) + 1;
    return screenCol < 0 ? 0 : exitDelay(row, screenCol);
  }, [isExiting, x, spacingX, row]);

  const first = copy === 0;

  return (
    <motion.div
      className="absolute"
      style={{ left: x, top: y, width, height }}
      initial={{ opacity: 1, '--hex-fade': first ? 0 : 1, marginTop: first ? HEX_SLIDE : 0 }}
      animate={isExiting
        ? { opacity: 0, '--hex-fade': 1, marginTop: HEX_SLIDE }
        : { opacity: 1, '--hex-fade': 1, marginTop: 0 }}
      transition={{
        duration: HEX_FADE_DURATION,
        delay: isExiting ? exitDelaySec : first ? enterDelay(row, col) : 0,
        ease: isExiting ? EXIT_EASE : ENTER_EASE,
      }}
    >
      <HexShell>{children}</HexShell>
    </motion.div>
  );
}
