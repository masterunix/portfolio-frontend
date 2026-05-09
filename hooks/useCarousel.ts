/**
 * useCarousel.ts — Manages infinite carousel state and animations.
 *
 * Handles:
 * - Auto-scrolling at a configurable speed (normalized to 60fps)
 * - Manual navigation to specific items (centers item in viewport)
 * - Seamless wrapping via modular arithmetic in CarouselHex
 * - Keyboard controls (left/right arrow keys)
 *
 * Uses framer-motion's MotionValue for buttery-smooth, non-re-rendering
 * position updates (the scroll position changes ~60 times/sec but never
 * triggers a React re-render).
 */

import { useRef, useCallback, useEffect } from 'react';
import { useMotionValue, useAnimationFrame, animate } from 'framer-motion';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UseCarouselOptions {
  /** Total number of navigable items (for arrow key wrapping) */
  itemCount: number;
  /** Horizontal spacing between hex centers in pixels */
  itemSpacing: number;
  /** Width of one complete set of columns in pixels */
  setWidth: number;
  /** Pixels per frame at 60fps (default: 0.39) */
  autoScrollSpeed?: number;
  /** Callback fired when the active item changes via keyboard/dot navigation */
  onIndexChange?: (index: number) => void;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useCarousel({
  itemCount,
  itemSpacing,
  setWidth,
  autoScrollSpeed = 0.39,
  onIndexChange
}: UseCarouselOptions) {
  /** MotionValue tracking the cumulative scroll offset (never triggers re-render) */
  const carouselOffset = useMotionValue(0);
  /** Ref flag — true while a manual navigation animation is playing */
  const isNavigatingRef = useRef(false);
  /** Ref tracking which item is currently centered */
  const activeIndexRef = useRef(0);

  /**
   * Auto-scroll animation — runs every frame.
   * Delta-normalized so speed is consistent regardless of monitor refresh rate.
   * Pauses automatically during manual navigation.
   */
  useAnimationFrame((_time, delta) => {
    if (isNavigatingRef.current) return;
    const frameSpeed = autoScrollSpeed * (delta / 16); // Normalize to 60fps baseline
    carouselOffset.set(carouselOffset.get() + frameSpeed);
  });

  /**
   * Navigate to a specific item by index.
   * Calculates the target X offset to center that item in the viewport,
   * then animates smoothly to that position.
   */
  const navigateToItem = useCallback((index: number) => {
    if (typeof window === 'undefined') return;
    
    const targetX = index * itemSpacing + setWidth - window.innerWidth / 2 + itemSpacing / 2;
    isNavigatingRef.current = true;
    activeIndexRef.current = index;
    
    animate(carouselOffset, targetX, {
      duration: 0.6,
      ease: 'easeInOut',
      onComplete: () => {
        isNavigatingRef.current = false;
      }
    });

    onIndexChange?.(index);
  }, [carouselOffset, itemSpacing, setWidth, onIndexChange]);

  /** Keyboard navigation — arrow keys cycle through items */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const newIndex = (activeIndexRef.current - 1 + itemCount) % itemCount;
        navigateToItem(newIndex);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const newIndex = (activeIndexRef.current + 1) % itemCount;
        navigateToItem(newIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [itemCount, navigateToItem]);

  return {
    carouselOffset,
    navigateToItem
  };
}
