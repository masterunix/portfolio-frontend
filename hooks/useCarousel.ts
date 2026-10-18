/**
 * useCarousel.ts — The carousel's scroll position: a steady drift, plus going to a
 * tile (buttons, or the ← → keys) by animating it to the middle of the window.
 *
 * The offset is a MotionValue, so scrolling updates the hexes without re-rendering.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { animate, useAnimationFrame, useMotionValue } from 'framer-motion';

/** Drift speed, in px per 60fps frame */
const DRIFT = 0.39;

interface Options {
  /** How many main tiles the buttons and keys cycle through */
  count: number;
  /** Distance between neighbouring hexes, in px */
  spacing: number;
  /** Width of one copy of the grid, in px */
  setWidth: number;
}

export function useCarousel({ count, spacing, setWidth }: Options) {
  const offset = useMotionValue(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const moving = useRef(false);
  const active = useRef(0);

  // Drift, at the same speed on any refresh rate; paused while going to a tile
  useAnimationFrame((_, delta) => {
    if (!moving.current) offset.set(offset.get() + DRIFT * (delta / 16));
  });

  const goTo = useCallback((index: number) => {
    active.current = index;
    setActiveIndex(index);
    moving.current = true;
    // Tile `index` of the middle copy, centred in the window
    const target = index * spacing + setWidth - window.innerWidth / 2 + spacing / 2;
    animate(offset, target, { duration: 0.6, ease: 'easeInOut', onComplete: () => { moving.current = false; } });
  }, [offset, spacing, setWidth]);

  useEffect(() => {
    if (count === 0) return;
    const onKey = (e: KeyboardEvent) => {
      const step = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
      if (!step) return;
      e.preventDefault();
      goTo((active.current + step + count) % count);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [count, goTo]);

  return { offset, activeIndex, goTo };
}
