import { useRef, useCallback, useEffect } from 'react';
import { useMotionValue, useAnimationFrame, animate } from 'framer-motion';

interface UseCarouselOptions {
  itemCount: number;
  itemSpacing: number;
  setWidth: number;
  autoScrollSpeed?: number;
  onIndexChange?: (index: number) => void;
}

/**
 * useCarousel — manages infinite carousel state and animations.
 * 
 * Handles:
 * - Auto-scrolling with configurable speed
 * - Manual navigation to specific items
 * - Seamless wrapping (infinite loop effect)
 * - Keyboard controls (arrow keys)
 */
export function useCarousel({
  itemCount,
  itemSpacing,
  setWidth,
  autoScrollSpeed = 0.39,
  onIndexChange
}: UseCarouselOptions) {
  const carouselOffset = useMotionValue(0);
  const isNavigatingRef = useRef(false);
  const activeIndexRef = useRef(0);

  // Auto-scroll animation
  useAnimationFrame((_time, delta) => {
    if (isNavigatingRef.current) return;
    const frameSpeed = autoScrollSpeed * (delta / 16); // Normalize to 60fps
    carouselOffset.set(carouselOffset.get() + frameSpeed);
  });

  // Navigate to specific item (centers it in viewport)
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

  // Keyboard navigation
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
    navigateToItem,
    activeIndex: activeIndexRef.current
  };
}
