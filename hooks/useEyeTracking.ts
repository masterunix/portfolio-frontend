/**
 * useEyeTracking.ts — Tracks cursor position for the Gleck anime eyes.
 *
 * Calculates a normalized position (-1 to 1) for pupil movement based
 * on cursor distance from the widget center. The max tracking distance
 * is 200px — beyond that, the eyes look "fully" in that direction.
 *
 * @param widgetRef - React ref to the widget container element
 * @returns Object with normalized x and y positions for pupil rendering
 */

import { useState, useEffect, RefObject } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface EyePosition {
  /** Horizontal pupil offset (-1 = far left, 0 = center, 1 = far right) */
  x: number;
  /** Vertical pupil offset (-1 = top, 0 = center, 1 = bottom) */
  y: number;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useEyeTracking(widgetRef: RefObject<HTMLElement | null>): EyePosition {
  const [eyePos, setEyePos] = useState<EyePosition>({ x: 0, y: 0 });

  useEffect(() => {
    let frameId: number | null = null;

    // Throttle to one state update per animation frame — mousemove can fire
    // far more often than 60Hz, and every update re-renders the whole widget
    const handleMouseMove = (e: MouseEvent) => {
      if (frameId !== null) return;

      frameId = requestAnimationFrame(() => {
        frameId = null;
        if (!widgetRef.current) return;

        const rect = widgetRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate delta from widget center
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;

        // Normalize to -1..1 range with 200px max tracking radius
        const maxDistance = 200;
        const normalizedX = Math.max(-1, Math.min(1, deltaX / maxDistance));
        const normalizedY = Math.max(-1, Math.min(1, deltaY / maxDistance));

        setEyePos((prev) =>
          prev.x === normalizedX && prev.y === normalizedY ? prev : { x: normalizedX, y: normalizedY }
        );
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, [widgetRef]);

  return eyePos;
}
